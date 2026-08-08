"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PLACES } from "@/lib/locations";
import { PROPERTY_TYPES, getLayoutsForType } from "@/lib/property";
import { SiteHeader } from "./SiteHeader";
import "@/app/list-form.css";

export function CustomOrderForm() {
  const router = useRouter();
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
  const [errors, setErrors] = useState<Record<string, string>>({});

  const places = PLACES.kathmandu;

  const layoutOptions = useMemo(
    () => (propertyType ? getLayoutsForType(propertyType) : []),
    [propertyType],
  );

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setReady(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  function clearError(key: string) {
    setErrors((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function validateForm(): Record<string, string> {
    const next: Record<string, string> = {};

    if (!place) next.place = "Please select an area / place.";
    if (!landmark.trim()) next.landmark = "Please enter a landmark.";
    if (!propertyType) {
      next.property_type = "Please select property type.";
    } else if (propertyType === "commercial") {
      if (!propertyDetails.trim()) {
        next.property_details = "Please enter commercial details.";
      }
    } else if (!propertyDetails) {
      next.property_details =
        propertyType === "room"
          ? "Please select room type."
          : "Please select flat layout.";
    }
    if (!priceMin || Number(priceMin) < 1) {
      next.price_min = "Please enter a minimum budget.";
    }
    if (!priceMax || Number(priceMax) < 1) {
      next.price_max = "Please enter a maximum budget.";
    }
    if (
      priceMin &&
      priceMax &&
      Number(priceMin) > 0 &&
      Number(priceMax) > 0 &&
      Number(priceMax) < Number(priceMin)
    ) {
      next.price_max = "Maximum budget must be greater than the minimum.";
    }
    if (!name.trim()) next.name = "Please enter your name.";
    if (!phone.trim()) next.phone = "Please enter your phone number.";
    return next;
  }

  function focusField(key: string) {
    const el = document.querySelector(`[name="${key}"]`) as HTMLElement | null;
    if (el) {
      el.focus();
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const nextErrors = validateForm();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setError("");
      focusField(Object.keys(nextErrors)[0]);
      return;
    }

    setErrors({});
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
      <main className={`list-form-page flex-1 ${ready ? "is-ready" : ""}`}>
        <div className="list-form-shell">
          <header className="list-form-hero">
            <span className="list-form-kicker">Order · Built Himalayas</span>
            <h1 className="list-form-title">Place Custom Order</h1>
            <p className="list-form-subtitle">
              Tell us what you need and we will try to find a match for you.
            </p>
          </header>

          {success ? (
            <div className="list-form-success">
              <div className="list-form-success-icon" aria-hidden>
                ✓
              </div>
              <h2>Custom order submitted!</h2>
              <p>Our team will contact you when we find a suitable property.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="list-form-card" noValidate>
              <section className="list-form-section">
                <div className="list-form-section-head">
                  <h2 className="list-form-section-title">Location</h2>
                  <p className="list-form-section-note">
                    Where are you looking for a property?
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

                  <Field label="Area / Place" error={errors.place}>
                    <select
                      required
                      name="place"
                      value={place}
                      onChange={(e) => {
                        setPlace(e.target.value);
                        clearError("place");
                      }}
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

                  <Field
                    label="Landmark"
                    className="span-2"
                    error={errors.landmark}
                  >
                    <input
                      required
                      name="landmark"
                      value={landmark}
                      onChange={(e) => {
                        setLandmark(e.target.value);
                        clearError("landmark");
                      }}
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
                  <Field
                    label="Property type"
                    className="span-2"
                    error={errors.property_type}
                  >
                    <div className="list-form-choice-grid cols-3">
                      {PROPERTY_TYPES.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          name="property_type"
                          onClick={() => {
                            setPropertyType(option.value);
                            setPropertyDetails("");
                            clearError("property_type");
                            clearError("property_details");
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
                    <Field label="Room type" error={errors.property_details}>
                      <select
                        required
                        name="property_details"
                        value={propertyDetails}
                        onChange={(e) => {
                          setPropertyDetails(e.target.value);
                          clearError("property_details");
                        }}
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
                    <Field label="Flat layout" error={errors.property_details}>
                      <select
                        required
                        name="property_details"
                        value={propertyDetails}
                        onChange={(e) => {
                          setPropertyDetails(e.target.value);
                          clearError("property_details");
                        }}
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
                    <Field
                      label="Commercial details"
                      className="span-2"
                      error={errors.property_details}
                    >
                      <textarea
                        required
                        name="property_details"
                        value={propertyDetails}
                        onChange={(e) => {
                          setPropertyDetails(e.target.value);
                          clearError("property_details");
                        }}
                        className="field-input"
                        placeholder="Shop size, floor, suitable for restaurant, office, etc."
                      />
                    </Field>
                  )}

                  <Field
                    label="Monthly rent budget (NPR)"
                    className={
                      propertyType === "room" || propertyType === "flat"
                        ? ""
                        : "span-2"
                    }
                  >
                    <div className="list-form-choice-grid cols-2">
                      <div className="list-form-field-control">
                        <input
                          required
                          type="number"
                          min={1}
                          inputMode="numeric"
                          name="price_min"
                          value={priceMin}
                          onChange={(e) => {
                            setPriceMin(e.target.value);
                            clearError("price_min");
                          }}
                          className="field-input"
                          placeholder="Min"
                        />
                        {errors.price_min && (
                          <p className="list-form-error-field">
                            {errors.price_min}
                          </p>
                        )}
                      </div>
                      <div className="list-form-field-control">
                        <input
                          required
                          type="number"
                          min={1}
                          inputMode="numeric"
                          name="price_max"
                          value={priceMax}
                          onChange={(e) => {
                            setPriceMax(e.target.value);
                            clearError("price_max");
                          }}
                          className="field-input"
                          placeholder="Max"
                        />
                        {errors.price_max && (
                          <p className="list-form-error-field">
                            {errors.price_max}
                          </p>
                        )}
                      </div>
                    </div>
                  </Field>
                </div>
              </section>

              <section className="list-form-section">
                <div className="list-form-section-head">
                  <h2 className="list-form-section-title">Your details</h2>
                  <p className="list-form-section-note">
                    So our team can reach the right contact.
                  </p>
                </div>
                <div className="list-form-fields two-col">
                  <Field label="Your name" error={errors.name}>
                    <input
                      required
                      name="name"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        clearError("name");
                      }}
                      className="field-input"
                      placeholder="Full name"
                    />
                  </Field>

                  <Field label="Phone number" error={errors.phone}>
                    <input
                      required
                      type="tel"
                      name="phone"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        clearError("phone");
                      }}
                      className="field-input"
                      placeholder="98XXXXXXXX"
                    />
                    <p className="list-form-hint">
                      Nepal mobile number (e.g. 98XXXXXXXX)
                    </p>
                  </Field>
                </div>
              </section>

              {error && <p className="list-form-error mt-2">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="list-form-submit mt-3"
              >
                {loading ? "Submitting..." : "Submit custom order"}
              </button>
            </form>
          )}
        </div>
      </main>
    </>
  );
}

function Field({
  label,
  children,
  className = "",
  error,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
  error?: string;
}) {
  return (
    <div className={`list-form-field ${className}`}>
      <span className="label">{label}</span>
      <div className="list-form-field-control">{children}</div>
      {error && <p className="list-form-error-field">{error}</p>}
    </div>
  );
}
