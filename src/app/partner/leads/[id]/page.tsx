import { notFound } from "next/navigation";
import { getPartnerUser } from "@/lib/auth";
import { readDB } from "@/lib/db";
import LeadWorkspace from "./workspace";

export default function LeadDetail({ params }: { params: { id: string } }) {
  const user = getPartnerUser()!;
  const db = readDB();
  const lead = db.leads.find((l) => l.id === params.id);
  if (!lead) notFound();
  if (user.providerId && lead.providerId !== user.providerId) notFound();

  const provider = db.providers.find((p) => p.id === lead.providerId)!;
  const programs = db.programs.filter((p) => p.providerId === lead.providerId);
  const calls = db.callLogs.filter((c) => c.leadId === lead.id);
  const links = db.paymentLinks.filter((p) => p.leadId === lead.id);
  const messages = db.messages.filter((m) => m.leadId === lead.id);

  return (
    <LeadWorkspace
      initial={{ lead, provider, programs, calls, links, messages, userId: user.id }}
    />
  );
}
