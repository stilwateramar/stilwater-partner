import type { ChatMessage, Lead, Provider } from "./types";

interface AgentContext {
  lead?: Lead;
  provider?: Provider;
  history: ChatMessage[];
}

interface AgentReply {
  text: string;
  suggestBooking?: boolean;
  links?: { label: string; url: string }[];
}

const FAQ: { match: RegExp; answer: (p?: Provider) => string }[] = [
  {
    match: /(price|cost|fee|charge|how much)/i,
    answer: (p) =>
      `The standard consultation fee is between ₹900 and ₹1,500 depending on the doctor. ${
        p ? `For ${p.name}, we'll show the exact fee when you pick a slot.` : ""
      } Payment is via Razorpay (UPI, cards, netbanking).`,
  },
  {
    match: /(refund|cancel)/i,
    answer: () =>
      "You can reschedule up to 12 hours before your slot from the booking link. Full refund if cancelled 24 hours ahead — otherwise 50% refund.",
  },
  {
    match: /(diabetes|sugar|insulin)/i,
    answer: () =>
      "SHARAN runs a 21-day diabetes reversal program combining plant-based nutrition, daily movement and lifestyle coaching. Most participants see a drop in fasting sugar within 2 weeks.",
  },
  {
    match: /(eye|vision|glasses|myopia|screen)/i,
    answer: () =>
      "Amar Eye Yoga uses breathing, palming and focus-shifting exercises combined with clinical ophthalmology review. It is particularly effective for digital eye strain and early myopia.",
  },
  {
    match: /(avatar|ai consultation|ai doctor)/i,
    answer: () =>
      "Yes — you can start with a free AI-avatar consultation. The avatar takes your history, suggests self-care, and books you with a human doctor if needed.",
  },
  {
    match: /(location|address|clinic|where)/i,
    answer: (p) =>
      `${
        p?.name ?? "Our clinics"
      } is available for online consultations everywhere in India, and in-person in Bangalore, Pune and Mumbai.`,
  },
  {
    match: /(hi|hello|hey|namaste)/i,
    answer: (p) =>
      `Hi! I'm the Stilwater assistant${
        p ? ` for ${p.name}` : ""
      }. I can answer questions, share links, and help you book a consultation. What are you looking for today?`,
  },
];

export function runAgent(input: string, ctx: AgentContext): AgentReply {
  const provider = ctx.provider;
  const text = input.trim();
  const lower = text.toLowerCase();

  const links = provider
    ? [
        { label: `${provider.name} website`, url: `/providers/${provider.id}` },
        { label: "Book with Stilwater", url: `/book?provider=${provider.id}` },
      ]
    : [
        { label: "Stilwater home", url: "/" },
        { label: "Book a consultation", url: "/book" },
      ];

  if (/(book|appoint|slot|consult)/i.test(lower)) {
    return {
      text: `Great — I can get you booked. You can pick an in-person slot on the calendar${
        provider ? ` for ${provider.name}` : ""
      }, pay via Razorpay, and you'll get a confirmation on WhatsApp.`,
      suggestBooking: true,
      links,
    };
  }

  for (const item of FAQ) {
    if (item.match.test(lower)) {
      return { text: item.answer(provider), links };
    }
  }

  const turnCount = ctx.history.filter((m) => m.role === "user").length;
  if (turnCount >= 2) {
    return {
      text: "Would it help to book a quick consultation? I can hold a slot for you now.",
      suggestBooking: true,
      links,
    };
  }

  return {
    text: `Thanks for sharing that. I've noted it${
      ctx.lead ? `, ${ctx.lead.name.split(" ")[0]}` : ""
    }. Could you tell me a bit more about what you'd like help with — symptoms, goals, or a specific condition?`,
    links,
  };
}

export function openingMessage(lead: Lead, provider?: Provider): string {
  const first = lead.name.split(" ")[0] || "there";
  const pname = provider?.name ?? "Stilwater";
  return [
    `Hi ${first} 👋 This is the ${pname} assistant on Stilwater.`,
    `You recently showed interest in "${lead.interest}" — happy to help answer your questions.`,
    provider
      ? `You can read more at ${provider.website} or book directly: /book?provider=${provider.id}`
      : `You can book directly at /book`,
    `You can also try a free AI-avatar consultation at /avatar${
      provider ? `?provider=${provider.id}` : ""
    }.`,
  ].join("\n\n");
}
