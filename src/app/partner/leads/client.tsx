"use client";

import { Fragment, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Lead, LeadStatus, Program, Provider } from "@/lib/types";

const STATUSES: LeadStatus[] = [
  "new",
  "contacted",
  "engaged",
  "agreed_to_purchase",
  "paid",
  "onboarded",
  "consultation_booked",
  "consulted",
  "closed",
];

const STATUS_COLORS: Record<LeadStatus, string> = {
  new: "bg-slate-100 text-slate-700",
  contacted: "bg-sky-100 text-sky-700",
  engaged: "bg-indigo-100 text-indigo-700",
  agreed_to_purchase: "bg-amber-100 text-amber-800",
  paid: "bg-emerald-100 text-emerald-700",
  onboarded: "bg-emerald-100 text-emerald-800",
  consultation_booked: "bg-fuchsia-100 text-fuchsia-800",
  consulted: "bg-violet-100 text-violet-800",
  closed: "bg-slate-200 text-slate-600",
};

type PaymentLink = {
  id: string;
  token: string;
  leadId?: string;
  amountInr: number;
  description: string;
  status: string;
};

export default function LeadsClient({
  initialLeads,
  provider,
  programs,
  canManage,
}: {
  initialLeads: Lead[];
  provider: Provider | null;
  programs: Program[];
  canManage: boolean;
}) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showAdd, setShowAdd] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [payLinks, setPayLinks] = useState<Record<string, PaymentLink>>({});
  const [openPayFor, setOpenPayFor] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return leads.filter((l) => {
      if (statusFilter !== "all" && l.status !== statusFilter) return false;
      if (!q) return true;
      return (
        l.name.toLowerCase().includes(q) ||
        l.phone.includes(q) ||
        (l.email ?? "").toLowerCase().includes(q) ||
        l.interest.toLowerCase().includes(q)
      );
    });
  }, [leads, query, statusFilter]);

  const allOnPageSelected =
    filtered.length > 0 && filtered.every((l) => selected.has(l.id));

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allOnPageSelected) filtered.forEach((l) => next.delete(l.id));
      else filtered.forEach((l) => next.add(l.id));
      return next;
    });
  }

  function showToast(t: string) {
    setToast(t);
    setTimeout(() => setToast(null), 2800);
  }

  async function refresh() {
    const r = await fetch("/api/leads").then((r) => r.json());
    setLeads(r.leads);
  }

  async function changeStatus(id: string, status: LeadStatus) {
    const prev = leads;
    setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, status } : l)));
    const r = await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!r.ok) {
      setLeads(prev);
      showToast("Could not update status");
    }
  }

  function waNumber(phone: string) {
    return phone.replace(/\D+/g, "");
  }

  async function generatePaymentLink(
    lead: Lead,
    programId: string | null,
    amountInr: number,
    description: string
  ) {
    setBusy(true);
    const r = await fetch("/api/payment-links", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        leadId: lead.id,
        purpose: programId ? "program" : "consultation",
        programId: programId ?? undefined,
        amountInr,
        description,
        silent: true,
      }),
    });
    setBusy(false);
    if (!r.ok) {
      showToast("Could not create link");
      return;
    }
    const { paymentLink } = await r.json();
    setPayLinks((prev) => ({ ...prev, [lead.id]: paymentLink }));
    showToast("Payment link generated");
  }

  async function sharePaymentLink(paymentLinkId: string) {
    setBusy(true);
    const r = await fetch("/api/payment-links/share", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ paymentLinkId }),
    });
    setBusy(false);
    if (r.ok) showToast("Sent over WhatsApp");
    else showToast("Could not share");
  }

  async function copyPaymentLink(token: string) {
    const url = `${window.location.origin}/pay-link/${token}`;
    await navigator.clipboard.writeText(url);
    showToast("Link copied to clipboard");
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="label">CRM · Leads</p>
          <h1 className="text-2xl font-semibold">
            {provider?.name ?? "Stilwater"} customer base
          </h1>
          <p className="text-sm text-slate-500">
            Manage leads from Meta, Instagram, website and imports. Send
            WhatsApp, call, share payment links — all from here.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn-ghost" onClick={() => setShowAdd((x) => !x)}>
            + Add lead
          </button>
          {canManage && (
            <button
              className="btn-ghost"
              onClick={() => setShowImport((x) => !x)}
            >
              ⇪ Import Excel/CSV
            </button>
          )}
          <a href="/api/admin/export.csv" className="btn-ghost" download>
            Export CSV
          </a>
        </div>
      </div>

      {!provider?.whatsappNumber && canManage && (
        <div className="card p-4 border-amber-200 bg-amber-50 text-amber-900 text-sm">
          <b>WhatsApp is not connected.</b> Connect your WhatsApp Business
          number to send broadcasts and share payment links.{" "}
          <Link href="/partner/whatsapp" className="underline">
            Connect now →
          </Link>
        </div>
      )}

      {showAdd && (
        <AddLeadPanel
          providerId={provider?.id}
          onCreated={async () => {
            setShowAdd(false);
            await refresh();
            showToast("Lead added");
          }}
          onCancel={() => setShowAdd(false)}
        />
      )}

      {showImport && canManage && (
        <ImportPanel
          providerId={provider?.id}
          onDone={async (msg) => {
            setShowImport(false);
            await refresh();
            showToast(msg);
          }}
          onCancel={() => setShowImport(false)}
        />
      )}

      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-3">
          <input
            className="input max-w-xs"
            placeholder="Search name, phone, interest…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select
            className="input max-w-[200px]"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, " ")}
              </option>
            ))}
          </select>
          <div className="ml-auto flex items-center gap-2 text-sm">
            <span className="text-slate-500">
              {selected.size} selected · {filtered.length} of {leads.length}
            </span>
            <button
              className="btn-primary"
              disabled={selected.size === 0}
              onClick={() => setShowBulk(true)}
            >
              💬 Send WhatsApp to selected
            </button>
          </div>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr>
              <th className="px-3 py-2 text-left w-8">
                <input
                  type="checkbox"
                  checked={allOnPageSelected}
                  onChange={toggleAll}
                />
              </th>
              {[
                "Lead",
                "Phone",
                "Interest",
                "Source",
                "Status",
                "Actions",
              ].map((h) => (
                <th key={h} className="px-3 py-2 text-left">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((l) => {
              const isOpen = openPayFor === l.id;
              const link = payLinks[l.id];
              return (
                <Fragment key={l.id}>
                  <tr className="border-t border-slate-100 align-top">
                    <td className="px-3 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(l.id)}
                        onChange={() => toggleOne(l.id)}
                      />
                    </td>
                    <td className="px-3 py-3">
                      <Link
                        href={`/partner/leads/${l.id}`}
                        className="font-medium hover:underline"
                      >
                        {l.name}
                      </Link>
                      <div className="text-[11px] text-slate-400">
                        {new Date(l.createdAt).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs">{l.phone}</span>
                        <a
                          href={`https://wa.me/${waNumber(l.phone)}`}
                          target="_blank"
                          rel="noreferrer"
                          title="Start WhatsApp call"
                          className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white hover:bg-emerald-600"
                          aria-label={`Start WhatsApp call with ${l.name}`}
                        >
                          📞
                        </a>
                      </div>
                    </td>
                    <td className="px-3 py-3">{l.interest}</td>
                    <td className="px-3 py-3 text-xs text-slate-600">
                      {l.source}
                    </td>
                    <td className="px-3 py-3">
                      <select
                        value={l.status}
                        onChange={(e) =>
                          changeStatus(l.id, e.target.value as LeadStatus)
                        }
                        className={`rounded-full px-2 py-1 text-xs font-medium border-0 focus:ring-1 focus:ring-still-500 ${
                          STATUS_COLORS[l.status]
                        }`}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s.replace(/_/g, " ")}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          className="text-xs underline"
                          onClick={() =>
                            setOpenPayFor(isOpen ? null : l.id)
                          }
                        >
                          {link ? "Payment link" : "Generate payment link"}
                        </button>
                        <Link
                          href={`/partner/leads/${l.id}`}
                          className="text-xs underline"
                        >
                          Open
                        </Link>
                      </div>
                    </td>
                  </tr>
                  {isOpen && (
                    <tr className="bg-slate-50/60">
                      <td />
                      <td colSpan={6} className="px-3 py-3">
                        <PaymentLinkRow
                          lead={l}
                          programs={programs}
                          existing={link}
                          busy={busy}
                          onGenerate={generatePaymentLink}
                          onShare={sharePaymentLink}
                          onCopy={copyPaymentLink}
                        />
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-3 py-10 text-center text-slate-400 text-sm"
                >
                  No leads match that filter.{" "}
                  <button
                    onClick={() => setShowAdd(true)}
                    className="underline"
                  >
                    Add one manually
                  </button>{" "}
                  or{" "}
                  <Link href="/ad-simulator" className="underline">
                    try the ad simulator
                  </Link>
                  .
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showBulk && (
        <BulkMessageModal
          count={selected.size}
          onClose={() => setShowBulk(false)}
          onSend={async (text) => {
            setBusy(true);
            const r = await fetch("/api/leads/bulk-message", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({
                leadIds: Array.from(selected),
                text,
              }),
            });
            setBusy(false);
            if (!r.ok) {
              const d = await r.json().catch(() => ({}));
              showToast(
                d.error === "no_whatsapp_number"
                  ? "Connect WhatsApp first"
                  : "Send failed"
              );
              return false;
            }
            const d = await r.json();
            showToast(`Sent to ${d.sent} leads`);
            setSelected(new Set());
            return true;
          }}
        />
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-still-900 text-white px-4 py-2 rounded-full text-sm shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  );
}

function AddLeadPanel({
  providerId,
  onCreated,
  onCancel,
}: {
  providerId?: string;
  onCreated: () => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    interest: "General enquiry",
    preferredMode: "whatsapp",
    notes: "",
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function create() {
    if (!providerId) return setErr("No provider scope.");
    if (!form.name || !form.phone) return setErr("Name and phone are required.");
    setErr("");
    setBusy(true);
    const r = await fetch("/api/leads", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...form, providerId, source: "manual" }),
    });
    setBusy(false);
    if (!r.ok) {
      setErr("Could not create");
      return;
    }
    onCreated();
  }

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Add a lead manually</h2>
        <button className="text-sm text-slate-500" onClick={onCancel}>
          ×
        </button>
      </div>
      <div className="mt-3 grid sm:grid-cols-3 gap-2">
        <input
          className="input"
          placeholder="Full name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          className="input"
          placeholder="Phone (+91 …)"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        <input
          className="input"
          placeholder="Email (optional)"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          className="input"
          placeholder="Interest (e.g. Diabetes reversal)"
          value={form.interest}
          onChange={(e) => setForm({ ...form, interest: e.target.value })}
        />
        <select
          className="input"
          value={form.preferredMode}
          onChange={(e) =>
            setForm({ ...form, preferredMode: e.target.value })
          }
        >
          <option value="whatsapp">WhatsApp</option>
          <option value="call">Call</option>
          <option value="email">Email</option>
        </select>
        <input
          className="input"
          placeholder="Notes"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />
      </div>
      {err && <div className="mt-2 text-sm text-red-600">{err}</div>}
      <div className="mt-3 flex gap-2">
        <button className="btn-primary" onClick={create} disabled={busy}>
          {busy ? "Saving…" : "Add lead"}
        </button>
        <button className="btn-ghost" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}

function ImportPanel({
  providerId,
  onDone,
  onCancel,
}: {
  providerId?: string;
  onDone: (msg: string) => void;
  onCancel: () => void;
}) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [rows, setRows] = useState<Array<Record<string, string>>>([]);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleFile(file: File) {
    setErr("");
    const text = await file.text();
    // Simple CSV parser that handles commas + tabs + newlines + quotes.
    // Excel users can "Save As CSV" — that is the supported path.
    const delim = text.includes("\t") && !text.includes(",") ? "\t" : ",";
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) {
      setErr("File is empty or only has a header row.");
      return;
    }
    const headers = splitCsv(lines[0], delim).map((h) =>
      h.trim().toLowerCase()
    );
    const parsed = lines.slice(1).map((line) => {
      const cells = splitCsv(line, delim);
      const obj: Record<string, string> = {};
      headers.forEach((h, i) => {
        obj[h] = (cells[i] ?? "").trim();
      });
      return obj;
    });
    setRows(parsed);
  }

  async function submit() {
    if (!providerId) return setErr("No provider scope.");
    if (!rows.length) return setErr("Add a CSV first.");
    setBusy(true);
    const r = await fetch("/api/leads/import", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ rows, providerId }),
    });
    setBusy(false);
    if (!r.ok) {
      setErr("Import failed");
      return;
    }
    const d = await r.json();
    onDone(`Imported ${d.created} leads · ${d.skipped} skipped`);
  }

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Import leads from Excel / CSV</h2>
        <button className="text-sm text-slate-500" onClick={onCancel}>
          ×
        </button>
      </div>
      <p className="mt-1 text-sm text-slate-500">
        Save your Excel sheet as <code>.csv</code> with columns:{" "}
        <code>name, phone, email, interest, source, notes</code>. Duplicates
        (by phone) are skipped.
      </p>
      <div className="mt-3 flex items-center gap-2">
        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv,.tsv,text/tab-separated-values"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
        {rows.length > 0 && (
          <span className="text-xs text-slate-500">
            {rows.length} rows ready to import
          </span>
        )}
      </div>
      {rows.length > 0 && (
        <div className="mt-3 max-h-56 overflow-y-auto border border-slate-200 rounded-lg">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase">
              <tr>
                {Object.keys(rows[0]).map((h) => (
                  <th key={h} className="px-2 py-1 text-left">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 5).map((r, i) => (
                <tr key={i} className="border-t border-slate-100">
                  {Object.keys(rows[0]).map((h) => (
                    <td key={h} className="px-2 py-1">
                      {r[h]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length > 5 && (
            <div className="px-2 py-1 text-[11px] text-slate-400">
              … and {rows.length - 5} more
            </div>
          )}
        </div>
      )}
      {err && <div className="mt-2 text-sm text-red-600">{err}</div>}
      <div className="mt-3 flex gap-2">
        <button
          className="btn-primary"
          onClick={submit}
          disabled={busy || !rows.length}
        >
          {busy ? "Importing…" : `Import ${rows.length || ""} leads`}
        </button>
        <button className="btn-ghost" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}

function splitCsv(line: string, delim: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === delim && !inQuotes) {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

function PaymentLinkRow({
  lead,
  programs,
  existing,
  busy,
  onGenerate,
  onShare,
  onCopy,
}: {
  lead: Lead;
  programs: Program[];
  existing?: PaymentLink;
  busy: boolean;
  onGenerate: (
    lead: Lead,
    programId: string | null,
    amountInr: number,
    description: string
  ) => void;
  onShare: (paymentLinkId: string) => void;
  onCopy: (token: string) => void;
}) {
  const [programId, setProgramId] = useState(programs[0]?.id ?? "");
  const [amount, setAmount] = useState<number>(
    programs[0]?.priceInr ?? 1000
  );
  const [description, setDescription] = useState(
    programs[0]?.name ?? "Consultation"
  );

  function onPick(id: string) {
    setProgramId(id);
    const p = programs.find((x) => x.id === id);
    if (p) {
      setAmount(p.priceInr);
      setDescription(p.name);
    }
  }

  if (existing) {
    const fullUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/pay-link/${existing.token}`
        : `/pay-link/${existing.token}`;
    return (
      <div className="flex flex-wrap items-center gap-3">
        <div className="text-sm">
          <div className="font-medium">{existing.description}</div>
          <div className="text-xs text-slate-500">
            ₹{existing.amountInr} ·{" "}
            <code className="bg-slate-100 px-1 rounded">{fullUrl}</code>
          </div>
        </div>
        <div className="ml-auto flex gap-2">
          <button
            className="btn-primary text-xs"
            disabled={busy}
            onClick={() => onShare(existing.id)}
          >
            💬 Share via WhatsApp
          </button>
          <button
            className="btn-ghost text-xs"
            onClick={() => onCopy(existing.token)}
          >
            📋 Copy link
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-end gap-2">
      <div className="min-w-[220px]">
        <div className="label">Program</div>
        <select
          className="input"
          value={programId}
          onChange={(e) => onPick(e.target.value)}
        >
          {programs.length === 0 && (
            <option value="">Custom (no program)</option>
          )}
          {programs.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} — ₹{p.priceInr}
            </option>
          ))}
        </select>
      </div>
      <div>
        <div className="label">Amount (₹)</div>
        <input
          className="input w-28"
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
        />
      </div>
      <div className="flex-1 min-w-[200px]">
        <div className="label">Description</div>
        <input
          className="input"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <button
        className="btn-primary text-xs"
        disabled={busy || !amount || !description}
        onClick={() =>
          onGenerate(lead, programId || null, amount, description)
        }
      >
        🔗 Generate link
      </button>
    </div>
  );
}

function BulkMessageModal({
  count,
  onClose,
  onSend,
}: {
  count: number;
  onClose: () => void;
  onSend: (text: string) => Promise<boolean>;
}) {
  const [text, setText] = useState(
    "Hi {name}, this is a quick check-in from the Stillwater team. How are you feeling? Reply to this message and we'll guide you to the right next step."
  );
  const [busy, setBusy] = useState(false);

  async function go() {
    setBusy(true);
    const ok = await onSend(text);
    setBusy(false);
    if (ok) onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="card w-full max-w-lg p-5 bg-white">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">
            Send WhatsApp to {count} selected leads
          </h2>
          <button className="text-slate-500" onClick={onClose}>
            ×
          </button>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Use <code>{"{name}"}</code> as a placeholder — it'll be replaced with
          each lead's first name.
        </p>
        <textarea
          className="input mt-3 min-h-[160px]"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="mt-3 flex justify-end gap-2">
          <button className="btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" onClick={go} disabled={busy}>
            {busy ? "Sending…" : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
