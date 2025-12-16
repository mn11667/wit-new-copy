/*
  Warnings:

  - The values [FREE,BASIC,PREMIUM] on the enum `SubscriptionStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `isApproved` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `subscriptionEndDate` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `subscriptionStartDate` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `subscriptionStatus` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum (guarded for environments where the type may already exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE lower(typname) = 'subscriptiontier') THEN
    CREATE TYPE "SubscriptionTier" AS ENUM ('FREE', 'BASIC', 'PREMIUM');
  END IF;
END $$;

-- CreateEnum (guarded for environments where the type may already exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE lower(typname) = 'suggestionstatus') THEN
    CREATE TYPE "SuggestionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
  END IF;
END $$;

-- AlterEnum (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE lower(t.typname) = 'userstatus' AND e.enumlabel = 'REJECTED'
  ) THEN
    ALTER TYPE "UserStatus" ADD VALUE 'REJECTED';
  END IF;
END $$;

-- Remove legacy subscription fields so we can recreate the enum cleanly
ALTER TABLE "User" DROP COLUMN IF EXISTS "isApproved",
DROP COLUMN IF EXISTS "subscriptionEndDate",
DROP COLUMN IF EXISTS "subscriptionStartDate",
DROP COLUMN IF EXISTS "subscriptionStatus";

-- Replace the old SubscriptionStatus enum with the new values
DROP TYPE IF EXISTS "SubscriptionStatus";
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PAST_DUE');

-- CreateTable
CREATE TABLE IF NOT EXISTS "MCQSuggestion" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "optionA" TEXT NOT NULL,
    "optionB" TEXT NOT NULL,
    "optionC" TEXT NOT NULL,
    "optionD" TEXT NOT NULL,
    "correctOption" "MCQOption" NOT NULL,
    "explanation" TEXT,
    "status" "SuggestionStatus" NOT NULL DEFAULT 'PENDING',
    "submittedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),
    "approvedById" TEXT,

    CONSTRAINT "MCQSuggestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "SubscriptionPlan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tier" "SubscriptionTier" NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "durationDays" INTEGER NOT NULL,
    "stripePriceId" TEXT NOT NULL,
    "features" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubscriptionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "SubscriptionStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Payment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "stripePaymentId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "_MCQQuestionToSyllabusSection" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "SubscriptionPlan_stripePriceId_key" ON "SubscriptionPlan"("stripePriceId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Subscription_userId_key" ON "Subscription"("userId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Payment_stripePaymentId_key" ON "Payment"("stripePaymentId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "_MCQQuestionToSyllabusSection_AB_unique" ON "_MCQQuestionToSyllabusSection"("A", "B");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "_MCQQuestionToSyllabusSection_B_index" ON "_MCQQuestionToSyllabusSection"("B");

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'MCQSuggestion_submittedById_fkey') THEN
    ALTER TABLE "MCQSuggestion" ADD CONSTRAINT "MCQSuggestion_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'MCQSuggestion_approvedById_fkey') THEN
    ALTER TABLE "MCQSuggestion" ADD CONSTRAINT "MCQSuggestion_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Subscription_userId_fkey') THEN
    ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Subscription_planId_fkey') THEN
    ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "SubscriptionPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Payment_userId_fkey') THEN
    ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_MCQQuestionToSyllabusSection_A_fkey') THEN
    ALTER TABLE "_MCQQuestionToSyllabusSection" ADD CONSTRAINT "_MCQQuestionToSyllabusSection_A_fkey" FOREIGN KEY ("A") REFERENCES "MCQQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_MCQQuestionToSyllabusSection_B_fkey') THEN
    ALTER TABLE "_MCQQuestionToSyllabusSection" ADD CONSTRAINT "_MCQQuestionToSyllabusSection_B_fkey" FOREIGN KEY ("B") REFERENCES "SyllabusSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
