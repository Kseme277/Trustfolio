-- AlterTable
ALTER TABLE "PersonalizedOrder" ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "paymentDetails" TEXT,
ADD COLUMN     "paymentMethod" TEXT;
