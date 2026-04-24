import Link from "next/link";
import { getPartnerUser } from "@/lib/auth";
import { readDB } from "@/lib/db";

export default function PaymentsPage() {
  const user = getPartnerUser()!;
  const db = readDB();
  const links = db.paymentLinks.filter((p) =>
    user.providerId ? p.providerId === user.providerId : true
  );
  const invoices = db.invoices.filter((i) =>
    user.providerId ? i.providerId === user.providerId : true
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="label">Payments</p>
        <h1 className="text-2xl font-semibold">Payment links &amp; invoices</h1>
      </div>

      <div className="card overflow-x-auto">
        <div className="px-4 py-3 border-b border-slate-100 text-sm font-medium">
          Payment links
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr>
              {["When", "Lead", "For", "Amount", "Status", "", ""].map((h) => (
                <th key={h} className="px-3 py-2 text-left">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {links.map((l) => {
              const lead = db.leads.find((x) => x.id === l.leadId);
              return (
                <tr key={l.id} className="border-t border-slate-100">
                  <td className="px-3 py-2 text-xs">
                    {new Date(l.createdAt).toLocaleString()}
                  </td>
                  <td className="px-3 py-2">{lead?.name ?? "—"}</td>
                  <td className="px-3 py-2">{l.description}</td>
                  <td className="px-3 py-2">₹{l.amountInr}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`badge ${
                        l.status === "paid"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {l.status}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <Link
                      href={`/pay-link/${l.token}`}
                      className="text-xs underline"
                      target="_blank"
                    >
                      Open link ↗
                    </Link>
                  </td>
                  <td className="px-3 py-2">
                    {l.invoiceId ? (
                      <Link
                        href={`/invoice/${l.invoiceId}`}
                        className="text-xs underline"
                        target="_blank"
                      >
                        Invoice
                      </Link>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {links.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-slate-400">
                  No links yet. Generate one from a lead.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="card overflow-x-auto">
        <div className="px-4 py-3 border-b border-slate-100 text-sm font-medium">
          Invoices
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr>
              {["Number", "Issued", "Customer", "Total", ""].map((h) => (
                <th key={h} className="px-3 py-2 text-left">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {invoices.map((i) => (
              <tr key={i.id} className="border-t border-slate-100">
                <td className="px-3 py-2 font-mono text-xs">{i.number}</td>
                <td className="px-3 py-2 text-xs">
                  {new Date(i.issuedAt).toLocaleDateString()}
                </td>
                <td className="px-3 py-2">{i.customer.name}</td>
                <td className="px-3 py-2">₹{i.totalInr}</td>
                <td className="px-3 py-2">
                  <Link
                    href={`/invoice/${i.id}`}
                    className="text-xs underline"
                    target="_blank"
                  >
                    View / print
                  </Link>
                </td>
              </tr>
            ))}
            {invoices.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-slate-400">
                  No invoices yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
