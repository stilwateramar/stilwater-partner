import Link from "next/link";
import { getPartnerUser } from "@/lib/auth";
import { readDB } from "@/lib/db";
import { LANGUAGES } from "@/lib/languages";

export default function CallsPage() {
  const user = getPartnerUser()!;
  const db = readDB();
  const calls = db.callLogs.filter((c) =>
    user.providerId ? c.providerId === user.providerId : true
  );

  return (
    <div>
      <p className="label">Call log</p>
      <h1 className="text-2xl font-semibold">All calls</h1>
      <div className="mt-4 card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr>
              {["When", "Lead", "By", "Mode", "Language", "Duration", "Outcome", ""].map(
                (h) => (
                  <th key={h} className="px-3 py-2 text-left">
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {calls.map((c) => {
              const lead = db.leads.find((l) => l.id === c.leadId);
              const by = db.users.find((u) => u.id === c.userId);
              const lang = LANGUAGES.find((l) => l.code === c.language);
              return (
                <tr key={c.id} className="border-t border-slate-100">
                  <td className="px-3 py-2 text-xs">
                    {new Date(c.createdAt).toLocaleString()}
                  </td>
                  <td className="px-3 py-2">{lead?.name ?? "—"}</td>
                  <td className="px-3 py-2">{by?.name ?? "—"}</td>
                  <td className="px-3 py-2">{c.mode}</td>
                  <td className="px-3 py-2">{lang?.name ?? c.language}</td>
                  <td className="px-3 py-2">
                    {Math.floor(c.durationSec / 60)}m {c.durationSec % 60}s
                  </td>
                  <td className="px-3 py-2">
                    <span className="badge bg-slate-100 text-slate-700">
                      {c.outcome}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right">
                    {lead && (
                      <Link
                        href={`/partner/leads/${lead.id}`}
                        className="text-xs underline"
                      >
                        Open lead →
                      </Link>
                    )}
                  </td>
                </tr>
              );
            })}
            {calls.length === 0 && (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-slate-400">
                  No calls yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
