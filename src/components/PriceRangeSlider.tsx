"use client";

type PriceRangeSliderProps = {
  min: number;
  max: number;
  valueMin: number;
  valueMax: number;
  onChange: (min: number, max: number) => void;
  step?: number;
};

function formatRs(value: number): string {
  return `Rs. ${value.toLocaleString("en-NP")}`;
}

export function PriceRangeSlider({
  min,
  max,
  valueMin,
  valueMax,
  onChange,
  step = 1000,
}: PriceRangeSliderProps) {
  const range = max - min || 1;
  const leftPct = ((valueMin - min) / range) * 100;
  const rightPct = ((valueMax - min) / range) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm font-semibold text-[var(--primary)]">
        <span>{formatRs(valueMin)}</span>
        <span>{valueMax >= max ? "Max" : formatRs(valueMax)}</span>
      </div>

      <div className="price-range relative h-8">
        <div className="absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-[var(--border)]" />
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-[var(--primary)]"
          style={{ left: `${leftPct}%`, right: `${100 - rightPct}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={valueMin}
          aria-label="Minimum price"
          onChange={(e) => {
            const next = Math.min(Number(e.target.value), valueMax - step);
            onChange(Math.max(min, next), valueMax);
          }}
          className="price-range-thumb"
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={valueMax}
          aria-label="Maximum price"
          onChange={(e) => {
            const next = Math.max(Number(e.target.value), valueMin + step);
            onChange(valueMin, Math.min(max, next));
          }}
          className="price-range-thumb"
        />
      </div>

      <div className="flex justify-between text-[11px] font-medium text-[var(--muted)]">
        <span>0</span>
        <span>50K</span>
        <span>100K</span>
        <span>150K</span>
        <span>200K</span>
      </div>
    </div>
  );
}
