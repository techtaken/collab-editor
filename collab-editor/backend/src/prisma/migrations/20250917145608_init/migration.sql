/*
  Warnings:

  - You are about to drop the column `preferred_language` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "preferred_language",
ADD COLUMN     "hashedPassword" TEXT,
ADD COLUMN     "preferredLanguage" TEXT;
