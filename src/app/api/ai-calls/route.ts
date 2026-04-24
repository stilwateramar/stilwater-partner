import { NextResponse } from "next/server";
import { getPartnerUser } from "@/lib/auth";
import { readDB, newId, updateDB } from "@/lib/db";
import { getLang } from "@/lib/languages";
import { pushMessage } from "@/lib/messaging";
import type { CallLog } from "@/lib/types";

// Simulated AI voice call. The "agent" speaks in the requested language,
// gets scripted lead replies, and logs the full call transcript plus
// outcome. Replaced in production by Bland / Vapi / Retell.
export async function POST(req: Request) {
  const user = getPartnerUser();
  if (!user) return NextResponse.json({ error: "unauth" }, { status: 401 });
  const { leadId, language, programId } = await req.json();
  if (!leadId) return NextResponse.json({ error: "leadId required" }, { status: 400 });

  const db = readDB();
  const lead = db.leads.find((l) => l.id === leadId);
  if (!lead) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const program =
    (programId && db.programs.find((p) => p.id === programId)) ||
    db.programs.find((p) => p.providerId === lead.providerId);

  const lang = getLang(language ?? "en");

  // Deterministic 4-turn scripted conversation.
  const agentOpen = `${lang.greeting}`;
  const leadAck =
    language === "hi"
      ? "हाँ बताइये।"
      : language === "ta"
      ? "சொல்லுங்க."
      : language === "te"
      ? "చెప్పండి."
      : language === "kn"
      ? "ಹೇಳಿ."
      : language === "ml"
      ? "പറയൂ."
      : language === "mr"
      ? "बोला."
      : language === "bn"
      ? "বলুন।"
      : "Yes, please go ahead.";
  const agentPrice = program
    ? `${lang.price} (${program.name}, ${program.durationWeeks} weeks, ₹${program.priceInr})`
    : lang.price;
  const leadAgree =
    language === "hi"
      ? "ठीक है, लिंक भेज दीजिए।"
      : language === "ta"
      ? "சரி, இணைப்பை அனுப்புங்க."
      : language === "te"
      ? "సరే, లింక్ పంపండి."
      : language === "kn"
      ? "ಸರಿ, ಲಿಂಕ್ ಕಳುಹಿಸಿ."
      : language === "ml"
      ? "ശരി, ലിങ്ക് അയയ്ക്കൂ."
      : language === "mr"
      ? "ठीक आहे, लिंक पाठवा."
      : language === "bn"
      ? "ঠিক আছে, লিংক পাঠান।"
      : "Okay, please send the link.";
  const agentClose = lang.close;

  const transcript = [
    { speaker: "agent" as const, text: agentOpen },
    { speaker: "lead" as const, text: leadAck },
    { speaker: "agent" as const, text: agentPrice },
    { speaker: "lead" as const, text: leadAgree },
    { speaker: "agent" as const, text: agentClose },
  ];

  const call = updateDB((db) => {
    const entry: CallLog = {
      id: newId("call"),
      leadId,
      userId: user.id,
      providerId: lead.providerId,
      mode: "ai",
      language: lang.code,
      durationSec: 92,
      outcome: "agreed_to_purchase",
      notes: `AI voice call in ${lang.name}. Lead agreed to purchase${
        program ? ` ${program.name}` : ""
      }.`,
      aiTranscript: transcript,
      createdAt: new Date().toISOString(),
    };
    db.callLogs.unshift(entry);

    const l = db.leads.find((x) => x.id === leadId);
    if (l) l.status = "agreed_to_purchase";

    // Log a WhatsApp confirmation from the AI agent.
    pushMessage(db, {
      leadId,
      channel: "whatsapp",
      text: `${lang.close}\n\nProgram: ${program?.name ?? "—"}\nAmount: ₹${
        program?.priceInr ?? 0
      }. Please expect a payment link from your agent shortly.`,
    });

    return entry;
  });

  return NextResponse.json({ call });
}
