/*
  Warnings:

  - You are about to drop the column `email` on the `Borrowers` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Borrowers_email_key";

-- AlterTable
ALTER TABLE "Borrowers" DROP COLUMN "email";
