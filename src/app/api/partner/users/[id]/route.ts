import { NextResponse } from "next/server";
import { canManageTeam, getPartnerUser } from "@/lib/auth";
import { updateDB } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const me = getPartnerUser();
  if (!me) return NextResponse.json({ error: "unauth" }, { status: 401 });
  if (!canManageTeam(me))
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const patch = await req.json();
  const user = updateDB((db) => {
    const u = db.users.find((x) => x.id === params.id);
    if (!u) return null;
    if (me.role !== "stilwater_admin" && u.providerId !== me.providerId) return null;
    if (patch.role) u.role = patch.role;
    if (patch.name) u.name = patch.name;
    return u;
  });
  if (!user) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ user: { ...user, passwordHash: undefined } });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const me = getPartnerUser();
  if (!me) return NextResponse.json({ error: "unauth" }, { status: 401 });
  if (!canManageTeam(me))
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (me.id === params.id)
    return NextResponse.json({ error: "cannot_delete_self" }, { status: 400 });
  updateDB((db) => {
    const idx = db.users.findIndex(
      (u) =>
        u.id === params.id &&
        (me.role === "stilwater_admin" || u.providerId === me.providerId)
    );
    if (idx >= 0) db.users.splice(idx, 1);
  });
  return NextResponse.json({ ok: true });
}
