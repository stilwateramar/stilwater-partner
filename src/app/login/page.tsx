"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface DemoUser {
  who: string;
  email: string;
  highlight?: boolean;
}

const CRM_ADMINS: DemoUser[] = [
  { who: "SHARAN admin — CRM", email: "admin@sharan.demo", highlight: true },
  {
    who: "Amar Eye Yoga admin — CRM",
    email: "admin@amareye.demo",
    highlight: true,
  },
];

const DEMOS: DemoUser[] = [
  { who: "Stilwater super-admin", email: "admin@stilwater.demo" },
  { who: "SHARAN owner", email: "owner@sharan.demo" },
  { who: "SHARAN agent (makes calls)", email: "agent@sharan.demo" },
  { who: "SHARAN doctor", email: "doctor@sharan.demo" },
  { who: "Amar Eye Yoga owner", email: "owner@amareye.demo" },
  { who: "Amar Eye Yoga agent", email: "agent@amareye.demo" },
];

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("agent@sharan.demo");
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
    else if (user.role === "admin") router.push("/partner/crm");
    else router.push("/partner");
  }

  return (
    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-10">
      <div className="card p-6">
        <p className="label">Partner login</p>
        <h1 className="text-2xl font-semibold">Sign in to your workspace</h1>
        <p className="text-sm text-slate-500 mt-1">
          For partner staff (SHARAN, Amar Eye Yoga) and Stilwater admins.
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
            Are you a patient?{" "}
            <Link className="underline" href="/patient/login">
              Patient login
            </Link>
          </div>
        </div>
      </div>
      <div className="card p-6">
        <p className="label">CRM admin logins</p>
        <h2 className="font-semibold">Sign in as a partner admin</h2>
        <p className="text-sm text-slate-500 mt-1">
          Admins land directly in the CRM. All demo accounts use password{" "}
          <code className="text-xs bg-slate-100 px-1 rounded">password123</code>
          .
        </p>
        <ul className="mt-4 space-y-2 text-sm">
          {CRM_ADMINS.map((d) => (
            <li key={d.email}>
              <button
                onClick={() => {
                  setEmail(d.email);
                  setPassword("password123");
                }}
                className="w-full text-left rounded-lg border border-still-400 bg-still-50 px-3 py-2 hover:bg-still-100"
              >
                <div className="font-medium text-still-900">{d.who}</div>
                <div className="text-xs text-still-700">{d.email}</div>
              </button>
            </li>
          ))}
        </ul>
        <p className="label mt-6">Other demo users</p>
        <ul className="mt-2 space-y-2 text-sm">
          {DEMOS.map((d) => (
            <li key={d.email}>
              <button
                onClick={() => {
                  setEmail(d.email);
                  setPassword("password123");
                }}
                className="w-full text-left rounded-lg border border-slate-200 px-3 py-2 hover:border-still-400"
              >
                <div className="font-medium">{d.who}</div>
                <div className="text-xs text-slate-500">{d.email}</div>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
