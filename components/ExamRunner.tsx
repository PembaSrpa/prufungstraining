"use client";

import { useCallback, useRef, useState } from "react";
import AudioPlayer from "./AudioPlayer";
import ExamTimer from "./ExamTimer";
import QuestionRenderer from "./QuestionRenderer";
import ScoreSummary from "./ScoreSummary";
import { saveAttempt } from "@/lib/storage";
import type { HoerenLesenPart, Level, Skill } from "@/lib/types";

interface ExamRunnerProps {
  setId: string;
  level: Level;
  skill: Skill;
  examLabel: string;
  skillLabel: string;
  timerSeconds: number;
  parts: HoerenLesenPart[];
  audioUrl?: string;
  audioNote?: string;
}

export default function ExamRunner({
  setId,
  level,
  skill,
  examLabel,
  skillLabel,
  timerSeconds,
  parts,
  audioUrl,
  audioNote
}: ExamRunnerProps) {
  const hasAudio = skill === "hoeren" && Boolean(audioUrl);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [started, setStarted] = useState(!hasAudio);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleStart = useCallback(() => {
    setStarted(true);
    const audio = audioRef.current;
    if (audio) {
      audio.play().catch(() => undefined);
    }
  }, []);

  const handleSelect = useCallback(
    (questionId: string, optionIndex: number) => {
      if (submitted) return;
      setAnswers((current) => ({ ...current, [questionId]: optionIndex }));
    },
    [submitted]
  );

  const handleSubmit = useCallback(() => {
    setSubmitted(true);
    const gradable = parts
      .flatMap((part) => part.questions)
      .filter((q) => q.correct_answer !== null);
    const correctCount = gradable.filter((q) => answers[q.id] === q.correct_answer).length;
    saveAttempt({
      setId,
      level,
      skill,
      examLabel,
      correctCount,
      totalCount: gradable.length
    });
  }, [answers, parts, setId, level, skill, examLabel]);

  if (submitted) {
    return <ScoreSummary parts={parts} answers={answers} level={level} />;
  }

  return (
    <div className="exam-shell">
      <div className="exam-topbar">
        <span className="exam-topbar-title">
          {examLabel} — {skillLabel}
        </span>
        {started ? (
          <ExamTimer totalSeconds={timerSeconds} onExpire={handleSubmit} />
        ) : (
          <span className="exam-timer idle">Bereit</span>
        )}
      </div>

      {hasAudio && audioUrl && (
        <div className="exam-part" style={{ paddingTop: 16 }}>
          <AudioPlayer src={audioUrl} audioRef={audioRef} started={started} />
        </div>
      )}

      {skill === "hoeren" && !hasAudio && audioNote && (
        <div className="exam-part" style={{ paddingTop: 16 }}>
          <span className="review-flag">{audioNote}</span>
        </div>
      )}

      {!started && (
        <div className="exam-part">
          <div className="start-gate">
            <h2 className="part-label">Bereit zum Start</h2>
            <p className="part-instructions">
              Die Tonaufnahme und der Timer starten gemeinsam und koennen wie in
              der echten Pruefung nicht angehalten werden.
            </p>
            <button type="button" className="primary-button" onClick={handleStart}>
              Pruefung starten
            </button>
          </div>
        </div>
      )}

      {started &&
        parts.map((part) => (
          <div className="exam-part" key={part.part_number}>
            <h2 className="part-label">Teil {part.part_number}</h2>
            {part.instructions && (
              <p className="part-instructions">{part.instructions}</p>
            )}
            {part.needs_review && part.review_note && (
              <span className="review-flag">{part.review_note}</span>
            )}
            {part.text && <div className="reading-text">{part.text}</div>}
            {part.questions.map((question) => (
              <QuestionRenderer
                key={question.id}
                question={question}
                selected={answers[question.id]}
                submitted={false}
                onSelect={handleSelect}
              />
            ))}
          </div>
        ))}

      {started && (
        <div className="exam-footer">
          <button type="button" className="primary-button" onClick={handleSubmit}>
            Abgeben
          </button>
        </div>
      )}
    </div>
  );
}
