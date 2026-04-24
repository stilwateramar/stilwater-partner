import { newId } from "./db";
import type { DB, Channel } from "./types";

// Records a simulated WhatsApp / email / SMS push into the messages table.
// In production this is replaced by the WhatsApp Business Cloud API /
// SendGrid / Twilio etc.
export function pushMessage(
  db: DB,
  opts: {
    leadId?: string;
    patientId?: string;
    channel: Channel;
    text: string;
    sessionId?: string;
  }
) {
  const sessionId =
    opts.sessionId ??
    (opts.patientId
      ? `${opts.channel}_p_${opts.patientId}`
      : opts.leadId
      ? `${opts.channel}_${opts.leadId}`
      : `${opts.channel}_anon`);
  db.messages.push({
    id: newId("msg"),
    leadId: opts.leadId,
    patientId: opts.patientId,
    sessionId,
    channel: opts.channel,
    role: "agent",
    text: opts.text,
    at: new Date().toISOString(),
  });
}
