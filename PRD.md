# 제품 요구 사항 정의서 (PRD: Product Requirements Document)

## 1. 프로젝트 개요
- **프로젝트명**: 더와이즈 치과병원 연차 관리 시스템 (Dental Leave System)
- **목적**: 더와이즈 치과병원 직원(약 80명)의 연차 신청, 승인, 잔액 관리를 효율적으로 자동화하고 투명하게 운영하기 위한 웹 기반 시스템.
- **주요 타겟**: 치과병원 전 직원 (일반 사용자, 관리자, 뷰어)

## 2. 주요 기능 요구 사항

### 2.1. 사용자 인증 및 권한
- **로그인/로그아웃**: Supabase Auth를 이용한 보안 인증.
- **권한 체계 (Role-Based Access Control)**:
  - `ADMIN`: 시스템 전체 관리, 연차 승인/취소, 사용자 관리, 설정 변경 가능.
  - `USER`: 본인의 연차 현황 조회, 연차 신청, 본인의 이력 확인 가능.
  - `VIEW`: 전체 직원의 연차 현황 조회 가능 (읽기 전용).

### 2.2. 대시보드 (Dashboard)
- **팀원 연차 현황**: 달력 또는 리스트 형태로 현재 및 예정된 연차 현황 표시.
- **개인 통계**: 사용/예약/잔여 연차 정보를 요약하여 제공.
- **조직별 필터링**: 소속 그룹별로 팀원의 연차 현황을 구분하여 조회 가능.

### 2.3. 연차 신청 및 관리 (Leave Management)
- **신청 (Request)**:
  - 유형: 종일(FULL), 반차(HALF - 오전/오후).
  - 제한: 일요일 신청 불가, 잔여 연차 초과 신청 불가, 중복 날짜 신청 제한.
- **승인 (Approval)**:
  - 관리자가 신청된 연차를 승인하거나 반려.
  - 승인 시 FIFO(First-In-First-Out) 원칙에 따라 가장 오래된(만료일이 가까운) 연차부터 자동 차감.
- **자동 승인**: 신청일이 현재일 이전이거나 당일인 경우 즉시 승인 처리 로직 포함.
- **취소 (Cancellation)**:
  - 예약 상태(RESERVED)인 경우 사용자/관리자 모두 취소 가능.
  - 사용 완료(USED) 상태인 경우 관리자만 취소(복구) 가능.

### 2.4. 설정 및 관리자 기능 (Settings)
- **사용자 관리**: 신규 사용자 등록, 정보 수정, 상태(재직/퇴사 등) 관리.
- **연차 잔액 수동 조정**: 관리자가 특정 사용자의 연차 잔액을 직접 수정 가능.
- **시스템 설정**: 병원 정책에 따른 기본 연차 설정 등.

## 3. 기술 스택 및 인프라

### 3.1. Frontend
- **Framework**: React 19.2.0 (TypeScript 5.9.3)
- **Build Tool**: Vite 6.0.0
- **Routing**: React Router 7.13.0
- **State Management**: Zustand 5.0.10
- **Styling**: Tailwind CSS 4.1.18, Radix UI 3.2.1
- **Icons**: Lucide React 0.562.0
- **Form Management**: React Hook Form 7.71.1

### 3.2. Backend & Database (Supabase)
- **Database**: PostgreSQL
- **Authentication**: Supabase Auth
- **Business Logic**: PostgreSQL Functions (PL/pgSQL) 및 Triggers
- **Security**: Row Level Security (RLS) 정책 적용
- **Automation**: pg_cron을 이용한 미결 연차 자동 승인 처리 (매일 00:00 KST)

## 4. 데이터 모델 및 정책

### 4.1. 데이터 단위 정책
- **INTEGER 기반 저장**: 소수점 연산 오차 방지를 위해 모든 연차 수치는 10배수 정수로 저장.
  - 1.0일 → `10`
  - 0.5일 → `5`
- **표시용 View**: `leave_balances_display` 등 뷰를 통해 UI에서는 1.0, 0.5 단위로 변환하여 제공.

### 4.2. 주요 테이블 구조
- **`users`**: 사용자 프로필 (ID, 이름, 입사일, 그룹, 권한, 상태).
- **`leave_balances`**: 연도별 연차 발생/사용/잔액 관리.
- **`leave_reservations`**: 연차 신청 및 예약 상태 관리.
- **`leave_history`**: 승인 완료된 연차의 상세 차감 이력 (FIFO 대응).

### 4.3. 연차 산정 정책
- **기본 발생**: 연 15일 (정책에 따라 가변).
- **근속 가산**: 입사일 기준 근속 연수에 따른 추가 연차 부여 로직 지원.
- **FIFO 차감**: 만료일이 가장 빠른 연차부터 우선 소진.

## 5. 프로젝트 구조

```
src/
├── api/                # 외부 API 정의 (필요 시)
├── components/         # 재사용 가능한 UI 컴포넌트
│   ├── auth/           # 인증 및 권한 가드
│   ├── common/         # 공통 컴포넌트
│   ├── dashboard/      # 대시보드 전용 컴포넌트
│   └── layout/         # 레이아웃 (Header, Nav, Layout)
├── data/               # 샘플 및 초기 데이터
├── hooks/              # 커스텀 훅 (useUserProfile 등)
├── lib/
│   └── supabase/       # Supabase 클라이언트 및 DB 함수 정의
├── pages/              # 페이지 단위 컴포넌트
│   ├── Dashboard/      # 연차 현황판
│   ├── LeaveRequest/   # 신청 페이지
│   ├── LeaveApproval/  # 관리자 승인 페이지
│   ├── Settings/       # 시스템 및 사용자 설정
│   └── Login/          # 인증 페이지
├── router/             # 라우팅 설정
├── store/              # Zustand 상태 저장소
├── types/              # TypeScript 인터페이스/타입 정의
└── utils/              # 유틸리티 함수 및 상수
```

## 6. 보안 정책 (RLS)
- **사용자**: 본인의 데이터만 조회/수정 가능.
- **관리자(ADMIN)**: 모든 데이터에 대한 CRUD 권한 보유.
- **뷰어(VIEW)**: 모든 데이터에 대한 조회(Select) 권한만 보유.
- **비인증 사용자**: 모든 데이터 접근 차단.
