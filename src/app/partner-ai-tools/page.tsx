import Link from "next/link";

const TOOLS = [
  {
    id: "crm",
    tag: "AI CRM",
    icon: "🗂️",
    title: "AI-based CRM tools",
    lede:
      "Centralise every lead from Meta, Instagram, YouTube and referrals. Let AI prioritise who to call next and nudge customers automatically.",
    bullets: [
      "Auto-ingest leads from social media, ad funnels and website forms",
      "AI lead-scoring and next-best-action recommendations",
      "Bulk WhatsApp broadcasts with opt-out compliance",
      "Payment link in one click, sent over WhatsApp",
    ],
    cta: { label: "Open CRM workspace", href: "/login" },
    accent: "from-emerald-500/20 to-emerald-500/5",
  },
  {
    id: "sales",
    tag: "AI Sales",
    icon: "📞",
    title: "AI-based sales agents",
    lede:
      "Multi-lingual AI voice agents that speak to your leads in 8 Indian languages, qualify them, and book consultations — 24×7.",
    bullets: [
      "Natural conversation in Hindi, Tamil, Telugu, Kannada, Malayalam, Marathi, Bengali and English",
      "Real-time transcripts and call summaries",
      "Smart hand-off to a human agent the moment interest peaks",
      "Continuous learning from your top-converting scripts",
    ],
    cta: { label: "See a sample transcript", href: "/login" },
    accent: "from-sky-500/20 to-sky-500/5",
  },
  {
    id: "influencer",
    tag: "Influencer AI",
    icon: "📣",
    title: "AI agents for influencer marketing",
    lede:
      "Grow followers and conversions on Instagram, YouTube and X with agents that plan posts, write captions, and engage meaningfully.",
    bullets: [
      "Content calendar generated from your healer's teachings",
      "Short-form video scripts in your brand voice",
      "Auto-reply to DMs with a compassionate, human tone",
      "Track follower growth, saves and CTA clicks in one dashboard",
    ],
    cta: { label: "Preview the studio", href: "/login" },
    accent: "from-fuchsia-500/20 to-fuchsia-500/5",
  },
  {
    id: "clinical",
    tag: "Clinical Data",
    icon: "🩺",
    title: "Patient clinical data management",
    lede:
      "A secure vault that lets your partner doctors access patient history, reports and prescriptions from one place — across clinics.",
    bullets: [
      "Unified patient timeline: consults, reports, prescriptions, follow-ups",
      "Recorded consultations with AI-generated SOAP summaries",
      "Role-based access for doctors, agents and admins",
      "Exportable audit log for compliance",
    ],
    cta: { label: "Doctor workspace", href: "/login" },
    accent: "from-amber-500/20 to-amber-500/5",
  },
];

export default function PartnerAITools() {
  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-3xl bg-still-900 text-white px-8 py-12 md:py-16">
        <div
          className="absolute inset-0 opacity-50"
          style={{
            background:
              "radial-gradient(800px 300px at 80% 0%, #4a8581 0%, transparent 60%), radial-gradient(700px 300px at 10% 100%, #2c5a5e 0%, transparent 60%)",
          }}
        />
        <div className="relative max-w-3xl">
          <p className="label text-still-200">Partner AI Tools</p>
          <h1 className="mt-3 font-serif text-4xl md:text-5xl leading-tight">
            Four AI toolkits. One mission —{" "}
            <em className="italic font-serif text-still-200">
              help more people heal.
            </em>
          </h1>
          <p className="mt-4 text-still-100/90">
            Every Stillwater partner — doctors, gurus, wellness centres — gets a
            unified stack to acquire, nurture and care for patients without
            drowning in spreadsheets.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/login" className="btn-primary">
              Partner sign-in
            </Link>
            <Link
              href="/#enquire"
              className="btn border border-white/40 text-white hover:bg-white/10"
            >
              Become a partner
            </Link>
          </div>
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-5">
        {TOOLS.map((t) => (
          <div
            key={t.id}
            className={`card relative overflow-hidden p-7 bg-gradient-to-br ${t.accent}`}
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl" aria-hidden>
                {t.icon}
              </span>
              <span className="badge bg-white/70 text-still-800">{t.tag}</span>
            </div>
            <h2 className="mt-4 font-serif text-2xl text-still-900">
              {t.title}
            </h2>
            <p className="mt-2 text-sm text-slate-700 max-w-md">{t.lede}</p>
            <ul className="mt-4 space-y-1.5 text-sm text-slate-700">
              {t.bullets.map((b) => (
                <li key={b} className="flex gap-2">
                  <span className="text-still-600">✓</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <Link
              href={t.cta.href}
              className="btn-outline-dark mt-6 inline-flex"
            >
              {t.cta.label} →
            </Link>
          </div>
        ))}
      </section>

      <section className="card p-8 bg-still-50 text-center">
        <h2 className="font-serif text-2xl text-still-900">
          Already a Stillwater partner?
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Sign in to access your CRM, sales AI agents, influencer studio and
          clinical data vault.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <Link href="/login" className="btn-primary">
            Partner login
          </Link>
          <Link href="/" className="btn-ghost">
            Back to home
          </Link>
        </div>
      </section>
    </div>
  );
}
