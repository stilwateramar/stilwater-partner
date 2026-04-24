import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { getPartnerUser, getPatient } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";

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
  const partner = getPartnerUser();
  const patient = getPatient();

  return (
    <html lang="en">
      <body>
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-200 print:hidden">
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
              <Link href="/ad-simulator" className="hover:text-slate-900">
                Meta Ad demo
              </Link>
              {partner && (
                <Link href="/partner" className="hover:text-slate-900">
                  Partner portal
                </Link>
              )}
              {patient && (
                <Link
                  href="/patient/dashboard"
                  className="hover:text-slate-900"
                >
                  My portal
                </Link>
              )}
              {partner?.role === "stilwater_admin" && (
                <Link href="/admin" className="hover:text-slate-900">
                  Stilwater admin
                </Link>
              )}
            </nav>
            <div className="ml-auto flex items-center gap-3 text-sm">
              {!partner && !patient && (
                <>
                  <Link href="/patient/login" className="text-slate-600">
                    Patient sign in
                  </Link>
                  <Link href="/login" className="btn-ghost">
                    Partner sign in
                  </Link>
                </>
              )}
              {partner && (
                <>
                  <span className="text-xs text-slate-500">
                    {partner.name} · {partner.role}
                  </span>
                  <LogoutButton />
                </>
              )}
              {patient && (
                <>
                  <span className="text-xs text-slate-500">
                    {patient.name} · patient
                  </span>
                  <LogoutButton />
                </>
              )}
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-5 py-8">{children}</main>
        <footer className="border-t border-slate-200 py-8 mt-12 text-center text-xs text-slate-500 print:hidden">
          Stilwater prototype · demo data only · no real payments or messages
          are sent
        </footer>
      </body>
    </html>
  );
}
