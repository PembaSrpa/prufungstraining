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
