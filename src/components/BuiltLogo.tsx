import Link from "next/link";
import { useId } from "react";

type BuiltLogoProps = {
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  className?: string;
};

const sizes = {
  sm: { triangle: 28, text: "text-lg", tagline: "text-[8px]" },
  md: { triangle: 36, text: "text-xl", tagline: "text-[9px]" },
  lg: { triangle: 52, text: "text-3xl", tagline: "text-[10px]" },
};

export function BuiltLogo({
  size = "md",
  showTagline = true,
  className = "",
}: BuiltLogoProps) {
  const s = sizes[size];
  const uid = useId().replace(/:/g, "");
  const gradientId = `triangleMetal-${uid}`;
  const shadowId = `triangleShadow-${uid}`;

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <svg
        width={s.triangle}
        height={s.triangle * 0.9}
        viewBox="0 0 100 90"
        fill="none"
        aria-hidden
        className="built-logo-triangle"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D4AF37" />
            <stop offset="45%" stopColor="#B08D57" />
            <stop offset="100%" stopColor="#7A5C32" />
          </linearGradient>
          <filter id={shadowId} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow
              dx="0"
              dy="3"
              stdDeviation="2"
              floodColor="#5D4037"
              floodOpacity="0.45"
            />
          </filter>
        </defs>
        <path
          d="M50 8 L92 82 L8 82 Z"
          stroke={`url(#${gradientId})`}
          strokeWidth="10"
          strokeLinejoin="round"
          fill="none"
          filter={`url(#${shadowId})`}
        />
      </svg>

      <span
        className={`built-logo-text ${s.text} font-black uppercase tracking-[0.12em]`}
      >
        BUILT
      </span>

      {showTagline && (
        <p
          className={`${s.tagline} mt-1 font-medium uppercase tracking-[0.28em] text-[var(--accent)]`}
        >
          Himalayas
        </p>
      )}
    </div>
  );
}

export function SiteLogoLink({
  size = "md",
}: {
  size?: "sm" | "md";
}) {
  return (
    <Link href="/" className="inline-flex shrink-0 items-center">
      <BuiltLogo size={size} showTagline className="shrink-0" />
    </Link>
  );
}
