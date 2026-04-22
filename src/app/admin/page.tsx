"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Admin() {
  const [tab, setTab] = useState<"leads" | "consults" | "transcripts">("leads");
  const [data, setData] = useState<any>(null);

  async function load() {
    const r = await fetch("/api/admin").then((r) => r.json());
    setData(r);
  }
  useEffect(() => {
    load();
    const i = setInterval(load, 4000);
    return () => clearInterval(i);
  }, []);

  if (!data) return <div>Loading…</div>;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <p className="label">Stilwater · admin</p>
          <h1 className="text-2xl font-semibold">Operations console</h1>
        </div>
        <div className="flex gap-2 text-xs">
          <Stat label="Leads" value={data.leads.length} />
          <Stat label="Consultations" value={data.consultations.length} />
          <Stat label="Transcripts" value={data.transcripts.length} />
        </div>
      </div>

      <div className="mt-5 flex gap-2">
        {(["leads", "consults", "transcripts"] as const).map((t) => (
          <button
            key={t}
            className={`btn ${tab === t ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setTab(t)}
          >
            {t === "leads"
              ? "Leads sheet"
              : t === "consults"
              ? "Consultations"
              : "Transcripts"}
          </button>
        ))}
      </div>

      {tab === "leads" && <LeadsTable data={data} />}
      {tab === "consults" && <ConsultsTable data={data} />}
      {tab === "transcripts" && <TranscriptsTable data={data} />}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="card px-3 py-2 text-right">
      <div className="text-[10px] uppercase text-slate-400">{label}</div>
      <div className="text-xl font-semibold">{value}</div>
    </div>
  );
}

function LeadsTable({ data }: { data: any }) {
  return (
    <div className="card mt-4 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 text-sm text-slate-500 flex items-center justify-between">
        <span>Leads · synced from Meta/Instagram ads + website</span>
        <a
          className="text-xs underline"
          href="/api/admin/export.csv"
          download
        >
          Export CSV
        </a>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr>
              {[
                "When",
                "Name",
                "Phone",
                "Provider",
                "Source",
                "Interest",
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
            {data.leads.map((l: any) => {
              const provider = data.providers.find(
                (p: any) => p.id === l.providerId
              );
              return (
                <tr key={l.id} className="border-t border-slate-100">
                  <td className="px-3 py-2 text-xs text-slate-500">
                    {new Date(l.createdAt).toLocaleString()}
                  </td>
                  <td className="px-3 py-2 font-medium">{l.name}</td>
                  <td className="px-3 py-2">{l.phone}</td>
                  <td className="px-3 py-2">{provider?.name ?? l.providerId}</td>
                  <td className="px-3 py-2">{l.source}</td>
                  <td className="px-3 py-2">{l.interest}</td>
                  <td className="px-3 py-2">{l.preferredMode}</td>
                  <td className="px-3 py-2">
                    <span className="badge bg-slate-100 text-slate-700">
                      {l.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right space-x-2 whitespace-nowrap">
                    <Link
                      href={`/whatsapp/${l.id}`}
                      className="text-xs underline"
                    >
                      WhatsApp
                    </Link>
                    <Link
                      href={`/book?provider=${l.providerId}&leadId=${l.id}`}
                      className="text-xs underline"
                    >
                      Book
                    </Link>
                  </td>
                </tr>
              );
            })}
            {data.leads.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  className="px-3 py-8 text-center text-slate-400 text-sm"
                >
                  No leads yet. Try the{" "}
                  <Link href="/ad-simulator" className="underline">
                    ad simulator
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

function ConsultsTable({ data }: { data: any }) {
  return (
    <div className="card mt-4 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
          <tr>
            {["Slot", "Lead", "Provider", "Doctor", "Type", "Amount", "Status", ""].map(
              (h) => (
                <th key={h} className="px-3 py-2 text-left">
                  {h}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {data.consultations.map((c: any) => {
            const lead = data.leads.find((l: any) => l.id === c.leadId);
            const provider = data.providers.find(
              (p: any) => p.id === c.providerId
            );
            const doctor = data.doctors.find((d: any) => d.id === c.doctorId);
            return (
              <tr key={c.id} className="border-t border-slate-100">
                <td className="px-3 py-2 text-xs">
                  {new Date(c.slot).toLocaleString()}
                </td>
                <td className="px-3 py-2">{lead?.name ?? "—"}</td>
                <td className="px-3 py-2">{provider?.name}</td>
                <td className="px-3 py-2">{doctor?.name ?? "AI avatar"}</td>
                <td className="px-3 py-2">{c.type}</td>
                <td className="px-3 py-2">₹{c.amountInr}</td>
                <td className="px-3 py-2">
                  <span className="badge bg-slate-100 text-slate-700">
                    {c.status}
                  </span>
                </td>
                <td className="px-3 py-2 text-right">
                  <Link
                    href={`/consultation/${c.id}`}
                    className="text-xs underline"
                  >
                    Open →
                  </Link>
                </td>
              </tr>
            );
          })}
          {data.consultations.length === 0 && (
            <tr>
              <td
                colSpan={8}
                className="px-3 py-8 text-center text-slate-400 text-sm"
              >
                No consultations yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function TranscriptsTable({ data }: { data: any }) {
  return (
    <div className="mt-4 space-y-3">
      {data.transcripts.map((t: any) => {
        const c = data.consultations.find(
          (x: any) => x.id === t.consultationId
        );
        const lead = c && data.leads.find((l: any) => l.id === c.leadId);
        return (
          <div key={t.id} className="card p-4">
            <div className="flex items-center justify-between">
              <div className="font-medium">{lead?.name ?? "—"}</div>
              <Link
                href={`/consultation/${t.consultationId}`}
                className="text-xs underline"
              >
                Open room →
              </Link>
            </div>
            <p className="text-sm text-slate-600 mt-1">{t.summary}</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {t.actions.map((a: any, i: number) => (
                <span
                  key={i}
                  className="badge bg-emerald-100 text-emerald-700 capitalize"
                >
                  {a.kind.replace("_", " ")}
                </span>
              ))}
            </div>
          </div>
        );
      })}
      {data.transcripts.length === 0 && (
        <div className="card p-6 text-center text-slate-400 text-sm">
          No transcripts yet.
        </div>
      )}
    </div>
  );
}
