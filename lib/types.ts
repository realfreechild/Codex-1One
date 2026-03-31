export type ReadingStatus = 'unread' | 'reading' | 'read' | 'archived';

export type SavedItem = {
  id: number;
  url: string;
  title: string;
  author: string | null;
  siteName: string | null;
  description: string | null;
  tags: string | null;
  content: string | null;
  status: ReadingStatus;
  createdAt: string;
  updatedAt: string;
};

export type Highlight = {
  id: number;
  itemId: number;
  quote: string;
  note: string | null;
  createdAt: string;
};
