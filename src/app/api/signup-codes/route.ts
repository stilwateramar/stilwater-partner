import { NextResponse } from "next/server";
import { canManageTeam, getPartnerUser } from "@/lib/auth";
import { newId, readDB, updateDB } from "@/lib/db";
import type { SignupCode } from "@/lib/types";

function generateCode() {
  // 8-character human-friendly code, avoids confusing chars.
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 8; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `${out.slice(0, 4)}-${out.slice(4)}`;
}

export async function GET() {
  const me = getPartnerUser();
  if (!me) return NextResponse.json({ error: "unauth" }, { status: 401 });
  if (!canManageTeam(me))
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const db = readDB();
  const codes = db.signupCodes.filter((c) =>
    me.providerId ? c.providerId === me.providerId : true
  );
  return NextResponse.json({ codes });
}

export async function POST(req: Request) {
  const me = getPartnerUser();
  if (!me) return NextResponse.json({ error: "unauth" }, { status: 401 });
  if (!canManageTeam(me))
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (!me.providerId)
    return NextResponse.json({ error: "no_provider" }, { status: 400 });

  const body = await req.json();
  const { programId, intendedName, intendedPhone, intendedEmail } = body as {
    programId?: string;
    intendedName?: string;
    intendedPhone?: string;
    intendedEmail?: string;
  };

  const created = updateDB((db) => {
    // Ensure uniqueness.
    let code = generateCode();
    while (db.signupCodes.some((c) => c.code === code)) {
      code = generateCode();
    }
    const row: SignupCode = {
      id: newId("sc"),
      code,
      providerId: me.providerId!,
      programId,
      intendedName,
      intendedPhone,
      intendedEmail,
      createdByUserId: me.id,
      createdAt: new Date().toISOString(),
    };
    db.signupCodes.unshift(row);
    return row;
  });
  return NextResponse.json({ code: created });
}
