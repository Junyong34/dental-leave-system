# 치과병원 연차 관리 시스템 - 프로젝트 구조

## 📋 프로젝트 개요

더와이즈 치과병원의 약 80명 직원을 위한 웹 기반 연차 관리 시스템입니다. 법적 기준을 준수하며 연차 신청, 승인, 통계 관리 등의 기능을 제공합니다.

## 🛠 기술 스택

### Frontend Core
- **React** 19.2.0
- **TypeScript** 5.9.3
- **Vite** 6.0.0
- **React Router** 7.13.0

### UI/Styling
- **Radix UI Themes** 3.2.1 - UI 컴포넌트 라이브러리
- **Tailwind CSS** 4.1.18 - 유틸리티 우선 CSS 프레임워크
- **Lucide React** 0.562.0 - 아이콘 라이브러리
- **Class Variance Authority** 0.7.1 - 타입 안전 스타일 관리
- **clsx** 2.1.1 & **tailwind-merge** 3.4.0 - 클래스명 관리

### 폼 & 상태 관리
- **React Hook Form** 7.71.1 - 폼 상태 관리
- **Zustand** 5.0.10 - 경량 상태 관리 라이브러리
- **date-fns** 4.1.0 - 날짜 유틸리티

### 개발 도구
- **Biome** 2.3.11 - 린터 & 포매터
- **Babel React Compiler** 1.0.0 - React 컴파일러 플러그인

## 📁 프로젝트 구조

```
dental-leave-system/
├── src/
│   ├── api/                    # API 통신 로직
│   ├── assets/                 # 정적 리소스 (이미지, 폰트 등)
│   ├── components/
│   │   ├── auth/              # 인증 관련 컴포넌트
│   │   │   └── ProtectedRoute.tsx    # 라우트 보호 HOC
│   │   └── layout/            # 레이아웃 컴포넌트
│   │       └── Layout.tsx     # 메인 레이아웃 (네비게이션, 헤더)
│   ├── hooks/                 # 커스텀 React 훅
│   ├── lib/                   # 외부 라이브러리 설정
│   ├── pages/                 # 페이지 컴포넌트
│   │   ├── Dashboard/         # 대시보드 (메인 화면)
│   │   │   └── index.tsx
│   │   ├── LeaveApproval/     # 연차 승인 페이지
│   │   │   └── index.tsx
│   │   ├── LeaveHistory/      # 연차 내역 페이지
│   │   │   └── index.tsx
│   │   ├── LeaveRequest/      # 연차 신청 페이지
│   │   │   └── index.tsx
│   │   ├── Login/             # 로그인 페이지
│   │   │   └── index.tsx
│   │   └── Settings/          # 설정 페이지
│   │       └── index.tsx
│   ├── router/                # 라우팅 설정
│   │   └── index.tsx          # React Router 설정
│   ├── store/                 # 상태 관리
│   │   └── authStore.ts       # 인증 상태 (Zustand)
│   ├── types/                 # TypeScript 타입 정의
│   ├── utils/                 # 유틸리티 함수
│   ├── App.tsx               # 루트 컴포넌트
│   ├── App.css               # 앱 전역 스타일
│   ├── main.tsx              # 엔트리 포인트
│   └── index.css             # 글로벌 CSS (Tailwind 포함)
├── public/                    # 정적 파일
├── .gitignore
├── biome.json                # Biome 설정
├── components.json           # Radix UI 설정
├── index.html                # HTML 엔트리
├── package.json
├── postcss.config.js         # PostCSS 설정
├── tailwind.config.js        # Tailwind 설정
├── tsconfig.json             # TypeScript 설정 (루트)
├── tsconfig.app.json         # 앱용 TypeScript 설정
├── tsconfig.node.json        # Node용 TypeScript 설정
└── vite.config.ts            # Vite 설정
```

## 🔐 인증 시스템

### 구현 방식
- **Zustand** + **persist** 미들웨어를 사용한 클라이언트 상태 관리
- localStorage에 인증 상태 저장
- ProtectedRoute로 인증된 사용자만 접근 가능

### 인증 스토어 (src/store/authStore.ts:1)
```typescript
interface AuthState {
  isAuthenticated: boolean
  username: string | null
  login: (username: string, password: string) => boolean
  logout: () => void
}
```

### 테스트 계정
- **아이디**: admin
- **비밀번호**: admin

## 🗺 라우팅 구조

### 라우트 설정 (src/router/index.tsx:11)

| 경로 | 컴포넌트 | 설명 | 보호 여부 |
|------|---------|------|----------|
| `/login` | Login | 로그인 페이지 | 공개 |
| `/` | Dashboard | 대시보드 (메인) | 보호됨 |
| `/request` | LeaveRequest | 연차 신청 | 보호됨 |
| `/approval` | LeaveApproval | 연차 승인 | 보호됨 |
| `/history` | LeaveHistory | 연차 내역 | 보호됨 |
| `/settings` | Settings | 설정 | 보호됨 |

모든 보호된 라우트는 `ProtectedRoute` 컴포넌트로 래핑되어 있으며, `Layout` 컴포넌트 내에서 렌더링됩니다.

## 🎨 UI 구성

### 레이아웃 (src/components/layout/Layout.tsx:6)
- **네비게이션 바**: 상단 고정, 반응형 디자인
- **모바일 메뉴**: 햄버거 메뉴로 전환
- **사용자 정보**: 우측 상단에 사용자명 및 로그아웃 버튼
- **콘텐츠 영역**: Outlet을 통한 페이지 렌더링

### 디자인 시스템
- **Radix UI**: 접근성 우선 컴포넌트
- **Tailwind CSS**: 유틸리티 클래스 기반 스타일링
- **Lucide Icons**: 일관된 아이콘 세트

## 📦 주요 기능

### 1. 로그인 (src/pages/Login/index.tsx:15)
- Radix UI Card, TextField, Button 사용
- 폼 유효성 검사
- 에러 메시지 표시 (Callout 컴포넌트)

### 2. 대시보드 (src/pages/Dashboard/index.tsx)
- 개인 연차 현황 요약
- 사용 예정 일정 표시
- React Router loader를 통한 데이터 프리로드

### 3. 연차 신청 (src/pages/LeaveRequest/index.tsx)
- 캘린더 기반 날짜 선택
- 충돌 감지 및 경고
- 실시간 잔여 연차 표시

### 4. 연차 승인 (src/pages/LeaveApproval/index.tsx)
- 대기 중인 신청 목록
- 승인/반려 처리
- 그룹 충돌 확인

### 5. 연차 내역 (src/pages/LeaveHistory/index.tsx)
- 연차 사용 이력 조회
- 필터링 및 검색
- 히스토리 로그

### 6. 설정 (src/pages/Settings/index.tsx)
- 직원 정보 관리
- 정책 설정

## 🔧 개발 설정

### Path Alias (vite.config.ts:14)
```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
}
```

`@/` 경로로 `src/` 디렉토리에 절대 경로 접근 가능

### 스타일
Radix UI Themes 문법 사용 
gap-4 [X]
rt-r-gap-4 [O]

### React Compiler
Babel React Compiler 플러그인 활성화로 자동 최적화

### Biome 설정
- 린팅: `npm run lint`
- 자동 수정: `npm run lint:fix`
- 포맷팅: `npm run format`

## 🚀 실행 방법

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 미리보기
npm run preview

# 린트 검사
npm run lint

# 코드 포맷팅
npm run format
```

## 📊 데이터 구조

### 직원 정보
```typescript
interface Employee {
  id: string
  name: string
  joinDate: string
  groupId: string
  position: string
  isActive: boolean
}
```

### 연차 계정
```typescript
interface LeaveAccount {
  employeeId: string
  year: number
  total: number
  carryOver: number
  used: number
  planned: number
  remain: number
}
```

### 연차 신청
```typescript
interface LeaveRequest {
  requestId: string
  employeeId: string
  date: string
  status: 'pending' | 'approved' | 'rejected'
  yearSource: number
  createdAt: string
}
```

## 📝 연차 정책

### 발생 규칙
- 기본: 연 15일
- 근속 2년 초과 시마다 1일 증가
- 최대: 25일

### 사용 제한
- 일요일 사용 불가
- 그룹 내 동일 날짜 다수 사용 제한

### 이월 규칙
- 미사용 연차 이월 가능 (1년)
- 2년 이상 누적 불가

### 차감 우선순위
1. 직전연도 이월분
2. 당해연도 연차

## 🎯 개발 중점 사항

1. **타입 안정성**: TypeScript 엄격 모드 사용
2. **접근성**: Radix UI로 ARIA 준수
3. **반응형**: 모바일 우선 디자인
4. **성능**: React Compiler 자동 최적화
5. **코드 품질**: Biome으로 일관된 코드 스타일

## 📌 Git 상태

### 현재 브랜치
- `main`

### 변경 사항
- 프로젝트 초기 셋업 완료
- 로그인 페이지 구현
- 레이아웃 및 라우팅 설정
- 인증 시스템 구축
- 페이지 스켈레톤 생성

### 최근 커밋
- Radix UI 및 Floating UI 라이브러리 추가
- TailwindCSS 및 FullCalendar 설정
- ESLint 제거 및 Biome 도입
- Vite React 프로젝트 환경 셋팅
