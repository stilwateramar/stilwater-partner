export type ContactMode = "whatsapp" | "call" | "email";

export type LeadStatus =
  | "new"
  | "contacted"
  | "engaged"
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
  createdAt: string;
  notes?: string;
}

export type MessageRole = "user" | "agent" | "system";
export type Channel = "whatsapp" | "website";

export interface ChatMessage {
  id: string;
  leadId?: string;
  sessionId: string;
  channel: Channel;
  role: MessageRole;
  text: string;
  at: string;
}

export type ConsultationType = "ai_avatar" | "in_person" | "video";
export type ConsultationStatus =
  | "requested"
  | "payment_pending"
  | "confirmed"
  | "completed"
  | "cancelled";

export interface Consultation {
  id: string;
  leadId: string;
  providerId: string;
  doctorId?: string;
  type: ConsultationType;
  slot: string;
  amountInr: number;
  status: ConsultationStatus;
  razorpayPaymentId?: string;
  recordingUrl?: string;
  transcriptId?: string;
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

export interface DB {
  providers: Provider[];
  doctors: Doctor[];
  leads: Lead[];
  messages: ChatMessage[];
  consultations: Consultation[];
  transcripts: Transcript[];
}
