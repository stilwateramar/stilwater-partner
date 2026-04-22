import { NextResponse } from "next/server";
import { readDB, updateDB } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const db = readDB();
  const lead = db.leads.find((l) => l.id === params.id);
  if (!lead) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const provider = db.providers.find((p) => p.id === lead.providerId);
  return NextResponse.json({ lead, provider });
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const patch = await req.json();
  const lead = updateDB((db) => {
    const l = db.leads.find((x) => x.id === params.id);
    if (!l) return null;
    Object.assign(l, patch);
    return l;
  });
  if (!lead) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ lead });
}
