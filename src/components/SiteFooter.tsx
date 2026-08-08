"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { PLACES } from "@/lib/locations";
import { buildSearchHref } from "@/lib/searchParams";
import { BuiltLogo } from "./BuiltLogo";

const AREAS = PLACES.kathmandu;

export function SiteFooter() {
  const [inquiryStatus, setInquiryStatus] = useState<string | null>(null);

  async function submitInquiry(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();
    const remarks = String(data.get("remarks") ?? "").trim();

    if (!name || !phone) {
      setInquiryStatus("Please enter name and phone.");
      return;
    }

    setInquiryStatus("Sending…");
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, remarks }),
      });
      const result = await res.json();
      if (!res.ok) {
        setInquiryStatus(result.error || "Could not submit inquiry.");
        return;
      }
      setInquiryStatus("Thanks — we will contact you shortly.");
      form.reset();
    } catch {
      setInquiryStatus("Could not submit inquiry. Try again.");
    }
  }

  return (
    <div className="home-design home-design--footer-only mt-auto">
      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-grid">
            <div className="footer-col">
              <h4>Contact Us</h4>
              <p className="footer-company">Built Himalayas Pvt Ltd</p>
              <div className="footer-contact-row">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <a href="tel:+9779802373431">+977 9802373431</a>
              </div>
              <div className="footer-contact-row">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M4 4h16v16H4V4z" />
                  <path d="m22 6-10 7L2 6" />
                </svg>
                <a
                  href="https://mail.google.com/mail/?view=cm&fs=1&to=builthimalayas@gmail.com"
                  target="_blank"
                  rel="noreferrer"
                >
                  builthimalayas@gmail.com
                </a>
              </div>
              <Link href="/" className="footer-logo">
                <BuiltLogo size="lg" />
              </Link>
            </div>

            <div className="footer-col">
              <h4>Localities</h4>
              <div className="footer-locality-list">
                {AREAS.map((place) => (
                  <Link key={place} href={buildSearchHref({ area: place })}>
                    {place}
                  </Link>
                ))}
              </div>
            </div>

            <div className="footer-col">
              <h4>Inquiry</h4>
              <form className="footer-form" onSubmit={submitInquiry}>
                <div className="footer-form-field">
                  <label htmlFor="site-inq-name">Name</label>
                  <input
                    id="site-inq-name"
                    name="name"
                    type="text"
                    placeholder="Your name"
                    required
                  />
                </div>
                <div className="footer-form-field">
                  <label htmlFor="site-inq-phone">Phone</label>
                  <input
                    id="site-inq-phone"
                    name="phone"
                    type="tel"
                    placeholder="98XXXXXXXX"
                    required
                  />
                </div>
                <div className="footer-form-field">
                  <label htmlFor="site-inq-remarks">Remarks</label>
                  <textarea
                    id="site-inq-remarks"
                    name="remarks"
                    rows={3}
                    placeholder="Tell us what you're looking for"
                  />
                </div>
                <button type="submit" className="footer-submit">
                  Submit
                </button>
                {inquiryStatus && (
                  <p className="footer-inquiry-status">{inquiryStatus}</p>
                )}
              </form>
            </div>

            <div className="footer-col">
              <h4>Social Media</h4>
              <div className="footer-social-icons">
                <a
                  href="#"
                  aria-label="Facebook"
                  target="_blank"
                  rel="noreferrer"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </a>
                <a
                  href="#"
                  aria-label="Instagram"
                  target="_blank"
                  rel="noreferrer"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="2" width="20" height="20" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <line x1="17.5" y1="6.5" x2="17.5" y2="6.5" />
                  </svg>
                </a>
                <a
                  href="#"
                  aria-label="TikTok"
                  target="_blank"
                  rel="noreferrer"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                  </svg>
                </a>
              </div>
              <a
                className="footer-support-btn"
                href="https://wa.me/9779802373431"
                target="_blank"
                rel="noreferrer"
                aria-label="Chat on WhatsApp"
                title="Customer Support on WhatsApp"
              >
                <span className="footer-support-icon" aria-hidden>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z" />
                    <path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0-2-2v-3a2 2 0 0 0-2-2H3z" />
                  </svg>
                </span>
                <span className="footer-support-text">Customer Support</span>
              </a>
            </div>
          </div>

          <div className="footer-bottom">
            <span>Copyright — Built Himalayas 2026 (All Rights Reserved)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
