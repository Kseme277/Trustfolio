-- AlterTable
ALTER TABLE "CartOrder" ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "paymentDetails" TEXT,
ADD COLUMN     "paymentMethod" TEXT;
