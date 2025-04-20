-- DropForeignKey
ALTER TABLE "Loans" DROP CONSTRAINT "Loans_borrowerId_fkey";

-- DropForeignKey
ALTER TABLE "RepaymentHistory" DROP CONSTRAINT "RepaymentHistory_borrowerId_fkey";

-- DropForeignKey
ALTER TABLE "Repayments" DROP CONSTRAINT "Repayments_borrowerId_fkey";

-- DropForeignKey
ALTER TABLE "RiskAssessment" DROP CONSTRAINT "RiskAssessment_borrowerId_fkey";

-- AddForeignKey
ALTER TABLE "Loans" ADD CONSTRAINT "Loans_borrowerId_fkey" FOREIGN KEY ("borrowerId") REFERENCES "Borrowers"("borrowerId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Repayments" ADD CONSTRAINT "Repayments_borrowerId_fkey" FOREIGN KEY ("borrowerId") REFERENCES "Borrowers"("borrowerId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiskAssessment" ADD CONSTRAINT "RiskAssessment_borrowerId_fkey" FOREIGN KEY ("borrowerId") REFERENCES "Borrowers"("borrowerId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepaymentHistory" ADD CONSTRAINT "RepaymentHistory_borrowerId_fkey" FOREIGN KEY ("borrowerId") REFERENCES "Borrowers"("borrowerId") ON DELETE CASCADE ON UPDATE CASCADE;
