# LeaveRequest 페이지

## 📋 개요

직원의 연차를 신청하는 페이지입니다. 종일 또는 반차(오전/오후)를 선택하여 신청할 수 있으며, 유효성 검증을 통해 잘못된 신청을 사전에 차단합니다.

**경로**: `/request`

## 🎯 주요 기능

### 1. 직원 선택
- 활성 직원(`ACTIVE`) 목록에서 선택
- 선택 시 해당 직원의 연차 현황 자동 표시

### 2. 연차 현황 표시
- 총 연차, 사용, 예약, 잔여 연차 표시
- 실시간으로 선택한 직원의 정보 업데이트

### 3. 연차 신청
- **날짜 선택**: 연차 사용일 지정
- **연차 종류**: 종일(FULL) / 반차(HALF) 선택
- **반차 시간**: 오전(AM) / 오후(PM) 선택 (반차인 경우)

### 4. 과거/미래 날짜 자동 처리
- **과거 날짜**: 즉시 사용 처리 (히스토리에 추가)
- **미래 날짜**: 예약 처리 (reservations에 추가)

### 5. 유효성 검증
- 일요일 사용 불가
- 잔여 연차 부족 확인
- 중복 예약 확인
- 반차 세션 누락 확인

## 🔧 사용하는 API 및 유틸리티

### 유틸리티 함수

#### `getLeaveStatus()` (`@/utils/leave.ts`)
```tsx
const leaveStatus = getLeaveStatus(
  selectedUserId,
  sampleData.balances,
  sampleData.reservations
)
```
- 사용자의 연차 현황 조회

#### `validateLeaveRequest()` (`@/utils/leave.ts`)
```tsx
const validation = validateLeaveRequest(
  selectedDate,
  leaveType,
  session,
  leaveStatus?.remain || 0,
  userReservations
)
```
- 연차 신청 유효성 검증
- 반환: `LeaveValidationResult` (valid, error, errorCode)

#### `addLeaveReservation()` (`@/utils/leaveManagement.ts`)
```tsx
const result = addLeaveReservation(
  sampleData.balances,
  sampleData.reservations,
  sampleData.history,
  selectedUserId,
  selectedDate,
  leaveType,
  session,
  isPastDate  // true: 즉시 사용, false: 예약
)
```
- 연차 추가 또는 예약
- 과거 날짜면 FIFO 차감 및 히스토리 추가

### 날짜 유틸리티 (`date-fns`)
- `isPast()`: 과거 날짜 확인
- `parseISO()`: 날짜 문자열 파싱
- `startOfToday()`: 오늘 날짜 기준

## 📦 컴포넌트 구조

```tsx
LeaveRequest
├── 직원 선택 (Select)
├── 연차 현황 표시 (선택 시)
│   └── 총/사용/예약/잔여 연차
├── 날짜 선택 (TextField - type="date")
├── 연차 종류 선택 (Select: FULL/HALF)
├── 반차 시간 선택 (Select: AM/PM - HALF인 경우만)
├── 에러 메시지 (Callout - 빨강)
├── 성공 메시지 (Callout - 초록)
└── 신청 버튼
```

## 🔄 데이터 흐름

### 1. 상태 관리
```tsx
const [selectedUserId, setSelectedUserId] = useState<string>('')
const [selectedDate, setSelectedDate] = useState<string>('')
const [leaveType, setLeaveType] = useState<LeaveType>('FULL')
const [session, setSession] = useState<LeaveSession>(null)
const [error, setError] = useState<string>('')
const [success, setSuccess] = useState<string>('')
```

### 2. 신청 프로세스
```
1. 사용자 입력 검증 (userId, date 필수)
2. validateLeaveRequest() 호출
3. 과거/미래 날짜 판별 (isPast)
4. addLeaveReservation() 호출
   - 과거: balances, history 업데이트
   - 미래: reservations 업데이트
5. 성공 메시지 표시 및 폼 초기화
```

## 🎨 UI/UX

### Radix UI 컴포넌트
- `Card`: 전체 폼 컨테이너
- `Select`: 드롭다운 (직원, 연차 종류, 반차 시간)
- `TextField`: 날짜 입력 (type="date")
- `Button`: 신청 버튼
- `Callout`: 에러/성공 메시지

### 색상 구분
- 연차 현황: Blue 배경 (`var(--blue-a2)`)
- 에러: Red (`var(--red-a2)`)
- 성공: Green (`var(--green-a2)`)

### 반응형
- 최대 너비: 800px (중앙 정렬)

## 📊 데이터 타입

```typescript
type LeaveType = 'FULL' | 'HALF'
type LeaveSession = 'AM' | 'PM' | null

interface LeaveValidationResult {
  valid: boolean
  error?: string
  errorCode?: 'INSUFFICIENT_LEAVE' | 'SUNDAY_NOT_ALLOWED' |
              'DUPLICATE_RESERVATION' | 'INVALID_DATE' |
              'GROUP_LIMIT_EXCEEDED' | 'INVALID_HALF_DAY'
}
```

## ⚠️ 유효성 검증 에러 케이스

| 에러 코드 | 설명 | 메시지 |
|----------|------|--------|
| `SUNDAY_NOT_ALLOWED` | 일요일 신청 | "일요일에는 연차를 사용할 수 없습니다." |
| `INSUFFICIENT_LEAVE` | 잔여 연차 부족 | "잔여 연차가 부족합니다." |
| `DUPLICATE_RESERVATION` | 중복 예약 | "해당 날짜에 이미 연차가 등록되어 있습니다." |
| `INVALID_HALF_DAY` | 반차 세션 누락 | "반차는 오전(AM) 또는 오후(PM)를 선택해야 합니다." |

## 🚀 향후 개선 사항

1. **Supabase 연동**
   - `reserveLeave()` RPC 함수 호출
   - 실시간 데이터 동기화

2. **캘린더 UI**
   - 날짜 선택을 달력 형태로 개선
   - 이미 예약된 날짜 시각적 표시

3. **승인 프로세스**
   - 관리자 승인 필요 여부 설정
   - 자동 승인 vs 수동 승인

4. **알림 기능**
   - 신청 완료 시 이메일/푸시 알림

5. **일괄 신청**
   - 여러 날짜 한 번에 신청

## 📝 참고사항

- 연차 타입이 `FULL`로 변경되면 `session` 자동으로 `null` 설정
- 과거 날짜 신청 시 즉시 차감되므로 주의
- 현재는 샘플 데이터 직접 수정 (실제로는 상태 관리 필요)
