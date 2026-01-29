# Pages 문서 (LLM 참고용)

이 문서는 `src/pages/*/README.md`에 흩어져 있는 라우트별 설명을 하나로 요약한 것입니다.
각 페이지 README가 변경되면 이 파일도 함께 갱신하세요.

## 라우트 개요

- `/` -> Dashboard
- `/login` -> Login
- `/request` -> LeaveRequest
- `/approval` -> LeaveApproval
- `/history` -> LeaveHistory (placeholder)
- `/settings` -> Settings (placeholder)

## 라우트: `/` (Dashboard)

- 목적: 팀원들의 연차 현황을 카드 형태로 한눈에 확인하는 관리자용 대시보드.
- 상태: `sampleData` 기반 구현 완료, Supabase 연동 예정.
- 핵심 기능:
  - 사용자별 연차 통계 (total/used/reserved/remain)
  - 연도별 잔여 연차 상세
  - 사용률 프로그레스 바
  - 만료 예정 연차 표시
  - `LeaveHistoryModal`로 상세 이력 모달 제공
- 데이터 소스:
  - 현재 `sampleData`
  - `getLeaveStatus(userId, balances, reservations)` in `@/utils/leave.ts`
- 상태:
  - `selectedUserId` (모달 대상 선택)
- UI/레이아웃:
  - 반응형 그리드 (`minmax(240px, 1fr)`), max width 1400px
  - 사용률 계산: `used / total * 100`
- 주요 타입:
  - `LeaveStatus` (total/used/reserved/remain/balances/nearest_expiry 포함)

## 라우트: `/approval` (LeaveApproval)

- 목적: 연차 예약 및 사용 완료 이력을 확인하고 취소/복구.
- 상태: `sampleData` 기반 구현 완료, Supabase 연동 예정.
- 핵심 기능:
  - 예약 목록(`RESERVED`) 표시 및 취소 (`CANCELLED`)
  - 사용 이력 목록 표시 및 취소 + 연차 복구
- 유틸리티:
  - `cancelLeaveReservation(reservations, reservationId)` in `@/utils/leaveManagement.ts`
    - 상태만 `CANCELLED`로 변경, 잔액 복구 없음
  - `cancelLeaveHistory(balances, history, historyId)` in `@/utils/leaveManagement.ts`
    - `source_year` 기준으로 잔액 복구, 히스토리 제거
- UI:
  - 예약 카드 / 사용 완료 카드 2영역
  - 성공/에러 Callout
- 참고:
  - 예약 취소는 잔액 복구 없음 (차감 전)
  - 사용 이력 취소는 잔액 복구 필요 (차감 후)

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
