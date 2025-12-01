"use client";

import { useEffect, useRef } from "react";

type TimerIndicatorProps = {
  totalSeconds: number | null;
  remainingSeconds: number | null;
  label?: string;
};

const TimerIndicator = ({
  totalSeconds,
  remainingSeconds,
  label = "Tempo rolando...",
}: TimerIndicatorProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const barRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!containerRef.current || totalSeconds === null) return;

      const ProgressBar = await import("progressbar.js");
      if (cancelled) return;

      if (!barRef.current) {
        barRef.current = new ProgressBar.Circle(containerRef.current, {
          strokeWidth: 6,
          trailWidth: 6,
          trailColor: "#e5e7eb",
          color: "#111827",
          easing: "linear",
          duration: 150,
        });
      }

      const total = totalSeconds ?? 0;
      const remaining = remainingSeconds ?? total;
      const elapsed = Math.max(0, total - remaining);
      const fraction = total > 0 ? Math.min(1, elapsed / total) : 0;

      barRef.current.animate(fraction);
    })();

    return () => {
      cancelled = true;
    };
  }, [remainingSeconds, totalSeconds]);

  useEffect(() => {
    return () => {
      if (barRef.current?.destroy) {
        barRef.current.destroy();
        barRef.current = null;
      }
    };
  }, []);

  return (
    <div className="flex items-center gap-4">
      <div ref={containerRef} className="h-20 w-20 drop-shadow-sm" />
      <div className="text-sm text-gray-700 font-medium">{label}</div>
    </div>
  );
};

export default TimerIndicator;
