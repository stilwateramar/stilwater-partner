"use client";

import { useState } from "react";

export default function RaiseRequestPanel() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");

  async function submit() {
    setErr("");
    if (!subject.trim() || !message.trim()) {
      setErr("Please add a subject and a message.");
      return;
    }
    setBusy(true);
    const r = await fetch("/api/patient/requests", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ subject, message }),
    });
    setBusy(false);
    if (!r.ok) {
      setErr("Could not send. Please try again.");
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
        <div className="font-semibold text-emerald-800">Request sent ✓</div>
        <p className="text-sm text-emerald-700 mt-1">
          Your partner admins have been notified over email and WhatsApp.
        </p>
        <button
          className="mt-3 text-xs underline text-emerald-800"
          onClick={() => {
            setSent(false);
            setSubject("");
            setMessage("");
          }}
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <input
        className="input"
        placeholder="Subject (e.g. Can I switch my dinner?)"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
      />
      <textarea
        className="input min-h-[110px]"
        placeholder="Explain your request…"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      {err && <div className="text-sm text-red-600">{err}</div>}
      <button
        className="btn-primary"
        onClick={submit}
        disabled={busy}
      >
        {busy ? "Sending…" : "Send request"}
      </button>
    </div>
  );
}
