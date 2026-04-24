export type ContactMode = "whatsapp" | "call" | "email";

export type LeadStatus =
  | "new"
  | "contacted"
  | "engaged"
  | "agreed_to_purchase"
  | "paid"
  | "onboarded"
  | "consultation_booked"
  | "consulted"
  | "closed";

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  providerId: string;
  source: string;
  campaign?: string;
  preferredMode: ContactMode;
  interest: string;
  status: LeadStatus;
  assignedUserId?: string;
  patientId?: string;
  createdAt: string;
  notes?: string;
}

export type MessageRole = "user" | "agent" | "system";
export type Channel = "whatsapp" | "website" | "email" | "sms" | "phone";

export interface ChatMessage {
  id: string;
  leadId?: string;
  patientId?: string;
  sessionId: string;
  channel: Channel;
  role: MessageRole;
  text: string;
  at: string;
}

export type ConsultationType =
  | "ai_avatar"
  | "ai_chatbot_credit"
  | "in_person"
  | "video";
export type ConsultationStatus =
  | "requested"
  | "payment_pending"
  | "confirmed"
  | "completed"
  | "cancelled";

export interface Consultation {
  id: string;
  leadId: string;
  patientId?: string;
  providerId: string;
  doctorId?: string;
  type: ConsultationType;
  slot: string;
  amountInr: number;
  status: ConsultationStatus;
  razorpayPaymentId?: string;
  recordingUrl?: string;
  transcriptId?: string;
  prescriptionId?: string;
  followUpOfId?: string;
  createdAt: string;
}

export interface Doctor {
  id: string;
  providerId: string;
  name: string;
  specialty: string;
  feeInr: number;
}

export interface Provider {
  id: string;
  name: string;
  tagline: string;
  website: string;
  description: string;
  services: string[];
  color: string;
}

export interface TranscriptAction {
  kind: "prescription" | "follow_up" | "referral" | "lifestyle";
  text: string;
  due?: string;
}

export interface Transcript {
  id: string;
  consultationId: string;
  summary: string;
  turns: { speaker: "doctor" | "patient"; text: string; t: string }[];
  actions: TranscriptAction[];
  createdAt: string;
}

export type UserRole =
  | "stilwater_admin"
  | "owner"
  | "admin"
  | "agent"
  | "doctor";

export interface User {
  id: string;
  providerId: string | null; // null => stilwater_admin
  email: string;
  name: string;
  passwordHash: string;
  role: UserRole;
  createdAt: string;
  doctorId?: string; // link to doctor record when role === "doctor"
  language?: string;
}

export interface Patient {
  id: string;
  name: string;
  phone: string;
  email?: string;
  providerId: string;
  leadId?: string;
  createdAt: string;
  chatbotCredits: number;
  avatarCredits: number;
}

export interface PatientOTP {
  phone: string;
  code: string;
  createdAt: string;
  expiresAt: string;
}

export type CallMode = "human" | "ai";
export type CallOutcome =
  | "answered"
  | "not_answered"
  | "callback"
  | "agreed_to_purchase"
  | "not_interested";

export interface CallLog {
  id: string;
  leadId: string;
  userId: string; // staff who made / launched the call
  providerId: string;
  mode: CallMode;
  language: string; // en, hi, ta, te, kn, ml, mr, bn
  durationSec: number;
  outcome: CallOutcome;
  notes: string;
  aiTranscript?: { speaker: "agent" | "lead"; text: string }[];
  createdAt: string;
}

export interface Program {
  id: string;
  providerId: string;
  name: string;
  description: string;
  durationWeeks: number;
  priceInr: number;
}

export type PaymentLinkStatus = "created" | "sent" | "paid" | "expired";
export type PaymentPurpose =
  | "program"
  | "consultation"
  | "chatbot_credits"
  | "avatar_credits"
  | "follow_up";

export interface PaymentLink {
  id: string;
  token: string;
  leadId?: string;
  patientId?: string;
  providerId: string;
  purpose: PaymentPurpose;
  programId?: string;
  consultationId?: string;
  amountInr: number;
  description: string;
  status: PaymentLinkStatus;
  createdAt: string;
  createdByUserId: string;
  paidAt?: string;
  razorpayPaymentId?: string;
  invoiceId?: string;
}

export interface Invoice {
  id: string;
  number: string;
  paymentLinkId?: string;
  consultationId?: string;
  patientId?: string;
  leadId?: string;
  providerId: string;
  items: { description: string; qty: number; priceInr: number }[];
  subtotalInr: number;
  gstInr: number;
  totalInr: number;
  issuedAt: string;
  customer: { name: string; phone: string; email?: string };
}

export interface DiagnosticReport {
  id: string;
  patientId: string;
  title: string;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string;
}

export interface Prescription {
  id: string;
  consultationId: string;
  patientId: string;
  providerId: string;
  doctorId: string;
  items: { medicine: string; dose: string; frequency: string; duration: string }[];
  lifestyle: string[];
  nextFollowUpDays?: number;
  notes?: string;
  issuedAt: string;
}

export interface Video {
  id: string;
  providerId: string;
  title: string;
  speaker: string;
  duration: string;
  thumbnailHue: number;
  description: string;
}

export interface DB {
  providers: Provider[];
  doctors: Doctor[];
  users: User[];
  patients: Patient[];
  otps: PatientOTP[];
  leads: Lead[];
  messages: ChatMessage[];
  consultations: Consultation[];
  transcripts: Transcript[];
  callLogs: CallLog[];
  programs: Program[];
  paymentLinks: PaymentLink[];
  invoices: Invoice[];
  reports: DiagnosticReport[];
  prescriptions: Prescription[];
  videos: Video[];
}
