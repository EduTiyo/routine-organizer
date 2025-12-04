"use client";

import { Card } from "@/components/ui/card";

type NextActivityPreviewProps = {
  activity: {
    title: string;
    imageUrl: string | null;
    dayPeriod: "MORNING" | "AFTERNOON" | "EVENING";
  };
};

const periodLabel = {
  MORNING: "Manhã",
  AFTERNOON: "Tarde",
  EVENING: "Noite",
} as const;

const NextActivityPreview = ({ activity }: NextActivityPreviewProps) => {
  return (
    <Card className="flex w-full flex-col gap-3 rounded-2xl border-2 border-emerald-100 p-4 shadow-sm lg:max-w-xs">
      <div>
        <p className="text-xs font-medium uppercase text-emerald-600 tracking-wide">
          Próxima atividade
        </p>
        <p className="text-sm text-muted-foreground">
          {periodLabel[activity.dayPeriod]}
        </p>
        <h3 className="text-lg font-semibold leading-tight">
          {activity.title}
        </h3>
      </div>

      {activity.imageUrl ? (
        <img
          src={activity.imageUrl}
          alt={activity.title}
          className="h-64 w-full rounded-xl object-cover"
        />
      ) : (
        <div className="flex h-64 w-full items-center justify-center rounded-xl bg-muted text-sm text-muted-foreground">
          Sem imagem disponível
        </div>
      )}
    </Card>
  );
};

export default NextActivityPreview;
