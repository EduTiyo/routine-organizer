"use client";

import { Card } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Clock, MoonIcon, SunIcon, SunriseIcon } from "lucide-react";
import Image from "next/image";
import { JSX } from "react";

type Activity = {
  id: string;
  title: string;
  imageUrl: string | null;
  estimatedTime: number | null;
  timeInSeconds: number | null;
  dayPeriod: "MORNING" | "AFTERNOON" | "EVENING";
};

const dayPeriodIcons: Record<string, JSX.Element> = {
  MORNING: <SunriseIcon className="h-7 w-7 text-yellow-400" />,
  AFTERNOON: <SunIcon className="h-7 w-7 text-orange-400" />,
  EVENING: <MoonIcon className="h-7 w-7 text-blue-400" />,
};

type ActivityListProps = {
  atividades: Activity[];
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

const ActivityList = ({ atividades }: ActivityListProps) => {
  if (!atividades.length) return null;

  return (
    <div className="space-y-3 px-10">
      <p className="text-sm text-muted-foreground">
        Atividades de hoje (em ordem):
      </p>
      <Carousel className="w-full" opts={{ align: "start" }}>
        <CarouselContent>
          {atividades.map((atividade, idx) => (
            <CarouselItem
              key={atividade.id}
              className="pl-2 basis-full md:basis-1/2 lg:basis-1/3 xl:basis-1/4"
            >
              <Card className="p-3 space-y-2">
                <div className="flex gap-2 items-center">
                  <p className="text-xs text-gray-500">
                    #{idx + 1} — {""}
                  </p>
                  {dayPeriodIcons[atividade.dayPeriod]}
                </div>
                <p className="font-semibold">{atividade.title}</p>
                {atividade.imageUrl && (
                  <div className="relative h-48 w-full rounded-md bg-muted p-2">
                    <Image
                      src={atividade.imageUrl}
                      alt={atividade.title}
                      fill
                      className="object-contain"
                      unoptimized
                      sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
                    />
                  </div>
                )}
                {renderClocks(atividade.estimatedTime)}
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselNext />
        <CarouselPrevious />
      </Carousel>
    </div>
  );
};

export default ActivityList;
