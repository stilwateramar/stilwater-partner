import { NextResponse } from "next/server";
import { getPartnerUser, canManageTeam } from "@/lib/auth";
import { readDB, updateDB } from "@/lib/db";
import { pushMessage } from "@/lib/messaging";

export async function POST(req: Request) {
  const me = getPartnerUser();
  if (!me) return NextResponse.json({ error: "unauth" }, { status: 401 });
  if (!canManageTeam(me))
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = await req.json();
  const leadIds = (body.leadIds as string[]) ?? [];
  const text = (body.text as string) ?? "";
  if (!leadIds.length || !text.trim()) {
    return NextResponse.json(
      { error: "leadIds and text are required" },
      { status: 400 }
    );
  }

  const db = readDB();
  const settings = db.providerSettings.find(
    (s) => s.providerId === me.providerId
  );
  if (me.role !== "stilwater_admin" && !settings?.whatsappConnected) {
    return NextResponse.json(
      { error: "whatsapp_not_connected" },
      { status: 400 }
    );
  }

  const sent = updateDB((inner) => {
    let count = 0;
    for (const id of leadIds) {
      const lead = inner.leads.find((l) => l.id === id);
      if (!lead) continue;
      if (me.role !== "stilwater_admin" && lead.providerId !== me.providerId)
        continue;
      const first = lead.name.split(" ")[0];
      const msg = text.replace(/\{name\}/g, first).replace(/\{first\}/g, first);
      pushMessage(inner, {
        leadId: lead.id,
        channel: "whatsapp",
        text: msg,
      });
      count += 1;
    }
    return count;
  });

  return NextResponse.json({ sent });
}
