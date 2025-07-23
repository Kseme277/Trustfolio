-- AlterTable
ALTER TABLE "PersonalizedOrder" ADD COLUMN     "customStoryText" TEXT,
ADD COLUMN     "personalMessage" TEXT,
ADD COLUMN     "readProgress" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "status" SET DEFAULT 'PENDING';
