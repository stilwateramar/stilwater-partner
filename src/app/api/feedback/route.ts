import { NextResponse } from "next/server";
import { newId, readDB, updateDB } from "@/lib/db";
import { getPartnerUser } from "@/lib/auth";
import type { HealerFeedback } from "@/lib/types";

export async function POST(req: Request) {
  const body = (await req.json()) as Partial<HealerFeedback>;
  if (!body.avatarId || !body.name || !body.comments) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }
  const rating = Math.max(1, Math.min(5, Number(body.rating ?? 5)));
  const fb: HealerFeedback = {
    id: newId("fb"),
    avatarId: body.avatarId,
    name: body.name,
    email: body.email,
    rating,
    comments: body.comments,
    createdAt: new Date().toISOString(),
  };
  updateDB((db) => {
    db.feedback.unshift(fb);
  });
  return NextResponse.json({ feedback: fb });
}

export async function GET() {
  const user = getPartnerUser();
  if (!user) return NextResponse.json({ error: "unauth" }, { status: 401 });
  const db = readDB();
  return NextResponse.json({ feedback: db.feedback });
}
