import { NextResponse } from "next/server";
import { readDB, updateDB, newId } from "@/lib/db";
import { getPartnerUser, getPatient } from "@/lib/auth";
import type { Consultation } from "@/lib/types";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const leadId = url.searchParams.get("leadId");
  const requestedProviderId = url.searchParams.get("providerId");
  const partner = getPartnerUser();
  const patient = getPatient();
  const db = readDB();

  // Determine the scope the caller is allowed to see.
  let scope: (c: Consultation) => boolean;
  if (partner?.role === "stilwater_admin") {
    scope = () => true;
  } else if (partner?.providerId) {
    scope = (c) => c.providerId === partner.providerId;
  } else if (patient) {
    scope = (c) =>
      c.patientId === patient.id || (!!patient.leadId && c.leadId === patient.leadId);
  } else {
    // Anonymous callers (e.g. the public booking page) can only see slot
    // availability for a specific provider — never other providers' data.
    if (!requestedProviderId) return NextResponse.json({ consultations: [] });
    scope = (c) => c.providerId === requestedProviderId;
  }

  const list = db.consultations.filter(
    (c) =>
      scope(c) &&
      (!leadId || c.leadId === leadId) &&
      (!requestedProviderId || c.providerId === requestedProviderId)
  );
  return NextResponse.json({ consultations: list });
}

export async function POST(req: Request) {
  const body = (await req.json()) as Partial<Consultation> & {
    doctorId?: string;
  };
  if (!body.leadId || !body.providerId || !body.slot || !body.type) {
    return NextResponse.json(
      { error: "leadId, providerId, slot, type required" },
      { status: 400 }
    );
  }

  // A partner user can only create consultations for leads in their own
  // provider. Anonymous booking flows keep working because they POST the
  // providerId matching the lead they just created.
  const partner = getPartnerUser();
  if (
    partner &&
    partner.role !== "stilwater_admin" &&
    partner.providerId !== body.providerId
  ) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const consult = updateDB((db) => {
    const doctor = body.doctorId
      ? db.doctors.find((d) => d.id === body.doctorId)
      : undefined;
    const lead = db.leads.find((l) => l.id === body.leadId);
    if (lead) lead.status = "consultation_booked";

    const c: Consultation = {
      id: newId("con"),
      leadId: body.leadId!,
      providerId: body.providerId!,
      doctorId: body.doctorId,
      type: body.type!,
      slot: body.slot!,
      amountInr:
        body.type === "ai_avatar" ? 0 : doctor?.feeInr ?? body.amountInr ?? 1000,
      status: body.type === "ai_avatar" ? "confirmed" : "payment_pending",
      createdAt: new Date().toISOString(),
    };
    db.consultations.unshift(c);
    return c;
  });

  return NextResponse.json({ consultation: consult });
}
