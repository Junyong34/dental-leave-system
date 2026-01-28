# LeaveApproval 페이지

## 📋 개요

직원들의 연차 신청을 확인하고 취소할 수 있는 페이지입니다. 예약된 연차와 사용 완료된 연차를 구분하여 표시하며, 필요 시 취소 및 복구 기능을 제공합니다.

**경로**: `/approval`

## 🎯 주요 기능

### 1. 예약된 연차 관리
- `RESERVED` 상태의 예약 목록 표시
- 예약 취소 기능 (`status` → `CANCELLED`)
- 신청 정보 표시 (사용자, 날짜, 타입, 세션)

### 2. 사용 완료된 연차 관리
- 연차 사용 이력(`history`) 목록 표시
- 사용된 연차 취소 및 복구 기능
- 차감된 연차 원상 복구 (FIFO 역순)

## 🔧 사용하는 API 및 유틸리티

### 유틸리티 함수

#### `cancelLeaveReservation()` (`@/utils/leaveManagement.ts`)
```tsx
const updatedReservations = cancelLeaveReservation(
  sampleData.reservations,
  reservationId
)
```
- 예약 상태를 `CANCELLED`로 변경
- 연차 잔액은 복구하지 않음 (아직 차감되지 않았으므로)

#### `cancelLeaveHistory()` (`@/utils/leaveManagement.ts`)
```tsx
const result = cancelLeaveHistory(
  sampleData.balances,
  sampleData.history,
  historyId
)
```
- 사용된 연차를 취소하고 잔액 복구
- `source_year` 기준으로 해당 연도 연차에 복구
- 히스토리에서 제거

## 📦 컴포넌트 구조

```tsx
LeaveApproval
├── 성공/에러 메시지 (Callout)
├── 예약된 연차 카드 (Card)
│   ├── 타이틀: "예약된 연차"
│   └── 예약 목록
│       ├── 사용자 정보
│       ├── 날짜, 타입, 세션
│       ├── 신청일
│       └── 취소 버튼 (빨강)
└── 사용 완료된 연차 카드 (Card)
    ├── 타이틀: "사용 완료된 연차"
    └── 이력 목록
        ├── 사용자 정보
        ├── 날짜, 타입, 세션
        ├── 사용일, 차감 연도
        └── 취소 및 복구 버튼 (주황)
```

## 🔄 데이터 흐름

### 1. 상태 관리
```tsx
const [success, setSuccess] = useState<string>('')
const [error, setError] = useState<string>('')
```

### 2. 예약 취소 프로세스
```
1. 예약 ID로 취소 요청
2. cancelLeaveReservation() 호출
3. status를 'CANCELLED'로 변경
4. 성공 메시지 표시
```

### 3. 사용 이력 취소 프로세스
```
1. 히스토리 ID로 취소 요청
2. cancelLeaveHistory() 호출
3. source_year 기준으로 연차 복구
   - used 감소
   - remain 증가
4. 히스토리에서 제거
5. 성공 메시지 표시
```

## 🎨 UI/UX

### Radix UI 컴포넌트
- `Card`: 예약 및 이력 컨테이너
- `Badge`: 상태 표시 (RESERVED: Blue, 사용완료: Green)
- `Button`: 취소/복구 버튼
- `Callout`: 성공/에러 메시지

### 색상 구분
- 예약 상태 Badge: Blue
- 사용완료 Badge: Green
- 취소 버튼: Red (`color="red"`)
- 복구 버튼: Orange (`color="orange"`)

### 레이아웃
- 최대 너비: 1200px (중앙 정렬)
- 카드 간격: `mb="6"`

## 📊 데이터 타입

```typescript
interface LeaveReservation {
  id: number
  user_id: string
  date: string
  type: LeaveType
  session: LeaveSession
  amount: number
  status: ReservationStatus  // 'RESERVED' | 'USED' | 'CANCELLED'
  created_at: string
}

interface LeaveHistory {
  id: number
  user_id: string
  date: string
  type: LeaveType
  session: LeaveSession
  amount: number
  weekday: Weekday
  source_year: number  // 차감된 연차의 발생 연도
  used_at: string
}
```

## ⚠️ 주의사항

### 예약 취소 vs 이력 취소 차이

| 구분 | 예약 취소 | 이력 취소 |
|------|----------|----------|
| 대상 | `reservations` (RESERVED) | `history` (사용 완료) |
| 연차 복구 | 불필요 (아직 차감 안됨) | 필요 (이미 차감됨) |
| 처리 방식 | status만 변경 | history 삭제 + balance 복구 |
| 버튼 색상 | Red (취소) | Orange (취소 및 복구) |

### 연차 복구 로직
```typescript
// source_year를 기준으로 해당 연도 연차에 복구
balance.used -= historyItem.amount
balance.remain += historyItem.amount
```

## 🚀 향후 개선 사항

1. **Supabase 연동**
   - `approveLeave()` RPC 함수 호출
   - `cancelLeave()` RPC 함수 호출
   - 실시간 구독으로 자동 업데이트

2. **승인 기능 추가**
   - 현재는 취소만 가능
   - 승인 버튼 추가 (관리자 권한)

3. **필터링 및 정렬**
   - 날짜별, 사용자별 필터
   - 정렬 기능 (날짜순, 사용자순)

4. **페이지네이션**
   - 이력이 많을 경우 페이지 분할

5. **검색 기능**
   - 사용자 이름으로 검색

6. **상세 정보**
   - 클릭 시 상세 모달 표시
   - 신청 사유, 결재 라인 등

7. **일괄 처리**
   - 여러 건 동시 승인/취소

## 📝 참고사항

- 예약 취소는 즉시 반영 (연차 차감 전이므로 복구 불필요)
- 이력 취소는 연차 복구를 동반 (이미 차감된 연차 복원)
- 현재는 샘플 데이터 직접 수정 (실제로는 Supabase API 호출 필요)
- 아이콘: `X` (취소), `Trash2` (삭제 및 복구)
