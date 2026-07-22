import bcrypt from "bcryptjs";
import crypto from "crypto";
import { cookies } from "next/headers";
import { dbGet } from "./database";

const SESSION_COOKIE = "rent_admin_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

function getSessionSecret() {
  return process.env.SESSION_SECRET ?? "rent-valley-dev-secret";
}

function createSessionToken(userId: number): string {
  const sig = crypto
    .createHmac("sha256", getSessionSecret())
    .update(String(userId))
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
    .update(userId)
    .digest("hex");

  if (sig !== expected) return null;

  const id = Number(userId);
  return Number.isFinite(id) ? id : null;
}

export async function loginAdmin(username: string, password: string) {
  const user = await dbGet<{
    id: number;
    username: string;
    password_hash: string;
  }>("SELECT id, username, password_hash FROM admin_users WHERE username = ?", [
    username,
  ]);

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return false;
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, createSessionToken(user.id), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });

  return true;
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE);
  if (!session?.value) return false;

  const userId = verifySessionToken(session.value);
  if (!userId) return false;

  const user = await dbGet<{ id: number }>(
    "SELECT id FROM admin_users WHERE id = ?",
    [userId],
  );

  return Boolean(user);
}
