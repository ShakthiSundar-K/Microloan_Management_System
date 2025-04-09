import prisma from "../config/prismaClient";
import dayjs from "dayjs";

export const getMonthlyFinancialData = async (userId: string) => {
  const now = dayjs(); // current date
  const startOfMonth = now.startOf("month").toDate();
  const endOfMonth = now.endOf("month").toDate();
  const month = now.format("YYYY-MM");
//   console.log("start of month",startOfMonth);
//   console.log("end of month",endOfMonth);
//   console.log(" month",month);

  // 🔹 Loans Issued This Month
  const loansThisMonth = await prisma.loans.findMany({
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
  const newBorrowers = await prisma.borrowers.findMany({
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
  const allUserLoans = await prisma.loans.findMany({
    where: { issuedById: userId },
    select: { status: true, pendingAmount: true },
  });

  const activeLoansCount = allUserLoans.filter(l => l.status === "Active").length;
  const closedLoansCount = allUserLoans.filter(l => l.status === "Closed").length;
  const defaultedLoansCount = allUserLoans.filter(l => l.status === "Defaulted").length;


  // 🔹 Capital Tracking (Latest Snapshot)
  const capitalSnapshot = await prisma.capitalTracking.findFirst({
    where: { userId },
    orderBy: { date: "desc" },
  });

  const pendingLoanAmount = capitalSnapshot?.pendingLoanAmount ?? 0;
  const totalCapital = capitalSnapshot?.totalCapital ?? 0;
  const idleCapital = capitalSnapshot?.idleCapital ?? 0;

  // 🔹 Upsert into FinancialSummary
  const result = await prisma.financialSummary.upsert({
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
  return result;
};
