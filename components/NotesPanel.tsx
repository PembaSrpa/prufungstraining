"use client";

import { useEffect, useState } from "react";
import { getNote, saveNote } from "@/lib/storage";

interface NotesPanelProps {
  setId: string;
}

export default function NotesPanel({ setId }: NotesPanelProps) {
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setText(getNote(setId));
  }, [setId]);

  const handleChange = (value: string) => {
    setText(value);
    saveNote(setId, value);
  };

  return (
    <div className="notes-panel">
      <button
        type="button"
        className="secondary-button small"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        Notizen
      </button>
      {open && (
        <div className="notes-popover">
          <textarea
            className="notes-textarea"
            value={text}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Ihre Notizen zu diesem Set..."
            rows={6}
            autoFocus
          />
        </div>
      )}
    </div>
  );
}
