/*
  Warnings:

  - A unique constraint covering the columns `[userId,month]` on the table `FinancialSummary` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "FinancialSummary_userId_month_key" ON "FinancialSummary"("userId", "month");
