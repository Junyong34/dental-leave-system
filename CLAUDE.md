# CLAUDE.md - Quick Reference

> **Commands, Environment, and Gotchas for Claude Code development.**
>
> **See also**: [ARCHITECTURE.md](ARCHITECTURE.md) (design), [DEVELOPMENT.md](DEVELOPMENT.md) (conventions), [AGENTS.md](AGENTS.md) (project map)

## Project Overview

**Dental Leave System** - Leave management for ~80 dental hospital employees.
- React 19 + TypeScript + Supabase
- FIFO leave deduction, role-based access (ADMIN/USER/VIEW)

---

## Codex Instructions (Read First)

- Use `pnpm` (never npm/yarn).
- Use `@/` path alias for imports.
- Use Biome only (no ESLint/Prettier).
- Never update leave tables directly; always use RPC: `reserve_leave`, `approve_leave`, `cancel_leave`, `cancel_leave_history`.
- Leave values are stored as INTEGER x10 (1 day = `10`, 0.5 day = `5`).
- Never use service role key or bypass RLS in client code.
- Protect admin UI with `RoleRoute`.
- Do not calculate leave client-side; use `get_user_leave_status()`.

---

## Development Commands

```bash
# Package Manager: pnpm (NOT npm/yarn)

# Development
pnpm dev          # Start dev server (.env.local)
pnpm dev:qa       # Start QA server (.env.qa)

# Build
pnpm build        # Development build
pnpm build:qa     # QA build
pnpm build:prod   # Production build (.env.production)

# Code Quality
pnpm lint         # Run Biome linter
pnpm lint:fix     # Auto-fix lint issues
pnpm format       # Format with Biome

# Testing
pnpm test         # Run Vitest
pnpm test:ui      # Vitest UI
pnpm test:coverage
```

---

## Environment Configuration

| File | Purpose |
|------|---------|
| `.env.local` | Development |
| `.env.qa` | QA testing |
| `.env.production` | Production |

**Required variables:**
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-anon-key
```

---

## Critical Gotchas

### Database

| Rule | Reason |
|------|--------|
| Leave values stored as INTEGER x10 | 1 day = `10`, 0.5 day = `5`. Prevents float errors. |
| Always use RPC functions for leave ops | `reserve_leave`, `approve_leave`, `cancel_leave`. Never direct table updates. |
| Never bypass RLS | Don't use service role key in client code. |
| Never hardcode user IDs | Always use `auth.uid()` in RLS/RPC. |

### Frontend

| Rule | Reason |
|------|--------|
| Use `@/` path alias | `import { x } from '@/lib/utils'` |
| Biome only | No ESLint/Prettier commands. |
| Radix gap syntax | Use `rt-r-gap-4`, not `gap-4`. |
| Check role before admin UI | Use `RoleRoute` for protection. |

### Testing

| Rule | Reason |
|------|--------|
| Vitest + happy-dom | Not jsdom. |
| Don't calculate leave in frontend | Use `get_user_leave_status()` RPC. |

---

## Key RPC Functions

```typescript
// Leave status
get_user_leave_status(user_id)

// Leave operations
reserve_leave(user_id, date, type, session)
approve_leave(reservation_id)      // FIFO deduction
cancel_leave(reservation_id)       // Cancel reservation
cancel_leave_history(history_id)   // Admin: revert used

// Night shift
get_night_shift_stats(employee_id, year, month)
get_all_employees_stats(year, month)
```

---

## Key Files

| File | Purpose |
|------|---------|
| [ARCHITECTURE.md](ARCHITECTURE.md) | Tech stack, patterns, design decisions |
| [DEVELOPMENT.md](DEVELOPMENT.md) | Coding conventions, workflows |
| [AGENTS.md](AGENTS.md) | Project structure, route table |
| [PRD.md](PRD.md) | Business requirements |
| [schema.sql](src/lib/supabase/schema.sql) | Complete DB schema |
| [authStore.ts](src/store/authStore.ts) | Auth state management |
| [ROUTES.md](docs/pages/ROUTES.md) | Route index |

---

타입 생성 절차는 `DEVELOPMENT.md`를 참고하세요.
