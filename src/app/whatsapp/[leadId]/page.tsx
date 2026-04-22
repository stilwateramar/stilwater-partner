"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

interface Msg {
  id: string;
  role: "user" | "agent" | "system";
  text: string;
  at: string;
}

export default function WhatsAppSim({ params }: { params: { leadId: string } }) {
  const [lead, setLead] = useState<any>(null);
  const [provider, setProvider] = useState<any>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scroller = useRef<HTMLDivElement | null>(null);
  const sessionId = `wa_${params.leadId}`;

  async function refresh() {
    const [leadRes, msgRes] = await Promise.all([
      fetch(`/api/leads/${params.leadId}`).then((r) => r.json()),
      fetch(`/api/chat?sessionId=${sessionId}`).then((r) => r.json()),
    ]);
    setLead(leadRes.lead);
    setProvider(leadRes.provider);
    setMsgs(msgRes.messages);
  }

  useEffect(() => {
    refresh();
  }, [params.leadId]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [msgs]);

  async function send() {
    const t = input.trim();
    if (!t || busy) return;
    setInput("");
    setBusy(true);
    await fetch("/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        sessionId,
        channel: "whatsapp",
        text: t,
        providerId: lead?.providerId,
        leadId: params.leadId,
      }),
    });
    await refresh();
    setBusy(false);
  }

  if (!lead) return <div>Loading…</div>;

  return (
    <div className="grid md:grid-cols-[1fr_360px] gap-6">
      <div className="card overflow-hidden flex flex-col h-[70vh]">
        <div className="bg-emerald-600 text-white px-4 py-3 flex items-center gap-3">
          <span className="h-9 w-9 rounded-full bg-white text-emerald-700 font-bold grid place-items-center">
            S
          </span>
          <div>
            <div className="font-medium">Stilwater · {provider?.name}</div>
            <div className="text-xs opacity-90">online · WhatsApp Business</div>
          </div>
        </div>
        <div
          ref={scroller}
          className="flex-1 overflow-y-auto bg-[#efeae2] p-4 space-y-2"
        >
          {msgs.map((m) => (
            <div
              key={m.id}
              className={`flex ${
                m.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[75%] rounded-lg px-3 py-2 text-sm shadow-sm whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-[#d9fdd3]"
                    : "bg-white"
                }`}
              >
                {m.text}
                <div className="mt-1 text-[10px] text-slate-400 text-right">
                  {new Date(m.at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          ))}
          {busy && (
            <div className="text-xs text-slate-500 pl-1">agent typing…</div>
          )}
        </div>
        <div className="flex gap-2 p-3 border-t border-slate-200 bg-white">
          <input
            className="input flex-1"
            value={input}
            placeholder="Reply as the patient…"
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
          />
          <button className="btn-primary" disabled={busy} onClick={send}>
            Send
          </button>
        </div>
      </div>

      <aside className="card p-4 h-max">
        <div className="label">Lead</div>
        <div className="font-semibold">{lead.name}</div>
        <div className="text-sm text-slate-500">{lead.phone}</div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div>
            <div className="label">Provider</div>
            <div>{provider?.name}</div>
          </div>
          <div>
            <div className="label">Interest</div>
            <div>{lead.interest}</div>
          </div>
          <div>
            <div className="label">Source</div>
            <div>{lead.source}</div>
          </div>
          <div>
            <div className="label">Status</div>
            <div>
              <span className="badge bg-slate-100 text-slate-700">
                {lead.status}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <Link
            href={`/book?provider=${lead.providerId}&leadId=${lead.id}`}
            className="btn-primary w-full"
          >
            Book in-person slot →
          </Link>
          <Link
            href={`/avatar?provider=${lead.providerId}&leadId=${lead.id}`}
            className="btn-ghost w-full"
          >
            Start AI-avatar consultation
          </Link>
          <Link href="/admin" className="btn-ghost w-full">
            Open in admin
          </Link>
        </div>
      </aside>
    </div>
  );
}
