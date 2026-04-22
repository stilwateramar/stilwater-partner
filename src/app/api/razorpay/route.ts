import { NextResponse } from "next/server";
import { readDB, updateDB, newId } from "@/lib/db";

// Mock Razorpay order + capture.
// In production this would call Razorpay SDK with key_id/key_secret
// and return the real order. We simulate the round-trip here.
export async function POST(req: Request) {
  const { action, consultationId, amountInr } = await req.json();
  const db = readDB();

  if (action === "create_order") {
    const order = {
      id: `order_${newId("rzp")}`,
      entity: "order",
      amount: (amountInr ?? 0) * 100,
      currency: "INR",
      status: "created",
      created_at: Math.floor(Date.now() / 1000),
      notes: { consultationId },
    };
    return NextResponse.json({ order });
  }

  if (action === "capture") {
    const paymentId = `pay_${newId("rzp")}`;
    updateDB((db) => {
      const c = db.consultations.find((x) => x.id === consultationId);
      if (c) {
        c.status = "confirmed";
        c.razorpayPaymentId = paymentId;
      }
      const lead = c ? db.leads.find((l) => l.id === c.leadId) : undefined;
      if (lead) lead.status = "consultation_booked";
    });
    return NextResponse.json({
      paymentId,
      status: "captured",
    });
  }

  return NextResponse.json({ error: "unknown_action" }, { status: 400 });
}
