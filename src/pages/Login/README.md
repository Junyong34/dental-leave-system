# Login 페이지

## 📋 개요

사용자가 시스템에 로그인하는 페이지입니다. 이메일/비밀번호 인증 및 가입 초대 요청 기능을 제공합니다.

**경로**: `/login`

**인증 방식**: Supabase Email/Password Auth

## 🎯 주요 기능

### 1. 로그인
- 이메일/비밀번호 입력
- Supabase 인증 연동
- 로그인 성공 시 메인 페이지(`/`)로 리다이렉트
- 세션 자동 복원 (새로고침 시)

### 2. 가입 초대 요청
- "가입 초대 요청" 탭에서 이메일과 이름(선택)을 입력
- 이메일 도메인 화이트리스트 검증 (gmail.com, naver.com, daum.net, kakao.com, outlook.com, icloud.com, nate.com)
- 요청 성공 시 `signup_requests` 테이블에 `PENDING` 상태로 저장
- 세션 스토리지 기반 중복 요청 방지 (브라우저 종료 시 초기화)

### 3. 플래시 알림
- 로그인 성공/실패 메시지 표시
- 세션 만료 등의 알림 표시
- `sessionStorage` 기반 일회성 알림

## 🔧 사용하는 API 및 유틸리티

### 인증 API

#### `useAuthStore.login()` (`@/store/authStore.ts`)
```tsx
const login = useAuthStore((state) => state.login)
const success = await login(email, password)
```
- Zustand 전역 상태 관리
- Supabase `loginWithEmail()` 래핑
- 로그인 성공 시 user, session 저장

#### `getSession()` (`@/lib/supabase/api/auth.ts`)
```tsx
const session = await getSession()
```
- 현재 세션 확인
- 로그인 후 세션 유효성 검증

### 가입 요청 API

#### `createSignupRequest()` (`@/lib/supabase/api/signupRequest.ts`)
```tsx
await createSignupRequest('user@example.com', '홍길동')
```
- 가입 초대 요청 생성
- 중복 요청은 DB UNIQUE 제약으로 방지

### 플래시 알림 유틸리티

#### `setFlashNotice()` (`@/utils/flashNotice.ts`)
```tsx
setFlashNotice({
  message: '로그인되었습니다.',
  tone: 'green'
})
```
- 플래시 알림 설정 (다음 페이지에서 표시)

#### `consumeFlashNotice()` (`@/utils/flashNotice.ts`)
```tsx
const flash = consumeFlashNotice()
```
- 플래시 알림 조회 및 제거 (1회용)

## 📦 컴포넌트 구조

```tsx
Login
├── Flex Container (중앙 정렬)
└── Card (로그인 폼)
    ├── 헤더
    │   ├── 로고 아이콘 (Hospital)
    │   ├── 타이틀: "연차 관리 시스템"
    │   └── 설명 텍스트
    ├── Tabs
    │   ├── 로그인
    │   └── 가입 초대 요청
    ├── 로그인 Form
    │   ├── 이메일 입력 (TextField)
    │   ├── 비밀번호 입력 (TextField)
    │   ├── 에러 메시지 (Callout - 빨강)
    │   ├── 플래시 알림 (Callout - 색상 가변)
    │   └── 로그인 버튼
    └── 가입 요청 Form
        ├── 이메일 입력 (TextField)
        ├── 이름 입력 (TextField, 선택)
        ├── 안내 메시지 (허용 도메인)
        ├── 에러 메시지 (Callout - 빨강)
        ├── 성공 메시지 (Callout - 초록)
        └── 가입 초대 요청 버튼
    └── (향후) 비밀번호 찾기 링크
```

## 🔄 데이터 흐름

### 1. 상태 관리
```tsx
const [email, setEmail] = useState('')
const [password, setPassword] = useState('')
const [error, setError] = useState('')
const [notice, setNotice] = useState<FlashNotice | null>(null)
const [isSubmitting, setIsSubmitting] = useState(false)
```

### 2. 로그인 프로세스
```
1. 사용자 입력 검증 (이메일, 비밀번호 필수)
2. login() 호출 (Zustand store)
3. Supabase 인증 수행
4. 세션 확인 (getSession)
5. 플래시 알림 설정
6. 메인 페이지로 리다이렉트
```

### 3. 가입 초대 요청 프로세스
```
1. 이메일 형식/도메인 검증
2. SessionStorage 중복 요청 확인
3. createSignupRequest() 호출
4. 성공 메시지 표시
```

## 🎨 UI/UX

### Radix UI 컴포넌트
- `Card`: 로그인 폼 컨테이너
- `TextField.Root`: 입력 필드
- `Button`: 로그인, 가입 요청 버튼
- `Callout`: 에러/알림 메시지

### 디자인
- 배경: 그라데이션 (Blue 50 → White → Indigo 50)
- 카드 크기: 최대 420px
- 로고: Blue 100 배경의 원형 아이콘
- 그림자: `shadow-xl`

### 버튼 상태
- 로딩 중: disabled + 텍스트 변경
  - "로그인" → "로그인 중..."
  - "가입 초대 요청" → "요청 중..."

### 아이콘
- 로고: `Hospital` (Lucide React)
- 로그인 버튼: `LogIn`
- 에러: `AlertCircle`
- 가입 요청 버튼: `Mail`
- 성공: `CheckCircle2`

## 📊 데이터 타입

```typescript
interface FlashNotice {
  message: string
  tone?: 'blue' | 'green' | 'yellow' | 'red'
}
```

## 🔐 인증 흐름

### 1. 로그인
```
User Input → authStore.login() → Supabase Auth
  ↓
Session Created → localStorage에 저장
  ↓
FlashNotice 설정 → Navigate('/') → Dashboard
```

### 2. 세션 복원
```
페이지 로드 → authStore.initialize()
  ↓
localStorage에서 세션 복원 → Supabase 유효성 검증
  ↓
유효하면 로그인 상태 유지 → 메인 페이지
유효하지 않으면 로그아웃 → 로그인 페이지
```

## ⚠️ 에러 처리

### 로그인 에러
| 에러 | 메시지 |
|------|--------|
| 빈 입력 | "이메일과 비밀번호를 입력해주세요." |
| 인증 실패 | "이메일 또는 비밀번호가 올바르지 않습니다." |
| 세션 없음 | "세션을 확인하지 못했습니다. 다시 시도해주세요." |

### 가입 요청 에러
| 에러 | 메시지 |
|------|--------|
| 빈 이메일 | "이메일을 입력해주세요." |
| 형식 오류 | "올바른 이메일 형식을 입력해주세요." |
| 허용 도메인 아님 | "허용된 이메일 도메인이 아닙니다." |
| 세션 중복 | "이미 이 세션에서 요청한 이메일입니다." |
| DB 중복 | "이미 요청된 이메일입니다." |

## 🚀 향후 개선 사항

1. **소셜 로그인**
   - Google, GitHub 등 OAuth 연동

2. **비밀번호 찾기**
   - `sendPasswordResetEmail()` 활용
   - 이메일로 재설정 링크 전송

3. **회원가입**
   - 신규 사용자 등록 페이지

4. **Remember Me**
   - 로그인 유지 옵션
   - 세션 만료 기간 연장

5. **2FA (Two-Factor Authentication)**
   - 이중 인증 추가

6. **CAPTCHA**
   - 봇 방지

## 📝 참고사항

### 플래시 알림
- `sessionStorage` 사용 (새로고침 시 유지 안됨)
- `consumeFlashNotice()` 호출 시 자동 삭제
- 다른 페이지에서도 사용 가능 (로그아웃 등)

### 리다이렉트
- `useNavigate()` 사용
- 로그인 성공 시 `/`로 이동
- `ProtectedRoute`에서 미인증 시 `/login`으로 리다이렉트
