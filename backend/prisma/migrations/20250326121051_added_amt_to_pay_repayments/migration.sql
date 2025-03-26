/*
  Warnings:

  - Added the required column `amountToPay` to the `Repayments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Repayments" ADD COLUMN     "amountToPay" DECIMAL(10,2) NOT NULL;
