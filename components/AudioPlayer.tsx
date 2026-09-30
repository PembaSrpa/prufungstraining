"use client";

import { useEffect, useState, type RefObject } from "react";

interface AudioPlayerProps {
  src: string;
  audioRef: RefObject<HTMLAudioElement>;
  started: boolean;
  paused: boolean;
}

function formatClock(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function AudioPlayer({ src, audioRef, started, paused }: AudioPlayerProps) {
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState<number | null>(null);
  const [ended, setEnded] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateDuration = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
    };

    const onTime = () => setElapsed(audio.currentTime);
    const onEnded = () => setEnded(true);
    const onError = () => setFailed(true);

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("durationchange", updateDuration);
    audio.addEventListener("canplay", updateDuration);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);

    updateDuration();

    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("durationchange", updateDuration);
      audio.removeEventListener("canplay", updateDuration);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
    };
  }, [audioRef, src]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !started) return;
    if (paused) audio.pause();
    else audio.play().catch(() => undefined);
  }, [paused, started, audioRef]);

  const knownDuration = duration !== null;
  const progress = knownDuration && duration! > 0 ? Math.min(100, (elapsed / duration!) * 100) : 0;

  return (
    <div className="audio-panel">
      <audio ref={audioRef} src={src} preload="auto" />
      <div className="audio-row">
        <span className="audio-status">
          {failed
            ? "Audio konnte nicht geladen werden"
            : ended
              ? "Hoertext beendet"
              : paused
                ? "Audio pausiert"
                : started
                  ? "Hoertext laeuft"
                  : "Hoertext bereit"}
        </span>
        <span className="audio-clock">
          {formatClock(elapsed)}
          {knownDuration ? ` / ${formatClock(duration!)}` : ""}
        </span>
      </div>
      <div className="audio-track" aria-hidden="true">
        <div className="audio-fill" style={{ width: `${progress}%` }} />
      </div>
      {failed && (
        <a className="audio-fallback" href={src} target="_blank" rel="noreferrer">
          Audio direkt oeffnen
        </a>
      )}
    </div>
  );
}
