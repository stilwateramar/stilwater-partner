import { redirect } from "next/navigation";
import Link from "next/link";
import ChatWidget from "@/components/ChatWidget";
import EnquiryForm from "@/components/EnquiryForm";
import { getPartnerUser, getPatient } from "@/lib/auth";

const HEALING_PILLARS = [
  {
    title: "Yoga",
    body:
      "Time-tested asana and breath practices that restore mobility, calm the nervous system, and rebuild inner strength.",
  },
  {
    title: "Meditation",
    body:
      "Daily mindfulness routines that lower stress hormones and help the body's own healing systems come back online.",
  },
  {
    title: "Plant-based nutrition",
    body:
      "Whole-food, plant-forward eating that has reversed diabetes, dropped blood pressure, and lifted energy for thousands.",
  },
  {
    title: "Ayurveda",
    body:
      "Personalised protocols from India's oldest medical tradition, addressing root causes rather than masking symptoms.",
  },
];

const HEALED_CONDITIONS = [
  "Type 2 diabetes",
  "Hypertension",
  "Myopia & eye strain",
  "Obesity",
  "Chronic insomnia",
  "Anxiety & burnout",
  "PCOS",
  "Digestive disorders",
];

export default function HomePage() {
  const partner = getPartnerUser();
  const patient = getPatient();
  if (partner) {
    redirect(partner.role === "stilwater_admin" ? "/admin" : "/partner");
  }
  if (patient) redirect("/patient/dashboard");

  return (
    <div className="space-y-20">
      <section className="relative overflow-hidden rounded-3xl bg-still-900 text-white">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(1200px 400px at 70% 0%, #4a8581 0%, transparent 60%), radial-gradient(900px 400px at 10% 100%, #2c5a5e 0%, transparent 60%)",
          }}
        />
        <div className="relative px-8 py-16 md:py-24 text-center">
          <p className="uppercase tracking-[0.35em] text-xs text-still-200">
            The global community for holistic healing
          </p>
          <h1 className="mt-6 font-serif text-4xl md:text-6xl leading-tight max-w-4xl mx-auto">
            Heal the way humans have always healed —
            <em className="block italic font-serif mt-2">
              with nature, breath and a little AI.
            </em>
          </h1>
          <p className="mt-6 text-still-100/90 max-w-2xl mx-auto text-lg">
            Stillwater is where ancient Indian wisdom meets modern technology,
            helping you live a holistic life, one day at a time.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <Link href="#enquire" className="btn-primary">
              Start your healing journey
            </Link>
            <Link
              href="/ai-healers"
              className="btn border border-white/40 text-white hover:bg-white/10"
            >
              Meet our AI healers
            </Link>
          </div>
        </div>
      </section>

      <section className="grid md:grid-cols-[1.1fr_1fr] gap-10 items-center">
        <div>
          <p className="label text-still-600">A quiet revolution</p>
          <h2 className="mt-2 font-serif text-3xl md:text-4xl text-still-900 leading-tight">
            People across the world are healing themselves — without a lifetime
            of pills.
          </h2>
          <p className="mt-5 text-slate-700 leading-relaxed">
            From Bengaluru to Berlin, thousands have reversed{" "}
            <strong>diabetes</strong>, brought down <strong>hypertension</strong>
            , restored their <strong>eyesight</strong>, and reclaimed their
            energy through four timeless practices:{" "}
            <strong>Yoga, Meditation, Plant-based nutrition</strong> and{" "}
            <strong>Ayurveda</strong>. The science is catching up to what our
            grandparents always knew — the body wants to heal, if we only give
            it the right conditions.
          </p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {HEALED_CONDITIONS.map((c) => (
              <li
                key={c}
                className="badge bg-still-50 text-still-800 border border-still-200"
              >
                {c}
              </li>
            ))}
          </ul>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {HEALING_PILLARS.map((p) => (
            <div key={p.title} className="card p-5">
              <div className="font-serif text-xl text-still-800">{p.title}</div>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                {p.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl bg-gradient-to-br from-still-50 to-sand-100 p-8 md:p-14 text-center">
        <p className="label text-still-600">Where Stillwater comes in</p>
        <h2 className="mt-2 font-serif text-3xl md:text-4xl text-still-900">
          A holistic lifestyle, gently guided by AI.
        </h2>
        <p className="mt-5 max-w-2xl mx-auto text-slate-700 leading-relaxed">
          Change is hard alone. Stillwater pairs you with AI healers, daily
          nudges, personalised plans and human doctors so you can actually stay
          on the path. Your practice, your meals, your follow-ups — all in one
          calm place.
        </p>
        <div className="mt-8 grid md:grid-cols-3 gap-4 text-left">
          <div className="card p-5">
            <div className="font-serif text-lg text-still-800">
              Your AI companion
            </div>
            <p className="mt-2 text-sm text-slate-600">
              Multi-lingual AI healers answer your questions at 2am, track your
              progress and remind you to breathe.
            </p>
          </div>
          <div className="card p-5">
            <div className="font-serif text-lg text-still-800">
              Trusted human experts
            </div>
            <p className="mt-2 text-sm text-slate-600">
              Partner doctors and yoga therapists review your plan — the AI
              never diagnoses alone.
            </p>
          </div>
          <div className="card p-5">
            <div className="font-serif text-lg text-still-800">
              One quiet dashboard
            </div>
            <p className="mt-2 text-sm text-slate-600">
              Videos, prescriptions, reports, follow-ups — gathered together so
              nothing slips.
            </p>
          </div>
        </div>
      </section>

      <section id="enquire" className="scroll-mt-24">
        <div className="max-w-3xl mx-auto text-center">
          <p className="label text-still-600">Tell us about you</p>
          <h2 className="mt-2 font-serif text-3xl md:text-4xl text-still-900">
            Start with a conversation.
          </h2>
          <p className="mt-4 text-slate-600">
            Share a few details and a Stillwater guide will reach out with the
            right next step — a healer, a programme, or simply a listening ear.
          </p>
        </div>
        <div className="mt-8 max-w-3xl mx-auto">
          <EnquiryForm />
        </div>
      </section>

      <ChatWidget />
    </div>
  );
}
