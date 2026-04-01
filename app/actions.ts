'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { addHighlight, createItem, updateItemStatus } from '@/lib/db';
import { ReadingStatus } from '@/lib/types';
import { extractMetadata } from '@/lib/metadata';

export async function saveUrlAction(formData: FormData) {
  const url = String(formData.get('url') ?? '').trim();
  const tags = String(formData.get('tags') ?? '').trim() || null;

  if (!url) {
    return;
  }

  const metadata = await extractMetadata(url);

  createItem({
    url,
    title: metadata.title,
    author: metadata.author,
    siteName: metadata.siteName,
    description: metadata.description,
    tags,
    content: metadata.content
  });

  revalidatePath('/');
}

export async function updateStatusAction(formData: FormData) {
  const id = Number(formData.get('id'));
  const status = String(formData.get('status')) as ReadingStatus;

  if (!id || !['unread', 'reading', 'read', 'archived'].includes(status)) {
    return;
  }

  updateItemStatus(id, status);
  revalidatePath('/');
  revalidatePath(`/item/${id}`);
}

export async function addHighlightAction(formData: FormData) {
  const itemId = Number(formData.get('itemId'));
  const quote = String(formData.get('quote') ?? '').trim();
  const note = String(formData.get('note') ?? '').trim() || null;

  if (!itemId || !quote) {
    return;
  }

  addHighlight(itemId, quote, note);
  revalidatePath(`/item/${itemId}`);
  redirect(`/item/${itemId}`);
}
