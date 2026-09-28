"use client";

import type { Question } from "@/lib/types";

interface QuestionRendererProps {
  question: Question;
  selected: number | undefined;
  submitted: boolean;
  onSelect: (questionId: string, optionIndex: number) => void;
}

export default function QuestionRenderer({
  question,
  selected,
  submitted,
  onSelect
}: QuestionRendererProps) {
  return (
    <div className="question-block">
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
                onClick={() => onSelect(question.id, index)}
              >
                {option}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
