-- AlterTable
ALTER TABLE "Repayments" ALTER COLUMN "paidDate" DROP NOT NULL,
ALTER COLUMN "amountPaid" SET DEFAULT 0.00;
