"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BuiltLogo } from "./BuiltLogo";
import { SiteHeader } from "./SiteHeader";
import "@/app/auth-form.css";

export function UserSignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";
  const [ready, setReady] = useState(false);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
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
      const res = await fetch("/api/user/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ name, address, phone, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Signup failed");
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
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

            <span className="auth-kicker">Join Built Himalayas</span>
            <h1 className="auth-title">Create account</h1>
            <p className="auth-subtitle">
              Sign up to save favourites and manage your rentals.
            </p>

            <div className="auth-form">
              <label className="auth-field">
                <span className="auth-label">Full name</span>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="auth-input"
                  placeholder="Your full name"
                  autoComplete="name"
                />
              </label>

              <label className="auth-field">
                <span className="auth-label">Address (optional)</span>
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="auth-input"
                  placeholder="Your address"
                  autoComplete="street-address"
                />
              </label>

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
                  placeholder="Min 3 characters"
                  autoComplete="new-password"
                  minLength={3}
                />
              </label>

              {error && <p className="auth-error">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="auth-submit"
              >
                {loading ? "Creating account..." : "Sign up"}
              </button>
            </div>

            <p className="auth-footer">
              Already have an account?{" "}
              <Link href={`/login?next=${encodeURIComponent(next)}`}>
                Login
              </Link>
            </p>
          </form>
        </div>
      </main>
    </>
  );
}
