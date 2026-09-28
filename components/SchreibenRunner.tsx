"use client";

import { useCallback, useState } from "react";
import ExamTimer from "./ExamTimer";
import WritingExporter from "./WritingExporter";
import { saveAttempt } from "@/lib/storage";
import type { Level, SchreibenPart } from "@/lib/types";

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
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [expired, setExpired] = useState(false);
  const [logged, setLogged] = useState(false);

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
  }, [logAttempt]);

  return (
    <div className="exam-shell">
      <div className="exam-topbar">
        <span className="exam-topbar-title">{examLabel} — Schreiben</span>
        <ExamTimer totalSeconds={timerSeconds} onExpire={handleExpire} />
      </div>

      {parts.map((part) => (
        <div className="exam-part" key={part.part_number}>
          <h2 className="part-label">Teil {part.part_number}</h2>
          <p className="part-instructions">{part.task_instructions}</p>
          <div className="reading-text">{part.task_prompt}</div>
          <textarea
            className="writing-textarea"
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
            Die Zeit ist abgelaufen. Sie koennen Ihre Antwort trotzdem noch kopieren.
          </span>
        </div>
      )}
    </div>
  );
}
