"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function PatientLogin() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [stage, setStage] = useState<"phone" | "code">("phone");
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function requestOtp() {
    setErr("");
    setBusy(true);
    const r = await fetch("/api/patient/request-otp", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ phone }),
    });
    setBusy(false);
    if (!r.ok) {
      setErr("Could not send OTP.");
      return;
    }
    const d = await r.json();
    setDevOtp(d.devOtp);
    setStage("code");
  }

  async function verify() {
    setErr("");
    setBusy(true);
    const r = await fetch("/api/patient/verify-otp", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ phone, code }),
    });
    setBusy(false);
    if (!r.ok) {
      const d = await r.json().catch(() => ({}));
      setErr(d.hint ?? "Invalid or expired OTP.");
      return;
    }
    router.push("/patient/dashboard");
  }

  return (
    <div className="max-w-md mx-auto mt-10 card p-6">
      <p className="label">Patient login</p>
      <h1 className="text-2xl font-semibold">Sign in with your phone</h1>
      <p className="text-sm text-slate-500 mt-1">
        Use the phone number you paid with. You'll receive a 4-digit OTP.
      </p>
      <div className="mt-5 space-y-3">
        <div>
          <div className="label">Phone</div>
          <input
            className="input"
            placeholder="+91 98xxxxxxxx"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={stage === "code"}
          />
        </div>
        {stage === "phone" && (
          <button
            className="btn-primary w-full"
            onClick={requestOtp}
            disabled={!phone || busy}
          >
            {busy ? "Sending…" : "Send OTP"}
          </button>
        )}
        {stage === "code" && (
          <>
            <div>
              <div className="label">4-digit OTP</div>
              <input
                className="input tracking-widest text-lg"
                maxLength={4}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && verify()}
              />
              {devOtp && (
                <div className="mt-2 text-xs text-slate-500">
                  Dev OTP (prototype):{" "}
                  <code className="bg-slate-100 px-1 rounded">{devOtp}</code>
                </div>
              )}
            </div>
            <button
              className="btn-primary w-full"
              onClick={verify}
              disabled={code.length !== 4 || busy}
            >
              Verify &amp; sign in
            </button>
            <button
              className="text-xs underline text-slate-500"
              onClick={() => {
                setStage("phone");
                setCode("");
                setDevOtp(null);
              }}
            >
              Change phone
            </button>
          </>
        )}
        {err && <div className="text-sm text-red-600">{err}</div>}
        <div className="pt-3 text-sm text-slate-500">
          Partner staff?{" "}
          <Link className="underline" href="/login">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
}
