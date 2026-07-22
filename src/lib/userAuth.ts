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
  phone: string;
  address?: string;
  password: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const name = input.name.trim();
  const phone = input.phone.trim().replace(/\s+/g, "");
  const address = input.address?.trim() || null;
  const password = input.password;

  if (!name || !phone || !password) {
    return { ok: false, error: "Name, phone, and password are required." };
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

  const passwordHash = bcrypt.hashSync(password, 10);
  const result = await dbRun(
    "INSERT INTO users (name, phone, address, password_hash) VALUES (?, ?, ?, ?)",
    [name, phone, address, passwordHash],
  );

  await setUserSession(result.lastInsertRowid);
  return { ok: true };
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
