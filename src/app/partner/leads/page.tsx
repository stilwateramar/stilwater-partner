import { getPartnerUser } from "@/lib/auth";
import { readDB } from "@/lib/db";
import LeadsClient from "./client";

export default function PartnerLeads() {
  const user = getPartnerUser()!;
  const db = readDB();
  const leads = db.leads.filter((l) =>
    user.providerId ? l.providerId === user.providerId : true
  );
  const provider = user.providerId
    ? db.providers.find((p) => p.id === user.providerId) ?? null
    : null;
  const programs = db.programs.filter((p) =>
    user.providerId ? p.providerId === user.providerId : true
  );

  return (
    <LeadsClient
      initialLeads={leads}
      provider={provider}
      programs={programs}
      canManage={["owner", "admin", "stilwater_admin"].includes(user.role)}
    />
  );
}
