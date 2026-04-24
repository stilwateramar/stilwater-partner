import { NextResponse } from "next/server";
import { updateDB } from "@/lib/db";

function digits(s: string) {
  return s.replace(/\D+/g, "");
}

export async function POST(req: Request) {
  const { phone } = await req.json();
  if (!phone) return NextResponse.json({ error: "phone required" }, { status: 400 });

  const code = String(Math.floor(1000 + Math.random() * 9000));
  updateDB((db) => {
    const d = digits(phone);
    db.otps = db.otps.filter((o) => digits(o.phone) !== d);
    db.otps.push({
      phone,
      code,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    });
  });

  // In a real system we'd send this via WhatsApp / SMS. We surface it
  // directly so the prototype flow doesn't require a real gateway.
  return NextResponse.json({ ok: true, devOtp: code });
}
