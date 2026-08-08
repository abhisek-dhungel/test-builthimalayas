import bcrypt from "bcryptjs";
import crypto from "crypto";
import { cookies } from "next/headers";
import { dbGet, dbRun } from "./database";
import type { PublicUser } from "./types";

const USER_SESSION_COOKIE = "rent_user_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

function getSessionSecret() {
  return process.env.SESSION_SECRET ?? "rent-valley-dev-secret";
}

function createSessionToken(userId: number): string {
  const sig = crypto
    .createHmac("sha256", getSessionSecret())
    .update(`user:${userId}`)
    .digest("hex");
  return `${userId}.${sig}`;
}

function verifySessionToken(token: string): number | null {
  const dot = token.indexOf(".");
  if (dot === -1) return null;

  const userId = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = crypto
    .createHmac("sha256", getSessionSecret())
    .update(`user:${userId}`)
    .digest("hex");

  if (sig !== expected) return null;

  const id = Number(userId);
  return Number.isFinite(id) ? id : null;
}

async function setUserSession(userId: number) {
  const cookieStore = await cookies();
  cookieStore.set(USER_SESSION_COOKIE, createSessionToken(userId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

export async function signupUser(input: {
  name: string;
  email: string;
  phone: string;
  address?: string;
  password: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const phone = input.phone.trim().replace(/\s+/g, "");
  const address = input.address?.trim() || null;
  const password = input.password;

  if (!name || !email || !phone || !password) {
    return { ok: false, error: "Name, email, phone, and password are required." };
  }

  if (!isValidEmail(email)) {
    return { ok: false, error: "Enter a valid email address." };
  }

  if (password.length < 3) {
    return { ok: false, error: "Password must be at least 3 characters." };
  }

  const existing = await dbGet<{ id: number }>(
    "SELECT id FROM users WHERE phone = ?",
    [phone],
  );
  if (existing) {
    return { ok: false, error: "An account with this phone already exists." };
  }

  const existingEmail = await dbGet<{ id: number }>(
    "SELECT id FROM users WHERE email = ?",
    [email],
  );
  if (existingEmail) {
    return { ok: false, error: "An account with this email already exists." };
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const result = await dbRun(
    "INSERT INTO users (name, email, phone, address, password_hash) VALUES (?, ?, ?, ?, ?)",
    [name, email, phone, address, passwordHash],
  );

  await setUserSession(result.lastInsertRowid);
  return { ok: true };
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getSqlDate(date: Date) {
  return date.toISOString().slice(0, 19).replace("T", " ");
}

function getResetTokenHash(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

async function sendPasswordResetEmail(email: string, resetUrl: string) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim();

  if (!apiKey || !from) {
    if (process.env.NODE_ENV !== "production") {
      console.info(`[auth] Password reset link for ${email}: ${resetUrl}`);
      return;
    }
    throw new Error("Password reset email is not configured.");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject: "Reset your Built Himalayas password",
      html: `<p>We received a request to reset your password.</p><p><a href="${resetUrl}">Reset password</a></p><p>This link expires in one hour. If you did not request it, you can ignore this email.</p>`,
    }),
  });

  if (!response.ok) {
    throw new Error("Password reset email could not be sent.");
  }
}

export async function requestPasswordReset(email: string, appUrl: string) {
  const cleanedEmail = email.trim().toLowerCase();
  if (!isValidEmail(cleanedEmail)) return;

  const user = await dbGet<{ id: number }>(
    "SELECT id FROM users WHERE email = ?",
    [cleanedEmail],
  );
  if (!user) return;

  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = getResetTokenHash(token);
  const expiresAt = getSqlDate(new Date(Date.now() + 60 * 60 * 1000));

  await dbRun("DELETE FROM password_reset_tokens WHERE user_id = ?", [user.id]);
  await dbRun(
    "INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)",
    [user.id, tokenHash, expiresAt],
  );

  await sendPasswordResetEmail(
    cleanedEmail,
    `${appUrl}/reset-password?token=${encodeURIComponent(token)}`,
  );
}

export async function resetPassword(token: string, password: string) {
  if (!token || password.length < 3) {
    return { ok: false as const, error: "Password must be at least 3 characters." };
  }

  const tokenHash = getResetTokenHash(token);
  const reset = await dbGet<{ id: number; user_id: number }>(
    `SELECT id, user_id FROM password_reset_tokens
     WHERE token_hash = ? AND expires_at > CURRENT_TIMESTAMP`,
    [tokenHash],
  );
  if (!reset) {
    return { ok: false as const, error: "This password reset link is invalid or has expired." };
  }

  await dbRun("UPDATE users SET password_hash = ? WHERE id = ?", [
    bcrypt.hashSync(password, 10),
    reset.user_id,
  ]);
  await dbRun("DELETE FROM password_reset_tokens WHERE user_id = ?", [reset.user_id]);
  return { ok: true as const };
}

export async function loginUser(
  phone: string,
  password: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const cleaned = phone.trim().replace(/\s+/g, "");
  const user = await dbGet<{
    id: number;
    password_hash: string;
    blocked: number;
  }>("SELECT id, password_hash, blocked FROM users WHERE phone = ?", [cleaned]);

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return { ok: false, error: "Invalid phone number or password." };
  }

  if (user.blocked) {
    return {
      ok: false,
      error: "This account has been blocked. Contact support.",
    };
  }

  await setUserSession(user.id);
  return { ok: true };
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete(USER_SESSION_COOKIE);
}

export async function getCurrentUser(): Promise<PublicUser | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(USER_SESSION_COOKIE);
  if (!session?.value) return null;

  const userId = verifySessionToken(session.value);
  if (!userId) return null;

  const user = await dbGet<{
    id: number;
    name: string;
    phone: string;
    address: string | null;
    blocked: number;
  }>("SELECT id, name, phone, address, blocked FROM users WHERE id = ?", [
    userId,
  ]);

  if (!user || user.blocked) {
    if (user?.blocked) {
      const cookieStore = await cookies();
      cookieStore.delete(USER_SESSION_COOKIE);
    }
    return null;
  }

  return user;
}

export async function getCurrentUserId(): Promise<number | null> {
  const user = await getCurrentUser();
  return user?.id ?? null;
}
