-- DropForeignKey
ALTER TABLE "Repayments" DROP CONSTRAINT "Repayments_loanId_fkey";

-- AddForeignKey
ALTER TABLE "Repayments" ADD CONSTRAINT "Repayments_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "Loans"("loanId") ON DELETE CASCADE ON UPDATE CASCADE;
