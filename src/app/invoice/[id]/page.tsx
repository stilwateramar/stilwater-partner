import { notFound } from "next/navigation";
import { readDB } from "@/lib/db";
import PrintButton from "@/components/PrintButton";

export default function InvoicePage({ params }: { params: { id: string } }) {
  const db = readDB();
  const invoice = db.invoices.find((i) => i.id === params.id);
  if (!invoice) notFound();
  const provider = db.providers.find((p) => p.id === invoice.providerId)!;

  return (
    <div className="max-w-2xl mx-auto card p-8 print:shadow-none print:border-0">
      <div className="flex items-start justify-between">
        <div>
          <div
            className="h-10 w-10 rounded-lg mb-3"
            style={{ background: provider.color }}
          />
          <div className="text-lg font-semibold">{provider.name}</div>
          <div className="text-xs text-slate-500">
            via Stilwater · {provider.website}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs uppercase text-slate-500">Invoice</div>
          <div className="font-mono text-lg">{invoice.number}</div>
          <div className="text-xs text-slate-500 mt-1">
            Issued {new Date(invoice.issuedAt).toLocaleDateString()}
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="label">Billed to</div>
          <div className="font-medium">{invoice.customer.name}</div>
          <div className="text-slate-500">{invoice.customer.phone}</div>
          {invoice.customer.email && (
            <div className="text-slate-500">{invoice.customer.email}</div>
          )}
        </div>
        <div className="text-right">
          <div className="label">Status</div>
          <div className="badge bg-emerald-100 text-emerald-700">Paid</div>
        </div>
      </div>

      <table className="w-full mt-6 text-sm">
        <thead className="text-xs uppercase text-slate-500 border-b border-slate-200">
          <tr>
            <th className="py-2 text-left">Description</th>
            <th className="py-2 text-right">Qty</th>
            <th className="py-2 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((it, i) => (
            <tr key={i} className="border-b border-slate-100">
              <td className="py-2">{it.description}</td>
              <td className="py-2 text-right">{it.qty}</td>
              <td className="py-2 text-right">₹{it.priceInr}</td>
            </tr>
          ))}
        </tbody>
        <tfoot className="text-sm">
          <tr>
            <td colSpan={2} className="py-2 text-right text-slate-500">
              Subtotal
            </td>
            <td className="py-2 text-right">₹{invoice.subtotalInr}</td>
          </tr>
          <tr>
            <td colSpan={2} className="py-2 text-right text-slate-500">
              GST 18%
            </td>
            <td className="py-2 text-right">₹{invoice.gstInr}</td>
          </tr>
          <tr className="border-t border-slate-300">
            <td colSpan={2} className="py-2 text-right font-semibold">
              Total
            </td>
            <td className="py-2 text-right font-semibold">
              ₹{invoice.totalInr}
            </td>
          </tr>
        </tfoot>
      </table>

      <div className="mt-6 text-xs text-slate-500">
        Thank you for your payment. This is a computer-generated invoice. For
        support, reply to our WhatsApp thread.
      </div>

      <div className="mt-6 print:hidden">
        <PrintButton />
      </div>
    </div>
  );
}
