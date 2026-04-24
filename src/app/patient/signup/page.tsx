"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Flow = "choose" | "sharan" | "generic";

type ValidatedCode = {
  provider: { id: string; name: string; tagline: string } | null;
  program: {
    id: string;
    name: string;
    durationWeeks: number;
    priceInr: number;
  } | null;
};

export default function PatientSignup() {
  const router = useRouter();
  const [flow, setFlow] = useState<Flow>("choose");
  const [code, setCode] = useState("");
  const [validated, setValidated] = useState<ValidatedCode | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function validateCode() {
    setErr("");
    if (!code.trim()) return setErr("Enter the code your partner shared.");
    setBusy(true);
    const r = await fetch("/api/patient/signup/validate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ code }),
    });
    setBusy(false);
    if (!r.ok) {
      const d = await r.json().catch(() => ({}));
      setErr(
        d.error === "already_used"
          ? "This code has already been used."
          : "Code not recognised. Please check with your partner admin."
      );
      return;
    }
    setValidated(await r.json());
  }

  async function signup(withCode: boolean) {
    setErr("");
    if (!form.name || !form.phone) {
      return setErr("Name and phone are required.");
    }
    setBusy(true);
    const r = await fetch("/api/patient/signup", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ...form,
        code: withCode ? code : undefined,
      }),
    });
    setBusy(false);
    if (!r.ok) {
      const d = await r.json().catch(() => ({}));
      setErr(
        d.error === "phone_in_use"
          ? "This phone is already registered. Please log in instead."
          : d.error === "invalid_code"
          ? "Signup code is invalid."
          : d.error === "already_used"
          ? "Signup code has already been used."
          : "Could not create your account."
      );
      return;
    }
    router.push("/patient/dashboard");
  }

  if (flow === "choose") {
    return (
      <div className="max-w-2xl mx-auto mt-10 grid md:grid-cols-2 gap-4">
        <div className="card p-6">
          <p className="label">Referred by a partner?</p>
          <h2 className="mt-2 font-serif text-2xl text-still-900">
            Join via your partner code
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            If you're enrolling with <b>SHARAN</b>, <b>Amar Eye Yoga</b> or
            another Stillwater partner, their admin will have shared a unique
            signup code with you.
          </p>
          <button
            className="btn-primary w-full mt-5"
            onClick={() => setFlow("sharan")}
          >
            I have a signup code
          </button>
        </div>
        <div className="card p-6">
          <p className="label">New to Stillwater?</p>
          <h2 className="mt-2 font-serif text-2xl text-still-900">
            Sign up for the community
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Join Stillwater without a partner code — explore AI healers,
            articles and match with the right partner later.
          </p>
          <button
            className="btn-ghost w-full mt-5"
            onClick={() => setFlow("generic")}
          >
            Continue as a community member
          </button>
        </div>
        <div className="md:col-span-2 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/patient/login" className="underline">
            User login
          </Link>
        </div>
      </div>
    );
  }

  if (flow === "sharan") {
    return (
      <div className="max-w-md mx-auto mt-10 card p-6">
        <p className="label">Partner signup</p>
        <h1 className="text-2xl font-semibold">Enter your signup code</h1>
        <p className="text-sm text-slate-500 mt-1">
          Your SHARAN / partner admin shared a unique 8-character code on
          WhatsApp or email.
        </p>
        <div className="mt-5 space-y-3">
          <div>
            <div className="label">Signup code</div>
            <input
              className="input uppercase tracking-widest font-mono"
              placeholder="ABCD-1234"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              disabled={!!validated}
            />
          </div>
          {!validated && (
            <button
              className="btn-primary w-full"
              onClick={validateCode}
              disabled={busy}
            >
              {busy ? "Checking…" : "Continue"}
            </button>
          )}
          {validated && (
            <>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm">
                <div className="font-semibold text-emerald-800">
                  Code verified ✓
                </div>
                <div className="text-emerald-700 mt-1">
                  Welcome to <b>{validated.provider?.name}</b>.
                </div>
                {validated.program && (
                  <div className="text-emerald-700 mt-1">
                    Enrolling you in:{" "}
                    <b>{validated.program.name}</b> (
                    {validated.program.durationWeeks} weeks)
                  </div>
                )}
              </div>
              <div>
                <div className="label">Your name</div>
                <input
                  className="input"
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                />
              </div>
              <div>
                <div className="label">Phone (WhatsApp)</div>
                <input
                  className="input"
                  placeholder="+91 98xxxxxxxx"
                  value={form.phone}
                  onChange={(e) =>
                    setForm({ ...form, phone: e.target.value })
                  }
                />
              </div>
              <div>
                <div className="label">Email (optional)</div>
                <input
                  className="input"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                />
              </div>
              <button
                className="btn-primary w-full"
                onClick={() => signup(true)}
                disabled={busy}
              >
                {busy ? "Creating account…" : "Create account"}
              </button>
            </>
          )}
          {err && <div className="text-sm text-red-600">{err}</div>}
          <button
            className="text-xs underline text-slate-500"
            onClick={() => setFlow("choose")}
          >
            ← Back
          </button>
        </div>
      </div>
    );
  }

  // generic
  return (
    <div className="max-w-md mx-auto mt-10 card p-6">
      <p className="label">Community signup</p>
      <h1 className="text-2xl font-semibold">Create your Stillwater account</h1>
      <p className="text-sm text-slate-500 mt-1">
        No partner code needed. We'll match you with the right healer once
        you're in.
      </p>
      <div className="mt-5 space-y-3">
        <div>
          <div className="label">Your name</div>
          <input
            className="input"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div>
          <div className="label">Phone (WhatsApp)</div>
          <input
            className="input"
            placeholder="+91 98xxxxxxxx"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>
        <div>
          <div className="label">Email (optional)</div>
          <input
            className="input"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <button
          className="btn-primary w-full"
          onClick={() => signup(false)}
          disabled={busy}
        >
          {busy ? "Creating account…" : "Create account"}
        </button>
        {err && <div className="text-sm text-red-600">{err}</div>}
        <button
          className="text-xs underline text-slate-500"
          onClick={() => setFlow("choose")}
        >
          ← Back
        </button>
      </div>
    </div>
  );
}
