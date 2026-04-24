import { NextResponse } from "next/server";
import { getPartnerUser } from "@/lib/auth";
import { updateDB } from "@/lib/db";
import { pushMessage } from "@/lib/messaging";

export async function POST(req: Request) {
  const user = getPartnerUser();
  if (!user) return NextResponse.json({ error: "unauth" }, { status: 401 });
  const { paymentLinkId } = await req.json();
  if (!paymentLinkId) {
    return NextResponse.json({ error: "paymentLinkId_required" }, { status: 400 });
  }
  const result = updateDB((db) => {
    const link = db.paymentLinks.find((p) => p.id === paymentLinkId);
    if (!link) return null;
    if (user.providerId && link.providerId !== user.providerId) return null;
    if (!link.leadId) return null;
    const lead = db.leads.find((l) => l.id === link.leadId);
    if (!lead) return null;
    const url = `/pay-link/${link.token}`;
    pushMessage(db, {
      leadId: lead.id,
      channel: "whatsapp",
      text: `Hi ${lead.name.split(" ")[0]}, here's your secure payment link for "${link.description}" — ₹${link.amountInr}.\n\nPay here: ${url}`,
    });
    return { ok: true };
  });
  if (!result)
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json(result);
}
