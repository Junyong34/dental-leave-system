# Supabase API 사용 가이드

## 📋 개요

Supabase API 모듈은 **인증**, **연차 관리**, **사용자 관리** 기능을 제공합니다.

모든 함수는 일관된 `ApiResponse<T>` 형식으로 결과를 반환:
```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}
```

## 🔐 인증 API

**파일**: `auth.ts`

| 함수 | 설명 | 파라미터 | 반환 |
|------|------|----------|------|
| `loginWithEmail` | 이메일/비밀번호 로그인 | email, password | LoginResult |
| `logout` | 로그아웃 | - | boolean |
| `getSession` | 현재 세션 조회 | - | Session \| null |
| `getCurrentUser` | 현재 사용자 조회 | - | User \| null |
| `subscribeToAuthChanges` | Auth 상태 변경 구독 | callback | unsubscribe 함수 |
| `sendPasswordResetEmail` | 비밀번호 재설정 이메일 | email | { success, error? } |
| `updatePassword` | 비밀번호 업데이트 | newPassword | { success, error? } |

### 사용 예시
```typescript
// 로그인
const result = await loginWithEmail('user@example.com', 'password')
if (result.success && result.user) {
  console.log('로그인 성공')
}

// 세션 조회
const session = await getSession()

// Auth 구독 (App.tsx에서 1회만)
useEffect(() => {
  const unsubscribe = subscribeToAuthChanges((event, session) => {
    if (event === 'SIGNED_IN') {
      // 로그인 처리
    }
  })
  return () => unsubscribe()
}, [])
```

## 📅 연차 API

**파일**: `leave.ts`

### 조회 함수

| 함수 | 설명 | 파라미터 | 반환 |
|------|------|----------|------|
| `getUserLeaveStatus` | 사용자 연차 현황 (RPC) | userId | LeaveStatus |
| `getLeaveBalances` | 연차 잔액 (연도별) | userId, year? | LeaveBalance[] |
| `getLeaveReservations` | 연차 예약 목록 | userId, status? | LeaveReservation[] |
| `getAllLeaveReservations` | 전체 예약 목록 (관리자용) | status? | LeaveReservation[] |
| `getLeaveHistory` | 연차 사용 이력 | userId, startDate?, endDate? | LeaveHistory[] |
| `getReservationsByDate` | 특정 날짜 예약 조회 | date, groupId? | LeaveReservation[] |

### 액션 함수

| 함수 | 설명 | 파라미터 | 반환 |
|------|------|----------|------|
| `reserveLeave` | 연차 신청 (RPC) | userId, date, type, session | { reservation_id?, message? } |
| `approveLeave` | 연차 승인 (RPC - FIFO) | reservationId | { message? } |
| `cancelLeave` | 연차 취소 (RPC) | reservationId | { message? } |

### 주요 타입

```typescript
interface LeaveStatus {
  user_id: string
  total: number          // 전체 발생 연차
  used: number           // 사용 완료
  reserved: number       // 예약
  remain: number         // 잔여
  balances: LeaveBalance[]
  nearest_expiry: { year, amount, expire_at } | null
}
```

### 사용 예시
```typescript
// 연차 현황 조회
const result = await getUserLeaveStatus('U001')
if (result.success && result.data) {
  console.log('잔여 연차:', result.data.remain)
}

// 종일 연차 신청
await reserveLeave('U001', '2025-12-25', 'FULL', null)

// 오전 반차 신청
await reserveLeave('U001', '2025-12-26', 'HALF', 'AM')

// 연차 승인
await approveLeave(123)

// 2024년 이력 조회
await getLeaveHistory('U001', '2024-01-01', '2024-12-31')
```

## 👤 사용자 API

**파일**: `user.ts`

### 조회 함수

| 함수 | 설명 | 파라미터 | 반환 |
|------|------|----------|------|
| `getUserById` | ID로 사용자 조회 | userId | User |
| `getAllUsers` | 전체 사용자 목록 | status? | User[] |
| `getUsersByGroup` | 그룹별 사용자 목록 | groupId, status? | User[] |

### 관리 함수

| 함수 | 설명 | 파라미터 | 반환 |
|------|------|----------|------|
| `createUser` | 신규 사용자 생성 | user | User |
| `updateUser` | 사용자 정보 수정 | userId, updates | User |
| `updateUserStatus` | 사용자 상태 변경 | userId, status | User |
| `deleteUser` | 사용자 삭제 (Soft Delete) | userId | void |

### 사용 예시
```typescript
// 활성 사용자 조회
const result = await getAllUsers('ACTIVE')

// 사용자 정보 수정
await updateUser('U001', {
  name: '홍길동',
  group_id: 'G02'
})

// 신규 사용자 등록
await createUser({
  user_id: 'U005',
  name: '신입사원',
  join_date: '2025-01-01',
  group_id: 'G01',
  role: 'USER',
  status: 'ACTIVE'
})

// 퇴사 처리
await updateUserStatus('U001', 'RESIGNED')
```

## 📩 가입 요청 API

**파일**: `signupRequest.ts`

### 조회/관리 함수

| 함수 | 설명 | 파라미터 | 반환 |
|------|------|----------|------|
| `createSignupRequest` | 가입 초대 요청 생성 | email, requestedName? | void |
| `getSignupRequests` | 가입 요청 목록 조회 | status? | SignupRequest[] |
| `approveSignupRequest` | 승인 처리 (Edge Function 호출) | requestId | void |
| `rejectSignupRequest` | 거부 처리 | requestId, reason, note? | void |

### 사용 예시
```typescript
// 가입 요청 생성
await createSignupRequest('user@example.com', '홍길동')

// 대기 목록 조회
const result = await getSignupRequests('PENDING')
if (result.success && result.data) {
  console.log(result.data.length)
}

// 승인 처리 (메일 발송)
await approveSignupRequest(1)

// 거부 처리
await rejectSignupRequest(1, '도메인 불일치', '내부 정책 확인 필요')
```

## ⚠️ 에러 처리 패턴

모든 API 함수는 동일한 패턴 사용:

```typescript
const result = await someApiFunction(params)

// 1. success 확인
if (!result.success) {
  console.error('에러:', result.error)
  return
}

// 2. data 사용 (success가 true이므로 data 존재 보장)
console.log(result.data)
```

## 📌 핵심 개념

### RPC 함수
복잡한 비즈니스 로직은 Supabase RPC 함수로 처리:
- **reserve_leave**: 연차 신청 + 유효성 검증
- **approve_leave**: 연차 승인 + FIFO 방식 차감
- **cancel_leave**: 연차 취소
- **get_user_leave_status**: 연차 현황 집계

### FIFO 차감
연차 승인 시 만료일이 빠른 연차부터 차감 (선입선출)

### Soft Delete
사용자 삭제는 실제 삭제가 아닌 `status = 'RESIGNED'`로 변경

## 📚 관련 문서

- [Supabase 통합 가이드](../README.md)
- [데이터베이스 타입](../types/database.types.ts)
