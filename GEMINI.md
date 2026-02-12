# GEMINI.md - Project Context for AI Agent

This document provides a comprehensive overview of the "Dental Leave System" project to guide the AI agent in understanding its architecture, conventions, and operational procedures.

## 1. Project Overview

- **Project Name**: 더와이즈 치과병원 연차 관리 시스템 (The Wise Dental Hospital Leave Management System)
- **Purpose**: A web-based application to efficiently manage leave (vacation days) for approximately 80 employees.
- **Key Features**: Leave application/approval/cancellation, a FullCalendar-based team leave view, night shift statistics, and a role-based dashboard for administrators.

### Technology Stack

| Category | Technology | Notes |
|---|---|---|
| **Core Frontend** | React 19, TypeScript, Vite | The foundation of the web application. Uses React Compiler. |
| **Backend (BaaS)** | Supabase | Provides PostgreSQL DB, Authentication, and serverless Functions. |
| **Routing** | React Router | Manages client-side navigation. |
| **Styling** | Tailwind CSS, Radix UI Themes, Lucide Icons| Utility-first CSS framework with a pre-built component library. |
| **State Management** | Zustand, React Hook Form | `Zustand` for global auth state; `React Hook Form` for all forms. |
| **Code Quality** | Biome, Vitest | `Biome` for linting/formatting. `Vitest` for unit/integration testing. |
| **Date/Time** | `date-fns` | Preferred library for all date manipulations. |

---

## 2. Building and Running

### Environment Setup

1.  Create an environment file (e.g., `.env.local`) from `.env.example`.
2.  Populate it with your Supabase project URL and the publishable key.
    ```env
    VITE_SUPABASE_URL=https://your-project.supabase.co
    VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-anon-key
    ```

### Key Commands

The project uses `pnpm` as the package manager.

| Command | Description |
|---|---|
| `pnpm install` | Installs all project dependencies. |
| `pnpm dev` | Starts the local development server (uses `.env.local`). |
| `pnpm dev:qa` | Starts the development server in `qa` mode. |
| `pnpm build` | Builds the application for production. |
| `pnpm test` | Runs the test suite using Vitest. |
| `pnpm lint` | Checks the code for linting errors using Biome. |
| `pnpm format` | Formats the entire codebase using Biome. |
| `pnpm typecheck`| Runs the TypeScript compiler to check for type errors. |

---

## 3. Development Conventions

### Architecture: RPC-First & Layered

The project follows a strict layered architecture. **All database interactions are forbidden in UI components.**

```
UI Layer (React Components)
↓
State Layer (Zustand, React Hooks)
↓
API Layer (`src/lib/supabase/api/*.ts`)  <- ALL DB CALLS MUST GO THROUGH HERE
↓
Supabase Backend (PostgreSQL RPC Functions & RLS)
```

- **Critical Rule**: Do not call `supabase.from(...)` directly from a component. Use the functions provided in the API layer (e.g., `import { getLeaves } from '@/lib/supabase/api/leave'`).
- **Business Logic**: Complex logic like FIFO leave deduction is implemented in PostgreSQL RPC functions, not in the frontend code.

### Database Schema & Data Integrity

- **Integer for Leave Days**: To prevent floating-point inaccuracies, all leave durations are stored as integers multiplied by 10.
  - `1.0` day is stored as `10`.
  - `0.5` days is stored as `5`.
- **Data Source**: The single source of truth for all data is the Supabase database. The frontend should always fetch fresh data.

### Code Style & Quality

- **Biome**: This project exclusively uses **Biome** for linting and formatting. Do not use ESLint or Prettier. Adhere to the rules in `biome.json` (single quotes, 80-char line width).
- **Path Aliases**: Use the `@/` alias for imports from the `src` directory (e.g., `import { MyComponent } from '@/components/MyComponent'`).
- **Import Order**:
  1.  External packages (`react`, etc.)
  2.  Internal modules (`@/`)
  3.  Relative paths (`./` or `../`)
  4.  Stylesheets

### State Management

- **Global State (Auth)**: The user's authentication status and profile are managed in a global Zustand store located at `src/store/authStore.ts`. This state is persisted to `localStorage`.
- **Form State**: All forms must use `react-hook-form`.
- **Server State**: Fetched on component mount. There is no client-side caching layer like TanStack Query.
- **Local UI State**: Use `useState` for state that is local to a single component.

### Authentication & Authorization

- **Roles**: The system uses three roles: `ADMIN`, `USER`, and `VIEW`.
- **Protection**:
  1.  `ProtectedRoute`: Ensures a user is logged in.
  2.  `RoleRoute`: Restricts access to routes based on user role.
  3.  **Row Level Security (RLS)**: PostgreSQL policies enforce data access rules at the database level, ensuring users can only access data they are permitted to see.

### Git Conventions

- **Branching & Commits**: Follow the conventions outlined in `DEVELOPMENT.md`. Commit messages should be prefixed with a type, e.g., `[feat]: Add new calendar view`.
