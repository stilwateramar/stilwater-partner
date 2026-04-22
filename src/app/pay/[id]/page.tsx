"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { humanSlot } from "@/lib/slots";

export default function PayPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [order, setOrder] = useState<any>(null);
  const [stage, setStage] = useState<"idle" | "creating" | "razorpay" | "done">(
    "idle"
  );
  const [paymentId, setPaymentId] = useState<string>("");

  useEffect(() => {
    fetch(`/api/consultations/${params.id}`)
      .then((r) => r.json())
      .then(setData);
  }, [params.id]);

  async function pay() {
    setStage("creating");
    const o = await fetch("/api/razorpay", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        action: "create_order",
        consultationId: params.id,
        amountInr: data.consultation.amountInr,
      }),
    }).then((r) => r.json());
    setOrder(o.order);
    setStage("razorpay");
  }

  async function capture() {
    const r = await fetch("/api/razorpay", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        action: "capture",
        consultationId: params.id,
      }),
    }).then((r) => r.json());
    setPaymentId(r.paymentId);
    setStage("done");
    setTimeout(() => router.push(`/consultation/${params.id}`), 1200);
  }

  if (!data) return <div>Loading…</div>;
  const { consultation, lead, provider, doctor } = data;

  return (
    <div className="max-w-xl mx-auto space-y-5">
      <p className="label">Payment</p>
      <h1 className="text-2xl font-semibold">Confirm &amp; pay</h1>

      <div className="card p-5">
        <div className="flex items-center justify-between">
          <div className="font-medium">{provider.name}</div>
          <span className="badge bg-slate-100 text-slate-700">
            {consultation.status}
          </span>
        </div>
        <div className="mt-2 text-sm text-slate-600">
          {doctor?.name} — {humanSlot(consultation.slot)}
        </div>
        <div className="mt-4 border-t border-slate-100 pt-3 flex items-center justify-between">
          <span>Amount due</span>
          <span className="text-lg font-semibold">
            ₹{consultation.amountInr}
          </span>
        </div>
        <div className="text-xs text-slate-500 mt-1">
          Booking for {lead.name} · {lead.phone}
        </div>
      </div>

      {stage === "idle" && (
        <button className="btn-primary w-full" onClick={pay}>
          Pay with Razorpay
        </button>
      )}

      {stage === "creating" && (
        <div className="text-sm text-slate-500">
          Creating Razorpay order…
        </div>
      )}

      {stage === "razorpay" && order && (
        <div className="card p-5 border-2 border-[#3395FF]">
          <div className="flex items-center gap-2 text-[#3395FF] font-semibold">
            <span className="h-3 w-3 rounded-full bg-[#3395FF]" /> Razorpay
            checkout (mock)
          </div>
          <div className="text-xs mt-1 text-slate-500">Order {order.id}</div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <button className="btn-ghost">UPI</button>
            <button className="btn-ghost">Cards</button>
            <button className="btn-ghost">Netbanking</button>
            <button className="btn-ghost">Wallet</button>
          </div>
          <div className="mt-4 text-sm text-slate-600">
            Amount: ₹{consultation.amountInr}
          </div>
          <button className="btn-primary w-full mt-4" onClick={capture}>
            Simulate successful payment →
          </button>
        </div>
      )}

      {stage === "done" && (
        <div className="card p-5 border-2 border-emerald-500">
          <div className="font-semibold text-emerald-700">Payment captured</div>
          <div className="text-xs text-slate-500">payment_id: {paymentId}</div>
          <div className="mt-3 text-sm">
            Redirecting to your consultation room…
          </div>
          <Link className="text-sm underline" href={`/consultation/${params.id}`}>
            Go now →
          </Link>
        </div>
      )}
    </div>
  );
}
