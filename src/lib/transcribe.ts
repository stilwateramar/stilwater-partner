import type { TranscriptAction, Transcript } from "./types";

// Deterministic "transcription" + action extraction for the prototype.
// In production this is a real ASR + LLM pipeline.

const SEEDS = {
  sharan: [
    { speaker: "doctor", text: "How have your fasting sugars been this week?" },
    { speaker: "patient", text: "Between 140 and 160, down from 190 last month." },
    { speaker: "doctor", text: "Good progress. Walking daily?" },
    { speaker: "patient", text: "Yes, 30 minutes after dinner." },
    { speaker: "doctor", text: "Let's continue the plant-based plan, add 2 tbsp flaxseed, and retest HbA1c in 6 weeks." },
  ],
  "amar-eye-yoga": [
    { speaker: "doctor", text: "Describe the eye strain — is it worse in the evening?" },
    { speaker: "patient", text: "Yes, after 7-8 hours of screen work." },
    { speaker: "doctor", text: "Any blurring, headaches, dryness?" },
    { speaker: "patient", text: "Some dryness and mild headaches." },
    { speaker: "doctor", text: "Start the 20-20-20 rule plus 5 minutes of palming twice a day. Review in 3 weeks." },
  ],
} as const;

export function fabricateTranscript(
  consultationId: string,
  providerId: string
): Omit<Transcript, "id" | "createdAt"> {
  const turns = (SEEDS[providerId as keyof typeof SEEDS] ?? SEEDS.sharan).map(
    (t, i) => ({
      ...t,
      t: new Date(Date.now() - (5 - i) * 60 * 1000).toISOString(),
    })
  );

  const summary =
    providerId === "amar-eye-yoga"
      ? "Patient reports evening digital eye strain with mild dryness & headaches. Plan: 20-20-20 rule + palming 2x/day. Review in 3 weeks."
      : "Patient showing steady drop in fasting glucose on plant-based protocol. Adding 2 tbsp flaxseed. Retest HbA1c in 6 weeks.";

  const actions: TranscriptAction[] =
    providerId === "amar-eye-yoga"
      ? [
          {
            kind: "lifestyle",
            text: "Practice 20-20-20 rule during screen hours.",
          },
          { kind: "lifestyle", text: "5 minutes of palming, twice daily." },
          { kind: "follow_up", text: "Tele-review in 3 weeks.", due: in3weeks() },
        ]
      : [
          {
            kind: "prescription",
            text: "Continue plant-based protocol. Add 2 tbsp flaxseed daily.",
          },
          {
            kind: "follow_up",
            text: "HbA1c blood test in 6 weeks.",
            due: in6weeks(),
          },
          {
            kind: "lifestyle",
            text: "Maintain 30-min post-dinner walk.",
          },
        ];

  return {
    consultationId,
    summary,
    turns,
    actions,
  };
}

function in6weeks() {
  const d = new Date();
  d.setDate(d.getDate() + 42);
  return d.toISOString().slice(0, 10);
}
function in3weeks() {
  const d = new Date();
  d.setDate(d.getDate() + 21);
  return d.toISOString().slice(0, 10);
}
