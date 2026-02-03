# 더와이즈 치과병원 연차 관리 시스템

더와이즈 치과병원 직원(약 80명)의 연차를 효율적으로 관리하기 위한 웹 기반 시스템입니다.

## 빠른 시작

1. 환경 변수 파일 준비

`.env.local`, `.env.qa`, `.env.production`에 아래 값을 설정합니다.

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-anon-key
```

2. 의존성 설치

```bash
pnpm install
```

3. 개발 서버 실행

```bash
pnpm dev      # development
pnpm dev:qa   # QA
```

빌드/테스트/포맷 명령어는 `CLAUDE.md`를 참고하세요.

---

## 문서 링크

- `AGENTS.md` - 프로젝트 구조/라우트 맵
- `ARCHITECTURE.md` - 시스템 설계 및 기술 스택
- `DEVELOPMENT.md` - 개발 컨벤션 및 워크플로우
- `CLAUDE.md` - 명령어/환경/주의사항 퀵 레퍼런스
- `PRD.md` - 제품 요구 사항 정의서
- `src/lib/supabase/schema.sql` - 데이터베이스 스키마
- `docs/pages/ROUTES.md` - 라우트 인덱스
- `docs/pages/LeaveCalendar-PRD.md` - 캘린더 기능 상세
- `docs/pages/NightShift-PRD.md` - 야간 진료 기능 상세

---

## 주요 기능

- 연차 관리: 신청/승인/취소 + FIFO 차감
- 캘린더 뷰: FullCalendar 기반 시각화
- 야간 진료 통계: 직원별 야간 근무 요일 통계
- 대시보드: 팀원별 연차 현황 (ADMIN)
- 권한 관리: ADMIN/USER/VIEW 역할 기반 접근 제어

---

## 라이선스

MIT
