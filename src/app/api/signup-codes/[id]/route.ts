import { NextResponse } from "next/server";
import { canManageTeam, getPartnerUser } from "@/lib/auth";
import { updateDB } from "@/lib/db";

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const me = getPartnerUser();
  if (!me) return NextResponse.json({ error: "unauth" }, { status: 401 });
  if (!canManageTeam(me))
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const result = updateDB((db) => {
    const c = db.signupCodes.find((x) => x.id === params.id);
    if (!c) return null;
    if (me.providerId && c.providerId !== me.providerId) return null;
    if (c.usedByPatientId) return { error: "already_used" as const };
    db.signupCodes = db.signupCodes.filter((x) => x.id !== params.id);
    return { ok: true };
  });
  if (!result) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json(result);
}
