import { readDB } from "@/lib/db";
import FeedbackForm from "@/components/FeedbackForm";

export default function AIHealersPage() {
  const db = readDB();
  const avatars = db.avatars.slice(0, 4);

  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-3xl bg-still-900 text-white px-8 py-12 md:py-16">
        <div
          className="absolute inset-0 opacity-50"
          style={{
            background:
              "radial-gradient(800px 300px at 80% 0%, #7aa9a4 0%, transparent 60%), radial-gradient(700px 300px at 10% 100%, #2c5a5e 0%, transparent 60%)",
          }}
        />
        <div className="relative max-w-3xl">
          <p className="label text-still-200">AI Healers</p>
          <h1 className="mt-3 font-serif text-4xl md:text-5xl leading-tight">
            Meet the{" "}
            <em className="italic font-serif text-still-200">
              AI avatars
            </em>{" "}
            of our healers.
          </h1>
          <p className="mt-4 text-still-100/90">
            We have created AI avatars of some of our real healers so you can
            get a feel of what holistic healing entails — without waiting for
            an appointment. Explore, converse, and tell us what you'd like us
            to improve.
          </p>
          <p className="mt-3 text-sm text-still-100/70">
            These avatars are a preview. They complement — never replace — a
            consultation with a qualified doctor or guru.
          </p>
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-5">
        {avatars.map((a) => (
          <div key={a.id} className="card p-6">
            <div className="flex items-start gap-4">
              <div
                className="relative h-20 w-20 shrink-0 rounded-2xl flex items-center justify-center text-4xl shadow-brand"
                style={{
                  background: `linear-gradient(135deg, hsl(${a.hue} 65% 55%), hsl(${a.hue} 45% 30%))`,
                }}
                aria-hidden
              >
                <span>{a.emoji}</span>
                <span className="absolute bottom-1 right-1 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-white" />
              </div>
              <div className="flex-1">
                <h2 className="font-serif text-xl text-still-900">{a.name}</h2>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-500 mt-0.5">
                  {a.specialty}
                </div>
                <p className="mt-2 text-sm text-slate-700">{a.blurb}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <a
                    href={`/avatar?healer=${a.id}`}
                    className="btn-primary text-xs"
                  >
                    Start a conversation
                  </a>
                  <a href="#feedback" className="btn-ghost text-xs">
                    Give feedback
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>

      <section id="feedback" className="card p-8 bg-still-50">
        <div className="grid md:grid-cols-[1fr_1.1fr] gap-8">
          <div>
            <p className="label">Your feedback shapes the avatars</p>
            <h2 className="mt-2 font-serif text-3xl text-still-900">
              How did your session feel?
            </h2>
            <p className="mt-3 text-slate-600 max-w-md">
              Every review goes directly to our product and healer team. Tell
              us what felt authentic, what felt off, and what you wish the
              avatar could do.
            </p>
          </div>
          <FeedbackForm avatars={avatars} />
        </div>
      </section>
    </div>
  );
}
