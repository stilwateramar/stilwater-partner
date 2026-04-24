"use client";

import { useEffect, useState } from "react";

type SignupCode = {
  id: string;
  code: string;
  providerId: string;
  programId?: string;
  intendedName?: string;
  intendedPhone?: string;
  intendedEmail?: string;
  usedByPatientId?: string;
  usedAt?: string;
  createdAt: string;
};

export default function SignupCodesClient({
  programs,
  providerName,
}: {
  programs: { id: string; name: string; priceInr: number }[];
  providerName: string;
}) {
  const [codes, setCodes] = useState<SignupCode[]>([]);
  const [form, setForm] = useState({
    intendedName: "",
    intendedPhone: "",
    intendedEmail: "",
    programId: programs[0]?.id ?? "",
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  async function load() {
    const r = await fetch("/api/signup-codes").then((r) => r.json());
    setCodes(r.codes ?? []);
  }
  useEffect(() => {
    load();
  }, []);

  function showToast(t: string) {
    setToast(t);
    setTimeout(() => setToast(null), 2500);
  }

  async function create() {
    setErr("");
    if (!form.intendedName.trim()) {
      setErr("Add the user's name so you remember who this code is for.");
      return;
    }
    setBusy(true);
    const r = await fetch("/api/signup-codes", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    });
    setBusy(false);
    if (!r.ok) {
      setErr("Could not generate the code.");
      return;
    }
    setForm({
      intendedName: "",
      intendedPhone: "",
      intendedEmail: "",
      programId: programs[0]?.id ?? "",
    });
    await load();
    showToast("Code generated");
  }

  async function copyCode(code: string) {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/patient/signup`
        : "/patient/signup";
    await navigator.clipboard.writeText(
      `Your ${providerName} signup code: ${code}\nSign up at: ${url}`
    );
    showToast("Share text copied");
  }

  async function revoke(id: string) {
    if (!confirm("Remove this unused signup code?")) return;
    const r = await fetch(`/api/signup-codes/${id}`, { method: "DELETE" });
    if (!r.ok) showToast("Could not remove (already used?)");
    else {
      await load();
      showToast("Code removed");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="label">Signup codes</p>
        <h1 className="text-2xl font-semibold">
          Generate user signup codes
        </h1>
        <p className="text-sm text-slate-500 max-w-xl">
          Each user enrolling with {providerName} gets a unique 8-character
          code. Share it over WhatsApp or email — they'll use it on the{" "}
          <span className="font-mono">/patient/signup</span> page to create
          their account and be linked to their plan.
        </p>
      </div>

      <div className="card p-5">
        <h2 className="font-semibold">New code</h2>
        <div className="mt-3 grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
          <input
            className="input"
            placeholder="User's name"
            value={form.intendedName}
            onChange={(e) =>
              setForm({ ...form, intendedName: e.target.value })
            }
          />
          <input
            className="input"
            placeholder="Phone (optional)"
            value={form.intendedPhone}
            onChange={(e) =>
              setForm({ ...form, intendedPhone: e.target.value })
            }
          />
          <input
            className="input"
            placeholder="Email (optional)"
            value={form.intendedEmail}
            onChange={(e) =>
              setForm({ ...form, intendedEmail: e.target.value })
            }
          />
          <select
            className="input"
            value={form.programId}
            onChange={(e) => setForm({ ...form, programId: e.target.value })}
          >
            <option value="">(no plan)</option>
            {programs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        {err && <div className="mt-2 text-sm text-red-600">{err}</div>}
        <button
          className="btn-primary mt-3"
          onClick={create}
          disabled={busy}
        >
          {busy ? "Generating…" : "Generate unique code"}
        </button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr>
              {["Code", "For", "Plan", "Status", "Issued", ""].map((h) => (
                <th key={h} className="px-3 py-2 text-left">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {codes.map((c) => {
              const program = programs.find((p) => p.id === c.programId);
              return (
                <tr key={c.id} className="border-t border-slate-100">
                  <td className="px-3 py-2">
                    <code className="bg-slate-100 rounded px-2 py-0.5 tracking-widest">
                      {c.code}
                    </code>
                  </td>
                  <td className="px-3 py-2">
                    <div className="font-medium">
                      {c.intendedName ?? "—"}
                    </div>
                    <div className="text-xs text-slate-500">
                      {c.intendedPhone ?? ""}{" "}
                      {c.intendedEmail ? `· ${c.intendedEmail}` : ""}
                    </div>
                  </td>
                  <td className="px-3 py-2">{program?.name ?? "—"}</td>
                  <td className="px-3 py-2">
                    {c.usedByPatientId ? (
                      <span className="badge bg-emerald-100 text-emerald-700">
                        used{" "}
                        {c.usedAt
                          ? new Date(c.usedAt).toLocaleDateString()
                          : ""}
                      </span>
                    ) : (
                      <span className="badge bg-slate-100 text-slate-700">
                        unused
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-xs text-slate-500">
                    {new Date(c.createdAt).toLocaleString()}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      className="text-xs underline mr-3"
                      onClick={() => copyCode(c.code)}
                    >
                      Copy share text
                    </button>
                    {!c.usedByPatientId && (
                      <button
                        className="text-xs underline text-red-600"
                        onClick={() => revoke(c.id)}
                      >
                        Revoke
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {codes.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-3 py-8 text-center text-slate-400"
                >
                  No codes generated yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-still-900 text-white px-4 py-2 rounded-full text-sm shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
