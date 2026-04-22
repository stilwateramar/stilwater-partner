import { NextResponse } from "next/server";
import { readDB, updateDB, newId } from "@/lib/db";
import { fabricateTranscript } from "@/lib/transcribe";
import type { Transcript } from "@/lib/types";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const db = readDB();
  const t = db.transcripts.find((x) => x.consultationId === params.id);
  return NextResponse.json({ transcript: t ?? null });
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const body = await req.json().catch(() => ({}));

  const transcript = updateDB((db) => {
    const c = db.consultations.find((x) => x.id === params.id);
    if (!c) return null;

    let existing = db.transcripts.find((t) => t.consultationId === params.id);
    if (existing) return existing;

    let newTr: Transcript;
    if (body.turns && Array.isArray(body.turns)) {
      newTr = {
        id: newId("tr"),
        consultationId: params.id,
        createdAt: new Date().toISOString(),
        summary:
          body.summary ??
          "AI avatar session captured. Clinician review pending within 24h.",
        turns: body.turns,
        actions: body.actions ?? [
          { kind: "follow_up", text: "Clinician review of avatar session." },
        ],
      };
    } else {
      const fab = fabricateTranscript(params.id, c.providerId);
      newTr = {
        id: newId("tr"),
        createdAt: new Date().toISOString(),
        ...fab,
      };
    }
    db.transcripts.push(newTr);

    c.transcriptId = newTr.id;
    c.status = "completed";
    if (!c.recordingUrl) c.recordingUrl = `/recordings/${c.id}.mp4`;

    const lead = db.leads.find((l) => l.id === c.leadId);
    if (lead) lead.status = "consulted";

    // Post a WhatsApp follow-up from the AI agent
    const sessionId = `wa_${c.leadId}`;
    const followUp = [
      "Thanks for the consultation ✅",
      `Summary: ${newTr.summary}`,
      `Next steps:`,
      ...newTr.actions.map((a) => `• ${a.text}${a.due ? ` (by ${a.due})` : ""}`),
    ].join("\n");
    db.messages.push({
      id: newId("msg"),
      leadId: c.leadId,
      sessionId,
      channel: "whatsapp",
      role: "agent",
      text: followUp,
      at: new Date().toISOString(),
    });

    return newTr;
  });

  if (!transcript)
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ transcript });
}
