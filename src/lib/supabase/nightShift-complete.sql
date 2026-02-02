-- ================================================================
-- 야간 근무 관리 시스템 - 완전 설치 스크립트
-- ================================================================
-- 이 파일 하나만 Supabase SQL Editor에서 실행하면 됩니다!
-- 1. 테이블 생성
-- 2. RPC 함수 생성
-- 3. RLS 정책 설정
-- 4. 샘플 데이터 추가
-- ================================================================

-- ================================================================
-- PART 1: 테이블 생성
-- ================================================================

-- EMPLOYEES 테이블
CREATE TABLE IF NOT EXISTS employees (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_employees_user_id ON employees(user_id);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);
CREATE INDEX IF NOT EXISTS idx_employees_name ON employees(name);

COMMENT ON TABLE employees IS '직원 정보 (회원가입 없이도 추가 가능)';

-- NIGHT_SHIFT_CONFIG 테이블
CREATE TABLE IF NOT EXISTS night_shift_config (
  id BIGSERIAL PRIMARY KEY,
  weekday TEXT NOT NULL CHECK (weekday IN ('MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(weekday)
);

CREATE INDEX IF NOT EXISTS idx_night_shift_config_is_active ON night_shift_config(is_active);

COMMENT ON TABLE night_shift_config IS '야간 진료 요일 설정';

-- NIGHT_SHIFT_RECORDS 테이블
CREATE TABLE IF NOT EXISTS night_shift_records (
  id BIGSERIAL PRIMARY KEY,
  employee_id BIGINT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  work_date DATE NOT NULL,
  weekday TEXT NOT NULL CHECK (weekday IN ('MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, work_date)
);

CREATE INDEX IF NOT EXISTS idx_night_shift_records_employee_id ON night_shift_records(employee_id);
CREATE INDEX IF NOT EXISTS idx_night_shift_records_work_date ON night_shift_records(work_date);
CREATE INDEX IF NOT EXISTS idx_night_shift_records_weekday ON night_shift_records(weekday);
CREATE INDEX IF NOT EXISTS idx_night_shift_records_employee_date ON night_shift_records(employee_id, work_date DESC);

COMMENT ON TABLE night_shift_records IS '직원별 야간 근무 기록';

-- ================================================================
-- PART 2: RPC 함수 생성
-- ================================================================

-- 직원별 야간 근무 통계 조회
CREATE OR REPLACE FUNCTION public.get_night_shift_stats(
  p_employee_id BIGINT,
  p_year INTEGER,
  p_month INTEGER DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_stats jsonb;
BEGIN
  IF NOT (is_admin() OR is_view() OR auth.uid() IS NOT NULL) THEN
    RAISE EXCEPTION 'Not authorized.';
  END IF;

  SELECT COALESCE(jsonb_object_agg(weekday, count), '{}'::jsonb)
  INTO v_stats
  FROM (
    SELECT
      weekday,
      COUNT(*)::integer as count
    FROM night_shift_records
    WHERE employee_id = p_employee_id
      AND EXTRACT(YEAR FROM work_date) = p_year
      AND (p_month IS NULL OR EXTRACT(MONTH FROM work_date) = p_month)
    GROUP BY weekday
  ) t;

  RETURN v_stats;
END;
$$;

-- 전체 직원 야간 근무 통계 조회
CREATE OR REPLACE FUNCTION public.get_all_employees_night_shift_stats(
  p_year INTEGER,
  p_month INTEGER DEFAULT NULL
)
RETURNS TABLE (
  employee_id BIGINT,
  employee_name TEXT,
  user_id UUID,
  stats JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT (is_admin() OR is_view() OR auth.uid() IS NOT NULL) THEN
    RAISE EXCEPTION 'Not authorized.';
  END IF;

  RETURN QUERY
  SELECT
    e.id,
    e.name,
    e.user_id,
    COALESCE(
      (
        SELECT jsonb_object_agg(weekday, count)
        FROM (
          SELECT
            nsr.weekday,
            COUNT(*)::integer as count
          FROM night_shift_records nsr
          WHERE nsr.employee_id = e.id
            AND EXTRACT(YEAR FROM nsr.work_date) = p_year
            AND (p_month IS NULL OR EXTRACT(MONTH FROM nsr.work_date) = p_month)
          GROUP BY nsr.weekday
        ) t
      ),
      '{}'::jsonb
    ) as stats
  FROM employees e
  WHERE e.status = 'ACTIVE'
  ORDER BY e.name;
END;
$$;

-- 야간 근무 기록 생성
CREATE OR REPLACE FUNCTION public.create_night_shift_record(
  p_employee_id BIGINT,
  p_work_date DATE
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_weekday TEXT;
BEGIN
  IF NOT is_admin() THEN
    RETURN jsonb_build_object('success', false, 'message', 'Not authorized.');
  END IF;

  v_weekday := CASE EXTRACT(DOW FROM p_work_date)
    WHEN 0 THEN 'SUN'
    WHEN 1 THEN 'MON'
    WHEN 2 THEN 'TUE'
    WHEN 3 THEN 'WED'
    WHEN 4 THEN 'THU'
    WHEN 5 THEN 'FRI'
    WHEN 6 THEN 'SAT'
  END;

  INSERT INTO night_shift_records (employee_id, work_date, weekday)
  VALUES (p_employee_id, p_work_date, v_weekday)
  ON CONFLICT (employee_id, work_date) DO NOTHING;

  RETURN jsonb_build_object('success', true, 'message', 'Night shift record created.');
EXCEPTION
  WHEN foreign_key_violation THEN
    RETURN jsonb_build_object('success', false, 'message', 'Employee not found.');
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'message', SQLERRM);
END;
$$;

-- 함수 권한 부여
GRANT EXECUTE ON FUNCTION public.get_night_shift_stats(BIGINT, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_all_employees_night_shift_stats(INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_night_shift_record(BIGINT, DATE) TO authenticated;

-- ================================================================
-- PART 3: RLS 정책 설정
-- ================================================================

-- employees 테이블 RLS
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "employees_select" ON employees;
CREATE POLICY "employees_select" ON employees
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "employees_insert" ON employees;
CREATE POLICY "employees_insert" ON employees
  FOR INSERT WITH CHECK (is_admin());

DROP POLICY IF EXISTS "employees_update" ON employees;
CREATE POLICY "employees_update" ON employees
  FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "employees_delete" ON employees;
CREATE POLICY "employees_delete" ON employees
  FOR DELETE USING (is_admin());

-- night_shift_config 테이블 RLS
ALTER TABLE night_shift_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "night_shift_config_select" ON night_shift_config;
CREATE POLICY "night_shift_config_select" ON night_shift_config
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "night_shift_config_insert" ON night_shift_config;
CREATE POLICY "night_shift_config_insert" ON night_shift_config
  FOR INSERT WITH CHECK (is_admin());

DROP POLICY IF EXISTS "night_shift_config_update" ON night_shift_config;
CREATE POLICY "night_shift_config_update" ON night_shift_config
  FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "night_shift_config_delete" ON night_shift_config;
CREATE POLICY "night_shift_config_delete" ON night_shift_config
  FOR DELETE USING (is_admin());

-- night_shift_records 테이블 RLS
ALTER TABLE night_shift_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "night_shift_records_select" ON night_shift_records;
CREATE POLICY "night_shift_records_select" ON night_shift_records
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "night_shift_records_insert" ON night_shift_records;
CREATE POLICY "night_shift_records_insert" ON night_shift_records
  FOR INSERT WITH CHECK (is_admin());

DROP POLICY IF EXISTS "night_shift_records_update" ON night_shift_records;
CREATE POLICY "night_shift_records_update" ON night_shift_records
  FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "night_shift_records_delete" ON night_shift_records;
CREATE POLICY "night_shift_records_delete" ON night_shift_records
  FOR DELETE USING (is_admin());

-- ================================================================
-- PART 4: 트리거 설정
-- ================================================================

DROP TRIGGER IF EXISTS update_employees_updated_at ON employees;
CREATE TRIGGER update_employees_updated_at
  BEFORE UPDATE ON employees
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_night_shift_config_updated_at ON night_shift_config;
CREATE TRIGGER update_night_shift_config_updated_at
  BEFORE UPDATE ON night_shift_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- PART 5: 샘플 데이터 추가
-- ================================================================

-- 직원 3명 추가
INSERT INTO employees (name, status) VALUES
  ('김철수', 'ACTIVE'),
  ('이영희', 'ACTIVE'),
  ('박민수', 'ACTIVE')
ON CONFLICT DO NOTHING;

-- 야간 요일 설정 (화수목 활성화)
INSERT INTO night_shift_config (weekday, is_active) VALUES
  ('MON', false),
  ('TUE', true),
  ('WED', true),
  ('THU', true),
  ('FRI', false),
  ('SAT', false)
ON CONFLICT (weekday) DO UPDATE SET
  is_active = EXCLUDED.is_active;

-- 야간 근무 기록 추가
DO $$
DECLARE
  emp1_id INTEGER;
  emp2_id INTEGER;
  emp3_id INTEGER;
BEGIN
  -- 직원 ID 조회
  SELECT id INTO emp1_id FROM employees WHERE name = '김철수' LIMIT 1;
  SELECT id INTO emp2_id FROM employees WHERE name = '이영희' LIMIT 1;
  SELECT id INTO emp3_id FROM employees WHERE name = '박민수' LIMIT 1;

  -- 2025년 1월 야간 근무 기록
  INSERT INTO night_shift_records (employee_id, work_date, weekday) VALUES
    -- 김철수: 화요일 위주
    (emp1_id, '2025-01-07', 'TUE'),
    (emp1_id, '2025-01-14', 'TUE'),
    (emp1_id, '2025-01-21', 'TUE'),
    (emp1_id, '2025-01-28', 'TUE'),
    (emp1_id, '2025-01-08', 'WED'),
    -- 이영희: 수요일 위주
    (emp2_id, '2025-01-08', 'WED'),
    (emp2_id, '2025-01-15', 'WED'),
    (emp2_id, '2025-01-22', 'WED'),
    (emp2_id, '2025-01-29', 'WED'),
    (emp2_id, '2025-01-09', 'THU'),
    -- 박민수: 목요일 위주
    (emp3_id, '2025-01-02', 'THU'),
    (emp3_id, '2025-01-09', 'THU'),
    (emp3_id, '2025-01-16', 'THU'),
    (emp3_id, '2025-01-23', 'THU'),
    (emp3_id, '2025-01-30', 'THU')
  ON CONFLICT (employee_id, work_date) DO NOTHING;

  -- 2025년 2월 야간 근무 기록
  INSERT INTO night_shift_records (employee_id, work_date, weekday) VALUES
    -- 김철수
    (emp1_id, '2025-02-04', 'TUE'),
    (emp1_id, '2025-02-11', 'TUE'),
    (emp1_id, '2025-02-18', 'TUE'),
    -- 이영희
    (emp2_id, '2025-02-05', 'WED'),
    (emp2_id, '2025-02-12', 'WED'),
    (emp2_id, '2025-02-19', 'WED'),
    -- 박민수
    (emp3_id, '2025-02-06', 'THU'),
    (emp3_id, '2025-02-13', 'THU'),
    (emp3_id, '2025-02-20', 'THU')
  ON CONFLICT (employee_id, work_date) DO NOTHING;

  RAISE NOTICE '✅ 야간 근무 관리 시스템 설치 완료!';
  RAISE NOTICE '📋 직원 3명: 김철수, 이영희, 박민수';
  RAISE NOTICE '📅 야간 요일: 화수목 활성화';
  RAISE NOTICE '📊 야간 근무 기록: 2025년 1~2월 (총 약 30건)';
END $$;

-- ================================================================
-- PART 6: 설치 확인
-- ================================================================

-- 직원 목록 확인
SELECT
  '✅ 직원' as 구분,
  COUNT(*) as 개수
FROM employees;

-- 야간 요일 설정 확인
SELECT
  '✅ 야간 요일' as 구분,
  COUNT(*) as 개수
FROM night_shift_config WHERE is_active = true;

-- 야간 근무 기록 확인
SELECT
  '✅ 야간 근무 기록' as 구분,
  COUNT(*) as 개수
FROM night_shift_records;

-- 직원별 통계 미리보기 (2025년 전체)
SELECT
  e.name as 직원명,
  get_night_shift_stats(e.id, 2025) as 통계
FROM employees e
ORDER BY e.name;
