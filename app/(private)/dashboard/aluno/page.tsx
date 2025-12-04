"use client";

import { JSX, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Trophy,
  Star,
  Sparkles,
  TrophyIcon,
  PlayIcon,
  SunriseIcon,
  SunIcon,
  MoonIcon,
} from "lucide-react";
import { toast } from "react-toastify";
import { Howl } from "howler";
import CurrentActivityCard from "./components/CurrentActivityCard";
import ActivityList from "./components/ActivityList";
import SuccessPage from "./components/SuccessPage";
import RewardOverlay from "./components/RewardOverlay";
import NextActivityPreview from "./components/NextActivityPreview";

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
  status?: string;
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
  const [finished, setFinished] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [trophyQuantity, setTrophyQuantity] = useState(0);

  const hojeISO = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  const renderTrophies = (count: number | null | undefined) => {
    if (!Number.isFinite(count) || !count || count <= 0) return null;
    return (
      <div className="flex flex-wrap gap-1">
        {Array.from({ length: count }).map((_, idx) => (
          <TrophyIcon key={idx} className="h-15 w-15 text-yellow-500" />
        ))}
      </div>
    );
  };

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
      setFinished(orderedToday?.status === "COMPLETED");
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

  const nextActivity =
    rotina && currentIndex + 1 < rotina.atividades.length
      ? rotina.atividades[currentIndex + 1]
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
    if (!rotina) return;

    stopTimer();
    setRemainingSeconds(null);
    startTimestampRef.current = null;

    const nextIndex = currentIndex + 1;
    if (nextIndex >= rotina.atividades.length) {
      toast.info("Rotina finalizada!");
      setStarted(false);
      finishRoutine(rotina.id);
      return;
    }

    const nextActivity = rotina.atividades[nextIndex];
    startTimerForActivity(nextActivity);
    setCurrentIndex(nextIndex);
    setTrophyQuantity((t) => t + 1);
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
    stopTimer();
    playSuccessSound();
    recordStatus("COMPLETED");
    setShowReward(true);

    setTimeout(() => {
      setShowReward(false);
      goToNext();
    }, 3500);
  };

  const finishRoutine = async (rotinaId: string) => {
    setFinished(true);

    try {
      const res = await fetch(`/api/rotinas`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rotinaId: rotinaId,
          status: "COMPLETED",
        }),
      });
      if (!res.ok) throw new Error("Erro ao persistir conclusão");
    } catch (err) {
      toast.error("Erro ao salvar o progresso");
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!progressContainerRef.current || !started || !currentActivity) return;
      if (showReward) return;

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
  }, [currentActivity, remainingSeconds, started, showReward]);

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 font-medium">Erro: {error}</div>;
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
    <div className="p-6 space-y-4 relative min-h-[500px]">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Minha Rotina</h1>
        {!started && !finished && (
          <Button
            size="lg"
            className="bg-emerald-600 hover:bg-emerald-500 text-lg rounded-xl shadow-md transition-all hover:scale-105"
            onClick={handleStart}
          >
            <PlayIcon className="h-10 w-10" />
          </Button>
        )}
      </div>

      {currentActivity && started && !showReward && (
        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="flex-1 space-y-4">
            <CurrentActivityCard
              activity={currentActivity}
              currentIndex={currentIndex}
              totalCount={rotina.atividades.length}
              remainingSeconds={remainingSeconds}
              onSkip={handleSkip}
              onComplete={handleComplete}
            />
            {renderTrophies(trophyQuantity)}
          </div>
          {nextActivity && (
            <div className="lg:w-[320px]">
              <NextActivityPreview activity={nextActivity} />
            </div>
          )}
        </div>
      )}

      {!started && !finished && <ActivityList atividades={rotina.atividades} />}

      {showReward && <RewardOverlay />}

      {finished && <SuccessPage />}
    </div>
  );
};

export default StudentPEI;
