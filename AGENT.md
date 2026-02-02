# 치과병원 연차 관리 시스템 - 프로젝트 구조

## 📋 프로젝트 개요

더와이즈 치과병원의 약 80명 직원을 위한 웹 기반 연차 관리 시스템입니다. 법적 기준을 준수하며 연차 신청, 승인, 통계 관리, 야간 진료 기록 등의 기능을 제공합니다.

## 🛠 기술 스택

### Frontend Core
- **React** 19.2.0
- **TypeScript** 5.9.3
- **Vite** 6.0.0
- **React Router** 7.13.0

### Backend & Database
- **Supabase** - BaaS (Backend as a Service)
  - PostgreSQL 데이터베이스
  - Supabase Auth (인증 시스템)
  - Row Level Security (RLS)
  - RPC Functions (PL/pgSQL)

### UI/Styling
- **Radix UI Themes** 3.2.1 - UI 컴포넌트 라이브러리
- **Tailwind CSS** 4.1.18 - 유틸리티 우선 CSS 프레임워크
- **Lucide React** 0.562.0 - 아이콘 라이브러리
- **Class Variance Authority** 0.7.1 - 타입 안전 스타일 관리
- **clsx** 2.1.1 & **tailwind-merge** 3.4.0 - 클래스명 관리
- **FullCalendar** 6.1.20 - 캘린더 UI 라이브러리

### 폼 & 상태 관리
- **React Hook Form** 7.71.1 - 폼 상태 관리
- **Zustand** 5.0.10 - 경량 전역 상태 관리 (인증 상태)
- **date-fns** 4.1.0 - 날짜 유틸리티

### 개발 도구
- **Biome** 2.3.11 - 린터 & 포매터 (ESLint/Prettier 대체)
- **Vitest** 4.0.18 - 테스트 프레임워크
- **Testing Library** - React 컴포넌트 테스트
- **Babel React Compiler** 1.0.0 - React 컴파일러 플러그인

## 📁 프로젝트 구조

```
dental-leave-system/
├── src/
│   ├── components/
│   │   ├── auth/              # 인증 관련 컴포넌트
│   │   │   ├── AuthProvider.tsx    # 세션 초기화 및 auth 이벤트 구독
│   │   │   ├── ProtectedRoute.tsx  # 인증 라우트 보호
│   │   │   └── RoleRoute.tsx       # 권한 기반 라우트 보호
│   │   ├── common/            # 재사용 공통 컴포넌트
│   │   ├── dashboard/         # 대시보드 전용 컴포넌트
│   │   │   └── LeaveHistoryModal.tsx
│   │   └── layout/            # 레이아웃 컴포넌트
│   │       ├── Header.tsx     # 헤더
│   │       ├── Navigation.tsx # 네비게이션 메뉴
│   │       ├── Layout.tsx     # 메인 레이아웃
│   │       └── UserProfile.tsx # 사용자 프로필 드롭다운
│   ├── hooks/                 # 커스텀 React 훅
│   │   └── useUserProfile.ts  # 현재 사용자 프로필 조회
│   ├── lib/
│   │   └── supabase/          # Supabase 통합 레이어
│   │       ├── api/           # API 함수 (도메인별 분리)
│   │       │   ├── auth.ts    # 인증 관련 API
│   │       │   ├── leave.ts   # 연차 관련 API
│   │       │   ├── user.ts    # 사용자 관련 API
│   │       │   └── nightShift.ts # 야간 진료 관련 API
│   │       ├── types/         # 데이터베이스 타입 정의
│   │       │   └── database.types.ts # Supabase CLI로 자동 생성
│   │       ├── client.ts      # Supabase 클라이언트 싱글톤
│   │       ├── config.ts      # 환경별 설정
│   │       └── schema.sql     # 데이터베이스 스키마 (참조용)
│   ├── pages/                 # 페이지 컴포넌트
│   │   ├── Dashboard/         # 대시보드 (팀원 연차 현황 - ADMIN)
│   │   │   └── index.tsx
│   │   ├── LeaveCalendar/     # 연차 캘린더 (FullCalendar)
│   │   │   └── index.tsx
│   │   ├── LeaveRequest/      # 연차 신청 페이지
│   │   │   └── index.tsx
│   │   ├── LeaveApproval/     # 연차 승인 페이지 (ADMIN)
│   │   │   └── index.tsx
│   │   ├── LeaveHistory/      # 연차 내역 페이지
│   │   │   └── index.tsx
│   │   ├── NightShiftStats/   # 야간 진료 통계 페이지
│   │   │   └── index.tsx
│   │   ├── Login/             # 로그인 페이지
│   │   │   └── index.tsx
│   │   ├── UserRegistration/  # 사용자 등록 페이지
│   │   │   └── index.tsx
│   │   └── Settings/          # 설정 페이지 (ADMIN)
│   │       ├── index.tsx      # 설정 메인 (Outlet)
│   │       ├── GeneralSettings.tsx      # 일반 설정
│   │       ├── UserLeaveManagement.tsx  # 연차 수동 조정
│   │       ├── UserHistory.tsx          # 사용자 이력
│   │       └── NightShift.tsx           # 야간 진료 관리
│   ├── router/                # 라우팅 설정
│   │   └── index.tsx          # React Router 7 설정
│   ├── store/                 # 전역 상태 관리 (Zustand)
│   │   └── authStore.ts       # 인증 상태 + localStorage 영속화
│   ├── types/                 # TypeScript 타입 정의
│   │   └── nightShift.ts      # 야간 진료 관련 타입
│   ├── utils/                 # 유틸리티 함수 및 상수
│   ├── App.tsx                # 루트 컴포넌트 (RouterProvider)
│   ├── main.tsx               # 엔트리 포인트
│   └── index.css              # 글로벌 CSS (Tailwind 포함)
├── docs/
│   └── pages/                 # 기능별 PRD 문서
│       ├── LeaveCalendar-PRD.md   # 캘린더 페이지 PRD
│       ├── NightShift-PRD.md      # 야간 진료 PRD
│       └── NightShift-SETUP.md    # 야간 진료 설정 가이드
├── public/                    # 정적 파일
├── .env.local                 # 개발 환경 변수
├── .env.qa                    # QA 환경 변수
├── .env.production            # 프로덕션 환경 변수
├── biome.json                 # Biome 설정
├── components.json            # Radix UI 설정
├── index.html                 # HTML 엔트리
├── package.json
├── postcss.config.js          # PostCSS 설정
├── tailwind.config.js         # Tailwind 설정
├── tsconfig.json              # TypeScript 설정 (루트)
├── tsconfig.app.json          # 앱용 TypeScript 설정
├── tsconfig.node.json         # Node용 TypeScript 설정
├── vite.config.ts             # Vite 설정
├── AGENT.md                   # 프로젝트 구조 문서 (이 파일)
├── CLAUDE.md                  # Claude Code용 컨텍스트
├── PRD.md                     # 제품 요구 사항 정의서
└── README.md                  # 프로젝트 README
```

## 🔐 인증 및 권한 시스템

### 구현 방식
- **Supabase Auth**: 이메일/비밀번호 기반 인증
- **Zustand** + **persist** 미들웨어: 클라이언트 인증 상태 관리
- **localStorage**: 세션 영속화
- **AuthProvider**: 앱 마운트 시 세션 초기화 및 auth 이벤트 구독
- **ProtectedRoute**: 인증된 사용자만 접근 가능
- **RoleRoute**: 특정 권한(ADMIN/USER/VIEW)이 있는 사용자만 접근 가능

### 인증 스토어 (src/store/authStore.ts)
```typescript
interface AuthState {
  isAuthenticated: boolean
  user: User | null
  session: Session | null
  userProfile: UserProfile | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  setAuthState: (session: Session | null, userProfile: UserProfile | null) => void
}
```

### 권한 체계 (Role-Based Access Control)
- **ADMIN**: 시스템 전체 관리, 연차 승인/취소, 사용자 관리, 설정 변경
- **USER**: 본인의 연차 현황 조회, 연차 신청, 본인의 이력 확인
- **VIEW**: 전체 직원의 연차 현황 조회 (읽기 전용)

RLS 정책과 RoleRoute 컴포넌트가 함께 동작하여 이중 보안을 제공합니다.

## 🗺 라우팅 구조

### 라우트 설정 (src/router/index.tsx)

| 경로 | 컴포넌트 | 설명 | 권한 요구 |
|------|---------|------|----------|
| `/login` | Login | 로그인 페이지 | 공개 |
| `/register` | UserRegistration | 사용자 등록 | 인증 필요 |
| `/` | Dashboard | 대시보드 (팀원 연차 현황) | ADMIN |
| `/calendar` | LeaveCalendar | 연차 캘린더 (FullCalendar) | 인증 필요 |
| `/request` | LeaveRequest | 연차 신청 | 인증 필요 |
| `/approval` | LeaveApproval | 연차 승인 | ADMIN |
| `/history` | LeaveHistory | 연차 내역 | 인증 필요 |
| `/night-shift-stats` | NightShiftStats | 야간 진료 통계 | 인증 필요 |
| `/settings` | Settings | 설정 메인 (Outlet) | ADMIN |
| `/settings/leave-management` | UserLeaveManagement | 연차 수동 조정 | ADMIN |
| `/settings/history` | UserHistory | 사용자 이력 | ADMIN |
| `/settings/night-shift` | NightShiftManagement | 야간 진료 관리 | ADMIN |

- 모든 보호된 라우트는 `ProtectedRoute` 컴포넌트로 래핑
- ADMIN 전용 라우트는 `RoleRoute` 컴포넌트로 추가 보호
- 모든 인증된 사용자 라우트는 `Layout` 컴포넌트 내에서 렌더링

## 🎨 UI 구성

### 레이아웃 (src/components/layout/Layout.tsx:6)
- **네비게이션 바**: 상단 고정, 반응형 디자인
- **모바일 메뉴**: 햄버거 메뉴로 전환
- **사용자 정보**: 우측 상단에 사용자명 및 로그아웃 버튼
- **콘텐츠 영역**: Outlet을 통한 페이지 렌더링

### 디자인 시스템
- **Radix UI**: 접근성 우선 컴포넌트
- **Tailwind CSS**: 유틸리티 클래스 기반 스타일링
- **Lucide Icons**: 일관된 아이콘 세트

## 📦 주요 기능

### 1. 로그인 (src/pages/Login/index.tsx)
- Supabase Auth를 이용한 이메일/비밀번호 인증
- React Hook Form을 이용한 폼 유효성 검사
- 에러 메시지 표시 (Radix UI Callout)
- 로그인 성공 시 authStore 업데이트 및 리디렉션

### 2. 대시보드 (src/pages/Dashboard/index.tsx) - ADMIN 전용
- 팀원별 연차 현황 요약 (사용/예약/잔여)
- 조직(그룹)별 필터링
- 사용 예정 일정 표시
- 직원별 상세 이력 모달 (LeaveHistoryModal)
- React Router loader를 통한 데이터 프리로드

### 3. 연차 캘린더 (src/pages/LeaveCalendar/index.tsx)
- FullCalendar 라이브러리 기반 월간/주간 뷰
- 사용 완료(USED) / 사용 예정(RESERVED) 상태별 필터링
- 사용자별 색상 구분 (HSL 해시 기반)
- 날짜 클릭 시 연차 신청 Dialog
- 이벤트 클릭 시 상세 정보 Dialog
- 반응형 디자인 (모바일/PC)

### 4. 연차 신청 (src/pages/LeaveRequest/index.tsx)
- 날짜/종류(종일/반차)/세션(오전/오후) 선택
- 중복 신청 방지 및 경고
- 실시간 잔여 연차 표시
- 일요일 신청 차단
- RPC 함수 `reserve_leave()` 호출

### 5. 연차 승인 (src/pages/LeaveApproval/index.tsx) - ADMIN 전용
- 대기 중인 신청 목록 (status='RESERVED')
- 승인/반려 처리
- 승인 시 FIFO 원칙으로 자동 차감 (`approve_leave()` RPC)
- 그룹별 필터링

### 6. 연차 내역 (src/pages/LeaveHistory/index.tsx)
- 본인의 연차 사용 이력 조회 (USER)
- 전체 직원 이력 조회 (ADMIN/VIEW)
- 필터링 (날짜 범위, 사용자, 상태)
- ADMIN은 사용 완료된 연차 취소 가능 (`cancel_leave_history()` RPC)

### 7. 야간 진료 통계 (src/pages/NightShiftStats/index.tsx)
- 직원별 야간 근무 요일 통계 (월별/연도별)
- 요일별 근무 횟수 시각화
- 공평한 배분 확인용
- RPC 함수 `get_night_shift_stats()` 및 `get_all_employees_stats()` 사용

### 8. 설정 (src/pages/Settings/) - ADMIN 전용
- **일반 설정**: 시스템 기본 설정
- **연차 수동 조정**: 특정 사용자의 연차 잔액 직접 수정
- **사용자 이력**: 사용자별 변경 이력 조회
- **야간 진료 관리**:
  - 직원 추가/수정/삭제 (회원가입 없이 가능)
  - 야간 진료 요일 설정 (MON~SAT)
  - 야간 근무 기록 추가/삭제

## 🔧 개발 설정

### Path Alias (vite.config.ts:14)
```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
}
```

`@/` 경로로 `src/` 디렉토리에 절대 경로 접근 가능

### 스타일
Radix UI Themes 문법 사용 
gap-4 [X]
rt-r-gap-4 [O]

### React Compiler
Babel React Compiler 플러그인 활성화로 자동 최적화

### Biome 설정
- 린팅: `npm run lint`
- 자동 수정: `npm run lint:fix`
- 포맷팅: `npm run format`

## 🚀 실행 방법

```bash
# 패키지 매니저: pnpm 사용
pnpm install

# 개발 서버 실행
pnpm dev          # development 환경 (.env.local)
pnpm dev:qa       # QA 환경 (.env.qa)

# 빌드
pnpm build        # development 빌드
pnpm build:qa     # QA 빌드
pnpm build:prod   # production 빌드 (.env.production)

# 빌드 미리보기
pnpm preview
pnpm preview:qa
pnpm preview:prod

# 코드 품질
pnpm lint         # Biome 린트 검사
pnpm lint:fix     # Biome 린트 자동 수정
pnpm format       # Biome 코드 포맷팅
pnpm typecheck    # TypeScript 타입 검사

# 테스트
pnpm test         # Vitest 테스트 실행
pnpm test:ui      # Vitest UI 실행
pnpm test:coverage # 커버리지 리포트 생성
```

## 📊 데이터베이스 구조

### 주요 테이블

#### users - 사용자 정보
```sql
user_id UUID PRIMARY KEY (auth.users 연동)
name TEXT
join_date DATE
group_id TEXT
role TEXT (ADMIN/USER/VIEW)
status TEXT (ACTIVE/INACTIVE/RESIGNED)
```

#### leave_balances - 연차 잔액 (연도별)
```sql
user_id UUID
year INTEGER
total INTEGER (10배수: 17일 = 170)
used INTEGER
remain INTEGER
expire_at DATE
```
**중요**: 연차 값은 소수점 오차 방지를 위해 10배수 정수로 저장

#### leave_reservations - 연차 예약
```sql
id BIGSERIAL PRIMARY KEY
user_id UUID
date DATE
type TEXT (FULL/HALF)
session TEXT (AM/PM/null)
amount INTEGER (10 or 5)
status TEXT (RESERVED/USED/CANCELLED)
```

#### leave_history - 연차 사용 이력
```sql
id BIGSERIAL PRIMARY KEY
user_id UUID
date DATE
type, session, amount
weekday TEXT (요일)
source_year INTEGER (FIFO 추적용)
```

#### employees - 야간 진료 직원 (회원가입 불필요)
```sql
id BIGSERIAL PRIMARY KEY
name TEXT
user_id UUID (nullable, 추후 연동)
status TEXT (ACTIVE/INACTIVE)
```

#### night_shift_records - 야간 근무 기록
```sql
id BIGSERIAL PRIMARY KEY
employee_id BIGINT
work_date DATE
weekday TEXT (MON~SUN)
```

### 주요 RPC 함수

#### 연차 관리
- `get_user_leave_status(p_user_id)`: 사용자 연차 현황 조회
- `reserve_leave(p_user_id, p_date, p_type, p_session)`: 연차 신청
- `approve_leave(p_reservation_id)`: 연차 승인 (FIFO 차감)
- `cancel_leave(p_reservation_id)`: 예약 취소
- `cancel_leave_history(p_history_id)`: 사용 완료 연차 취소 (ADMIN)

#### 야간 진료
- `get_night_shift_stats(p_employee_id, p_year, p_month)`: 직원별 통계
- `get_all_employees_stats(p_year, p_month)`: 전체 직원 통계
- `get_active_weekdays()`: 활성화된 야간 진료 요일 조회

## 📝 연차 정책

### 발생 규칙
- 기본: 연 15일
- 근속 2년 초과 시마다 1일 증가
- 최대: 25일

### 사용 제한
- 일요일 사용 불가
- 그룹 내 동일 날짜 다수 사용 제한
- 공휴일 근무 시 1.5일 추가 지급

### 이월 규칙
- 미사용 연차 이월 가능 (최대 2년)
- 만료일 기준으로 자동 소멸

### 차감 우선순위 (FIFO)
1. 만료일이 가장 빠른 연차부터 차감
2. `approve_leave()` RPC 함수가 자동 처리
3. `leave_history.source_year`로 차감된 연차의 발생 연도 추적

## 🎯 개발 중점 사항

1. **타입 안정성**: TypeScript 엄격 모드 + Supabase 타입 자동 생성
2. **보안**: RLS (Row Level Security) + RoleRoute 이중 보안
3. **접근성**: Radix UI로 ARIA 준수
4. **반응형**: 모바일 우선 디자인
5. **성능**: React Compiler 자동 최적화
6. **코드 품질**: Biome으로 일관된 코드 스타일 (ESLint/Prettier 미사용)
7. **데이터 정합성**: INTEGER 기반 연차 저장으로 소수점 오차 방지
8. **비즈니스 로직 분리**: PostgreSQL RPC 함수로 복잡한 로직 처리

## 📚 관련 문서

- **CLAUDE.md**: Claude Code용 상세 개발 가이드
- **PRD.md**: 제품 요구 사항 정의서
- **README.md**: 프로젝트 개요 및 실행 방법
- **docs/pages/LeaveCalendar-PRD.md**: 캘린더 페이지 기능 명세
- **docs/pages/NightShift-PRD.md**: 야간 진료 관리 기능 명세
- **src/lib/supabase/schema.sql**: 데이터베이스 스키마 전체

## 📌 프로젝트 현황

### 현재 브랜치
- `main`

### 구현 완료 기능
- ✅ Supabase Auth 기반 인증 시스템
- ✅ 역할 기반 접근 제어 (ADMIN/USER/VIEW)
- ✅ 연차 신청/승인/취소 (FIFO 차감)
- ✅ 연차 캘린더 (FullCalendar)
- ✅ 대시보드 (팀원 연차 현황)
- ✅ 연차 내역 조회 및 필터링
- ✅ 야간 진료 기록 및 통계
- ✅ 연차 수동 조정 (ADMIN)
- ✅ 사용자 등록 및 관리
- ✅ 환경별 빌드 (dev/qa/prod)

### 최근 주요 업데이트
- 야간 진료 관리 시스템 추가
- Supabase RPC 응답 처리 로직 개선
- 야간 진료 중복 기록 확인 및 경고
- 직원 대량 추가 기능
- 타입 안전성 강화
