-- AlterTable
ALTER TABLE "PersonalizedOrder" ADD COLUMN     "guestToken" TEXT,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'STANDARD';
