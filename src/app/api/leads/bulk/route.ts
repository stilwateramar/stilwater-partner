import { NextResponse } from "next/server";
import { getPartnerUser, canManageTeam } from "@/lib/auth";
import { newId, updateDB } from "@/lib/db";
import { openingMessage } from "@/lib/agent";
import type { ContactMode, Lead } from "@/lib/types";

interface IncomingRow {
  name?: string;
  phone?: string;
  email?: string;
  interest?: string;
  preferredMode?: ContactMode;
  notes?: string;
}

export async function POST(req: Request) {
  const me = getPartnerUser();
  if (!me) return NextResponse.json({ error: "unauth" }, { status: 401 });
  if (!canManageTeam(me))
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = await req.json();
  const rows = (body.rows as IncomingRow[]) ?? [];
  const providerId =
    me.role === "stilwater_admin" ? body.providerId : me.providerId;
  if (!providerId)
    return NextResponse.json({ error: "providerId required" }, { status: 400 });

  const result = updateDB((db) => {
    const provider = db.providers.find((p) => p.id === providerId);
    const created: Lead[] = [];
    const skipped: { row: IncomingRow; reason: string }[] = [];
    for (const raw of rows) {
      const name = (raw.name ?? "").trim();
      const phone = (raw.phone ?? "").trim();
      if (!name || !phone) {
        skipped.push({ row: raw, reason: "missing name or phone" });
        continue;
      }
      if (
        db.leads.some(
          (l) => l.providerId === providerId && l.phone === phone
        )
      ) {
        skipped.push({ row: raw, reason: "duplicate phone" });
        continue;
      }
      const lead: Lead = {
        id: newId("lead"),
        name,
        phone,
        email: (raw.email ?? "").trim() || undefined,
        providerId,
        source: "import",
        preferredMode: (raw.preferredMode as ContactMode) ?? "whatsapp",
        interest: (raw.interest ?? "").trim() || "Imported lead",
        status: "new",
        createdAt: new Date().toISOString(),
        notes: raw.notes,
      };
      db.leads.unshift(lead);
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
      created.push(lead);
    }
    return { created, skipped };
  });

  return NextResponse.json({
    created: result.created.length,
    skipped: result.skipped.length,
    skippedDetails: result.skipped,
  });
}
