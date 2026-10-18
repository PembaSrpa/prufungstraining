interface TranscriptPanelProps {
  transcripts: string[];
  title: string;
  defaultOpen?: boolean;
}

export default function TranscriptPanel({ transcripts, title, defaultOpen }: TranscriptPanelProps) {
  if (transcripts.length === 0) return null;
  return (
    <details className="transcript-panel" open={defaultOpen}>
      <summary className="transcript-summary">{title}</summary>
      <div className="transcript-body">
        {transcripts.map((text, index) => (
          <p key={index} className="transcript-line">
            {text}
          </p>
        ))}
      </div>
    </details>
  );
}
