# Read Later App

A single-user **read later / save for later** app built with Next.js App Router, Tailwind CSS, and SQLite (`better-sqlite3`).

## Features

- Save URLs and auto-extract metadata/content.
- Clean reader view for each saved link.
- Add highlights and notes per article.
- Search and filter by status/tags/content.
- No authentication required (single-user).

## Run locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

SQLite database file is stored at `.data/read-later.db`.
