"use client";

import { useEffect, useState, type RefObject } from "react";

interface AudioPlayerProps {
  src: string;
  audioRef: RefObject<HTMLAudioElement>;
  started: boolean;
}

function formatClock(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function AudioPlayer({ src, audioRef, started }: AudioPlayerProps) {
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [ended, setEnded] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setElapsed(audio.currentTime);
    const onMeta = () => setDuration(audio.duration);
    const onEnded = () => setEnded(true);
    const onError = () => setFailed(true);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
    };
  }, [audioRef]);

  const progress = duration > 0 ? Math.min(100, (elapsed / duration) * 100) : 0;

  return (
    <div className="audio-panel">
      <audio ref={audioRef} src={src} preload="auto" />
      <div className="audio-row">
        <span className="audio-status">
          {failed
            ? "Audio konnte nicht geladen werden"
            : ended
              ? "Hoertext beendet"
              : started
                ? "Hoertext laeuft"
                : "Hoertext bereit"}
        </span>
        <span className="audio-clock">
          {formatClock(elapsed)} / {formatClock(duration)}
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
