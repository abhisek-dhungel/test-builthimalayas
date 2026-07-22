"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  PLACES,
} from "@/lib/locations";
import { PROPERTY_TYPES, getLayoutsForType } from "@/lib/property";
import { SiteHeader } from "./SiteHeader";

export function CustomOrderForm() {
  const router = useRouter();
  const district = "kathmandu" as const;
  const [place, setPlace] = useState("");
  const [landmark, setLandmark] = useState("");
  const [propertyType, setPropertyType] = useState<
    "room" | "flat" | "commercial" | ""
  >("");
  const [propertyDetails, setPropertyDetails] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const places = PLACES.kathmandu;

  const layoutOptions = useMemo(
    () => (propertyType ? getLayoutsForType(propertyType) : []),
    [propertyType],
  );

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (
      !place ||
      !propertyType ||
      !propertyDetails ||
      !priceMin ||
      !priceMax
    ) {
      setError("Please complete all required fields.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/custom-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          district,
          place,
          landmark,
          property_type: propertyType,
          property_details: propertyDetails,
          price_min: Number(priceMin),
          price_max: Number(priceMax),
          name,
          phone,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit");

      setSuccess(true);
      setTimeout(() => router.push("/browse"), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <SiteHeader showBack />
      <main className="mx-auto max-w-lg flex-1 px-4 py-6 pb-10">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-[var(--text)]">
            Place custom order
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Tell us what you need and we will try to find a match for you.
          </p>
        </div>

        {success ? (
          <div className="rounded-2xl bg-[var(--success-bg)] p-6 text-center">
            <p className="text-lg font-semibold text-[var(--primary)]">
              Custom order submitted!
            </p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Our team will contact you when we find a suitable property.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="District">
              <select
                required
                value={district}
                disabled
                className="field-input disabled:opacity-80"
              >
                <option value="kathmandu">Kathmandu</option>
              </select>
            </Field>

            <Field label="Area / Place">
              <select
                required
                value={place}
                onChange={(e) => setPlace(e.target.value)}
                className="field-input"
              >
                <option value="">Select place</option>
                {places.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Landmark">
              <input
                required
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                className="field-input"
                placeholder="Near hospital, school, main road..."
              />
            </Field>

            <Field label="Property type">
              <div className="grid grid-cols-3 gap-2">
                {PROPERTY_TYPES.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setPropertyType(option.value);
                      setPropertyDetails("");
                    }}
                    className={`rounded-xl border px-2 py-3 text-xs font-medium transition sm:text-sm ${
                      propertyType === option.value
                        ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                        : "border-[var(--border)] bg-[var(--surface)] text-[var(--text)]"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </Field>

            {propertyType === "room" && (
              <Field label="Room type">
                <select
                  required
                  value={propertyDetails}
                  onChange={(e) => setPropertyDetails(e.target.value)}
                  className="field-input"
                >
                  <option value="">Select room type</option>
                  {layoutOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </Field>
            )}

            {propertyType === "flat" && (
              <Field label="Flat layout">
                <select
                  required
                  value={propertyDetails}
                  onChange={(e) => setPropertyDetails(e.target.value)}
                  className="field-input"
                >
                  <option value="">Select flat layout</option>
                  {layoutOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </Field>
            )}

            {propertyType === "commercial" && (
              <Field label="Commercial details">
                <textarea
                  required
                  value={propertyDetails}
                  onChange={(e) => setPropertyDetails(e.target.value)}
                  className="field-input min-h-24 resize-y"
                  placeholder="Shop size, floor, suitable for restaurant, office, etc."
                />
              </Field>
            )}

            <Field label="Monthly rent budget (NPR)">
              <div className="grid grid-cols-2 gap-2">
                <input
                  required
                  type="number"
                  min={1}
                  inputMode="numeric"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  className="field-input"
                  placeholder="Min"
                />
                <input
                  required
                  type="number"
                  min={1}
                  inputMode="numeric"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  className="field-input"
                  placeholder="Max"
                />
              </div>
            </Field>

            <Field label="Your name">
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="field-input"
                placeholder="Full name"
              />
            </Field>

            <Field label="Phone number">
              <input
                required
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="field-input"
                placeholder="98XXXXXXXX"
              />
              <p className="mt-1 text-[10px] text-[var(--muted)]">
                Nepal mobile number (e.g. 98XXXXXXXX)
              </p>
            </Field>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={
                loading || !propertyType || !propertyDetails || !priceMin || !priceMax
              }
              className="w-full rounded-2xl bg-[var(--primary)] py-4 text-base font-semibold text-white disabled:opacity-60"
            >
              {loading ? "Submitting..." : "Submit custom order"}
            </button>
          </form>
        )}
      </main>
    </>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
        {label}
      </span>
      {children}
    </label>
  );
}
