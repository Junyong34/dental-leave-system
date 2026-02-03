# AGENTS.md - Project Map

> **Project structure and file locations for AI navigation.**

## Project Overview

**Dental Leave System** (치과병원 연차 관리 시스템)
- Web-based leave management for ~80 dental hospital employees
- Annual leave request/approval with FIFO deduction
- Night shift tracking and statistics
- Role-based access control (ADMIN/USER/VIEW)

---

## Codex Instructions (Read First)

- This file (`AGENTS.md`) is the primary project map for Codex.
- Use `pnpm` (never npm/yarn).
- Use `@/` path alias for imports.
- Use Biome only (no ESLint/Prettier).
- Never update leave tables directly; always use RPC: `reserve_leave`, `approve_leave`, `cancel_leave`, `cancel_leave_history`.
- Leave values are stored as INTEGER x10 (1 day = `10`, 0.5 day = `5`).
- Never use service role key or bypass RLS in client code.
- Protect admin UI with `RoleRoute`.
- Do not calculate leave client-side; use `get_user_leave_status()`.

---

## Document Navigation

| Need | Document |
|------|----------|
| Commands, env, gotchas | [CLAUDE.md](CLAUDE.md) |
| Tech stack, architecture | [ARCHITECTURE.md](ARCHITECTURE.md) |
| Coding conventions | [DEVELOPMENT.md](DEVELOPMENT.md) |
| Business requirements | [PRD.md](PRD.md) |
| Database schema | [schema.sql](src/lib/supabase/schema.sql) |
| Route details | [ROUTES.md](docs/pages/ROUTES.md) |
| Calendar feature | [LeaveCalendar-PRD.md](docs/pages/LeaveCalendar-PRD.md) |
| Night shift feature | [NightShift-PRD.md](docs/pages/NightShift-PRD.md) |

---

## Project Structure

```
dental-leave-system/
├── src/
│   ├── components/
│   │   ├── auth/                 # Authentication components
│   │   │   ├── AuthProvider.tsx      # Session init, auth events
│   │   │   ├── ProtectedRoute.tsx    # Auth route guard
│   │   │   └── RoleRoute.tsx         # Role-based guard
│   │   ├── common/               # Reusable components
│   │   ├── dashboard/            # Dashboard-specific
│   │   │   └── LeaveHistoryModal.tsx
│   │   └── layout/               # Layout components
│   │       ├── Header.tsx
│   │       ├── Navigation.tsx
│   │       ├── Layout.tsx
│   │       └── UserProfile.tsx
│   ├── hooks/
│   │   └── useUserProfile.ts     # Current user profile hook
│   ├── lib/
│   │   └── supabase/             # Supabase integration
│   │       ├── api/              # API layer (domain-split)
│   │       │   ├── auth.ts           # Auth operations
│   │       │   ├── leave.ts          # Leave operations
│   │       │   ├── user.ts           # User operations
│   │       │   └── nightShift.ts     # Night shift operations
│   │       ├── types/
│   │       │   └── database.types.ts # Auto-generated types
│   │       ├── client.ts         # Supabase client singleton
│   │       ├── config.ts         # Environment config
│   │       └── schema.sql        # DB schema reference
│   ├── pages/                    # Page components
│   │   ├── Dashboard/            # Team leave status (ADMIN)
│   │   ├── LeaveCalendar/        # Calendar view (FullCalendar)
│   │   ├── LeaveRequest/         # Leave request form
│   │   ├── LeaveApproval/        # Approval queue (ADMIN)
│   │   ├── LeaveHistory/         # Leave history
│   │   ├── NightShiftStats/      # Night shift statistics
│   │   ├── Login/                # Login page
│   │   ├── UserRegistration/     # User registration
│   │   └── Settings/             # Admin settings
│   │       ├── index.tsx             # Settings main (Outlet)
│   │       ├── GeneralSettings.tsx
│   │       ├── UserLeaveManagement.tsx
│   │       ├── UserHistory.tsx
│   │       └── NightShift.tsx
│   ├── router/
│   │   └── index.tsx             # React Router config
│   ├── store/
│   │   └── authStore.ts          # Zustand auth state
│   ├── types/
│   │   └── nightShift.ts         # Night shift types
│   ├── utils/                    # Utility functions
│   ├── App.tsx                   # Root component
│   ├── main.tsx                  # Entry point
│   └── index.css                 # Global CSS
├── docs/
│   └── pages/                    # Feature documentation
│       ├── ROUTES.md
│       ├── LeaveCalendar-PRD.md
│       ├── NightShift-PRD.md
│       └── NightShift-SETUP.md
├── public/                       # Static files
├── .env.local                    # Dev environment
├── .env.qa                       # QA environment
├── .env.production               # Prod environment
├── biome.json                    # Biome config
├── vite.config.ts                # Vite config
├── AGENT.md                      # This file
├── ARCHITECTURE.md               # System design
├── CLAUDE.md                     # Quick reference
├── DEVELOPMENT.md                # Conventions
├── PRD.md                        # Requirements
└── README.md                     # Quick start
```

---

## Route Table

| Path | Component | Access | Description |
|------|-----------|--------|-------------|
| `/login` | Login | Public | Login page |
| `/register` | UserRegistration | Auth | User registration |
| `/` | Dashboard | ADMIN | Team leave overview |
| `/calendar` | LeaveCalendar | Auth | Calendar view |
| `/request` | LeaveRequest | Auth | Request leave |
| `/approval` | LeaveApproval | ADMIN | Approve requests |
| `/history` | LeaveHistory | Auth | Leave history |
| `/night-shift-stats` | NightShiftStats | Auth | Night shift stats |
| `/settings` | Settings | ADMIN | Settings outlet |
| `/settings/leave-management` | UserLeaveManagement | ADMIN | Manual adjustment |
| `/settings/history` | UserHistory | ADMIN | User history |
| `/settings/night-shift` | NightShiftManagement | ADMIN | Night shift config |

**Full route details**: [docs/pages/ROUTES.md](docs/pages/ROUTES.md)

---

## Database Tables

| Table | Purpose |
|-------|---------|
| `users` | User profiles (role, status, group) |
| `leave_balances` | Annual balances (INTEGER x10) |
| `leave_reservations` | Pending/used requests |
| `leave_history` | Used leave records (FIFO tracking) |
| `employees` | Night shift employees (user_id nullable) |
| `night_shift_records` | Night shift records |
| `night_shift_config` | Weekday configuration |

**Full schema**: [src/lib/supabase/schema.sql](src/lib/supabase/schema.sql)

---

## Key Files Quick Reference

| Task | File |
|------|------|
| Auth state | `src/store/authStore.ts` |
| Leave API | `src/lib/supabase/api/leave.ts` |
| Route config | `src/router/index.tsx` |
| DB schema | `src/lib/supabase/schema.sql` |
| Supabase client | `src/lib/supabase/client.ts` |
| Main layout | `src/components/layout/Layout.tsx` |
