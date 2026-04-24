import { redirect } from "next/navigation";
import { canManageTeam, getPartnerUser } from "@/lib/auth";
import { readDB } from "@/lib/db";
import WhatsAppClient from "./client";

export default function WhatsAppPage() {
  const user = getPartnerUser()!;
  if (!canManageTeam(user)) redirect("/partner");
  const db = readDB();
  const provider = user.providerId
    ? db.providers.find((p) => p.id === user.providerId)
    : null;

  return (
    <WhatsAppClient
      initialNumber={provider?.whatsappNumber ?? ""}
      providerName={provider?.name ?? "Your workspace"}
    />
  );
}
