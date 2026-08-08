import Image from "next/image";
import Link from "next/link";

type BuiltLogoProps = {
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  className?: string;
};

const sizes = {
  sm: 47,
  md: 57,
  lg: 84,
};

export function BuiltLogo({
  size = "md",
  className = "",
}: BuiltLogoProps) {
  const height = sizes[size];

  return (
    <div className={`flex items-center ${className}`}>
      <Image
        src="/built-logo-cropped.png"
        alt="BUILT"
        width={640}
        height={560}
        className="h-auto w-auto"
        style={{ height }}
        sizes={`${Math.ceil(height * 1.15)}px`}
        priority={size === "sm"}
        unoptimized
      />
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
