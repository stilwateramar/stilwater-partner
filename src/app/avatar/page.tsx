"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

interface QA {
  q: string;
  a?: string;
}

const QUESTIONS: QA[] = [
  { q: "Hi! I'm Maya, your AI consultation avatar. What's your main concern today?" },
  { q: "How long has this been going on?" },
  { q: "Anything you've already tried — medicines, lifestyle changes, exercises?" },
  { q: "On a scale of 1-10, how much is this affecting your daily life?" },
];

function AvatarInner() {
  const router = useRouter();
  const params = useSearchParams();
  const providerId = params.get("provider") ?? "sharan";
  const leadIdParam = params.get("leadId") ?? "";

  const [step, setStep] = useState(-1); // -1 = intro / consent
  const [qa, setQa] = useState<QA[]>(QUESTIONS);
  const [input, setInput] = useState("");
  const [form, setForm] = useState({ name: "", phone: "" });
  const [provider, setProvider] = useState<any>(null);
  const [done, setDone] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const box = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetch("/api/providers")
      .then((r) => r.json())
      .then((d) => setProvider(d.providers.find((p: any) => p.id === providerId)));
  }, [providerId]);

  useEffect(() => {
    box.current?.scrollTo({ top: box.current.scrollHeight });
  }, [qa, step]);

  function submitAnswer() {
    if (!input.trim()) return;
    const next = [...qa];
    next[step].a = input.trim();
    setQa(next);
    setInput("");
    if (step + 1 >= QUESTIONS.length) {
      finalize(next);
    } else {
      setStep(step + 1);
    }
  }

  async function finalize(all: QA[]) {
    setFinishing(true);
    let leadId = leadIdParam;
    if (!leadId) {
      const r = await fetch("/api/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: form.name || "AI avatar user",
          phone: form.phone || "+91 00000 00000",
          providerId,
          source: "ai_avatar",
          interest: all[0]?.a ?? "AI avatar consult",
          preferredMode: "whatsapp",
        }),
      }).then((r) => r.json());
      leadId = r.lead.id;
    }

    const slot = new Date(Date.now() + 2 * 60 * 1000).toISOString();
    const c = await fetch("/api/consultations", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        leadId,
        providerId,
        type: "ai_avatar",
        slot,
      }),
    }).then((r) => r.json());

    // Seed transcript from the avatar Q&A
    await fetch(`/api/consultations/${c.consultation.id}/transcript`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        source: "ai_avatar",
        turns: all.flatMap((p) => [
          { speaker: "doctor", text: p.q, t: new Date().toISOString() },
          p.a
            ? { speaker: "patient", text: p.a, t: new Date().toISOString() }
            : null,
        ]).filter(Boolean),
      }),
    });

    setDone(true);
    setFinishing(false);
    setTimeout(() => router.push(`/consultation/${c.consultation.id}`), 1500);
  }

  return (
    <div className="grid md:grid-cols-[1fr_340px] gap-6">
      <div className="card p-5">
        <div className="flex items-center gap-3">
          <div className="h-14 w-14 rounded-full bg-gradient-to-br from-still-400 to-still-700 grid place-items-center text-white font-bold text-xl">
            M
          </div>
          <div>
            <div className="font-semibold">Maya · AI avatar</div>
            <div className="text-xs text-slate-500">
              {provider?.name} · powered by Stilwater
            </div>
          </div>
          <span className="ml-auto badge bg-emerald-100 text-emerald-700">
            ● live
          </span>
        </div>

        <div
          ref={box}
          className="mt-4 h-[400px] overflow-y-auto space-y-3 rounded-xl bg-slate-50 p-3"
        >
          {step === -1 && (
            <>
              <Bubble
                from="avatar"
                text={`Hi! I'm Maya, the AI avatar for ${
                  provider?.name ?? "Stilwater"
                }. I'll take your history and suggest whether a doctor consultation is needed. The session is recorded and reviewed by a human clinician.`}
              />
            </>
          )}
          {qa.slice(0, step + 1).map((p, i) => (
            <div key={i} className="space-y-2">
              <Bubble from="avatar" text={p.q} />
              {p.a && <Bubble from="user" text={p.a} />}
            </div>
          ))}
          {finishing && (
            <div className="text-xs text-slate-500">
              Summarising and generating follow-ups…
            </div>
          )}
          {done && (
            <div className="text-sm text-emerald-700 font-medium">
              ✓ Session complete. Opening your consultation room…
            </div>
          )}
        </div>

        {step === -1 && (
          <div className="mt-3 space-y-2">
            {!leadIdParam && (
              <div className="grid grid-cols-2 gap-2">
                <input
                  className="input"
                  placeholder="Your name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                <input
                  className="input"
                  placeholder="Phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
            )}
            <button className="btn-primary w-full" onClick={() => setStep(0)}>
              Start consultation
            </button>
          </div>
        )}

        {step >= 0 && !done && !finishing && (
          <div className="mt-3 flex gap-2">
            <input
              className="input flex-1"
              placeholder="Type your answer…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitAnswer()}
            />
            <button className="btn-primary" onClick={submitAnswer}>
              Send
            </button>
          </div>
        )}
      </div>

      <aside className="card p-5 h-max text-sm">
        <div className="label">About the AI avatar</div>
        <p className="mt-2 text-slate-600">
          Maya gathers history, flags red-flag symptoms, explains programs and
          books you with a human doctor if needed. Free for all Stilwater
          leads.
        </p>
        <ul className="mt-4 space-y-2 text-slate-700 list-disc list-inside">
          <li>Recorded &amp; transcribed</li>
          <li>Reviewed by a clinician within 24h</li>
          <li>Clear next-step plan</li>
        </ul>
      </aside>
    </div>
  );
}

function Bubble({ from, text }: { from: "avatar" | "user"; text: string }) {
  return (
    <div className={`flex ${from === "user" ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
          from === "user" ? "bg-still-600 text-white" : "bg-white border border-slate-200"
        }`}
      >
        {text}
      </div>
    </div>
  );
}

export default function AvatarPage() {
  return (
    <Suspense fallback={<div>Loading…</div>}>
      <AvatarInner />
    </Suspense>
  );
}
