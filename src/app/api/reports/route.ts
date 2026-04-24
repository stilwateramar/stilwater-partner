import { NextResponse } from "next/server";
import { getPatient } from "@/lib/auth";
import { newId, updateDB, readDB } from "@/lib/db";
import fs from "node:fs";
import path from "node:path";
import type { DiagnosticReport } from "@/lib/types";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export async function GET() {
  const patient = getPatient();
  if (!patient) return NextResponse.json({ error: "unauth" }, { status: 401 });
  const db = readDB();
  const reports = db.reports.filter((r) => r.patientId === patient.id);
  return NextResponse.json({ reports });
}

export async function POST(req: Request) {
  const patient = getPatient();
  if (!patient) return NextResponse.json({ error: "unauth" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const title = (formData.get("title") as string) || "Diagnostic report";
  if (!file) return NextResponse.json({ error: "file required" }, { status: 400 });

  if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

  const id = newId("rpt");
  const safe = file.name.replace(/[^a-z0-9._-]+/gi, "_");
  const filename = `${id}_${safe}`;
  const buf = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(path.join(UPLOAD_DIR, filename), buf);

  const report: DiagnosticReport = {
    id,
    patientId: patient.id,
    title,
    fileName: file.name,
    fileUrl: `/uploads/${filename}`,
    mimeType: file.type || "application/octet-stream",
    sizeBytes: buf.byteLength,
    uploadedAt: new Date().toISOString(),
  };
  updateDB((db) => {
    db.reports.unshift(report);
  });
  return NextResponse.json({ report });
}
