-- AlterTable
ALTER TABLE "users" ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isReady" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT,
    "about" TEXT,
    "gender" TEXT,
    "dateOfBirth" TEXT,
    "martialStatus" TEXT,
    "education" TEXT,
    "jobType" TEXT,
    "jobTitle" TEXT,
    "income" TEXT,
    "height" TEXT,
    "weight" TEXT,
    "complexion" TEXT,
    "mobileNumber" TEXT,
    "currentAddress" JSONB,
    "nativePlace" TEXT,
    "motherTongue" TEXT,
    "fatherName" TEXT,
    "fatherOccupation" TEXT,
    "motherName" TEXT,
    "motherOccupation" TEXT,
    "familyType" TEXT,
    "youngerBrothers" INTEGER,
    "youngerSisters" INTEGER,
    "elderBrothers" INTEGER,
    "elderSisters" INTEGER,
    "youngerBrothersMarried" INTEGER,
    "youngerSistersMarried" INTEGER,
    "elderBrothersMarried" INTEGER,
    "elderSistersMarried" INTEGER,
    "areYouSaved" TEXT,
    "areYouBaptized" TEXT,
    "areYouAnointed" TEXT,
    "churchName" TEXT,
    "denomination" TEXT,
    "pastorName" TEXT,
    "pastorMobileNumber" TEXT,
    "churchAddress" JSONB,
    "exMinAge" INTEGER,
    "exMaxAge" INTEGER,
    "exEducation" TEXT,
    "exJobType" TEXT,
    "exIncome" TEXT,
    "exComplexion" TEXT,
    "exOtherDetails" TEXT,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile_images" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profile_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "field_updates" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fieldName" TEXT NOT NULL,
    "fieldValue" TEXT NOT NULL,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "field_updates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profiles_userId_key" ON "profiles"("userId");

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_images" ADD CONSTRAINT "profile_images_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "field_updates" ADD CONSTRAINT "field_updates_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
