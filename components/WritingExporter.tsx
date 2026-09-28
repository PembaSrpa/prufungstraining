"use client";

import { useState } from "react";
import type { SchreibenPart } from "@/lib/types";

interface WritingExporterProps {
  parts: SchreibenPart[];
  answers: Record<number, string>;
  onExport?: () => void;
}

function buildExportText(parts: SchreibenPart[], answers: Record<number, string>): string {
  const sections = parts.map((part) => {
    const answer = answers[part.part_number] ?? "";
    return [
      `Teil ${part.part_number}`,
      `Aufgabe: ${part.task_instructions}`,
      `Vorgabe: ${part.task_prompt}`,
      `Antwort:`,
      answer.trim().length > 0 ? answer.trim() : "(keine Antwort geschrieben)"
    ].join("\n");
  });
  return [
    "Bitte bewerte diese Schreiben-Antworten fuer eine Deutschpruefung (A1/A2 Niveau).",
    "Gib Feedback zu Grammatik, Wortschatz, Aufgabenerfuellung und Laenge.",
    "",
    ...sections
  ].join("\n\n");
}

export default function WritingExporter({ parts, answers, onExport }: WritingExporterProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const text = buildExportText(parts, answers);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      onExport?.();
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button type="button" className="primary-button" onClick={handleCopy}>
      {copied ? "Kopiert" : "Fuer KI-Bewertung kopieren"}
    </button>
  );
}
