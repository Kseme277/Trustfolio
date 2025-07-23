-- AlterTable
ALTER TABLE "PersonalizedOrder" ALTER COLUMN "userId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "CartOrder" (
    "id" SERIAL NOT NULL,
    "bookId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "userId" TEXT,
    "guestToken" TEXT,
    "status" TEXT NOT NULL DEFAULT 'IN_CART',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CartOrder_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CartOrder" ADD CONSTRAINT "CartOrder_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartOrder" ADD CONSTRAINT "CartOrder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
