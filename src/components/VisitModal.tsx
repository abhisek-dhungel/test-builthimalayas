"use client";

import { FormEvent, useEffect, useState } from "react";
import type { PublicListing } from "@/lib/types";

export function VisitModal({
  listing,
  onClose,
}: {
  listing: PublicListing;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listing_id: listing.id,
          name,
          phone,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit");

      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="visit-modal-overlay" onClick={onClose} role="presentation">
      <div
        className="visit-modal-panel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="visit-modal-header">
          <div>
            <h2 className="visit-modal-title">Book Home Visit</h2>
            <p className="visit-modal-subtitle">
              {listing.place} · {listing.landmark}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="visit-modal-close"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {done ? (
          <div className="visit-modal-success">
            <p className="visit-modal-success-title">Request sent!</p>
            <p className="visit-modal-success-text">
              We will contact you shortly about this property.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="visit-modal-success-close"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="visit-modal-form">
            <label className="visit-modal-field">
              <span className="visit-modal-label">Your name</span>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="visit-modal-input"
                placeholder="Full name"
                autoComplete="name"
              />
            </label>
            <label className="visit-modal-field">
              <span className="visit-modal-label">Phone number</span>
              <input
                required
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="visit-modal-input"
                placeholder="98XXXXXXXX"
                autoComplete="tel"
              />
            </label>
            {error && <p className="visit-modal-error">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="visit-modal-submit"
            >
              {loading ? "Sending..." : "Send visit request"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
