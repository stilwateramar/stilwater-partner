import Link from "next/link";
import { redirect } from "next/navigation";
import { getPartnerUser } from "@/lib/auth";
import { readDB } from "@/lib/db";
import { humanSlot } from "@/lib/slots";

export default function DoctorQueue() {
  const user = getPartnerUser()!;
  if (user.role !== "doctor") redirect("/partner");
  const db = readDB();
  const consults = db.consultations.filter(
    (c) =>
      c.doctorId === user.doctorId ||
      (c.providerId === user.providerId && !c.doctorId)
  );
  const upcoming = consults.filter(
    (c) => c.status === "confirmed" || c.status === "payment_pending"
  );
  const completed = consults.filter((c) => c.status === "completed");

  return (
    <div className="space-y-6">
      <div>
        <p className="label">Doctor queue</p>
        <h1 className="text-2xl font-semibold">Today's consultations</h1>
      </div>
      <Section title="Upcoming" items={upcoming} db={db} />
      <Section title="Completed" items={completed} db={db} />
    </div>
  );
}

function Section({
  title,
  items,
  db,
}: {
  title: string;
  items: any[];
  db: any;
}) {
  return (
    <div className="card overflow-x-auto">
      <div className="px-4 py-3 border-b border-slate-100 text-sm font-medium">
        {title}
      </div>
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
          <tr>
            {["Slot", "Patient", "Type", "Status", ""].map((h) => (
              <th key={h} className="px-3 py-2 text-left">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((c: any) => {
            const lead = db.leads.find((l: any) => l.id === c.leadId);
            return (
              <tr key={c.id} className="border-t border-slate-100">
                <td className="px-3 py-2">{humanSlot(c.slot)}</td>
                <td className="px-3 py-2 font-medium">{lead?.name ?? "—"}</td>
                <td className="px-3 py-2">{c.type}</td>
                <td className="px-3 py-2">
                  <span className="badge bg-slate-100 text-slate-700">
                    {c.status}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <Link
                    href={`/consultation/${c.id}`}
                    className="text-xs underline"
                  >
                    Open room →
                  </Link>
                </td>
              </tr>
            );
          })}
          {items.length === 0 && (
            <tr>
              <td colSpan={5} className="px-3 py-6 text-center text-slate-400">
                Nothing here.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
