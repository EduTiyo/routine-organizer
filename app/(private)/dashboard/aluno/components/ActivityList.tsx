"use client";

import { Card } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Clock } from "lucide-react";
import Image from "next/image";

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
      <p className="text-sm text-muted-foreground">
        Atividades de hoje (em ordem):
      </p>
      <Carousel className="w-full">
        <CarouselContent className="-ml-2">
          {atividades.map((atividade, idx) => (
            <CarouselItem
              key={atividade.id}
              className="pl-2 basis-full md:basis-1/2 lg:basis-1/3 xl:basis-1/4"
            >
              <Card className="p-3 space-y-2">
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
                  <Image
                    src={atividade.imageUrl}
                    alt={atividade.title}
                    className="h-[100%] w-full rounded-md"
                    width={200}
                    height={100}
                    unoptimized
                  />
                )}
                {renderClocks(atividade.estimatedTime)}
                {atividade.timeInSeconds !== null && (
                  <p className="text-sm text-muted-foreground">
                    Tempo: {atividade.timeInSeconds}s
                  </p>
                )}
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};

export default ActivityList;
