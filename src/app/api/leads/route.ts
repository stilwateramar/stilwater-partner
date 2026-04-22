import { NextResponse } from "next/server";
import { readDB, updateDB, newId } from "@/lib/db";
import { openingMessage } from "@/lib/agent";
import type { Lead } from "@/lib/types";

export async function GET() {
  const db = readDB();
  return NextResponse.json({ leads: db.leads });
}

export async function POST(req: Request) {
  const body = (await req.json()) as Partial<Lead>;
  if (!body.name || !body.phone || !body.providerId) {
    return NextResponse.json(
      { error: "name, phone and providerId are required" },
      { status: 400 }
    );
  }

  const lead: Lead = {
    id: newId("lead"),
    name: body.name,
    phone: body.phone,
    email: body.email,
    providerId: body.providerId,
    source: body.source ?? "meta_ad",
    campaign: body.campaign,
    preferredMode: body.preferredMode ?? "whatsapp",
    interest: body.interest ?? "General information",
    status: "new",
    createdAt: new Date().toISOString(),
    notes: body.notes,
  };

  updateDB((db) => {
    db.leads.unshift(lead);

    const provider = db.providers.find((p) => p.id === lead.providerId);
    const sessionId = `wa_${lead.id}`;
    db.messages.push({
      id: newId("msg"),
      leadId: lead.id,
      sessionId,
      channel: "whatsapp",
      role: "agent",
      text: openingMessage(lead, provider),
      at: new Date().toISOString(),
    });
    lead.status = "contacted";
  });

  return NextResponse.json({ lead });
}
