export const DEMO_EMAIL = "demo@thebloodtracker.com";

export const DEMO_MESSAGE =
  "This is a read-only demo account. Create your own free account to add or edit health data.";

export function isDemoEmail(email: string | null | undefined): boolean {
  return (email ?? "").toLowerCase() === DEMO_EMAIL;
}

export const demoBlockedError = { error: DEMO_MESSAGE };