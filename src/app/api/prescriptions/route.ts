import { NextResponse } from "next/server";
import { getPartnerUser, getPatient } from "@/lib/auth";
import { newId, updateDB, readDB } from "@/lib/db";
import { pushMessage } from "@/lib/messaging";
import type { Prescription } from "@/lib/types";

export async function POST(req: Request) {
  const user = getPartnerUser();
  if (!user) return NextResponse.json({ error: "unauth" }, { status: 401 });
  if (user.role !== "doctor" && user.role !== "admin" && user.role !== "owner") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const body = await req.json();
  if (!body.consultationId || !body.items) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const result = updateDB((db) => {
    const c = db.consultations.find((x) => x.id === body.consultationId);
    if (!c) return { error: "consult_not_found" as const };
    const patient =
      db.patients.find((p) => p.id === c.patientId) ??
      db.patients.find((p) => p.leadId === c.leadId);
    if (!patient) return { error: "patient_not_found" as const };

    const p: Prescription = {
      id: newId("rx"),
      consultationId: c.id,
      patientId: patient.id,
      providerId: c.providerId,
      doctorId: c.doctorId ?? user.doctorId ?? "",
      items: body.items,
      lifestyle: body.lifestyle ?? [],
      nextFollowUpDays: body.nextFollowUpDays,
      notes: body.notes,
      issuedAt: new Date().toISOString(),
    };
    db.prescriptions.push(p);
    c.prescriptionId = p.id;

    pushMessage(db, {
      leadId: c.leadId,
      patientId: patient.id,
      channel: "whatsapp",
      text: `Your prescription from today's consultation is ready. View it in your patient portal: /patient/prescriptions`,
    });
    if (patient.email) {
      pushMessage(db, {
        leadId: c.leadId,
        patientId: patient.id,
        channel: "email",
        text: `Subject: Your prescription\n\nHi ${patient.name},\n\nYour prescription from today's consultation is now available in your Stilwater portal.\nOpen it here: /patient/prescriptions\n\nIf a follow-up was recommended, you can book it right from the portal.\n\nWarm regards,\nYour care team`,
      });
    }
    return { prescription: p };
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }
  return NextResponse.json(result);
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const consultationId = url.searchParams.get("consultationId");
  const partner = getPartnerUser();
  const patient = getPatient();
  const db = readDB();

  let list = consultationId
    ? db.prescriptions.filter((p) => p.consultationId === consultationId)
    : db.prescriptions;

  if (partner?.role === "stilwater_admin") {
    // no additional filter
  } else if (partner?.providerId) {
    list = list.filter((p) => p.providerId === partner.providerId);
  } else if (patient) {
    list = list.filter((p) => p.patientId === patient.id);
  } else {
    list = [];
  }
  return NextResponse.json({ prescriptions: list });
}
