"use client";

import { useMemo, useRef, useState } from "react";
import type { Lead, LeadStatus, Provider, ProviderSetting } from "@/lib/types";
import ProviderLogo from "@/components/ProviderLogo";

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
  contacted: "bg-sky-100 text-sky-800",
  engaged: "bg-indigo-100 text-indigo-800",
  agreed_to_purchase: "bg-amber-100 text-amber-800",
  paid: "bg-emerald-100 text-emerald-800",
  onboarded: "bg-teal-100 text-teal-800",
  consultation_booked: "bg-violet-100 text-violet-800",
  consulted: "bg-fuchsia-100 text-fuchsia-800",
  closed: "bg-slate-200 text-slate-600",
};

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function CRMClient({
  provider,
  initialLeads,
  initialSettings,
  initialAdmins,
}: {
  provider: Provider;
  initialLeads: Lead[];
  initialSettings: ProviderSetting;
  initialAdmins: AdminUser[];
}) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [settings, setSettings] = useState<ProviderSetting>(initialSettings);
  const [admins, setAdmins] = useState<AdminUser[]>(initialAdmins);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [broadcastText, setBroadcastText] = useState(
    `Hi {first}, this is the ${provider.name} team. We'd love to help you start your healing journey — would you have 5 minutes for a quick call?`
  );
  const [broadcastStatus, setBroadcastStatus] = useState<string>("");
  const [toast, setToast] = useState<string>("");
  const [paymentLinkBusy, setPaymentLinkBusy] = useState<string>("");
  const [copyNotice, setCopyNotice] = useState<string>("");
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [addForm, setAddForm] = useState({
    name: "",
    phone: "",
    email: "",
    interest: "",
  });

  const [adminForm, setAdminForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [adminErr, setAdminErr] = useState("");

  const allSelected =
    leads.length > 0 && leads.every((l) => selected.has(l.id));

  function toggleAll() {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(leads.map((l) => l.id)));
  }

  function toggleOne(id: string) {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2800);
  }

  async function refreshLeads() {
    const r = await fetch("/api/leads").then((r) => r.json());
    setLeads(r.leads ?? []);
  }

  async function addLead() {
    if (!addForm.name.trim() || !addForm.phone.trim()) {
      showToast("Name and phone required");
      return;
    }
    const r = await fetch("/api/leads", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ...addForm,
        providerId: provider.id,
        source: "manual",
        preferredMode: "whatsapp",
        interest: addForm.interest || "General enquiry",
      }),
    });
    if (r.ok) {
      setAddForm({ name: "", phone: "", email: "", interest: "" });
      await refreshLeads();
      showToast("Lead added");
    } else {
      showToast("Could not add lead");
    }
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const text = await f.text();
    const rows = parseCSV(text);
    if (!rows.length) {
      showToast("No rows detected in file");
      return;
    }
    const r = await fetch("/api/leads/bulk", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ providerId: provider.id, rows }),
    });
    if (r.ok) {
      const d = await r.json();
      showToast(`Imported ${d.created}, skipped ${d.skipped}`);
      await refreshLeads();
    } else {
      showToast("Import failed");
    }
    if (fileRef.current) fileRef.current.value = "";
  }

  async function updateStatus(id: string, status: LeadStatus) {
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status } : l))
    );
    await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    });
  }

  async function saveSettings(next: Partial<ProviderSetting>) {
    const r = await fetch("/api/provider-settings", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ providerId: provider.id, ...next }),
    });
    if (r.ok) {
      const d = await r.json();
      setSettings(d.settings);
      showToast("WhatsApp settings saved");
    } else {
      showToast("Could not save settings");
    }
  }

  async function sendBroadcast() {
    if (!selected.size) {
      showToast("Select at least one lead");
      return;
    }
    if (!settings.whatsappConnected) {
      showToast("Connect a WhatsApp number first");
      return;
    }
    setBroadcastStatus("sending");
    const r = await fetch("/api/whatsapp/broadcast", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        leadIds: Array.from(selected),
        text: broadcastText,
      }),
    });
    setBroadcastStatus("");
    if (r.ok) {
      const d = await r.json();
      showToast(`WhatsApp sent to ${d.sent} lead${d.sent === 1 ? "" : "s"}`);
      setSelected(new Set());
    } else {
      showToast("Broadcast failed");
    }
  }

  async function createAdmin() {
    setAdminErr("");
    if (!adminForm.name || !adminForm.email || !adminForm.password) {
      setAdminErr("All fields required");
      return;
    }
    const r = await fetch("/api/partner/users", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...adminForm, role: "admin" }),
    });
    if (!r.ok) {
      const d = await r.json().catch(() => ({}));
      setAdminErr(d.error === "exists" ? "Email already exists" : "Failed");
      return;
    }
    const d = await r.json();
    setAdmins((prev) => [
      ...prev,
      {
        id: d.user.id,
        name: d.user.name,
        email: d.user.email,
        role: d.user.role,
      },
    ]);
    setAdminForm({ name: "", email: "", password: "" });
    showToast("New admin created");
  }

  async function generatePaymentLink(lead: Lead, share: "copy" | "whatsapp") {
    setPaymentLinkBusy(lead.id);
    const r = await fetch("/api/payment-links", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        leadId: lead.id,
        purpose: "consultation",
        amountInr: 1000,
        description: `${provider.name} consultation — ${lead.interest}`,
      }),
    });
    setPaymentLinkBusy("");
    if (!r.ok) {
      showToast("Could not generate link");
      return;
    }
    const { paymentLink } = await r.json();
    const origin =
      typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/pay-link/${paymentLink.token}`;
    if (share === "copy") {
      try {
        await navigator.clipboard.writeText(url);
        setCopyNotice(lead.id);
        setTimeout(() => setCopyNotice(""), 1800);
      } catch {
        window.prompt("Copy payment link", url);
      }
      showToast("Payment link copied");
    } else {
      const digits = lead.phone.replace(/\D+/g, "");
      const msg = encodeURIComponent(
        `Hi ${lead.name.split(" ")[0]}, here's your secure payment link for ${provider.name}: ${url}`
      );
      window.open(
        `https://wa.me/${digits}?text=${msg}`,
        "_blank",
        "noopener,noreferrer"
      );
      showToast("Opening WhatsApp…");
    }
    // Refresh lead status (payment link API moves it to agreed_to_purchase)
    refreshLeads();
  }

  function whatsappCall(lead: Lead) {
    const digits = lead.phone.replace(/\D+/g, "");
    if (!digits) {
      showToast("Lead has no phone number");
      return;
    }
    window.open(
      `https://wa.me/${digits}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  const selectedLeads = useMemo(
    () => leads.filter((l) => selected.has(l.id)),
    [leads, selected]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <ProviderLogo provider={provider} size={52} showName={false} />
          <div>
            <p className="label">CRM</p>
            <h1 className="text-2xl font-semibold">{provider.name} workspace</h1>
            <p className="text-sm text-slate-500">
              {leads.length} lead{leads.length === 1 ? "" : "s"} ·{" "}
              {admins.length} admin{admins.length === 1 ? "" : "s"} ·{" "}
              {settings.whatsappConnected ? (
                <span className="text-emerald-600">WhatsApp connected</span>
              ) : (
                <span className="text-amber-600">WhatsApp not connected</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* WhatsApp connection + Admin creation + Add lead row */}
      <div className="grid lg:grid-cols-3 gap-4">
        <WhatsAppCard
          settings={settings}
          onSave={saveSettings}
        />
        <AdminCard
          admins={admins}
          form={adminForm}
          setForm={setAdminForm}
          err={adminErr}
          onCreate={createAdmin}
        />
        <AddLeadCard
          form={addForm}
          setForm={setAddForm}
          onAdd={addLead}
          onUpload={() => fileRef.current?.click()}
        />
        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={onFile}
        />
      </div>

      {/* Broadcast */}
      <div className="card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="label">Bulk WhatsApp</p>
            <h2 className="font-semibold">
              Message {selected.size > 0 ? selected.size : "the selected"} lead
              {selected.size === 1 ? "" : "s"}
            </h2>
          </div>
          {selected.size > 0 && (
            <button
              className="text-xs underline text-slate-500"
              onClick={() => setSelected(new Set())}
            >
              Clear selection
            </button>
          )}
        </div>
        <textarea
          className="input mt-3 min-h-[90px]"
          value={broadcastText}
          onChange={(e) => setBroadcastText(e.target.value)}
          placeholder="Use {first} to personalise with the lead's first name"
        />
        <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
          <p className="text-xs text-slate-500">
            Messages are sent via your connected WhatsApp Business number.
          </p>
          <button
            className="btn-primary"
            disabled={
              !selected.size ||
              !broadcastText.trim() ||
              broadcastStatus === "sending" ||
              !settings.whatsappConnected
            }
            onClick={sendBroadcast}
          >
            {broadcastStatus === "sending"
              ? "Sending…"
              : `Send WhatsApp to ${selected.size || 0}`}
          </button>
        </div>
      </div>

      {/* Leads table */}
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr>
              <th className="px-3 py-2 text-left w-8">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  aria-label="Select all"
                />
              </th>
              {[
                "Name",
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
            {leads.map((l) => (
              <tr key={l.id} className="border-t border-slate-100">
                <td className="px-3 py-2">
                  <input
                    type="checkbox"
                    checked={selected.has(l.id)}
                    onChange={() => toggleOne(l.id)}
                    aria-label={`Select ${l.name}`}
                  />
                </td>
                <td className="px-3 py-2">
                  <div className="font-medium">{l.name}</div>
                  <div className="text-xs text-slate-500">
                    {new Date(l.createdAt).toLocaleString()}
                  </div>
                </td>
                <td className="px-3 py-2">
                  <div className="font-mono text-xs">{l.phone}</div>
                  {l.email && (
                    <div className="text-xs text-slate-500">{l.email}</div>
                  )}
                </td>
                <td className="px-3 py-2">{l.interest}</td>
                <td className="px-3 py-2 text-xs text-slate-500">
                  {l.source}
                </td>
                <td className="px-3 py-2">
                  <select
                    className={`input text-xs py-1 ${STATUS_COLORS[l.status]}`}
                    value={l.status}
                    onChange={(e) =>
                      updateStatus(l.id, e.target.value as LeadStatus)
                    }
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-1">
                    <IconButton
                      title="WhatsApp call"
                      onClick={() => whatsappCall(l)}
                    >
                      <PhoneIcon />
                    </IconButton>
                    <IconButton
                      title="Generate & copy payment link"
                      onClick={() => generatePaymentLink(l, "copy")}
                      busy={paymentLinkBusy === l.id}
                    >
                      {copyNotice === l.id ? (
                        <CheckIcon />
                      ) : (
                        <LinkIcon />
                      )}
                    </IconButton>
                    <IconButton
                      title="Send payment link on WhatsApp"
                      onClick={() => generatePaymentLink(l, "whatsapp")}
                      busy={paymentLinkBusy === l.id}
                    >
                      <SendIcon />
                    </IconButton>
                  </div>
                </td>
              </tr>
            ))}
            {leads.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-3 py-10 text-center text-slate-400 text-sm"
                >
                  No leads yet — add one above or upload a CSV.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-lg bg-still-900 text-white px-4 py-2 text-sm shadow-brand">
          {toast}
        </div>
      )}
    </div>
  );
}

function WhatsAppCard({
  settings,
  onSave,
}: {
  settings: ProviderSetting;
  onSave: (s: Partial<ProviderSetting>) => void;
}) {
  const [number, setNumber] = useState(settings.whatsappNumber ?? "");
  const [businessId, setBusinessId] = useState(
    settings.whatsappBusinessId ?? ""
  );

  const connected = settings.whatsappConnected;

  return (
    <div className="card p-5">
      <p className="label">WhatsApp</p>
      <h2 className="font-semibold mt-1">Connect WhatsApp number</h2>
      <p className="text-xs text-slate-500 mt-1">
        Link your WhatsApp Business number so the CRM can send messages and
        calls on your behalf.
      </p>
      <div className="mt-3 space-y-2">
        <input
          className="input"
          placeholder="+91 98xxxxxxxx"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
        />
        <input
          className="input"
          placeholder="WhatsApp Business ID (optional)"
          value={businessId}
          onChange={(e) => setBusinessId(e.target.value)}
        />
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <span
          className={`badge ${
            connected
              ? "bg-emerald-100 text-emerald-800"
              : "bg-amber-100 text-amber-800"
          }`}
        >
          {connected ? "● Connected" : "○ Not connected"}
        </span>
        {connected ? (
          <button
            className="btn-ghost"
            onClick={() =>
              onSave({
                whatsappNumber: number,
                whatsappBusinessId: businessId,
                whatsappConnected: false,
              })
            }
          >
            Disconnect
          </button>
        ) : (
          <button
            className="btn-primary"
            disabled={!number.trim()}
            onClick={() =>
              onSave({
                whatsappNumber: number,
                whatsappBusinessId: businessId,
                whatsappConnected: true,
              })
            }
          >
            Connect
          </button>
        )}
      </div>
    </div>
  );
}

function AdminCard({
  admins,
  form,
  setForm,
  err,
  onCreate,
}: {
  admins: AdminUser[];
  form: { name: string; email: string; password: string };
  setForm: (f: { name: string; email: string; password: string }) => void;
  err: string;
  onCreate: () => void;
}) {
  return (
    <div className="card p-5">
      <p className="label">Admins</p>
      <h2 className="font-semibold mt-1">Create another admin</h2>
      <p className="text-xs text-slate-500 mt-1">
        Give a teammate their own CRM login.
      </p>
      <div className="mt-3 space-y-2">
        <input
          className="input"
          placeholder="Full name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          className="input"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          className="input"
          type="password"
          placeholder="Temp password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
      </div>
      {err && <div className="text-xs text-rose-600 mt-2">{err}</div>}
      <button className="btn-primary w-full mt-3" onClick={onCreate}>
        Create admin
      </button>
      <ul className="mt-3 text-xs text-slate-600 space-y-1 max-h-24 overflow-y-auto">
        {admins.map((a) => (
          <li key={a.id} className="flex items-center justify-between">
            <span>
              <span className="font-medium text-slate-800">{a.name}</span>{" "}
              <span className="text-slate-400">· {a.role}</span>
            </span>
            <span className="font-mono text-[10px] text-slate-400">
              {a.email}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AddLeadCard({
  form,
  setForm,
  onAdd,
  onUpload,
}: {
  form: { name: string; phone: string; email: string; interest: string };
  setForm: (f: {
    name: string;
    phone: string;
    email: string;
    interest: string;
  }) => void;
  onAdd: () => void;
  onUpload: () => void;
}) {
  return (
    <div className="card p-5">
      <p className="label">Leads</p>
      <h2 className="font-semibold mt-1">Add or upload leads</h2>
      <p className="text-xs text-slate-500 mt-1">
        Upload a CSV of existing customers or add one manually.
      </p>
      <div className="mt-3 space-y-2">
        <input
          className="input"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          className="input"
          placeholder="Phone (+91…)"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            className="input"
            placeholder="Email (opt.)"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            className="input"
            placeholder="Interest"
            value={form.interest}
            onChange={(e) => setForm({ ...form, interest: e.target.value })}
          />
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <button className="btn-primary flex-1" onClick={onAdd}>
          Add lead
        </button>
        <button className="btn-ghost" onClick={onUpload}>
          Upload CSV
        </button>
      </div>
      <p className="mt-2 text-[11px] text-slate-400">
        CSV headers: name, phone, email, interest, preferredMode, notes.
      </p>
    </div>
  );
}

function IconButton({
  children,
  title,
  onClick,
  busy,
}: {
  children: React.ReactNode;
  title: string;
  onClick: () => void;
  busy?: boolean;
}) {
  return (
    <button
      className="h-8 w-8 inline-grid place-items-center rounded-md border border-slate-200 text-slate-600 hover:bg-still-50 hover:text-still-800 hover:border-still-300 transition disabled:opacity-50"
      title={title}
      aria-label={title}
      onClick={onClick}
      disabled={busy}
    >
      {children}
    </button>
  );
}

function PhoneIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.72 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5" />
      <path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 text-emerald-600"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M22 2 11 13" />
      <path d="M22 2 15 22l-4-9-9-4 20-7z" />
    </svg>
  );
}

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (!lines.length) return [];
  const headers = splitLine(lines[0]).map((h) =>
    h.trim().toLowerCase().replace(/\s+/g, "")
  );
  return lines.slice(1).map((line) => {
    const cells = splitLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = (cells[i] ?? "").trim();
    });
    return row;
  });
}

function splitLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQ) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') {
        inQ = false;
      } else {
        cur += ch;
      }
    } else {
      if (ch === ",") {
        out.push(cur);
        cur = "";
      } else if (ch === '"') {
        inQ = true;
      } else {
        cur += ch;
      }
    }
  }
  out.push(cur);
  return out;
}
