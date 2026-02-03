# ARCHITECTURE.md - 시스템 설계 결정사항

> **목적**: 시스템 설계 결정과 아키텍처 패턴의 단일 기준 문서.

## 기술 스택

### 프론트엔드 핵심
| 패키지 | 버전 | 용도 |
|---------|---------|---------|
| React | 19.2.0 | UI 프레임워크 |
| TypeScript | 5.9.3 | 타입 안정성 |
| Vite | 6.0.0 | 빌드 도구 |
| React Router | 7.13.0 | 라우팅 |

### 백엔드 & 데이터베이스
- **Supabase** - BaaS (Backend as a Service)
  - PostgreSQL 데이터베이스
  - Supabase Auth (인증)
  - Row Level Security (RLS)
  - RPC Functions (PL/pgSQL)

### UI/스타일링
| 패키지 | 용도 |
|---------|---------|
| Radix UI Themes 3.2.1 | 접근성 컴포넌트 |
| Tailwind CSS 4.1.18 | 유틸리티 우선 CSS |
| Lucide React 0.562.0 | 아이콘 |
| FullCalendar 6.1.20 | 캘린더 UI |

### 상태 관리
- **Zustand 5.0.10** - 인증 상태 (localStorage 지속화)
- **React Hook Form 7.71.1** - 폼 상태

### 코드 품질
- **Biome 2.3.11** - Linter & Formatter (ESLint/Prettier 사용 금지)
- **Vitest 4.0.18** - 테스트
- **Babel React Compiler 1.0.0** - 자동 최적화
- **date-fns** - 날짜 및 시간 처리

---

## 레이어 아키텍처

```
+------------------+
|    UI Layer      |  React 컴포넌트 (pages/, components/)
+------------------+
        |
+------------------+
|   State Layer    |  Zustand (authStore), React Hook Form
+------------------+
        |
+------------------+
|    API Layer     |  src/lib/supabase/api/ (auth, leave, user, nightShift)
+------------------+
        |
+------------------+
|  Supabase Layer  |  RPC Functions, RLS Policies
+------------------+
        |
+------------------+
|   PostgreSQL     |  Tables, Triggers, pg_cron
+------------------+
```

### API 레이어 패턴

모든 DB 작업은 `src/lib/supabase/api/`를 통해 수행합니다:
- `auth.ts` - 인증 작업
- `leave.ts` - 연차 관리 (예약, 승인, 취소)
- `user.ts` - 사용자 프로필 작업
- `nightShift.ts` - 야간 근무 기록/통계

**규칙**: 컴포넌트에서 Supabase를 직접 호출하지 않습니다. 항상 API 레이어를 사용하세요.

---

## 데이터베이스 설계 철학

### INTEGER 기반 저장 (중요)

모든 연차 값은 부동소수점 오류 방지를 위해 INTEGER x10으로 저장합니다:

| 표시 | 저장 |
|---------|---------|
| 1.0일 | `10` |
| 0.5일 | `5` |
| 17.5일 | `175` |

**변환**: UI는 표시 시 10으로 나누고, RPC 함수가 변환을 처리합니다.

### FIFO 차감 원칙

연차는 가장 오래된 잔여분(만료일이 빠른 순)부터 차감됩니다:

```
approve_leave(reservation_id) {
  1. Find leave_balances ordered by expire_at ASC
  2. Deduct from first available balance
  3. Record source_year in leave_history
  4. Update reservation status to 'USED'
}
```

### 핵심 RPC 함수

| 함수 | 목적 |
|----------|---------|
| `get_user_leave_status(user_id)` | 잔여 연차 조회 |
| `reserve_leave(user_id, date, type, session)` | 예약 생성 |
| `approve_leave(reservation_id)` | FIFO 차감 승인 |
| `cancel_leave(reservation_id)` | 예약 취소 |
| `cancel_leave_history(history_id)` | 관리자: 사용분 되돌리기 |

---

## 인증 & 인가

### 인증 흐름

```
AuthProvider (session init)
    |
    v
authStore (Zustand + localStorage)
    |
    +---> ProtectedRoute (auth check)
    |
    +---> RoleRoute (role check: ADMIN/USER/VIEW)
```

### 역할 권한

| 역할 | 권한 |
|------|-------------|
| **ADMIN** | 전체 접근, 연차 승인/취소, 사용자 관리, 설정 |
| **USER** | 본인 데이터만, 연차 신청, 본인 이력 조회 |
| **VIEW** | 모든 연차 데이터 읽기 전용 |

### 보안 계층

1. **RLS 정책** (DB 레벨) - 데이터 접근 제어
2. **RoleRoute** (프론트엔드 레벨) - 비인가 접근 차단
3. **API 레이어** (애플리케이션 레벨) - 호출 전 검증

---

## 핵심 패턴

### 1. RPC-우선 접근

복잡한 비즈니스 로직은 프론트엔드가 아닌 PostgreSQL 함수에 위치합니다:
- 연차 계산
- FIFO 차감
- 상태 전이
- 통계 집계

### 2. 단일 진실의 원천

- 인증 상태: `authStore`만 사용
- 연차 데이터: API에서 항상 최신 조회
- 사용자 프로필: `authStore.userProfile`에 캐시

### 3. 타입 생성

스키마에서 DB 타입 자동 생성:
```bash
npx supabase gen types typescript --project-id <ID> > src/lib/supabase/types/database.types.ts
```

### 4. 환경 분리

| 환경 | Env 파일 | 사용 목적 |
|-------------|----------|----------|
| Development | `.env.local` | 로컬 개발 |
| QA | `.env.qa` | 테스트 |
| Production | `.env.production` | 운영 |

---

## 관련 문서

- [schema.sql](src/lib/supabase/schema.sql) - RLS/RPC 포함 전체 스키마
- [DEVELOPMENT.md](DEVELOPMENT.md) - 코딩 컨벤션 및 워크플로우
- [CLAUDE.md](CLAUDE.md) - 개발 명령어 및 주의사항
