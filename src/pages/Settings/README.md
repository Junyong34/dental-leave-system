# Settings 페이지

## 📋 개요

시스템 설정 및 사용자 정보를 관리할 수 있는 페이지입니다.

**경로**: `/settings`

**현재 상태**: ⚠️ **미구현** (Placeholder만 존재)

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

### 3. 연차 정책 설정 (관리자 전용)
- 기본 연차 일수 설정
- 근속 가산 규칙 설정
- 그룹별 동시 사용 제한 설정

### 4. 휴일 관리 (관리자 전용)
- 공휴일 등록/수정/삭제
- 임시 휴무일 등록

### 5. 권한 관리 (관리자 전용)
- 사용자 권한 변경 (ADMIN/USER/VIEW)
- 그룹 관리

## 🔧 사용할 API (예정)

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

## 📦 계획된 컴포넌트 구조

```tsx
Settings
├── Tabs (설정 카테고리)
│   ├── 프로필
│   ├── 직원 관리 (관리자만)
│   ├── 연차 정책 (관리자만)
│   ├── 휴일 관리 (관리자만)
│   └── 권한 관리 (관리자만)
└── 각 Tab 컨텐츠
    ├── 프로필 탭
    │   ├── 이름 변경 폼
    │   ├── 비밀번호 변경 폼
    │   └── 알림 설정
    ├── 직원 관리 탭
    │   ├── 직원 목록 테이블
    │   ├── 신규 직원 등록 버튼
    │   └── 수정/삭제 액션
    └── ...
```

## 🎨 UI/UX 계획

### Radix UI 컴포넌트
- `Tabs`: 설정 카테고리 분류
- `Card`: 각 설정 섹션
- `TextField`: 입력 필드
- `Select`: 드롭다운 (그룹, 권한 등)
- `Switch`: 토글 (알림 설정 등)
- `Dialog`: 모달 (신규 등록, 수정)
- `AlertDialog`: 확인 다이얼로그 (삭제 확인)

### 레이아웃
- 최대 너비: 1000px
- 좌측: 탭 메뉴 (세로형) - 데스크톱
- 상단: 탭 메뉴 (가로형) - 모바일

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
- ✅ 프로필 탭만 접근 가능
- ✅ 본인 정보만 수정 가능

### 관리자 (ADMIN)
- ✅ 모든 탭 접근 가능
- ✅ 직원 관리, 정책 설정 가능

### 조회 전용 (VIEW)
- ✅ 읽기 전용
- ❌ 수정 불가

## 🚀 구현 단계

1. **1단계**: 프로필 관리
   - 이름 변경
   - 비밀번호 변경

2. **2단계**: 직원 관리
   - 목록 조회
   - CRUD 기능

3. **3단계**: 연차 정책 설정
   - 정책 조회
   - 정책 수정

4. **4단계**: 휴일 관리
   - 휴일 CRUD

5. **5단계**: 권한 관리
   - 권한 변경
   - 그룹 관리

## 📝 현재 코드

```tsx
export default function Settings() {
  return (
    <div>
      <h1>설정</h1>
      <p>시스템 설정 및 사용자 정보를 관리할 수 있습니다.</p>
    </div>
  );
}
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

- 권한에 따라 표시되는 탭이 달라야 함
- 비밀번호 변경 시 재로그인 필요
- 직원 삭제는 Soft Delete (status = 'RESIGNED')
- 연차 정책 변경 시 영향 범위 확인 필요
