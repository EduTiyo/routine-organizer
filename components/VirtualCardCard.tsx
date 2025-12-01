import { Card } from "@/components/ui/card";
import { VirtualCard } from "../app/(private)/dashboard/professor/cartoes-virtuais/types/VirtualCardTypes";
import { Clock } from "lucide-react";

interface VirtualCardCardProps {
  card: VirtualCard;
}

const VirtualCardCard = ({ card }: VirtualCardCardProps) => {
  const formatDayPeriod = (period: VirtualCard["dayPeriod"]) => {
    switch (period) {
      case "MORNING":
        return "Manhã";
      case "AFTERNOON":
        return "Tarde";
      case "EVENING":
        return "Noite";
      default:
        return "Período";
    }
  };

  const formatSeconds = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs === 0 ? `${minutes}m` : `${minutes}m ${secs}s`;
  };

  return (
    <Card className="p-5 h-full flex flex-col gap-3">
      <div className="text-xs text-gray-500">
        <p className="uppercase tracking-wide">Criado por</p>
        <p className="text-sm font-semibold text-gray-800">
          {card.creator.name || "Sem nome"}
        </p>
      </div>

      <div>
        <h2 className="text-lg font-bold text-gray-900">{card.title}</h2>
        <p className="text-sm text-muted-foreground">
          Período: {formatDayPeriod(card.dayPeriod)}
        </p>
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

      {card.estimatedTime !== null && card.estimatedTime > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 rounded-md flex items-center gap-1">
            {Array.from({ length: card.estimatedTime }).map((_, index) => (
              <Clock key={index} className="h-5 w-5" />
            ))}
            <span className="sr-only">
              Tempo estimado: {card.estimatedTime} unidades
            </span>
          </span>
        </div>
      )}

      {card.timeInSeconds !== null && card.timeInSeconds > 0 && (
        <p className="text-sm text-muted-foreground">
          Tempo (s): {formatSeconds(card.timeInSeconds)}
        </p>
      )}
    </Card>
  );
};

export default VirtualCardCard;
