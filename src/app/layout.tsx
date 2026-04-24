import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { Cormorant_Garamond } from "next/font/google";
import { getPartnerUser, getPatient } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";
import StilwaterLogo from "@/components/StilwaterLogo";

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Stillwater — the global community for holistic healing",
  description:
    "Stillwater is the global community for holistic healing. Reverse lifestyle diseases with Yoga, Meditation, plant-based nutrition and Ayurveda — guided by AI.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const partner = getPartnerUser();
  const patient = getPatient();

  return (
    <html lang="en" className={serif.variable}>
      <body>
        <header className="sticky top-0 z-40 bg-still-900 text-white print:hidden">
          <div className="mx-auto max-w-6xl px-5 py-4 flex items-center gap-8">
            <StilwaterLogo href="/" size="md" />
            <nav className="hidden md:flex gap-6 text-xs uppercase tracking-[0.25em] text-white/70">
              {!partner && !patient && (
                <>
                  <Link
                    href="/partner-ai-tools"
                    className="hover:text-white"
                  >
                    Partner AI Tools
                  </Link>
                  <Link href="/ai-healers" className="hover:text-white">
                    AI Healers
                  </Link>
                </>
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
                    User login
                  </Link>
                  <Link
                    href="/patient/signup"
                    className="inline-flex items-center rounded bg-still-500 px-3 py-2 text-xs uppercase tracking-[0.2em] text-white hover:bg-still-400"
                  >
                    Sign up
                  </Link>
                  <Link
                    href="/login"
                    className="hidden sm:inline-flex items-center rounded border border-white/40 px-3 py-2 text-xs uppercase tracking-[0.2em] text-white hover:bg-white/10"
                  >
                    Partner login
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
            The global community for holistic healing · prototype · demo data only
          </div>
        </footer>
      </body>
    </html>
  );
}
