import { NextResponse } from "next/server";
import { readDB, updateDB, newId } from "@/lib/db";
import type { Consultation } from "@/lib/types";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const leadId = url.searchParams.get("leadId");
  const providerId = url.searchParams.get("providerId");
  const db = readDB();
  const list = db.consultations.filter(
    (c) =>
      (!leadId || c.leadId === leadId) &&
      (!providerId || c.providerId === providerId)
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
