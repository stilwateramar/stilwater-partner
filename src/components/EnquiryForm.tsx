"use client";

import { useState } from "react";

const INTERESTS = [
  "Diabetes reversal",
  "Hypertension",
  "Weight management",
  "Eye health",
  "Meditation & stress",
  "Ayurveda",
  "General enquiry",
];

export default function EnquiryForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    interest: INTERESTS[0],
    message: "",
  });
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");

  async function submit() {
    setErr("");
    if (!form.name || !form.phone) {
      setErr("Please share at least your name and phone.");
      return;
    }
    setBusy(true);
    const r = await fetch("/api/enquiries", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    });
    setBusy(false);
    if (!r.ok) {
      setErr("Something went wrong. Please try again.");
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="card p-6 bg-white">
        <div className="text-3xl">🙏</div>
        <h3 className="mt-2 font-serif text-2xl text-still-900">
          Thank you, {form.name.split(" ")[0]}.
        </h3>
        <p className="mt-2 text-sm text-slate-600">
          One of our care guides will reach out on WhatsApp at{" "}
          <span className="font-medium">{form.phone}</span> within a day.
        </p>
      </div>
    );
  }

  return (
    <div className="card p-6 bg-white">
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <div className="label">Your name</div>
          <input
            className="input"
            placeholder="Full name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div>
          <div className="label">Phone (WhatsApp)</div>
          <input
            className="input"
            placeholder="+91 9000000001"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>
        <div>
          <div className="label">Email (optional)</div>
          <input
            className="input"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div className="sm:col-span-2">
          <div className="label">I'm interested in</div>
          <select
            className="input"
            value={form.interest}
            onChange={(e) => setForm({ ...form, interest: e.target.value })}
          >
            {INTERESTS.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <div className="label">Tell us briefly</div>
          <textarea
            className="input min-h-[90px]"
            placeholder="Your current condition, goals, questions…"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
          />
        </div>
      </div>
      {err && <div className="mt-2 text-sm text-red-600">{err}</div>}
      <button
        className="btn-primary mt-4 w-full"
        disabled={busy}
        onClick={submit}
      >
        {busy ? "Sending…" : "Submit enquiry"}
      </button>
      <p className="mt-3 text-[11px] text-slate-500">
        By submitting, you agree to be contacted on WhatsApp and email by the
        Stillwater team. No spam, no third-party sharing.
      </p>
    </div>
  );
}
