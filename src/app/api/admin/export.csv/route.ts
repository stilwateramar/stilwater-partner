import { readDB } from "@/lib/db";

export async function GET() {
  const db = readDB();
  const cols = [
    "createdAt",
    "name",
    "phone",
    "email",
    "providerId",
    "source",
    "campaign",
    "preferredMode",
    "interest",
    "status",
  ];
  const esc = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return s.includes(",") || s.includes("\"") || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };
  const body = [
    cols.join(","),
    ...db.leads.map((l) =>
      cols.map((c) => esc((l as any)[c])).join(",")
    ),
  ].join("\n");

  return new Response(body, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": "attachment; filename=stilwater-leads.csv",
    },
  });
}
