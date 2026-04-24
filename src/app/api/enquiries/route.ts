import { NextResponse } from "next/server";
import { newId, readDB, updateDB } from "@/lib/db";
import { getPartnerUser } from "@/lib/auth";
import type { Enquiry } from "@/lib/types";

export async function POST(req: Request) {
  const body = (await req.json()) as Partial<Enquiry>;
  if (!body.name || !body.phone) {
    return NextResponse.json(
      { error: "name and phone are required" },
      { status: 400 }
    );
  }
  const enquiry: Enquiry = {
    id: newId("enq"),
    name: body.name,
    email: body.email ?? "",
    phone: body.phone,
    interest: body.interest,
    message: body.message ?? "",
    createdAt: new Date().toISOString(),
  };
  updateDB((db) => {
    db.enquiries.unshift(enquiry);
  });
  return NextResponse.json({ enquiry });
}

export async function GET() {
  const user = getPartnerUser();
  if (!user) return NextResponse.json({ error: "unauth" }, { status: 401 });
  const db = readDB();
  return NextResponse.json({ enquiries: db.enquiries });
}
