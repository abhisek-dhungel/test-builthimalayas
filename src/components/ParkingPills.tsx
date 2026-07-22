type ParkingPillsProps = {
  twoWheeler?: number | null;
  fourWheeler?: number | null;
  className?: string;
  size?: "sm" | "md";
};

function TwoWheelerIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <circle cx="5.5" cy="17.5" r="2.5" />
      <circle cx="18.5" cy="17.5" r="2.5" />
      <path d="M12 17.5V11l-4-3H5" />
      <path d="M12 11h4l2 3.5" />
      <path d="M9 8.5h3.5" />
    </svg>
  );
}

function FourWheelerIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M3 14h18v4a1 1 0 01-1 1h-1a2 2 0 01-4 0H9a2 2 0 01-4 0H4a1 1 0 01-1-1v-4z" />
      <path d="M5 14l1.5-4.5A2 2 0 018.4 8h7.2a2 2 0 011.9 1.5L19 14" />
      <circle cx="7.5" cy="16.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="16.5" cy="16.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function NoParkingIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M10 7h3.5a2.5 2.5 0 010 5H10V7z" />
      <path d="M10 12v5" />
      <path d="M6 18L18 6" />
    </svg>
  );
}

export function ParkingPills({
  twoWheeler,
  fourWheeler,
  className = "",
  size = "sm",
}: ParkingPillsProps) {
  const two = Number(twoWheeler) || 0;
  const four = Number(fourWheeler) || 0;
  const iconClass = size === "md" ? "h-3.5 w-3.5" : "h-3 w-3";
  const pillPad = size === "md" ? "px-2.5 py-1 text-xs" : "px-2 py-0.5 text-[10px]";

  if (two <= 0 && four <= 0) {
    return (
      <div className={`parking-pills ${className}`.trim()}>
        <span className={`parking-pill parking-pill-none ${pillPad}`}>
          <NoParkingIcon className={iconClass} />
          No parking
        </span>
      </div>
    );
  }

  return (
    <div className={`parking-pills ${className}`.trim()}>
      {two > 0 ? (
        <span className={`parking-pill parking-pill-two ${pillPad}`}>
          <TwoWheelerIcon className={iconClass} />
          {two}× 2W
        </span>
      ) : null}
      {four > 0 ? (
        <span className={`parking-pill parking-pill-four ${pillPad}`}>
          <FourWheelerIcon className={iconClass} />
          {four}× 4W
        </span>
      ) : null}
    </div>
  );
}
