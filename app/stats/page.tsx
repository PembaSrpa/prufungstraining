"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSetStats, getSkillStats, type SetStat, type SkillStat } from "@/lib/storage";

const SKILL_LABEL: Record<string, string> = {
  hoeren: "Hoeren",
  lesen: "Lesen",
  schreiben: "Schreiben",
  sprechen: "Sprechen"
};

function formatPercent(value: number | null): string {
  if (value === null) return "-";
  return `${Math.round(value * 100)}%`;
}

export default function StatsPage() {
  const [skillStats, setSkillStats] = useState<SkillStat[] | null>(null);
  const [setStats, setSetStats] = useState<SetStat[] | null>(null);

  useEffect(() => {
    setSkillStats(getSkillStats());
    setSetStats(getSetStats());
  }, []);

  const hasData = (skillStats?.length ?? 0) > 0 || (setStats?.length ?? 0) > 0;

  return (
    <main className="container">
      <p className="eyebrow">Auswertung</p>
      <h1 className="page-title">Schwachstellen</h1>
      <p className="page-subtitle">
        Genauigkeit nach Fertigkeit und Set, berechnet aus Ihrem lokal
        gespeicherten Verlauf.
      </p>

      {skillStats === null && <p className="review-text">Lade Auswertung...</p>}

      {skillStats !== null && !hasData && (
        <p className="review-text">
          Noch keine bewerteten Versuche vorhanden. Machen Sie zuerst eine
          Hoeren- oder Lesen-Uebung.
        </p>
      )}

      {skillStats !== null && skillStats.length > 0 && (
        <>
          <h2 className="level-heading" style={{ marginTop: "16px" }}>
            Nach Fertigkeit
          </h2>
          <ul className="toc-list">
            {skillStats.map((stat) => (
              <li key={stat.skill} className="toc-item">
                <div className="toc-item-head">
                  <span className="toc-item-title">{SKILL_LABEL[stat.skill]}</span>
                  <span className="toc-item-source">{formatPercent(stat.accuracy)}</span>
                </div>
                <p className="review-text review-answer" style={{ marginTop: "6px" }}>
                  {stat.attemptCount} Versuch(e), {stat.correctSum} von {stat.totalSum} richtig
                  insgesamt
                </p>
              </li>
            ))}
          </ul>
        </>
      )}

      {setStats !== null && setStats.length > 0 && (
        <>
          <h2 className="level-heading">Schwaechste Sets zuerst</h2>
          <ul className="toc-list">
            {setStats.map((stat) => (
              <li key={`${stat.setId}-${stat.skill}`} className="toc-item">
                <div className="toc-item-head">
                  <span className="toc-item-title">
                    {stat.examLabel} — {SKILL_LABEL[stat.skill]}
                  </span>
                  <span className="toc-item-source">
                    Beste: {formatPercent(stat.bestAccuracy)}
                  </span>
                </div>
                <div className="toc-skills">
                  <Link
                    href={`/practice/${stat.level}/${stat.skill}/${stat.setId}`}
                    className="skill-link"
                  >
                    Nochmal ueben
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      <div className="exam-footer" style={{ padding: "24px 0 0", justifyContent: "flex-start" }}>
        <Link href="/" className="secondary-button">
          Zurueck zur Uebersicht
        </Link>
      </div>
    </main>
  );
}
