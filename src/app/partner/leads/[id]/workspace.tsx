"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LANGUAGES } from "@/lib/languages";

type Props = {
  initial: {
    lead: any;
    provider: any;
    programs: any[];
    calls: any[];
    links: any[];
    messages: any[];
    userId: string;
  };
};

export default function LeadWorkspace({ initial }: Props) {
  const [lead, setLead] = useState(initial.lead);
  const [calls, setCalls] = useState(initial.calls);
  const [links, setLinks] = useState(initial.links);
  const [messages, setMessages] = useState(initial.messages);
  const programs = initial.programs;
  const provider = initial.provider;

  // Call panel state
  const [mode, setMode] = useState<"human" | "ai">("human");
  const [language, setLanguage] = useState("en");
  const [programId, setProgramId] = useState<string>(programs[0]?.id ?? "");
  const [notes, setNotes] = useState("");
  const [outcome, setOutcome] = useState<"answered" | "not_answered" | "callback" | "agreed_to_purchase" | "not_interested">("answered");
  const [inCall, setInCall] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [aiTranscript, setAiTranscript] = useState<{speaker:string;text:string}[] | null>(null);
  const timer = useRef<any>(null);
  const [busy, setBusy] = useState(false);

  async function refresh() {
    const r = await fetch(`/api/leads/${lead.id}`).then((r) => r.json());
    setLead(r.lead);
    const c = await fetch(`/api/calls?leadId=${lead.id}`).then((r) => r.json());
    setCalls(c.calls);
    const l = await fetch(`/api/payment-links?leadId=${lead.id}`).then((r) => r.json());
    setLinks(l.paymentLinks);
    const m = await fetch(`/api/chat?leadId=${lead.id}`).then((r) => r.json());
    setMessages(m.messages);
  }

  function startHuman() {
    setInCall(true);
    setElapsed(0);
    setAiTranscript(null);
    timer.current = setInterval(() => setElapsed((e) => e + 1), 1000);
  }

  async function endHuman() {
    clearInterval(timer.current);
    setInCall(false);
    setBusy(true);
    await fetch("/api/calls", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        leadId: lead.id,
        mode: "human",
        language,
        durationSec: elapsed,
        outcome,
        notes,
      }),
    });
    setNotes("");
    setOutcome("answered");
    await refresh();
    setBusy(false);
  }

  async function runAiCall() {
    setBusy(true);
    setInCall(true);
    setAiTranscript([]);
    const r = await fetch("/api/ai-calls", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ leadId: lead.id, language, programId }),
    }).then((r) => r.json());

    // animate transcript appearance
    const all = r.call.aiTranscript as { speaker: string; text: string }[];
    for (let i = 0; i < all.length; i++) {
      await new Promise((res) => setTimeout(res, 700));
      setAiTranscript((prev) => [...(prev ?? []), all[i]]);
    }
    setInCall(false);
    await refresh();
    setBusy(false);
  }

  async function sendPaymentLink(purpose: "program" | "consultation" | "follow_up") {
    setBusy(true);
    await fetch("/api/payment-links", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        leadId: lead.id,
        purpose,
        programId: purpose === "program" ? programId : undefined,
      }),
    });
    await refresh();
    setBusy(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <Link href="/partner/leads" className="text-xs text-slate-500 underline">
            ← All leads
          </Link>
          <h1 className="text-2xl font-semibold mt-1">{lead.name}</h1>
          <div className="text-sm text-slate-500">
            {lead.phone} · {lead.preferredMode} · {lead.interest}
          </div>
        </div>
        <span className="badge bg-slate-100 text-slate-700">{lead.status}</span>
      </div>

      <div className="grid md:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-4">
          <section className="card p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Call panel</h2>
              <div className="flex gap-1 text-xs">
                <button
                  onClick={() => setMode("human")}
                  className={`btn ${
                    mode === "human" ? "btn-primary" : "btn-ghost"
                  }`}
                >
                  Human call
                </button>
                <button
                  onClick={() => setMode("ai")}
                  className={`btn ${
                    mode === "ai" ? "btn-primary" : "btn-ghost"
                  }`}
                >
                  AI call
                </button>
              </div>
            </div>

            <div className="mt-3 grid sm:grid-cols-2 gap-3">
              <div>
                <div className="label">Language</div>
                <select
                  className="input"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.name} ({l.native})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <div className="label">Program being sold</div>
                <select
                  className="input"
                  value={programId}
                  onChange={(e) => setProgramId(e.target.value)}
                >
                  {programs.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — ₹{p.priceInr}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {mode === "human" && (
              <div className="mt-4">
                {!inCall ? (
                  <button className="btn-primary" onClick={startHuman}>
                    📞 Start call to {lead.phone}
                  </button>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
                    <span className="font-mono text-sm">
                      {fmt(elapsed)}
                    </span>
                    <span className="text-sm text-slate-500">
                      on call with {lead.name}
                    </span>
                  </div>
                )}
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <div>
                    <div className="label">Outcome</div>
                    <select
                      className="input"
                      value={outcome}
                      onChange={(e) => setOutcome(e.target.value as any)}
                    >
                      <option value="answered">Answered</option>
                      <option value="not_answered">Not answered</option>
                      <option value="callback">Callback requested</option>
                      <option value="agreed_to_purchase">Agreed to purchase</option>
                      <option value="not_interested">Not interested</option>
                    </select>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="label">Notes</div>
                  <textarea
                    className="input min-h-[80px]"
                    placeholder="What did they say?"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
                {inCall && (
                  <button
                    className="btn bg-red-600 text-white hover:bg-red-700 mt-3"
                    onClick={endHuman}
                    disabled={busy}
                  >
                    End call &amp; save
                  </button>
                )}
              </div>
            )}

            {mode === "ai" && (
              <div className="mt-4">
                <button
                  className="btn-primary"
                  onClick={runAiCall}
                  disabled={busy || inCall}
                >
                  🤖 Launch AI call in{" "}
                  {LANGUAGES.find((l) => l.code === language)?.name}
                </button>
                <div className="mt-3 rounded-xl bg-slate-900 text-slate-100 p-3 min-h-[120px] text-sm space-y-2">
                  {aiTranscript === null && (
                    <div className="text-xs text-slate-400">
                      AI transcript will appear here in real time.
                    </div>
                  )}
                  {aiTranscript?.map((t, i) => (
                    <div key={i}>
                      <span
                        className={`text-[10px] uppercase mr-2 ${
                          t.speaker === "agent"
                            ? "text-emerald-400"
                            : "text-sky-400"
                        }`}
                      >
                        {t.speaker}
                      </span>
                      {t.text}
                    </div>
                  ))}
                  {inCall && (
                    <div className="text-xs text-slate-400">● speaking…</div>
                  )}
                </div>
              </div>
            )}
          </section>

          <section className="card p-5">
            <h2 className="font-semibold">Payment links</h2>
            <p className="text-sm text-slate-500">
              Once the lead agrees, generate a payment link. It will be sent on
              WhatsApp (and email, if available).
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                className="btn-primary"
                onClick={() => sendPaymentLink("program")}
                disabled={busy || !programId}
              >
                Send program payment link
              </button>
              <button
                className="btn-ghost"
                onClick={() => sendPaymentLink("consultation")}
                disabled={busy}
              >
                Send consultation link
              </button>
            </div>
            <ul className="mt-4 text-sm divide-y divide-slate-100">
              {links.map((l: any) => (
                <li key={l.id} className="py-2 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{l.description}</div>
                    <div className="text-xs text-slate-500">
                      ₹{l.amountInr} ·{" "}
                      <Link
                        href={`/pay-link/${l.token}`}
                        className="underline"
                        target="_blank"
                      >
                        /pay-link/{l.token.slice(0, 8)}…
                      </Link>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`badge ${
                        l.status === "paid"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {l.status}
                    </span>
                    {l.invoiceId && (
                      <Link
                        href={`/invoice/${l.invoiceId}`}
                        className="text-xs underline"
                        target="_blank"
                      >
                        Invoice
                      </Link>
                    )}
                  </div>
                </li>
              ))}
              {links.length === 0 && (
                <li className="py-2 text-slate-400">None yet.</li>
              )}
            </ul>
          </section>

          <section className="card p-5">
            <h2 className="font-semibold">Call log for this lead</h2>
            <ul className="mt-2 text-sm divide-y divide-slate-100">
              {calls.map((c: any) => (
                <li key={c.id} className="py-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="badge bg-slate-100 text-slate-700 mr-2">
                        {c.mode.toUpperCase()}
                      </span>
                      {new Date(c.createdAt).toLocaleString()} · {c.language}
                    </div>
                    <div className="text-xs text-slate-500">
                      {fmt(c.durationSec)} · {c.outcome}
                    </div>
                  </div>
                  {c.notes && (
                    <div className="mt-1 text-slate-600">{c.notes}</div>
                  )}
                  {c.aiTranscript && (
                    <details className="mt-1">
                      <summary className="cursor-pointer text-xs text-slate-500">
                        Show AI transcript
                      </summary>
                      <ol className="mt-1 space-y-1 text-xs">
                        {c.aiTranscript.map((t: any, i: number) => (
                          <li key={i}>
                            <span className="font-medium">{t.speaker}:</span>{" "}
                            {t.text}
                          </li>
                        ))}
                      </ol>
                    </details>
                  )}
                </li>
              ))}
              {calls.length === 0 && (
                <li className="py-2 text-slate-400">No calls yet.</li>
              )}
            </ul>
          </section>
        </div>

        <aside className="space-y-4">
          <div className="card p-4 text-sm">
            <div className="label">Provider</div>
            <div className="font-medium">{provider.name}</div>
            <a
              href={provider.website}
              target="_blank"
              rel="noreferrer"
              className="text-xs underline"
            >
              {provider.website}
            </a>
          </div>
          <div className="card p-4">
            <h3 className="font-semibold text-sm">WhatsApp thread (simulated)</h3>
            <ol className="mt-2 space-y-2 max-h-[320px] overflow-y-auto">
              {messages
                .filter((m: any) => m.channel === "whatsapp")
                .map((m: any) => (
                  <li key={m.id} className="text-xs">
                    <span
                      className={`badge mr-1 ${
                        m.role === "agent"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {m.role}
                    </span>
                    <span className="whitespace-pre-wrap">{m.text}</span>
                  </li>
                ))}
              {messages.filter((m: any) => m.channel === "whatsapp").length ===
                0 && (
                <li className="text-xs text-slate-400">No messages yet.</li>
              )}
            </ol>
            <Link
              href={`/whatsapp/${lead.id}`}
              className="text-xs underline mt-2 inline-block"
            >
              Open full WhatsApp view →
            </Link>
          </div>
          <div className="card p-4">
            <h3 className="font-semibold text-sm">Email thread</h3>
            <ol className="mt-2 space-y-2 max-h-[220px] overflow-y-auto">
              {messages
                .filter((m: any) => m.channel === "email")
                .map((m: any) => (
                  <li key={m.id} className="text-xs whitespace-pre-wrap">
                    {m.text}
                  </li>
                ))}
              {messages.filter((m: any) => m.channel === "email").length ===
                0 && (
                <li className="text-xs text-slate-400">No emails yet.</li>
              )}
            </ol>
          </div>
        </aside>
      </div>
    </div>
  );
}

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m.toString().padStart(2, "0")}:${r.toString().padStart(2, "0")}`;
}
