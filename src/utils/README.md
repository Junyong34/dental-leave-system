# 유틸리티 함수 가이드

## 📋 개요

연차 계산, 검증, 데이터 관리 및 플래시 알림을 위한 유틸리티 함수를 제공합니다.

## 📁 파일 구조

```
src/utils/
├── leave.ts              # 연차 계산 및 검증 함수
├── leaveManagement.ts    # 연차 데이터 관리 함수
├── flashNotice.ts        # 플래시 알림 관리
└── __tests__/
    └── leave.test.ts     # 테스트 파일
```

## 📊 연차 계산 및 검증 (`leave.ts`)

### 계산 함수

| 함수 | 설명 | 파라미터 | 반환 |
|------|------|----------|------|
| `calculateAnnualLeave` | 근속연수로 연차 계산 | yearsOfService | number (15~25일) |
| `calculateYearsOfService` | 입사일로 근속연수 계산 | joinDate, baseDate? | number |
| `calculateLeaveBalance` | 잔여 연차 계산 | total, used, reserved | number |
| `calculateRemainingLeave` | 잔여 연차 합계 (모든 연도) | balances | number |

**계산식**:
- 기본 연차: 15일
- 근속 가산: 2년 초과 시마다 +1일
- 최대 연차: 25일
- 공식: `min(15 + floor((근속연수 - 1) / 2), 25)`

### 검증 함수

| 함수 | 설명 | 파라미터 | 반환 |
|------|------|----------|------|
| `canUseFullDayLeave` | 종일 연차 사용 가능 여부 | remainingLeave | boolean |
| `canUseHalfDayLeave` | 반차 사용 가능 여부 | remainingLeave | boolean |
| `isSunday` | 일요일 여부 확인 | date | boolean |
| `validateLeaveRequest` | 연차 신청 유효성 검증 | date, type, session, remain, reservations | LeaveValidationResult |

**검증 규칙**:
- 종일 연차: 최소 1.0일 필요
- 반차: 최소 0.5일 필요
- 일요일 사용 불가
- 중복 예약 불가
- 반차는 세션(AM/PM) 필수

### 조회 함수

| 함수 | 설명 | 파라미터 | 반환 |
|------|------|----------|------|
| `getLeaveStatus` | 사용자 연차 현황 조회 | userId, balances, reservations | LeaveStatus |
| `deductLeaveByFIFO` | FIFO 방식 연차 차감 | balances, amount | LeaveDeductionResult |
| `getWeekday` | 날짜 → 요일 변환 | date | Weekday |

### 사용 예시

```typescript
import {
  calculateAnnualLeave,
  validateLeaveRequest,
  getLeaveStatus,
  deductLeaveByFIFO
} from '@/utils/leave'

// 1. 근속연수로 연차 계산
const annualLeave = calculateAnnualLeave(3) // 16일

// 2. 연차 현황 조회
const status = getLeaveStatus(
  'U001',
  sampleData.balances,
  sampleData.reservations
)
console.log('잔여:', status.remain)

// 3. 유효성 검증
const validation = validateLeaveRequest(
  '2025-12-25',
  'FULL',
  null,
  status.remain,
  userReservations
)
if (!validation.valid) {
  console.error(validation.error)
}

// 4. FIFO 차감
const result = deductLeaveByFIFO(balances, 1.0)
console.log('차감된 연도:', result.deductions)
```

### 검증 에러 코드

| 코드 | 설명 |
|------|------|
| `INSUFFICIENT_LEAVE` | 잔여 연차 부족 |
| `SUNDAY_NOT_ALLOWED` | 일요일 사용 불가 |
| `DUPLICATE_RESERVATION` | 중복 예약 |
| `INVALID_HALF_DAY` | 반차 세션 누락 또는 중복 |
| `INVALID_DATE` | 유효하지 않은 날짜 |
| `GROUP_LIMIT_EXCEEDED` | 그룹 제한 초과 |

## 🔧 연차 데이터 관리 (`leaveManagement.ts`)

### 데이터 수정 함수

| 함수 | 설명 | 파라미터 | 반환 |
|------|------|----------|------|
| `updateLeaveUsed` | 사용 연차 수정 및 재계산 | balances, userId, year, newUsed | LeaveBalance[] |
| `addLeaveReservation` | 연차 추가 (예약 또는 즉시 사용) | balances, reservations, history, userId, date, type, session, isApproved | { balances, reservations, history } |
| `approveLeaveReservation` | 예약 승인 및 히스토리 이동 | balances, reservations, history, reservationId | { balances, reservations, history } |
| `cancelLeaveReservation` | 예약 취소 | reservations, reservationId | LeaveReservation[] |
| `cancelLeaveHistory` | 사용 이력 취소 및 연차 복구 | balances, history, historyId | { balances, history } |

### 주요 기능

#### 1. 연차 추가
- **예약 모드** (`isApproved = false`): reservations에 추가
- **즉시 사용 모드** (`isApproved = true`): FIFO 차감 + history에 추가

#### 2. FIFO 차감
만료일이 빠른 연차부터 차감:
```
2024년 잔여 1.0일 (만료: 2025-12-31)
2025년 잔여 3.5일 (만료: 2026-12-31)
→ 1.5일 사용 시: 2024년 1.0일 + 2025년 0.5일 차감
```

#### 3. 연차 복구
사용 이력 취소 시 `source_year`를 기준으로 해당 연도 연차 복구

### 사용 예시

```typescript
import {
  addLeaveReservation,
  approveLeaveReservation,
  cancelLeaveHistory
} from '@/utils/leaveManagement'

// 1. 연차 예약 추가
const result = addLeaveReservation(
  balances,
  reservations,
  history,
  'U001',
  '2025-12-25',
  'FULL',
  null,
  false  // 예약만
)

// 2. 예약 승인 (FIFO 차감)
const approved = approveLeaveReservation(
  balances,
  reservations,
  history,
  reservationId
)

// 3. 사용 이력 취소 및 복구
const canceled = cancelLeaveHistory(
  balances,
  history,
  historyId
)
```

## 💬 플래시 알림 (`flashNotice.ts`)

### 함수

| 함수 | 설명 | 파라미터 | 반환 |
|------|------|----------|------|
| `setFlashNotice` | 플래시 알림 설정 | notice | void |
| `getFlashNotice` | 플래시 알림 조회 (유지) | - | FlashNotice \| null |
| `consumeFlashNotice` | 플래시 알림 조회 및 삭제 | - | FlashNotice \| null |

### FlashNotice 타입

```typescript
interface FlashNotice {
  message: string
  tone?: 'blue' | 'green' | 'red' | 'amber'  // Radix UI 색상
}
```

### 특징

- **sessionStorage** 기반 (새로고침 시 유지, 탭 간 독립)
- **1회용**: `consumeFlashNotice()` 호출 시 자동 삭제
- **페이지 간 전달**: 리다이렉트 시 메시지 전달 용도

### 사용 예시

```typescript
import {
  setFlashNotice,
  consumeFlashNotice
} from '@/utils/flashNotice'

// 1. 로그인 성공 후 플래시 알림 설정
const handleLogin = async () => {
  const success = await login(email, password)
  if (success) {
    setFlashNotice({
      message: '로그인되었습니다.',
      tone: 'green'
    })
    navigate('/')
  }
}

// 2. 대시보드에서 플래시 알림 표시
useEffect(() => {
  const flash = consumeFlashNotice()
  if (flash) {
    setNotice(flash)  // UI에 표시
  }
}, [])

// 3. 에러 알림
setFlashNotice({
  message: '권한이 없습니다.',
  tone: 'red'
})
```

### 사용 시나리오

| 시나리오 | tone | 예시 메시지 |
|---------|------|------------|
| 로그인 성공 | green | "로그인되었습니다." |
| 로그아웃 | blue | "로그아웃되었습니다." |
| 권한 없음 | red | "접근 권한이 없습니다." |
| 세션 만료 | amber | "세션이 만료되었습니다. 다시 로그인하세요." |
| 작업 완료 | green | "연차 신청이 완료되었습니다." |

## 📊 주요 타입 정의

### LeaveStatus
```typescript
interface LeaveStatus {
  user_id: string
  total: number          // 전체 발생 연차
  used: number           // 사용 완료
  reserved: number       // 예약
  remain: number         // 잔여
  balances: LeaveBalance[]
  nearest_expiry: {
    year: number
    amount: number
    expire_at: string
  } | null
}
```

### LeaveValidationResult
```typescript
interface LeaveValidationResult {
  valid: boolean
  error?: string
  errorCode?: 'INSUFFICIENT_LEAVE' | 'SUNDAY_NOT_ALLOWED' | ...
}
```

### LeaveDeductionResult
```typescript
interface LeaveDeductionResult {
  success: boolean
  deductions: Array<{
    year: number
    amount: number
  }>
  remainingBalances: LeaveBalance[]
}
```

## ⚠️ 주의사항

1. **FIFO 차감**: 만료일 기준 오름차순 정렬 후 차감 (오래된 연차부터)

2. **0.5 단위**: 모든 연차는 0.5 단위로 관리 (반차 지원)

3. **중복 예약**:
   - 종일 + 종일 ❌
   - 종일 + 반차 ❌
   - 반차(AM) + 반차(AM) ❌
   - 반차(AM) + 반차(PM) ✅

4. **플래시 알림**: `consumeFlashNotice()` 호출 시 자동 삭제되므로 중복 표시 방지

5. **날짜 검증**: `date-fns` 사용 (parseISO, isSunday 등)

## 📚 관련 타입

전체 타입 정의는 `src/types/leave.ts` 참조:
- `User`, `LeaveBalance`, `LeaveReservation`, `LeaveHistory`
- `LeaveType`, `LeaveSession`, `ReservationStatus`, `Weekday`
- `UserRole`, `UserStatus`

## 🧪 테스트

`__tests__/leave.test.ts`에 단위 테스트 포함:
```bash
pnpm test
```
