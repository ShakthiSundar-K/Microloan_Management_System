-- AlterTable
ALTER TABLE "Borrowers" ADD COLUMN     "passwordHash" VARCHAR(255) NOT NULL DEFAULT '123456';
