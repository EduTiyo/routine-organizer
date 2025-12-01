-- CreateEnum
CREATE TYPE "RotinaStatus" AS ENUM ('PENDING', 'COMPLETED', 'SKIPPED', 'IN_PROGRESS');

-- AlterTable
ALTER TABLE "rotinas" ADD COLUMN     "status" "RotinaStatus" NOT NULL DEFAULT 'PENDING';
