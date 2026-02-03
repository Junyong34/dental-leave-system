# Settings 페이지

## 📋 개요

시스템 설정 및 사용자 정보를 관리할 수 있는 페이지입니다.

**경로**: `/settings`

**현재 상태**: ✅ 주요 관리 기능 구현됨 (연차 관리, 유저 히스토리, 야간 진료, 가입 요청 관리)

## ✅ 현재 구현된 메뉴

- 일반 설정 (`/settings`)
- 연차 개수 관리 (`/settings/leave-management`)
- 가입 요청 관리 (`/settings/signup-requests`)
- 유저 히스토리 데이터 조회 (`/settings/history`)
- 야간 진료 관리 (`/settings/night-shift`)

## 🎯 계획된 주요 기능

### 1. 사용자 프로필 관리
- 이름 변경
- 비밀번호 변경
- 알림 설정

### 2. 직원 관리 (관리자 전용)
- 직원 목록 조회
- 신규 직원 등록
- 직원 정보 수정
- 퇴사 처리 (Soft Delete)

### 3. 가입 요청 관리 (관리자 전용)
- 가입 초대 요청 목록 조회
- 상태 필터 (PENDING/APPROVED/REJECTED)
- 승인 시 Supabase 초대 메일 발송
- 거부 사유 및 메모 기록

### 4. 연차 정책 설정 (관리자 전용)
- 기본 연차 일수 설정
- 근속 가산 규칙 설정
- 그룹별 동시 사용 제한 설정

### 5. 휴일 관리 (관리자 전용)
- 공휴일 등록/수정/삭제
- 임시 휴무일 등록

### 6. 권한 관리 (관리자 전용)
- 사용자 권한 변경 (ADMIN/USER/VIEW)
- 그룹 관리

## 🔧 사용하는/예정 API

### 사용자 관리 API

#### `getCurrentUser()` (`@/lib/supabase/api/auth.ts`)
```tsx
const user = await getCurrentUser()
```
- 현재 로그인한 사용자 정보 조회

#### `updatePassword()` (`@/lib/supabase/api/auth.ts`)
```tsx
const result = await updatePassword(newPassword)
```
- 비밀번호 변경

#### `getAllUsers()` (`@/lib/supabase/api/user.ts`)
```tsx
const result = await getAllUsers('ACTIVE')
```
- 전체 사용자 목록 조회 (관리자)

#### `updateUser()` (`@/lib/supabase/api/user.ts`)
```tsx
await updateUser(userId, {
  name: '홍길동',
  group_id: 'G02'
})
```
- 사용자 정보 수정

#### `createUser()` (`@/lib/supabase/api/user.ts`)
```tsx
await createUser({
  user_id: 'U005',
  name: '신입사원',
  join_date: '2025-01-01',
  group_id: 'G01',
  role: 'USER',
  status: 'ACTIVE'
})
```
- 신규 사용자 등록

#### `deleteUser()` (`@/lib/supabase/api/user.ts`)
```tsx
await deleteUser(userId)
```
- 사용자 퇴사 처리 (Soft Delete)

### 가입 요청 관리 API

#### `getSignupRequests()` (`@/lib/supabase/api/signupRequest.ts`)
```tsx
const result = await getSignupRequests('PENDING')
```
- 가입 요청 목록 조회

#### `approveSignupRequest()` (`@/lib/supabase/api/signupRequest.ts`)
```tsx
await approveSignupRequest(1)
```
- Edge Function 호출 → 초대 메일 발송 및 승인 처리

#### `rejectSignupRequest()` (`@/lib/supabase/api/signupRequest.ts`)
```tsx
await rejectSignupRequest(1, '도메인 불일치', '내부 정책 확인 필요')
```
- 거부 사유 기록 및 상태 업데이트

## 📦 컴포넌트 구조

```tsx
Settings
├── 좌측 메뉴 (NavLink + Button)
│   ├── 일반 설정
│   ├── 연차 개수 관리
│   ├── 가입 요청 관리
│   ├── 유저 히스토리 데이터 조회
│   └── 야간 진료 관리
└── Outlet (선택된 설정 페이지)
```

## 🎨 UI/UX 계획

### Radix UI 컴포넌트
- `Button`: 설정 메뉴 버튼
- `Separator`: 좌/우 영역 구분
- `Card`: 각 설정 섹션
- `TextField`, `Select`, `Dialog`: 개별 설정 페이지에서 사용

### 레이아웃
- 최대 너비: 1000px
- 좌측: 메뉴 버튼 (세로형) - 데스크톱
- 상단: 메뉴 버튼 스택 - 모바일

## 📊 데이터 타입

```typescript
interface User {
  user_id: string
  name: string
  join_date: string
  group_id: string
  role: UserRole        // 'ADMIN' | 'USER' | 'VIEW'
  status: UserStatus    // 'ACTIVE' | 'INACTIVE' | 'RESIGNED'
}

interface ProfileUpdate {
  name?: string
  password?: string
  email?: string
}
```

## 🔐 권한 제어

### 일반 사용자 (USER)
- ❌ 설정 페이지 접근 불가 (현재 RoleRoute: ADMIN 전용)

### 관리자 (ADMIN)
- ✅ 모든 메뉴 접근 가능
- ✅ 직원 관리, 정책 설정 가능

### 조회 전용 (VIEW)
- ❌ 설정 페이지 접근 불가 (현재 RoleRoute: ADMIN 전용)

## 🚀 구현 단계

1. **1단계**: 프로필 관리
   - 이름 변경
   - 비밀번호 변경

2. **2단계**: 직원 관리
   - 목록 조회
   - CRUD 기능

3. **3단계**: 가입 요청 관리
   - 목록 조회 및 필터
   - 승인/거부 처리
   - 초대 메일 발송

4. **4단계**: 연차 정책 설정
   - 정책 조회
   - 정책 수정

5. **5단계**: 휴일 관리
   - 휴일 CRUD

6. **6단계**: 권한 관리
   - 권한 변경
   - 그룹 관리

## 📝 현재 코드 (요약)

```tsx
const menuItems = [
  { label: '일반 설정', path: '/settings' },
  { label: '연차 개수 관리', path: '/settings/leave-management' },
  { label: '가입 요청 관리', path: '/settings/signup-requests' },
  { label: '유저 히스토리 데이터 조회', path: '/settings/history' },
  { label: '야간 진료 관리', path: '/settings/night-shift' },
]

return (
  <Flex>
    <NavLink>...</NavLink>
    <Outlet />
  </Flex>
)
```

## 🔗 필요한 추가 기능

### Supabase Functions (RPC)
- `update_user_profile()`: 프로필 업데이트
- `get_system_settings()`: 시스템 설정 조회
- `update_system_settings()`: 시스템 설정 변경

### 환경 변수
- `VITE_ENABLE_USER_MANAGEMENT`: 사용자 관리 기능 활성화 여부
- `VITE_ENABLE_POLICY_SETTINGS`: 정책 설정 기능 활성화 여부

## 📌 참고사항

- 권한에 따라 표시되는 메뉴가 달라야 함
- 비밀번호 변경 시 재로그인 필요
- 직원 삭제는 Soft Delete (status = 'RESIGNED')
- 연차 정책 변경 시 영향 범위 확인 필요
