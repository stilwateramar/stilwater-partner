"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Provider {
  id: string;
  name: string;
  color: string;
  tagline: string;
}

const CAMPAIGNS: Record<string, { headline: string; body: string; campaign: string; interest: string }[]> = {
  sharan: [
    {
      headline: "Reverse type-2 diabetes in 21 days",
      body: "Plant-based protocol by Dr. Nandita Shah. Fasting sugar drops for 80% of participants.",
      campaign: "diabetes_21d_q2",
      interest: "Diabetes reversal",
    },
    {
      headline: "Sleep better without pills",
      body: "Lifestyle coaching and nutrition — measurable in 2 weeks.",
      campaign: "sleep_lifestyle_q2",
      interest: "Sleep & stress",
    },
  ],
  "amar-eye-yoga": [
    {
      headline: "Reduce screen fatigue, naturally",
      body: "15-min daily eye-yoga routine approved by ophthalmologists.",
      campaign: "screen_fatigue_q2",
      interest: "Digital eye strain",
    },
    {
      headline: "Kids' myopia management",
      body: "Evidence-based eye-yoga for children aged 7-14.",
      campaign: "pediatric_myopia_q2",
      interest: "Pediatric eye yoga",
    },
  ],
};

export default function AdSimulator() {
  const router = useRouter();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [providerId, setProviderId] = useState<string>("sharan");
  const [adIdx, setAdIdx] = useState(0);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    preferredMode: "whatsapp",
  });
  const [sending, setSending] = useState(false);
  const [createdLeadId, setCreatedLeadId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/providers")
      .then((r) => r.json())
      .then((d) => setProviders(d.providers));
  }, []);

  const ad = CAMPAIGNS[providerId][adIdx];
  const provider = providers.find((p) => p.id === providerId);

  async function submit() {
    setSending(true);
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        phone: form.phone,
        email: form.email,
        providerId,
        source: "instagram_ad",
        campaign: ad.campaign,
        interest: ad.interest,
        preferredMode: form.preferredMode,
      }),
    });
    const data = await res.json();
    setSending(false);
    setCreatedLeadId(data.lead.id);
    setTimeout(() => router.push(`/whatsapp/${data.lead.id}`), 1200);
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div>
        <p className="label mb-2">Step 1 · Meta / Instagram ad</p>
        <h1 className="text-2xl font-semibold">Ad simulator</h1>
        <p className="mt-2 text-sm text-slate-600">
          Pick a provider and creative. When you submit the lead form, the Stilwater
          WhatsApp AI agent will greet the lead automatically.
        </p>
        <div className="mt-5 flex gap-2 flex-wrap">
          {providers.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setProviderId(p.id);
                setAdIdx(0);
              }}
              className={`btn ${
                providerId === p.id ? "btn-primary" : "btn-ghost"
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>

        <div className="mt-4 card overflow-hidden">
          <div
            className="h-40 relative"
            style={{
              background: `linear-gradient(135deg, ${
                provider?.color ?? "#555"
              } 0%, #111 100%)`,
            }}
          >
            <div className="absolute inset-0 p-5 text-white flex flex-col justify-between">
              <div className="text-xs uppercase tracking-wider opacity-80">
                Sponsored · {provider?.name}
              </div>
              <div>
                <div className="text-lg font-semibold">{ad.headline}</div>
                <div className="text-sm opacity-90">{ad.body}</div>
              </div>
            </div>
          </div>
          <div className="p-4 flex items-center justify-between">
            <button
              className="text-sm text-slate-500"
              onClick={() =>
                setAdIdx(
                  (adIdx + 1) % CAMPAIGNS[providerId].length
                )
              }
            >
              ↻ Try another creative
            </button>
            <div className="text-xs text-slate-400">
              campaign: {ad.campaign}
            </div>
          </div>
        </div>
      </div>

      <div className="card p-5">
        <p className="label mb-2">Step 2 · Interested lead</p>
        <h2 className="font-semibold">Tell us how to reach you</h2>
        <p className="text-sm text-slate-500 mt-1">
          This mimics the Meta lead-form. The entry lands in Stilwater's lead
          sheet and triggers the WhatsApp AI agent.
        </p>
        <div className="mt-4 space-y-3">
          <div>
            <div className="label">Name</div>
            <input
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <div className="label">Phone (with country code)</div>
            <input
              className="input"
              placeholder="+91 98xxxxxxxx"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
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
          <div>
            <div className="label">Preferred contact</div>
            <select
              className="input"
              value={form.preferredMode}
              onChange={(e) =>
                setForm({ ...form, preferredMode: e.target.value })
              }
            >
              <option value="whatsapp">WhatsApp</option>
              <option value="call">Phone call</option>
              <option value="email">Email</option>
            </select>
          </div>
          <button
            className="btn-primary w-full"
            disabled={!form.name || !form.phone || sending}
            onClick={submit}
          >
            {sending ? "Submitting…" : "I'm interested →"}
          </button>
          {createdLeadId && (
            <div className="mt-2 text-sm text-emerald-700">
              ✓ Lead saved. Opening WhatsApp conversation…
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
