"use client";

import type { Question } from "@/lib/types";

interface QuestionRendererProps {
  question: Question;
  selected: number | undefined;
  submitted: boolean;
  active?: boolean;
  onSelect: (questionId: string, optionIndex: number) => void;
  onActivate?: (questionId: string) => void;
}

export default function QuestionRenderer({
  question,
  selected,
  submitted,
  active,
  onSelect,
  onActivate
}: QuestionRendererProps) {
  return (
    <div
      className={`question-block${active ? " question-active" : ""}`}
      onClick={() => onActivate?.(question.id)}
    >
      <p className="question-prompt">{question.prompt}</p>
      {question.needs_review && (
        <span className="review-flag">Antwort noch nicht bestaetigt</span>
      )}
      <ul className="option-list">
        {question.options.map((option, index) => {
          const isSelected = selected === index;
          const isCorrectOption = question.correct_answer === index;
          let className = "option-button";
          if (submitted) {
            if (isCorrectOption) className += " correct";
            else if (isSelected && !isCorrectOption) className += " incorrect";
          } else if (isSelected) {
            className += " selected";
          }
          return (
            <li key={`${question.id}-${index}`}>
              <button
                type="button"
                className={className}
                disabled={submitted}
                onClick={(e) => {
                  e.stopPropagation();
                  onActivate?.(question.id);
                  onSelect(question.id, index);
                }}
              >
                <span className="option-key">{index + 1}</span>
                {option}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
