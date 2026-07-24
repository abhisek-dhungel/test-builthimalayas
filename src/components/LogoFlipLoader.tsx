import { BuiltLogo } from "@/components/BuiltLogo";

type LogoFlipLoaderProps = {
  label?: string;
};

/** Full-screen BUILT logo flip while a route or page is loading. */
export function LogoFlipLoader({
  label = "Loading",
}: LogoFlipLoaderProps) {
  return (
    <div
      className="logo-flip-loader"
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="logo-flip-loader-stage">
        <div className="logo-flip-loader-spin">
          <BuiltLogo size="lg" showTagline />
        </div>
      </div>
    </div>
  );
}
