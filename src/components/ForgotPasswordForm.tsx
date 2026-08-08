"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { BuiltLogo } from "./BuiltLogo";
import { SiteHeader } from "./SiteHeader";
import "@/app/auth-form.css";

export function ForgotPasswordForm() {
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setReady(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/user/password-reset/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to send reset link.");
      setMessage(data.message);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to send reset link.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <SiteHeader showBack />
      <main className={`auth-page ${ready ? "is-ready" : ""}`}>
        <div className="auth-shell">
          <form onSubmit={handleSubmit} className="auth-card">
            <div className="auth-brand">
              <BuiltLogo size="md" showTagline />
            </div>
            <span className="auth-kicker">Account recovery</span>
            <h1 className="auth-title">Forgot password?</h1>
            <p className="auth-subtitle">
              Enter your registered email and we&apos;ll send a reset link.
            </p>
            <div className="auth-form">
              <label className="auth-field">
                <span className="auth-label">Email address</span>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="auth-input"
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </label>
              {error && <p className="auth-error">{error}</p>}
              {message && <p className="auth-success">{message}</p>}
              <button type="submit" disabled={loading} className="auth-submit">
                {loading ? "Sending link..." : "Send reset link"}
              </button>
            </div>
            <p className="auth-footer">
              Remembered your password? <Link href="/login">Login</Link>
            </p>
          </form>
        </div>
      </main>
    </>
  );
}
