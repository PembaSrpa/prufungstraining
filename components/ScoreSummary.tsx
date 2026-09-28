import Link from "next/link";
import type { HoerenLesenPart } from "@/lib/types";

interface ScoreSummaryProps {
  parts: HoerenLesenPart[];
  answers: Record<string, number>;
  level: string;
}

export default function ScoreSummary({ parts, answers, level }: ScoreSummaryProps) {
  const allQuestions = parts.flatMap((part) => part.questions);
  const gradable = allQuestions.filter((q) => q.correct_answer !== null);
  const correctCount = gradable.filter(
    (q) => answers[q.id] === q.correct_answer
  ).length;

  return (
    <div className="score-panel">
      <h2 className="score-headline">
        {correctCount} von {gradable.length} richtig
      </h2>
      <p className="score-sub">
        {allQuestions.length - gradable.length > 0
          ? `${allQuestions.length - gradable.length} Frage(n) ohne bestaetigte Loesung wurden nicht gewertet.`
          : "Alle Fragen wurden gewertet."}
      </p>

      {allQuestions.map((question) => {
        const userAnswer = answers[question.id];
        const isUnanswered = userAnswer === undefined;
        const isCorrect =
          question.correct_answer !== null && userAnswer === question.correct_answer;
        return (
          <div className="review-row" key={question.id}>
            <span
              className={`review-icon ${isCorrect ? "correct-mark" : "incorrect-mark"}`}
            >
              {question.correct_answer === null ? "?" : isCorrect ? "OK" : "X"}
            </span>
            <div>
              <p className="review-text">{question.prompt}</p>
              <p className="review-text review-answer">
                {isUnanswered
                  ? "Keine Antwort ausgewaehlt."
                  : `Ihre Antwort: ${question.options[userAnswer]}`}
                {question.correct_answer !== null &&
                  !isCorrect &&
                  ` — Richtig: ${question.options[question.correct_answer]}`}
              </p>
            </div>
          </div>
        );
      })}

      <div className="exam-footer" style={{ padding: "32px 0 0" }}>
        <Link href="/" className="secondary-button">
          Zurueck zur Uebersicht
        </Link>
      </div>
    </div>
  );
}
