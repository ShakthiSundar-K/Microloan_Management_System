/*
  Warnings:

  - You are about to drop the `CapitalUtilization` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CapitalUtilization" DROP CONSTRAINT "CapitalUtilization_userId_fkey";

-- DropTable
DROP TABLE "CapitalUtilization";

-- CreateTable
CREATE TABLE "CapitalTracking" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "totalCapital" DECIMAL(12,2) NOT NULL,
    "idleCapital" DECIMAL(12,2) NOT NULL,
    "pendingLoanAmount" DECIMAL(12,2) NOT NULL,
    "amountCollectedToday" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "CapitalTracking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CapitalTracking_date_key" ON "CapitalTracking"("date");

-- AddForeignKey
ALTER TABLE "CapitalTracking" ADD CONSTRAINT "CapitalTracking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
