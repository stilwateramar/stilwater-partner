import { redirect } from "next/navigation";
import { canManageTeam, getPartnerUser } from "@/lib/auth";
import { readDB } from "@/lib/db";
import SignupCodesClient from "./client";

export default function SignupCodesPage() {
  const user = getPartnerUser()!;
  if (!canManageTeam(user)) redirect("/partner");
  const db = readDB();
  const programs = db.programs.filter((p) =>
    user.providerId ? p.providerId === user.providerId : true
  );
  const provider = user.providerId
    ? db.providers.find((p) => p.id === user.providerId) ?? null
    : null;
  return (
    <SignupCodesClient
      programs={programs.map((p) => ({
        id: p.id,
        name: p.name,
        priceInr: p.priceInr,
      }))}
      providerName={provider?.name ?? "Stilwater"}
    />
  );
}
