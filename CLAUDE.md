# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Dental Leave System (더와이즈 치과병원 연차 관리 시스템) - A web-based leave management system for approximately 80 employees at a dental hospital. Built with React 19 + TypeScript + Supabase.

## Development Commands

### Package Manager
This project uses `pnpm`. All dependency management should use pnpm.

### Essential Commands
```bash
# Development
pnpm dev          # Start dev server (development mode)
pnpm dev:qa       # Start dev server (QA mode)

# Build
pnpm build        # TypeScript compile + production build (development)
pnpm build:qa     # Build for QA environment
pnpm build:prod   # Build for production environment

# Preview
pnpm preview      # Preview development build
pnpm preview:qa   # Preview QA build
pnpm preview:prod # Preview production build

# Code Quality
pnpm lint         # Run Biome linter
pnpm lint:fix     # Auto-fix lint issues
pnpm format       # Format code with Biome

# Testing
pnpm test         # Run tests with Vitest
pnpm test:ui      # Open Vitest UI
pnpm test:coverage # Generate coverage report
```

### Environment Configuration
The project uses environment-specific configuration files:
- `.env.local` - Development environment (used by `dev`)
- `.env.qa` - QA environment (used by `dev:qa`, `build:qa`)
- `.env.production` - Production environment (used by `build:prod`)

Required environment variables:
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY` - Supabase anon key

## Architecture Overview

### Tech Stack
- **Frontend**: React 19.2.0 + TypeScript 5.9.3, Vite 6.0.0
- **Routing**: React Router 7.13.0
- **State Management**: Zustand 5.0.10 (global auth state)
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **Styling**: Tailwind CSS 4.1.18 + Radix UI 3.2.1
- **Code Quality**: Biome 2.3.11 (linter + formatter, NOT ESLint/Prettier)
- **Testing**: Vitest 4.0.18 + Testing Library

### Key Architectural Patterns

#### 1. Authentication & Authorization
- **Auth Provider**: `src/components/auth/AuthProvider.tsx` - Initializes session on app mount, subscribes to auth changes
- **Auth Store**: `src/store/authStore.ts` - Zustand store with localStorage persistence for auth state
- **Route Guards**:
  - `ProtectedRoute` - Requires authentication
  - `RoleRoute` - Requires specific roles (ADMIN/USER/VIEW)
- Auth state flows: AuthProvider → authStore → RoleRoute/ProtectedRoute

#### 2. Supabase Integration
- **Client**: `src/lib/supabase/client.ts` - Singleton Supabase client
- **Config**: `src/lib/supabase/config.ts` - Environment-based config
- **API Layer**: `src/lib/supabase/api/` - Organized by domain:
  - `auth.ts` - Authentication operations
  - `leave.ts` - Leave management (reservations, approvals)
  - `user.ts` - User profile operations
- **Types**: `src/lib/supabase/types/` - Database types (auto-generated from Supabase)
- **Schema**: `src/lib/supabase/schema.sql` - Complete database schema with RLS policies

#### 3. Database Design Principles
- **INTEGER-based Leave Storage**: All leave values stored as 10x integers to avoid floating-point precision issues:
  - 1 day = `10`
  - 0.5 day = `5`
- **Display Views**: `*_display` views convert integers back to decimals for UI consumption
- **FIFO Principle**: Leave deduction prioritizes oldest leave (earliest `expire_at`) via `approve_leave` RPC function
- **RPC Functions**: Business logic implemented as PostgreSQL functions:
  - `get_user_leave_status(user_id)` - Get user's leave summary
  - `reserve_leave(user_id, date, type, session)` - Create leave request
  - `approve_leave(reservation_id)` - Approve and deduct leave (FIFO)
  - `cancel_leave(reservation_id)` - Cancel pending reservation
  - `cancel_leave_history(history_id)` - Admin-only: revert used leave

#### 4. Role-Based Access Control (RBAC)
Three roles defined in `users.role`:
- **ADMIN**: Full access - manage all users, approve/cancel leaves, access settings
- **USER**: Limited access - view own data, request leave, view own history
- **VIEW**: Read-only access - view all leave data but cannot modify

RLS policies enforce access at database level via helper functions:
- `is_admin()` - Check if current user is admin
- `is_user()` - Check if current user is regular user
- `is_view()` - Check if current user is viewer

#### 5. Router Structure
Defined in `src/router/index.tsx`:
- Root route wraps all routes with `<AuthProvider>`
- Public routes: `/login`, `/register` (protected but different flow)
- Protected routes under `/`:
  - `/` - Dashboard (ADMIN only)
  - `/calendar` - Leave calendar (all authenticated)
  - `/request` - Leave request form (all authenticated)
  - `/approval` - Leave approval page (ADMIN only)
  - `/history` - Leave history (all authenticated)
  - `/settings/*` - Settings pages (ADMIN only)

### Project Structure Conventions

```
src/
├── components/
│   ├── auth/          # Authentication components (AuthProvider, ProtectedRoute, RoleRoute)
│   ├── common/        # Reusable UI components
│   ├── dashboard/     # Dashboard-specific components
│   └── layout/        # Layout components (Header, Navigation, Layout)
├── pages/             # Page-level components (one folder per route)
│   ├── Dashboard/     # Team leave overview (ADMIN)
│   ├── LeaveCalendar/ # Calendar view of leaves
│   ├── LeaveRequest/  # Leave request form
│   ├── LeaveApproval/ # Approve/reject leaves (ADMIN)
│   ├── LeaveHistory/  # User's leave history
│   ├── Settings/      # System settings (ADMIN)
│   └── Login/         # Login page
├── lib/
│   └── supabase/      # Supabase integration layer
│       ├── api/       # API functions organized by domain
│       ├── types/     # Database type definitions
│       ├── client.ts  # Supabase client singleton
│       └── schema.sql # Database schema (reference)
├── store/             # Zustand stores (currently only authStore)
├── router/            # React Router configuration
├── hooks/             # Custom React hooks (e.g., useUserProfile)
├── utils/             # Utility functions and constants
└── types/             # TypeScript type definitions
```

### Important Implementation Details

#### Leave Request Flow
1. User creates leave request via `reserve_leave()` RPC
2. If date ≤ today, auto-approves immediately
3. If date > today, status = 'RESERVED' (pending approval)
4. Admin approves via `approve_leave()` which:
   - Deducts from leave_balances using FIFO (oldest leave first)
   - Creates leave_history records tracking source_year
   - Updates reservation status to 'USED'
5. Automated approval: `pg_cron` job runs daily at 00:00 KST to approve overdue reservations

#### Leave Balance Calculation
- **Total**: Sum of all `leave_balances.total` for user
- **Used**: Sum of all `leave_balances.used` for user
- **Reserved**: Sum of pending reservations (`status='RESERVED'`)
- **Remain**: Sum of all `leave_balances.remain` for user
- UI displays these values divided by 10 (e.g., 125 → 12.5 days)

#### Type Definitions
- Database types should match `src/lib/supabase/types/database.types.ts`
- Regenerate types when schema changes: `npx supabase gen types typescript --project-id <PROJECT_ID> > src/lib/supabase/types/database.types.ts`

### Code Style

- **Linter/Formatter**: Biome only (no ESLint/Prettier)
- **Quote Style**: Single quotes for JavaScript/TypeScript
- **Semicolons**: Optional (asNeeded)
- **Indentation**: 2 spaces
- Run `pnpm lint:fix` before committing
- Biome config: `biome.json`

### Important Notes

1. **Never hardcode user IDs**: Always use `auth.uid()` in RLS policies or RPC functions
2. **Always use RPC functions** for leave operations (reserve/approve/cancel) - never direct table updates
3. **Leave amounts in API responses**: Already converted to decimals (1.0, 0.5) by RPC functions
4. **Session management**: Handled automatically by Supabase + authStore persistence
5. **Path alias**: Use `@/` for absolute imports (e.g., `import { foo } from '@/lib/utils'`)
6. **Testing**: Use Vitest + happy-dom (not jsdom)

### Common Pitfalls

- Don't bypass RLS by using service role key in client code
- Don't perform leave calculations in frontend - use `get_user_leave_status()` RPC
- Don't mutate leave_history directly - use cancel functions
- Don't forget to check role before rendering admin-only UI components
- Don't use ESLint or Prettier commands - this project uses Biome

### Key Files to Reference

- `PRD.md` - Product requirements and business logic
- `src/lib/supabase/schema.sql` - Complete database schema with RLS and RPC functions
- `src/store/authStore.ts` - Well-documented auth state management
- `src/router/index.tsx` - Route structure and role requirements
