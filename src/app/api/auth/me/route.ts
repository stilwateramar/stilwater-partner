import { NextResponse } from "next/server";
import { getPartnerUser, getPatient, getSession } from "@/lib/auth";
import { readDB } from "@/lib/db";

export async function GET() {
  const session = getSession();
  if (!session) return NextResponse.json({ user: null, patient: null });

  if (session.kind === "partner") {
    const user = getPartnerUser();
    if (!user) return NextResponse.json({ user: null, patient: null });
    const db = readDB();
    const provider = user.providerId
      ? db.providers.find((p) => p.id === user.providerId)
      : null;
    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        providerId: user.providerId,
      },
      provider,
      patient: null,
    });
  }

  const patient = getPatient();
  if (!patient) return NextResponse.json({ user: null, patient: null });
  const db = readDB();
  const provider = db.providers.find((p) => p.id === patient.providerId);
  return NextResponse.json({ user: null, patient, provider });
}
