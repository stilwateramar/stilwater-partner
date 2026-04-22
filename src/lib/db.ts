import fs from "node:fs";
import path from "node:path";
import type { DB } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

const seed: DB = {
  providers: [
    {
      id: "sharan",
      name: "SHARAN",
      tagline: "Sanctuary for Health and Reconnection to Animals and Nature",
      website: "https://sharan-india.org",
      description:
        "Plant-based lifestyle programs and reversal of chronic conditions through nutrition and yoga.",
      services: [
        "Diabetes reversal program",
        "Weight management",
        "Plant-based nutrition counselling",
        "Stress & sleep coaching",
      ],
      color: "#2f9e6b",
    },
    {
      id: "amar-eye-yoga",
      name: "Amar Eye Yoga",
      tagline: "Natural vision improvement through yoga",
      website: "https://amareyeyoga.com",
      description:
        "Eye-yoga, breathing and lifestyle protocols to reduce dependency on glasses and support eye health.",
      services: [
        "Myopia management",
        "Digital eye-strain relief",
        "Dry eye & screen fatigue program",
        "Pediatric eye yoga",
      ],
      color: "#4b6bdf",
    },
  ],
  doctors: [
    {
      id: "dr-nandita",
      providerId: "sharan",
      name: "Dr. Nandita Shah",
      specialty: "Plant-based medicine",
      feeInr: 1500,
    },
    {
      id: "dr-rishi",
      providerId: "sharan",
      name: "Dr. Rishi Menon",
      specialty: "Lifestyle coach",
      feeInr: 1000,
    },
    {
      id: "dr-amar",
      providerId: "amar-eye-yoga",
      name: "Dr. Amar Sandhu",
      specialty: "Ophthalmology + eye yoga",
      feeInr: 1200,
    },
    {
      id: "dr-kavya",
      providerId: "amar-eye-yoga",
      name: "Dr. Kavya Iyer",
      specialty: "Pediatric eye yoga",
      feeInr: 900,
    },
  ],
  leads: [],
  messages: [],
  consultations: [],
  transcripts: [],
};

function ensureFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(seed, null, 2));
  }
}

export function readDB(): DB {
  ensureFile();
  const raw = fs.readFileSync(DB_FILE, "utf8");
  const parsed = JSON.parse(raw) as Partial<DB>;
  return {
    providers: parsed.providers?.length ? parsed.providers : seed.providers,
    doctors: parsed.doctors?.length ? parsed.doctors : seed.doctors,
    leads: parsed.leads ?? [],
    messages: parsed.messages ?? [],
    consultations: parsed.consultations ?? [],
    transcripts: parsed.transcripts ?? [],
  };
}

export function writeDB(db: DB) {
  ensureFile();
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

export function updateDB<T>(fn: (db: DB) => T): T {
  const db = readDB();
  const result = fn(db);
  writeDB(db);
  return result;
}

export function newId(prefix = "id"): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random()
    .toString(36)
    .slice(2, 7)}`;
}
