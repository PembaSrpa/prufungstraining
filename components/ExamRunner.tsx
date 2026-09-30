"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import AudioPlayer from "./AudioPlayer";
import ExamTimer from "./ExamTimer";
import HighlightableText from "./HighlightableText";
import ModePicker from "./ModePicker";
import NotesPanel from "./NotesPanel";
import QuestionRenderer from "./QuestionRenderer";
import ScoreSummary from "./ScoreSummary";
import { addVocabWords, saveAttempt } from "@/lib/storage";
import type { ExamMode, HoerenLesenPart, Level, Question, Skill } from "@/lib/types";

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

function filterPartsToQuestions(
  parts: HoerenLesenPart[],
  questionIds: Set<string>
): HoerenLesenPart[] {
  return parts
    .map((part) => ({
      ...part,
      questions: part.questions.filter((q) => questionIds.has(q.id))
    }))
    .filter((part) => part.questions.length > 0);
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
  const [mode, setMode] = useState<ExamMode | null>(null);
  const hasAudio = skill === "hoeren" && Boolean(audioUrl);
  const [activeParts, setActiveParts] = useState<HoerenLesenPart[]>(parts);
  const [isRetryRound, setIsRetryRound] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [started, setStarted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [fullscreenLost, setFullscreenLost] = useState(false);
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);

  const flatQuestions: Question[] = activeParts.flatMap((part) => part.questions);

  const handleChooseMode = useCallback(
    (chosen: ExamMode) => {
      setMode(chosen);
      if (chosen === "practice" && !hasAudio) {
        setStarted(true);
      }
    },
    [hasAudio]
  );

  const handleStart = useCallback(() => {
    setStarted(true);
    if (mode === "exam" && shellRef.current) {
      shellRef.current.requestFullscreen?.().catch(() => undefined);
    }
  }, [mode]);

  useEffect(() => {
    if (mode !== "exam") return;
    const onFsChange = () => {
      if (started && !submitted && !document.fullscreenElement) {
        setFullscreenLost(true);
      } else {
        setFullscreenLost(false);
      }
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, [mode, started, submitted]);

  useEffect(() => {
    if (mode !== "exam" || submitted) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [mode, submitted]);

  const handleSelect = useCallback(
    (questionId: string, optionIndex: number) => {
      if (submitted) return;
      setAnswers((current) => ({ ...current, [questionId]: optionIndex }));
    },
    [submitted]
  );

  const handleSubmit = useCallback(() => {
    setSubmitted(true);
    if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => undefined);
    }
    if (isRetryRound) return;
    const gradable = activeParts
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
  }, [answers, activeParts, setId, level, skill, examLabel, isRetryRound]);

  const handleRetryWrong = useCallback(
    (wrongIds: string[]) => {
      const filtered = filterPartsToQuestions(activeParts, new Set(wrongIds));
      setActiveParts(filtered);
      setAnswers({});
      setActiveQuestionId(null);
      setIsRetryRound(true);
      setSubmitted(false);
    },
    [activeParts]
  );

  const handleAddToVocab = useCallback(
    (words: string[]) => {
      addVocabWords(words, { setId, examLabel, level });
    },
    [setId, examLabel, level]
  );

  useEffect(() => {
    if (!started || paused || submitted || mode === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "TEXTAREA" || tag === "INPUT") return;

      if (/^[1-9]$/.test(e.key) && activeQuestionId) {
        const question = flatQuestions.find((q) => q.id === activeQuestionId);
        const optionIndex = Number(e.key) - 1;
        if (question && optionIndex < question.options.length) {
          handleSelect(question.id, optionIndex);
        }
        return;
      }

      if (e.key === "ArrowDown" || e.key === "Enter") {
        e.preventDefault();
        const currentIndex = flatQuestions.findIndex((q) => q.id === activeQuestionId);
        const next = flatQuestions[currentIndex + 1];
        if (next) setActiveQuestionId(next.id);
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        const currentIndex = flatQuestions.findIndex((q) => q.id === activeQuestionId);
        const prev = flatQuestions[currentIndex - 1];
        if (prev) setActiveQuestionId(prev.id);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [started, paused, submitted, mode, activeQuestionId, flatQuestions, handleSelect]);

  if (submitted) {
    return (
      <ScoreSummary
        parts={activeParts}
        answers={answers}
        level={level}
        onRetryWrong={handleRetryWrong}
      />
    );
  }

  if (!mode) {
    return (
      <div className="exam-shell">
        <div className="exam-topbar">
          <span className="exam-topbar-title">
            {examLabel} — {skillLabel}
          </span>
        </div>
        <div className="exam-part">
          <ModePicker onChoose={handleChooseMode} />
        </div>
      </div>
    );
  }

  const isPractice = mode === "practice";

  return (
    <div className="exam-shell" ref={shellRef}>
      <div className="exam-topbar">
        <span className="exam-topbar-title">
          {examLabel} — {skillLabel} — {isPractice ? "Uebung" : "Pruefung"}
          {isRetryRound ? " — Wiederholung" : ""}
        </span>
        <div className="exam-topbar-controls">
          {isPractice && started && (
            <button
              type="button"
              className="secondary-button small"
              onClick={() => setPaused((current) => !current)}
            >
              {paused ? "Weiter" : "Pause"}
            </button>
          )}
          {started ? (
            <ExamTimer totalSeconds={timerSeconds} paused={paused} onExpire={handleSubmit} />
          ) : (
            <span className="exam-timer idle">Bereit</span>
          )}
        </div>
      </div>

      {mode === "exam" && fullscreenLost && (
        <div className="exam-part">
          <span className="review-flag">
            Vollbild wurde verlassen. Die Zeit laeuft weiter.
          </span>
        </div>
      )}

      {hasAudio && audioUrl && !isRetryRound && (
        <div className="exam-part" style={{ paddingTop: 16 }}>
          <AudioPlayer src={audioUrl} audioRef={audioRef} started={started} paused={paused} />
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
              {isPractice
                ? "Sie koennen jederzeit pausieren. Zahlen 1-9 waehlen eine Antwort, Pfeiltasten wechseln die Frage."
                : "Vollbild, kein Pausieren, automatische Abgabe wenn die Zeit ablaeuft."}
            </p>
            <button type="button" className="primary-button" onClick={handleStart}>
              Starten
            </button>
          </div>
        </div>
      )}

      <AnimatePresence>
        {started && !paused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {!isRetryRound && (
              <div className="exam-part">
                <NotesPanel setId={setId} />
              </div>
            )}

            {activeParts.map((part) => (
              <div className="exam-part" key={part.part_number}>
                <div className="part-grid">
                  <div className="part-left">
                    <h2 className="part-label">Teil {part.part_number}</h2>
                    {part.instructions && (
                      <p className="part-instructions">{part.instructions}</p>
                    )}
                    {part.needs_review && part.review_note && (
                      <span className="review-flag">{part.review_note}</span>
                    )}
                    {part.text && (
                      <HighlightableText
                        text={part.text}
                        enabled
                        onAddToVocab={handleAddToVocab}
                      />
                    )}
                  </div>
                  <div className="part-right">
                    {part.questions.map((question) => (
                      <motion.div
                        key={question.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        <QuestionRenderer
                          question={question}
                          selected={answers[question.id]}
                          submitted={false}
                          active={activeQuestionId === question.id}
                          onSelect={handleSelect}
                          onActivate={setActiveQuestionId}
                        />
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            <div className="exam-footer">
              <button type="button" className="primary-button" onClick={handleSubmit}>
                Abgeben
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {paused && (
        <div className="exam-part">
          <div className="start-gate">
            <h2 className="part-label">Pausiert</h2>
            <p className="part-instructions">Timer und Audio sind angehalten.</p>
            <button type="button" className="primary-button" onClick={() => setPaused(false)}>
              Weiter
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
