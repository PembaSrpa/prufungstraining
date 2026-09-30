"use client";

import { useEffect, useRef, useState } from "react";

interface ExamTimerProps {
  totalSeconds: number;
  paused: boolean;
  onExpire: () => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function ExamTimer({ totalSeconds, paused, onExpire }: ExamTimerProps) {
  const [remaining, setRemaining] = useState(totalSeconds);
  const expireRef = useRef(onExpire);
  const expiredRef = useRef(false);
  const remainingAtPauseRef = useRef(totalSeconds);
  const resumedAtRef = useRef(Date.now());

  useEffect(() => {
    expireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    if (paused) {
      remainingAtPauseRef.current = remaining;
      return;
    }
    resumedAtRef.current = Date.now();
    const baseline = remainingAtPauseRef.current;
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - resumedAtRef.current) / 1000);
      const left = Math.max(0, baseline - elapsed);
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
  }, [paused]);

  const isLow = remaining <= 60;

  return (
    <span className={`exam-timer${isLow ? " low" : ""}${paused ? " paused" : ""}`} aria-live="off">
      {paused ? "Pausiert" : formatTime(remaining)}
    </span>
  );
}
