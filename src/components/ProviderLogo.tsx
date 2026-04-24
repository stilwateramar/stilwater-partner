import type { Provider } from "@/lib/types";

export default function ProviderLogo({
  provider,
  size = "md",
}: {
  provider: Provider;
  size?: "sm" | "md" | "lg";
}) {
  const isSharan = provider.id === "sharan";
  const isAmar = provider.id === "amar-eye-yoga";

  const dim =
    size === "lg"
      ? { box: "h-14 w-14", text: "text-lg", tag: "text-[10px]" }
      : size === "sm"
      ? { box: "h-8 w-8", text: "text-[10px]", tag: "text-[8px]" }
      : { box: "h-10 w-10", text: "text-xs", tag: "text-[9px]" };

  if (isSharan) {
    return (
      <span className="inline-flex items-center gap-2">
        <span
          className={`${dim.box} relative inline-flex items-center justify-center rounded-full shadow-inner`}
          style={{
            background:
              "radial-gradient(circle at 30% 30%, #6dcf9c 0%, #2f9e6b 55%, #0b6b43 100%)",
          }}
          aria-hidden
        >
          <span className={`font-serif font-semibold text-white ${dim.text}`}>
            🌱
          </span>
        </span>
        <span className="leading-tight">
          <span className="block font-serif font-semibold tracking-[0.18em] text-[color:var(--tw-prose-headings,#0e1f24)]">
            SHARAN
          </span>
          <span className={`block ${dim.tag} uppercase tracking-[0.3em] text-emerald-700/80`}>
            Plant-based healing
          </span>
        </span>
      </span>
    );
  }

  if (isAmar) {
    return (
      <span className="inline-flex items-center gap-2">
        <span
          className={`${dim.box} relative inline-flex items-center justify-center rounded-full shadow-inner`}
          style={{
            background:
              "radial-gradient(circle at 30% 30%, #7a9cff 0%, #4b6bdf 55%, #2e46a8 100%)",
          }}
          aria-hidden
        >
          <span className={`text-white ${dim.text}`}>👁️</span>
        </span>
        <span className="leading-tight">
          <span className="block font-serif font-semibold tracking-[0.12em] text-[color:var(--tw-prose-headings,#0e1f24)]">
            Amar Eye Yoga
          </span>
          <span className={`block ${dim.tag} uppercase tracking-[0.3em] text-indigo-700/80`}>
            Natural vision care
          </span>
        </span>
      </span>
    );
  }

  // fallback
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className={`${dim.box} rounded-full`}
        style={{ background: provider.color }}
      />
      <span className="font-semibold">{provider.name}</span>
    </span>
  );
}
