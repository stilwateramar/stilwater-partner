import { NextResponse } from "next/server";
import { readDB, updateDB, newId } from "@/lib/db";
import { getPartnerUser } from "@/lib/auth";
import type { Enquiry } from "@/lib/types";

export async function GET() {
  const user = getPartnerUser();
  if (!user || user.role !== "stilwater_admin") {
    return NextResponse.json({ enquiries: [] });
  }
  const db = readDB();
  return NextResponse.json({ enquiries: db.enquiries });
}

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
    phone: body.phone,
    email: body.email,
    interest: body.interest ?? "General",
    message: body.message ?? "",
    createdAt: new Date().toISOString(),
  };

  updateDB((db) => {
    db.enquiries.unshift(enquiry);
  });

  return NextResponse.json({ enquiry });
}
