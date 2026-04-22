import Link from "next/link";
import ChatWidget from "@/components/ChatWidget";
import { readDB } from "@/lib/db";

export default function HomePage() {
  const db = readDB();
  return (
    <div className="space-y-12">
      <section className="grid md:grid-cols-2 gap-8 items-center">
        <div>
          <p className="label mb-2">Stilwater · partner platform</p>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
            From a Meta ad to a consultation — fully automated.
          </h1>
          <p className="mt-4 text-slate-600 max-w-prose">
            Stilwater helps wellness providers like SHARAN and Amar Eye Yoga
            capture leads from Meta &amp; Instagram ads, engage them on WhatsApp
            with an AI agent, book consultations with AI avatars or human
            doctors, collect payments via Razorpay, and close the loop with
            recorded sessions and transcripts.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/ad-simulator" className="btn-primary">
              Try the ad → booking flow
            </Link>
            <Link href="/admin" className="btn-ghost">
              Open admin dashboard
            </Link>
          </div>
        </div>
        <div className="card p-5">
          <p className="label mb-3">Live chatbot demo</p>
          <ChatWidget embedded />
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Our provider partners</h2>
        <div className="mt-4 grid md:grid-cols-2 gap-4">
          {db.providers.map((p) => (
            <Link
              key={p.id}
              href={`/providers/${p.id}`}
              className="card p-5 hover:border-still-300 transition"
            >
              <div className="flex items-center gap-3">
                <span
                  className="h-10 w-10 rounded-xl"
                  style={{ background: p.color }}
                />
                <div>
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-sm text-slate-500">{p.tagline}</div>
                </div>
              </div>
              <p className="mt-3 text-sm text-slate-600">{p.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold">How the workflow fits together</h2>
        <ol className="mt-4 grid md:grid-cols-3 gap-3 text-sm">
          {[
            ["1", "Meta / Instagram ad", "User clicks interest button on the ad."],
            ["2", "Lead captured", "Name, phone, preferred mode land in the Stilwater sheet."],
            ["3", "WhatsApp AI agent", "Greets the lead, answers FAQs, shares links."],
            ["4", "Consultation booked", "Calendar + Razorpay payment, in-person or AI avatar."],
            ["5", "Recorded + transcribed", "Auto-summary and actions in admin."],
            ["6", "Follow-ups", "AI drafts next steps, nudges via WhatsApp."],
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
