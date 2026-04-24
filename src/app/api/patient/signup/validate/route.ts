import { NextResponse } from "next/server";
import { readDB } from "@/lib/db";

export async function POST(req: Request) {
  const { code } = await req.json();
  if (!code) {
    return NextResponse.json({ error: "code_required" }, { status: 400 });
  }
  const normalised = String(code).trim().toUpperCase();
  const db = readDB();
  const match = db.signupCodes.find(
    (c) => c.code.toUpperCase() === normalised
  );
  if (!match) {
    return NextResponse.json({ error: "invalid_code" }, { status: 404 });
  }
  if (match.usedByPatientId) {
    return NextResponse.json({ error: "already_used" }, { status: 409 });
  }
  const provider = db.providers.find((p) => p.id === match.providerId);
  const program = match.programId
    ? db.programs.find((p) => p.id === match.programId)
    : null;
  return NextResponse.json({
    code: match,
    provider: provider
      ? {
          id: provider.id,
          name: provider.name,
          tagline: provider.tagline,
        }
      : null,
    program: program
      ? {
          id: program.id,
          name: program.name,
          durationWeeks: program.durationWeeks,
          priceInr: program.priceInr,
        }
      : null,
  });
}
