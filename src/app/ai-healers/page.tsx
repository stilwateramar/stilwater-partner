import AvatarFeedbackForm from "@/components/AvatarFeedbackForm";

interface Healer {
  id: string;
  name: string;
  role: string;
  tradition: string;
  blurb: string;
  gradient: string;
  initial: string;
}

const HEALERS: Healer[] = [
  {
    id: "maya-nutrition",
    name: "Maya",
    role: "Plant-based nutrition guide",
    tradition: "Inspired by Dr. Nandita Shah (SHARAN)",
    blurb:
      "Maya walks you through the 21-day plant-based protocol — meals, myths about protein, and the science of why diabetes begins to reverse.",
    gradient: "from-emerald-400 to-teal-700",
    initial: "M",
  },
  {
    id: "arjun-eye-yoga",
    name: "Arjun",
    role: "Eye-yoga therapist",
    tradition: "Inspired by Dr. Amar Sandhu (Amar Eye Yoga)",
    blurb:
      "Arjun teaches the eye-yoga fundamentals — palming, sunning, focus shifts — and gently explains what actually helps myopia and screen fatigue.",
    gradient: "from-indigo-400 to-blue-700",
    initial: "A",
  },
  {
    id: "kavya-meditation",
    name: "Kavya",
    role: "Meditation & breath teacher",
    tradition: "Rooted in classical pranayama",
    blurb:
      "Kavya offers 10-minute guided sits for sleep, anxiety and focus — all grounded in the breath practices that have steadied minds for centuries.",
    gradient: "from-violet-400 to-fuchsia-700",
    initial: "K",
  },
  {
    id: "ravi-ayurveda",
    name: "Ravi",
    role: "Ayurveda lifestyle counsellor",
    tradition: "Classical Ayurvedic constitution (dosha) analysis",
    blurb:
      "Ravi helps you understand your dosha, your daily rhythm, and the simple food + sleep adjustments that Ayurveda prescribes for your constitution.",
    gradient: "from-amber-400 to-orange-700",
    initial: "R",
  },
];

export default function AIHealersPage() {
  return (
    <div className="space-y-14">
      <section className="relative overflow-hidden rounded-3xl bg-still-900 text-white px-8 py-14 md:py-20 text-center">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(900px 400px at 20% 0%, #4a8581 0%, transparent 60%), radial-gradient(900px 400px at 90% 100%, #2c5a5e 0%, transparent 60%)",
          }}
        />
        <div className="relative">
          <p className="uppercase tracking-[0.35em] text-xs text-still-200">
            Meet the avatars
          </p>
          <h1 className="mt-5 font-serif text-4xl md:text-5xl leading-tight max-w-3xl mx-auto">
            AI Healers
          </h1>
          <p className="mt-5 text-still-100/90 max-w-2xl mx-auto">
            We've created AI avatars of some of our healers, so you can get a
            first-hand feel for what holistic healing with Stillwater is like.
            Explore them, have a real conversation — and please tell us what
            you think.
          </p>
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-6">
        {HEALERS.map((h) => (
          <article key={h.id} className="card p-6 md:p-8 flex flex-col">
            <div className="flex items-center gap-4">
              <div
                className={`h-16 w-16 rounded-full bg-gradient-to-br ${h.gradient} grid place-items-center text-white font-serif text-2xl shadow-brand`}
              >
                {h.initial}
              </div>
              <div>
                <h2 className="font-serif text-2xl text-still-900">
                  {h.name}
                </h2>
                <p className="text-sm text-still-600 font-medium">{h.role}</p>
              </div>
            </div>
            <p className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-500">
              {h.tradition}
            </p>
            <p className="mt-4 text-slate-700 leading-relaxed flex-1">
              {h.blurb}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="badge bg-still-50 text-still-800 border border-still-200">
                Preview avatar
              </span>
              <span className="badge bg-emerald-50 text-emerald-800 border border-emerald-200">
                Feedback welcome
              </span>
            </div>
          </article>
        ))}
      </section>

      <section className="max-w-3xl mx-auto">
        <div className="text-center">
          <p className="label text-still-600">Your feedback shapes them</p>
          <h2 className="mt-2 font-serif text-3xl md:text-4xl text-still-900">
            Tell us how they felt.
          </h2>
          <p className="mt-3 text-slate-600">
            These avatars are early. What worked, what didn't, and what you
            wish they could do — all of it goes straight into the next
            training round.
          </p>
        </div>
        <div className="mt-8">
          <AvatarFeedbackForm
            avatars={HEALERS.map((h) => ({ id: h.id, name: h.name }))}
          />
        </div>
      </section>
    </div>
  );
}
