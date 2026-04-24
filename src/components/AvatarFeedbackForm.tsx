"use client";

import { useState } from "react";

interface AvatarOption {
  id: string;
  name: string;
}

export default function AvatarFeedbackForm({
  avatars,
}: {
  avatars: AvatarOption[];
}) {
  const [form, setForm] = useState({
    avatarId: avatars[0]?.id ?? "",
    name: "",
    email: "",
    rating: 5,
    comments: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">(
    "idle"
  );
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Please share your name.");
      return;
    }
    setStatus("sending");
    setError("");
    const r = await fetch("/api/avatar-feedback", {
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
      avatarId: avatars[0]?.id ?? "",
      name: "",
      email: "",
      rating: 5,
      comments: "",
    });
  }

  if (status === "done") {
    return (
      <div className="card p-8 text-center">
        <div className="font-serif text-2xl text-still-800">
          Thank you for sharing.
        </div>
        <p className="mt-2 text-slate-600">
          Your feedback goes straight to the team building these avatars.
        </p>
        <button
          className="btn-ghost mt-5"
          onClick={() => setStatus("idle")}
        >
          Leave more feedback
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card p-6 md:p-8 space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="label">Which avatar did you meet?</label>
          <select
            className="input mt-1"
            value={form.avatarId}
            onChange={(e) => setForm({ ...form, avatarId: e.target.value })}
          >
            {avatars.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Your name</label>
          <input
            className="input mt-1"
            placeholder="Full name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
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
          <label className="label">How did it feel? (1–5)</label>
          <div className="mt-1 flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                type="button"
                key={n}
                onClick={() => setForm({ ...form, rating: n })}
                className={`h-9 w-9 rounded-full border text-sm font-medium transition ${
                  form.rating >= n
                    ? "bg-still-600 border-still-600 text-white"
                    : "border-slate-300 text-slate-600 hover:border-still-400"
                }`}
                aria-label={`Rate ${n}`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div>
        <label className="label">Your thoughts</label>
        <textarea
          className="input mt-1 min-h-[120px]"
          placeholder="What worked? What felt off? Anything you wish the avatar could do?"
          value={form.comments}
          onChange={(e) => setForm({ ...form, comments: e.target.value })}
        />
      </div>
      {error && <div className="text-sm text-rose-600">{error}</div>}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-xs text-slate-500">
          Feedback is read by a real human before anything else.
        </p>
        <button
          type="submit"
          className="btn-primary"
          disabled={status === "sending"}
        >
          {status === "sending" ? "Sending…" : "Send feedback"}
        </button>
      </div>
    </form>
  );
}
