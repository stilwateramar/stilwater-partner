"use client";

import { useRef, useState } from "react";

export default function ChatbotClient({
  initialCredits,
}: {
  initialCredits: number;
}) {
  const [credits, setCredits] = useState(initialCredits);
  const [msgs, setMsgs] = useState<{ role: "user" | "agent"; text: string }[]>(
    [
      {
        role: "agent",
        text: "I'm the SHARAN assistant. Ask me anything about the protocol, meals, or your progress.",
      },
    ]
  );
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [payUrl, setPayUrl] = useState<string | null>(null);
  const sessionId = useRef(`pchat_${Math.random().toString(36).slice(2, 9)}`);

  async function send() {
    const t = input.trim();
    if (!t || busy) return;
    setInput("");
    setBusy(true);
    setMsgs((m) => [...m, { role: "user", text: t }]);
    const res = await fetch("/api/patient/chatbot", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text: t, sessionId: sessionId.current }),
    });
    if (res.status === 402) {
      const d = await res.json();
      setMsgs((m) => [
        ...m,
        { role: "agent", text: d.message },
      ]);
    } else {
      const d = await res.json();
      setCredits(d.creditsRemaining);
      setMsgs((m) => [...m, { role: "agent", text: d.reply }]);
    }
    setBusy(false);
  }

  async function topUp() {
    const r = await fetch("/api/patient/credits", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ kind: "chatbot" }),
    }).then((r) => r.json());
    setPayUrl(`/pay-link/${r.paymentLink.token}`);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="label">SHARAN chatbot</p>
          <h1 className="text-2xl font-semibold">Ask anything</h1>
        </div>
        <div className="text-sm">
          <span className="badge bg-slate-100 text-slate-700">
            {credits} credits left
          </span>
        </div>
      </div>

      <div className="card overflow-hidden flex flex-col h-[65vh]">
        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-50">
          {msgs.map((m, i) => (
            <div
              key={i}
              className={`flex ${
                m.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                  m.role === "user"
                    ? "bg-still-600 text-white"
                    : "bg-white border border-slate-200"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          {busy && <div className="text-xs text-slate-400">agent typing…</div>}
        </div>
        <div className="p-3 border-t border-slate-200 flex gap-2 bg-white">
          {credits > 0 ? (
            <>
              <input
                className="input flex-1"
                placeholder="Type your question…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
              />
              <button className="btn-primary" onClick={send} disabled={busy}>
                Send
              </button>
            </>
          ) : (
            <div className="flex gap-2 items-center w-full">
              <div className="text-sm text-slate-600">
                You're out of credits.
              </div>
              {payUrl ? (
                <a
                  className="btn-primary ml-auto"
                  href={payUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Pay ₹499 →
                </a>
              ) : (
                <button className="btn-primary ml-auto" onClick={topUp}>
                  Top up 10 credits (₹499)
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
