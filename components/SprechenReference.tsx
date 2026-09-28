import type { SprechenPart } from "@/lib/types";

interface SprechenReferenceProps {
  examLabel: string;
  level: string;
  parts: SprechenPart[];
}

export default function SprechenReference({
  examLabel,
  level,
  parts
}: SprechenReferenceProps) {
  return (
    <main className="container">
      <p className="eyebrow">
        {examLabel} — {level}
      </p>
      <h1 className="page-title">Sprechen</h1>
      <p className="page-subtitle">
        Referenzmaterial ohne Timer und ohne Bewertung. Themen und
        Beispielfragen zum Nachschlagen und Ueben mit einem Partner.
      </p>

      {parts.map((part) => (
        <section key={part.part_number} className="exam-part" style={{ padding: "0 0 32px" }}>
          <h2 className="part-label">Teil {part.part_number}</h2>
          <p className="part-instructions">{part.topic}</p>
          <ul className="option-list">
            {part.example_questions.map((question, index) => (
              <li key={index} className="reading-text" style={{ marginBottom: 0 }}>
                {question}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  );
}
