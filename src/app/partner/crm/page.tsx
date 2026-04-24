import { redirect } from "next/navigation";
import { getPartnerUser, canManageTeam } from "@/lib/auth";
import { readDB } from "@/lib/db";
import CRMClient from "./client";

export default function CRMPage() {
  const user = getPartnerUser();
  if (!user) redirect("/login");
  if (!canManageTeam(user)) redirect("/partner");

  const db = readDB();
  const provider = user.providerId
    ? db.providers.find((p) => p.id === user.providerId) ?? null
    : null;

  if (!provider) {
    return (
      <div className="card p-6">
        <p className="label">CRM</p>
        <h1 className="text-2xl font-semibold mt-1">
          Stillwater super-admin
        </h1>
        <p className="mt-2 text-slate-600">
          The CRM is a per-partner workspace. Impersonate a partner (SHARAN or
          Amar Eye Yoga) to see it.
        </p>
      </div>
    );
  }

  const settings = db.providerSettings.find(
    (s) => s.providerId === provider.id
  ) ?? {
    providerId: provider.id,
    whatsappNumber: "",
    whatsappBusinessId: "",
    whatsappConnected: false,
    updatedAt: new Date().toISOString(),
  };

  const leads = db.leads.filter((l) => l.providerId === provider.id);
  const admins = db.users.filter(
    (u) => u.providerId === provider.id && (u.role === "admin" || u.role === "owner")
  );

  return (
    <CRMClient
      provider={provider}
      initialLeads={leads}
      initialSettings={settings}
      initialAdmins={admins.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
      }))}
    />
  );
}
