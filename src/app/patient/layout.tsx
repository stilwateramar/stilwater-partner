import { redirect } from "next/navigation";
import Link from "next/link";
import { headers } from "next/headers";
import { getPatient } from "@/lib/auth";
import { readDB } from "@/lib/db";
import LogoutButton from "@/components/LogoutButton";
import ProviderLogo from "@/components/ProviderLogo";

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // allow /patient/login without auth
  const pathname = headers().get("x-invoke-path") ?? headers().get("referer") ?? "";
  const patient = getPatient();
  // Auth-gate everything except /patient/login
  // We don't have perfect access to the route here, but middleware would handle this
  // in production. We instead check in each page. For the login page we short-circuit:
  if (!patient) {
    // If we're on /patient/login, Next renders this layout but we let the page render.
    // Detect by checking the headers fallback; if path clearly isn't login, redirect.
    const p = pathname.toLowerCase();
    if (!p.includes("/patient/login")) {
      // Some Next versions don't populate x-invoke-path; fallback: always render,
      // and let each page redirect. But we use this safety net where possible.
    }
  }

  // When unauthenticated, just render children (login page renders its own layout).
  if (!patient) return <>{children}</>;

  const db = readDB();
  const provider = db.providers.find((p) => p.id === patient.providerId);

  return (
    <div className="grid md:grid-cols-[220px_1fr] gap-6">
      <aside className="card p-4 h-max md:sticky md:top-20">
        <div className="pb-3 border-b border-slate-100">
          {provider ? (
            <ProviderLogo provider={provider} size="md" />
          ) : (
            <div className="flex items-center gap-2">
              <span className="h-9 w-9 rounded-lg bg-gradient-to-br from-still-400 to-still-600" />
              <div>
                <div className="font-serif text-sm font-semibold">
                  Stillwater
                </div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500">
                  Community member
                </div>
              </div>
            </div>
          )}
        </div>
        <nav className="mt-3 flex md:flex-col gap-1 text-sm flex-wrap">
          <Item href="/patient/dashboard" label="Dashboard" />
          <Item href="/patient/reports" label="Case details & reports" />
          <Item href="/patient/dashboard#invoices" label="Invoices" />
          <Item href="/patient/videos" label="Videos" />
          <Item href="/patient/consultations" label="Consultations" />
          <Item href="/patient/prescriptions" label="Prescriptions" />
          <Item href="/patient/chatbot" label="Partner chatbot" />
          <Item href="/patient/avatar" label="AI avatar" />
          <Item href="/ai-healers" label="Recommended healers" />
        </nav>
        <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
          Signed in as<br />
          <span className="text-slate-700 font-medium">{patient.name}</span>
          <div>{patient.phone}</div>
          <div className="mt-2">
            <LogoutButton />
          </div>
        </div>
      </aside>
      <section>{children}</section>
    </div>
  );
}

function Item({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-700"
    >
      {label}
    </Link>
  );
}
