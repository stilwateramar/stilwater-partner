"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { humanSlot } from "@/lib/slots";

export default function ConsultationRoom({
  params,
}: {
  params: { id: string };
}) {
  const [data, setData] = useState<any>(null);
  const [transcript, setTranscript] = useState<any>(null);
  const [recState, setRecState] = useState<"idle" | "recording" | "processing" | "done">(
    "idle"
  );
  const [elapsed, setElapsed] = useState(0);
  const timer = useRef<any>(null);

  async function refresh() {
    const r = await fetch(`/api/consultations/${params.id}`).then((r) =>
      r.json()
    );
    setData(r);
    setTranscript(r.transcript ?? null);
  }

  useEffect(() => {
    refresh();
  }, [params.id]);

  function startRec() {
    setRecState("recording");
    setElapsed(0);
    timer.current = setInterval(() => setElapsed((e) => e + 1), 1000);
  }

  async function stopRec() {
    clearInterval(timer.current);
    setRecState("processing");
    await new Promise((r) => setTimeout(r, 1500));
    const r = await fetch(`/api/consultations/${params.id}/transcript`, {
      method: "POST",
    }).then((r) => r.json());
    setTranscript(r.transcript);
    setRecState("done");
    refresh();
  }

  if (!data) return <div>Loading…</div>;
  const { consultation, lead, provider, doctor } = data;

  const autoAvatar = consultation.type === "ai_avatar" && transcript;

  return (
    <div className="grid md:grid-cols-[1fr_360px] gap-6">
      <section>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="label">
                {consultation.type === "ai_avatar"
                  ? "AI avatar consultation"
                  : "In-person consultation"}
              </div>
              <h1 className="text-xl font-semibold">
                {provider.name} · {doctor?.name ?? "Maya (AI avatar)"}
              </h1>
              <div className="text-sm text-slate-500">
                {humanSlot(consultation.slot)}
              </div>
            </div>
            <span className="badge bg-slate-100 text-slate-700">
              {consultation.status}
            </span>
          </div>
        </div>

        <div className="card mt-4 overflow-hidden">
          <div className="aspect-video bg-slate-900 relative grid place-items-center text-slate-200">
            {recState === "recording" ? (
              <div className="text-center">
                <div className="h-24 w-24 rounded-full bg-red-500/20 border-2 border-red-500 grid place-items-center animate-pulse">
                  <span className="h-6 w-6 rounded-full bg-red-500" />
                </div>
                <div className="mt-3 font-mono">{fmt(elapsed)}</div>
                <div className="text-xs mt-1 opacity-70">
                  Recording audio &amp; video · end-to-end encrypted
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-6xl">🎥</div>
                <div className="mt-2 text-sm opacity-80">
                  {consultation.type === "ai_avatar"
                    ? "AI avatar session"
                    : "Doctor will join at the scheduled time"}
                </div>
              </div>
            )}
          </div>
          <div className="p-3 flex gap-2 border-t border-slate-800 bg-slate-900 text-slate-100">
            {!autoAvatar && recState === "idle" && (
              <button className="btn-primary" onClick={startRec}>
                ● Start recording
              </button>
            )}
            {recState === "recording" && (
              <button
                className="btn bg-red-600 text-white hover:bg-red-700"
                onClick={stopRec}
              >
                ■ End &amp; transcribe
              </button>
            )}
            {recState === "processing" && (
              <div className="text-sm">Transcribing &amp; summarising…</div>
            )}
            {(recState === "done" || autoAvatar) && (
              <div className="text-sm">✓ Session recorded · transcript ready</div>
            )}
            <div className="ml-auto text-xs opacity-60">
              {consultation.recordingUrl ?? "no recording yet"}
            </div>
          </div>
        </div>

        {transcript && (
          <div className="card p-5 mt-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Transcript &amp; summary</h2>
              <span className="text-xs text-slate-500">
                {new Date(transcript.createdAt).toLocaleString()}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-700 bg-still-50 border border-still-100 rounded-lg p-3">
              {transcript.summary}
            </p>
            <ol className="mt-4 space-y-2">
              {transcript.turns.map((t: any, i: number) => (
                <li key={i} className="flex gap-3 text-sm">
                  <span
                    className={`badge ${
                      t.speaker === "doctor"
                        ? "bg-still-100 text-still-700"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {t.speaker}
                  </span>
                  <span className="flex-1">{t.text}</span>
                </li>
              ))}
            </ol>
            <div className="mt-5">
              <div className="label">Auto-generated follow-up actions</div>
              <ul className="mt-2 space-y-2 text-sm">
                {transcript.actions.map((a: any, i: number) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 border border-slate-200 rounded-lg p-2"
                  >
                    <span className="badge bg-emerald-100 text-emerald-700 capitalize">
                      {a.kind.replace("_", " ")}
                    </span>
                    <span className="flex-1">{a.text}</span>
                    {a.due && (
                      <span className="text-xs text-slate-500">by {a.due}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </section>

      <aside className="card p-4 h-max text-sm">
        <div className="label">Participant</div>
        <div className="font-medium">{lead.name}</div>
        <div className="text-slate-500">{lead.phone}</div>
        <div className="mt-3 space-y-2">
          <Link
            href={`/whatsapp/${lead.id}`}
            className="btn-ghost w-full"
          >
            Open WhatsApp thread
          </Link>
          <Link href={`/admin`} className="btn-ghost w-full">
            Admin dashboard
          </Link>
        </div>
      </aside>
    </div>
  );
}

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m.toString().padStart(2, "0")}:${r.toString().padStart(2, "0")}`;
}
