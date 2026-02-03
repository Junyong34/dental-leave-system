# 더와이즈 치과병원 연차 관리 시스템

> **💡 이 문서는**: 프로젝트를 **빠르게 시작**하기 위한 가이드입니다.
>
> **상세한 정보**는 아래 문서들을 참조하세요.

더와이즈 치과병원 직원(약 80명)의 연차를 효율적으로 관리하기 위한 웹 기반 시스템입니다.

## 📚 문서 링크

### 개발자를 위한 문서
- **[AGENTS.md](AGENTS.md)** - 프로젝트 전체 구조 및 아키텍처 (마스터 문서)
- **[CLAUDE.md](CLAUDE.md)** - Claude Code 개발 가이드
- **[src/lib/supabase/schema.sql](src/lib/supabase/schema.sql)** - 완전한 데이터베이스 스키마

### 비즈니스 & 기획 문서
- **[PRD.md](PRD.md)** - 제품 요구 사항 정의서

### 기능별 상세 문서
- **[docs/pages/ROUTES.md](docs/pages/ROUTES.md)** - 전체 라우트 인덱스
- **[docs/pages/LeaveCalendar-PRD.md](docs/pages/LeaveCalendar-PRD.md)** - 캘린더 기능 상세
- **[docs/pages/NightShift-PRD.md](docs/pages/NightShift-PRD.md)** - 야간 진료 기능 상세

---

## 주요 기능

- **연차 관리**: 신청/승인/취소 with FIFO 차감
- **캘린더 뷰**: FullCalendar 기반 시각화
- **야간 진료 통계**: 직원별 야간 근무 요일 통계
- **대시보드**: 팀원별 연차 현황 (ADMIN)
- **권한 관리**: ADMIN/USER/VIEW 역할 기반 접근 제어

**상세 기능 설명**: [PRD.md](PRD.md) 참조

## 기술 스택

- **Frontend**: React 19 + TypeScript 5.9 + Vite 6
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **UI**: Tailwind CSS + Radix UI
- **Code Quality**: Biome (NOT ESLint/Prettier)

**완전한 기술 스택**: [AGENT.md - Tech Stack](AGENTS.md#기술-스택) 참조

## 프로젝트 구조 (요약)

```
src/
├── components/auth/    # AuthProvider, ProtectedRoute, RoleRoute
├── lib/supabase/       # Supabase 통합 (client, API, schema)
├── pages/              # 페이지 컴포넌트 (Dashboard, LeaveRequest 등)
├── store/              # Zustand authStore
└── router/             # React Router 설정
```

**완전한 프로젝트 구조**: [AGENT.md - Project Structure](AGENTS.md#프로젝트-구조) 참조

## 데이터베이스 구조 (요약)

### 주요 테이블
- `users` - 사용자 프로필 (role, status)
- `leave_balances` - 연도별 연차 (INTEGER × 10 저장)
- `leave_reservations` - 연차 신청
- `leave_history` - 사용 이력 (FIFO tracking)
- `employees` - 야간 진료 직원 (user_id nullable)
- `night_shift_records` - 야간 근무 기록

### 주요 RPC 함수
- `get_user_leave_status(user_id)` - 연차 현황 조회
- `reserve_leave(user_id, date, type, session)` - 연차 신청
- `approve_leave(reservation_id)` - 승인 + FIFO 차감
- `get_night_shift_stats(employee_id, year, month)` - 야간 진료 통계

**완전한 데이터베이스 스키마**: [src/lib/supabase/schema.sql](src/lib/supabase/schema.sql) 참조

## 환경 설정

### 환경 변수

프로젝트 루트에 `.env` 파일을 생성하세요:

```bash
# .env.development
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-anon-key

# .env.qa
VITE_SUPABASE_URL=https://your-qa-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-qa-anon-key

# .env.production
VITE_SUPABASE_URL=https://your-prod-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-prod-anon-key
```

### 실행 방법

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행
pnpm dev          # development 환경
pnpm dev:qa       # QA 환경

# 빌드
pnpm build        # development 빌드
pnpm build:qa     # QA 빌드
pnpm build:prod   # production 빌드

# 프리뷰
pnpm preview
pnpm preview:qa
pnpm preview:prod

# 린트 & 포맷
pnpm lint         # 린트 검사
pnpm lint:fix     # 린트 자동 수정
pnpm format       # 코드 포맷팅

# 테스트
pnpm test         # 테스트 실행
pnpm test:ui      # 테스트 UI
pnpm test:coverage # 커버리지
```

## 주요 API 사용 예시

### 인증

```typescript
import { useAuthStore } from '@/store/authStore'

function LoginPage() {
  const { login, isAuthenticated, user } = useAuthStore()

  const handleLogin = async () => {
    const success = await login('user@example.com', 'password')
    if (success) {
      console.log('로그인 성공')
    }
  }
}
```

### 연차 조회

```typescript
import { getUserLeaveStatus } from '@/lib/supabase/api/leave'

const result = await getUserLeaveStatus('U001')
if (result.success && result.data) {
  console.log('잔여 연차:', result.data.remain)
}
```

### 연차 신청

```typescript
import { reserveLeave } from '@/lib/supabase/api/leave'

const result = await reserveLeave('U001', '2025-12-25', 'FULL', null)
if (result.success) {
  console.log('연차 신청 완료')
}
```

## 타입 생성

Supabase CLI로 데이터베이스 타입을 자동 생성:

```bash
npx supabase gen types typescript --project-id <PROJECT_ID> > src/lib/supabase/types/database.types.ts
```

## 라이선스

MIT
