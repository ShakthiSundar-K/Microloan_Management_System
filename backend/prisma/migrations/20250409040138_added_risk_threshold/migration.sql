/*
  Warnings:

  - Added the required column `riskLevel` to the `RiskAssessment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RiskAssessment" ADD COLUMN     "riskLevel" "RiskLevel" NOT NULL;

-- CreateTable
CREATE TABLE "RiskThreshold" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lowThreshold" INTEGER NOT NULL DEFAULT 70,
    "mediumThreshold" INTEGER NOT NULL DEFAULT 40,

    CONSTRAINT "RiskThreshold_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RiskThreshold_userId_key" ON "RiskThreshold"("userId");

-- AddForeignKey
ALTER TABLE "RiskThreshold" ADD CONSTRAINT "RiskThreshold_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
