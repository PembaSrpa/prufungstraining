"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { clearAttempts, getAttempts, type AttemptRecord } from "@/lib/storage";

const SKILL_LABEL: Record<string, string> = {
  hoeren: "Hoeren",
  lesen: "Lesen",
  schreiben: "Schreiben",
  sprechen: "Sprechen"
};

function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export default function HistoryPage() {
  const [attempts, setAttempts] = useState<AttemptRecord[] | null>(null);

  useEffect(() => {
    setAttempts(getAttempts());
  }, []);

  const handleClear = () => {
    clearAttempts();
    setAttempts([]);
  };

  return (
    <main className="container">
      <p className="eyebrow">Verlauf</p>
      <h1 className="page-title">Ihre Versuche</h1>
      <p className="page-subtitle">
        Wird nur in diesem Browser gespeichert, nicht synchronisiert.
      </p>

      {attempts === null && <p className="review-text">Lade Verlauf...</p>}

      {attempts !== null && attempts.length === 0 && (
        <p className="review-text">Noch keine Versuche aufgezeichnet.</p>
      )}

      {attempts !== null && attempts.length > 0 && (
        <>
          <ul className="toc-list">
            {attempts.map((attempt) => (
              <li key={attempt.id} className="toc-item">
                <div className="toc-item-head">
                  <span className="toc-item-title">
                    {attempt.examLabel} — {SKILL_LABEL[attempt.skill]}
                  </span>
                  <span className="toc-item-source">{formatDate(attempt.timestamp)}</span>
                </div>
                <p className="review-text review-answer" style={{ marginTop: "6px" }}>
                  {attempt.level}
                  {attempt.totalCount !== undefined
                    ? ` — ${attempt.correctCount} von ${attempt.totalCount} richtig`
                    : " — abgeschlossen"}
                </p>
              </li>
            ))}
          </ul>
          <div className="exam-footer" style={{ padding: "24px 0 0" }}>
            <button type="button" className="secondary-button" onClick={handleClear}>
              Verlauf loeschen
            </button>
          </div>
        </>
      )}

      <div className="exam-footer" style={{ padding: "12px 0 0", justifyContent: "flex-start" }}>
        <Link href="/" className="secondary-button">
          Zurueck zur Uebersicht
        </Link>
      </div>
    </main>
  );
}
