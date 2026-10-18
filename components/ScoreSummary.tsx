import Link from "next/link";
import TranscriptPanel from "./TranscriptPanel";
import {
  describeAnswer,
  describeCorrect,
  hasAnswer,
  isCorrect,
  isGradable,
  type Answer
} from "@/lib/grading";
import type { HoerenLesenPart } from "@/lib/types";

interface ScoreSummaryProps {
  parts: HoerenLesenPart[];
  answers: Record<string, Answer>;
  level: string;
  transcripts?: string[];
  onRetryWrong?: (questionIds: string[]) => void;
}

export default function ScoreSummary({
  parts,
  answers,
  level,
  transcripts,
  onRetryWrong
}: ScoreSummaryProps) {
  const allQuestions = parts.flatMap((part) => part.questions);
  const gradable = allQuestions.filter(isGradable);
  const correctCount = gradable.filter((q) => isCorrect(q, answers[q.id])).length;
  const wrongIds = gradable.filter((q) => !isCorrect(q, answers[q.id])).map((q) => q.id);

  return (
    <div className="score-panel" data-level={level}>
      <h2 className="score-headline">
        {correctCount} von {gradable.length} richtig
      </h2>
      <p className="score-sub">
        {allQuestions.length - gradable.length > 0
          ? `${allQuestions.length - gradable.length} Frage(n) ohne bestätigte Lösung wurden nicht gewertet.`
          : "Alle Fragen wurden gewertet."}
      </p>

      {transcripts && transcripts.length > 0 && (
        <TranscriptPanel transcripts={transcripts} title="Hörtexte (Transkript) anzeigen" />
      )}

      {allQuestions.map((question) => {
        const answer = answers[question.id];
        const answered = hasAnswer(answer);
        const gradableQuestion = isGradable(question);
        const correct = isCorrect(question, answer);
        return (
          <div className="review-row" key={question.id}>
            <span className={`review-icon ${correct ? "correct-mark" : "incorrect-mark"}`}>
              {!gradableQuestion ? "?" : correct ? "OK" : "X"}
            </span>
            <div>
              <p className="review-text">{question.prompt}</p>
              <p className="review-text review-answer">
                {answered
                  ? `Ihre Antwort: ${describeAnswer(question, answer)}`
                  : "Keine Antwort ausgewählt."}
                {gradableQuestion && !correct && ` — Richtig: ${describeCorrect(question)}`}
              </p>
            </div>
          </div>
        );
      })}

      <div className="exam-footer" style={{ padding: "32px 0 0" }}>
        {onRetryWrong && wrongIds.length > 0 && (
          <button
            type="button"
            className="primary-button"
            onClick={() => onRetryWrong(wrongIds)}
          >
            Nochmal nur Fehler üben
          </button>
        )}
        <Link href="/" className="secondary-button">
          Zurück zur Übersicht
        </Link>
      </div>
    </div>
  );
}
