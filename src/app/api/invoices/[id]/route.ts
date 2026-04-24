import { NextResponse } from "next/server";
import { readDB } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const db = readDB();
  const invoice = db.invoices.find((i) => i.id === params.id);
  if (!invoice) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const provider = db.providers.find((p) => p.id === invoice.providerId);
  return NextResponse.json({ invoice, provider });
}
