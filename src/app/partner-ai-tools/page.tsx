import Link from "next/link";

interface Tool {
  id: string;
  title: string;
  tagline: string;
  description: string;
  bullets: string[];
  accent: string;
}

const TOOLS: Tool[] = [
  {
    id: "crm",
    title: "AI-powered CRM",
    tagline: "Every lead, never lost.",
    description:
      "A unified workspace that pulls enquiries from Meta, Instagram, WhatsApp and your website into one place — enriched, de-duplicated and nudged forward by AI.",
    bullets: [
      "Auto-capture leads from social media, landing pages and WhatsApp",
      "AI-drafted follow-ups in 8 Indian languages + English",
      "Lifecycle tracking — from first click to long-term follow-up",
      "Smart assignment to the right agent at the right time",
    ],
    accent: "from-emerald-400 to-teal-600",
  },
  {
    id: "sales",
    title: "AI sales agents",
    tagline: "Conversations that convert.",
    description:
      "Multi-lingual voice AI agents that call back leads within seconds, answer programme questions and book paid consultations — working 24/7 alongside your human team.",
    bullets: [
      "Natural voice agents in Hindi, Tamil, Telugu, Kannada, Malayalam, Marathi, Bengali and English",
      "Warm handoff to human agents the moment intent is detected",
      "Razorpay payment-link delivery on the call itself",
      "Full call recording + transcript for quality review",
    ],
    accent: "from-amber-400 to-rose-500",
  },
  {
    id: "influencer",
    title: "AI agents for influencer marketing",
    tagline: "Organic reach, at machine scale.",
    description:
      "An always-on content engine that plans, drafts and schedules Instagram, YouTube and Facebook posts — and helps you collaborate with micro-influencers who align with your message.",
    bullets: [
      "AI-generated reels, carousels and captions in your voice",
      "Influencer discovery and outreach workflows",
      "Engagement tracking tied back to actual paid patients",
      "A/B test hooks and thumbnails automatically",
    ],
    accent: "from-fuchsia-400 to-indigo-500",
  },
  {
    id: "clinical",
    title: "Patient clinical data management",
    tagline: "One calm chart, shared safely.",
    description:
      "A central, privacy-first store for patient histories, prescriptions, consultation recordings and diagnostic reports — so partner doctors always have the full picture.",
    bullets: [
      "Unified patient record across partner clinics",
      "Recorded + transcribed consultations with action items",
      "Role-based access for doctors, coaches and admins",
      "Export-ready for reporting, audit and research",
    ],
    accent: "from-sky-400 to-cyan-600",
  },
];

export default function PartnerAIToolsPage() {
  return (
    <div className="space-y-14">
      <section className="relative overflow-hidden rounded-3xl bg-still-900 text-white px-8 py-14 md:py-20 text-center">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(900px 400px at 80% 0%, #4a8581 0%, transparent 60%), radial-gradient(900px 400px at 10% 100%, #2c5a5e 0%, transparent 60%)",
          }}
        />
        <div className="relative">
          <p className="uppercase tracking-[0.35em] text-xs text-still-200">
            For wellness providers and clinics
          </p>
          <h1 className="mt-5 font-serif text-4xl md:text-5xl leading-tight max-w-3xl mx-auto">
            Partner AI Tools
          </h1>
          <p className="mt-5 text-still-100/90 max-w-2xl mx-auto">
            The same AI stack Stillwater uses to run its own programmes — now
            available to healers, clinics and wellness brands who want to scale
            without losing the human touch.
          </p>
          <div className="mt-7 flex flex-wrap gap-3 justify-center">
            <Link href="/#enquire" className="btn-primary">
              Talk to our team
            </Link>
            <Link
              href="/login"
              className="btn border border-white/40 text-white hover:bg-white/10"
            >
              Partner login
            </Link>
          </div>
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-6">
        {TOOLS.map((tool) => (
          <article
            key={tool.id}
            id={tool.id}
            className="card p-6 md:p-8 flex flex-col"
          >
            <div
              className={`h-1.5 w-16 rounded-full bg-gradient-to-r ${tool.accent}`}
            />
            <h2 className="mt-4 font-serif text-2xl md:text-3xl text-still-900">
              {tool.title}
            </h2>
            <p className="mt-1 text-still-600 font-medium">{tool.tagline}</p>
            <p className="mt-4 text-slate-700 leading-relaxed">
              {tool.description}
            </p>
            <ul className="mt-5 space-y-2 text-sm text-slate-700">
              {tool.bullets.map((b) => (
                <li key={b} className="flex gap-2">
                  <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-still-500 flex-none" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section className="rounded-3xl bg-still-50 border border-still-200 p-8 md:p-12 text-center">
        <h2 className="font-serif text-3xl text-still-900">
          Bring the Stillwater stack to your practice.
        </h2>
        <p className="mt-3 text-slate-700 max-w-2xl mx-auto">
          Tell us what you run today — we'll show you exactly which of these
          tools will move the needle and in what order to roll them out.
        </p>
        <Link href="/#enquire" className="btn-primary mt-6 inline-flex">
          Send an enquiry
        </Link>
      </section>
    </div>
  );
}
