"use client";

import { useState } from "react";
import Link from "next/link";

export default function AvatarGate({
  credits,
  providerId,
  leadId,
}: {
  credits: number;
  providerId: string;
  leadId: string;
}) {
  const [payUrl, setPayUrl] = useState<string | null>(null);

  async function topUp() {
    const r = await fetch("/api/patient/credits", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ kind: "avatar" }),
    }).then((r) => r.json());
    setPayUrl(`/pay-link/${r.paymentLink.token}`);
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="label">AI avatar</p>
        <h1 className="text-2xl font-semibold">
          Talk to Maya, the AI avatar
        </h1>
        <p className="text-sm text-slate-500">
          Get structured history-taking and next-step advice. Sessions are
          reviewed by a clinician within 24 hours.
        </p>
      </div>

      <div className="card p-5 flex items-center justify-between">
        <div>
          <div className="label">Avatar credits</div>
          <div className="text-2xl font-semibold">{credits}</div>
          <div className="text-xs text-slate-500">
            Each avatar session uses 1 credit
          </div>
        </div>
        <div>
          {payUrl ? (
            <a
              className="btn-primary"
              href={payUrl}
              target="_blank"
              rel="noreferrer"
            >
              Pay ₹999 →
            </a>
          ) : (
            <button className="btn-ghost" onClick={topUp}>
              Buy 3 credits (₹999)
            </button>
          )}
        </div>
      </div>

      {credits > 0 ? (
        <Link
          href={`/avatar?provider=${providerId}&leadId=${leadId}`}
          className="btn-primary"
        >
          Start avatar session →
        </Link>
      ) : (
        <div className="card p-5 bg-amber-50 border-amber-200 text-sm">
          You have no avatar credits. Use the button above to buy more.
        </div>
      )}
    </div>
  );
}
