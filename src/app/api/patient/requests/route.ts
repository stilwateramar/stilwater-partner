import { NextResponse } from "next/server";
import { getPartnerUser, getPatient } from "@/lib/auth";
import { newId, readDB, updateDB } from "@/lib/db";
import { pushMessage } from "@/lib/messaging";
import type { PatientRequest, PatientRequestStatus } from "@/lib/types";

export async function GET() {
  const patient = getPatient();
  const partner = getPartnerUser();
  const db = readDB();
  if (patient) {
    return NextResponse.json({
      requests: db.patientRequests.filter((r) => r.patientId === patient.id),
    });
  }
  if (partner) {
    const scoped = db.patientRequests.filter((r) =>
      partner.providerId ? r.providerId === partner.providerId : true
    );
    const withPatient = scoped.map((r) => {
      const p = db.patients.find((x) => x.id === r.patientId);
      return {
        ...r,
        patient: p
          ? { id: p.id, name: p.name, phone: p.phone, email: p.email }
          : null,
      };
    });
    return NextResponse.json({ requests: withPatient });
  }
  return NextResponse.json({ error: "unauth" }, { status: 401 });
}

export async function POST(req: Request) {
  const patient = getPatient();
  if (!patient) return NextResponse.json({ error: "unauth" }, { status: 401 });
  const { subject, message } = (await req.json()) as {
    subject?: string;
    message?: string;
  };
  if (!subject?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const request: PatientRequest = {
    id: newId("req"),
    patientId: patient.id,
    providerId: patient.providerId,
    subject: subject.trim(),
    message: message.trim(),
    status: "open",
    createdAt: new Date().toISOString(),
  };

  updateDB((db) => {
    db.patientRequests.unshift(request);

    // Notify the partner admins via simulated email + WhatsApp.
    const provider = db.providers.find((p) => p.id === patient.providerId);
    const admins = db.users.filter(
      (u) =>
        u.providerId === patient.providerId &&
        (u.role === "admin" || u.role === "owner")
    );
    const summary = [
      `📨 New request from ${patient.name} (${patient.phone}) to ${
        provider?.name ?? "your team"
      }`,
      `Subject: ${request.subject}`,
      "",
      request.message,
    ].join("\n");

    // Patient-side confirmation in their WhatsApp thread.
    pushMessage(db, {
      patientId: patient.id,
      channel: "whatsapp",
      text: `We've received your request: "${request.subject}". Our team will get back to you soon. — ${
        provider?.name ?? "Stillwater"
      }`,
    });

    // Admin-side notifications (email + WhatsApp to the provider thread).
    if (admins.length && provider) {
      pushMessage(db, {
        patientId: patient.id,
        channel: "whatsapp",
        text: `[ADMIN ALERT] ${summary}`,
      });
      for (const a of admins) {
        pushMessage(db, {
          patientId: patient.id,
          channel: "email",
          text: `Subject: New patient request — ${request.subject}\n\nTo: ${a.email}\n\n${summary}\n\nOpen in admin: /partner/requests`,
        });
      }
    }
  });

  return NextResponse.json({ request });
}

export async function PATCH(req: Request) {
  const partner = getPartnerUser();
  if (!partner) return NextResponse.json({ error: "unauth" }, { status: 401 });
  const { id, status } = (await req.json()) as {
    id: string;
    status: PatientRequestStatus;
  };
  const result = updateDB((db) => {
    const r = db.patientRequests.find((x) => x.id === id);
    if (!r) return null;
    if (partner.providerId && r.providerId !== partner.providerId) return null;
    r.status = status;
    if (status === "resolved") r.resolvedAt = new Date().toISOString();
    return r;
  });
  if (!result) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ request: result });
}
