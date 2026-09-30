"use client";

import { useState } from "react";

interface HighlightableTextProps {
  text: string;
  enabled: boolean;
  onAddToVocab?: (words: string[]) => void;
}

export default function HighlightableText({ text, enabled, onAddToVocab }: HighlightableTextProps) {
  const [highlighted, setHighlighted] = useState<Set<number>>(new Set());
  const tokens = text.split(/(\s+)/);

  const toggle = (index: number) => {
    if (!enabled) return;
    setHighlighted((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const handleAddToVocab = () => {
    if (!onAddToVocab) return;
    const words = Array.from(highlighted)
      .sort((a, b) => a - b)
      .map((index) => tokens[index]?.replace(/[.,!?;:()"„“]/g, "") ?? "")
      .filter((word) => word.length > 0);
    if (words.length === 0) return;
    onAddToVocab(words);
    setHighlighted(new Set());
  };

  return (
    <div>
      <div className="reading-text">
        {tokens.map((token, index) => {
          if (/^\s+$/.test(token)) return <span key={index}>{token}</span>;
          if (token.length === 0) return null;
          const isHighlighted = highlighted.has(index);
          return (
            <span
              key={index}
              className={`hl-token${isHighlighted ? " hl-active" : ""}${enabled ? " hl-enabled" : ""}`}
              onClick={() => toggle(index)}
            >
              {token}
            </span>
          );
        })}
      </div>
      {enabled && onAddToVocab && highlighted.size > 0 && (
        <button type="button" className="secondary-button small vocab-add-button" onClick={handleAddToVocab}>
          Markierte Woerter zu Vokabeln hinzufuegen
        </button>
      )}
    </div>
  );
}
