import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Stilwater — AI-powered partner platform for wellness providers",
  description:
    "Stilwater connects patients with wellness providers like SHARAN and Amar Eye Yoga — from first ad click to consultation, transcript and follow-up.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-200">
          <div className="mx-auto max-w-6xl px-5 py-3 flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <span className="inline-block h-7 w-7 rounded-full bg-gradient-to-br from-still-400 to-still-700" />
              <span>Stilwater</span>
            </Link>
            <nav className="flex gap-5 text-sm text-slate-600">
              <Link href="/providers/sharan" className="hover:text-slate-900">
                SHARAN
              </Link>
              <Link
                href="/providers/amar-eye-yoga"
                className="hover:text-slate-900"
              >
                Amar Eye Yoga
              </Link>
              <Link href="/book" className="hover:text-slate-900">
                Book
              </Link>
              <Link href="/avatar" className="hover:text-slate-900">
                AI Avatar
              </Link>
              <Link href="/ad-simulator" className="hover:text-slate-900">
                Meta Ad demo
              </Link>
            </nav>
            <div className="ml-auto">
              <Link href="/admin" className="btn-ghost">
                Admin
              </Link>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-5 py-8">{children}</main>
        <footer className="border-t border-slate-200 py-8 mt-12 text-center text-xs text-slate-500">
          Stilwater prototype · demo data only · no real payments or messages
          are sent
        </footer>
      </body>
    </html>
  );
}
