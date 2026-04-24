import { NextResponse } from "next/server";
import { getPartnerUser } from "@/lib/auth";
import { newId, updateDB } from "@/lib/db";
import type { CallLog, CallOutcome, CallMode } from "@/lib/types";

export async function POST(req: Request) {
  const user = getPartnerUser();
  if (!user) return NextResponse.json({ error: "unauth" }, { status: 401 });
  const body = (await req.json()) as Partial<CallLog>;
  if (!body.leadId) return NextResponse.json({ error: "leadId required" }, { status: 400 });

  const log = updateDB((db) => {
    const lead = db.leads.find((l) => l.id === body.leadId);
    if (!lead) return null;

    const call: CallLog = {
      id: newId("call"),
      leadId: body.leadId!,
      userId: user.id,
      providerId: lead.providerId,
      mode: (body.mode as CallMode) ?? "human",
      language: body.language ?? "en",
      durationSec: body.durationSec ?? 0,
      outcome: (body.outcome as CallOutcome) ?? "answered",
      notes: body.notes ?? "",
      aiTranscript: body.aiTranscript,
      createdAt: new Date().toISOString(),
    };
    db.callLogs.unshift(call);

    if (call.outcome === "agreed_to_purchase") lead.status = "agreed_to_purchase";
    else if (lead.status === "new") lead.status = "contacted";
    else if (lead.status === "contacted") lead.status = "engaged";

    return call;
  });

  if (!log) return NextResponse.json({ error: "lead_not_found" }, { status: 404 });
  return NextResponse.json({ call: log });
}

export async function GET(req: Request) {
  const user = getPartnerUser();
  if (!user) return NextResponse.json({ error: "unauth" }, { status: 401 });
  const url = new URL(req.url);
  const leadId = url.searchParams.get("leadId");
  const { readDB } = await import("@/lib/db");
  const db = readDB();
  const list = db.callLogs.filter(
    (c) =>
      (leadId ? c.leadId === leadId : true) &&
      (user.providerId ? c.providerId === user.providerId : true)
  );
  return NextResponse.json({ calls: list });
}
