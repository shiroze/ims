/**
 * Permission type definitions for Role-Based Access Control (RBAC)
 */

/**
 * Represents a single permission string
 * Format: "resource:action" or custom permission string
 * Examples: "users:read", "users:write", "admin:*", "*"
 */
export type Permission = string;

/**
 * Array of permissions that a user or role has
 */
export type Permissions = Permission[];

/**
 * User with permissions
 */
export interface UserWithPermissions {
  id: string;
  permissions: Permissions;
  roles?: string[];
}

/**
 * Role with permissions
 */
export interface Role {
  id: string;
  name: string;
  permissions: Permissions;
}

/**
 * Permission check result
 */
export interface PermissionCheckResult {
  granted: boolean;
  reason?: string;
}
