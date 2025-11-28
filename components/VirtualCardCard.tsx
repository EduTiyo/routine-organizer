import { Card } from "@/components/ui/card";
import { VirtualCard } from "./VirtualCardTypes";

interface VirtualCardCardProps {
  card: VirtualCard;
}

const VirtualCardCard = ({ card }: VirtualCardCardProps) => {
  return (
    <Card className="p-5 h-full flex flex-col gap-3">
      <div className="flex justify-between items-start text-xs text-gray-500">
        <div>
          <p className="uppercase tracking-wide">Rotina</p>
          <p className="text-sm font-semibold text-gray-800">
            {card.rotina.title}
          </p>
          <p className="text-gray-600">
            Aluno: {card.rotina.student?.name || "Sem nome"}
          </p>
        </div>
        <span className="px-2 py-1 rounded-full bg-gray-100 font-semibold text-gray-700">
          #{card.order}
        </span>
      </div>

      <div>
        <h2 className="text-lg font-bold text-gray-900">{card.title}</h2>
        {card.imageUrl && (
          <div className="mt-3 rounded-lg overflow-hidden border bg-gray-50">
            <img
              src={card.imageUrl}
              alt={card.title}
              className="h-40 w-full object-cover"
            />
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-gray-700">
        {card.estimatedTime !== null && (
          <span className="px-3 py-1 rounded-md bg-gray-100">
            Tempo estimado: {card.estimatedTime} min
          </span>
        )}
        {card.feedbackSoundType && (
          <span className="px-3 py-1 rounded-md bg-gray-100">
            Feedback: {card.feedbackSoundType}
          </span>
        )}
      </div>
    </Card>
  );
};

export default VirtualCardCard;
