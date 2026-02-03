# DEVELOPMENT.md - 워크플로우 & 컨벤션

> **목적**: 개발 워크플로우, 코딩 컨벤션, 프로젝트 셋업.


## 코드 스타일

### Biome 설정

이 프로젝트는 **Biome**만 사용합니다 (ESLint/Prettier 사용 금지). 설정은 `biome.json`에 있습니다.

| 설정 | 값 |
|---------|---------|
| 따옴표 | Single quotes |
| 세미콜론 | 필요 시 |
| 들여쓰기 | 2 spaces |
| 라인 폭 | 80 |

코드 품질 관련 명령어는 `CLAUDE.md`를 참고하세요.

---

## 파일 구조 규칙

### 컴포넌트 구성

```
src/components/
  auth/           # 인증 관련 (AuthProvider, ProtectedRoute, RoleRoute)
  common/         # 재사용 컴포넌트
  dashboard/      # 대시보드 전용 컴포넌트
  layout/         # 레이아웃 컴포넌트 (Header, Navigation, Layout)
```

### 페이지 구성

```
src/pages/
  PageName/
    index.tsx     # 메인 페이지 컴포넌트
    components/   # 페이지 전용 컴포넌트 (선택)
```

### API 레이어

```
src/lib/supabase/
  api/
    auth.ts       # 인증
    leave.ts      # 연차 작업
    user.ts       # 사용자 작업
    nightShift.ts # 야간 근무 작업
  types/
    database.types.ts  # Supabase 자동 생성
  client.ts       # Supabase 클라이언트 싱글톤
  config.ts       # 환경 설정
```

---

## Import 컨벤션

### Path Alias

절대경로는 `@/`를 사용합니다:

```typescript
// Good
import { supabase } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/authStore'

// Avoid
import { supabase } from '../../../lib/supabase/client'
```

### Import 순서

1. 외부 패키지 (react, 라이브러리)
2. 내부 모듈 (@/)
3. 상대 경로 (./)
4. 스타일

---

## 컴포넌트 컨벤션

### 네이밍

- 컴포넌트: PascalCase (`LeaveRequest.tsx`)
- 훅: `use` 접두어 + camelCase (`useUserProfile.ts`)
- 유틸: camelCase (`formatDate.ts`)
- 타입: PascalCase (`UserProfile`)

### 컴포넌트 구조

```tsx
// 1. Imports
import { useState } from 'react'
import { Button } from '@radix-ui/themes'

// 2. Types
interface Props {
  userId: string
}

// 3. Component
export function ComponentName({ userId }: Props) {
  // Hooks
  const [state, setState] = useState()
  
  // Handlers
  const handleClick = () => {}
  
  // Render
  return <div>...</div>
}
```

### Radix UI Themes

Radix UI Themes의 gap 문법을 사용하세요:

```tsx
// Correct
<Flex className="rt-r-gap-4">

// Incorrect (동작하지 않음)
<Flex className="gap-4">
```

---

## 상태 관리

### 언제 무엇을 쓸지

| 상태 종류 | 솔루션 |
|------------|----------|
| Auth/Session | `authStore` (Zustand) |
| 폼 데이터 | React Hook Form |
| 서버 데이터 | 마운트 시 조회, 캐싱 없음 |
| UI 상태 | 로컬 `useState` |

### Auth Store 사용 예시

```typescript
import { useAuthStore } from '@/store/authStore'

function Component() {
  const { user, userProfile, isAuthenticated, logout } = useAuthStore()
  
  if (!isAuthenticated) return <Navigate to="/login" />
}
```

---

## 테스트

### 프레임워크

- **Vitest** + **happy-dom** (jsdom 사용 금지)
- **Testing Library**로 React 컴포넌트 테스트

테스트 실행 명령어는 `CLAUDE.md`를 참고하세요.

### 테스트 파일 위치

```
src/
  components/
    Button.tsx
    Button.test.tsx   # 같은 위치에 둠
```

---

## 타입 생성

스키마 변경 후 DB 타입 재생성:

```bash
npx supabase gen types typescript \
  --project-id <PROJECT_ID> \
  > src/lib/supabase/types/database.types.ts
```

---

## Git 컨벤션

### 브랜치 네이밍 & 커밋 메시지

[$GIT_BRANCH_NAME][prefix]: title

- code update message

[prefix List]
[feat]새로운 기능 추가
[add]모듈 및 라이브러리 추가
[fix]오류 수정 오타 수정
[docs]마크다운, 문서 작업
[refactor]코드 리팩토링
[perf]성능 개선
[test]	테스트 코드 관련 작업
[build]	빌드 시스템 관련 작업
[ci]	CI 관련 설정 작업
[revert]	이전 작업 취소

---

## 관련 문서

- [CLAUDE.md](CLAUDE.md) - 명령어 및 주의사항 요약
- [ARCHITECTURE.md](ARCHITECTURE.md) - 시스템 설계와 패턴
- [biome.json](biome.json) - Biome 설정
