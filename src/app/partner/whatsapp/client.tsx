"use client";

import { useState } from "react";

export default function WhatsAppClient({
  initialNumber,
  providerName,
}: {
  initialNumber: string;
  providerName: string;
}) {
  const [number, setNumber] = useState(initialNumber);
  const [busy, setBusy] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [err, setErr] = useState("");

  const connected = !!number;

  async function save() {
    setErr("");
    setBusy(true);
    const r = await fetch("/api/partner/whatsapp", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ number }),
    });
    setBusy(false);
    if (!r.ok) {
      setErr("Could not save the WhatsApp number.");
      return;
    }
    setSavedAt(new Date().toLocaleTimeString());
  }

  async function disconnect() {
    if (!confirm("Disconnect the WhatsApp Business number from this CRM?"))
      return;
    setBusy(true);
    await fetch("/api/partner/whatsapp", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ number: "" }),
    });
    setNumber("");
    setBusy(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="label">WhatsApp connection</p>
        <h1 className="text-2xl font-semibold">Connect your WhatsApp number</h1>
        <p className="text-sm text-slate-500">
          All outbound messages, bulk broadcasts and calls from {providerName}'s
          CRM will originate from this WhatsApp Business number.
        </p>
      </div>

      <div className="card p-6 max-w-xl">
        <div className="flex items-center gap-3">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              connected ? "bg-emerald-500" : "bg-slate-300"
            }`}
          />
          <span className="text-sm font-medium">
            {connected ? "Connected" : "Not connected"}
          </span>
          {savedAt && (
            <span className="text-xs text-slate-500">saved at {savedAt}</span>
          )}
        </div>
        <div className="mt-4">
          <div className="label">WhatsApp Business number</div>
          <input
            className="input"
            placeholder="+91 98000 12345"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
          />
          <p className="mt-2 text-xs text-slate-500">
            Use the full international format. We'll link this number to your
            Meta Business account in production.
          </p>
        </div>
        {err && <div className="mt-2 text-sm text-red-600">{err}</div>}
        <div className="mt-4 flex gap-2">
          <button className="btn-primary" onClick={save} disabled={busy}>
            {busy ? "Saving…" : connected ? "Update number" : "Connect"}
          </button>
          {connected && (
            <button
              className="btn-ghost text-red-600"
              onClick={disconnect}
              disabled={busy}
            >
              Disconnect
            </button>
          )}
        </div>
      </div>

      <div className="card p-6 max-w-xl">
        <h2 className="font-semibold">What the connection unlocks</h2>
        <ul className="mt-3 space-y-2 text-sm text-slate-700">
          <li>✓ Bulk WhatsApp messages to selected leads</li>
          <li>✓ One-click payment link sharing over WhatsApp</li>
          <li>✓ WhatsApp voice calls launched directly from the lead row</li>
          <li>✓ Thread history archived for audit</li>
        </ul>
      </div>
    </div>
  );
}
