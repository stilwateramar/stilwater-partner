import { NextResponse } from "next/server";
import { readDB, updateDB, newId } from "@/lib/db";
import { runAgent } from "@/lib/agent";
import { getPartnerUser, getPatient } from "@/lib/auth";
import type { Channel } from "@/lib/types";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const sessionId = url.searchParams.get("sessionId");
  const leadId = url.searchParams.get("leadId");
  const db = readDB();
  const partner = getPartnerUser();
  const patient = getPatient();

  let messages = db.messages.filter((m) =>
    sessionId ? m.sessionId === sessionId : leadId ? m.leadId === leadId : false
  );

  if (partner?.role === "stilwater_admin") {
    // no filter
  } else if (partner?.providerId) {
    messages = messages.filter((m) => {
      if (!m.leadId) return true;
      const lead = db.leads.find((l) => l.id === m.leadId);
      return lead?.providerId === partner.providerId;
    });
  } else if (patient) {
    messages = messages.filter(
      (m) => m.patientId === patient.id || m.leadId === patient.leadId
    );
  }
  // Anonymous callers get results for the specific session they've
  // addressed (e.g. website chatbot session), which is intended.
  return NextResponse.json({ messages });
}

export async function POST(req: Request) {
  const {
    sessionId,
    channel,
    text,
    providerId,
    leadId,
  }: {
    sessionId: string;
    channel: Channel;
    text: string;
    providerId?: string;
    leadId?: string;
  } = await req.json();

  if (!sessionId || !text) {
    return NextResponse.json(
      { error: "sessionId and text required" },
      { status: 400 }
    );
  }

  const reply = updateDB((db) => {
    const provider = providerId
      ? db.providers.find((p) => p.id === providerId)
      : undefined;
    const lead = leadId ? db.leads.find((l) => l.id === leadId) : undefined;

    const now = new Date().toISOString();
    db.messages.push({
      id: newId("msg"),
      leadId,
      sessionId,
      channel: channel ?? "website",
      role: "user",
      text,
      at: now,
    });

    const history = db.messages.filter((m) => m.sessionId === sessionId);
    const result = runAgent(text, { lead, provider, history });

    db.messages.push({
      id: newId("msg"),
      leadId,
      sessionId,
      channel: channel ?? "website",
      role: "agent",
      text: result.text,
      at: new Date().toISOString(),
    });

    if (lead && lead.status === "contacted") lead.status = "engaged";

    return result;
  });

  return NextResponse.json({
    reply: reply.text,
    links: reply.links,
    suggestBooking: reply.suggestBooking ?? false,
  });
}
