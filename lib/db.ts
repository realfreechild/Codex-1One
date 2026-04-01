import Database from 'better-sqlite3';
import path from 'node:path';
import { existsSync, mkdirSync } from 'node:fs';
import { Highlight, ReadingStatus, SavedItem } from './types';

const dataDir = path.join(process.cwd(), '.data');
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'read-later.db');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

function init() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS saved_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      url TEXT NOT NULL,
      title TEXT NOT NULL,
      author TEXT,
      site_name TEXT,
      description TEXT,
      tags TEXT,
      content TEXT,
      status TEXT NOT NULL DEFAULT 'unread',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS highlights (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_id INTEGER NOT NULL,
      quote TEXT NOT NULL,
      note TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY(item_id) REFERENCES saved_items(id) ON DELETE CASCADE
    );
  `);
}

init();

const mapItem = (row: any): SavedItem => ({
  id: row.id,
  url: row.url,
  title: row.title,
  author: row.author,
  siteName: row.site_name,
  description: row.description,
  tags: row.tags,
  content: row.content,
  status: row.status,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

const mapHighlight = (row: any): Highlight => ({
  id: row.id,
  itemId: row.item_id,
  quote: row.quote,
  note: row.note,
  createdAt: row.created_at
});

export function listItems(search?: string, status?: ReadingStatus | 'all') {
  const queryBits: string[] = [];
  const params: Record<string, unknown> = {};

  if (search) {
    queryBits.push('(title LIKE @search OR description LIKE @search OR tags LIKE @search OR content LIKE @search)');
    params.search = `%${search}%`;
  }

  if (status && status !== 'all') {
    queryBits.push('status = @status');
    params.status = status;
  }

  const where = queryBits.length ? `WHERE ${queryBits.join(' AND ')}` : '';
  const stmt = db.prepare(`SELECT * FROM saved_items ${where} ORDER BY datetime(created_at) DESC`);
  return stmt.all(params).map(mapItem);
}

export function createItem(input: {
  url: string;
  title: string;
  author?: string | null;
  siteName?: string | null;
  description?: string | null;
  tags?: string | null;
  content?: string | null;
}) {
  const now = new Date().toISOString();
  const stmt = db.prepare(`
    INSERT INTO saved_items(url, title, author, site_name, description, tags, content, status, created_at, updated_at)
    VALUES(@url, @title, @author, @siteName, @description, @tags, @content, 'unread', @createdAt, @updatedAt)
  `);

  const result = stmt.run({
    ...input,
    createdAt: now,
    updatedAt: now
  });

  return Number(result.lastInsertRowid);
}

export function getItemById(id: number): SavedItem | null {
  const row = db.prepare('SELECT * FROM saved_items WHERE id = ?').get(id);
  return row ? mapItem(row) : null;
}

export function updateItemStatus(id: number, status: ReadingStatus) {
  const stmt = db.prepare('UPDATE saved_items SET status = @status, updated_at = @updatedAt WHERE id = @id');
  stmt.run({ id, status, updatedAt: new Date().toISOString() });
}

export function listHighlights(itemId: number) {
  const stmt = db.prepare('SELECT * FROM highlights WHERE item_id = ? ORDER BY datetime(created_at) DESC');
  return stmt.all(itemId).map(mapHighlight);
}

export function addHighlight(itemId: number, quote: string, note?: string | null) {
  const stmt = db.prepare('INSERT INTO highlights(item_id, quote, note, created_at) VALUES(?, ?, ?, ?)');
  stmt.run(itemId, quote, note ?? null, new Date().toISOString());
}
