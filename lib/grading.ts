import type { Question } from "./types";

export type Answer = number | string;

export function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/ß/g, "ss")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/[^a-z0-9]/g, "");
}

export function isTextQuestion(question: Question): boolean {
  return question.type === "text";
}

export function isGradable(question: Question): boolean {
  if (isTextQuestion(question)) {
    return (question.accepted_answers?.length ?? 0) > 0;
  }
  return question.correct_answer !== null;
}

export function hasAnswer(answer: Answer | undefined): answer is Answer {
  if (answer === undefined) return false;
  if (typeof answer === "string") return answer.trim().length > 0;
  return true;
}

export function isCorrect(question: Question, answer: Answer | undefined): boolean {
  if (!isGradable(question) || !hasAnswer(answer)) return false;
  if (isTextQuestion(question)) {
    if (typeof answer !== "string") return false;
    const given = normalizeText(answer);
    return (question.accepted_answers ?? []).some((accepted) => normalizeText(accepted) === given);
  }
  return typeof answer === "number" && answer === question.correct_answer;
}

export function describeAnswer(question: Question, answer: Answer | undefined): string {
  if (!hasAnswer(answer)) return "";
  if (typeof answer === "string") return answer;
  return question.options[answer] ?? "";
}

export function describeCorrect(question: Question): string {
  if (isTextQuestion(question)) return (question.accepted_answers ?? [])[0] ?? "";
  if (question.correct_answer === null) return "";
  return question.options[question.correct_answer] ?? "";
}
