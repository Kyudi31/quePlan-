-- CreateEnum
CREATE TYPE "TransportType" AS ENUM ('WALKING', 'PUBLIC', 'CAR', 'BICYCLE', 'MIXED');

-- CreateEnum
CREATE TYPE "PlanStatus" AS ENUM ('DRAFT', 'FUTURE', 'PAST');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "numberOfPeople" INTEGER NOT NULL,
    "budget" DECIMAL(10,2) NOT NULL,
    "transport" "TransportType" NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "status" "PlanStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subplan" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "placeName" TEXT NOT NULL,
    "placeId" TEXT,
    "order" INTEGER NOT NULL,
    "notes" TEXT,

    CONSTRAINT "Subplan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Subplan" ADD CONSTRAINT "Subplan_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
