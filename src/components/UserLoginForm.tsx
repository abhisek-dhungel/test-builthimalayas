"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BuiltLogo } from "./BuiltLogo";
import { SiteHeader } from "./SiteHeader";
import "@/app/auth-form.css";

export function UserLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";
  const [ready, setReady] = useState(false);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setReady(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ phone, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
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

            <span className="auth-kicker">Welcome back</span>
            <h1 className="auth-title">Sign in</h1>
            <p className="auth-subtitle">
              Use your phone number and password to continue.
            </p>

            <div className="auth-form">
              <label className="auth-field">
                <span className="auth-label">Phone number</span>
                <input
                  required
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="auth-input"
                  placeholder="98XXXXXXXX"
                  autoComplete="tel"
                />
              </label>

              <label className="auth-field">
                <span className="auth-label">Password</span>
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="auth-input"
                  placeholder="Your password"
                  autoComplete="current-password"
                  minLength={3}
                />
              </label>

              {error && <p className="auth-error">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="auth-submit"
              >
                {loading ? "Signing in..." : "Login"}
              </button>
            </div>

            <p className="auth-footer">
              New here?{" "}
              <Link href={`/signup?next=${encodeURIComponent(next)}`}>
                Create an account
              </Link>
            </p>
          </form>
        </div>
      </main>
    </>
  );
}
