# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Next.js 16 admin dashboard template built with Mantine 8, TypeScript, React 19, and featuring type-safe API integration with RBAC (Role-Based Access Control). The project uses the App Router architecture and includes authentication via NextAuth & TypeORM.

## Essential Development Commands

### Development
```bash
npm run dev                 # Start development server at http://localhost:3000
npm run build               # Build production bundle
npm start                   # Start production server
npm run lint                # Run ESLint
npm run prettier            # Format all files with Prettier
```

## Architecture Overview

### Directory Structure
- **`app/`**: Next.js App Router pages and layouts
  - `[locale]/` - Locale files
    - `((auth))` - Auth layout
      - `login/` - Authentication pages
      - `reset-password/` - Reset password pages
    - `((admin))` - Admin layout
      - `dashboard/` - Dashboard variants (default)
      - `master/` - Master modules (partners, products, product-variants)
      - `transaction/` - Transaction modules (purchases, sales)
      - `report/` - Report modules (purchases, sales)
      - `setting/` - Setting modules (users, roles, permissions)
    - `layout.tsx` - Locale contain provider layout
  - `api/` - API routes
    - `auth/` - Next Auth API routes
    - `v1/` - API v1 routes
      - `partners/` - Partner API routes
      - `products/` - Product API routes
      - `product-variants/` - Product Variant API routes
      - `purchases/` - Purchase API routes
      - `sales/` - Sale API routes
      - `users/` - User API routes
      - `roles/` - Role API routes
      - `permissions/` - Permission API routes
- **`assets/`**: Assets (icons, images, etc.)
- **`components/`**: Reusable UI components (organized by feature)
- **`contexts/`**: React contexts (theme customizer, etc.)
- **`entities/`**: Entity models (partner, product, product-variant, purchase, sale, user, role, permission)
- **`helpers/`**: React providers
- **`i18n/`**: Route path definitions
- **`lib/`**: Core utilities and API integration
  - `auth.ts` - Authentication utilities
  - `stock.ts` - Stock utilities
  - `typeorm.ts` - TypeORM utilities
- **`messages/`**: Messages for i18n
- **`types/`**: Shared utility functions

### Authentication Flow
The app uses NextAuth with custom authentication:
1. **Middleware** (`proxy.ts`): Protects routes, redirects unauthenticated users
2. **Session Management**: Uses NextAuth JWT tokens with custom session data including permissions
3. **AuthProvider** (`app/[locale]/layout.tsx`): Wraps app with session context
4. Protected routes require valid session; auth pages redirect authenticated users to dashboard

### Layout System

- **Guest Layout** (`[locale]/((auth))`): For auth pages (signin, signup)
- **Main Layout** (`[locale]/((admin))`): Authenticated app layout with sidebar and header
- **Route-based selection**: Middleware and page layouts determine which to use

## Important Development Patterns

### Creating New Components
- Place in `components/[ComponentName]/`
- Include index file exporting component
- Add Storybook story if it's a reusable component
- Use Mantine components as base; import from `@mantine/core`

### Adding Routes
1. Menu path is manage in database table t_menu 
2. Create page in appropriate `app/` directory
3. Update middleware if route requires special auth handling
4. Update menu path in database table t_menu or create a seed file to insert new menu path

### Path Aliases
Use `~/` prefix for imports (configured in `tsconfig.json`):
```typescript
import { Component } from '~/components';
```

## Tech Stack Notes

- **Next.js 16**: App Router (not Pages Router)
- **Mantine 8**: UI component library - import from `@mantine/core`, `@mantine/hooks`, etc.
- **React 19**: Client components need `'use client'` directive
- **TypeScript**: Strict mode enabled
- **NextAuth**: Custom auth with JWT tokens and session management
- **useFetch** (from `@mantine/hooks`): Used for all API calls, NOT fetch/axios

## Code Style

- **Prettier** configured - run `npm run prettier` before commits
- **Biome** configured - run `npm run biome` to check
- Import order: external packages, then internal with `~/`

## Documentation References

- Full API integration guide: `docs/API_INTEGRATION.md`
- RBAC system documentation: `docs/RBAC_SYSTEM.md`
- Changelog: `CHANGELOG.md`
