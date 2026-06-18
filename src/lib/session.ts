import { cookies } from "next/headers";
import crypto from "crypto";

const SESSION_COOKIE_NAME = "opera_prima_session";
const SECRET = process.env.SESSION_SECRET || "a-default-very-secure-random-secret-key-32-chars-long";

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const key = crypto.scryptSync(SECRET, "salt", 32);
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return `${iv.toString("hex")}:${encrypted}`;
}

export function decrypt(text: string): string | null {
  try {
    const parts = text.split(":");
    if (parts.length < 2) return null;
    const ivHex = parts.shift();
    if (!ivHex) return null;
    const iv = Buffer.from(ivHex, "hex");
    const encryptedText = parts.join(":");
    const key = crypto.scryptSync(SECRET, "salt", 32);
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (error) {
    return null;
  }
}

export async function setSession(userId: string, email: string) {
  const payload = JSON.stringify({ userId, email, exp: Date.now() + 24 * 60 * 60 * 1000 });
  const encrypted = encrypt(payload);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, encrypted, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 1 day
  });
}

export async function getSession(): Promise<{ userId: string; email: string } | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  if (!sessionCookie || !sessionCookie.value) return null;

  const decrypted = decrypt(sessionCookie.value);
  if (!decrypted) return null;

  try {
    const data = JSON.parse(decrypted);
    if (data.exp < Date.now()) {
      return null;
    }
    return { userId: data.userId, email: data.email };
  } catch {
    return null;
  }
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
