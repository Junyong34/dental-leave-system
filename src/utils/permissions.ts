import type { UserRole } from '@/types/leave'

export function isAdminRole(role?: UserRole | null): boolean {
  return role === 'ADMIN'
}

export function hasRequiredRole(
  role: UserRole | null | undefined,
  requiredRoles: UserRole[],
): boolean {
  if (!role) return false
  return requiredRoles.includes(role)
}
