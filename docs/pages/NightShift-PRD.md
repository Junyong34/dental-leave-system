# 야간 근무 관리 시스템 PRD

## 개요

직원별 야간 근무 요일을 기록하고 통계를 제공하여, 관리자가 특정 요일에 편중되지 않도록 공평하게 야간 근무를 할당할 수 있도록 지원하는 시스템입니다.

## 비즈니스 요구사항

### 배경
- 현재 치과는 주 3일 야간 진료를 운영 (예: 화요일, 수요일, 목요일)
- 야간 진료 요일은 고정되지 않고 변경될 수 있음 (예: 화수목 → 월수금)
- 직원별 야간 근무 요일을 추적하여 공평한 배분이 필요
- 약 80명의 직원이 있으며, 모든 직원이 회원가입을 하지 않을 수 있음

### 핵심 목표
1. 직원별 야간 근무 기록을 저장하고 관리
2. 월별/연도별 요일 통계를 제공하여 관리자가 공평한 배분을 확인
3. 야간 진료 요일 변경에 유연하게 대응 가능한 구조
4. 회원가입 없이도 직원 추가 가능, 추후 계정 연동 지원

## 기능 명세

### 1. 직원 관리 (Employee Management)

#### 1.1 직원 등록
- 회원가입 없이 직원 정보 등록 가능
- 필수 정보: 이름
- 선택 정보: user_id (추후 회원가입 시 연동)

#### 1.2 직원-계정 연동
- 직원이 회원가입 후 기존 직원 데이터와 연동
- user_id를 employees 테이블에 업데이트

#### 1.3 직원 상태 관리
- ACTIVE: 재직 중
- INACTIVE: 퇴사/휴직

### 2. 야간 근무 설정 (Night Shift Configuration)

#### 2.1 야간 요일 설정
- 야간 진료를 실시하는 요일을 관리자가 설정
- 요일별 활성화/비활성화 가능
- 예시: 화수목 활성화 → 월수금으로 변경

#### 2.2 설정 변경 이력
- 야간 요일 변경 시 과거 기록에 영향 없음
- 새로운 야간 근무 기록은 현재 설정 기준으로 저장

### 3. 야간 근무 기록 (Night Shift Records)

#### 3.1 기록 등록
- 관리자가 날짜와 직원을 선택하여 야간 근무 기록 생성
- 자동으로 요일 계산 및 저장
- 중복 기록 방지 (같은 직원, 같은 날짜)

#### 3.2 기록 수정/삭제
- 잘못 입력된 기록을 수정/삭제 가능
- ADMIN 권한만 가능

### 4. 통계 조회 (Statistics)

#### 4.1 월별 통계
- 특정 직원의 특정 연도-월 야간 근무 요일별 횟수
- 예시: 2025년 2월 → 화요일 3회, 수요일 2회, 목요일 4회

#### 4.2 연도별 통계
- 특정 직원의 특정 연도 전체 야간 근무 요일별 누적 횟수
- 예시: 2025년 → 화요일 15회, 수요일 18회, 목요일 20회

#### 4.3 전체 직원 통계 비교
- 모든 직원의 월별/연도별 통계를 한눈에 비교
- 특정 요일에 편중된 직원을 시각적으로 확인

## 데이터베이스 설계

### 테이블 구조

#### 1. employees
```sql
CREATE TABLE employees (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**특징:**
- `user_id`는 nullable → 회원가입 없이 직원 추가 가능
- 추후 회원가입 시 `user_id` 업데이트로 연동
- `status`로 재직/퇴사 관리

#### 2. night_shift_config
```sql
CREATE TABLE night_shift_config (
  id BIGSERIAL PRIMARY KEY,
  weekday TEXT NOT NULL CHECK (weekday IN ('MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(weekday)
);
```

**특징:**
- 야간 진료 요일을 동적으로 관리
- 요일 변경 시 테이블 구조 변경 불필요
- `is_active`로 활성/비활성 토글

#### 3. night_shift_records
```sql
CREATE TABLE night_shift_records (
  id BIGSERIAL PRIMARY KEY,
  employee_id BIGINT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  work_date DATE NOT NULL,
  weekday TEXT NOT NULL CHECK (weekday IN ('MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, work_date)
);
```

**특징:**
- 실제 야간 근무 기록 저장
- `weekday`는 `work_date`에서 자동 계산
- UNIQUE 제약으로 중복 방지

### RPC 함수

#### 1. get_night_shift_stats
```sql
CREATE OR REPLACE FUNCTION get_night_shift_stats(
  p_employee_id BIGINT,
  p_year INTEGER,
  p_month INTEGER DEFAULT NULL
)
RETURNS jsonb;
```

**반환값 예시:**
```json
{
  "TUE": 3,
  "WED": 2,
  "THU": 4
}
```

#### 2. get_all_employees_stats
```sql
CREATE OR REPLACE FUNCTION get_all_employees_stats(
  p_year INTEGER,
  p_month INTEGER DEFAULT NULL
)
RETURNS TABLE (
  employee_id BIGINT,
  employee_name TEXT,
  stats JSONB
);
```

**반환값 예시:**
```json
[
  {
    "employee_id": 1,
    "employee_name": "홍길동",
    "stats": {"TUE": 3, "WED": 2, "THU": 4}
  },
  {
    "employee_id": 2,
    "employee_name": "김철수",
    "stats": {"TUE": 4, "WED": 3, "THU": 2}
  }
]
```

## 화면 설계

### 1. 야간 근무 통계 페이지 (`/night-shift-stats`)

#### 레이아웃
- **상단 필터:**
  - 연도 선택 (현재 년도 기본)
  - 월 선택 (전체/1월~12월)
  - 직원 선택 (전체/개별 직원)

- **통계 카드:**
  - 직원별 카드 표시
  - 요일별 횟수를 막대 그래프 또는 숫자로 표시
  - 가장 많이 근무한 요일 하이라이트

#### 기능
- 필터 변경 시 실시간 통계 업데이트
- 특정 직원 클릭 시 상세 기록 확인
- CSV 내보내기

### 2. 야간 근무 관리 페이지 (`/settings/night-shift`)

#### 섹션 1: 야간 요일 설정
- 요일별 활성화/비활성화 토글
- 현재 활성화된 요일 표시
- 변경 이력 표시

#### 섹션 2: 직원 관리
- 직원 목록 (이름, 연동 상태, 상태)
- 직원 추가 버튼 → 이름 입력하여 생성
- 직원 편집 → 이름 수정, 상태 변경
- 직원 삭제 (연관된 야간 근무 기록도 삭제)

#### 섹션 3: 야간 근무 기록 관리
- 달력 또는 날짜 선택기
- 직원 다중 선택 (한 날짜에 여러 직원 배정)
- 기록 추가/삭제
- 기존 기록 표시 (날짜별로 표시)

## 권한 정책

### RLS (Row Level Security)

#### employees
- SELECT: 모든 인증된 사용자
- INSERT/UPDATE/DELETE: ADMIN만

#### night_shift_config
- SELECT: 모든 인증된 사용자
- INSERT/UPDATE/DELETE: ADMIN만

#### night_shift_records
- SELECT: 모든 인증된 사용자
- INSERT/UPDATE/DELETE: ADMIN만

### RPC 함수 권한
- `get_night_shift_stats`: 모든 인증된 사용자
- `get_all_employees_stats`: 모든 인증된 사용자
- 등록/수정/삭제 RPC: ADMIN만

## API 설계

### TypeScript API Layer (`src/lib/supabase/api/nightShift.ts`)

```typescript
// 직원 관리
export async function getAllEmployees(status?: 'ACTIVE' | 'INACTIVE')
export async function createEmployee(name: string)
export async function updateEmployee(id: number, data: Partial<Employee>)
export async function deleteEmployee(id: number)
export async function linkEmployeeToUser(employeeId: number, userId: string)

// 야간 요일 설정
export async function getNightShiftConfig()
export async function updateNightShiftConfig(weekday: string, isActive: boolean)

// 야간 근무 기록
export async function createNightShiftRecord(employeeId: number, workDate: string)
export async function deleteNightShiftRecord(id: number)
export async function getNightShiftRecords(employeeId?: number, startDate?: string, endDate?: string)

// 통계
export async function getNightShiftStats(employeeId: number, year: number, month?: number)
export async function getAllEmployeesStats(year: number, month?: number)
```

## 라우팅

### 추가 라우트
```typescript
// src/router/index.tsx
{
  path: 'night-shift-stats',
  element: <NightShiftStats />, // 모든 인증된 사용자
},
{
  path: 'settings',
  element: <RoleRoute requiredRoles={['ADMIN']}><Settings /></RoleRoute>,
  children: [
    // ... 기존 라우트
    {
      path: 'night-shift',
      element: <NightShiftManagement />,
    },
  ],
}
```

### 네비게이션 추가
```typescript
// src/components/layout/Navigation.tsx
{
  to: '/night-shift-stats',
  label: '야간 근무 통계',
  icon: Moon, // lucide-react
},
```

## 구현 우선순위

1. **Phase 1: 데이터베이스 구축**
   - employees, night_shift_config, night_shift_records 테이블 생성
   - RPC 함수 작성
   - RLS 정책 적용

2. **Phase 2: API Layer**
   - `src/lib/supabase/api/nightShift.ts` 작성
   - TypeScript 타입 정의

3. **Phase 3: UI 구현**
   - 야간 근무 통계 페이지
   - 설정 페이지 (야간 근무 관리 섹션)

4. **Phase 4: 테스트 & 최적화**
   - 샘플 데이터 생성
   - 통계 성능 최적화
   - 반응형 디자인 확인

## 확장 가능성

### 향후 추가 기능
- 야간 근무 자동 배정 알고리즘 (공평 배분)
- 직원별 선호 요일 설정
- 야간 근무 교대 요청 기능
- 야간 근무 수당 계산 연동
- 알림 기능 (다음 주 야간 근무 직원에게 알림)

## 기술 스택

- **Backend:** Supabase (PostgreSQL + RLS + RPC)
- **Frontend:** React 19 + TypeScript + Radix UI
- **State:** React Query (서버 상태) + Zustand (클라이언트 상태)
- **Styling:** Tailwind CSS

## 참고 문서

- [CLAUDE.md](../../CLAUDE.md) - 프로젝트 전체 구조
- [schema.sql](../../src/lib/supabase/schema.sql) - 기존 데이터베이스 스키마
- [README.ko.md](./README.ko.md) - 기존 페이지 라우트 문서
