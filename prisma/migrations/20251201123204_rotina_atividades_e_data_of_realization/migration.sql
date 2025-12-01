-- AlterTable
ALTER TABLE "atividades" ADD COLUMN     "rotina_id" TEXT;

-- AlterTable
ALTER TABLE "rotinas" ADD COLUMN     "date_of_realization" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "atividades" ADD CONSTRAINT "atividades_rotina_id_fkey" FOREIGN KEY ("rotina_id") REFERENCES "rotinas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
