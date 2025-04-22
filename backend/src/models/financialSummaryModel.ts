import prisma from "../config/prismaClient";
import dayjs from "dayjs";

export const getMonthlyFinancialData = async (userId: string) => {
  return await prisma.$transaction(async (tx) => {
    const now = dayjs(); // current date
    const startOfMonth = now.startOf("month").toDate();
    const endOfMonth = now.endOf("month").toDate();
    const month = now.format("YYYY-MM");
    //   console.log("start of month",startOfMonth);
    //   console.log("end of month",endOfMonth);
    //   console.log(" month",month);

    // 🔹 Loans Issued This Month
    const loansThisMonth = await tx.loans.findMany({
      where: {
        issuedById: userId,
        issuedAt: { gte: startOfMonth, lte: endOfMonth },
      },
      select: {
        loanId: true,
        borrowerId: true,
        principalAmount: true,
        upfrontDeductedAmount: true,
      },
    });
    //   console.log("Loans this month:", loansThisMonth);

    const totalLoansIssued = loansThisMonth.length;
    const totalPrincipalLent = loansThisMonth.reduce((sum, l) => sum + Number(l.principalAmount), 0);
    const totalUpfrontDeductions = loansThisMonth.reduce((sum, l) => sum + Number(l.upfrontDeductedAmount), 0);
    const newBorrowers = await tx.borrowers.findMany({
      where: {
        createdAt: {
          gte: startOfMonth,
          lt: endOfMonth,
        },
      },
      include: {
        loansTaken: {
          where: {
            issuedAt: {
              gte: startOfMonth,
              lt: endOfMonth,
            },
          },
        },
      },
    });

    const newBorrowersThisMonth = newBorrowers.filter(b => b.loansTaken.length > 0).length;

    // 🔹 Loan Status Counts
    const allUserLoans = await tx.loans.findMany({
      where: { issuedById: userId },
      select: { status: true, pendingAmount: true },
    });

    const activeLoansCount = allUserLoans.filter(l => l.status === "Active").length;
    const closedLoansCount = allUserLoans.filter(l => l.status === "Closed").length;
    const defaultedLoansCount = allUserLoans.filter(l => l.status === "Defaulted").length;

    // 🔹 Capital Tracking (Latest Snapshot)
    const capitalSnapshot = await tx.capitalTracking.findFirst({
      where: { userId },
      orderBy: { date: "desc" },
    });

    const pendingLoanAmount = capitalSnapshot?.pendingLoanAmount ?? 0;
    const totalCapital = capitalSnapshot?.totalCapital ?? 0;
    const idleCapital = capitalSnapshot?.idleCapital ?? 0;

    // 🔹 Upsert into FinancialSummary
    await tx.financialSummary.upsert({
      where: { userId_month: { userId, month } },
      update: {
        totalLoansIssued,
        totalPrincipalLent,
        totalUpfrontDeductions,
        newBorrowersThisMonth,
        activeLoansCount,
        closedLoansCount,
        defaultedLoansCount,
        pendingLoanAmount,
        totalCapital,
        idleCapital,
      },
      create: {
        userId,
        month,
        totalLoansIssued,
        totalPrincipalLent,
        totalUpfrontDeductions,
        newBorrowersThisMonth,
        activeLoansCount,
        closedLoansCount,
        defaultedLoansCount,
        pendingLoanAmount,
        totalCapital,
        idleCapital,
      },
    });
  });
};

export const findMonthlyFinancialSummary = async (userId: string, month: string) => {
  return await prisma.financialSummary.findUnique({
    where: {
      userId_month: {
        userId: userId,
        month: month,
      },
    },
  });
};

export const getDynamicFinancialSummary = async (
  userId: string,
  from?: string,
  to?: string
) => {
  const start = from ? new Date(from) : dayjs().subtract(10, "day").startOf("day").toDate();
  const end = to ? new Date(to) : dayjs().endOf("day").toDate();

  // 1️⃣ Loans Issued
  const loanStats = await prisma.loans.aggregate({
    where: {
      issuedById: userId,
      issuedAt: { gte: start, lte: end },
    },
    _sum: {
      principalAmount: true,
      upfrontDeductedAmount: true,
    },
    _count: {
      loanId: true,
    },
  });

  // 2️⃣ Borrowers registered in time range
  const newBorrowers = await prisma.borrowers.findMany({
  where: {
    createdAt: {
      gte: start,
      lt: end,
    },
  },
  include: {
    loansTaken: {
      where: {
        issuedAt: {
          gte: start,
          lt: end,
        },
      },
    },
  },
});

const newBorrowersThisMonth = newBorrowers.filter(b => b.loansTaken.length > 0).length;


  // 3️⃣ Loan Status counts
  const loanStatusCounts = await prisma.loans.groupBy({
    by: ["status"],
    where: {
      issuedById: userId,
      issuedAt: { gte: start, lte: end },
    },
    _count: { loanId: true },
  });

  const loanStatusMap = {
    Active: 0,
    Closed: 0,
    Defaulted: 0,
  };

  loanStatusCounts.forEach(({ status, _count }) => {
    loanStatusMap[status] = _count.loanId;
  });

  // 4️⃣ Latest Capital Snapshot (as of now)
  const lastCapital = await prisma.capitalTracking.findFirst({
    where: { userId },
    orderBy: { date: "desc" },
  });

  if (!lastCapital) {
    throw new Error("Capital tracking record not found for user");
  }

  return {
    userId,
    month: dayjs(start).format("YYYY-MM"),
    totalLoansIssued: loanStats._count.loanId,
    totalPrincipalLent: loanStats._sum.principalAmount || 0,
    totalUpfrontDeductions: loanStats._sum.upfrontDeductedAmount || 0,
    newBorrowers:newBorrowersThisMonth,

    activeLoansCount: loanStatusMap.Active || 0,
    closedLoansCount: loanStatusMap.Closed || 0,
    defaultedLoansCount: loanStatusMap.Defaulted || 0,

    pendingLoanAmount: lastCapital.pendingLoanAmount,
    idleCapital: lastCapital.idleCapital,
    totalCapital: lastCapital.totalCapital,

    updatedAt: new Date(), // Dynamic result
  };
};


export const getLatestCapital = async (userId: string) => {
  return await prisma.capitalTracking.findFirst({
    where: { userId },
    orderBy: { date: "desc" },
  });
};