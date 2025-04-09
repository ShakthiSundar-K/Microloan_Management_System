/*
  Warnings:

  - You are about to drop the column `totalAmountCollectedThroughRepayments` on the `FinancialSummary` table. All the data in the column will be lost.
  - You are about to drop the column `totalMissedRepayments` on the `FinancialSummary` table. All the data in the column will be lost.
  - You are about to drop the column `totalRepaymentsCollected` on the `FinancialSummary` table. All the data in the column will be lost.
  - Added the required column `idleCapital` to the `FinancialSummary` table without a default value. This is not possible if the table is not empty.
  - Added the required column `newBorrowersThisMonth` to the `FinancialSummary` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pendingLoanAmount` to the `FinancialSummary` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalCapital` to the `FinancialSummary` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "FinancialSummary_month_idx";

-- AlterTable
ALTER TABLE "FinancialSummary" DROP COLUMN "totalAmountCollectedThroughRepayments",
DROP COLUMN "totalMissedRepayments",
DROP COLUMN "totalRepaymentsCollected",
ADD COLUMN     "idleCapital" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "newBorrowersThisMonth" INTEGER NOT NULL,
ADD COLUMN     "pendingLoanAmount" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "totalCapital" DECIMAL(10,2) NOT NULL,
ALTER COLUMN "month" SET DATA TYPE TEXT;

-- CreateIndex
CREATE INDEX "FinancialSummary_userId_month_idx" ON "FinancialSummary"("userId", "month");
