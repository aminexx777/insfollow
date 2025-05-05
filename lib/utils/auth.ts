// Admin credentials
export const ADMIN_USERNAME = "aminehadji"
export const ADMIN_PASSWORD = "amineff0507"

// Verify admin credentials
export function verifyAdminCredentials(username: string, password: string): boolean {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD
}
