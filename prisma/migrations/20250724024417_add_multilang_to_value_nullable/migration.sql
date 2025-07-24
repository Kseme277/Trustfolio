/*
  Warnings:

  - You are about to drop the column `name` on the `Value` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Value_name_key";

-- AlterTable
ALTER TABLE "Value" DROP COLUMN "name",
ADD COLUMN     "name_ar" TEXT,
ADD COLUMN     "name_de" TEXT,
ADD COLUMN     "name_en" TEXT,
ADD COLUMN     "name_es" TEXT,
ADD COLUMN     "name_fr" TEXT;
