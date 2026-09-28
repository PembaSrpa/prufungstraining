import { notFound } from "next/navigation";
import { getSet, listAllSetParams } from "@/lib/content";
import ExamRunner from "@/components/ExamRunner";
import SchreibenRunner from "@/components/SchreibenRunner";
import SprechenReference from "@/components/SprechenReference";
import type { Level, Skill } from "@/lib/types";

interface PageProps {
  params: { level: string; skill: string; setId: string };
}

const SKILL_LABEL: Record<Skill, string> = {
  hoeren: "Hoeren",
  lesen: "Lesen",
  schreiben: "Schreiben",
  sprechen: "Sprechen"
};

export function generateStaticParams() {
  const combos = listAllSetParams();
  return combos.flatMap(({ level, setId }) =>
    (["hoeren", "lesen", "schreiben", "sprechen"] as Skill[]).map((skill) => ({
      level,
      skill,
      setId
    }))
  );
}

export default function SkillPage({ params }: PageProps) {
  const level = params.level as Level;
  const skill = params.skill as Skill;
  const set = getSet(level, params.setId);

  if (!set) notFound();

  if (skill === "hoeren" || skill === "lesen") {
    const block = set.skills[skill];
    if (!block) notFound();
    return (
      <ExamRunner
        setId={set.id}
        level={level}
        skill={skill}
        examLabel={set.exam}
        skillLabel={SKILL_LABEL[skill]}
        timerSeconds={block.timer_seconds ?? 1200}
        parts={block.parts}
        audioUrl={block.audio_url}
        audioNote={block.audio_note}
      />
    );
  }

  if (skill === "schreiben") {
    const block = set.skills.schreiben;
    if (!block) notFound();
    return (
      <SchreibenRunner
        setId={set.id}
        level={level}
        examLabel={set.exam}
        timerSeconds={block.timer_seconds ?? 1200}
        parts={block.parts}
      />
    );
  }

  if (skill === "sprechen") {
    const block = set.skills.sprechen;
    if (!block) notFound();
    return (
      <SprechenReference examLabel={set.exam} level={level} parts={block.parts} />
    );
  }

  notFound();
}
