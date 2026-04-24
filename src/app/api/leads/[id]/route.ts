import { NextResponse } from "next/server";
import { readDB, updateDB } from "@/lib/db";
import { getPartnerUser, getPatient } from "@/lib/auth";

function canRead(
  lead: { providerId: string; patientId?: string; id: string },
  partner: ReturnType<typeof getPartnerUser>,
  patient: ReturnType<typeof getPatient>
): boolean {
  if (partner?.role === "stilwater_admin") return true;
  if (partner?.providerId && lead.providerId === partner.providerId)
    return true;
  if (patient && (patient.leadId === lead.id || lead.patientId === patient.id))
    return true;
  return false;
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const db = readDB();
  const lead = db.leads.find((l) => l.id === params.id);
  if (!lead) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (!canRead(lead, getPartnerUser(), getPatient()))
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const provider = db.providers.find((p) => p.id === lead.providerId);
  return NextResponse.json({ lead, provider });
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const patch = await req.json();
  const partner = getPartnerUser();
  const patient = getPatient();
  const lead = updateDB((db) => {
    const l = db.leads.find((x) => x.id === params.id);
    if (!l) return null;
    if (!canRead(l, partner, patient)) return null;
    Object.assign(l, patch);
    return l;
  });
  if (!lead) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  return NextResponse.json({ lead });
}
