"use client";

import { useState } from "react";
import type { HealerAvatar } from "@/lib/types";

export default function FeedbackForm({ avatars }: { avatars: HealerAvatar[] }) {
  const [form, setForm] = useState({
    avatarId: avatars[0]?.id ?? "",
    name: "",
    email: "",
    rating: 5,
    comments: "",
  });
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");

  async function submit() {
    setErr("");
    if (!form.name || !form.comments) {
      setErr("Please share your name and a few words of feedback.");
      return;
    }
    setBusy(true);
    const r = await fetch("/api/feedback", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    });
    setBusy(false);
    if (!r.ok) {
      setErr("Could not submit feedback. Please try again.");
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="card p-6 bg-white">
        <div className="text-3xl">💚</div>
        <h3 className="mt-2 font-serif text-2xl text-still-900">
          Thank you, {form.name.split(" ")[0]}.
        </h3>
        <p className="mt-2 text-sm text-slate-600">
          Your thoughts have been shared with our healer team. We read every
          single message.
        </p>
      </div>
    );
  }

  return (
    <div className="card p-6 bg-white">
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <div className="label">Which avatar did you try?</div>
          <select
            className="input"
            value={form.avatarId}
            onChange={(e) => setForm({ ...form, avatarId: e.target.value })}
          >
            {avatars.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} — {a.specialty.split("·")[0].trim()}
              </option>
            ))}
          </select>
        </div>
        <div>
          <div className="label">Your name</div>
          <input
            className="input"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div>
          <div className="label">Email (optional)</div>
          <input
            className="input"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div className="sm:col-span-2">
          <div className="label">Rating</div>
          <div className="mt-1 flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setForm({ ...form, rating: n })}
                className={`h-10 w-10 rounded-full text-lg transition ${
                  form.rating >= n
                    ? "bg-still-600 text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
                aria-label={`${n} star`}
              >
                ★
              </button>
            ))}
          </div>
        </div>
        <div className="sm:col-span-2">
          <div className="label">Your feedback</div>
          <textarea
            className="input min-h-[120px]"
            placeholder="What felt authentic? What felt off? What should we add?"
            value={form.comments}
            onChange={(e) => setForm({ ...form, comments: e.target.value })}
          />
        </div>
      </div>
      {err && <div className="mt-2 text-sm text-red-600">{err}</div>}
      <button
        className="btn-primary mt-4 w-full"
        onClick={submit}
        disabled={busy}
      >
        {busy ? "Sending…" : "Submit feedback"}
      </button>
    </div>
  );
}
