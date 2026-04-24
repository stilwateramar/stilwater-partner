import { NextResponse } from "next/server";
import { getPatient } from "@/lib/auth";
import { readDB, updateDB, newId } from "@/lib/db";
import { runAgent } from "@/lib/agent";

export async function POST(req: Request) {
  const patient = getPatient();
  if (!patient) return NextResponse.json({ error: "unauth" }, { status: 401 });
  const { text, sessionId } = await req.json();
  if (!text) return NextResponse.json({ error: "text required" }, { status: 400 });

  const db = readDB();
  if (patient.chatbotCredits <= 0) {
    return NextResponse.json(
      {
        error: "no_credits",
        message:
          "You're out of chatbot credits. Top up 10 credits for ₹499 to continue.",
      },
      { status: 402 }
    );
  }

  const provider = db.providers.find((p) => p.id === patient.providerId);

  const result = updateDB((db) => {
    const p = db.patients.find((x) => x.id === patient.id)!;
    p.chatbotCredits -= 1;
    const now = new Date().toISOString();
    db.messages.push({
      id: newId("msg"),
      patientId: patient.id,
      sessionId: sessionId ?? `pchat_${patient.id}`,
      channel: "website",
      role: "user",
      text,
      at: now,
    });
    const history = db.messages.filter(
      (m) => m.sessionId === (sessionId ?? `pchat_${patient.id}`)
    );
    const reply = runAgent(text, { provider, history });
    db.messages.push({
      id: newId("msg"),
      patientId: patient.id,
      sessionId: sessionId ?? `pchat_${patient.id}`,
      channel: "website",
      role: "agent",
      text: reply.text,
      at: new Date().toISOString(),
    });
    return { reply, remaining: p.chatbotCredits };
  });

  return NextResponse.json({
    reply: result.reply.text,
    links: result.reply.links,
    creditsRemaining: result.remaining,
  });
}
