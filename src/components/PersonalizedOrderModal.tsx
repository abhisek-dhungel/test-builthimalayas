"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { PLACES } from "@/lib/locations";
import { PROPERTY_TYPES, getLayoutsForType } from "@/lib/property";
import "@/app/list-form.css";

export function PersonalizedOrderModal({ onClose }: { onClose: () => void }) {
  const district = "kathmandu" as const;
  const [ready, setReady] = useState(false);
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

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setReady(true));
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (
      !place ||
      !propertyType ||
      !propertyDetails ||
      !priceMin ||
      !priceMax ||
      !name ||
      !phone
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="personalized-order-overlay"
      onClick={onClose}
      role="presentation"
    >
      <div
        className={`list-form-page personalized-order-sheet ${ready ? "is-ready" : ""}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="personalized-order-title"
      >
        <div className="list-form-shell personalized-order-shell">
          <header className="list-form-hero">
            <div className="personalized-order-hero-top">
              <span className="list-form-kicker">Order · Built Himalayas</span>
              <button
                type="button"
                onClick={onClose}
                className="personalized-order-close"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <h1 id="personalized-order-title" className="list-form-title">
              Personalized Order
            </h1>
            <p className="list-form-subtitle">
              Tell us what you need and we will try to find a match for you.
            </p>
          </header>

          {success ? (
            <div className="list-form-success">
              <div className="list-form-success-icon" aria-hidden>
                ✓
              </div>
              <h2>Order submitted!</h2>
              <p>
                Our team will contact you when we find a suitable property.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="list-form-submit"
                style={{ marginTop: "1.25rem" }}
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="list-form-card">
              <section className="list-form-section">
                <div className="list-form-section-head">
                  <h2 className="list-form-section-title">Location</h2>
                  <p className="list-form-section-note">
                    Where are you looking to rent?
                  </p>
                </div>
                <div className="list-form-fields two-col">
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

                  <Field label="Landmark" className="span-2">
                    <input
                      required
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      className="field-input"
                      placeholder="Near hospital, school, main road..."
                    />
                  </Field>
                </div>
              </section>

              <section className="list-form-section">
                <div className="list-form-section-head">
                  <h2 className="list-form-section-title">Property details</h2>
                  <p className="list-form-section-note">
                    Type, layout and your budget.
                  </p>
                </div>
                <div className="list-form-fields two-col">
                  <Field label="Property type" className="span-2">
                    <div className="list-form-choice-grid cols-3">
                      {PROPERTY_TYPES.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            setPropertyType(option.value);
                            setPropertyDetails("");
                          }}
                          className={`list-form-choice ${
                            propertyType === option.value ? "is-active" : ""
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </Field>

                  {propertyType === "room" && (
                    <Field label="Room type" className="span-2">
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
                    <Field label="Flat layout" className="span-2">
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
                    <Field label="Commercial details" className="span-2">
                      <textarea
                        required
                        value={propertyDetails}
                        onChange={(e) => setPropertyDetails(e.target.value)}
                        className="field-input"
                        placeholder="Shop size, floor, suitable for restaurant, office, etc."
                      />
                    </Field>
                  )}

                  <Field label="Budget min (NPR)">
                    <input
                      required
                      type="number"
                      min={1}
                      inputMode="numeric"
                      value={priceMin}
                      onChange={(e) => setPriceMin(e.target.value)}
                      className="field-input"
                      placeholder="e.g. 10000"
                    />
                  </Field>

                  <Field label="Budget max (NPR)">
                    <input
                      required
                      type="number"
                      min={1}
                      inputMode="numeric"
                      value={priceMax}
                      onChange={(e) => setPriceMax(e.target.value)}
                      className="field-input"
                      placeholder="e.g. 25000"
                    />
                  </Field>
                </div>
              </section>

              <section className="list-form-section">
                <div className="list-form-section-head">
                  <h2 className="list-form-section-title">Your details</h2>
                  <p className="list-form-section-note">
                    So we can contact you about matches.
                  </p>
                </div>
                <div className="list-form-fields two-col">
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
                    <p className="list-form-hint">
                      Nepal mobile number (e.g. 98XXXXXXXX)
                    </p>
                  </Field>
                </div>
              </section>

              {error && <p className="list-form-error mt-4">{error}</p>}

              <button
                type="submit"
                disabled={
                  loading ||
                  !propertyType ||
                  !propertyDetails ||
                  !priceMin ||
                  !priceMax
                }
                className="list-form-submit mt-5"
              >
                {loading ? "Submitting..." : "Submit personalized order"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`list-form-field ${className}`}>
      <span className="label">{label}</span>
      <div className="list-form-field-control">{children}</div>
    </div>
  );
}
