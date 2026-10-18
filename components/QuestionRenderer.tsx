"use client";

import { isCorrect, isGradable, isTextQuestion, type Answer } from "@/lib/grading";
import type { Question } from "@/lib/types";

interface QuestionRendererProps {
  question: Question;
  answer: Answer | undefined;
  submitted: boolean;
  active?: boolean;
  onAnswer: (questionId: string, value: Answer) => void;
  onActivate?: (questionId: string) => void;
}

const LETTER_CODE = /^[A-Za-z0-9]{1,3}( \(.*\))?$/;

function layoutOf(options: string[]): "chips" | "row" | "stack" {
  if (options.length > 3 && options.every((option) => LETTER_CODE.test(option))) return "chips";
  if (options.length >= 2 && options.length <= 3 && options.every((option) => option.length <= 8)) {
    return "row";
  }
  return "stack";
}

export default function QuestionRenderer({
  question,
  answer,
  submitted,
  active,
  onAnswer,
  onActivate
}: QuestionRendererProps) {
  const promptId = `${question.id}-prompt`;
  const showKeys = layoutOf(question.options) !== "chips";

  return (
    <div
      className={`question-block${active ? " question-active" : ""}`}
      onClick={() => onActivate?.(question.id)}
    >
      <p className="question-prompt" id={promptId}>
        {question.prompt}
      </p>
      {question.needs_review && (
        <span className="review-flag">Antwort noch nicht bestätigt</span>
      )}

      {isTextQuestion(question) ? (
        <input
          type="text"
          className="text-answer"
          aria-labelledby={promptId}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          value={typeof answer === "string" ? answer : ""}
          disabled={submitted}
          placeholder="Antwort eingeben"
          onChange={(e) => onAnswer(question.id, e.target.value)}
          onFocus={() => onActivate?.(question.id)}
        />
      ) : (
        <ul
          className={`option-list layout-${layoutOf(question.options)}`}
          role="group"
          aria-labelledby={promptId}
        >
          {question.options.map((option, index) => {
            const isSelected = answer === index;
            const isCorrectOption = question.correct_answer === index;
            let className = "option-button";
            if (submitted && isGradable(question)) {
              if (isCorrectOption) className += " correct";
              else if (isSelected && !isCorrect(question, answer)) className += " incorrect";
            } else if (isSelected) {
              className += " selected";
            }
            return (
              <li key={`${question.id}-${index}`}>
                <button
                  type="button"
                  className={className}
                  disabled={submitted}
                  aria-pressed={isSelected}
                  onClick={(e) => {
                    e.stopPropagation();
                    onActivate?.(question.id);
                    onAnswer(question.id, index);
                  }}
                >
                  {showKeys && index < 9 && <span className="option-key">{index + 1}</span>}
                  {option}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
