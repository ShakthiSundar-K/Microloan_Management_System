-- AlterTable
ALTER TABLE "Loans" ALTER COLUMN "pendingAmount" SET DEFAULT 0.00;

-- CreateTable
CREATE TABLE "RepaymentHistory" (
    "id" TEXT NOT NULL,
    "borrowerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amountPaid" DECIMAL(65,30) NOT NULL,
    "paidDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RepaymentHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RepaymentHistory" ADD CONSTRAINT "RepaymentHistory_borrowerId_fkey" FOREIGN KEY ("borrowerId") REFERENCES "Borrowers"("borrowerId") ON DELETE RESTRICT ON UPDATE CASCADE;
