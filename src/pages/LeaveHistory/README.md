# LeaveHistory 페이지

## 📋 개요

과거 연차 신청 내역을 조회할 수 있는 페이지입니다.

**경로**: `/history`

**현재 상태**: ⚠️ **미구현** (Placeholder만 존재)

## 🎯 계획된 주요 기능

### 1. 개인별 연차 사용 이력
- 로그인한 사용자 본인의 연차 사용 내역 조회
- 날짜, 타입(종일/반차), 세션(AM/PM) 표시
- 차감된 연차 발생 연도 표시

### 2. 기간별 필터링
- 시작일 ~ 종료일 범위 선택
- 연도별 조회
- 월별 조회

### 3. 통계 정보
- 총 사용 연차
- 요일별 사용 통계
- 월별 사용 추이 그래프

### 4. 내보내기
- CSV/Excel 내보내기
- PDF 출력

## 🔧 사용할 API (예정)

### Supabase API

#### `getLeaveHistory()` (`@/lib/supabase/api/leave.ts`)
```tsx
const result = await getLeaveHistory(
  userId,
  startDate,  // optional
  endDate     // optional
)
```
- 사용자의 연차 사용 이력 조회
- 날짜 범위 필터링 지원

## 📦 계획된 컴포넌트 구조

```tsx
LeaveHistory
├── 헤더
│   ├── 타이틀: "연차 사용 내역"
│   └── 내보내기 버튼
├── 필터 영역
│   ├── 시작일 (DatePicker)
│   ├── 종료일 (DatePicker)
│   └── 검색 버튼
├── 통계 요약 카드
│   ├── 총 사용 연차
│   ├── 종일/반차 비율
│   └── 가장 많이 사용한 요일
├── 이력 테이블/리스트
│   ├── 날짜
│   ├── 연차 타입
│   ├── 세션 (반차인 경우)
│   ├── 차감 연도
│   └── 요일
└── 페이지네이션
```

## 📊 데이터 타입

```typescript
interface LeaveHistory {
  id: number
  user_id: string
  date: string           // YYYY-MM-DD
  type: LeaveType        // 'FULL' | 'HALF'
  session: LeaveSession  // 'AM' | 'PM' | null
  amount: number         // 1.0 or 0.5
  weekday: Weekday       // 'MON' ~ 'SUN'
  source_year: number    // 차감된 연차의 발생 연도
  used_at: string        // ISO 8601
}
```

## 🎨 UI/UX 계획

### 레이아웃
- 테이블 형태로 리스트 표시
- 반응형: 모바일에서는 카드 형태로 변경
- 최대 너비: 1200px

### 색상 구분
- 종일: Blue
- 반차(AM): Orange
- 반차(PM): Purple

### 정렬
- 기본: 날짜 내림차순 (최신순)
- 클릭으로 정렬 변경 가능

## 🚀 구현 단계

1. **1단계**: 기본 리스트 표시
   - Supabase API 연동
   - 테이블/카드 UI 구현

2. **2단계**: 필터링 기능
   - 날짜 범위 선택
   - 타입 필터 (종일/반차)

3. **3단계**: 통계 및 차트
   - 요일별 사용 통계
   - 월별 추이 그래프 (Chart.js 또는 Recharts)

4. **4단계**: 내보내기 기능
   - CSV 다운로드
   - PDF 출력

## 📝 현재 코드

```tsx
export default function LeaveHistory() {
  return (
    <div>
      <h1>연차 내역</h1>
      <p>과거 연차 신청 내역을 조회할 수 있습니다.</p>
    </div>
  );
}
```

## 🔗 관련 컴포넌트

- `LeaveHistoryModal` (`src/components/dashboard/LeaveHistoryModal.tsx`)
  - Dashboard에서 사용 중인 모달 컴포넌트
  - 이 컴포넌트를 재사용 또는 참고하여 구현 가능

## 📌 참고사항

- Dashboard의 "연차 사용 내역" 버튼과 기능이 중복
- Dashboard는 관리자 시점 (전체 직원 조회)
- LeaveHistory는 개인 시점 (본인만 조회)
- 권한에 따라 조회 범위 제한 필요
