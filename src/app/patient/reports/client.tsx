"use client";

import { useEffect, useRef, useState } from "react";

export default function ReportsClient() {
  const [reports, setReports] = useState<any[]>([]);
  const [title, setTitle] = useState("Blood test");
  const [busy, setBusy] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  async function load() {
    const r = await fetch("/api/reports").then((r) => r.json());
    setReports(r.reports ?? []);
  }
  useEffect(() => {
    load();
  }, []);

  async function upload() {
    const f = fileInput.current?.files?.[0];
    if (!f) return;
    const fd = new FormData();
    fd.append("file", f);
    fd.append("title", title);
    setBusy(true);
    await fetch("/api/reports", { method: "POST", body: fd });
    setBusy(false);
    if (fileInput.current) fileInput.current.value = "";
    load();
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="label">Diagnostic reports</p>
        <h1 className="text-2xl font-semibold">Upload reports</h1>
        <p className="text-sm text-slate-500">
          Share blood tests, imaging, and past prescriptions. Your doctor sees
          these before the consultation.
        </p>
      </div>

      <div className="card p-5">
        <div className="grid sm:grid-cols-[1fr_1fr_auto] gap-2">
          <input
            className="input"
            placeholder="Title (e.g. HbA1c, CBC, eye exam)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input ref={fileInput} type="file" className="input" />
          <button className="btn-primary" onClick={upload} disabled={busy}>
            {busy ? "Uploading…" : "Upload"}
          </button>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr>
              {["When", "Title", "File", "Size", ""].map((h) => (
                <th key={h} className="px-3 py-2 text-left">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => (
              <tr key={r.id} className="border-t border-slate-100">
                <td className="px-3 py-2 text-xs">
                  {new Date(r.uploadedAt).toLocaleString()}
                </td>
                <td className="px-3 py-2 font-medium">{r.title}</td>
                <td className="px-3 py-2">{r.fileName}</td>
                <td className="px-3 py-2 text-xs">
                  {(r.sizeBytes / 1024).toFixed(1)} KB
                </td>
                <td className="px-3 py-2">
                  <a
                    href={r.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs underline"
                  >
                    Open ↗
                  </a>
                </td>
              </tr>
            ))}
            {reports.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-slate-400">
                  No reports uploaded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
