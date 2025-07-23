-- AlterTable
ALTER TABLE "_PersonalizedOrderToValue" ADD CONSTRAINT "_PersonalizedOrderToValue_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_PersonalizedOrderToValue_AB_unique";
