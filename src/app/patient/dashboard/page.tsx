import Link from "next/link";
import { redirect } from "next/navigation";
import { getPatient } from "@/lib/auth";
import { readDB } from "@/lib/db";
import RaiseRequestPanel from "./raise-request";

export default function PatientDashboard() {
  const patient = getPatient();
  if (!patient) redirect("/patient/login");
  const db = readDB();
  const provider = db.providers.find((p) => p.id === patient.providerId);
  const program = patient.programId
    ? db.programs.find((p) => p.id === patient.programId)
    : null;
  const reports = db.reports.filter((r) => r.patientId === patient.id);
  const invoices = db.invoices
    .filter(
      (i) => i.patientId === patient.id || i.leadId === patient.leadId
    )
    .sort(
      (a, b) =>
        new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime()
    );
  const myRequests = db.patientRequests
    .filter((r) => r.patientId === patient.id)
    .slice(0, 5);

  // Recommended healers = other providers + a couple of featured healer
  // avatars that aren't the user's own provider.
  const otherProviders = db.providers.filter(
    (p) => p.id !== patient.providerId
  );
  const otherAvatars = db.avatars.filter(
    (a) => a.providerId !== patient.providerId
  );

  return (
    <div className="space-y-6">
      <div className="card p-6 bg-gradient-to-br from-still-50 to-white">
        <p className="label">Your healing partner</p>
        {provider ? (
          <h1 className="mt-1 font-serif text-3xl text-still-900">
            You're with <b>{provider.name}</b>, {patient.name.split(" ")[0]}.
          </h1>
        ) : (
          <h1 className="mt-1 font-serif text-3xl text-still-900">
            Welcome to the Stillwater community, {patient.name.split(" ")[0]}.
          </h1>
        )}
        {program ? (
          <p className="mt-2 text-slate-700">
            You are enrolled in the{" "}
            <span className="font-semibold">{program.name}</span> —{" "}
            {program.durationWeeks} weeks, ₹{program.priceInr.toLocaleString(
              "en-IN"
            )}
            .
          </p>
        ) : provider ? (
          <p className="mt-2 text-slate-700">
            Your partner admin will enrol you in a plan shortly. In the
            meantime, explore the resources below.
          </p>
        ) : (
          <p className="mt-2 text-slate-700">
            You haven't been matched with a partner yet. Explore the
            recommended healers below, or raise a request and our team will
            reach out.
          </p>
        )}
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <span className="badge bg-emerald-100 text-emerald-700">
            Partner: {provider?.name ?? "Stillwater community"}
          </span>
          {program && (
            <span className="badge bg-still-100 text-still-800">
              Plan: {program.name}
            </span>
          )}
          {patient.signupCode && (
            <span className="badge bg-slate-100 text-slate-700">
              Signup code: {patient.signupCode}
            </span>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-[1.1fr_1fr] gap-4">
        <section className="card p-5" id="raise-request">
          <h2 className="font-semibold">
            Raise a request to {provider?.name ?? "our team"}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Questions about your plan, meals, medicines, appointments? Submit
            here. Your partner admins will be notified by email <em>and</em>{" "}
            WhatsApp.
          </p>
          <div className="mt-3">
            <RaiseRequestPanel />
          </div>
          {myRequests.length > 0 && (
            <div className="mt-4">
              <div className="label">Your recent requests</div>
              <ul className="mt-2 divide-y divide-slate-100 text-sm">
                {myRequests.map((r) => (
                  <li
                    key={r.id}
                    className="py-2 flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="font-medium">{r.subject}</div>
                      <div className="text-xs text-slate-500">
                        {new Date(r.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <span
                      className={`badge ${
                        r.status === "resolved"
                          ? "bg-emerald-100 text-emerald-700"
                          : r.status === "in_progress"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {r.status.replace("_", " ")}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <section className="card p-5" id="case-details">
          <h2 className="font-semibold">Upload your case details</h2>
          <p className="text-sm text-slate-500 mt-1">
            Share previous prescriptions, diagnostic reports, scans — anything
            that helps your care team. Uploaded files are available to your{" "}
            {provider?.name ?? "partner"} admin team for review.
          </p>
          <div className="mt-3">
            <Link href="/patient/reports" className="btn-primary">
              Upload prescriptions / reports
            </Link>
          </div>
          <ul className="mt-4 text-sm divide-y divide-slate-100">
            {reports.slice(0, 4).map((r) => (
              <li key={r.id} className="py-2 flex items-center justify-between">
                <div>
                  <div className="font-medium">{r.title}</div>
                  <div className="text-xs text-slate-500">
                    {r.fileName} ·{" "}
                    {new Date(r.uploadedAt).toLocaleDateString()}
                  </div>
                </div>
                <a
                  className="text-xs underline"
                  href={r.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  View
                </a>
              </li>
            ))}
            {reports.length === 0 && (
              <li className="py-2 text-slate-400 text-sm">
                No case files uploaded yet.
              </li>
            )}
          </ul>
        </section>
      </div>

      <section className="card p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Recommended healers from Stillwater</h2>
          <Link href="/ai-healers" className="text-xs underline">
            Explore all AI healers →
          </Link>
        </div>
        <p className="text-sm text-slate-500 mt-1">
          Other partners in our community you may benefit from.
        </p>
        <div className="mt-3 grid sm:grid-cols-2 md:grid-cols-3 gap-3">
          {otherProviders.map((p) => (
            <Link
              key={p.id}
              href={`/providers/${p.id}`}
              className="card p-4 hover:border-still-400 bg-white"
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-8 w-8 rounded-lg"
                  style={{ background: p.color }}
                />
                <div>
                  <div className="font-medium">{p.name}</div>
                  <div className="text-[11px] uppercase tracking-wider text-slate-500">
                    {p.tagline.slice(0, 34)}…
                  </div>
                </div>
              </div>
              <p className="mt-2 text-xs text-slate-600 line-clamp-3">
                {p.description}
              </p>
            </Link>
          ))}
          {otherAvatars.slice(0, 3).map((a) => (
            <Link
              key={a.id}
              href="/ai-healers"
              className="card p-4 hover:border-still-400 bg-white"
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-lg"
                  style={{
                    background: `linear-gradient(135deg, hsl(${a.hue} 65% 55%), hsl(${a.hue} 45% 30%))`,
                  }}
                >
                  {a.emoji}
                </span>
                <div>
                  <div className="font-medium">{a.name}</div>
                  <div className="text-[11px] uppercase tracking-wider text-slate-500">
                    AI healer
                  </div>
                </div>
              </div>
              <p className="mt-2 text-xs text-slate-600 line-clamp-3">
                {a.blurb}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="card p-5" id="invoices">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Your invoices</h2>
          <span className="text-xs text-slate-500">
            {invoices.length} total
          </span>
        </div>
        <p className="text-sm text-slate-500 mt-1">
          Download any invoice for your payments — useful for insurance and
          reimbursement.
        </p>
        {invoices.length === 0 ? (
          <div className="mt-4 text-sm text-slate-400">
            No invoices yet. Once you pay for a plan or consultation, receipts
            appear here.
          </div>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                <tr>
                  {["Invoice #", "Issued", "Items", "Total", ""].map((h) => (
                    <th key={h} className="px-3 py-2 text-left">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-t border-slate-100">
                    <td className="px-3 py-2 font-mono text-xs">
                      {inv.number}
                    </td>
                    <td className="px-3 py-2 text-xs">
                      {new Date(inv.issuedAt).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-2">
                      {inv.items[0]?.description ?? "—"}
                      {inv.items.length > 1 && (
                        <span className="text-xs text-slate-500">
                          {" "}
                          +{inv.items.length - 1} more
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 font-medium">
                      ₹{inv.totalInr.toLocaleString("en-IN")}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <Link
                        href={`/invoice/${inv.id}`}
                        target="_blank"
                        className="text-xs underline"
                      >
                        View / download
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
