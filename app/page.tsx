import Link from "next/link";
import { listSets } from "@/lib/content";
import type { Level, SetSummary, Skill } from "@/lib/types";

const SKILL_LABEL: Record<Skill, string> = {
  hoeren: "Hoeren",
  lesen: "Lesen",
  schreiben: "Schreiben",
  sprechen: "Sprechen"
};

const EXAM_LABEL: Record<string, string> = {
  "a1-goethe-modellsatz": "Goethe Modellsatz",
  "a1-goethe-uebungssatz-01": "Goethe Uebungssatz 01",
  "a1-goethe-uebungssatz-02": "Goethe Uebungssatz 02",
  "a2-goethe-modellsatz": "Goethe Modellsatz",
  "a2-goethe-fit-modellsatz": "Goethe Fit in Deutsch Modellsatz",
  "a2-goethe-uebungssatz-01": "Goethe Uebungssatz 01",
  "a2-telc-uebungstest-01": "telc Uebungstest 01"
};

function groupByLevel(sets: SetSummary[]): Record<Level, SetSummary[]> {
  const grouped: Record<Level, SetSummary[]> = { A1: [], A2: [] };
  for (const set of sets) {
    grouped[set.level].push(set);
  }
  return grouped;
}

export default function HomePage() {
  const sets = listSets();
  const grouped = groupByLevel(sets);

  return (
    <main className="container">
      <p className="eyebrow">Persoenliches Uebungsportal</p>
      <h1 className="page-title">Pruefungstraining A1 / A2</h1>
      <p className="page-subtitle">
        Hoeren und Lesen werden direkt bewertet. Schreiben laeuft mit Timer ohne
        automatische Bewertung. Sprechen zeigt Themen und Beispielfragen zum
        Nachschlagen.
      </p>
      <div className="toc-skills" style={{ marginBottom: "8px" }}>
        <Link href="/history" className="skill-link">
          Verlauf ansehen
        </Link>
      </div>

      {(["A1", "A2"] as Level[]).map((level) => (
        <section key={level}>
          <h2 className="level-heading">
            <span>{level === "A1" ? "Start Deutsch 1" : "Goethe-Zertifikat A2"}</span>
            <span className={`level-tag ${level.toLowerCase()}`}>{level}</span>
          </h2>
          <ul className="toc-list">
            {grouped[level].map((set) => (
              <li key={set.id} className="toc-item">
                <div className="toc-item-head">
                  <span className="toc-item-title">
                    {EXAM_LABEL[set.id] ?? set.exam}
                  </span>
                  <span className="toc-item-source">
                    {set.source_type === "official" ? "offiziell" : "inoffiziell"}
                  </span>
                </div>
                <div className="toc-skills">
                  {set.skills.map((skill) => (
                    <Link
                      key={skill}
                      href={`/practice/${set.level}/${skill}/${set.id}`}
                      className="skill-link"
                    >
                      {SKILL_LABEL[skill]}
                    </Link>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  );
}
