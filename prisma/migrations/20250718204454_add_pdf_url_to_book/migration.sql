/*
  Warnings:

  - Added the required column `pdfUrl` to the `Book` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Book" ADD COLUMN     "pdfUrl" TEXT;
