"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function PayLink({ params }: { params: { token: string } }) {
  const [data, setData] = useState<any>(null);
  const [stage, setStage] = useState<"idle" | "pay" | "done" | "error">("idle");
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/payment-links/${params.token}`)
      .then((r) => r.json())
      .then(setData);
  }, [params.token]);

  async function pay() {
    setStage("pay");
    await new Promise((r) => setTimeout(r, 1200));
    const res = await fetch(`/api/payment-links/${params.token}`, {
      method: "POST",
    }).then((r) => r.json());
    if (res.error) setStage("error");
    else {
      setResult(res);
      setStage("done");
    }
  }

  if (!data) return <div>Loading…</div>;
  if (data.error) return <div>Invalid or expired link.</div>;

  const { paymentLink, provider, lead } = data;

  if (stage === "done" && result?.invoiceId) {
    return (
      <div className="max-w-md mx-auto mt-10 card p-6">
        <div className="text-emerald-700 font-semibold">
          ✅ Payment successful
        </div>
        <p className="mt-2 text-sm text-slate-600">
          Thank you, {lead?.name?.split(" ")[0] ?? "there"}! Your invoice and
          onboarding link are being sent to you on WhatsApp and email.
        </p>
        <div className="mt-4 flex flex-col gap-2">
          <Link
            href={`/invoice/${result.invoiceId}`}
            className="btn-primary"
            target="_blank"
          >
            View invoice
          </Link>
          {paymentLink.purpose === "program" && (
            <Link href="/patient/login" className="btn-ghost">
              Sign in to your patient portal →
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10 card overflow-hidden">
      <div
        className="h-16 px-5 flex items-center gap-3"
        style={{ background: provider.color, color: "white" }}
      >
        <div className="h-8 w-8 rounded-lg bg-white/30" />
        <div>
          <div className="font-semibold">{provider.name}</div>
          <div className="text-xs opacity-90">Secure payment via Razorpay</div>
        </div>
      </div>
      <div className="p-5">
        <div className="text-sm text-slate-500">Paying for</div>
        <div className="text-lg font-semibold">{paymentLink.description}</div>
        <div className="mt-3 border-t border-slate-100 pt-3 flex items-center justify-between">
          <span>Amount</span>
          <span className="text-xl font-semibold">₹{paymentLink.amountInr}</span>
        </div>
        {lead && (
          <div className="mt-3 text-xs text-slate-500">
            Billing to {lead.name} · {lead.phone}
          </div>
        )}
        <div className="mt-5 grid grid-cols-2 gap-2 text-sm">
          <button className="btn-ghost">UPI</button>
          <button className="btn-ghost">Cards</button>
          <button className="btn-ghost">Netbanking</button>
          <button className="btn-ghost">Wallet</button>
        </div>
        <button
          className="btn-primary w-full mt-4"
          onClick={pay}
          disabled={stage !== "idle"}
        >
          {stage === "idle"
            ? `Pay ₹${paymentLink.amountInr}`
            : stage === "pay"
            ? "Processing…"
            : "Done"}
        </button>
        {stage === "error" && (
          <div className="text-sm text-red-600 mt-2">
            This link has already been paid.
          </div>
        )}
      </div>
    </div>
  );
}
