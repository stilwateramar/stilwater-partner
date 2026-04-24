import { NextResponse } from "next/server";
import { readDB } from "@/lib/db";
import { getPartnerUser, getPatient } from "@/lib/auth";

export async function GET() {
  const db = readDB();
  const partner = getPartnerUser();
  const patient = getPatient();

  if (partner && partner.role !== "stilwater_admin" && partner.providerId) {
    const providers = db.providers.filter((p) => p.id === partner.providerId);
    const doctors = db.doctors.filter((d) => d.providerId === partner.providerId);
    return NextResponse.json({ providers, doctors });
  }
  if (patient) {
    const providers = db.providers.filter((p) => p.id === patient.providerId);
    const doctors = db.doctors.filter((d) => d.providerId === patient.providerId);
    return NextResponse.json({ providers, doctors });
  }

  return NextResponse.json({ providers: db.providers, doctors: db.doctors });
}
