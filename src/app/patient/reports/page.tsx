import { redirect } from "next/navigation";
import { getPatient } from "@/lib/auth";
import ReportsClient from "./client";

export default function ReportsPage() {
  const patient = getPatient();
  if (!patient) redirect("/patient/login");
  return <ReportsClient />;
}
