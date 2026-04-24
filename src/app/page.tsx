import { redirect } from "next/navigation";
import Link from "next/link";
import ChatWidget from "@/components/ChatWidget";
import { readDB } from "@/lib/db";
import { getPartnerUser, getPatient } from "@/lib/auth";

export default function HomePage() {
  const partner = getPartnerUser();
  const patient = getPatient();
  if (partner) {
    redirect(partner.role === "stilwater_admin" ? "/admin" : "/partner");
  }
  if (patient) redirect("/patient/dashboard");

  const db = readDB();
  return (
    <div className="space-y-16">
      <section className="relative overflow-hidden rounded-3xl bg-still-900 text-white">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(1200px 400px at 70% 0%, #4a8581 0%, transparent 60%), radial-gradient(900px 400px at 10% 100%, #2c5a5e 0%, transparent 60%)",
          }}
        />
        <div className="relative px-8 py-14 md:py-20 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="uppercase tracking-[0.3em] text-xs text-still-200">
              The global community of holistic healing
            </p>
            <h1 className="mt-5 font-serif text-4xl md:text-6xl leading-tight">
              Healing rooted in <em className="italic font-serif">ancient Indian tradition,</em> clinically proven.
            </h1>
            <p className="mt-5 text-still-100/90 max-w-prose">
              Stillwater is the AI-powered partner platform that takes patients
              from a Meta ad all the way to a recorded consultation, a
              prescription, and ongoing follow-up care — one clean workflow for
              every provider.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/ad-simulator" className="btn-primary">
                Try the demo flow
              </Link>
              <Link
                href="/login"
                className="btn border border-white/40 text-white hover:bg-white/10"
              >
                Partner sign in
              </Link>
            </div>
          </div>
          <div className="card bg-white/95 p-5">
            <p className="label mb-3">Live chatbot demo</p>
            <ChatWidget embedded />
          </div>
        </div>
      </section>

      <section>
        <h2 className="font-serif text-2xl text-still-900">
          Our provider partners
        </h2>
        <div className="mt-4 grid md:grid-cols-2 gap-4">
          {db.providers.map((p) => (
            <Link
              key={p.id}
              href={`/providers/${p.id}`}
              className="card p-6 hover:border-still-400 transition"
            >
              <div className="flex items-center gap-3">
                <span
                  className="h-12 w-12 rounded-xl"
                  style={{ background: p.color }}
                />
                <div>
                  <div className="font-serif text-xl">{p.name}</div>
                  <div className="text-sm text-slate-500">{p.tagline}</div>
                </div>
              </div>
              <p className="mt-3 text-sm text-slate-600">{p.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-serif text-2xl text-still-900">
          How the workflow fits together
        </h2>
        <ol className="mt-4 grid md:grid-cols-3 gap-3 text-sm">
          {[
            ["1", "Meta / Instagram ad", "User clicks interest button on the ad."],
            ["2", "Lead captured", "Name, phone, preferred mode land in the Stillwater sheet."],
            ["3", "WhatsApp AI agent", "Greets the lead, answers FAQs, shares links."],
            ["4", "Agent calls lead", "Human or AI call in 8 Indian languages."],
            ["5", "Payment link", "Sent on WhatsApp + email — invoice issued automatically."],
            ["6", "Patient onboarded", "Portal with videos, reports, chatbot, avatar."],
            ["7", "Doctor consultation", "Recorded, transcribed, prescription issued."],
            ["8", "Follow-up", "Booked right from the patient portal."],
            ["9", "Ongoing care", "Nudges, credits, new programs."],
          ].map(([n, t, d]) => (
            <li key={n} className="card p-4">
              <div className="text-xs text-slate-400">Step {n}</div>
              <div className="mt-1 font-medium">{t}</div>
              <div className="mt-1 text-slate-600">{d}</div>
            </li>
          ))}
        </ol>
      </section>

      <ChatWidget />
    </div>
  );
}
