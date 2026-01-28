# Login 페이지

## 📋 개요

사용자가 시스템에 로그인하는 페이지입니다. 이메일/비밀번호 인증 및 샘플 데이터 삽입 기능을 제공합니다.

**경로**: `/login`

**인증 방식**: Supabase Email/Password Auth

## 🎯 주요 기능

### 1. 로그인
- 이메일/비밀번호 입력
- Supabase 인증 연동
- 로그인 성공 시 메인 페이지(`/`)로 리다이렉트
- 세션 자동 복원 (새로고침 시)

### 2. 샘플 데이터 삽입
- "샘플 데이터 삽입" 버튼 클릭
- Supabase 데이터베이스에 샘플 데이터 자동 생성
- 개발/테스트 환경에서 유용

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

### 샘플 데이터 API

#### `seedAll()` (`@/lib/supabase/seed.ts`)
```tsx
await seedAll()
```
- Supabase 데이터베이스에 샘플 데이터 삽입
- 사용자, 연차 잔액, 예약, 이력 생성

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
    ├── Form
    │   ├── 이메일 입력 (TextField)
    │   ├── 비밀번호 입력 (TextField)
    │   ├── 에러 메시지 (Callout - 빨강)
    │   ├── 플래시 알림 (Callout - 색상 가변)
    │   ├── 로그인 버튼
    │   ├── 샘플 데이터 삽입 버튼
    │   └── 테스트 계정 안내
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
const [isSeeding, setIsSeeding] = useState(false)
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

### 3. 샘플 데이터 삽입 프로세스
```
1. seedAll() 호출
2. Supabase에 데이터 삽입
3. 성공 메시지 표시
```

## 🎨 UI/UX

### Radix UI 컴포넌트
- `Card`: 로그인 폼 컨테이너
- `TextField.Root`: 입력 필드
- `Button`: 로그인, 샘플 데이터 버튼
- `Callout`: 에러/알림 메시지

### 디자인
- 배경: 그라데이션 (Blue 50 → White → Indigo 50)
- 카드 크기: 최대 420px
- 로고: Blue 100 배경의 원형 아이콘
- 그림자: `shadow-xl`

### 버튼 상태
- 로딩 중: disabled + 텍스트 변경
  - "로그인" → "로그인 중..."
  - "샘플 데이터 삽입" → "데이터 삽입 중..."

### 아이콘
- 로고: `Hospital` (Lucide React)
- 로그인 버튼: `LogIn`
- 샘플 데이터 버튼: `Database`
- 에러: `AlertCircle`

## 📊 데이터 타입

```typescript
interface FlashNotice {
  message: string
  tone?: 'blue' | 'green' | 'red' | 'amber'
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

### 샘플 데이터 에러
- 에러 발생 시: "샘플 데이터 삽입에 실패했습니다. 콘솔을 확인해주세요."
- 콘솔에 상세 에러 출력

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

### 테스트 계정
- 현재 주석 처리됨 (`{/*admin@support.com / admin!2*/}`)
- 실제 배포 시 제거 또는 환경별 분기 필요

### 플래시 알림
- `sessionStorage` 사용 (새로고침 시 유지 안됨)
- `consumeFlashNotice()` 호출 시 자동 삭제
- 다른 페이지에서도 사용 가능 (로그아웃 등)

### 리다이렉트
- `useNavigate()` 사용
- 로그인 성공 시 `/`로 이동
- `ProtectedRoute`에서 미인증 시 `/login`으로 리다이렉트

### 샘플 데이터
- 개발/테스트 환경에서만 노출 권장
- Production 환경에서는 버튼 숨김 또는 제거
