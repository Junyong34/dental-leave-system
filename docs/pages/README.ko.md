# Pages 문서 (LLM 참고용)

이 문서는 `src/pages/` 디렉토리의 모든 라우트를 요약한 것입니다.
프로젝트 업데이트 시 이 파일도 함께 갱신하세요.

**최종 업데이트**: 2025-02-02

## 라우트 개요

### 인증
- `/login` → Login ✅

### 공개 (인증 필요)
- `/register` → UserRegistration ✅
- `/` → Dashboard (ADMIN 전용) ✅
- `/calendar` → LeaveCalendar ✅
- `/request` → LeaveRequest ✅
- `/approval` → LeaveApproval (ADMIN 전용) ✅
- `/history` → LeaveHistory ✅
- `/night-shift-stats` → NightShiftStats ✅

### 설정 (ADMIN 전용)
- `/settings` → Settings (index) ✅
- `/settings/leave-management` → UserLeaveManagement ✅
- `/settings/history` → UserHistory ✅
- `/settings/night-shift` → NightShiftManagement ✅

## 라우트: `/` (Dashboard) - ADMIN 전용 ✅

- **목적**: 팀원들의 연차 현황을 카드 형태로 한눈에 확인하는 관리자용 대시보드
- **상태**: Supabase 연동 완료
- **핵심 기능**:
  - 전체 직원의 연차 통계 카드 표시 (total/used/reserved/remain)
  - 그룹별 필터링
  - 연도별 잔여 연차 상세
  - 사용률 프로그레스 바
  - 만료 예정 연차 표시
  - `LeaveHistoryModal`로 직원별 상세 이력 모달
- **API 사용**:
  - `getAllUsers('ACTIVE')`: 활성 사용자 목록
  - `getUserLeaveStatus(userId)`: 사용자별 연차 현황
- **React Router Loader**: 데이터 프리로드로 빠른 초기 렌더링
- **UI/레이아웃**:
  - 반응형 그리드 (`minmax(240px, 1fr)`), max width 1400px
  - 사용률 계산: `used / total * 100`

## 라우트: `/approval` (LeaveApproval) - ADMIN 전용 ✅

- **목적**: 대기 중인 연차 신청을 승인하거나 반려하는 관리자 페이지
- **상태**: Supabase 연동 완료
- **핵심 기능**:
  - 대기 중인 예약 목록 (`status='RESERVED'`) 표시
  - 승인 버튼: `approve_leave()` RPC 호출하여 FIFO 차감
  - 반려 버튼: `cancel_leave()` RPC 호출
  - 그룹별 필터링
- **API 사용**:
  - `getAllLeaveReservations('RESERVED')`: 대기 중인 신청 목록
  - `approveLeave(reservationId)`: 승인 처리
  - `cancelLeave(reservationId)`: 반려 처리
- **비즈니스 로직**:
  - 승인 시 만료일이 빠른 연차부터 자동 차감 (FIFO)
  - 차감 내역은 `leave_history`에 `source_year`와 함께 기록
- **UI**:
  - 예약 카드 리스트 형태
  - 승인/반려 버튼
  - 성공/에러 Callout 메시지

## 라우트: `/history` (LeaveHistory)

- 목적: 본인 연차 사용 이력 조회.
- 상태: placeholder만 존재, 미구현.
- 계획 기능:
  - 날짜/타입/세션/차감 연도/요일 표시
  - 기간/연도/월 필터링
  - 통계 (총 사용, 요일 분포, 월별 추이)
  - 내보내기 (CSV/Excel/PDF)
- 계획 API:
  - `getLeaveHistory(userId, startDate?, endDate?)` in `@/lib/supabase/api/leave.ts`

## 라우트: `/request` (LeaveRequest)

- 목적: 연차 신청 (종일/반차).
- 상태: `sampleData` 기반 구현 완료, Supabase 연동 예정.
- 핵심 기능:
  - 활성 직원 선택
  - 선택한 직원의 연차 현황 표시
  - 날짜/유형(FULL/HALF)/세션(AM/PM) 선택
  - 과거 날짜: 즉시 사용 처리
  - 미래 날짜: 예약 처리
- 유효성 검증 (`validateLeaveRequest(...)` in `@/utils/leave.ts`):
  - 일요일 금지
  - 잔여 연차 충분 여부
  - 중복 예약 금지
  - 반차 세션 유효성
- 변경 처리 (`addLeaveReservation(...)` in `@/utils/leaveManagement.ts`):
  - 과거 날짜: FIFO 차감 + history 추가
  - 미래 날짜: reservations 추가

## 라우트: `/login` (Login)

- 목적: 이메일/비밀번호 로그인 + 개발용 샘플 데이터 시딩.
- 상태: 구현 완료.
- 핵심 기능:
  - Supabase Email/Password 인증
  - 새로고침 시 세션 복원
  - `sessionStorage` 기반 플래시 알림
  - 개발용 샘플 데이터 삽입 (`seedAll`)
- 유틸/서비스:
  - `useAuthStore.login(email, password)` in `@/store/authStore.ts`
  - `getSession()` in `@/lib/supabase/api/auth.ts`
  - `seedAll()` in `@/lib/supabase/seed.ts`
  - `setFlashNotice(...)` / `consumeFlashNotice()` in `@/utils/flashNotice.ts`
- UI:
  - 로그인 폼 + 에러/알림 Callout
  - 로그인/시딩 로딩 상태

## 라우트: `/calendar` (LeaveCalendar) ✅

- 목적: fullCalendar를 사용한 연차 시각화 및 관리
- 상태: 구현 완료, Supabase 연동 완료
- 핵심 기능:
  - 월간/주간 뷰 전환 (dayGridMonth, timeGridWeek)
  - 사용자별 색상 구분 (HSL 해시 기반)
  - 사용자/상태/연도 필터링
  - 이벤트 클릭 → 상세 정보 Dialog
  - 날짜 클릭 → 연차 신청 Dialog
  - 반응형 디자인 (PC/모바일 최적화)
- 컴포넌트 구조:
  - `LeaveCalendar/index.tsx` - 메인 캘린더
  - `LeaveCalendarFilters.tsx` - 필터 UI
  - `LeaveEventDialog.tsx` - 이벤트 상세 Dialog
  - `LeaveRequestDialog.tsx` - 연차 신청 Dialog
  - `styles.css` - Radix 테마 통합 스타일
- API 사용:
  - `getAllLeaveHistory(startDate, endDate)` - 사용 완료 이벤트
  - `getAllLeaveReservations('RESERVED')` - 사용 예정 이벤트
  - `getAllUsers('ACTIVE')` - 사용자 목록
- 데이터 흐름:
  - 연도/상태 필터 변경 → API 재조회
  - 사용자 필터는 클라이언트 측 필터링
  - 이벤트 변환: `LeaveHistory/Reservation` → `CalendarEvent`
- UI/반응형:
  - PC: 전체 정보 표시 (사용자명 + 종일/반차)
  - 모바일: 축약 표시 (사용자명 첫 글자)
  - 터치/클릭 이벤트로 상세 정보 접근

## 라우트: `/settings` (Settings)

- 목적: 프로필 + 관리자 설정 (직원/정책/휴일/권한).
- 상태: placeholder만 존재, 미구현.
- 계획 기능:
  - 프로필: 이름/비밀번호/알림
  - 관리자: 직원 CRUD, 연차 정책, 휴일, 권한/그룹
- 계획 API:
  - auth: `getCurrentUser()`, `updatePassword()`
  - users: `getAllUsers()`, `updateUser()`, `createUser()`, `deleteUser()`
- 계획 RPC + env:
  - `update_user_profile()`, `get_system_settings()`, `update_system_settings()`
  - `VITE_ENABLE_USER_MANAGEMENT`

## 라우트: `/night-shift-stats` (NightShiftStats)

- 목적: 직원별 야간 근무 요일 통계를 확인하여 공평한 배분 지원.
- 상태: 구현 예정.
- 핵심 기능:
  - 연도/월/직원 필터링
  - 직원별 요일 통계 카드 (막대 그래프)
  - 가장 많이 근무한 요일 하이라이트
  - CSV 내보내기
- 계획 API:
  - `getNightShiftStats(employeeId, year, month?)` - 개별 직원 통계
  - `getAllEmployeesStats(year, month?)` - 전체 직원 통계
- 참고: [NightShift-PRD.md](./NightShift-PRD.md)

## 라우트: `/settings/night-shift` (NightShiftManagement)

- 목적: 야간 요일 설정 및 직원 야간 근무 기록 관리 (ADMIN 전용).
- 상태: 구현 예정.
- 핵심 기능:
  - 야간 요일 설정: 요일별 활성화/비활성화 토글
  - 직원 관리: 회원가입 없이 직원 추가, 추후 계정 연동
  - 야간 근무 기록: 날짜별 직원 배정 및 기록 관리
- 계획 API:
  - employees: `getAllEmployees()`, `createEmployee()`, `updateEmployee()`, `deleteEmployee()`, `linkEmployeeToUser()`
  - config: `getNightShiftConfig()`, `updateNightShiftConfig()`
  - records: `createNightShiftRecord()`, `deleteNightShiftRecord()`, `getNightShiftRecords()`
- 참고: [NightShift-PRD.md](./NightShift-PRD.md)

## 공유 타입 (페이지 README 기준)

- `LeaveReservation`:
  - `id`, `user_id`, `date`, `type`, `session`, `amount`, `status`, `created_at`
- `LeaveHistory`:
  - `id`, `user_id`, `date`, `type`, `session`, `amount`, `weekday`, `source_year`, `used_at`
- `LeaveType`: `FULL | HALF`
- `LeaveSession`: `AM | PM | null`
- `FlashNotice`: `message`, `tone` (`blue | green | red | amber`)

## 데이터 상태 메모

- 대부분 페이지는 현재 `sampleData` 기반.
- Supabase API 연동은 계획만 되어 있고, 실제 연결은 미완성.
