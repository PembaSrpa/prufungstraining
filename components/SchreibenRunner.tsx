"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ExamTimer from "./ExamTimer";
import ModePicker from "./ModePicker";
import NotesPanel from "./NotesPanel";
import WritingExporter from "./WritingExporter";
import { saveAttempt } from "@/lib/storage";
import type { ExamMode, Level, SchreibenPart } from "@/lib/types";

interface SchreibenRunnerProps {
  setId: string;
  level: Level;
  examLabel: string;
  timerSeconds: number;
  parts: SchreibenPart[];
}

export default function SchreibenRunner({
  setId,
  level,
  examLabel,
  timerSeconds,
  parts
}: SchreibenRunnerProps) {
  const [mode, setMode] = useState<ExamMode | null>(null);
  const [started, setStarted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [expired, setExpired] = useState(false);
  const [logged, setLogged] = useState(false);
  const shellRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const shell = shellRef.current;
    const header = headerRef.current;
    if (!shell || !header) return;
    const apply = () => shell.style.setProperty("--header-h", `${header.offsetHeight}px`);
    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  const handleChange = useCallback((partNumber: number, value: string) => {
    setAnswers((current) => ({ ...current, [partNumber]: value }));
  }, []);

  const logAttempt = useCallback(() => {
    if (logged) return;
    setLogged(true);
    saveAttempt({ setId, level, skill: "schreiben", examLabel });
  }, [setId, level, examLabel, logged]);

  const handleExpire = useCallback(() => {
    setExpired(true);
    logAttempt();
    if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => undefined);
    }
  }, [logAttempt]);

  const handleStart = useCallback(() => {
    setStarted(true);
    if (mode === "exam" && shellRef.current) {
      shellRef.current.requestFullscreen?.().catch(() => undefined);
    }
  }, [mode]);

  useEffect(() => {
    if (mode !== "exam" || expired) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [mode, expired]);

  const isPractice = mode === "practice";

  return (
    <div className="exam-shell" ref={shellRef}>
      <div className="exam-header" ref={headerRef}>
        <div className="exam-topbar">
          <div className="exam-topbar-title">
            <span className="title-main">
              Schreiben{mode ? ` — ${isPractice ? "Übung" : "Prüfung"}` : ""}
            </span>
            <span className="title-sub">{examLabel}</span>
          </div>
          {mode && (
            <div className="exam-topbar-controls">
              {started && <NotesPanel setId={setId} />}
              {isPractice && started && !expired && (
                <button
                  type="button"
                  className="secondary-button small"
                  onClick={() => setPaused((current) => !current)}
                >
                  {paused ? "Weiter" : "Pause"}
                </button>
              )}
              {started ? (
                <ExamTimer totalSeconds={timerSeconds} paused={paused} onExpire={handleExpire} />
              ) : (
                <span className="exam-timer idle">Bereit</span>
              )}
            </div>
          )}
        </div>
      </div>

      {!mode && (
        <div className="exam-part">
          <ModePicker onChoose={setMode} />
        </div>
      )}

      {mode && !started && (
        <div className="exam-part">
          <div className="start-gate">
            <h2 className="part-label">Bereit zum Start</h2>
            <p className="part-instructions">
              {isPractice
                ? "Sie können jederzeit pausieren."
                : "Vollbild, kein Pausieren, automatische Abgabe wenn die Zeit abläuft."}
            </p>
            <button type="button" className="primary-button" onClick={handleStart}>
              Starten
            </button>
          </div>
        </div>
      )}

      {mode && started && !paused && (
        <>
          {parts.map((part) => (
            <div className="exam-part" key={part.part_number}>
              <h2 className="part-label">Teil {part.part_number}</h2>
              <p className="part-instructions">{part.task_instructions}</p>
              <div className="reading-text">{part.task_prompt}</div>
              <textarea
                className="writing-textarea"
                aria-label={`Teil ${part.part_number}: Ihre Antwort`}
                value={answers[part.part_number] ?? ""}
                onChange={(e) => handleChange(part.part_number, e.target.value)}
                disabled={expired}
                placeholder="Ihre Antwort..."
                rows={8}
              />
            </div>
          ))}

          <div className="exam-footer">
            <WritingExporter parts={parts} answers={answers} onExport={logAttempt} />
          </div>

          {expired && (
            <div className="exam-part">
              <span className="review-flag">
                Die Zeit ist abgelaufen. Sie können Ihre Antwort trotzdem noch kopieren.
              </span>
            </div>
          )}
        </>
      )}

      {paused && (
        <div className="exam-part">
          <div className="start-gate">
            <h2 className="part-label">Pausiert</h2>
            <p className="part-instructions">Der Timer ist angehalten.</p>
            <button type="button" className="primary-button" onClick={() => setPaused(false)}>
              Weiter
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
