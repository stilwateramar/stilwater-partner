import { NextResponse } from "next/server";
import { readDB } from "@/lib/db";
import { setSessionCookie, verifyPassword } from "@/lib/auth";

export async function POST(req: Request) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json(
      { error: "email and password required" },
      { status: 400 }
    );
  }
  const db = readDB();
  const user = db.users.find(
    (u) => u.email.toLowerCase() === String(email).toLowerCase()
  );
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
  }
  setSessionCookie({ kind: "partner", userId: user.id });
  return NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role, providerId: user.providerId },
  });
}
