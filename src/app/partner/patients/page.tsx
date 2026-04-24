import Link from "next/link";
import { getPartnerUser } from "@/lib/auth";
import { readDB } from "@/lib/db";

export default function PatientsListPage() {
  const user = getPartnerUser()!;
  const db = readDB();
  const patients = db.patients.filter((p) =>
    user.providerId ? p.providerId === user.providerId : true
  );
  return (
    <div className="space-y-4">
      <div>
        <p className="label">Patients</p>
        <h1 className="text-2xl font-semibold">Your enrolled users</h1>
        <p className="text-sm text-slate-500">
          Every user who signed up with a {user.providerId ? "" : "partner "}code
          or paid for a plan.
        </p>
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr>
              {["Name", "Phone", "Plan", "Signed up", "Case files", ""].map(
                (h) => (
                  <th key={h} className="px-3 py-2 text-left">
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {patients.map((p) => {
              const program = p.programId
                ? db.programs.find((x) => x.id === p.programId)
                : null;
              const reports = db.reports.filter((r) => r.patientId === p.id);
              return (
                <tr key={p.id} className="border-t border-slate-100">
                  <td className="px-3 py-2 font-medium">{p.name}</td>
                  <td className="px-3 py-2 font-mono text-xs">{p.phone}</td>
                  <td className="px-3 py-2">{program?.name ?? "—"}</td>
                  <td className="px-3 py-2 text-xs">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-2">{reports.length}</td>
                  <td className="px-3 py-2 text-right">
                    <Link
                      href={`/partner/patients/${p.id}`}
                      className="text-xs underline"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              );
            })}
            {patients.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-3 py-8 text-center text-slate-400"
                >
                  No patients yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
