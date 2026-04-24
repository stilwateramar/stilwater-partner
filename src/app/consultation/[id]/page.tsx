"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { humanSlot } from "@/lib/slots";

type RxItem = {
  medicine: string;
  dose: string;
  frequency: string;
  duration: string;
};

export default function ConsultationRoom({
  params,
}: {
  params: { id: string };
}) {
  const [data, setData] = useState<any>(null);
  const [transcript, setTranscript] = useState<any>(null);
  const [me, setMe] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [prescription, setPrescription] = useState<any>(null);
  const [recState, setRecState] = useState<
    "idle" | "recording" | "processing" | "done"
  >("idle");
  const [elapsed, setElapsed] = useState(0);
  const timer = useRef<any>(null);

  // Prescription form state
  const [rx, setRx] = useState<RxItem[]>([
    { medicine: "", dose: "", frequency: "", duration: "" },
  ]);
  const [lifestyle, setLifestyle] = useState<string>(
    "Daily 30-min walk\n2 tbsp flaxseed with breakfast"
  );
  const [followUpDays, setFollowUpDays] = useState<number>(14);
  const [rxNotes, setRxNotes] = useState<string>("");
  const [rxSaving, setRxSaving] = useState(false);

  async function refresh() {
    const r = await fetch(`/api/consultations/${params.id}`).then((r) =>
      r.json()
    );
    setData(r);
    setTranscript(r.transcript ?? null);
    const meRes = await fetch("/api/auth/me").then((r) => r.json());
    setMe(meRes);
    const rx = await fetch(
      `/api/prescriptions?consultationId=${params.id}`
    ).then((r) => r.json());
    setPrescription(rx.prescriptions?.[0] ?? null);
    if (r.consultation?.leadId || r.consultation?.patientId) {
      // Load reports of the patient tied to this consultation (if any)
      const patientId =
        r.consultation?.patientId ??
        (r.lead?.patientId ? r.lead.patientId : null);
      if (patientId) {
        const rep = await fetch(`/api/reports`).catch(() => null);
        // /api/reports is patient-only; this request will fail for staff. Ignore.
      }
    }
    // Staff-level fetch of reports
    const rep2 = await fetch(
      `/api/consultations/${params.id}/reports`
    ).then((r) => r.json());
    setReports(rep2.reports ?? []);
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  async function saveRx() {
    setRxSaving(true);
    const items = rx.filter((r) => r.medicine.trim().length > 0);
    const lifestyleList = lifestyle
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    await fetch("/api/prescriptions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        consultationId: params.id,
        items,
        lifestyle: lifestyleList,
        nextFollowUpDays: followUpDays,
        notes: rxNotes,
      }),
    });
    setRxSaving(false);
    refresh();
  }

  if (!data) return <div>Loading…</div>;
  const { consultation, lead, provider, doctor } = data;
  const autoAvatar = consultation.type === "ai_avatar" && transcript;
  const isClinician =
    me?.user &&
    (me.user.role === "doctor" ||
      me.user.role === "owner" ||
      me.user.role === "admin");

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
              <div className="text-sm">
                ✓ Session recorded · transcript ready
              </div>
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
          </div>
        )}

        {isClinician && !prescription && (
          <div className="card p-5 mt-4">
            <h2 className="font-semibold">Issue prescription</h2>
            <p className="text-sm text-slate-500">
              Shared to the patient on WhatsApp + email, and visible in their
              portal. A follow-up booking link is included.
            </p>
            <div className="mt-3 space-y-2">
              {rx.map((row, i) => (
                <div key={i} className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-2">
                  <input
                    className="input"
                    placeholder="Medicine / remedy"
                    value={row.medicine}
                    onChange={(e) =>
                      setRx((r) =>
                        r.map((x, j) =>
                          j === i ? { ...x, medicine: e.target.value } : x
                        )
                      )
                    }
                  />
                  <input
                    className="input"
                    placeholder="Dose"
                    value={row.dose}
                    onChange={(e) =>
                      setRx((r) =>
                        r.map((x, j) =>
                          j === i ? { ...x, dose: e.target.value } : x
                        )
                      )
                    }
                  />
                  <input
                    className="input"
                    placeholder="Frequency"
                    value={row.frequency}
                    onChange={(e) =>
                      setRx((r) =>
                        r.map((x, j) =>
                          j === i ? { ...x, frequency: e.target.value } : x
                        )
                      )
                    }
                  />
                  <input
                    className="input"
                    placeholder="Duration"
                    value={row.duration}
                    onChange={(e) =>
                      setRx((r) =>
                        r.map((x, j) =>
                          j === i ? { ...x, duration: e.target.value } : x
                        )
                      )
                    }
                  />
                  <button
                    className="text-xs text-slate-400"
                    onClick={() => setRx((r) => r.filter((_, j) => j !== i))}
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                className="text-xs underline"
                onClick={() =>
                  setRx((r) => [
                    ...r,
                    { medicine: "", dose: "", frequency: "", duration: "" },
                  ])
                }
              >
                + add row
              </button>
              <div>
                <div className="label mt-3">Lifestyle / diet</div>
                <textarea
                  className="input min-h-[80px]"
                  value={lifestyle}
                  onChange={(e) => setLifestyle(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-[1fr_auto] gap-2 items-end">
                <div>
                  <div className="label">Notes</div>
                  <input
                    className="input"
                    value={rxNotes}
                    onChange={(e) => setRxNotes(e.target.value)}
                  />
                </div>
                <div>
                  <div className="label">Follow-up in (days)</div>
                  <input
                    className="input w-24"
                    type="number"
                    value={followUpDays}
                    onChange={(e) => setFollowUpDays(Number(e.target.value))}
                  />
                </div>
              </div>
              <button
                className="btn-primary mt-2"
                onClick={saveRx}
                disabled={rxSaving}
              >
                {rxSaving ? "Saving…" : "Issue prescription"}
              </button>
            </div>
          </div>
        )}

        {prescription && (
          <div className="card p-5 mt-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Prescription</h2>
              <span className="text-xs text-slate-500">
                Issued {new Date(prescription.issuedAt).toLocaleString()}
              </span>
            </div>
            <table className="w-full mt-3 text-sm">
              <thead className="text-xs uppercase text-slate-500 border-b">
                <tr>
                  <th className="py-2 text-left">Medicine</th>
                  <th className="py-2 text-left">Dose</th>
                  <th className="py-2 text-left">Frequency</th>
                  <th className="py-2 text-left">Duration</th>
                </tr>
              </thead>
              <tbody>
                {prescription.items.map((it: any, i: number) => (
                  <tr key={i} className="border-b border-slate-100">
                    <td className="py-2">{it.medicine}</td>
                    <td className="py-2">{it.dose}</td>
                    <td className="py-2">{it.frequency}</td>
                    <td className="py-2">{it.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {prescription.lifestyle?.length > 0 && (
              <div className="mt-3">
                <div className="label">Lifestyle</div>
                <ul className="mt-1 text-sm list-disc list-inside">
                  {prescription.lifestyle.map((l: string, i: number) => (
                    <li key={i}>{l}</li>
                  ))}
                </ul>
              </div>
            )}
            {prescription.nextFollowUpDays && (
              <div className="mt-3 text-sm">
                Follow-up recommended in{" "}
                <span className="font-medium">
                  {prescription.nextFollowUpDays} days
                </span>
                .
              </div>
            )}
          </div>
        )}
      </section>

      <aside className="space-y-4">
        <div className="card p-4 text-sm">
          <div className="label">Participant</div>
          <div className="font-medium">{lead.name}</div>
          <div className="text-slate-500">{lead.phone}</div>
          <div className="mt-3 space-y-2">
            <Link href={`/whatsapp/${lead.id}`} className="btn-ghost w-full">
              Open WhatsApp thread
            </Link>
            {me?.user?.providerId && (
              <Link
                href={`/partner/leads/${lead.id}`}
                className="btn-ghost w-full"
              >
                Open in partner portal
              </Link>
            )}
          </div>
        </div>

        <div className="card p-4 text-sm">
          <div className="label">Uploaded reports</div>
          {reports.length === 0 && (
            <div className="text-slate-400 mt-1">
              No reports uploaded by this patient yet.
            </div>
          )}
          <ul className="mt-2 space-y-1">
            {reports.map((r: any) => (
              <li key={r.id} className="text-xs flex justify-between gap-2">
                <span className="truncate">{r.title}</span>
                <a
                  href={r.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  Open
                </a>
              </li>
            ))}
          </ul>
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
