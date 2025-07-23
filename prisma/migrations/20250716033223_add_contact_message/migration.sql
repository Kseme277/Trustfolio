/*
  Warnings:

  - The primary key for the `_PersonalizedOrderToValue` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[A,B]` on the table `_PersonalizedOrderToValue` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "_PersonalizedOrderToValue" DROP CONSTRAINT "_PersonalizedOrderToValue_AB_pkey";

-- CreateTable
CREATE TABLE "ContactMessage" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "_PersonalizedOrderToValue_AB_unique" ON "_PersonalizedOrderToValue"("A", "B");
