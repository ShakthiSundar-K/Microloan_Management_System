import prisma from "../config/prismaClient";
import dayjs from "dayjs";

export const getMonthlyFinancialData = async (userId: string, month?: string) => {
  return await prisma.$transaction(async (tx) => {
    // If month is provided, use it; otherwise use current month
    let targetDate = month ? dayjs(month) : dayjs();
    
    const startOfMonth = targetDate.startOf("month").toDate();
    const endOfMonth = targetDate.endOf("month").toDate();
    const monthFormatted = targetDate.format("YYYY-MM");
    
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
      where: { userId_month: { userId, month: monthFormatted } },
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
        month: monthFormatted,
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

export const getFinancialSummariesByMonths = async (userId: string, months: string[]) => {
  try {
    // Find all financial summaries for the specified months
    const summaries = await prisma.financialSummary.findMany({
      where: {
        userId: userId,
        month: {
          in: months
        }
      },
      orderBy: {
        month: 'asc'  // Order by month for consistent graph data
      }
    });

    // Check if we're missing any requested months
    const foundMonths = new Set(summaries.map(summary => summary.month));
    const missingMonths = months.filter(month => !foundMonths.has(month));

    // Generate summaries for missing months if needed
    for (const month of missingMonths) {
      // Try to generate the summary for the missing month
      try {
        await getMonthlyFinancialData(userId, month);
        
        // Fetch the newly generated summary
        const newSummary = await prisma.financialSummary.findUnique({
          where: {
            userId_month: {
              userId,
              month
            }
          }
        });
        
        if (newSummary) {
          summaries.push(newSummary);
        }
      } catch (error) {
        console.error(`Failed to generate summary for month ${month}:`, error);
        // Continue with other months even if one fails
      }
    }

    // Sort again after potentially adding new summaries
    return summaries.sort((a, b) => a.month.localeCompare(b.month));
  } catch (error) {
    console.error("Error in getFinancialSummariesByMonths:", error);
    throw error;
  }
};


export const getLatestCapital = async (userId: string) => {
  return await prisma.capitalTracking.findFirst({
    where: { userId },
    orderBy: { date: "desc" },
  });
};