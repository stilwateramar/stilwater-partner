import Link from "next/link";
import { redirect } from "next/navigation";
import { getPartnerUser } from "@/lib/auth";
import { readDB } from "@/lib/db";

export default function PartnerHome() {
  const user = getPartnerUser()!;
  if (user.role === "admin") redirect("/partner/crm");
  const db = readDB();
  const scope = (id: string | undefined) =>
    user.providerId ? id === user.providerId : true;

  const leads = db.leads.filter((l) => scope(l.providerId));
  const calls = db.callLogs.filter((c) => scope(c.providerId));
  const links = db.paymentLinks.filter((p) => scope(p.providerId));
  const paid = links.filter((p) => p.status === "paid");
  const consults = db.consultations.filter((c) => scope(c.providerId));

  return (
    <div className="space-y-6">
      <div>
        <p className="label">Welcome back</p>
        <h1 className="text-2xl font-semibold">Hi {user.name.split(" ")[0]}</h1>
        <p className="text-sm text-slate-500">
          Here's what's waiting in your workspace.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Open leads" value={leads.filter((l) => !["paid","onboarded","closed"].includes(l.status)).length} href="/partner/leads" />
        <Stat label="Calls made" value={calls.length} href="/partner/calls" />
        <Stat label="Payment links" value={links.length} href="/partner/payments" />
        <Stat label="Paid customers" value={paid.length} href="/partner/payments" />
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Next actions</h2>
          <Link className="text-sm underline" href="/partner/leads">
            Open leads →
          </Link>
        </div>
        <ul className="mt-3 divide-y divide-slate-100 text-sm">
          {leads.slice(0, 5).map((l) => (
            <li
              key={l.id}
              className="py-2 flex items-center justify-between gap-3"
            >
              <div>
                <div className="font-medium">{l.name}</div>
                <div className="text-xs text-slate-500">
                  {l.phone} · {l.interest}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="badge bg-slate-100 text-slate-700">
                  {l.status}
                </span>
                <Link
                  href={`/partner/leads/${l.id}`}
                  className="text-xs underline"
                >
                  Open
                </Link>
              </div>
            </li>
          ))}
          {leads.length === 0 && (
            <li className="py-4 text-center text-slate-400">No leads yet.</li>
          )}
        </ul>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="card p-5">
          <h2 className="font-semibold">Recent consultations</h2>
          <ul className="mt-2 text-sm divide-y divide-slate-100">
            {consults.slice(0, 5).map((c) => {
              const lead = db.leads.find((l) => l.id === c.leadId);
              return (
                <li key={c.id} className="py-2 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{lead?.name ?? "—"}</div>
                    <div className="text-xs text-slate-500">
                      {c.type} · {new Date(c.slot).toLocaleString()}
                    </div>
                  </div>
                  <Link
                    href={`/consultation/${c.id}`}
                    className="text-xs underline"
                  >
                    Open
                  </Link>
                </li>
              );
            })}
            {consults.length === 0 && (
              <li className="py-2 text-slate-400">None yet.</li>
            )}
          </ul>
        </div>
        <div className="card p-5">
          <h2 className="font-semibold">Recent calls</h2>
          <ul className="mt-2 text-sm divide-y divide-slate-100">
            {calls.slice(0, 5).map((c) => {
              const lead = db.leads.find((l) => l.id === c.leadId);
              return (
                <li key={c.id} className="py-2 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{lead?.name ?? "—"}</div>
                    <div className="text-xs text-slate-500">
                      {c.mode.toUpperCase()} · {c.language} · {c.outcome}
                    </div>
                  </div>
                  <span className="text-xs text-slate-500">
                    {Math.floor(c.durationSec / 60)}m {c.durationSec % 60}s
                  </span>
                </li>
              );
            })}
            {calls.length === 0 && (
              <li className="py-2 text-slate-400">None yet.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  href,
}: {
  label: string;
  value: number;
  href: string;
}) {
  return (
    <Link href={href} className="card p-4 hover:border-still-300">
      <div className="text-xs uppercase tracking-wider text-slate-500">
        {label}
      </div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
    </Link>
  );
}
