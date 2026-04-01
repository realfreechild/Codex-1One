import Link from 'next/link';
import { listItems } from '@/lib/db';
import { saveUrlAction, updateStatusAction } from './actions';

const statuses = ['all', 'unread', 'reading', 'read', 'archived'] as const;

type HomeProps = {
  searchParams: Promise<{ q?: string; status?: string }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const q = params.q ?? '';
  const status = statuses.includes((params.status as any) ?? 'all') ? (params.status as any) : 'all';
  const items = listItems(q, status);

  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="mb-4 text-2xl font-bold">Save for later</h1>
        <form action={saveUrlAction} className="grid gap-3 md:grid-cols-[1fr_auto]">
          <input
            required
            name="url"
            type="url"
            placeholder="https://example.com/article"
            className="rounded-md border border-slate-300 px-3 py-2"
          />
          <button className="rounded-md bg-slate-900 px-4 py-2 font-medium text-white">Save URL</button>
          <input
            name="tags"
            placeholder="tags (comma-separated)"
            className="rounded-md border border-slate-300 px-3 py-2 md:col-span-2"
          />
        </form>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <form className="mb-6 grid gap-3 md:grid-cols-[1fr_auto]">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search title, content, tags..."
            className="rounded-md border border-slate-300 px-3 py-2"
          />
          <select name="status" defaultValue={status} className="rounded-md border border-slate-300 px-3 py-2">
            {statuses.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </form>

        <div className="space-y-4">
          {items.length === 0 ? (
            <p className="text-slate-500">No saved reads yet.</p>
          ) : (
            items.map((item) => (
              <article key={item.id} className="rounded-md border border-slate-200 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <Link href={`/item/${item.id}`} className="text-lg font-semibold hover:underline">
                      {item.title}
                    </Link>
                    <p className="text-sm text-slate-500">{item.siteName ?? new URL(item.url).hostname}</p>
                    {item.description ? <p className="mt-2 text-sm text-slate-700">{item.description}</p> : null}
                    {item.tags ? <p className="mt-2 text-xs text-slate-500">Tags: {item.tags}</p> : null}
                  </div>

                  <form action={updateStatusAction} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={item.id} />
                    <select
                      name="status"
                      defaultValue={item.status}
                      className="rounded-md border border-slate-300 px-2 py-1 text-sm"
                    >
                      {statuses
                        .filter((value) => value !== 'all')
                        .map((value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                    </select>
                    <button className="rounded-md border border-slate-300 px-2 py-1 text-sm">Update</button>
                  </form>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
