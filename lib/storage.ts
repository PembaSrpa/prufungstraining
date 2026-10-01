"use client";

import type { Level, Skill } from "./types";

const STORAGE_KEY = "pruefungstraining.attempts";

export interface AttemptRecord {
  id: string;
  setId: string;
  level: Level;
  skill: Skill;
  examLabel: string;
  timestamp: string;
  correctCount?: number;
  totalCount?: number;
}

function readAll(): AttemptRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as AttemptRecord[];
  } catch {
    return [];
  }
}

function writeAll(records: AttemptRecord[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    return;
  }
}

export function saveAttempt(record: Omit<AttemptRecord, "id" | "timestamp">): void {
  const records = readAll();
  const newRecord: AttemptRecord = {
    ...record,
    id: `${record.setId}-${record.skill}-${Date.now()}`,
    timestamp: new Date().toISOString()
  };
  records.unshift(newRecord);
  writeAll(records);
}

export function getAttempts(): AttemptRecord[] {
  return readAll();
}

export function getAttemptsForSet(setId: string, skill: Skill): AttemptRecord[] {
  return readAll().filter((r) => r.setId === setId && r.skill === skill);
}

export function clearAttempts(): void {
  writeAll([]);
}

export interface SkillStat {
  skill: Skill;
  attemptCount: number;
  correctSum: number;
  totalSum: number;
  accuracy: number | null;
}

export interface SetStat {
  setId: string;
  examLabel: string;
  level: Level;
  skill: Skill;
  attemptCount: number;
  bestAccuracy: number | null;
  lastAccuracy: number | null;
  lastAttemptAt: string;
}

export function getSkillStats(): SkillStat[] {
  const attempts = getAttempts();
  const bySkill = new Map<Skill, { attemptCount: number; correctSum: number; totalSum: number }>();
  for (const attempt of attempts) {
    if (attempt.totalCount === undefined || attempt.correctCount === undefined) continue;
    const entry = bySkill.get(attempt.skill) ?? { attemptCount: 0, correctSum: 0, totalSum: 0 };
    entry.attemptCount += 1;
    entry.correctSum += attempt.correctCount;
    entry.totalSum += attempt.totalCount;
    bySkill.set(attempt.skill, entry);
  }
  return Array.from(bySkill.entries()).map(([skill, entry]) => ({
    skill,
    attemptCount: entry.attemptCount,
    correctSum: entry.correctSum,
    totalSum: entry.totalSum,
    accuracy: entry.totalSum > 0 ? entry.correctSum / entry.totalSum : null
  }));
}

export function getSetStats(): SetStat[] {
  const attempts = getAttempts();
  const bySet = new Map<string, AttemptRecord[]>();
  for (const attempt of attempts) {
    const key = `${attempt.setId}-${attempt.skill}`;
    const list = bySet.get(key) ?? [];
    list.push(attempt);
    bySet.set(key, list);
  }
  const stats: SetStat[] = [];
  for (const [, list] of bySet) {
    const sorted = [...list].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    const latest = sorted[0];
    if (!latest) continue;
    const graded = sorted.filter((a) => a.totalCount !== undefined && a.correctCount !== undefined);
    const accuracies = graded.map((a) => a.correctCount! / Math.max(1, a.totalCount!));
    const lastGraded = graded[0];
    const lastAccuracy = lastGraded
      ? lastGraded.correctCount! / Math.max(1, lastGraded.totalCount!)
      : null;
    stats.push({
      setId: latest.setId,
      examLabel: latest.examLabel,
      level: latest.level,
      skill: latest.skill,
      attemptCount: list.length,
      bestAccuracy: accuracies.length > 0 ? Math.max(...accuracies) : null,
      lastAccuracy,
      lastAttemptAt: latest.timestamp
    });
  }
  return stats.sort((a, b) => (a.bestAccuracy ?? 1) - (b.bestAccuracy ?? 1));
}

const NOTES_KEY = "pruefungstraining.notes";

export function getNote(setId: string): string {
  if (typeof window === "undefined") return "";
  try {
    const raw = window.localStorage.getItem(NOTES_KEY);
    if (!raw) return "";
    const parsed = JSON.parse(raw) as Record<string, string>;
    return parsed[setId] ?? "";
  } catch {
    return "";
  }
}

export function saveNote(setId: string, text: string): void {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(NOTES_KEY);
    const parsed = raw ? (JSON.parse(raw) as Record<string, string>) : {};
    parsed[setId] = text;
    window.localStorage.setItem(NOTES_KEY, JSON.stringify(parsed));
  } catch {
    return;
  }
}

const VOCAB_KEY = "pruefungstraining.vocab";

export interface VocabEntry {
  id: string;
  word: string;
  setId: string;
  examLabel: string;
  level: string;
  addedAt: string;
}

export function getVocab(): VocabEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(VOCAB_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as VocabEntry[]) : [];
  } catch {
    return [];
  }
}

export function addVocabWords(
  words: string[],
  context: { setId: string; examLabel: string; level: string }
): void {
  if (typeof window === "undefined") return;
  const current = getVocab();
  const existingWords = new Set(current.map((entry) => entry.word.toLowerCase()));
  const additions: VocabEntry[] = [];
  for (const rawWord of words) {
    const word = rawWord.trim();
    if (word.length === 0) continue;
    if (existingWords.has(word.toLowerCase())) continue;
    existingWords.add(word.toLowerCase());
    additions.push({
      id: `${context.setId}-${word}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      word,
      setId: context.setId,
      examLabel: context.examLabel,
      level: context.level,
      addedAt: new Date().toISOString()
    });
  }
  if (additions.length === 0) return;
  try {
    window.localStorage.setItem(VOCAB_KEY, JSON.stringify([...additions, ...current]));
  } catch {
    return;
  }
}

export function removeVocabEntry(id: string): void {
  if (typeof window === "undefined") return;
  const current = getVocab().filter((entry) => entry.id !== id);
  try {
    window.localStorage.setItem(VOCAB_KEY, JSON.stringify(current));
  } catch {
    return;
  }
}

export function clearVocab(): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(VOCAB_KEY, JSON.stringify([]));
}
