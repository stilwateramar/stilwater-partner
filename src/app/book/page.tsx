"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Calendar from "@/components/Calendar";
import { humanSlot } from "@/lib/slots";

function BookInner() {
  const router = useRouter();
  const params = useSearchParams();
  const providerId = params.get("provider") ?? "sharan";
  const leadIdParam = params.get("leadId") ?? "";

  const [providers, setProviders] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [taken, setTaken] = useState<string[]>([]);
  const [slot, setSlot] = useState<string | undefined>();
  const [doctorId, setDoctorId] = useState<string>("");
  const [leadId, setLeadId] = useState<string>(leadIdParam);
  const [lead, setLead] = useState<any>(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetch("/api/providers")
      .then((r) => r.json())
      .then((d) => {
        setProviders(d.providers);
        const docs = d.doctors.filter((x: any) => x.providerId === providerId);
        setDoctors(docs);
        if (docs[0]) setDoctorId(docs[0].id);
      });
    fetch(`/api/consultations?providerId=${providerId}`)
      .then((r) => r.json())
      .then((d) =>
        setTaken(d.consultations.map((c: any) => c.slot).filter(Boolean))
      );
  }, [providerId]);

  useEffect(() => {
    if (leadId) {
      fetch(`/api/leads/${leadId}`)
        .then((r) => r.json())
        .then((d) => setLead(d.lead));
    }
  }, [leadId]);

  const provider = providers.find((p) => p.id === providerId);
  const doctor = doctors.find((d) => d.id === doctorId);

  async function book() {
    setCreating(true);
    let finalLeadId = leadId;
    if (!finalLeadId) {
      const r = await fetch("/api/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          email: form.email,
          providerId,
          source: "website_booking",
          interest: "Direct in-person booking",
          preferredMode: "whatsapp",
        }),
      }).then((r) => r.json());
      finalLeadId = r.lead.id;
    }

    const res = await fetch("/api/consultations", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        leadId: finalLeadId,
        providerId,
        doctorId,
        type: "in_person",
        slot,
      }),
    }).then((r) => r.json());

    router.push(`/pay/${res.consultation.id}`);
  }

  return (
    <div className="grid md:grid-cols-[1fr_380px] gap-8">
      <div>
        <p className="label">Book a consultation</p>
        <h1 className="text-2xl font-semibold">{provider?.name}</h1>
        <p className="text-slate-500 mt-1">
          Live availability from the provider calendar — same on the Stilwater
          site and on {provider?.name}'s own website.
        </p>

        <div className="card p-5 mt-5">
          <div className="label">1 · Pick a doctor</div>
          <div className="mt-2 grid sm:grid-cols-2 gap-2">
            {doctors.map((d: any) => (
              <button
                key={d.id}
                onClick={() => setDoctorId(d.id)}
                className={`text-left rounded-lg border p-3 ${
                  doctorId === d.id
                    ? "border-still-500 bg-still-50"
                    : "border-slate-200"
                }`}
              >
                <div className="font-medium">{d.name}</div>
                <div className="text-xs text-slate-500">{d.specialty}</div>
                <div className="mt-1 text-xs">Fee ₹{d.feeInr}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="card p-5 mt-4">
          <div className="label">2 · Pick a slot</div>
          <div className="mt-2">
            <Calendar taken={taken} selected={slot} onPick={setSlot} />
          </div>
        </div>
      </div>

      <aside className="card p-5 h-max">
        <div className="label">Booking summary</div>
        <div className="mt-1 text-sm text-slate-700">
          {provider?.name} · {doctor?.name ?? "—"}
        </div>
        <div className="text-xs text-slate-500">
          {slot ? humanSlot(slot) : "Select a slot"}
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-sm">
          <span>Consultation fee</span>
          <span className="font-semibold">₹{doctor?.feeInr ?? 0}</span>
        </div>

        {!leadId && (
          <div className="mt-4 space-y-2">
            <div className="label">Your details</div>
            <input
              className="input"
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              className="input"
              placeholder="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <input
              className="input"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
        )}
        {leadId && lead && (
          <div className="mt-4 text-xs text-slate-500">
            Booking for <span className="font-medium">{lead.name}</span> (
            {lead.phone})
          </div>
        )}

        <button
          className="btn-primary w-full mt-4"
          disabled={
            !slot ||
            !doctorId ||
            creating ||
            (!leadId && (!form.name || !form.phone))
          }
          onClick={book}
        >
          {creating ? "Creating…" : "Proceed to Razorpay →"}
        </button>
      </aside>
    </div>
  );
}

export default function BookPage() {
  return (
    <Suspense fallback={<div>Loading…</div>}>
      <BookInner />
    </Suspense>
  );
}
