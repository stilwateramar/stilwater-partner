const HOURS = [9, 10, 11, 12, 14, 15, 16, 17, 18];

export function nextDays(n: number): string[] {
  const out: string[] = [];
  const today = new Date();
  for (let i = 1; i <= n; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

export function slotsForDate(dateIso: string, taken: string[] = []): {
  slot: string;
  taken: boolean;
}[] {
  return HOURS.map((h) => {
    const d = new Date(`${dateIso}T00:00:00`);
    d.setHours(h, 0, 0, 0);
    const iso = d.toISOString();
    return { slot: iso, taken: taken.includes(iso) };
  });
}

export function humanSlot(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
