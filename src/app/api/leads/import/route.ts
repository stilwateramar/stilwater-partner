import { NextResponse } from "next/server";
import { getPartnerUser } from "@/lib/auth";
import { newId, updateDB } from "@/lib/db";
import type { Lead } from "@/lib/types";

// Accepts an array of rows. Each row should have at least name and phone.
// Optional fields: email, interest, source, preferredMode, notes.
// The client parses CSV/Excel into JSON rows before posting.
export async function POST(req: Request) {
  const user = getPartnerUser();
  if (!user) return NextResponse.json({ error: "unauth" }, { status: 401 });
  if (!user.providerId && user.role !== "stilwater_admin") {
    return NextResponse.json({ error: "no_provider" }, { status: 400 });
  }

  const body = (await req.json()) as {
    rows: Array<Partial<Lead>>;
    providerId?: string;
  };
  if (!Array.isArray(body.rows)) {
    return NextResponse.json({ error: "rows_required" }, { status: 400 });
  }

  const providerId =
    user.providerId ?? body.providerId ?? null;
  if (!providerId) {
    return NextResponse.json({ error: "provider_required" }, { status: 400 });
  }

  const created: Lead[] = [];
  const skipped: { row: Partial<Lead>; reason: string }[] = [];

  updateDB((db) => {
    for (const row of body.rows) {
      const name = String(row.name ?? "").trim();
      const phone = String(row.phone ?? "").trim();
      if (!name || !phone) {
        skipped.push({ row, reason: "missing_name_or_phone" });
        continue;
      }
      const exists = db.leads.find(
        (l) =>
          l.providerId === providerId &&
          l.phone.replace(/\D+/g, "") === phone.replace(/\D+/g, "")
      );
      if (exists) {
        skipped.push({ row, reason: "duplicate_phone" });
        continue;
      }
      const lead: Lead = {
        id: newId("lead"),
        name,
        phone,
        email: row.email ? String(row.email) : undefined,
        providerId,
        source: String(row.source ?? "import"),
        preferredMode: (row.preferredMode as any) ?? "whatsapp",
        interest: String(row.interest ?? "Imported lead"),
        status: "new",
        createdAt: new Date().toISOString(),
        notes: row.notes ? String(row.notes) : undefined,
      };
      db.leads.unshift(lead);
      created.push(lead);
    }
  });

  return NextResponse.json({
    created: created.length,
    skipped: skipped.length,
    skippedDetails: skipped,
  });
}
