/*
  Warnings:

  - The primary key for the `RiskAssessment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `assessmentId` on the `RiskAssessment` table. All the data in the column will be lost.
  - You are about to drop the column `missedPayments` on the `RiskAssessment` table. All the data in the column will be lost.
  - You are about to drop the column `repaymentConsistencyScore` on the `RiskAssessment` table. All the data in the column will be lost.
  - You are about to drop the column `riskLevel` on the `RiskAssessment` table. All the data in the column will be lost.
  - You are about to drop the column `totalDueRepayments` on the `RiskAssessment` table. All the data in the column will be lost.
  - You are about to drop the column `totalLoans` on the `RiskAssessment` table. All the data in the column will be lost.
  - You are about to drop the column `totalPaidRepayments` on the `RiskAssessment` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `RiskAssessment` table. All the data in the column will be lost.
  - Added the required column `averageDelayInDays` to the `RiskAssessment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `completedLoans` to the `RiskAssessment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `defaultedLoans` to the `RiskAssessment` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `RiskAssessment` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `latePayments` to the `RiskAssessment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `missedRepayments` to the `RiskAssessment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `repaymentRate` to the `RiskAssessment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `riskScore` to the `RiskAssessment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalLoansTaken` to the `RiskAssessment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalRepayments` to the `RiskAssessment` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "RiskAssessment_riskLevel_idx";

-- AlterTable
ALTER TABLE "RiskAssessment" DROP CONSTRAINT "RiskAssessment_pkey",
DROP COLUMN "assessmentId",
DROP COLUMN "missedPayments",
DROP COLUMN "repaymentConsistencyScore",
DROP COLUMN "riskLevel",
DROP COLUMN "totalDueRepayments",
DROP COLUMN "totalLoans",
DROP COLUMN "totalPaidRepayments",
DROP COLUMN "updatedAt",
ADD COLUMN     "averageDelayInDays" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "completedLoans" INTEGER NOT NULL,
ADD COLUMN     "defaultedLoans" INTEGER NOT NULL,
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "lastEvaluatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "latePayments" INTEGER NOT NULL,
ADD COLUMN     "missedRepayments" INTEGER NOT NULL,
ADD COLUMN     "repaymentRate" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "riskScore" INTEGER NOT NULL,
ADD COLUMN     "totalLoansTaken" INTEGER NOT NULL,
ADD COLUMN     "totalRepayments" INTEGER NOT NULL,
ADD CONSTRAINT "RiskAssessment_pkey" PRIMARY KEY ("id");
