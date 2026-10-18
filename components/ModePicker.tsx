"use client";

import type { ExamMode } from "@/lib/types";

interface ModePickerProps {
  onChoose: (mode: ExamMode) => void;
}

export default function ModePicker({ onChoose }: ModePickerProps) {
  return (
    <div className="mode-picker">
      <button
        type="button"
        className="mode-card"
        onClick={() => onChoose("practice")}
      >
        <span className="mode-card-title">Übungsmodus</span>
        <span className="mode-card-desc">
          Pausierbar, mit Notizen und Markieren. Für entspanntes Lernen.
        </span>
      </button>
      <button type="button" className="mode-card" onClick={() => onChoose("exam")}>
        <span className="mode-card-title">Prüfungsmodus</span>
        <span className="mode-card-desc">
          Vollbild, kein Pausieren, automatische Abgabe wenn die Zeit abläuft.
          Wie die echte Prüfung.
        </span>
      </button>
    </div>
  );
}
