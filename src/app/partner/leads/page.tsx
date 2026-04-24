import Link from "next/link";
import { getPartnerUser } from "@/lib/auth";
import { readDB } from "@/lib/db";

export default function PartnerLeads() {
  const user = getPartnerUser()!;
  const db = readDB();
  const leads = db.leads.filter((l) =>
    user.providerId ? l.providerId === user.providerId : true
  );

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <p className="label">Leads</p>
          <h1 className="text-2xl font-semibold">All leads</h1>
        </div>
        <a
          href="/api/admin/export.csv"
          className="btn-ghost"
          download
        >
          Export CSV
        </a>
      </div>

      <div className="card mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr>
              {[
                "When",
                "Name",
                "Phone",
                "Interest",
                "Source",
                "Mode",
                "Status",
                "",
              ].map((h) => (
                <th key={h} className="px-3 py-2 text-left">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id} className="border-t border-slate-100">
                <td className="px-3 py-2 text-xs text-slate-500">
                  {new Date(l.createdAt).toLocaleString()}
                </td>
                <td className="px-3 py-2 font-medium">{l.name}</td>
                <td className="px-3 py-2">{l.phone}</td>
                <td className="px-3 py-2">{l.interest}</td>
                <td className="px-3 py-2">{l.source}</td>
                <td className="px-3 py-2">{l.preferredMode}</td>
                <td className="px-3 py-2">
                  <span className="badge bg-slate-100 text-slate-700">
                    {l.status}
                  </span>
                </td>
                <td className="px-3 py-2 text-right">
                  <Link
                    href={`/partner/leads/${l.id}`}
                    className="text-xs underline"
                  >
                    Open →
                  </Link>
                </td>
              </tr>
            ))}
            {leads.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-3 py-8 text-center text-slate-400 text-sm"
                >
                  No leads yet.{" "}
                  <Link href="/ad-simulator" className="underline">
                    Generate some from the ad simulator
                  </Link>
                  .
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
