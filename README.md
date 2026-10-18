# Pruefungstraining

Persoenliches Uebungsportal fuer Goethe, telc und OeSD A1/A2 Pruefungen.

## Setup

```
npm install
npm run dev
```

Open http://localhost:3000

## Deploy

```
vercel
```

No environment variables and no database are required. All exam content lives
as JSON files under `content/A1` and `content/A2`.

## Adding a new set

Add one JSON file to `content/A1` or `content/A2` following the schema used by
the existing files. No code changes are required for it to appear on the
homepage.

## Status

16 sets (A1: 5, A2: 6, B1: 5) with Hören, Lesen, Schreiben and Sprechen.
Practice and exam mode, pause, notes, highlighting, vocabulary, history,
weak-spot statistics, retry-wrong-only, typed fill-in answers, transcripts.

Content notes: questions flagged `needs_review` have no confirmed answer and are
not scored. Audio files are streamed from the Goethe servers.
