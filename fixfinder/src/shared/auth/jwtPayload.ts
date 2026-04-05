export type JwtPayload = { userId?: string; userType?: string; email?: string };

/** Decode JWT payload (no verification — server verifies). */
export function getAuthPayload(token: string | null): JwtPayload | null {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const segment = parts[1];
    const base64 = segment.replace(/-/g, "+").replace(/_/g, "/");
    const padLen = (4 - (base64.length % 4)) % 4;
    const padded = base64 + "=".repeat(padLen);
    if (typeof atob === "undefined") return null;
    const json = atob(padded);
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

/** Read userId from JWT payload (no verification — server verifies). */
export function getUserIdFromToken(token: string | null): string | null {
  const p = getAuthPayload(token);
  if (!p?.userId) return null;
  return String(p.userId);
}
