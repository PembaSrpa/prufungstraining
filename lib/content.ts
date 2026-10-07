import fs from "fs";
import path from "path";
import type { ExamSet, Level, SetSummary, Skill } from "./types";

const CONTENT_DIR = path.join(process.cwd(), "content");
const LEVELS: Level[] = ["A1", "A2", "B1"];

function readSetFile(level: Level, filename: string): ExamSet {
  const fullPath = path.join(CONTENT_DIR, level, filename);
  const raw = fs.readFileSync(fullPath, "utf-8");
  return JSON.parse(raw) as ExamSet;
}

export function listSets(): SetSummary[] {
  const summaries: SetSummary[] = [];
  for (const level of LEVELS) {
    const dir = path.join(CONTENT_DIR, level);
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
    for (const file of files) {
      const set = readSetFile(level, file);
      const skills = Object.keys(set.skills) as Skill[];
      summaries.push({
        id: set.id,
        level: set.level,
        exam: set.exam,
        source_type: set.source_type,
        skills
      });
    }
  }
  return summaries.sort((a, b) => a.id.localeCompare(b.id));
}

export function getSet(level: Level, setId: string): ExamSet | null {
  const dir = path.join(CONTENT_DIR, level);
  if (!fs.existsSync(dir)) return null;
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
  for (const file of files) {
    const set = readSetFile(level, file);
    if (set.id === setId) return set;
  }
  return null;
}

export function listAllSetParams(): { level: Level; setId: string }[] {
  return listSets().map((s) => ({ level: s.level, setId: s.id }));
}
