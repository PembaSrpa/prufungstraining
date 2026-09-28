"use client";

import { useEffect, useRef, useState } from "react";

interface ExamTimerProps {
  totalSeconds: number;
  onExpire: () => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function ExamTimer({ totalSeconds, onExpire }: ExamTimerProps) {
  const [remaining, setRemaining] = useState(totalSeconds);
  const expireRef = useRef(onExpire);
  const expiredRef = useRef(false);

  useEffect(() => {
    expireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    const startedAt = Date.now();
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      const left = Math.max(0, totalSeconds - elapsed);
      setRemaining(left);
      if (left === 0) {
        clearInterval(interval);
        if (!expiredRef.current) {
          expiredRef.current = true;
          expireRef.current();
        }
      }
    }, 250);
    return () => clearInterval(interval);
  }, [totalSeconds]);

  const isLow = remaining <= 60;

  return (
    <span className={`exam-timer${isLow ? " low" : ""}`} aria-live="off">
      {formatTime(remaining)}
    </span>
  );
}
