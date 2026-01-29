# 더와이즈 치과병원 연차 관리 시스템

더와이즈 치과병원 직원(약 80명)의 연차를 효율적으로 관리하기 위한 웹 기반 시스템입니다.

## 관련 문서

- [제품 요구 사항 정의서 (PRD.md)](PRD.md)
- [데이터베이스 스키마 상세](src/lib/supabase/schema.sql)

## 주요 기능

- **대시보드**: 팀원별 연차 현황 조회 및 통계 (사용/예약/잔여 연차)
- **연차 신청**: 종일/반차(오전/오후) 신청
- **연차 승인**: 관리자 승인 기능
- **사용 이력**: 개인별 연차 사용 내역 조회
- **권한 관리**: ADMIN/USER/VIEW 역할 기반 접근 제어
- **인증 시스템**: Supabase 기반 로그인/로그아웃

## 기술 스택

### Frontend
- **React** 19.2.0 + **TypeScript** 5.9.3
- **Vite** 6.0.0 (빌드 도구)
- **React Router** 7.13.0 (라우팅)
- **Zustand** 5.0.10 (전역 상태 관리)

### Backend & Database
- **Supabase** - BaaS (Backend as a Service)
  - PostgreSQL 데이터베이스
  - 인증 시스템 (Auth)
  - Row Level Security (RLS)
  - RPC 함수 지원

### UI & Styling
- **Radix UI** 3.2.1 (컴포넌트)
- **Tailwind CSS** 4.1.18
- **Lucide React** 0.562.0 (아이콘)

### 개발 도구
- **Biome** 2.3.11 (린트/포맷터)
- **Vitest** 4.0.18 (테스트)
- **React Hook Form** 7.71.1 (폼 관리)

## 프로젝트 구조

```
src/
├── components/          # UI 컴포넌트
│   ├── auth/           # 인증 관련 (AuthProvider, ProtectedRoute)
│   ├── dashboard/      # 대시보드 컴포넌트 (LeaveHistoryModal 등)
│   └── layout/         # 레이아웃 (Header, Navigation, UserProfile)
├── lib/
│   └── supabase/       # Supabase 통합
│       ├── api/        # API 함수 (auth, leave, user)
│       ├── types/      # 데이터베이스 타입 정의
│       ├── client.ts   # Supabase 클라이언트
│       └── config.ts   # 환경 설정
├── pages/              # 페이지 컴포넌트
│   ├── Dashboard/      # 대시보드 (팀원 연차 현황)
│   ├── LeaveRequest/   # 연차 신청
│   ├── LeaveApproval/  # 연차 승인
│   ├── LeaveHistory/   # 사용 이력
│   ├── Settings/       # 설정
│   └── Login/          # 로그인
├── router/             # 라우터 설정
├── store/              # Zustand 스토어 (authStore)
├── types/              # TypeScript 타입 정의
├── utils/              # 유틸리티 함수
└── data/               # 샘플 데이터
```

## 데이터베이스 구조

### 주요 테이블

#### `users` - 사용자 정보
- `user_id` (PK): 사용자 ID
- `name`: 이름
- `join_date`: 입사일
- `group_id`: 소속 그룹
- `role`: 권한 (ADMIN/USER/VIEW)
- `status`: 상태 (ACTIVE/INACTIVE/RESIGNED)

#### `leave_balances` - 연차 잔액 (연도별)
- `user_id`, `year` (PK): 사용자 ID + 연도
- `total`: 해당 연도 발생 연차 (0.5 단위)
- `used`: 사용한 연차
- `remain`: 잔여 연차
- `expire_at`: 만료일

#### `leave_reservations` - 연차 예약
- `id` (PK): 예약 ID
- `user_id`: 사용자 ID
- `date`: 날짜
- `type`: FULL(종일) / HALF(반차)
- `session`: AM(오전) / PM(오후) / null
- `amount`: 1.0 or 0.5
- `status`: RESERVED / USED / CANCELLED

#### `leave_history` - 연차 사용 이력
- `id` (PK): 이력 ID
- `user_id`: 사용자 ID
- `date`: 사용일
- `type`, `session`, `amount`: 연차 정보
- `weekday`: 요일
- `source_year`: 차감된 연차의 발생 연도 (FIFO)

### RPC 함수

- `get_user_leave_status(p_user_id)`: 사용자 연차 현황 조회
- `reserve_leave(p_user_id, p_date, p_type, p_session)`: 연차 신청
- `approve_leave(p_reservation_id)`: 연차 승인 (FIFO 차감)
- `cancel_leave(p_reservation_id)`: 연차 취소

## 연차 정책

### 기본 규칙
- **기본 연차**: 연 15일
- **근속 가산**: 2년 초과 시마다 +1일, 최대 25일
- **사용 단위**: 1일(종일) 또는 0.5일(반차)
- **반차 구분**: 오전(AM) / 오후(PM)

### 이월 및 차감
- **이월**: 미사용 연차는 다음 해로 이월 (최대 2년 보관)
- **차감 방식**: FIFO (만료일이 빠른 연차부터 차감)

### 사용 제한
- 일요일 사용 불가
- 동일 그룹 동일 날짜 다수 제한
- 공휴일 근무 시 연차 1.5일 추가 지급

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
