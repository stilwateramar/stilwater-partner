import { NextResponse } from "next/server";
import { readDB, newId, updateDB } from "@/lib/db";
import { pushMessage } from "@/lib/messaging";
import type { Invoice, Patient } from "@/lib/types";

// Publicly readable (by token) — this is what the patient's browser hits.
export async function GET(
  _req: Request,
  { params }: { params: { token: string } }
) {
  const db = readDB();
  const link = db.paymentLinks.find((p) => p.token === params.token);
  if (!link) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const lead = link.leadId ? db.leads.find((l) => l.id === link.leadId) : undefined;
  const provider = db.providers.find((p) => p.id === link.providerId);
  return NextResponse.json({ paymentLink: link, lead, provider });
}

// Completes the payment (Razorpay simulation), creates invoice,
// creates/links patient account, sends invoice via whatsapp + email,
// and sends the onboarding link.
export async function POST(
  _req: Request,
  { params }: { params: { token: string } }
) {
  const result = updateDB((db) => {
    const link = db.paymentLinks.find((p) => p.token === params.token);
    if (!link) return { error: "not_found" as const };
    if (link.status === "paid") {
      return { error: "already_paid" as const, paymentLinkId: link.id };
    }

    const lead = link.leadId ? db.leads.find((l) => l.id === link.leadId) : undefined;
    const provider = db.providers.find((p) => p.id === link.providerId)!;

    const paymentId = `pay_${newId("rzp")}`;
    link.status = "paid";
    link.paidAt = new Date().toISOString();
    link.razorpayPaymentId = paymentId;

    // Create / reuse patient account for program purchases.
    let patient: Patient | undefined;
    if (lead && (link.purpose === "program" || link.purpose === "consultation")) {
      patient = db.patients.find((p) => p.phone === lead.phone);
      if (!patient) {
        patient = {
          id: newId("pat"),
          name: lead.name,
          phone: lead.phone,
          email: lead.email,
          providerId: lead.providerId,
          leadId: lead.id,
          createdAt: new Date().toISOString(),
          chatbotCredits: link.purpose === "program" ? 5 : 0,
          avatarCredits: 0,
        };
        db.patients.push(patient);
      }
      lead.patientId = patient.id;
      lead.status = link.purpose === "program" ? "paid" : "consultation_booked";
    } else if (lead && link.purpose === "chatbot_credits") {
      patient = db.patients.find((p) => p.id === (lead.patientId ?? ""));
      if (patient) patient.chatbotCredits += 10;
    } else if (lead && link.purpose === "avatar_credits") {
      patient = db.patients.find((p) => p.id === (lead.patientId ?? ""));
      if (patient) patient.avatarCredits += 3;
    }

    // Build invoice.
    const subtotal = link.amountInr;
    const gst = Math.round(subtotal * 0.18);
    const total = subtotal + gst;
    const number =
      `INV-${new Date().getFullYear()}-${(db.invoices.length + 1)
        .toString()
        .padStart(4, "0")}`;
    const invoice: Invoice = {
      id: newId("inv"),
      number,
      paymentLinkId: link.id,
      patientId: patient?.id,
      leadId: lead?.id,
      providerId: provider.id,
      items: [
        {
          description: link.description,
          qty: 1,
          priceInr: subtotal,
        },
      ],
      subtotalInr: subtotal,
      gstInr: gst,
      totalInr: total,
      issuedAt: new Date().toISOString(),
      customer: {
        name: lead?.name ?? patient?.name ?? "Customer",
        phone: lead?.phone ?? patient?.phone ?? "",
        email: lead?.email ?? patient?.email,
      },
    };
    db.invoices.unshift(invoice);
    link.invoiceId = invoice.id;

    // Send invoice via WhatsApp + email (simulated).
    const invoiceUrl = `/invoice/${invoice.id}`;
    const onboardUrl = `/patient/login`;
    const waText = [
      `✅ Payment received for ${link.description}`,
      `Invoice: ${invoice.number} — Total ₹${total} (incl. GST ₹${gst})`,
      `View invoice: ${invoiceUrl}`,
      link.purpose === "program"
        ? `\nWelcome to ${provider.name}! Your Stilwater portal is ready.\nSign in with your phone: ${onboardUrl}`
        : "",
    ]
      .filter(Boolean)
      .join("\n");

    if (lead) {
      pushMessage(db, { leadId: lead.id, channel: "whatsapp", text: waText });
      if (lead.email) {
        pushMessage(db, {
          leadId: lead.id,
          channel: "email",
          text: `Subject: Invoice ${invoice.number} — ${provider.name}\n\nHi ${lead.name},\n\nThank you for your payment of ₹${total}.\nYour invoice is attached at ${invoiceUrl}.\n\n${
            link.purpose === "program"
              ? `You've been onboarded to the Stilwater patient portal. Sign in with your phone: ${onboardUrl}`
              : ""
          }\n\nWarm regards,\n${provider.name} team`,
        });
      }
    }

    return { ok: true, invoiceId: invoice.id, paymentLinkId: link.id, paymentId };
  });

  if ("error" in result && result.error === "not_found") {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json(result);
}
