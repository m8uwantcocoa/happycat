-- CreateEnum
CREATE TYPE "public"."Species" AS ENUM ('ABYSSINIAN', 'AMERICAN_SHORTHAIR', 'AMERICAN_CURL', 'AMERICAN_BOBTAIL', 'BALINESE', 'BENGAL', 'BIRMAN', 'BRITISH_SHORTHAIR', 'BURMESE', 'CHARTREUX', 'CORNISH_REX', 'DEVON_REX', 'EGYPTIAN_MAU', 'HIMALAYAN', 'JAPANESE_BOBTAIL', 'KORAT', 'MAINE_COON', 'MANX', 'NORWEGIAN_FOREST', 'OCICAT', 'ORIENTAL', 'PERSIAN', 'RAGDOLL', 'RUSSIAN_BLUE', 'SAVANNAH', 'SCOTTISH_FOLD', 'SIAMESE', 'SIBERIAN', 'SOMALI', 'SPHYNX');

-- CreateEnum
CREATE TYPE "public"."Sex" AS ENUM ('MALE', 'FEMALE', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "public"."CareType" AS ENUM ('FEED', 'NAILS', 'VACCINE', 'DEWORM', 'FLEA_TICK');

-- CreateTable
CREATE TABLE "public"."Profile" (
    "id" UUID NOT NULL,
    "locale" TEXT,
    "tz" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Pet" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "species" "public"."Species" NOT NULL,
    "breed" TEXT,
    "sex" "public"."Sex" NOT NULL DEFAULT 'UNKNOWN',
    "birthdate" TIMESTAMP(3),
    "weightKg" DECIMAL(5,2),
    "neutered" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CarePlan" (
    "id" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "type" "public"."CareType" NOT NULL,
    "timesPerDay" INTEGER,
    "everyNDays" INTEGER,
    "everyNWeeks" INTEGER,
    "nextDueAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CarePlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CareLog" (
    "id" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "type" "public"."CareType" NOT NULL,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amountG" INTEGER,
    "note" TEXT,

    CONSTRAINT "CareLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Vaccine" (
    "id" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3),
    "doneDate" TIMESTAMP(3),

    CONSTRAINT "Vaccine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MoodLog" (
    "id" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "score" INTEGER NOT NULL,
    "note" TEXT,

    CONSTRAINT "MoodLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UICopy" (
    "userId" UUID NOT NULL,
    "json" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UICopy_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "public"."Nudge" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "reason" TEXT,
    "payload" JSONB NOT NULL,
    "applied" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Nudge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Pet_userId_idx" ON "public"."Pet"("userId");

-- CreateIndex
CREATE INDEX "CarePlan_petId_type_idx" ON "public"."CarePlan"("petId", "type");

-- CreateIndex
CREATE INDEX "CareLog_petId_type_at_idx" ON "public"."CareLog"("petId", "type", "at");

-- CreateIndex
CREATE INDEX "Vaccine_petId_name_idx" ON "public"."Vaccine"("petId", "name");

-- CreateIndex
CREATE INDEX "MoodLog_petId_date_idx" ON "public"."MoodLog"("petId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "MoodLog_petId_date_key" ON "public"."MoodLog"("petId", "date");

-- CreateIndex
CREATE INDEX "Nudge_userId_createdAt_idx" ON "public"."Nudge"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "public"."Pet" ADD CONSTRAINT "Pet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CarePlan" ADD CONSTRAINT "CarePlan_petId_fkey" FOREIGN KEY ("petId") REFERENCES "public"."Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CareLog" ADD CONSTRAINT "CareLog_petId_fkey" FOREIGN KEY ("petId") REFERENCES "public"."Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Vaccine" ADD CONSTRAINT "Vaccine_petId_fkey" FOREIGN KEY ("petId") REFERENCES "public"."Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MoodLog" ADD CONSTRAINT "MoodLog_petId_fkey" FOREIGN KEY ("petId") REFERENCES "public"."Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UICopy" ADD CONSTRAINT "UICopy_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Nudge" ADD CONSTRAINT "Nudge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
