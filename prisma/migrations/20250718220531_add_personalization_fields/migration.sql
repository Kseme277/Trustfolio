-- AlterTable
ALTER TABLE "PersonalizedOrder" ADD COLUMN     "calculatedPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "originalBookPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "personalizationData" JSONB,
ADD COLUMN     "uploadedImages" TEXT[];
