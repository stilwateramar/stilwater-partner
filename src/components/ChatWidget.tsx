"use client";

import { useEffect, useRef, useState } from "react";

interface Msg {
  role: "user" | "agent";
  text: string;
  links?: { label: string; url: string }[];
}

export default function ChatWidget({
  providerId,
  leadId,
  embedded,
}: {
  providerId?: string;
  leadId?: string;
  embedded?: boolean;
}) {
  const [open, setOpen] = useState(!!embedded);
  const [sessionId] = useState(() => `sess_${Math.random().toString(36).slice(2, 9)}`);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: "agent",
      text:
        "Hi! I'm the Stilwater assistant. Ask me anything about SHARAN, Amar Eye Yoga or book a consultation.",
    },
  ]);
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, open]);

  async function send(text?: string) {
    const content = (text ?? input).trim();
    if (!content || busy) return;
    setInput("");
    setMsgs((m) => [...m, { role: "user", text: content }]);
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          sessionId,
          channel: "website",
          text: content,
          providerId,
          leadId,
        }),
      });
      const data = await res.json();
      setMsgs((m) => [
        ...m,
        { role: "agent", text: data.reply, links: data.links },
      ]);
    } finally {
      setBusy(false);
    }
  }

  const panel = (
    <div
      className={`${
        embedded
          ? "rounded-2xl border border-slate-200 bg-white shadow-sm"
          : "fixed bottom-5 right-5 w-[360px] rounded-2xl border border-slate-200 bg-white shadow-xl"
      }`}
    >
      <div className="flex items-center justify-between p-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
          <span className="text-sm font-medium">Stilwater assistant</span>
        </div>
        {!embedded && (
          <button
            className="text-slate-400 hover:text-slate-700"
            onClick={() => setOpen(false)}
          >
            ×
          </button>
        )}
      </div>
      <div className="h-80 overflow-y-auto p-3 space-y-2">
        {msgs.map((m, i) => (
          <div
            key={i}
            className={`flex ${
              m.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                m.role === "user"
                  ? "bg-still-600 text-white"
                  : "bg-slate-100 text-slate-800"
              }`}
            >
              <div className="whitespace-pre-wrap">{m.text}</div>
              {m.links && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {m.links.map((l) => (
                    <a
                      key={l.url}
                      href={l.url}
                      className="text-xs underline text-still-700"
                    >
                      {l.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {busy && (
          <div className="text-xs text-slate-400 pl-1">agent typing…</div>
        )}
        <div ref={endRef} />
      </div>
      <div className="p-3 border-t border-slate-200 flex gap-2">
        <input
          className="input flex-1"
          placeholder="Ask about services, price, booking…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
        />
        <button className="btn-primary" onClick={() => send()} disabled={busy}>
          Send
        </button>
      </div>
    </div>
  );

  if (embedded) return panel;

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 btn-primary shadow-lg"
        >
          💬 Chat with us
        </button>
      )}
      {open && panel}
    </>
  );
}
