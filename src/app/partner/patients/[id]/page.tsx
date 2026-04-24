import Link from "next/link";
import { notFound } from "next/navigation";
import { getPartnerUser } from "@/lib/auth";
import { readDB } from "@/lib/db";

export default function PatientDetail({
  params,
}: {
  params: { id: string };
}) {
  const user = getPartnerUser()!;
  const db = readDB();
  const patient = db.patients.find((p) => p.id === params.id);
  if (!patient) notFound();
  if (user.providerId && patient.providerId !== user.providerId) notFound();

  const provider = db.providers.find((p) => p.id === patient.providerId);
  const program = patient.programId
    ? db.programs.find((p) => p.id === patient.programId)
    : null;
  const reports = db.reports.filter((r) => r.patientId === patient.id);
  const requests = db.patientRequests
    .filter((r) => r.patientId === patient.id)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  const invoices = db.invoices.filter(
    (i) => i.patientId === patient.id || i.leadId === patient.leadId
  );
  const prescriptions = db.prescriptions.filter(
    (p) => p.patientId === patient.id
  );

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/partner/patients"
          className="text-xs text-slate-500 underline"
        >
          ← All patients
        </Link>
        <h1 className="text-2xl font-semibold mt-1">{patient.name}</h1>
        <div className="text-sm text-slate-500">
          {patient.phone} {patient.email ? `· ${patient.email}` : ""} ·{" "}
          {provider?.name ?? "Stillwater community"}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-3 text-sm">
        <div className="card p-4">
          <div className="label">Plan</div>
          <div className="font-medium mt-1">
            {program ? program.name : "—"}
          </div>
          {program && (
            <div className="text-xs text-slate-500 mt-1">
              {program.durationWeeks} weeks · ₹
              {program.priceInr.toLocaleString("en-IN")}
            </div>
          )}
        </div>
        <div className="card p-4">
          <div className="label">Signup code</div>
          <div className="font-mono mt-1">{patient.signupCode ?? "—"}</div>
        </div>
        <div className="card p-4">
          <div className="label">Joined</div>
          <div className="mt-1">
            {new Date(patient.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>

      <section className="card p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Uploaded case details</h2>
          <span className="text-xs text-slate-500">{reports.length} files</span>
        </div>
        {reports.length === 0 ? (
          <p className="mt-2 text-sm text-slate-400">
            No files uploaded yet.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {reports.map((r) => (
              <li
                key={r.id}
                className="py-2 flex items-center justify-between"
              >
                <div>
                  <div className="font-medium text-sm">{r.title}</div>
                  <div className="text-xs text-slate-500">
                    {r.fileName} · {(r.sizeBytes / 1024).toFixed(1)} KB ·{" "}
                    {new Date(r.uploadedAt).toLocaleDateString()}
                  </div>
                </div>
                <a
                  className="btn-ghost text-xs"
                  href={r.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  download={r.fileName}
                >
                  ⬇ Download
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card p-5">
        <h2 className="font-semibold">Raised requests</h2>
        {requests.length === 0 ? (
          <p className="mt-2 text-sm text-slate-400">No requests.</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100 text-sm">
            {requests.map((r) => (
              <li key={r.id} className="py-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{r.subject}</div>
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
                </div>
                <p className="mt-1 text-slate-600 whitespace-pre-wrap">
                  {r.message}
                </p>
                <div className="mt-1 text-xs text-slate-400">
                  {new Date(r.createdAt).toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card p-5">
        <h2 className="font-semibold">Invoices</h2>
        {invoices.length === 0 ? (
          <p className="mt-2 text-sm text-slate-400">None yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100 text-sm">
            {invoices.map((i) => (
              <li
                key={i.id}
                className="py-2 flex items-center justify-between"
              >
                <div>
                  <div className="font-mono text-xs">{i.number}</div>
                  <div className="text-xs text-slate-500">
                    {new Date(i.issuedAt).toLocaleDateString()} · ₹
                    {i.totalInr.toLocaleString("en-IN")}
                  </div>
                </div>
                <Link
                  href={`/invoice/${i.id}`}
                  target="_blank"
                  className="text-xs underline"
                >
                  View
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card p-5">
        <h2 className="font-semibold">Prescriptions</h2>
        {prescriptions.length === 0 ? (
          <p className="mt-2 text-sm text-slate-400">None yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100 text-sm">
            {prescriptions.map((p) => (
              <li key={p.id} className="py-2">
                <div className="text-xs text-slate-500">
                  {new Date(p.issuedAt).toLocaleDateString()}
                </div>
                <ol className="mt-1 list-decimal ml-4">
                  {p.items.map((x, i) => (
                    <li key={i}>
                      {x.medicine} — {x.dose}, {x.frequency}, {x.duration}
                    </li>
                  ))}
                </ol>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
