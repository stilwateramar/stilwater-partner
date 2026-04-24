import { NextResponse } from "next/server";
import { newId, updateDB } from "@/lib/db";
import { setSessionCookie } from "@/lib/auth";
import type { Patient } from "@/lib/types";

const STILWATER_PROVIDER_ID = "stilwater_community";

export async function POST(req: Request) {
  const body = await req.json();
  const { name, phone, email, code } = body as {
    name?: string;
    phone?: string;
    email?: string;
    code?: string;
  };
  if (!name?.trim() || !phone?.trim()) {
    return NextResponse.json(
      { error: "name_and_phone_required" },
      { status: 400 }
    );
  }

  const result = updateDB((db) => {
    // Duplicate phone guard.
    const existing = db.patients.find((p) => p.phone === phone);
    if (existing) return { error: "phone_in_use" as const };

    let providerId = STILWATER_PROVIDER_ID;
    let programId: string | undefined;
    let signupCodeValue: string | undefined;

    if (code) {
      const normalised = code.trim().toUpperCase();
      const sc = db.signupCodes.find(
        (c) => c.code.toUpperCase() === normalised
      );
      if (!sc) return { error: "invalid_code" as const };
      if (sc.usedByPatientId) return { error: "already_used" as const };
      providerId = sc.providerId;
      programId = sc.programId;
      signupCodeValue = sc.code;

      const patient: Patient = {
        id: newId("pat"),
        name: name.trim(),
        phone: phone.trim(),
        email: email?.trim() || undefined,
        providerId,
        programId,
        signupCode: signupCodeValue,
        createdAt: new Date().toISOString(),
        chatbotCredits: programId ? 5 : 0,
        avatarCredits: 0,
      };
      db.patients.push(patient);
      sc.usedByPatientId = patient.id;
      sc.usedAt = new Date().toISOString();
      return { patient };
    }

    // Generic signup (no provider yet) — parked against the Stilwater
    // community. Admins can attach them to a plan later.
    const patient: Patient = {
      id: newId("pat"),
      name: name.trim(),
      phone: phone.trim(),
      email: email?.trim() || undefined,
      providerId: STILWATER_PROVIDER_ID,
      createdAt: new Date().toISOString(),
      chatbotCredits: 0,
      avatarCredits: 0,
    };
    db.patients.push(patient);
    return { patient };
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  setSessionCookie({ kind: "patient", userId: result.patient.id });
  return NextResponse.json({ patient: result.patient });
}
