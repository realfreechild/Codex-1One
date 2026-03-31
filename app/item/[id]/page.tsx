import Link from 'next/link';
import { notFound } from 'next/navigation';
import { addHighlightAction, updateStatusAction } from '@/app/actions';
import { getItemById, listHighlights } from '@/lib/db';

type ItemPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ItemPage({ params }: ItemPageProps) {
  const { id } = await params;
  const itemId = Number(id);
  const item = getItemById(itemId);

  if (!item) {
    notFound();
  }

  const highlights = listHighlights(item.id);

  return (
    <div className="space-y-6">
      <Link href="/" className="text-sm text-slate-600 hover:underline">
        ← Back to list
      </Link>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold">{item.title}</h1>
          <form action={updateStatusAction} className="flex items-center gap-2">
            <input type="hidden" name="id" value={item.id} />
            <select name="status" defaultValue={item.status} className="rounded-md border border-slate-300 px-2 py-1">
              <option value="unread">unread</option>
              <option value="reading">reading</option>
              <option value="read">read</option>
              <option value="archived">archived</option>
            </select>
            <button className="rounded-md border border-slate-300 px-3 py-1">Save</button>
          </form>
        </div>

        <p className="mb-4 text-sm text-slate-500">
          <a href={item.url} target="_blank" className="hover:underline" rel="noreferrer">
            Original article
          </a>
          {item.author ? ` · ${item.author}` : ''}
          {item.siteName ? ` · ${item.siteName}` : ''}
        </p>

        <article className="prose prose-slate max-w-none text-sm leading-7">
          {item.content ?? item.description ?? 'No extracted content available for this URL yet.'}
        </article>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Highlights & notes</h2>

        <form action={addHighlightAction} className="mb-6 grid gap-3">
          <input type="hidden" name="itemId" value={item.id} />
          <textarea
            name="quote"
            required
            placeholder="Paste a quote or highlight"
            rows={3}
            className="rounded-md border border-slate-300 px-3 py-2"
          />
          <textarea
            name="note"
            placeholder="Add an optional note"
            rows={2}
            className="rounded-md border border-slate-300 px-3 py-2"
          />
          <button className="w-fit rounded-md bg-slate-900 px-4 py-2 font-medium text-white">Add highlight</button>
        </form>

        <div className="space-y-3">
          {highlights.length === 0 ? (
            <p className="text-sm text-slate-500">No highlights yet.</p>
          ) : (
            highlights.map((highlight) => (
              <div key={highlight.id} className="rounded-md border border-slate-200 bg-slate-50 p-3">
                <p className="whitespace-pre-wrap text-sm">“{highlight.quote}”</p>
                {highlight.note ? <p className="mt-2 text-sm text-slate-700">{highlight.note}</p> : null}
                <p className="mt-2 text-xs text-slate-500">{new Date(highlight.createdAt).toLocaleString()}</p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
