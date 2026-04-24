import Link from "next/link";
import { redirect } from "next/navigation";
import { getPatient } from "@/lib/auth";
import { readDB } from "@/lib/db";
import { humanSlot } from "@/lib/slots";

export default function PatientConsultations() {
  const patient = getPatient();
  if (!patient) redirect("/patient/login");
  const db = readDB();
  const list = db.consultations.filter(
    (c) => c.patientId === patient.id || c.leadId === patient.leadId
  );
  const doctors = db.doctors.filter((d) => d.providerId === patient.providerId);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="label">Consultations</p>
          <h1 className="text-2xl font-semibold">Your consultations</h1>
        </div>
        <Link
          href={`/book?provider=${patient.providerId}&leadId=${patient.leadId ?? ""}`}
          className="btn-primary"
        >
          Book new slot
        </Link>
      </div>

      <div className="card p-5">
        <h2 className="font-semibold text-sm">Doctors at {db.providers.find((p)=>p.id===patient.providerId)?.name}</h2>
        <div className="mt-2 grid sm:grid-cols-2 gap-2">
          {doctors.map((d) => (
            <div key={d.id} className="rounded-lg border border-slate-200 p-3">
              <div className="font-medium">{d.name}</div>
              <div className="text-xs text-slate-500">{d.specialty}</div>
              <div className="text-xs mt-1">Fee ₹{d.feeInr}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr>
              {["Slot", "Doctor", "Type", "Status", ""].map((h) => (
                <th key={h} className="px-3 py-2 text-left">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {list.map((c) => {
              const d = db.doctors.find((x) => x.id === c.doctorId);
              return (
                <tr key={c.id} className="border-t border-slate-100">
                  <td className="px-3 py-2">{humanSlot(c.slot)}</td>
                  <td className="px-3 py-2">{d?.name ?? "AI avatar"}</td>
                  <td className="px-3 py-2">{c.type}</td>
                  <td className="px-3 py-2">
                    <span className="badge bg-slate-100 text-slate-700">
                      {c.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <Link
                      href={`/consultation/${c.id}`}
                      className="text-xs underline"
                    >
                      Open →
                    </Link>
                  </td>
                </tr>
              );
            })}
            {list.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-slate-400">
                  No consultations yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
