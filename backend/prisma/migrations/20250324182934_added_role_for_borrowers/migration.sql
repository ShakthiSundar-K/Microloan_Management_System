-- AlterTable
ALTER TABLE "Borrowers" ADD COLUMN     "role" VARCHAR(255) NOT NULL DEFAULT 'BORROWER',
ALTER COLUMN "passwordHash" DROP DEFAULT;
