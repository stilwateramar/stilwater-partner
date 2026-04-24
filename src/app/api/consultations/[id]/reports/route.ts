import { NextResponse } from "next/server";
import { getPartnerUser } from "@/lib/auth";
import { readDB } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const user = getPartnerUser();
  if (!user) return NextResponse.json({ reports: [] });
  const db = readDB();
  const c = db.consultations.find((x) => x.id === params.id);
  if (!c) return NextResponse.json({ reports: [] });
  if (user.providerId && c.providerId !== user.providerId)
    return NextResponse.json({ reports: [] });
  const patient =
    db.patients.find((p) => p.id === c.patientId) ??
    db.patients.find((p) => p.leadId === c.leadId);
  if (!patient) return NextResponse.json({ reports: [] });
  const reports = db.reports.filter((r) => r.patientId === patient.id);
  return NextResponse.json({ reports });
}
