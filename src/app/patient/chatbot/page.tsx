import { redirect } from "next/navigation";
import { getPatient } from "@/lib/auth";
import ChatbotClient from "./client";

export default function PatientChatbot() {
  const patient = getPatient();
  if (!patient) redirect("/patient/login");
  return <ChatbotClient initialCredits={patient.chatbotCredits} />;
}
