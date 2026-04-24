import { NextResponse } from "next/server";
import { getPartnerUser } from "@/lib/auth";
import { readDB } from "@/lib/db";

export async function GET() {
  const user = getPartnerUser();
  if (!user || user.role !== "stilwater_admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  return NextResponse.json(readDB());
}
