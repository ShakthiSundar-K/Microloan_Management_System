-- CreateEnum
CREATE TYPE "Role" AS ENUM ('Admin', 'Lender');

-- CreateEnum
CREATE TYPE "LoanStatus" AS ENUM ('Active', 'Closed', 'Defaulted');

-- CreateEnum
CREATE TYPE "RepaymentStatus" AS ENUM ('Paid', 'Unpaid', 'Missed');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('Low_Risk', 'Moderate_Risk', 'High_Risk');

-- CreateTable
CREATE TABLE "Users" (
    "userId" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phoneNumber" VARCHAR(15) NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'Lender',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Users_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Borrowers" (
    "borrowerId" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phoneNumber" VARCHAR(15) NOT NULL,
    "address" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Borrowers_pkey" PRIMARY KEY ("borrowerId")
);

-- CreateTable
CREATE TABLE "Loans" (
    "loanId" TEXT NOT NULL,
    "borrowerId" TEXT NOT NULL,
    "issuedById" TEXT NOT NULL,
    "principalAmount" DECIMAL(10,2) NOT NULL,
    "upfrontDeductedAmount" DECIMAL(10,2) NOT NULL,
    "repaymentPeriodDays" INTEGER NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "dailyRepaymentAmount" DECIMAL(10,2) NOT NULL,
    "pendingAmount" DECIMAL(10,2) NOT NULL,
    "daysToRepay" TEXT[],
    "status" "LoanStatus" NOT NULL DEFAULT 'Active',
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),

    CONSTRAINT "Loans_pkey" PRIMARY KEY ("loanId")
);

-- CreateTable
CREATE TABLE "Repayments" (
    "repaymentId" TEXT NOT NULL,
    "loanId" TEXT NOT NULL,
    "borrowerId" TEXT NOT NULL,
    "collectedBy" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paidDate" TIMESTAMP(3) NOT NULL,
    "amountPaid" DECIMAL(10,2) NOT NULL,
    "status" "RepaymentStatus" NOT NULL DEFAULT 'Unpaid',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Repayments_pkey" PRIMARY KEY ("repaymentId")
);

-- CreateTable
CREATE TABLE "RiskAssessment" (
    "assessmentId" TEXT NOT NULL,
    "borrowerId" TEXT NOT NULL,
    "totalLoans" INTEGER NOT NULL,
    "missedPayments" INTEGER NOT NULL,
    "totalDueRepayments" INTEGER NOT NULL,
    "totalPaidRepayments" INTEGER NOT NULL,
    "onTimePayments" INTEGER NOT NULL,
    "repaymentConsistencyScore" DECIMAL(5,2) NOT NULL,
    "riskLevel" "RiskLevel" NOT NULL DEFAULT 'Low_Risk',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RiskAssessment_pkey" PRIMARY KEY ("assessmentId")
);

-- CreateTable
CREATE TABLE "FinancialSummary" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "month" TIMESTAMP(3) NOT NULL,
    "totalLoansIssued" INTEGER NOT NULL,
    "totalPrincipalLent" DECIMAL(10,2) NOT NULL,
    "totalUpfrontDeductions" DECIMAL(10,2) NOT NULL,
    "totalRepaymentsCollected" INTEGER NOT NULL,
    "totalMissedRepayments" INTEGER NOT NULL,
    "totalAmountCollectedThroughRepayments" DECIMAL(10,2) NOT NULL,
    "activeLoansCount" INTEGER NOT NULL,
    "closedLoansCount" INTEGER NOT NULL,
    "defaultedLoansCount" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinancialSummary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CapitalUtilization" (
    "id" TEXT NOT NULL,
    "month" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "totalAvailableCapital" DECIMAL(10,2) NOT NULL,
    "totalLentOut" DECIMAL(10,2) NOT NULL,
    "utilizationEfficiency" DECIMAL(5,2) NOT NULL,
    "idleCapital" DECIMAL(10,2) NOT NULL,
    "idleCapitalAlert" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CapitalUtilization_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Users_phoneNumber_key" ON "Users"("phoneNumber");

-- CreateIndex
CREATE INDEX "Users_name_idx" ON "Users"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Borrowers_email_key" ON "Borrowers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Borrowers_phoneNumber_key" ON "Borrowers"("phoneNumber");

-- CreateIndex
CREATE INDEX "Borrowers_name_idx" ON "Borrowers"("name");

-- CreateIndex
CREATE UNIQUE INDEX "RiskAssessment_borrowerId_key" ON "RiskAssessment"("borrowerId");

-- CreateIndex
CREATE INDEX "RiskAssessment_riskLevel_idx" ON "RiskAssessment"("riskLevel");

-- CreateIndex
CREATE INDEX "FinancialSummary_month_idx" ON "FinancialSummary"("month");

-- AddForeignKey
ALTER TABLE "Loans" ADD CONSTRAINT "Loans_issuedById_fkey" FOREIGN KEY ("issuedById") REFERENCES "Users"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Loans" ADD CONSTRAINT "Loans_borrowerId_fkey" FOREIGN KEY ("borrowerId") REFERENCES "Borrowers"("borrowerId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Repayments" ADD CONSTRAINT "Repayments_collectedBy_fkey" FOREIGN KEY ("collectedBy") REFERENCES "Users"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Repayments" ADD CONSTRAINT "Repayments_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "Loans"("loanId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Repayments" ADD CONSTRAINT "Repayments_borrowerId_fkey" FOREIGN KEY ("borrowerId") REFERENCES "Borrowers"("borrowerId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiskAssessment" ADD CONSTRAINT "RiskAssessment_borrowerId_fkey" FOREIGN KEY ("borrowerId") REFERENCES "Borrowers"("borrowerId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialSummary" ADD CONSTRAINT "FinancialSummary_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CapitalUtilization" ADD CONSTRAINT "CapitalUtilization_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
