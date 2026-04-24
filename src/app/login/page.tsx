"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const DEMOS = [
  { who: "SHARAN_ADMIN (CRM)", email: "sharan_admin@stilwater.demo", brand: "sharan" },
  { who: "AMAR_ADMIN (CRM)", email: "amar_admin@stilwater.demo", brand: "amar" },
  { who: "Stilwater super-admin", email: "admin@stilwater.demo" },
  { who: "SHARAN owner", email: "owner@sharan.demo" },
  { who: "SHARAN agent (makes calls)", email: "agent@sharan.demo" },
  { who: "SHARAN doctor", email: "doctor@sharan.demo" },
  { who: "Amar Eye Yoga owner", email: "owner@amareye.demo" },
  { who: "Amar Eye Yoga agent", email: "agent@amareye.demo" },
];

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("sharan_admin@stilwater.demo");
  const [password, setPassword] = useState("password123");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setErr("");
    setBusy(true);
    const r = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    setBusy(false);
    if (!r.ok) {
      setErr("Invalid email or password");
      return;
    }
    const { user } = await r.json();
    if (user.role === "stilwater_admin") router.push("/admin");
    else if (user.role === "doctor") router.push("/partner/doctor");
    else router.push("/partner/leads");
  }

  return (
    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-10">
      <div className="card p-6">
        <p className="label">Partner login</p>
        <h1 className="text-2xl font-semibold">Sign in to your CRM</h1>
        <p className="text-sm text-slate-500 mt-1">
          CRM access for SHARAN_ADMIN, AMAR_ADMIN and all partner staff.
        </p>
        <div className="mt-5 space-y-3">
          <div>
            <div className="label">Email</div>
            <input
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <div className="label">Password</div>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
          </div>
          {err && <div className="text-sm text-red-600">{err}</div>}
          <button
            className="btn-primary w-full"
            onClick={submit}
            disabled={busy}
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>
          <div className="pt-2 text-sm text-slate-500">
            Are you a user/patient?{" "}
            <Link className="underline" href="/patient/login">
              User login
            </Link>
          </div>
        </div>
      </div>
      <div className="card p-6">
        <p className="label">Demo users</p>
        <h2 className="font-semibold">Click to prefill</h2>
        <p className="text-sm text-slate-500 mt-1">
          All demo accounts use password{" "}
          <code className="text-xs bg-slate-100 px-1 rounded">password123</code>
          .
        </p>
        <ul className="mt-4 space-y-2 text-sm">
          {DEMOS.map((d) => (
            <li key={d.email}>
              <button
                onClick={() => {
                  setEmail(d.email);
                  setPassword("password123");
                }}
                className="w-full text-left rounded-lg border border-slate-200 px-3 py-2 hover:border-still-400 flex items-center gap-3"
              >
                {d.brand === "sharan" && (
                  <span
                    className="h-7 w-7 shrink-0 rounded-full flex items-center justify-center text-xs"
                    style={{
                      background:
                        "radial-gradient(circle at 30% 30%, #6dcf9c, #2f9e6b 55%, #0b6b43)",
                    }}
                  >
                    🌱
                  </span>
                )}
                {d.brand === "amar" && (
                  <span
                    className="h-7 w-7 shrink-0 rounded-full flex items-center justify-center text-xs"
                    style={{
                      background:
                        "radial-gradient(circle at 30% 30%, #7a9cff, #4b6bdf 55%, #2e46a8)",
                    }}
                  >
                    👁️
                  </span>
                )}
                <span className="flex-1">
                  <span className="block font-medium">{d.who}</span>
                  <span className="block text-xs text-slate-500">
                    {d.email}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
