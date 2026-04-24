import { NextResponse } from "next/server";
import { canManageTeam, getPartnerUser } from "@/lib/auth";
import { readDB, updateDB } from "@/lib/db";

export async function GET() {
  const me = getPartnerUser();
  if (!me) return NextResponse.json({ error: "unauth" }, { status: 401 });
  const db = readDB();
  const provider = me.providerId
    ? db.providers.find((p) => p.id === me.providerId)
    : null;
  return NextResponse.json({
    number: provider?.whatsappNumber ?? "",
    providerId: provider?.id ?? null,
  });
}

export async function PATCH(req: Request) {
  const me = getPartnerUser();
  if (!me) return NextResponse.json({ error: "unauth" }, { status: 401 });
  if (!canManageTeam(me))
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (!me.providerId)
    return NextResponse.json({ error: "no_provider" }, { status: 400 });
  const { number } = await req.json();
  const updated = updateDB((db) => {
    const p = db.providers.find((x) => x.id === me.providerId);
    if (!p) return null;
    p.whatsappNumber = String(number ?? "").trim();
    return p.whatsappNumber;
  });
  return NextResponse.json({ number: updated });
}
