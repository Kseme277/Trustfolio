/*
  Warnings:

  - You are about to drop the column `customStoryText` on the `PersonalizedOrder` table. All the data in the column will be lost.
  - You are about to drop the column `personalMessage` on the `PersonalizedOrder` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PersonalizedOrder" DROP COLUMN "customStoryText",
DROP COLUMN "personalMessage",
ADD COLUMN     "heroAgeRange" TEXT,
ADD COLUMN     "mainTheme" TEXT,
ADD COLUMN     "messageSpecial" TEXT,
ADD COLUMN     "packType" TEXT,
ADD COLUMN     "residentialArea" TEXT,
ADD COLUMN     "storyLocation" TEXT,
ADD COLUMN     "userFullName" TEXT,
ADD COLUMN     "userPhoneNumber" TEXT;

-- CreateTable
CREATE TABLE "Character" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "relationshipToHero" TEXT NOT NULL,
    "animalType" TEXT,
    "sex" TEXT,
    "age" TEXT,
    "photoUrl" TEXT,
    "personalizedOrderId" INTEGER NOT NULL,

    CONSTRAINT "Character_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_personalizedOrderId_fkey" FOREIGN KEY ("personalizedOrderId") REFERENCES "PersonalizedOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
