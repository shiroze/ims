# Permission System Usage Guide

This directory contains a clean, flexible Role-Based Access Control (RBAC) system for managing user permissions.

## Quick Start

```typescript
import { hasPermission, hasAnyPermission, checkPermission } from '~/libs/api/permission';

// Check if user has a specific permission
const userPermissions = ["users:read", "posts:write"];
if (hasPermission(userPermissions, "users:read")) {
  // User can read users
}

// Check if user has ANY of the permissions
if (hasAnyPermission(userPermissions, ["users:write", "users:delete"])) {
  // User can either write or delete users
}

// Throw error if permission is missing (useful in API routes)
checkPermission(userPermissions, "users:delete"); // throws if not allowed
```

## Permission Format

Permissions use the format: `resource:action`

Examples:
- `users:read` - Can read users
- `users:write` - Can write/update users
- `users:delete` - Can delete users
- `users:*` - Can do anything with users (wildcard)
- `*` - Can do anything (super admin)

## Available Functions

### `hasPermission(userPermissions, requiredPermission)`
Checks if a user has a specific permission. Supports wildcard matching.

### `hasAnyPermission(userPermissions, requiredPermissions)`
Checks if a user has ANY of the required permissions (OR logic).

### `hasAllPermissions(userPermissions, requiredPermissions)`
Checks if a user has ALL of the required permissions (AND logic).

### `checkPermission(userPermissions, requiredPermission, errorMessage?)`
Throws an error if the user doesn't have the required permission. Useful for API routes.

### `checkPermissionDetailed(userPermissions, requiredPermission)`
Returns detailed result with granted status and reason.

### `createPermission(resource, action)`
Helper to create permission strings.

## Examples

```typescript
// Wildcard permissions
hasPermission(["users:*"], "users:delete") // true
hasPermission(["*"], "anything") // true

// Multiple permissions check
hasAnyPermission(["users:read"], ["users:read", "users:write"]) // true
hasAllPermissions(["users:read", "users:write"], ["users:read"]) // true

// API route protection
export async function DELETE(req: Request) {
  const user = await getUser();
  checkPermission(user.permissions, "users:delete");
  // ... delete logic
}
```

## TypeScript Types

All types are exported from `./types.ts`:
- `Permission` - Single permission string
- `Permissions` - Array of permissions
- `UserWithPermissions` - User object with permissions
- `Role` - Role object with permissions
- `PermissionCheckResult` - Result of permission check
