# 가입 요청 관리 페이지

## 📋 개요

관리자가 신규 가입 초대 요청을 확인하고 승인/거부할 수 있는 페이지입니다.

**경로**: `/settings/signup-requests`

**권한**: ADMIN

## 🎯 주요 기능

### 1. 요청 목록 조회
- 이메일, 이름, 요청일, 상태, 처리일 표시
- 최신 요청 순 정렬

### 2. 상태 필터
- `전체`, `PENDING`, `APPROVED`, `REJECTED` 필터 제공

### 3. 승인 처리
- 승인 시 Edge Function 호출 → Supabase 초대 메일 발송
- 상태를 `APPROVED`로 업데이트

### 4. 거부 처리
- 거부 사유 입력 모달
- 상태를 `REJECTED`로 업데이트

## 🔧 사용하는 API

#### `getSignupRequests()` (`@/lib/supabase/api/signupRequest.ts`)
```tsx
const result = await getSignupRequests('PENDING')
```

#### `approveSignupRequest()` (`@/lib/supabase/api/signupRequest.ts`)
```tsx
await approveSignupRequest(1)
```

#### `rejectSignupRequest()` (`@/lib/supabase/api/signupRequest.ts`)
```tsx
await rejectSignupRequest(1, '도메인 불일치')
```

## 📦 컴포넌트 구조

```tsx
SignupRequests
├── RequestTable
│   ├── 요청 목록 테이블
│   └── 승인/거부 버튼
└── RejectModal
    ├── 거부 사유 입력
    └── 관리자 메모 (선택)
```

## ⚠️ 처리 흐름

### 승인
```
요청 선택 → approveSignupRequest() →
Edge Function (approve-signup) →
inviteUserByEmail() →
DB 상태 업데이트 (APPROVED)
```

### 거부
```
요청 선택 → rejectSignupRequest() →
DB 상태 업데이트 (REJECTED)
```
