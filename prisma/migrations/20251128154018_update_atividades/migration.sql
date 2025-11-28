/*
  Warnings:

  - You are about to drop the column `duration_in_seconds` on the `atividades` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "atividades" DROP COLUMN "duration_in_seconds",
ADD COLUMN     "estimated_time" INTEGER;
