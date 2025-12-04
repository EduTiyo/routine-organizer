"use client";

import {
  Clock,
  MoonIcon,
  SkipForward,
  SunIcon,
  SunriseIcon,
  Trophy,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import TimerIndicator from "./TimerIndicator";
import confetti from "canvas-confetti";
import { JSX } from "react";

export type CurrentActivityProps = {
  activity: {
    id: string;
    title: string;
    imageUrl: string | null;
    estimatedTime: number | null;
    timeInSeconds: number | null;
    dayPeriod: "MORNING" | "AFTERNOON" | "EVENING";
  };
  currentIndex: number;
  totalCount: number;
  remainingSeconds: number | null;
  onSkip: () => void;
  onComplete: () => void;
};

const dayPeriodIcons: Record<string, JSX.Element> = {
  MORNING: <SunriseIcon className="h-7 w-7 text-yellow-400" />,
  AFTERNOON: <SunIcon className="h-7 w-7 text-orange-400" />,
  EVENING: <MoonIcon className="h-7 w-7 text-blue-400" />,
};

const renderClocks = (count: number | null | undefined) => {
  if (!Number.isFinite(count) || !count || count <= 0) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {Array.from({ length: count }).map((_, idx) => (
        <Clock key={idx} className="h-7 w-7 text-gray-600" />
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
  const handleComplete = () => {
    const count = 400;
    const defaults = {
      origin: { y: 0.6 },
      zIndex: 9999,
      colors: [
        "#26ccff",
        "#a25afd",
        "#ff5e7e",
        "#88ff5a",
        "#fcff42",
        "#ffa62d",
        "#ff36ff",
      ],
    };

    const fire = (particleRatio: number, opts: confetti.Options) => {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    };

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });

    fire(0.2, {
      spread: 60,
    });

    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });

    onComplete();
  };

  return (
    <Card className="p-4 space-y-3 border-2 border-emerald-200">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-xs uppercase text-gray-500">
            Atividade {currentIndex + 1} de {totalCount}
          </p>
          <div className="flex space-x-4 items-center mt-1 mb-2">
            <h2 className="text-xl font-semibold">{activity.title}</h2>
            {dayPeriodIcons[activity.dayPeriod]}
          </div>
          {renderClocks(activity.estimatedTime)}
        </div>
      </div>
      <div className="flex justify-center items-center w-full">
        {activity.imageUrl && (
          <img
            src={activity.imageUrl}
            alt={activity.title}
            className="h-72 w-64 rounded-lg object-cover"
          />
        )}
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
        </Button>
        <Button
          className="bg-emerald-600 hover:bg-emerald-500 text-white flex-1 text-lg"
          size="lg"
          onClick={handleComplete}
        >
          <Trophy className="mr-2 h-5 w-5" />
        </Button>
      </div>
    </Card>
  );
};

export default CurrentActivityCard;
