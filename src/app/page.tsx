import { redirect } from "next/navigation";
import Link from "next/link";
import StilwaterLogo from "@/components/StilwaterLogo";
import EnquiryForm from "@/components/EnquiryForm";
import { getPartnerUser, getPatient } from "@/lib/auth";

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
          className="absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(1200px 420px at 75% 0%, #4a8581 0%, transparent 60%), radial-gradient(900px 420px at 5% 100%, #2c5a5e 0%, transparent 60%)",
          }}
        />
        <div className="relative px-8 py-14 md:py-20 flex flex-col md:flex-row md:items-center gap-10">
          <div className="md:flex-1">
            <StilwaterLogo href={null} size="lg" />
            <p className="mt-6 font-serif text-3xl md:text-5xl leading-tight text-white">
              The global community for{" "}
              <em className="italic font-serif text-still-200">
                holistic healing.
              </em>
            </p>
            <p className="mt-5 text-still-100/90 max-w-xl">
              People across the world have healed themselves of{" "}
              <span className="text-white font-medium">
                diabetes, hypertension, thyroid issues, eye problems and more
              </span>{" "}
              by embracing Yoga, Meditation, plant-based nutrition and Ayurveda
              — the timeless wisdom of the East, now supported by modern
              science.
            </p>
            <p className="mt-4 text-still-100/80 max-w-xl">
              At <span className="text-white font-semibold">Stillwater</span>,
              we help you live a holistic lifestyle with the gentle guidance of
              AI — from your first question, to daily practice, to full
              recovery.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/partner-ai-tools" className="btn-primary">
                Explore Partner AI Tools
              </Link>
              <Link
                href="/ai-healers"
                className="btn border border-white/40 text-white hover:bg-white/10"
              >
                Meet our AI Healers
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-4">
        {[
          {
            title: "Ancient practice, modern proof",
            body:
              "Yoga and pranayama have reversed hypertension and pre-diabetes in thousands of people — clinical studies now back what gurus have taught for centuries.",
          },
          {
            title: "Food as medicine",
            body:
              "Plant-based nutrition has been shown to reverse Type 2 diabetes, lower LDL cholesterol and improve eye health. Small daily shifts, profound results.",
          },
          {
            title: "Guided by AI, rooted in tradition",
            body:
              "Our AI healers, crafted with real gurus and doctors, walk alongside you — in your language, on your schedule, at your pace.",
          },
        ].map((c) => (
          <div key={c.title} className="card p-6">
            <h3 className="font-serif text-xl text-still-900">{c.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{c.body}</p>
          </div>
        ))}
      </section>

      <section className="card p-8 md:p-10 bg-gradient-to-br from-still-50 to-white">
        <div className="grid md:grid-cols-[1fr_1.1fr] gap-8">
          <div>
            <p className="label">Enquire with us</p>
            <h2 className="mt-2 font-serif text-3xl text-still-900">
              Start your holistic healing journey.
            </h2>
            <p className="mt-3 text-slate-600 max-w-md">
              Share a few details and our team will reach out on WhatsApp with
              the program most suited to you. No spam, ever.
            </p>
            <ul className="mt-5 space-y-2 text-sm text-slate-700">
              <li>· Free initial consultation</li>
              <li>· Programs in 8 Indian languages</li>
              <li>· Guided by doctors, gurus and AI</li>
            </ul>
          </div>
          <EnquiryForm />
        </div>
      </section>
    </div>
  );
}
