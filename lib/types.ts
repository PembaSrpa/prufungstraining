export type Level = "A1" | "A2" | "B1";
export type ExamMode = "practice" | "exam";

export type Skill = "hoeren" | "lesen" | "schreiben" | "sprechen";
export type SourceType = "official" | "unofficial";

export interface Question {
  id: string;
  prompt: string;
  options: string[];
  correct_answer: number | null;
  needs_review?: boolean;
}

export interface HoerenLesenPart {
  part_number: number;
  instructions?: string;
  text?: string;
  audio_url?: string;
  needs_review?: boolean;
  review_note?: string;
  questions: Question[];
}

export interface SchreibenPart {
  part_number: number;
  task_instructions: string;
  task_prompt: string;
}

export interface SprechenPart {
  part_number: number;
  topic: string;
  example_questions: string[];
}

export interface SkillBlock<T> {
  timer_seconds?: number;
  audio_url?: string;
  audio_note?: string;
  parts: T[];
  transcripts?: string[];
}

export interface ExamSet {
  id: string;
  level: Level;
  exam: string;
  source_type: SourceType;
  source_url: string;
  edition?: string;
  skills: {
    hoeren?: SkillBlock<HoerenLesenPart>;
    lesen?: SkillBlock<HoerenLesenPart>;
    schreiben?: SkillBlock<SchreibenPart>;
    sprechen?: SkillBlock<SprechenPart>;
  };
}

export interface SetSummary {
  id: string;
  level: Level;
  exam: string;
  source_type: SourceType;
  skills: Skill[];
}
