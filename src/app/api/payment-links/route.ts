import { NextResponse } from "next/server";
import { getPartnerUser } from "@/lib/auth";
import { newId, updateDB } from "@/lib/db";
import { pushMessage } from "@/lib/messaging";
import type { PaymentLink, PaymentPurpose } from "@/lib/types";

export async function GET(req: Request) {
  const user = getPartnerUser();
  if (!user) return NextResponse.json({ error: "unauth" }, { status: 401 });
  const url = new URL(req.url);
  const leadId = url.searchParams.get("leadId");
  const { readDB } = await import("@/lib/db");
  const db = readDB();
  const list = db.paymentLinks.filter(
    (p) =>
      (leadId ? p.leadId === leadId : true) &&
      (user.providerId ? p.providerId === user.providerId : true)
  );
  return NextResponse.json({ paymentLinks: list });
}

export async function POST(req: Request) {
  const user = getPartnerUser();
  if (!user) return NextResponse.json({ error: "unauth" }, { status: 401 });
  const body = await req.json();
  const {
    leadId,
    purpose,
    programId,
    amountInr,
    description,
    silent,
  } = body as {
    leadId?: string;
    purpose: PaymentPurpose;
    programId?: string;
    amountInr?: number;
    description?: string;
    silent?: boolean;
  };
  if (!leadId || !purpose) {
    return NextResponse.json({ error: "leadId and purpose required" }, { status: 400 });
  }

  const link = updateDB((db) => {
    const lead = db.leads.find((l) => l.id === leadId);
    if (!lead) return null;
    const program = programId
      ? db.programs.find((p) => p.id === programId)
      : undefined;
    const amount =
      amountInr ??
      program?.priceInr ??
      (purpose === "chatbot_credits"
        ? 499
        : purpose === "avatar_credits"
        ? 999
        : 1000);

    const desc =
      description ??
      (program
        ? `${program.name} — ${program.durationWeeks} weeks`
        : purpose === "chatbot_credits"
        ? "10 SHARAN chatbot credits"
        : purpose === "avatar_credits"
        ? "3 AI avatar consultations"
        : "Consultation");

    const pl: PaymentLink = {
      id: newId("pl"),
      token: newId("tok"),
      leadId,
      providerId: lead.providerId,
      purpose,
      programId,
      amountInr: amount,
      description: desc,
      status: "sent",
      createdAt: new Date().toISOString(),
      createdByUserId: user.id,
    };
    db.paymentLinks.unshift(pl);
    lead.status = "agreed_to_purchase";

    const url = `/pay-link/${pl.token}`;
    if (!silent) {
      pushMessage(db, {
        leadId,
        channel: "whatsapp",
        text: `Hi ${lead.name.split(" ")[0]}, here's your secure payment link for "${desc}" — ₹${amount}.\n\nPay here: ${url}\n\nIf you have any questions just reply to this message.`,
      });
      if (lead.email) {
        pushMessage(db, {
          leadId,
          channel: "email",
          text: `Subject: Your payment link for ${desc}\n\nHi ${lead.name},\n\nHere's your secure payment link for ${desc} — ₹${amount}.\n\nPay here: ${url}\n\nThank you,\nSHARAN team`,
        });
      }
    }

    return pl;
  });

  if (!link) return NextResponse.json({ error: "lead_not_found" }, { status: 404 });
  return NextResponse.json({ paymentLink: link });
}
