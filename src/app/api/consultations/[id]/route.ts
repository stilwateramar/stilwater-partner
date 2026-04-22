import { NextResponse } from "next/server";
import { readDB, updateDB } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const db = readDB();
  const c = db.consultations.find((x) => x.id === params.id);
  if (!c) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const lead = db.leads.find((l) => l.id === c.leadId);
  const provider = db.providers.find((p) => p.id === c.providerId);
  const doctor = db.doctors.find((d) => d.id === c.doctorId);
  const transcript = db.transcripts.find((t) => t.consultationId === c.id);
  return NextResponse.json({ consultation: c, lead, provider, doctor, transcript });
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const patch = await req.json();
  const c = updateDB((db) => {
    const x = db.consultations.find((c) => c.id === params.id);
    if (!x) return null;
    Object.assign(x, patch);
    return x;
  });
  if (!c) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ consultation: c });
}
