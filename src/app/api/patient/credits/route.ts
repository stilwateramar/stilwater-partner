import { NextResponse } from "next/server";
import { getPatient } from "@/lib/auth";
import { newId, updateDB } from "@/lib/db";
import { pushMessage } from "@/lib/messaging";
import type { PaymentLink } from "@/lib/types";

// Patient self-service top-up. Generates a payment link for chatbot or
// avatar credits and returns the pay URL.
export async function POST(req: Request) {
  const patient = getPatient();
  if (!patient) return NextResponse.json({ error: "unauth" }, { status: 401 });
  const { kind } = (await req.json()) as { kind: "chatbot" | "avatar" };

  const desc =
    kind === "chatbot" ? "10 SHARAN chatbot credits" : "3 AI avatar consultations";
  const amount = kind === "chatbot" ? 499 : 999;

  const link = updateDB((db) => {
    const pl: PaymentLink = {
      id: newId("pl"),
      token: newId("tok"),
      patientId: patient.id,
      leadId: patient.leadId,
      providerId: patient.providerId,
      purpose: kind === "chatbot" ? "chatbot_credits" : "avatar_credits",
      amountInr: amount,
      description: desc,
      status: "sent",
      createdAt: new Date().toISOString(),
      createdByUserId: "self_service",
    };
    db.paymentLinks.unshift(pl);

    const url = `/pay-link/${pl.token}`;
    if (patient.leadId) {
      pushMessage(db, {
        leadId: patient.leadId,
        patientId: patient.id,
        channel: "whatsapp",
        text: `Top-up requested — ${desc} — ₹${amount}.\nPay: ${url}`,
      });
    }
    return pl;
  });

  return NextResponse.json({ paymentLink: link });
}
