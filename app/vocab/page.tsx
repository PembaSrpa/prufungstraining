"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { clearVocab, getVocab, removeVocabEntry, type VocabEntry } from "@/lib/storage";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

export default function VocabPage() {
  const [entries, setEntries] = useState<VocabEntry[] | null>(null);

  useEffect(() => {
    setEntries(getVocab());
  }, []);

  const handleRemove = (id: string) => {
    removeVocabEntry(id);
    setEntries(getVocab());
  };

  const handleClear = () => {
    clearVocab();
    setEntries([]);
  };

  return (
    <main className="container">
      <p className="eyebrow">Vokabeln</p>
      <h1 className="page-title">Gesammelte Woerter</h1>
      <p className="page-subtitle">
        Woerter, die Sie in Lesetexten markiert und zu Vokabeln hinzugefuegt
        haben. Wird nur in diesem Browser gespeichert.
      </p>

      {entries === null && <p className="review-text">Lade Vokabeln...</p>}

      {entries !== null && entries.length === 0 && (
        <p className="review-text">Noch keine Vokabeln gesammelt.</p>
      )}

      {entries !== null && entries.length > 0 && (
        <>
          <ul className="toc-list">
            {entries.map((entry) => (
              <li key={entry.id} className="toc-item">
                <div className="toc-item-head">
                  <span className="toc-item-title">{entry.word}</span>
                  <button
                    type="button"
                    className="secondary-button small"
                    onClick={() => handleRemove(entry.id)}
                  >
                    Entfernen
                  </button>
                </div>
                <p className="review-text review-answer" style={{ marginTop: "6px" }}>
                  {entry.level} — {entry.examLabel} — {formatDate(entry.addedAt)}
                </p>
              </li>
            ))}
          </ul>
          <div className="exam-footer" style={{ padding: "24px 0 0" }}>
            <button type="button" className="secondary-button" onClick={handleClear}>
              Alle Vokabeln loeschen
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
