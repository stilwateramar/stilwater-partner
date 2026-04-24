import Link from "next/link";
import { redirect } from "next/navigation";
import { getPatient } from "@/lib/auth";
import { readDB } from "@/lib/db";

export default function PatientDashboard() {
  const patient = getPatient();
  if (!patient) redirect("/patient/login");
  const db = readDB();
  const provider = db.providers.find((p) => p.id === patient.providerId);
  const reports = db.reports.filter((r) => r.patientId === patient.id);
  const consults = db.consultations.filter(
    (c) => c.leadId === patient.leadId || c.patientId === patient.id
  );
  const prescriptions = db.prescriptions.filter(
    (p) => p.patientId === patient.id
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="label">Welcome to Stilwater</p>
        <h1 className="text-2xl font-semibold">
          Hi {patient.name.split(" ")[0]}, you're all set.
        </h1>
        <p className="text-sm text-slate-500">
          You're enrolled with <span className="font-medium">{provider?.name}</span>. Explore videos from Dr. Nandita, upload your reports, and schedule consultations.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <Card label="Chatbot credits" value={patient.chatbotCredits} hint="Each query ≈ 1 credit" />
        <Card label="Avatar credits" value={patient.avatarCredits} hint="Each avatar session ≈ 1 credit" />
        <Card label="Reports uploaded" value={reports.length} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Link href="/patient/videos" className="card p-5 hover:border-still-300">
          <div className="font-semibold">Watch Dr. Nandita's videos →</div>
          <p className="text-sm text-slate-600 mt-1">
            Core teachings, protocols and FAQs.
          </p>
        </Link>
        <Link href="/patient/consultations" className="card p-5 hover:border-still-300">
          <div className="font-semibold">Book a consultation →</div>
          <p className="text-sm text-slate-600 mt-1">
            Pick a slot with a SHARAN doctor.
          </p>
        </Link>
        <Link href="/patient/reports" className="card p-5 hover:border-still-300">
          <div className="font-semibold">Upload diagnostic reports →</div>
          <p className="text-sm text-slate-600 mt-1">
            Share blood tests, imaging, earlier prescriptions.
          </p>
        </Link>
        <Link href="/patient/chatbot" className="card p-5 hover:border-still-300">
          <div className="font-semibold">Ask the SHARAN chatbot →</div>
          <p className="text-sm text-slate-600 mt-1">
            Instant answers, 24×7. Avatar available at additional cost.
          </p>
        </Link>
      </div>

      <div className="card p-5">
        <h2 className="font-semibold">Your journey</h2>
        <ul className="mt-3 text-sm space-y-2">
          <li className="flex gap-2">
            <span className="badge bg-emerald-100 text-emerald-700">payment</span>
            Program paid ✓
          </li>
          <li className="flex gap-2">
            <span className="badge bg-slate-100 text-slate-700">consultation</span>
            {consults.length ? `${consults.length} scheduled/completed` : "Nothing yet — book your first one"}
          </li>
          <li className="flex gap-2">
            <span className="badge bg-slate-100 text-slate-700">prescriptions</span>
            {prescriptions.length
              ? `${prescriptions.length} issued`
              : "None yet — will appear after your consultation"}
          </li>
        </ul>
      </div>
    </div>
  );
}

function Card({ label, value, hint }: { label: string; value: number; hint?: string }) {
  return (
    <div className="card p-4">
      <div className="label">{label}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
      {hint && <div className="text-xs text-slate-500 mt-1">{hint}</div>}
    </div>
  );
}
