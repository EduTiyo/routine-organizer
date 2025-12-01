"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { toast } from "react-toastify";
import { Howl } from "howler";
import CurrentActivityCard from "./components/CurrentActivityCard";
import ActivityList from "./components/ActivityList";
import { secondsToMinutes } from "@/app/utils/seconds-to-minutes";

type Atividade = {
  id: string;
  title: string;
  imageUrl: string;
  estimatedTime: number | null;
  timeInSeconds: number | null;
  dayPeriod: "MORNING" | "AFTERNOON" | "EVENING";
  order: number | null;
};

type Rotina = {
  id: string;
  dateOfRealization: string | null;
  atividades: Atividade[];
};

const StudentPEI = () => {
  const [rotina, setRotina] = useState<Rotina | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimestampRef = useRef<number | null>(null);
  const progressContainerRef = useRef<HTMLDivElement | null>(null);
  const progressBarInstanceRef = useRef<any>(null);

  const hojeISO = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  const successSound = useMemo(
    () =>
      new Howl({
        src: ["/sounds/cheer-up-feedback-sound.mp3"],
        html5: true,
      }),
    []
  );

  const skipSound = useMemo(
    () =>
      new Howl({
        src: ["/sounds/pop-feedback-sound.mp3"],
        html5: true,
      }),
    []
  );

  const playSkipSound = () => skipSound.play();
  const playSuccessSound = () => successSound.play();

  const stopTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
  };

  const startTimerForActivity = (activity: Atividade | null) => {
    stopTimer();
    if (!activity) {
      setRemainingSeconds(null);
      startTimestampRef.current = null;
      return;
    }

    const totalSeconds = activity.timeInSeconds ?? 0;
    setRemainingSeconds(totalSeconds);
    startTimestampRef.current = Date.now();
    if (totalSeconds <= 0) return;

    intervalRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev === null) return prev;
        if (prev <= 1) {
          stopTimer();
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const fetchRotinas = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/rotinas");

      if (!res.ok) {
        throw new Error("Falha ao carregar rotina");
      }

      const data = (await res.json()) as { rotinas: Rotina[] };
      const today = data.rotinas.find((r) => {
        if (!r.dateOfRealization) return false;
        const d = new Date(r.dateOfRealization);
        const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
          2,
          "0"
        )}-${String(d.getDate()).padStart(2, "0")}`;
        return iso === hojeISO;
      });

      const orderedToday =
        today &&
        ({
          ...today,
          atividades: [...today.atividades].sort(
            (a, b) =>
              (a.order ?? Number.MAX_SAFE_INTEGER) -
              (b.order ?? Number.MAX_SAFE_INTEGER)
          ),
        } as Rotina);

      setRotina(orderedToday || null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Falha ao carregar rotina";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [hojeISO]);

  useEffect(() => {
    fetchRotinas();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (progressBarInstanceRef.current?.destroy) {
        progressBarInstanceRef.current.destroy();
        progressBarInstanceRef.current = null;
      }
    };
  }, [fetchRotinas]);

  const currentActivity =
    rotina && rotina.atividades.length > 0
      ? rotina.atividades[currentIndex]
      : null;

  const handleStart = () => {
    if (!rotina || rotina.atividades.length === 0) return;
    setStarted(true);
    startTimerForActivity(currentActivity);
  };

  const handleTimeout = () => {
    recordStatus("TIMEOUT");
    goToNext();
  };

  const goToNext = () => {
    stopTimer();
    setRemainingSeconds(null);
    startTimestampRef.current = null;
    setCurrentIndex((prev) => {
      const next = prev + 1;
      if (!rotina || next >= rotina.atividades.length) {
        toast.info("Rotina finalizada!");
        setStarted(false);
        return prev;
      }
      const nextActivity = rotina.atividades[next];
      startTimerForActivity(nextActivity);
      return next;
    });
  };

  const recordStatus = async (status: string) => {
    if (!currentActivity) return;
    const elapsed =
      startTimestampRef.current !== null && remainingSeconds !== null
        ? (currentActivity.timeInSeconds ?? 0) - remainingSeconds
        : null;
    try {
      await fetch("/api/registros", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          atividadeId: currentActivity.id,
          status,
          timeTakenSeconds: elapsed,
        }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSkip = () => {
    playSkipSound();
    recordStatus("SKIPPED");
    goToNext();
  };

  const handleComplete = () => {
    playSuccessSound();
    recordStatus("COMPLETED");
    goToNext();
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!progressContainerRef.current || !started || !currentActivity) {
        return;
      }
      const ProgressBar = await import("progressbar.js");
      if (cancelled) return;

      if (!progressBarInstanceRef.current) {
        progressBarInstanceRef.current = new ProgressBar.Circle(
          progressContainerRef.current,
          {
            strokeWidth: 6,
            trailWidth: 6,
            trailColor: "#e5e7eb",
            color: "#6d28d9",
            easing: "linear",
            duration: 200,
          }
        );
      }

      const total = currentActivity.timeInSeconds ?? 0;
      const remaining = remainingSeconds ?? total;
      const elapsed = Math.max(0, total - remaining);
      const fraction = total > 0 ? Math.min(1, elapsed / total) : 0;

      progressBarInstanceRef.current.animate(fraction);
    })();

    return () => {
      cancelled = true;
    };
  }, [currentActivity, remainingSeconds, started]);

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (error) {
    return <div style={{ color: "red" }}>Erro: {error}</div>;
  }

  if (!rotina) {
    return (
      <div className="p-6 space-y-4">
        <h1 className="text-2xl font-bold">Minha Rotina</h1>
        <p className="text-sm text-muted-foreground">
          Nenhuma rotina definida para hoje.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Minha Rotina</h1>
        {!started && (
          <Button
            size="lg"
            className="bg-emerald-600 hover:bg-emerald-500 text-lg px-6 py-4 rounded-xl"
            onClick={handleStart}
          >
            Iniciar rotina
          </Button>
        )}
      </div>

      {currentActivity && started && (
        <CurrentActivityCard
          activity={currentActivity}
          currentIndex={currentIndex}
          totalCount={rotina.atividades.length}
          remainingSeconds={remainingSeconds}
          onSkip={handleSkip}
          onComplete={handleComplete}
        />
      )}

      {!started && (
        <ActivityList atividades={rotina.atividades} />
      )}
    </div>
  );
};

export default StudentPEI;
