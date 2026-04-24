import { NextResponse } from "next/server";
import { readDB } from "@/lib/db";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const providerId = url.searchParams.get("providerId");
  const db = readDB();
  const list = providerId
    ? db.programs.filter((p) => p.providerId === providerId)
    : db.programs;
  return NextResponse.json({ programs: list });
}
