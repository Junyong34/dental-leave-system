# Pages 문서 - 라우트 빠른 참조

> **💡 이 문서는**: 모든 라우트의 목적과 권한을 **빠르게 참조**하기 위한 인덱스입니다.
>
> **상세 구현**은 [AGENT.md](../../AGENT.md)를, **개발 가이드**는 [CLAUDE.md](../../CLAUDE.md)를 참조하세요.

**최종 업데이트**: 2026-02-03

## Quick Links

- **📖 Project Structure**: [AGENT.md](../../AGENT.md)
- **🔧 Development Guide**: [CLAUDE.md](../../CLAUDE.md)
- **📋 Product Requirements**: [PRD.md](../../PRD.md)

---

## 라우트 인덱스

| 경로 | 페이지 | 목적 | 권한 | 상세 문서 |
|------|--------|------|------|----------|
| `/login` | Login | 이메일/비밀번호 인증 | 공개 | - |
| `/reset-password` | ResetPassword | 비밀번호 재설정 | 공개 | - |
| `/register` | UserRegistration | 사용자 등록 | 인증 필요 | - |
| `/` | Dashboard | 팀원 연차 현황 대시보드 | ADMIN | [AGENT.md - Dashboard](../../AGENT.md#dashboard) |
| `/calendar` | LeaveCalendar | FullCalendar 기반 연차 시각화 | 인증 필요 | [LeaveCalendar-PRD.md](./LeaveCalendar-PRD.md) |
| `/request` | LeaveRequest | 연차 신청 (종일/반차) | 인증 필요 | [CLAUDE.md](../../CLAUDE.md#leave-request-flow) |
| `/approval` | LeaveApproval | 연차 승인/반려 | ADMIN | [CLAUDE.md](../../CLAUDE.md#leave-request-flow) |
| `/history` | LeaveHistory | 연차 사용 이력 조회 | 인증 필요 | - |
| `/night-shift-stats` | NightShiftStats | 야간 근무 통계 | 인증 필요 | [NightShift-PRD.md](./NightShift-PRD.md) |
| `/settings` | Settings | 시스템 설정 (index) | ADMIN | - |
| `/settings/leave-management` | UserLeaveManagement | 연차 수동 조정 | ADMIN | - |
| `/settings/signup-requests` | SignupRequests | 가입 요청 관리 | ADMIN | - |
| `/settings/history` | UserHistory | 사용자 이력 | ADMIN | - |
| `/settings/night-shift` | NightShiftManagement | 야간 진료 관리 | ADMIN | [NightShift-PRD.md](./NightShift-PRD.md) |

---

## 주요 라우트 설명

### `/` - Dashboard (ADMIN 전용)

팀원 연차 현황을 카드 형태로 보여주는 대시보드. 그룹별 필터링, 사용률 프로그레스 바, 만료 예정 연차 표시. React Router Loader로 데이터 프리로드.

**API**: `getAllUsers()`, `getUserLeaveStatus()`

### `/approval` - LeaveApproval (ADMIN 전용)

대기 중인 연차 신청 승인/반려. 승인 시 `approve_leave()` RPC로 FIFO 차감. 그룹별 필터링 지원.

**API**: `getAllLeaveReservations('RESERVED')`, `approveLeave()`, `cancelLeave()`

### `/history` - LeaveHistory

연차 사용 이력 조회. USER는 본인만, ADMIN/VIEW는 전체 조회. ADMIN은 `cancel_leave_history()`로 이력 취소 가능.

**API**: `getLeaveHistory()`, `cancelLeaveHistory()`

### `/request` - LeaveRequest

연차 신청 (종일/반차). 실시간 잔여 연차 표시, 일요일 차단, 중복 방지. 과거 날짜는 즉시 승인, 미래 날짜는 `RESERVED`.

**API**: `getUserLeaveStatus()`, `reserveLeave()`

### `/login` - Login

Supabase Email/Password 인증 및 가입 초대 요청 탭 제공. AuthProvider로 세션 자동 복원.

**API**: `useAuthStore.login()`, `getSession()`

### `/reset-password` - ResetPassword

비밀번호 재설정 링크로 진입한 사용자의 비밀번호 변경 화면. 세션 유효성 확인 후 비밀번호를 업데이트하고 로그인 화면으로 이동.

**API**: `updatePassword()`, `getSession()`, `getCurrentUser()`

### `/calendar` - LeaveCalendar

FullCalendar 기반 연차 시각화. 월간/주간 뷰, 사용자별 색상 구분, 필터링, 날짜 클릭 시 신청 Dialog.

**상세**: [LeaveCalendar-PRD.md](./LeaveCalendar-PRD.md)
**API**: `getAllLeaveHistory()`, `getAllLeaveReservations()`, `getAllUsers()`

### `/night-shift-stats` - NightShiftStats

직원별 야간 근무 요일 통계 시각화. 연도/월 필터링, 활성 요일 표시, 공평한 배분 확인용.

**상세**: [NightShift-PRD.md](./NightShift-PRD.md)
**API**: `getAllEmployeesStats()`, `getActiveWeekdays()`

### `/settings/night-shift` - NightShiftManagement (ADMIN 전용)

야간 진료 관리. 요일 설정 (MON~SAT), 직원 관리 (회원가입 불필요), 근무 기록 추가/삭제.

**상세**: [NightShift-PRD.md](./NightShift-PRD.md)
**API**: `getAllEmployees()`, `getNightShiftConfig()`, `createNightShiftRecord()`

### `/settings/*` - Settings (ADMIN 전용)

시스템 설정. 하위 라우트: 일반 설정, 연차 수동 조정, 가입 요청 관리, 사용자 이력, 야간 진료 관리.

---

## 추가 정보

### 주요 타입 정의
**완전한 타입 정의**: [src/lib/supabase/types/database.types.ts](../../src/lib/supabase/types/database.types.ts)

- **연차**: `LeaveReservation`, `LeaveHistory`, `LeaveType`, `LeaveSession`
- **야간 진료**: `Employee`, `NightShiftConfig`, `NightShiftRecord`, `Weekday`

### 데이터베이스
**완전한 스키마**: [src/lib/supabase/schema.sql](../../src/lib/supabase/schema.sql)

- PostgreSQL with RLS
- RPC functions for business logic
- INTEGER × 10 storage for leave values
