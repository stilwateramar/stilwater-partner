import { NextResponse } from "next/server";
import { readDB } from "@/lib/db";

export async function GET() {
  const db = readDB();
  return NextResponse.json({
    providers: db.providers,
    doctors: db.doctors,
  });
}
