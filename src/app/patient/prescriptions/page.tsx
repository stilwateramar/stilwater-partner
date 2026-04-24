import Link from "next/link";
import { redirect } from "next/navigation";
import { getPatient } from "@/lib/auth";
import { readDB } from "@/lib/db";

export default function PatientPrescriptions() {
  const patient = getPatient();
  if (!patient) redirect("/patient/login");
  const db = readDB();
  const list = db.prescriptions.filter((p) => p.patientId === patient.id);

  return (
    <div className="space-y-5">
      <div>
        <p className="label">Prescriptions</p>
        <h1 className="text-2xl font-semibold">Your prescriptions</h1>
      </div>

      {list.length === 0 && (
        <div className="card p-6 text-center text-slate-500">
          No prescriptions yet. They'll appear here after your consultation.
        </div>
      )}

      <div className="space-y-4">
        {list.map((p) => {
          const doctor = db.doctors.find((d) => d.id === p.doctorId);
          return (
            <div key={p.id} className="card p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{doctor?.name ?? "Doctor"}</div>
                  <div className="text-xs text-slate-500">
                    {doctor?.specialty} · {new Date(p.issuedAt).toLocaleDateString()}
                  </div>
                </div>
                {p.nextFollowUpDays && (
                  <Link
                    href={`/patient/consultations`}
                    className="btn-ghost text-xs"
                  >
                    Book follow-up in {p.nextFollowUpDays}d →
                  </Link>
                )}
              </div>
              <table className="w-full mt-4 text-sm">
                <thead className="text-xs uppercase text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="py-2 text-left">Medicine</th>
                    <th className="py-2 text-left">Dose</th>
                    <th className="py-2 text-left">Frequency</th>
                    <th className="py-2 text-left">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {p.items.map((it, i) => (
                    <tr key={i} className="border-b border-slate-100">
                      <td className="py-2">{it.medicine}</td>
                      <td className="py-2">{it.dose}</td>
                      <td className="py-2">{it.frequency}</td>
                      <td className="py-2">{it.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {p.lifestyle.length > 0 && (
                <div className="mt-3">
                  <div className="label">Lifestyle</div>
                  <ul className="mt-1 text-sm list-disc list-inside space-y-1">
                    {p.lifestyle.map((l, i) => (
                      <li key={i}>{l}</li>
                    ))}
                  </ul>
                </div>
              )}
              {p.notes && (
                <div className="mt-3 text-sm text-slate-700 bg-slate-50 rounded-lg p-3">
                  {p.notes}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
