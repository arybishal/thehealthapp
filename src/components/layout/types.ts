export interface ShellUser {
  name?: string | null;
  email?: string | null;
  role?: string | null;
  isDemo?: boolean;
}

export interface ShellPatient {
  id: string;
  name: string;
  relationship?: string | null;
}
