"use client";

import { Clock, SkipForward, Trophy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import TimerIndicator from "./TimerIndicator";

export type CurrentActivityProps = {
  activity: {
    id: string;
    title: string;
    imageUrl: string | null;
    estimatedTime: number | null;
    timeInSeconds: number | null;
  };
  currentIndex: number;
  totalCount: number;
  remainingSeconds: number | null;
  onSkip: () => void;
  onComplete: () => void;
};

const renderClocks = (count: number | null | undefined) => {
  if (!Number.isFinite(count) || !count || count <= 0) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {Array.from({ length: count }).map((_, idx) => (
        <Clock key={idx} className="h-6 w-6 text-gray-600" />
      ))}
    </div>
  );
};

const CurrentActivityCard = ({
  activity,
  currentIndex,
  totalCount,
  remainingSeconds,
  onSkip,
  onComplete,
}: CurrentActivityProps) => {
  return (
    <Card className="p-4 space-y-3 border-2 border-emerald-200">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-1">
          <p className="text-xs uppercase text-gray-500">
            Atividade {currentIndex + 1} de {totalCount}
          </p>
          <h2 className="text-xl font-semibold">{activity.title}</h2>
          {renderClocks(activity.estimatedTime)}
        </div>
        <div className="flex justify-center md:justify-end w-full">
          {activity.imageUrl && (
            <img
              src={activity.imageUrl}
              alt={activity.title}
              className="h-72 w-64 rounded-lg object-cover"
            />
          )}
        </div>
      </div>

      {activity.timeInSeconds !== null && (
        <TimerIndicator
          totalSeconds={activity.timeInSeconds}
          remainingSeconds={remainingSeconds}
        />
      )}

      <div className="flex gap-3">
        <Button
          className="bg-amber-500 hover:bg-amber-400 text-white flex-1 text-lg"
          size="lg"
          onClick={onSkip}
        >
          <SkipForward className="mr-2 h-5 w-5" />
          Pular
        </Button>
        <Button
          className="bg-emerald-600 hover:bg-emerald-500 text-white flex-1 text-lg"
          size="lg"
          onClick={onComplete}
        >
          <Trophy className="mr-2 h-5 w-5" />
          Concluir
        </Button>
      </div>
    </Card>
  );
};

export default CurrentActivityCard;
