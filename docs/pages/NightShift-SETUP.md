# 야간 근무 관리 시스템 설정 가이드

## 1. 데이터베이스 스키마 적용

### Supabase SQL Editor에서 실행

1. Supabase 대시보드 접속
2. SQL Editor 메뉴 클릭
3. `src/lib/supabase/schema.sql` 파일의 **야간 근무 관련 부분**을 복사하여 실행

#### 실행할 SQL (schema.sql의 해당 부분)

```sql
-- ================================================================
-- 야간 근무 관리 (Night Shift Management)
-- ================================================================

-- 5. EMPLOYEES 테이블
CREATE TABLE IF NOT EXISTS employees (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_employees_user_id ON employees(user_id);
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_employees_name ON employees(name);

COMMENT ON TABLE employees IS '직원 정보 (회원가입 없이도 추가 가능)';

-- 6. NIGHT_SHIFT_CONFIG 테이블
CREATE TABLE IF NOT EXISTS night_shift_config (
  id BIGSERIAL PRIMARY KEY,
  weekday TEXT NOT NULL CHECK (weekday IN ('MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(weekday)
);

CREATE INDEX idx_night_shift_config_is_active ON night_shift_config(is_active);

COMMENT ON TABLE night_shift_config IS '야간 진료 요일 설정';

-- 7. NIGHT_SHIFT_RECORDS 테이블
CREATE TABLE IF NOT EXISTS night_shift_records (
  id BIGSERIAL PRIMARY KEY,
  employee_id BIGINT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  work_date DATE NOT NULL,
  weekday TEXT NOT NULL CHECK (weekday IN ('MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, work_date)
);

CREATE INDEX idx_night_shift_records_employee_id ON night_shift_records(employee_id);
CREATE INDEX idx_night_shift_records_work_date ON night_shift_records(work_date);
CREATE INDEX idx_night_shift_records_weekday ON night_shift_records(weekday);
CREATE INDEX idx_night_shift_records_employee_date ON night_shift_records(employee_id, work_date DESC);

COMMENT ON TABLE night_shift_records IS '직원별 야간 근무 기록';

-- RPC 함수들...
-- (schema.sql의 RPC 함수 부분 전체 복사)

-- RLS 정책...
-- (schema.sql의 RLS 정책 부분 전체 복사)

-- 트리거...
-- (schema.sql의 트리거 부분 전체 복사)
```

> **💡 Tip**: `src/lib/supabase/schema.sql` 파일의 `-- ================================================================ -- 야간 근무 관리 (Night Shift Management)` 부분부터 끝까지 전체를 복사하여 실행하세요.

---

## 2. 샘플 데이터 생성

### 테스트용 직원 및 기록 생성

1. Supabase SQL Editor에서 실행
2. `src/lib/supabase/nightShiftSampleData.sql` 파일 전체 복사
3. 실행

#### 생성되는 샘플 데이터

- **직원 3명**:
  - 김철수 (화요일 위주)
  - 이영희 (수요일 위주)
  - 박민수 (목요일 위주)

- **야간 요일 설정**: 화수목 활성화

- **야간 근무 기록**: 2025년 1~2월 약 30건
  - 김철수: 화요일 7회, 수요일 1회
  - 이영희: 수요일 7회, 목요일 1회
  - 박민수: 목요일 8회

---

## 3. 프론트엔드 확인

### 야간 근무 통계 페이지

1. 로그인 후 상단 네비게이션에서 **"야간 근무"** 클릭
2. URL: `http://localhost:5173/night-shift-stats`
3. 기능:
   - 연도/월/직원 필터링
   - 직원별 요일 통계 카드
   - 가장 많이 근무한 요일 하이라이트
   - CSV 내보내기

**예상 결과**:
- 김철수: 화요일 7회 (하이라이트), 수요일 1회
- 이영희: 수요일 7회 (하이라이트), 목요일 1회
- 박민수: 목요일 8회 (하이라이트)

### 야간 근무 관리 페이지 (ADMIN 전용)

1. ADMIN 계정으로 로그인
2. 상단 네비게이션에서 **"설정"** 클릭
3. 좌측 메뉴에서 **"야간 근무 관리"** 클릭
4. URL: `http://localhost:5173/settings/night-shift`
5. 기능:
   - **섹션 1**: 야간 요일 설정 (토글로 활성화/비활성화)
   - **섹션 2**: 직원 관리 (추가/삭제)
   - **섹션 3**: 야간 근무 기록 (날짜별 배정 및 삭제)

---

## 4. 데이터 확인 SQL 쿼리

### 직원 목록 확인

```sql
SELECT * FROM employees ORDER BY name;
```

### 야간 요일 설정 확인

```sql
SELECT * FROM night_shift_config ORDER BY weekday;
```

### 야간 근무 기록 확인 (최근 20건)

```sql
SELECT
  e.name as 직원명,
  nsr.work_date as 근무날짜,
  nsr.weekday as 요일
FROM night_shift_records nsr
JOIN employees e ON e.id = nsr.employee_id
ORDER BY nsr.work_date DESC
LIMIT 20;
```

### 직원별 월별 통계 (2025년 2월)

```sql
SELECT
  e.name as 직원명,
  get_night_shift_stats(e.id, 2025, 2) as 월별통계
FROM employees e
ORDER BY e.name;
```

**예상 결과**:
```json
김철수: {"TUE": 3}
이영희: {"WED": 3}
박민수: {"THU": 3}
```

### 직원별 연도별 통계 (2025년)

```sql
SELECT
  e.name as 직원명,
  get_night_shift_stats(e.id, 2025) as 연도별통계
FROM employees e
ORDER BY e.name;
```

**예상 결과**:
```json
김철수: {"TUE": 7, "WED": 1}
이영희: {"WED": 7, "THU": 1}
박민수: {"THU": 8}
```

---

## 5. RLS 정책 확인

### 권한 테스트

- **인증된 사용자**: 모든 데이터 조회 가능
- **ADMIN**: 모든 데이터 수정/삭제 가능
- **일반 사용자**: 조회만 가능

---

## 6. API 사용 예시 (TypeScript)

### 직원 목록 조회

```typescript
import { getAllEmployees } from '@/lib/supabase/api/nightShift'

const result = await getAllEmployees('ACTIVE')
if (result.success) {
  console.log(result.data) // [{ id: 1, name: '김철수', ... }, ...]
}
```

### 직원별 통계 조회 (2025년 2월)

```typescript
import { getNightShiftStats } from '@/lib/supabase/api/nightShift'

const result = await getNightShiftStats(1, 2025, 2)
if (result.success) {
  console.log(result.data) // { TUE: 3 }
}
```

### 전체 직원 통계 조회 (2025년)

```typescript
import { getAllEmployeesNightShiftStats } from '@/lib/supabase/api/nightShift'

const result = await getAllEmployeesNightShiftStats(2025)
if (result.success) {
  result.data?.forEach(emp => {
    console.log(`${emp.employee_name}:`, emp.stats)
  })
}
```

### 야간 근무 기록 추가

```typescript
import { createNightShiftRecord } from '@/lib/supabase/api/nightShift'

const result = await createNightShiftRecord(1, '2025-02-25')
if (result.success) {
  console.log('기록 추가 완료')
}
```

---

## 7. 문제 해결 (Troubleshooting)

### Q1: "employees 테이블이 없습니다" 오류

**해결**: schema.sql의 야간 근무 부분을 다시 실행하세요.

### Q2: "RPC 함수를 찾을 수 없습니다" 오류

**해결**: schema.sql의 RPC 함수 부분(`CREATE OR REPLACE FUNCTION...`)을 실행하세요.

### Q3: 샘플 데이터가 보이지 않습니다

**해결**:
1. SQL Editor에서 `SELECT * FROM employees;` 실행
2. 데이터가 없으면 `nightShiftSampleData.sql` 재실행
3. RLS 정책 확인: 로그인된 사용자가 있는지 확인

### Q4: "Not authorized" 오류

**해결**:
- 로그인 확인
- ADMIN 권한 필요한 작업은 ADMIN 계정으로 로그인
- `users` 테이블에서 role 확인: `SELECT user_id, name, role FROM users;`

---

## 8. 다음 단계

### 실제 운영 시

1. **샘플 데이터 삭제**:
   ```sql
   DELETE FROM night_shift_records;
   DELETE FROM employees;
   ```

2. **실제 직원 추가**:
   - `/settings/night-shift` 페이지에서 직원 추가
   - 또는 SQL로 직접 추가

3. **야간 요일 설정**:
   - `/settings/night-shift` 페이지에서 요일 활성화/비활성화

4. **야간 근무 기록**:
   - `/settings/night-shift` 페이지에서 날짜별 직원 배정

5. **통계 확인**:
   - `/night-shift-stats` 페이지에서 통계 확인
   - CSV 내보내기로 보고서 생성

---

## 참고 문서

- [NightShift-PRD.md](./NightShift-PRD.md) - 전체 기능 명세
- [README.ko.md](./README.ko.md) - 라우트 개요
- [schema.sql](../../src/lib/supabase/schema.sql) - 데이터베이스 스키마
