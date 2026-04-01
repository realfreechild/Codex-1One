import './globals.css';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Read Later',
  description: 'Single-user reading list with highlights and notes'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link href="/" className="text-lg font-semibold text-slate-900">
              Read Later
            </Link>
            <span className="text-sm text-slate-500">Single-user offline-friendly app</span>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
