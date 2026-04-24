"use client";

import Link from "next/link";
import { useState } from "react";

type RequestRow = {
  id: string;
  subject: string;
  message: string;
  status: "open" | "in_progress" | "resolved";
  createdAt: string;
  resolvedAt?: string;
  patient: { id: string; name: string; phone: string; email?: string } | null;
};

export default function RequestsClient({ initial }: { initial: RequestRow[] }) {
  const [rows, setRows] = useState<RequestRow[]>(initial);
  const [filter, setFilter] = useState<"all" | "open" | "in_progress" | "resolved">(
    "all"
  );

  async function refresh() {
    const r = await fetch("/api/patient/requests").then((r) => r.json());
    setRows(r.requests ?? []);
  }

  async function setStatus(id: string, status: RequestRow["status"]) {
    const prev = rows;
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, status } : r)));
    const r = await fetch("/api/patient/requests", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (!r.ok) setRows(prev);
    else refresh();
  }

  const filtered = rows.filter((r) => filter === "all" || r.status === filter);

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <p className="label">Patient requests</p>
          <h1 className="text-2xl font-semibold">Inbox</h1>
          <p className="text-sm text-slate-500">
            Every request submitted from the patient dashboard lands here. You
            also receive email + WhatsApp alerts.
          </p>
        </div>
        <select
          className="input max-w-[180px]"
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
        >
          <option value="all">All</option>
          <option value="open">Open</option>
          <option value="in_progress">In progress</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      <div className="space-y-3">
        {filtered.map((r) => (
          <div key={r.id} className="card p-5">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <div className="text-xs uppercase tracking-wider text-slate-500">
                  {new Date(r.createdAt).toLocaleString()}
                </div>
                <div className="font-semibold mt-1">{r.subject}</div>
                {r.patient && (
                  <div className="mt-1 text-sm text-slate-600">
                    From{" "}
                    <Link
                      className="underline"
                      href={`/partner/patients/${r.patient.id}`}
                    >
                      {r.patient.name}
                    </Link>{" "}
                    · {r.patient.phone}
                    {r.patient.email ? ` · ${r.patient.email}` : ""}
                  </div>
                )}
              </div>
              <select
                className={`rounded-full px-3 py-1 text-xs font-medium border-0 focus:ring-1 focus:ring-still-500 ${
                  r.status === "resolved"
                    ? "bg-emerald-100 text-emerald-700"
                    : r.status === "in_progress"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-slate-100 text-slate-700"
                }`}
                value={r.status}
                onChange={(e) => setStatus(r.id, e.target.value as any)}
              >
                <option value="open">Open</option>
                <option value="in_progress">In progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
            <p className="mt-3 text-sm text-slate-700 whitespace-pre-wrap">
              {r.message}
            </p>
            {r.patient && (
              <div className="mt-3 flex gap-2">
                <a
                  href={`https://wa.me/${r.patient.phone.replace(/\D+/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-ghost text-xs"
                >
                  💬 Reply on WhatsApp
                </a>
                <Link
                  href={`/partner/patients/${r.patient.id}`}
                  className="btn-ghost text-xs"
                >
                  View patient profile
                </Link>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="card p-8 text-center text-slate-400">
            No requests match that filter.
          </div>
        )}
      </div>
    </div>
  );
}
