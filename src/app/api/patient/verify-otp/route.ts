import { NextResponse } from "next/server";
import { readDB, updateDB } from "@/lib/db";
import { setSessionCookie } from "@/lib/auth";

export async function POST(req: Request) {
  const { phone, code } = await req.json();
  const db = readDB();
  const otp = db.otps.find((o) => o.phone === phone && o.code === code);
  if (!otp || new Date(otp.expiresAt).getTime() < Date.now()) {
    return NextResponse.json({ error: "invalid_or_expired" }, { status: 401 });
  }

  const patient = db.patients.find((p) => p.phone === phone);
  if (!patient) {
    return NextResponse.json(
      {
        error: "no_account",
        hint:
          "Patient accounts are created only after successful program payment. Complete the payment link first.",
      },
      { status: 404 }
    );
  }

  updateDB((d) => {
    d.otps = d.otps.filter((o) => o.phone !== phone);
  });
  setSessionCookie({ kind: "patient", userId: patient.id });
  return NextResponse.json({ patient });
}
