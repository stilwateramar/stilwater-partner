import { NextResponse } from "next/server";
import { getPartnerUser, canManageTeam } from "@/lib/auth";
import { readDB, updateDB } from "@/lib/db";

export async function GET() {
  const me = getPartnerUser();
  if (!me) return NextResponse.json({ error: "unauth" }, { status: 401 });
  const db = readDB();
  const providerId =
    me.role === "stilwater_admin" ? null : me.providerId;
  const settings = providerId
    ? db.providerSettings.find((s) => s.providerId === providerId) ?? {
        providerId,
        whatsappNumber: "",
        whatsappBusinessId: "",
        whatsappConnected: false,
        updatedAt: new Date().toISOString(),
      }
    : db.providerSettings;
  return NextResponse.json({ settings });
}

export async function PATCH(req: Request) {
  const me = getPartnerUser();
  if (!me) return NextResponse.json({ error: "unauth" }, { status: 401 });
  if (!canManageTeam(me))
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const body = await req.json();
  const providerId =
    me.role === "stilwater_admin" ? body.providerId : me.providerId;
  if (!providerId)
    return NextResponse.json({ error: "providerId required" }, { status: 400 });

  const updated = updateDB((db) => {
    let s = db.providerSettings.find((x) => x.providerId === providerId);
    if (!s) {
      s = {
        providerId,
        whatsappNumber: "",
        whatsappBusinessId: "",
        whatsappConnected: false,
        updatedAt: new Date().toISOString(),
      };
      db.providerSettings.push(s);
    }
    if (typeof body.whatsappNumber === "string")
      s.whatsappNumber = body.whatsappNumber;
    if (typeof body.whatsappBusinessId === "string")
      s.whatsappBusinessId = body.whatsappBusinessId;
    if (typeof body.whatsappConnected === "boolean")
      s.whatsappConnected = body.whatsappConnected;
    s.updatedAt = new Date().toISOString();
    return s;
  });
  return NextResponse.json({ settings: updated });
}
