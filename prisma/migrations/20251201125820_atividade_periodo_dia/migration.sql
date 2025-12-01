/*
  Warnings:

  - Added the required column `day_period` to the `atividades` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DayPeriod" AS ENUM ('MORNING', 'AFTERNOON', 'EVENING');

-- AlterTable
ALTER TABLE "atividades" ADD COLUMN     "day_period" "DayPeriod" NOT NULL;
