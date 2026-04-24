import { NextResponse } from "next/server";
import { getPartnerUser } from "@/lib/auth";
import { updateDB } from "@/lib/db";
import { pushMessage } from "@/lib/messaging";

export async function POST(req: Request) {
  const user = getPartnerUser();
  if (!user) return NextResponse.json({ error: "unauth" }, { status: 401 });
  const { leadIds, text } = (await req.json()) as {
    leadIds: string[];
    text: string;
  };
  if (!Array.isArray(leadIds) || !leadIds.length || !text?.trim()) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const result = updateDB((db) => {
    const provider = user.providerId
      ? db.providers.find((p) => p.id === user.providerId)
      : null;
    if (user.providerId && !provider?.whatsappNumber) {
      return { error: "no_whatsapp_number" };
    }
    let sent = 0;
    for (const id of leadIds) {
      const lead = db.leads.find((l) => l.id === id);
      if (!lead) continue;
      if (user.providerId && lead.providerId !== user.providerId) continue;
      const firstName = lead.name.split(" ")[0];
      const personalised = text.replace(/\{name\}/g, firstName);
      pushMessage(db, {
        leadId: lead.id,
        channel: "whatsapp",
        text: personalised,
      });
      sent += 1;
    }
    return { sent };
  });

  if ("error" in result) {
    return NextResponse.json(result, { status: 400 });
  }
  return NextResponse.json(result);
}
