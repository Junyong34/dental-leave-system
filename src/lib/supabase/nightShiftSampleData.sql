-- ================================================================
-- 야간 근무 관리 샘플 데이터
-- ================================================================
-- 테스트용 샘플 데이터를 생성합니다.
-- Supabase SQL Editor에서 실행하세요.

-- ================================================================
-- 1. 직원 3명 추가 (회원가입 없이)
-- ================================================================

INSERT INTO employees (name, status) VALUES
  ('김철수', 'ACTIVE'),
  ('이영희', 'ACTIVE'),
  ('박민수', 'ACTIVE')
ON CONFLICT DO NOTHING;

-- ================================================================
-- 2. 야간 요일 설정 (화수목 활성화)
-- ================================================================

INSERT INTO night_shift_config (weekday, is_active) VALUES
  ('MON', false),
  ('TUE', true),
  ('WED', true),
  ('THU', true),
  ('FRI', false),
  ('SAT', false)
ON CONFLICT (weekday) DO UPDATE SET
  is_active = EXCLUDED.is_active;

-- ================================================================
-- 3. 야간 근무 기록 추가 (2025년 1월~2월)
-- ================================================================

-- 직원 ID를 변수로 가져오기
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
  -- 김철수: 화요일 위주
  INSERT INTO night_shift_records (employee_id, work_date, weekday) VALUES
    (emp1_id, '2025-01-07', 'TUE'),
    (emp1_id, '2025-01-14', 'TUE'),
    (emp1_id, '2025-01-21', 'TUE'),
    (emp1_id, '2025-01-28', 'TUE'),
    (emp1_id, '2025-01-08', 'WED')
  ON CONFLICT (employee_id, work_date) DO NOTHING;

  -- 이영희: 수요일 위주
  INSERT INTO night_shift_records (employee_id, work_date, weekday) VALUES
    (emp2_id, '2025-01-08', 'WED'),
    (emp2_id, '2025-01-15', 'WED'),
    (emp2_id, '2025-01-22', 'WED'),
    (emp2_id, '2025-01-29', 'WED'),
    (emp2_id, '2025-01-09', 'THU')
  ON CONFLICT (employee_id, work_date) DO NOTHING;

  -- 박민수: 목요일 위주
  INSERT INTO night_shift_records (employee_id, work_date, weekday) VALUES
    (emp3_id, '2025-01-02', 'THU'),
    (emp3_id, '2025-01-09', 'THU'),
    (emp3_id, '2025-01-16', 'THU'),
    (emp3_id, '2025-01-23', 'THU'),
    (emp3_id, '2025-01-30', 'THU')
  ON CONFLICT (employee_id, work_date) DO NOTHING;

  -- 2025년 2월 야간 근무 기록
  -- 김철수: 화요일 계속
  INSERT INTO night_shift_records (employee_id, work_date, weekday) VALUES
    (emp1_id, '2025-02-04', 'TUE'),
    (emp1_id, '2025-02-11', 'TUE'),
    (emp1_id, '2025-02-18', 'TUE')
  ON CONFLICT (employee_id, work_date) DO NOTHING;

  -- 이영희: 수요일 계속
  INSERT INTO night_shift_records (employee_id, work_date, weekday) VALUES
    (emp2_id, '2025-02-05', 'WED'),
    (emp2_id, '2025-02-12', 'WED'),
    (emp2_id, '2025-02-19', 'WED')
  ON CONFLICT (employee_id, work_date) DO NOTHING;

  -- 박민수: 목요일 계속
  INSERT INTO night_shift_records (employee_id, work_date, weekday) VALUES
    (emp3_id, '2025-02-06', 'THU'),
    (emp3_id, '2025-02-13', 'THU'),
    (emp3_id, '2025-02-20', 'THU')
  ON CONFLICT (employee_id, work_date) DO NOTHING;

  RAISE NOTICE '샘플 데이터 생성 완료!';
  RAISE NOTICE '직원 3명 (김철수, 이영희, 박민수)';
  RAISE NOTICE '야간 요일 설정: 화수목 활성화';
  RAISE NOTICE '야간 근무 기록: 2025년 1~2월 (총 약 30건)';
END $$;

-- ================================================================
-- 샘플 데이터 확인 쿼리
-- ================================================================

-- 직원 목록 확인
SELECT * FROM employees ORDER BY name;

-- 야간 요일 설정 확인
SELECT * FROM night_shift_config ORDER BY
  CASE weekday
    WHEN 'MON' THEN 1
    WHEN 'TUE' THEN 2
    WHEN 'WED' THEN 3
    WHEN 'THU' THEN 4
    WHEN 'FRI' THEN 5
    WHEN 'SAT' THEN 6
  END;

-- 야간 근무 기록 확인 (최근 20건)
SELECT
  e.name as 직원명,
  nsr.work_date as 근무날짜,
  nsr.weekday as 요일
FROM night_shift_records nsr
JOIN employees e ON e.id = nsr.employee_id
ORDER BY nsr.work_date DESC
LIMIT 20;

-- 직원별 통계 확인 (2025년 1월)
SELECT
  e.name as 직원명,
  get_night_shift_stats(e.id, 2025, 1) as 월별통계
FROM employees e
ORDER BY e.name;

-- 직원별 통계 확인 (2025년 전체)
SELECT
  e.name as 직원명,
  get_night_shift_stats(e.id, 2025) as 연도별통계
FROM employees e
ORDER BY e.name;
