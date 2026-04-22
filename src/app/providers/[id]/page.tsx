import Link from "next/link";
import { notFound } from "next/navigation";
import ChatWidget from "@/components/ChatWidget";
import { readDB } from "@/lib/db";

export default function ProviderPage({ params }: { params: { id: string } }) {
  const db = readDB();
  const provider = db.providers.find((p) => p.id === params.id);
  if (!provider) notFound();
  const doctors = db.doctors.filter((d) => d.providerId === provider.id);

  return (
    <div className="space-y-8">
      <section className="card p-6">
        <div className="flex items-center gap-4">
          <span
            className="h-12 w-12 rounded-xl"
            style={{ background: provider.color }}
          />
          <div>
            <h1 className="text-2xl font-semibold">{provider.name}</h1>
            <p className="text-slate-500">{provider.tagline}</p>
          </div>
        </div>
        <p className="mt-4 text-slate-700 max-w-prose">{provider.description}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            href={`/book?provider=${provider.id}`}
            className="btn-primary"
          >
            Book in-person consultation
          </Link>
          <Link
            href={`/avatar?provider=${provider.id}`}
            className="btn-ghost"
          >
            Try AI-avatar consultation
          </Link>
          <a
            href={provider.website}
            target="_blank"
            rel="noreferrer"
            className="btn-ghost"
          >
            Visit {provider.name} website ↗
          </a>
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-6">
        <div className="card p-5">
          <h2 className="font-semibold">Programs &amp; services</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-700 list-disc list-inside">
            {provider.services.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
        <div className="card p-5">
          <h2 className="font-semibold">Doctors</h2>
          <ul className="mt-3 space-y-3">
            {doctors.map((d) => (
              <li
                key={d.id}
                className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2 last:border-0"
              >
                <div>
                  <div className="font-medium">{d.name}</div>
                  <div className="text-sm text-slate-500">{d.specialty}</div>
                </div>
                <div className="text-sm">
                  <span className="badge bg-slate-100 text-slate-700">
                    ₹{d.feeInr}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="card p-5">
        <h2 className="font-semibold mb-3">
          Ask the {provider.name} assistant
        </h2>
        <ChatWidget embedded providerId={provider.id} />
      </section>
    </div>
  );
}
