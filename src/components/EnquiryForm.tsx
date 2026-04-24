"use client";

import { useState } from "react";

const INTERESTS = [
  "Diabetes reversal",
  "Hypertension",
  "Eye health",
  "Weight management",
  "Sleep & stress",
  "General wellness",
];

export default function EnquiryForm() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    interest: INTERESTS[0],
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">(
    "idle"
  );
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      setError("Please share your name and phone.");
      return;
    }
    setStatus("sending");
    setError("");
    const r = await fetch("/api/enquiries", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!r.ok) {
      setStatus("error");
      setError("Something went wrong. Please try again.");
      return;
    }
    setStatus("done");
    setForm({
      name: "",
      phone: "",
      email: "",
      interest: INTERESTS[0],
      message: "",
    });
  }

  if (status === "done") {
    return (
      <div className="card p-8 text-center">
        <div className="font-serif text-2xl text-still-800">Thank you.</div>
        <p className="mt-2 text-slate-600">
          A Stillwater care guide will reach out to you shortly.
        </p>
        <button
          className="btn-ghost mt-5"
          onClick={() => setStatus("idle")}
        >
          Send another enquiry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card p-6 md:p-8 space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="label">Your name</label>
          <input
            className="input mt-1"
            placeholder="Full name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Phone / WhatsApp</label>
          <input
            className="input mt-1"
            placeholder="+91 98xxxxxxxx"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="label">Email (optional)</label>
          <input
            className="input mt-1"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div>
          <label className="label">I'm curious about</label>
          <select
            className="input mt-1"
            value={form.interest}
            onChange={(e) => setForm({ ...form, interest: e.target.value })}
          >
            {INTERESTS.map((i) => (
              <option key={i}>{i}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="label">Tell us a little about yourself</label>
        <textarea
          className="input mt-1 min-h-[110px]"
          placeholder="What are you hoping to heal or improve?"
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
        />
      </div>
      {error && (
        <div className="text-sm text-rose-600">{error}</div>
      )}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-xs text-slate-500">
          By submitting you agree to be contacted by a Stillwater guide.
        </p>
        <button
          type="submit"
          className="btn-primary"
          disabled={status === "sending"}
        >
          {status === "sending" ? "Sending…" : "Send enquiry"}
        </button>
      </div>
    </form>
  );
}
