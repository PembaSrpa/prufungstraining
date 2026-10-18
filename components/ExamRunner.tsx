"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import AudioPlayer from "./AudioPlayer";
import ExamTimer from "./ExamTimer";
import HighlightableText from "./HighlightableText";
import ModePicker from "./ModePicker";
import NotesPanel from "./NotesPanel";
import QuestionRenderer from "./QuestionRenderer";
import ScoreSummary from "./ScoreSummary";
import TranscriptPanel from "./TranscriptPanel";
import { isGradable, isTextQuestion, isCorrect, type Answer } from "@/lib/grading";
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
  transcripts?: string[];
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
  audioNote,
  transcripts
}: ExamRunnerProps) {
  const [mode, setMode] = useState<ExamMode | null>(null);
  const hasAudio = skill === "hoeren" && Boolean(audioUrl);
  const [activeParts, setActiveParts] = useState<HoerenLesenPart[]>(parts);
  const [isRetryRound, setIsRetryRound] = useState(false);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [submitted, setSubmitted] = useState(false);
  const [started, setStarted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [fullscreenLost, setFullscreenLost] = useState(false);
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  const flatQuestions: Question[] = activeParts.flatMap((part) => part.questions);

  useEffect(() => {
    const shell = shellRef.current;
    const header = headerRef.current;
    if (!shell || !header) return;
    const apply = () => shell.style.setProperty("--header-h", `${header.offsetHeight}px`);
    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(header);
    return () => observer.disconnect();
  }, [submitted]);

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
    audioRef.current?.play().catch(() => undefined);
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

  const handleAnswer = useCallback(
    (questionId: string, value: Answer) => {
      if (submitted) return;
      setAnswers((current) => ({ ...current, [questionId]: value }));
    },
    [submitted]
  );

  const handleSubmit = useCallback(() => {
    setSubmitted(true);
    if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => undefined);
    }
    if (isRetryRound) return;
    const gradable = activeParts.flatMap((part) => part.questions).filter(isGradable);
    const correctCount = gradable.filter((q) => isCorrect(q, answers[q.id])).length;
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
        if (question && !isTextQuestion(question) && optionIndex < question.options.length) {
          handleAnswer(question.id, optionIndex);
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
  }, [started, paused, submitted, mode, activeQuestionId, flatQuestions, handleAnswer]);

  if (submitted) {
    return (
      <ScoreSummary
        parts={activeParts}
        answers={answers}
        level={level}
        transcripts={skill === "hoeren" ? transcripts : undefined}
        onRetryWrong={handleRetryWrong}
      />
    );
  }

  const isPractice = mode === "practice";
  const showTranscriptBefore =
    skill === "hoeren" && !hasAudio && isPractice && started && !isRetryRound;

  return (
    <MotionConfig reducedMotion="user">
      <div className="exam-shell" ref={shellRef}>
        <div className="exam-header" ref={headerRef}>
          <div className="exam-topbar">
            <div className="exam-topbar-title">
              <span className="title-main">
                {skillLabel}
                {mode ? ` — ${isPractice ? "Übung" : "Prüfung"}` : ""}
                {isRetryRound ? " — Wiederholung" : ""}
              </span>
              <span className="title-sub">{examLabel}</span>
            </div>
            {mode && (
              <div className="exam-topbar-controls">
                {started && !isRetryRound && <NotesPanel setId={setId} />}
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
                  <ExamTimer
                    totalSeconds={timerSeconds}
                    paused={paused}
                    onExpire={handleSubmit}
                  />
                ) : (
                  <span className="exam-timer idle">Bereit</span>
                )}
              </div>
            )}
          </div>
          {mode && hasAudio && audioUrl && (
            <AudioPlayer src={audioUrl} audioRef={audioRef} started={started} paused={paused} />
          )}
        </div>

        {!mode && (
          <div className="exam-part">
            <ModePicker onChoose={handleChooseMode} />
          </div>
        )}

        {mode === "exam" && fullscreenLost && (
          <div className="exam-part">
            <span className="review-flag">Vollbild wurde verlassen. Die Zeit läuft weiter.</span>
          </div>
        )}

        {mode && skill === "hoeren" && !hasAudio && audioNote && (
          <div className="exam-part">
            <span className="review-flag">{audioNote}</span>
          </div>
        )}

        {showTranscriptBefore && transcripts && transcripts.length > 0 && !paused && (
          <div className="exam-part">
            <TranscriptPanel transcripts={transcripts} title="Hörtexte lesen (statt Audio)" />
          </div>
        )}

        {mode && !started && (
          <div className="exam-part">
            <div className="start-gate">
              <h2 className="part-label">Bereit zum Start</h2>
              <p className="part-instructions">
                {isPractice
                  ? "Sie können jederzeit pausieren. Zahlen 1-9 wählen eine Antwort, Pfeiltasten wechseln die Frage."
                  : "Vollbild, kein Pausieren, automatische Abgabe wenn die Zeit abläuft."}
              </p>
              <button type="button" className="primary-button" onClick={handleStart}>
                Starten
              </button>
            </div>
          </div>
        )}

        <AnimatePresence>
          {mode && started && !paused && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
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
                            answer={answers[question.id]}
                            submitted={false}
                            active={activeQuestionId === question.id}
                            onAnswer={handleAnswer}
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
    </MotionConfig>
  );
}
