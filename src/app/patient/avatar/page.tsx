import { redirect } from "next/navigation";
import { getPatient } from "@/lib/auth";
import AvatarGate from "./client";

export default function PatientAvatar() {
  const patient = getPatient();
  if (!patient) redirect("/patient/login");
  return (
    <AvatarGate
      credits={patient.avatarCredits}
      providerId={patient.providerId}
      leadId={patient.leadId ?? ""}
    />
  );
}
