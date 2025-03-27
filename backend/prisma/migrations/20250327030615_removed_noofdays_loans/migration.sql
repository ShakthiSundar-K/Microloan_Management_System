/*
  Warnings:

  - You are about to drop the column `repaymentPeriodDays` on the `Loans` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Loans" DROP COLUMN "repaymentPeriodDays",
ALTER COLUMN "dueDate" DROP NOT NULL;
