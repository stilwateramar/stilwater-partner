import { NextResponse } from "next/server";
import { readDB, updateDB, newId } from "@/lib/db";
import { getPartnerUser } from "@/lib/auth";
import type { AvatarFeedback } from "@/lib/types";

export async function GET() {
  const user = getPartnerUser();
  if (!user || user.role !== "stilwater_admin") {
    return NextResponse.json({ feedback: [] });
  }
  const db = readDB();
  return NextResponse.json({ feedback: db.avatarFeedback });
}

export async function POST(req: Request) {
  const body = (await req.json()) as Partial<AvatarFeedback>;
  if (!body.avatarId || !body.name) {
    return NextResponse.json(
      { error: "avatarId and name are required" },
      { status: 400 }
    );
  }

  const feedback: AvatarFeedback = {
    id: newId("fbk"),
    avatarId: body.avatarId,
    name: body.name,
    email: body.email,
    rating: typeof body.rating === "number" ? body.rating : 5,
    comments: body.comments ?? "",
    createdAt: new Date().toISOString(),
  };

  updateDB((db) => {
    db.avatarFeedback.unshift(feedback);
  });

  return NextResponse.json({ feedback });
}
