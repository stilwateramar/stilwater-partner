import { redirect } from "next/navigation";
import Link from "next/link";
import { canManageTeam, getPartnerUser } from "@/lib/auth";
import { readDB } from "@/lib/db";
import RequestsClient from "./client";

export default function PartnerRequestsPage() {
  const user = getPartnerUser()!;
  if (!canManageTeam(user)) redirect("/partner");
  const db = readDB();
  const requests = db.patientRequests
    .filter((r) => (user.providerId ? r.providerId === user.providerId : true))
    .map((r) => {
      const p = db.patients.find((x) => x.id === r.patientId);
      return {
        ...r,
        patient: p
          ? { id: p.id, name: p.name, phone: p.phone, email: p.email }
          : null,
      };
    });
  return <RequestsClient initial={requests} />;
}
