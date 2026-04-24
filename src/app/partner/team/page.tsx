import { redirect } from "next/navigation";
import { canManageTeam, getPartnerUser } from "@/lib/auth";
import TeamClient from "./client";

export default function TeamPage() {
  const user = getPartnerUser()!;
  if (!canManageTeam(user)) redirect("/partner");
  return <TeamClient canCrossProvider={user.role === "stilwater_admin"} />;
}
