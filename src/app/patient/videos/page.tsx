import { redirect } from "next/navigation";
import { getPatient } from "@/lib/auth";
import { readDB } from "@/lib/db";

export default function PatientVideos() {
  const patient = getPatient();
  if (!patient) redirect("/patient/login");
  const db = readDB();
  const videos = db.videos.filter((v) => v.providerId === patient.providerId);

  return (
    <div>
      <p className="label">Library</p>
      <h1 className="text-2xl font-semibold">Videos</h1>
      <p className="text-sm text-slate-500">
        Recorded teachings from your provider. More added every week.
      </p>
      <div className="mt-5 grid sm:grid-cols-2 gap-4">
        {videos.map((v) => (
          <div key={v.id} className="card overflow-hidden">
            <div
              className="aspect-video grid place-items-center text-white text-4xl"
              style={{
                background: `linear-gradient(135deg, hsl(${v.thumbnailHue},60%,45%) 0%, hsl(${v.thumbnailHue},50%,20%) 100%)`,
              }}
            >
              ▶
            </div>
            <div className="p-4">
              <div className="font-semibold">{v.title}</div>
              <div className="text-xs text-slate-500">
                {v.speaker} · {v.duration}
              </div>
              <p className="mt-2 text-sm text-slate-600">{v.description}</p>
            </div>
          </div>
        ))}
        {videos.length === 0 && (
          <div className="text-sm text-slate-400">No videos yet.</div>
        )}
      </div>
    </div>
  );
}
