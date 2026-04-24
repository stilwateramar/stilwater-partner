import { NextResponse } from "next/server";
import { canManageTeam, getPartnerUser, hashPassword } from "@/lib/auth";
import { readDB, updateDB, newId } from "@/lib/db";
import type { User, UserRole } from "@/lib/types";

export async function GET() {
  const me = getPartnerUser();
  if (!me) return NextResponse.json({ error: "unauth" }, { status: 401 });
  if (!canManageTeam(me))
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const db = readDB();
  const users = db.users.filter((u) =>
    me.providerId ? u.providerId === me.providerId : true
  );
  return NextResponse.json({
    users: users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      providerId: u.providerId,
      language: u.language,
    })),
  });
}

export async function POST(req: Request) {
  const me = getPartnerUser();
  if (!me) return NextResponse.json({ error: "unauth" }, { status: 401 });
  if (!canManageTeam(me))
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const body = await req.json();
  if (!body.email || !body.name || !body.password || !body.role) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }
  const providerId = me.role === "stilwater_admin" ? body.providerId : me.providerId;

  const user: User = {
    id: newId("u"),
    providerId,
    email: body.email,
    name: body.name,
    passwordHash: hashPassword(body.password),
    role: body.role as UserRole,
    createdAt: new Date().toISOString(),
  };
  updateDB((db) => {
    if (db.users.find((u) => u.email.toLowerCase() === user.email.toLowerCase())) {
      throw new Error("exists");
    }
    db.users.push(user);
  });
  return NextResponse.json({ user: { ...user, passwordHash: undefined } });
}
