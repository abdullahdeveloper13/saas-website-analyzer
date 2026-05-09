/**
 * Lightweight admin gate for the dashboard admin scaffold.
 * Set `ADMIN_EMAILS` in `.env.local` as a comma-separated list.
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const raw = process.env.ADMIN_EMAILS ?? "";
  const allowed = raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return allowed.includes(email.toLowerCase());
}
