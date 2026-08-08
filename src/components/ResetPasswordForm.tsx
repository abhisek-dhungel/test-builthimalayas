"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BuiltLogo } from "./BuiltLogo";
import { SiteHeader } from "./SiteHeader";
import "@/app/auth-form.css";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setReady(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!token) {
      setError("This password reset link is invalid or has expired.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/user/password-reset/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to reset password.");
      router.push("/login");
    } catch (resetError) {
      setError(
        resetError instanceof Error
          ? resetError.message
          : "Unable to reset password.",
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
            <h1 className="auth-title">Set a new password</h1>
            <p className="auth-subtitle">Choose a new password for your account.</p>
            <div className="auth-form">
              <label className="auth-field">
                <span className="auth-label">New password</span>
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="auth-input"
                  autoComplete="new-password"
                  minLength={3}
                />
              </label>
              <label className="auth-field">
                <span className="auth-label">Confirm new password</span>
                <input
                  required
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="auth-input"
                  autoComplete="new-password"
                  minLength={3}
                />
              </label>
              {error && <p className="auth-error">{error}</p>}
              <button type="submit" disabled={loading} className="auth-submit">
                {loading ? "Updating password..." : "Update password"}
              </button>
            </div>
            <p className="auth-footer">
              <Link href="/login">Back to login</Link>
            </p>
          </form>
        </div>
      </main>
    </>
  );
}
