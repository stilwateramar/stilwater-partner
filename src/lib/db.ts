import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import type { DB } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

function hash(pw: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const h = crypto.scryptSync(pw, salt, 32).toString("hex");
  return `${salt}:${h}`;
}

function buildSeed(): DB {
  const DEMO_PW = "password123";
  const now = new Date().toISOString();
  return {
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
        logoText: "SHARAN",
        logoAccent: "#0b6b43",
        whatsappNumber: "+91 98000 12345",
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
        logoText: "AMAR EYE YOGA",
        logoAccent: "#2e46a8",
        whatsappNumber: "+91 98000 67890",
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
    users: [
      {
        id: "u_still",
        providerId: null,
        email: "admin@stilwater.demo",
        name: "Stilwater Admin",
        passwordHash: hash(DEMO_PW),
        role: "stilwater_admin",
        createdAt: now,
      },
      {
        id: "u_sharan_owner",
        providerId: "sharan",
        email: "owner@sharan.demo",
        name: "Priya Desai",
        passwordHash: hash(DEMO_PW),
        role: "owner",
        createdAt: now,
      },
      {
        id: "u_sharan_admin",
        providerId: "sharan",
        email: "admin@sharan.demo",
        name: "Rohit Sen",
        passwordHash: hash(DEMO_PW),
        role: "admin",
        createdAt: now,
      },
      {
        id: "u_sharan_crm_admin",
        providerId: "sharan",
        email: "sharan_admin@stilwater.demo",
        name: "SHARAN_ADMIN",
        passwordHash: hash(DEMO_PW),
        role: "admin",
        createdAt: now,
      },
      {
        id: "u_sharan_agent",
        providerId: "sharan",
        email: "agent@sharan.demo",
        name: "Anita Rao",
        passwordHash: hash(DEMO_PW),
        role: "agent",
        createdAt: now,
        language: "en",
      },
      {
        id: "u_sharan_doctor",
        providerId: "sharan",
        email: "doctor@sharan.demo",
        name: "Dr. Nandita Shah",
        passwordHash: hash(DEMO_PW),
        role: "doctor",
        createdAt: now,
        doctorId: "dr-nandita",
      },
      {
        id: "u_amar_owner",
        providerId: "amar-eye-yoga",
        email: "owner@amareye.demo",
        name: "Suresh Amar",
        passwordHash: hash(DEMO_PW),
        role: "owner",
        createdAt: now,
      },
      {
        id: "u_amar_crm_admin",
        providerId: "amar-eye-yoga",
        email: "amar_admin@stilwater.demo",
        name: "AMAR_ADMIN",
        passwordHash: hash(DEMO_PW),
        role: "admin",
        createdAt: now,
      },
      {
        id: "u_amar_agent",
        providerId: "amar-eye-yoga",
        email: "agent@amareye.demo",
        name: "Varun Patel",
        passwordHash: hash(DEMO_PW),
        role: "agent",
        createdAt: now,
        language: "en",
      },
    ],
    patients: [],
    otps: [],
    leads: [],
    messages: [],
    consultations: [],
    transcripts: [],
    callLogs: [],
    programs: [
      {
        id: "prog_sh_diab_21",
        providerId: "sharan",
        name: "21-day diabetes reversal program",
        description:
          "Dr. Nandita Shah's signature 21-day plant-based protocol with daily coaching, meal plans and progress tracking.",
        durationWeeks: 3,
        priceInr: 9999,
      },
      {
        id: "prog_sh_weight",
        providerId: "sharan",
        name: "12-week weight reset",
        description:
          "Whole-food plant-based weight management with weekly group sessions and a nutritionist.",
        durationWeeks: 12,
        priceInr: 14999,
      },
      {
        id: "prog_sh_sleep",
        providerId: "sharan",
        name: "Sleep & stress 4-week program",
        description:
          "Lifestyle and breathwork protocol to improve sleep quality without medication.",
        durationWeeks: 4,
        priceInr: 4999,
      },
      {
        id: "prog_eye_screen",
        providerId: "amar-eye-yoga",
        name: "Screen fatigue 6-week program",
        description:
          "Daily 15-min eye-yoga plus ophthalmology reviews. Measurable relief for knowledge workers.",
        durationWeeks: 6,
        priceInr: 6999,
      },
      {
        id: "prog_eye_myopia",
        providerId: "amar-eye-yoga",
        name: "Pediatric myopia management",
        description:
          "Evidence-based eye-yoga for children aged 7-14, with parent coaching.",
        durationWeeks: 8,
        priceInr: 8999,
      },
    ],
    paymentLinks: [],
    invoices: [],
    reports: [],
    prescriptions: [],
    videos: [
      {
        id: "vid_nandita_intro",
        providerId: "sharan",
        title: "Introduction to plant-based healing",
        speaker: "Dr. Nandita Shah",
        duration: "12:04",
        thumbnailHue: 140,
        description:
          "Dr. Nandita explains the science behind reversing chronic conditions with food.",
      },
      {
        id: "vid_nandita_diabetes",
        providerId: "sharan",
        title: "How diabetes reverses in 21 days",
        speaker: "Dr. Nandita Shah",
        duration: "18:42",
        thumbnailHue: 35,
        description:
          "The physiology of insulin sensitivity, and why the 21-day protocol works.",
      },
      {
        id: "vid_nandita_meals",
        providerId: "sharan",
        title: "Building your plate: a day of SHARAN meals",
        speaker: "Dr. Nandita Shah",
        duration: "9:11",
        thumbnailHue: 15,
        description: "Practical walkthrough of breakfast, lunch and dinner.",
      },
      {
        id: "vid_nandita_faq",
        providerId: "sharan",
        title: "Top 10 questions answered",
        speaker: "Dr. Nandita Shah",
        duration: "22:30",
        thumbnailHue: 280,
        description:
          "Protein, calcium, vitamin B12, sustainability — Dr. Nandita's FAQ session.",
      },
      {
        id: "vid_amar_intro",
        providerId: "amar-eye-yoga",
        title: "Eye-yoga fundamentals",
        speaker: "Dr. Amar Sandhu",
        duration: "7:55",
        thumbnailHue: 220,
        description:
          "The three foundational eye-yoga exercises anyone can start today.",
      },
    ],
    enquiries: [],
    signupCodes: [],
    patientRequests: [],
    avatars: [
      {
        id: "av_nandita",
        providerId: "sharan",
        name: "Dr. Nandita Shah",
        specialty: "Plant-based medicine · Diabetes reversal",
        blurb:
          "Ask about reversing diabetes, thyroid and heart disease through plant-based nutrition and daily habits.",
        hue: 140,
        emoji: "🌿",
      },
      {
        id: "av_amar",
        providerId: "amar-eye-yoga",
        name: "Dr. Amar Sandhu",
        specialty: "Eye yoga · Natural vision care",
        blurb:
          "Talk to the eye-yoga healer about myopia, digital eye-strain and reducing dependency on glasses.",
        hue: 220,
        emoji: "👁️",
      },
      {
        id: "av_meditation",
        providerId: "sharan",
        name: "Guru Ananta",
        specialty: "Meditation · Pranayama · Stress relief",
        blurb:
          "A meditation coach to guide you through breathwork, mindfulness and stress-release practices.",
        hue: 35,
        emoji: "🧘",
      },
      {
        id: "av_ayurveda",
        providerId: "sharan",
        name: "Vaidya Lakshmi",
        specialty: "Ayurveda · Holistic lifestyle",
        blurb:
          "An Ayurvedic healer to advise on dosha-based daily routines, seasonal eating and herbs.",
        hue: 15,
        emoji: "🪔",
      },
    ],
    feedback: [],
  };
}

function ensureFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(buildSeed(), null, 2));
  }
}

export function readDB(): DB {
  ensureFile();
  const raw = fs.readFileSync(DB_FILE, "utf8");
  const parsed = JSON.parse(raw) as Partial<DB>;
  const seed = buildSeed();
  return {
    providers: parsed.providers?.length ? parsed.providers : seed.providers,
    doctors: parsed.doctors?.length ? parsed.doctors : seed.doctors,
    users: parsed.users?.length ? parsed.users : seed.users,
    programs: parsed.programs?.length ? parsed.programs : seed.programs,
    videos: parsed.videos?.length ? parsed.videos : seed.videos,
    patients: parsed.patients ?? [],
    otps: parsed.otps ?? [],
    leads: parsed.leads ?? [],
    messages: parsed.messages ?? [],
    consultations: parsed.consultations ?? [],
    transcripts: parsed.transcripts ?? [],
    callLogs: parsed.callLogs ?? [],
    paymentLinks: parsed.paymentLinks ?? [],
    invoices: parsed.invoices ?? [],
    reports: parsed.reports ?? [],
    prescriptions: parsed.prescriptions ?? [],
    enquiries: parsed.enquiries ?? [],
    avatars: parsed.avatars?.length ? parsed.avatars : seed.avatars,
    feedback: parsed.feedback ?? [],
    signupCodes: parsed.signupCodes ?? [],
    patientRequests: parsed.patientRequests ?? [],
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
