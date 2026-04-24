import crypto from "node:crypto";
import { cookies } from "next/headers";
import { readDB } from "./db";
import type { User, UserRole } from "./types";

const SECRET =
  process.env.STILWATER_SECRET ??
  "dev-secret-stilwater-prototype-change-in-prod";
const COOKIE = "sw_session";

export interface SessionData {
  kind: "partner" | "patient";
  userId: string;
}

export function sign(payload: SessionData): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const mac = crypto
    .createHmac("sha256", SECRET)
    .update(body)
    .digest("base64url");
  return `${body}.${mac}`;
}

export function verify(token: string | undefined): SessionData | null {
  if (!token || !token.includes(".")) return null;
  const [body, mac] = token.split(".");
  const expected = crypto
    .createHmac("sha256", SECRET)
    .update(body)
    .digest("base64url");
  if (
    mac.length !== expected.length ||
    !crypto.timingSafeEqual(Buffer.from(mac), Buffer.from(expected))
  ) {
    return null;
  }
  try {
    return JSON.parse(
      Buffer.from(body, "base64url").toString("utf8")
    ) as SessionData;
  } catch {
    return null;
  }
}

export function hashPassword(pw: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const h = crypto.scryptSync(pw, salt, 32).toString("hex");
  return `${salt}:${h}`;
}

export function verifyPassword(pw: string, stored: string): boolean {
  const [salt, h] = stored.split(":");
  if (!salt || !h) return false;
  const test = crypto.scryptSync(pw, salt, 32).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(h, "hex"), Buffer.from(test, "hex"));
}

export function setSessionCookie(session: SessionData) {
  cookies().set(COOKIE, sign(session), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export function clearSessionCookie() {
  cookies().delete(COOKIE);
}

export function getSession(): SessionData | null {
  return verify(cookies().get(COOKIE)?.value);
}

export function getPartnerUser(): User | null {
  const s = getSession();
  if (!s || s.kind !== "partner") return null;
  const db = readDB();
  return db.users.find((u) => u.id === s.userId) ?? null;
}

export function getPatient() {
  const s = getSession();
  if (!s || s.kind !== "patient") return null;
  const db = readDB();
  return db.patients.find((p) => p.id === s.userId) ?? null;
}

export function roleRank(role: UserRole): number {
  return (
    {
      stilwater_admin: 100,
      owner: 50,
      admin: 40,
      doctor: 30,
      agent: 20,
    }[role] ?? 0
  );
}

export function canManageTeam(u: User): boolean {
  return (
    u.role === "stilwater_admin" || u.role === "owner" || u.role === "admin"
  );
}

export function scopedForProvider(u: User, providerId: string): boolean {
  if (u.role === "stilwater_admin") return true;
  return u.providerId === providerId;
}
