-- CreateTable
CREATE TABLE "Book" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL,
    "coverImage" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Book_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Value" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Value_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonalizedOrder" (
    "id" SERIAL NOT NULL,
    "bookId" INTEGER,
    "customStoryText" TEXT,
    "childName" TEXT NOT NULL,
    "childPhotoUrl" TEXT,
    "personalMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PersonalizedOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PersonalizedOrderToValue" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_PersonalizedOrderToValue_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Book_title_key" ON "Book"("title");

-- CreateIndex
CREATE UNIQUE INDEX "Value_name_key" ON "Value"("name");

-- CreateIndex
CREATE INDEX "_PersonalizedOrderToValue_B_index" ON "_PersonalizedOrderToValue"("B");

-- AddForeignKey
ALTER TABLE "PersonalizedOrder" ADD CONSTRAINT "PersonalizedOrder_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PersonalizedOrderToValue" ADD CONSTRAINT "_PersonalizedOrderToValue_A_fkey" FOREIGN KEY ("A") REFERENCES "PersonalizedOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PersonalizedOrderToValue" ADD CONSTRAINT "_PersonalizedOrderToValue_B_fkey" FOREIGN KEY ("B") REFERENCES "Value"("id") ON DELETE CASCADE ON UPDATE CASCADE;
