import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { Cormorant_Garamond } from "next/font/google";
import { getPartnerUser, getPatient } from "@/lib/auth";
import { readDB } from "@/lib/db";
import LogoutButton from "@/components/LogoutButton";

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Stillwater — the global community of holistic healing",
  description:
    "Stillwater connects patients with wellness providers like SHARAN and Amar Eye Yoga — from first ad click to consultation, transcript and follow-up.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const partner = getPartnerUser();
  const patient = getPatient();
  const db = readDB();

  const scopedProviders = partner
    ? partner.role === "stilwater_admin"
      ? db.providers
      : db.providers.filter((p) => p.id === partner.providerId)
    : patient
    ? db.providers.filter((p) => p.id === patient.providerId)
    : db.providers;

  return (
    <html lang="en" className={serif.variable}>
      <body>
        <header className="sticky top-0 z-40 bg-still-900 text-white print:hidden">
          <div className="mx-auto max-w-6xl px-5 py-4 flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3">
              <span className="inline-block h-7 w-7 rounded-full bg-gradient-to-br from-still-400 to-still-200" />
              <span className="font-serif tracking-[0.35em] text-lg uppercase">
                Stillwater
              </span>
            </Link>
            <nav className="hidden md:flex gap-6 text-xs uppercase tracking-[0.25em] text-white/70">
              {!partner && !patient && (
                <>
                  <Link href="/#vision" className="hover:text-white">
                    Vision
                  </Link>
                  <Link href="/#providers" className="hover:text-white">
                    Providers
                  </Link>
                  <Link href="/ad-simulator" className="hover:text-white">
                    Demo
                  </Link>
                </>
              )}
              {scopedProviders.length === 1 &&
                (partner || patient) && (
                  <Link
                    href={`/providers/${scopedProviders[0].id}`}
                    className="hover:text-white"
                  >
                    {scopedProviders[0].name}
                  </Link>
                )}
              {partner && (
                <Link href="/partner" className="hover:text-white">
                  Partner portal
                </Link>
              )}
              {patient && (
                <Link
                  href="/patient/dashboard"
                  className="hover:text-white"
                >
                  My portal
                </Link>
              )}
              {partner?.role === "stilwater_admin" && (
                <Link href="/admin" className="hover:text-white">
                  Stillwater admin
                </Link>
              )}
            </nav>
            <div className="ml-auto flex items-center gap-3 text-sm">
              {!partner && !patient && (
                <>
                  <Link
                    href="/patient/login"
                    className="text-xs uppercase tracking-[0.2em] text-white/80 hover:text-white"
                  >
                    Patient
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center rounded border border-white/40 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white hover:bg-white/10"
                  >
                    Partner Sign In
                  </Link>
                </>
              )}
              {partner && (
                <>
                  <span className="hidden sm:inline text-xs text-white/70">
                    Hi, {partner.name.split(" ")[0]}
                  </span>
                  <Link
                    href={
                      partner.role === "stilwater_admin" ? "/admin" : "/partner"
                    }
                    className="hidden sm:inline-flex items-center rounded border border-white/40 px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] text-white hover:bg-white/10"
                  >
                    Continue
                  </Link>
                  <LogoutButton />
                </>
              )}
              {patient && (
                <>
                  <span className="hidden sm:inline text-xs text-white/70">
                    Hi, {patient.phone.replace(/\D+/g, "").slice(-10)}
                  </span>
                  <Link
                    href="/patient/dashboard"
                    className="hidden sm:inline-flex items-center rounded border border-white/40 px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] text-white hover:bg-white/10"
                  >
                    Continue care path
                  </Link>
                  <LogoutButton />
                </>
              )}
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-5 py-8">{children}</main>
        <footer className="border-t border-slate-200 py-8 mt-12 text-center text-xs text-slate-500 print:hidden">
          <span className="font-serif tracking-[0.3em] uppercase text-slate-600">
            Stillwater
          </span>
          <div className="mt-1">
            prototype · demo data only · no real payments or messages are sent
          </div>
        </footer>
      </body>
    </html>
  );
}
