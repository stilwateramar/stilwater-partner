import Link from "next/link";

export default function StilwaterLogo({
  href = "/",
  size = "md",
  tagline = false,
}: {
  href?: string | null;
  size?: "sm" | "md" | "lg";
  tagline?: boolean;
}) {
  const mark = (
    <span className="relative inline-flex items-center justify-center">
      <span
        className={`rounded-full bg-gradient-to-br from-still-300 via-still-400 to-still-600 shadow-[0_0_0_2px_rgba(255,255,255,0.25)_inset] ${
          size === "lg"
            ? "h-12 w-12"
            : size === "sm"
            ? "h-6 w-6"
            : "h-9 w-9"
        }`}
      />
      <span
        className={`absolute rounded-full bg-white/70 ${
          size === "lg"
            ? "h-2.5 w-2.5"
            : size === "sm"
            ? "h-1 w-1"
            : "h-1.5 w-1.5"
        }`}
      />
    </span>
  );

  const word = (
    <span
      className={`font-serif tracking-[0.35em] uppercase ${
        size === "lg"
          ? "text-2xl"
          : size === "sm"
          ? "text-sm"
          : "text-lg"
      }`}
    >
      Stillwater
    </span>
  );

  const inner = (
    <span className="inline-flex flex-col gap-1">
      <span className="flex items-center gap-3">
        {mark}
        {word}
      </span>
      {tagline && (
        <span className="text-[11px] uppercase tracking-[0.25em] text-still-200/80">
          The global community for holistic healing
        </span>
      )}
    </span>
  );

  if (!href) return inner;
  return (
    <Link href={href} className="flex items-center gap-3">
      {inner}
    </Link>
  );
}
