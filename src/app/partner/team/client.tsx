"use client";

import { useEffect, useState } from "react";

const ROLES = ["owner", "admin", "agent", "doctor"] as const;

export default function TeamClient({
  canCrossProvider,
}: {
  canCrossProvider: boolean;
}) {
  const [users, setUsers] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "agent",
  });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    const r = await fetch("/api/partner/users").then((r) => r.json());
    setUsers(r.users ?? []);
  }
  useEffect(() => {
    load();
  }, []);

  async function create() {
    setErr("");
    setBusy(true);
    const r = await fetch("/api/partner/users", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    });
    setBusy(false);
    if (!r.ok) {
      const d = await r.json().catch(() => ({}));
      setErr(d.error ?? "Could not create");
      return;
    }
    setForm({ name: "", email: "", password: "", role: "agent" });
    load();
  }

  async function changeRole(id: string, role: string) {
    await fetch(`/api/partner/users/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ role }),
    });
    load();
  }

  async function remove(id: string) {
    if (!confirm("Remove this user?")) return;
    await fetch(`/api/partner/users/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="label">Team &amp; admins</p>
        <h1 className="text-2xl font-semibold">Manage users &amp; admins</h1>
        <p className="text-sm text-slate-500">
          Create another admin login, or invite agents and doctors. Roles:{" "}
          <code>owner</code>, <code>admin</code>, <code>agent</code>,{" "}
          <code>doctor</code>.
        </p>
      </div>

      <div className="card p-5">
        <h2 className="font-semibold">Invite a new user</h2>
        <div className="mt-3 grid sm:grid-cols-4 gap-2">
          <input
            className="input"
            placeholder="Full name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            className="input"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            className="input"
            placeholder="Temp password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <select
            className="input"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        {err && <div className="text-sm text-red-600 mt-2">{err}</div>}
        <button
          className="btn-primary mt-3"
          disabled={busy || !form.email || !form.password || !form.name}
          onClick={create}
        >
          {busy ? "Creating…" : "Create user"}
        </button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr>
              {["Name", "Email", "Role", "Provider", ""].map((h) => (
                <th key={h} className="px-3 py-2 text-left">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-slate-100">
                <td className="px-3 py-2 font-medium">{u.name}</td>
                <td className="px-3 py-2">{u.email}</td>
                <td className="px-3 py-2">
                  <select
                    className="input text-xs"
                    value={u.role}
                    onChange={(e) => changeRole(u.id, e.target.value)}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                    {canCrossProvider && (
                      <option value="stilwater_admin">stilwater_admin</option>
                    )}
                  </select>
                </td>
                <td className="px-3 py-2">{u.providerId ?? "—"}</td>
                <td className="px-3 py-2 text-right">
                  <button
                    className="text-xs underline text-red-600"
                    onClick={() => remove(u.id)}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
