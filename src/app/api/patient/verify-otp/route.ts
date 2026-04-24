import { NextResponse } from "next/server";
import { readDB, updateDB } from "@/lib/db";
import { setSessionCookie } from "@/lib/auth";

function digits(s: string) {
  return s.replace(/\D+/g, "");
}

export async function POST(req: Request) {
  const { phone, code } = await req.json();
  const db = readDB();
  const d = digits(phone ?? "");
  const otp = db.otps.find((o) => digits(o.phone) === d && o.code === code);
  if (!otp || new Date(otp.expiresAt).getTime() < Date.now()) {
    return NextResponse.json({ error: "invalid_or_expired" }, { status: 401 });
  }

  const patient = db.patients.find((p) => digits(p.phone) === d);
  if (!patient) {
    return NextResponse.json(
      {
        error: "no_account",
        hint:
          "We couldn't find an account for this phone. Sign up at /patient/signup — either with a partner code or as a community member.",
      },
      { status: 404 }
    );
  }

  updateDB((d) => {
    d.otps = d.otps.filter((o) => digits(o.phone) !== digits(phone));
  });
  setSessionCookie({ kind: "patient", userId: patient.id });
  return NextResponse.json({ patient });
}
