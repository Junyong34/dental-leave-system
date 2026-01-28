# Supabase 통합 가이드

## 📋 개요

Supabase를 Backend as a Service (BaaS)로 사용하여 다음을 제공합니다:
- **PostgreSQL 데이터베이스**: 연차 데이터 저장
- **인증 시스템**: 이메일/비밀번호 로그인
- **RPC 함수**: 복잡한 비즈니스 로직 (FIFO 차감 등)
- **Row Level Security (RLS)**: 권한 기반 데이터 접근 제어

## 📁 디렉토리 구조

```
src/lib/supabase/
├── api/
│   ├── auth.ts          # 인증 API (로그인, 로그아웃, 세션 관리)
│   ├── leave.ts         # 연차 API (조회, 신청, 승인, 취소)
│   └── user.ts          # 사용자 API (CRUD)
├── types/
│   └── database.types.ts # 데이터베이스 타입 정의 (자동 생성)
├── client.ts            # Supabase 클라이언트 싱글톤
├── config.ts            # 환경 변수 설정
└── seed.ts              # 샘플 데이터 삽입 스크립트
```

## 🔧 환경 설정

### 환경 변수

프로젝트 루트에 `.env` 파일 생성:
- `VITE_SUPABASE_URL`: Supabase 프로젝트 URL
- `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY`: Anon/Public 키

환경별로 `.env.development`, `.env.qa`, `.env.production` 파일 사용

### Supabase 클라이언트

`client.ts`에서 싱글톤 클라이언트 제공. 직접 사용보다 **API 함수 사용 권장** (타입 안전성 및 에러 처리)

## 📚 API 모듈

### 1. 인증 API (`api/auth.ts`)

사용자 인증 및 세션 관리

- `loginWithEmail()`: 이메일/비밀번호 로그인
- `logout()`: 로그아웃
- `getSession()`: 현재 세션 조회
- `getCurrentUser()`: 현재 사용자 조회
- `subscribeToAuthChanges()`: Auth 상태 변경 구독
- `sendPasswordResetEmail()`: 비밀번호 재설정 이메일
- `updatePassword()`: 비밀번호 업데이트

[자세한 사용법](./api/README.md#인증-api)

### 2. 연차 API (`api/leave.ts`)

연차 데이터 조회 및 관리

- `getUserLeaveStatus()`: 사용자 연차 현황 조회
- `getLeaveBalances()`: 연차 잔액 조회 (연도별)
- `getLeaveReservations()`: 연차 예약 목록
- `getAllLeaveReservations()`: 전체 예약 목록 (관리자용)
- `getLeaveHistory()`: 연차 사용 이력
- `reserveLeave()`: 연차 신청
- `approveLeave()`: 연차 승인
- `cancelLeave()`: 연차 취소
- `getReservationsByDate()`: 특정 날짜 예약 조회

[자세한 사용법](./api/README.md#연차-api)

### 3. 사용자 API (`api/user.ts`)

직원 정보 관리

- `getUserById()`: ID로 사용자 조회
- `getAllUsers()`: 전체 사용자 목록
- `getUsersByGroup()`: 그룹별 사용자 목록
- `updateUser()`: 사용자 정보 수정
- `updateUserStatus()`: 사용자 상태 변경
- `createUser()`: 신규 사용자 생성
- `deleteUser()`: 사용자 삭제 (Soft Delete)

[자세한 사용법](./api/README.md#사용자-api)

## 🗄️ 데이터베이스 구조

### 주요 테이블

#### `users` - 사용자 정보
```sql
user_id (text, PK)
name (text)
join_date (date)
group_id (text)
role (text)         -- 'ADMIN' | 'USER' | 'VIEW'
status (text)       -- 'ACTIVE' | 'INACTIVE' | 'RESIGNED'
```

#### `leave_balances` - 연차 잔액
```sql
user_id (text, PK)
year (integer, PK)
total (numeric)     -- 해당 연도 발생 연차
used (numeric)      -- 사용한 연차
remain (numeric)    -- 잔여 연차 (계산 필드)
expire_at (date)    -- 만료일
```

#### `leave_reservations` - 연차 예약
```sql
id (integer, PK)
user_id (text)
date (date)
type (text)         -- 'FULL' | 'HALF'
session (text)      -- 'AM' | 'PM' | null
amount (numeric)    -- 1.0 or 0.5
status (text)       -- 'RESERVED' | 'USED' | 'CANCELLED'
created_at (timestamp)
```

#### `leave_history` - 연차 사용 이력
```sql
id (integer, PK)
user_id (text)
date (date)
type (text)
session (text)
amount (numeric)
weekday (text)
source_year (integer)  -- 차감된 연차의 발생 연도
used_at (timestamp)
```

### RPC 함수

#### `get_user_leave_status(p_user_id text)`
사용자의 전체 연차 현황을 한 번에 조회

**반환값**:
```typescript
{
  total: number       // 전체 발생 연차 (모든 연도)
  used: number        // 사용 완료
  reserved: number    // 예약
  remain: number      // 잔여
}
```

#### `reserve_leave(p_user_id, p_date, p_type, p_session)`
연차 신청 (유효성 검증 포함)

**파라미터**:
- `p_user_id`: 사용자 ID
- `p_date`: 날짜 (YYYY-MM-DD)
- `p_type`: 'FULL' | 'HALF'
- `p_session`: 'AM' | 'PM' | null

**반환값**:
```typescript
{
  success: boolean
  message: string
  reservation_id?: number
}
```

#### `approve_leave(p_reservation_id integer)`
연차 승인 (FIFO 방식으로 차감)

**반환값**:
```typescript
{
  success: boolean
  message: string
}
```

#### `cancel_leave(p_reservation_id integer)`
연차 취소

**반환값**:
```typescript
{
  success: boolean
  message: string
}
```

## 💡 기본 사용법

### API 응답 패턴
모든 API 함수는 `ApiResponse<T>` 형식 반환:
```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}
```

### 사용 예시
```typescript
// 1. 인증 (Zustand store 사용)
const { login } = useAuthStore()
await login('user@example.com', 'password')

// 2. 연차 조회
const result = await getUserLeaveStatus('U001')
if (result.success) console.log(result.data)

// 3. 연차 신청
await reserveLeave('U001', '2025-12-25', 'FULL', null)

// 4. 사용자 조회
await getAllUsers('ACTIVE')
```

자세한 사용법은 [API 상세 가이드](./api/README.md) 참조

## 🔒 보안 (RLS)

Row Level Security로 데이터 접근 제어:
- **일반 사용자**: 본인 데이터만 조회/수정
- **관리자**: 전체 데이터 조회/수정
- **조회 전용**: 읽기만 가능

## 🔄 타입 생성

Supabase CLI로 DB 스키마 → TypeScript 타입 자동 생성:
```bash
npx supabase gen types typescript --project-id <ID> > src/lib/supabase/types/database.types.ts
```

## 🧪 샘플 데이터

`seedAll()` 함수로 개발/테스트용 샘플 데이터 삽입 (사용자 3명, 연차 잔액, 예약, 이력)

## ⚠️ 주의사항

1. **API 함수 사용**: 직접 `supabase.from()` 호출보다 API 함수 사용 (에러 처리 및 타입 안전성)

2. **에러 처리**: `result.success` 확인 후 `result.data` 사용

3. **Auth 구독**: `subscribeToAuthChanges()`는 앱에서 1회만 호출 (App.tsx)

4. **RPC 함수**: 복잡한 로직(FIFO 차감 등)은 RPC 함수 사용

## 📖 참고 문서

- [Supabase 공식 문서](https://supabase.com/docs)
- [API 상세 가이드](./api/README.md)
