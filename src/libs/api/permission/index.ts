/**
 * Role-Based Access Control (RBAC) Permission Utilities
 * 
 * This module provides clean, flexible utilities for checking user permissions.
 * Supports wildcard permissions and hierarchical permission checking.
 */

import type { Permission, Permissions, PermissionCheckResult } from './types';

/**
 * Checks if a permission pattern matches a required permission
 * Supports wildcard matching with "*"
 * 
 * @param userPermission - The permission pattern to check (can contain wildcards)
 * @param requiredPermission - The required permission
 * @returns true if the pattern matches
 * 
 * @example
 * matchesPermission("users:*", "users:read") // true
 * matchesPermission("*", "users:read") // true
 * matchesPermission("users:read", "users:write") // false
 */
function matchesPermission(userPermission: string, requiredPermission: string): boolean {
  // Exact match
  if (userPermission === requiredPermission) {
    return true;
  }

  // Wildcard match - "*" grants all permissions
  if (userPermission === '*') {
    return true;
  }

  // Resource-level wildcard - "users:*" grants all actions on users
  if (userPermission.endsWith(':*')) {
    const resource = userPermission.slice(0, -2);
    return requiredPermission.startsWith(resource + ':');
  }

  return false;
}

/**
 * Checks if a user has a specific permission
 * 
 * @param userPermissions - Array of permissions the user has
 * @param requiredPermission - The permission to check for
 * @returns true if the user has the required permission
 * 
 * @example
 * hasPermission(["users:read", "posts:write"], "users:read") // true
 * hasPermission(["users:*"], "users:delete") // true
 * hasPermission(["*"], "anything") // true
 * hasPermission(["users:read"], "users:write") // false
 */
export function hasPermission(
  userPermissions: Permissions,
  requiredPermission: Permission
): boolean {
  if (!userPermissions || userPermissions.length === 0) {
    return false;
  }

  if (!requiredPermission) {
    return false;
  }

  return userPermissions.some((permission) =>
    matchesPermission(permission, requiredPermission)
  );
}

/**
 * Checks if a user has ANY of the required permissions
 * Returns true if the user has at least one of the permissions
 * 
 * @param userPermissions - Array of permissions the user has
 * @param requiredPermissions - Array of permissions to check (user needs at least one)
 * @returns true if the user has any of the required permissions
 * 
 * @example
 * hasAnyPermission(["users:read"], ["users:read", "users:write"]) // true
 * hasAnyPermission(["admin:*"], ["users:delete", "posts:delete"]) // false
 * hasAnyPermission(["*"], ["anything", "something"]) // true
 */
export function hasAnyPermission(
  userPermissions: Permissions,
  requiredPermissions: Permissions
): boolean {
  if (!userPermissions || userPermissions.length === 0) {
    return false;
  }

  if (!requiredPermissions || requiredPermissions.length === 0) {
    return false;
  }

  return requiredPermissions.some((required) =>
    hasPermission(userPermissions, required)
  );
}

/**
 * Checks if a user has ALL of the required permissions
 * Returns true only if the user has every permission in the list
 * 
 * @param userPermissions - Array of permissions the user has
 * @param requiredPermissions - Array of permissions to check (user needs all)
 * @returns true if the user has all of the required permissions
 * 
 * @example
 * hasAllPermissions(["users:read", "users:write"], ["users:read", "users:write"]) // true
 * hasAllPermissions(["users:*"], ["users:read", "users:write"]) // true
 * hasAllPermissions(["users:read"], ["users:read", "users:write"]) // false
 */
export function hasAllPermissions(
  userPermissions: Permissions,
  requiredPermissions: Permissions
): boolean {
  if (!userPermissions || userPermissions.length === 0) {
    return false;
  }

  if (!requiredPermissions || requiredPermissions.length === 0) {
    return true; // No permissions required
  }

  return requiredPermissions.every((required) =>
    hasPermission(userPermissions, required)
  );
}

/**
 * Checks if a user has a permission and throws an error if not
 * Useful for API routes and server-side permission checking
 * 
 * @param userPermissions - Array of permissions the user has
 * @param requiredPermission - The permission to check for
 * @param errorMessage - Optional custom error message
 * @throws Error if the user doesn't have the required permission
 * 
 * @example
 * checkPermission(userPerms, "users:delete") // throws if not allowed
 * checkPermission(userPerms, "users:delete", "Cannot delete users") // custom error
 */
export function checkPermission(
  userPermissions: Permissions,
  requiredPermission: Permission,
  errorMessage?: string
): void {
  if (!hasPermission(userPermissions, requiredPermission)) {
    throw new Error(
      errorMessage || `Permission denied: ${requiredPermission} is required`
    );
  }
}

/**
 * Checks if a user has a permission and returns detailed result
 * Useful when you need to know why permission was granted or denied
 * 
 * @param userPermissions - Array of permissions the user has
 * @param requiredPermission - The permission to check for
 * @returns Object with granted status and optional reason
 * 
 * @example
 * const result = checkPermissionDetailed(userPerms, "users:delete")
 * if (result.granted) {
 *   // Allow action
 * } else {
 *   console.log(result.reason) // "Permission denied: users:delete is required"
 * }
 */
export function checkPermissionDetailed(
  userPermissions: Permissions,
  requiredPermission: Permission
): PermissionCheckResult {
  if (!userPermissions || userPermissions.length === 0) {
    return {
      granted: false,
      reason: 'User has no permissions',
    };
  }

  if (!requiredPermission) {
    return {
      granted: false,
      reason: 'No permission specified',
    };
  }

  const granted = hasPermission(userPermissions, requiredPermission);

  return {
    granted,
    reason: granted
      ? undefined
      : `Permission denied: ${requiredPermission} is required`,
  };
}

/**
 * Helper to create permission strings
 * 
 * @param resource - The resource name
 * @param action - The action to perform
 * @returns Permission string in format "resource:action"
 * 
 * @example
 * createPermission("users", "read") // "users:read"
 * createPermission("posts", "*") // "posts:*"
 */
export function createPermission(resource: string, action: string): Permission {
  return `${resource}:${action}`;
}
