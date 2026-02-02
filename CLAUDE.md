# CLAUDE.md - Claude Code Development Guide

> **💡 이 문서는**: Claude Code로 개발할 때 필요한 **실용적인 가이드**입니다.
>
> **프로젝트 전체 구조**는 [AGENT.md](AGENT.md)를, **비즈니스 요구사항**은 [PRD.md](PRD.md)를 참조하세요.

This file provides practical guidance for Claude Code (claude.ai/code) when working with code in this repository.

## Quick Links

- **📖 Project Structure & Architecture**: [AGENT.md](AGENT.md)
- **📋 Product Requirements**: [PRD.md](PRD.md)
- **🚀 Quick Start Guide**: [README.md](README.md)
- **🗺️ Route Index**: [docs/pages/ROUTES.md](docs/pages/ROUTES.md)
- **💾 Database Schema**: [src/lib/supabase/schema.sql](src/lib/supabase/schema.sql)

## Project Overview

Dental Leave System (더와이즈 치과병원 연차 관리 시스템) - A comprehensive web-based leave management and night shift tracking system for approximately 80 employees at a dental hospital. Built with React 19 + TypeScript + Supabase.

**Key Features:**
- Annual leave request/approval with FIFO deduction
- Full calendar view with FullCalendar library
- Night shift management and statistics
- Role-based access control (ADMIN/USER/VIEW)
- Multi-environment support (dev/qa/prod)

**For detailed tech stack and project structure**, see [AGENT.md - Tech Stack](AGENT.md#기술-스택)

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

### Tech Stack Summary

- **Frontend**: React 19 + TypeScript 5.9 + Vite 6
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **Styling**: Tailwind CSS + Radix UI
- **Code Quality**: Biome (NOT ESLint/Prettier)

**For complete tech stack details**, see [AGENT.md - Tech Stack](AGENT.md#기술-스택)

### Key Architectural Patterns

**For detailed architecture patterns**, see [AGENT.md - Architecture](AGENT.md#핵심-아키텍처)

#### Quick Reference

1. **Authentication & Authorization**
   - Auth state: `AuthProvider` → `authStore` (Zustand) → `ProtectedRoute` / `RoleRoute`
   - Roles: ADMIN (full access), USER (own data), VIEW (read-only)

2. **Supabase Integration**
   - API Layer: `src/lib/supabase/api/` (auth.ts, leave.ts, user.ts, nightShift.ts)
   - All business logic via RPC functions (never direct table updates)

3. **Database Design Principles** (Critical!)
   - **INTEGER-based storage**: All leave values × 10 (1 day = `10`, 0.5 day = `5`)
   - **FIFO deduction**: Oldest leave first via `approve_leave()` RPC
   - **RPC Functions**: Use these for all operations:
     - `get_user_leave_status(user_id)`
     - `reserve_leave(user_id, date, type, session)`
     - `approve_leave(reservation_id)` - FIFO deduction
     - `cancel_leave(reservation_id)`
     - `cancel_leave_history(history_id)` - Admin only

4. **Router Structure** - See [docs/pages/ROUTES.md](docs/pages/ROUTES.md) for complete route list
   - Public: `/login`, `/register`
   - Protected: `/`, `/calendar`, `/request`, `/approval`, `/history`, `/night-shift-stats`
   - Admin-only: `/`, `/approval`, `/settings/*`

5. **Project Structure** - See [AGENT.md - Project Structure](AGENT.md#프로젝트-구조) for complete directory tree
   - `src/components/auth/` - AuthProvider, ProtectedRoute, RoleRoute
   - `src/lib/supabase/api/` - auth.ts, leave.ts, user.ts, nightShift.ts
   - `src/lib/supabase/schema.sql` - Complete DB schema
   - `src/pages/` - One folder per route
   - `src/store/authStore.ts` - Zustand auth state with localStorage

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

#### Night Shift Management
- **employees table**: Supports employees without user accounts (`user_id` nullable)
- **night_shift_config**: Dynamic weekday configuration (MON-SAT)
- **night_shift_records**: Records with auto-calculated weekday
- **Statistics RPC functions**:
  - `get_night_shift_stats(employee_id, year, month)`: Individual employee stats
  - `get_all_employees_stats(year, month)`: All employees comparison
  - `get_active_weekdays()`: Currently active night shift days

### Important Notes

1. **Never hardcode user IDs**: Always use `auth.uid()` in RLS policies or RPC functions
2. **Always use RPC functions** for leave operations (reserve/approve/cancel) - never direct table updates
3. **Leave amounts in API responses**: Already converted to decimals (1.0, 0.5) by RPC functions
4. **Session management**: Handled automatically by Supabase + authStore persistence
5. **Path alias**: Use `@/` for absolute imports (e.g., `import { foo } from '@/lib/utils'`)
6. **Testing**: Use Vitest + happy-dom (not jsdom)
7. **Package Manager**: Always use `pnpm`, never `npm` or `yarn`
8. **Environment Files**: Different `.env.*` files for dev/qa/prod environments
9. **Night Shift Employees**: Can exist without user accounts, linked later via `user_id` update

### Common Pitfalls

- Don't bypass RLS by using service role key in client code
- Don't perform leave calculations in frontend - use `get_user_leave_status()` RPC
- Don't mutate leave_history directly - use cancel functions
- Don't forget to check role before rendering admin-only UI components
- Don't use ESLint or Prettier commands - this project uses Biome
- Don't create duplicate night shift records for same employee/date
- Don't hardcode weekday values - use RPC functions that calculate from date

### Key Files to Reference

- `AGENT.md` - Project structure and architecture overview
- `PRD.md` - Product requirements and business logic
- `README.md` - Quick start guide and API usage examples
- `docs/pages/NightShift-PRD.md` - Night shift feature specification
- `docs/pages/LeaveCalendar-PRD.md` - Calendar feature specification
- `src/lib/supabase/schema.sql` - Complete database schema with RLS and RPC functions
- `src/store/authStore.ts` - Well-documented auth state management
- `src/router/index.tsx` - Route structure and role requirements
- `src/lib/supabase/api/nightShift.ts` - Night shift API layer
