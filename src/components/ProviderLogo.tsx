import type { Provider } from "@/lib/types";

export default function ProviderLogo({
  provider,
  size = 40,
  showName = true,
}: {
  provider: Provider;
  size?: number;
  showName?: boolean;
}) {
  const initials =
    provider.logoInitials ??
    provider.name
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();
  const bg = provider.logoBg ?? provider.color;
  const fg = provider.logoFg ?? "#ffffff";

  return (
    <span className="inline-flex items-center gap-2">
      <span
        className="grid place-items-center rounded-lg font-serif font-semibold tracking-wider"
        style={{
          background: bg,
          color: fg,
          height: size,
          width: size,
          fontSize: Math.round(size * 0.42),
          boxShadow: `inset 0 0 0 2px ${fg}22`,
        }}
        aria-label={`${provider.name} logo`}
      >
        {initials}
      </span>
      {showName && (
        <span className="font-serif text-base leading-tight">
          {provider.name}
        </span>
      )}
    </span>
  );
}
