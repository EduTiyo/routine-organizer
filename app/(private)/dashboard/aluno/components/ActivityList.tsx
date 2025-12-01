"use client";

import { Card } from "@/components/ui/card";
import { Clock } from "lucide-react";

type Activity = {
  id: string;
  title: string;
  imageUrl: string | null;
  estimatedTime: number | null;
  timeInSeconds: number | null;
  dayPeriod: "MORNING" | "AFTERNOON" | "EVENING";
};

type ActivityListProps = {
  atividades: Activity[];
};

const renderClocks = (count: number | null | undefined) => {
  if (!Number.isFinite(count) || !count || count <= 0) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {Array.from({ length: count }).map((_, idx) => (
        <Clock key={idx} className="h-4 w-4 text-gray-600" />
      ))}
    </div>
  );
};

const ActivityList = ({ atividades }: ActivityListProps) => {
  if (!atividades.length) return null;

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Atividades de hoje (em ordem):</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {atividades.map((atividade, idx) => (
          <Card key={atividade.id} className="p-3 space-y-2">
            <p className="text-xs text-gray-500">
              #{idx + 1} —{" "}
              {atividade.dayPeriod === "MORNING"
                ? "Manhã"
                : atividade.dayPeriod === "AFTERNOON"
                ? "Tarde"
                : "Noite"}
            </p>
            <p className="font-semibold">{atividade.title}</p>
            {atividade.imageUrl && (
              <img
                src={atividade.imageUrl}
                alt={atividade.title}
                className="h-36 w-full object-cover rounded-md"
              />
            )}
            {renderClocks(atividade.estimatedTime)}
            {atividade.timeInSeconds !== null && (
              <p className="text-sm text-muted-foreground">
                Tempo: {atividade.timeInSeconds}s
              </p>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ActivityList;
