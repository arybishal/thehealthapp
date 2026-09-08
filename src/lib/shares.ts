import { randomBytes } from "crypto";

export function generateShareToken(): string {
  return randomBytes(16).toString("base64url");
}

export function isShareExpired(
  expiresAt: Date | null,
  revoked: boolean
): boolean {
  if (revoked) return true;
  if (!expiresAt) return false;
  return expiresAt.getTime() < Date.now();
}