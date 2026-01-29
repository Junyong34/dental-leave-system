-- ================================================================
-- Dental Leave System - Supabase Schema
-- ================================================================
-- 연차 관리 시스템 데이터베이스 스키마
--
-- 주요 설계 방침:
-- 1. Supabase Auth 사용 (auth.users) - 로그인/비밀번호 자동 암호화
-- 2. 연차 데이터는 INTEGER 타입 (0.5일 = 5, 1일 = 10)
-- 3. RLS(Row Level Security) 정책 적용
-- 4. sampleData.ts 구조와 완벽 호환
-- ================================================================

-- ================================================================
-- 1. USERS 테이블
-- ================================================================
-- Supabase Auth와 연동되는 사용자 프로필 테이블
-- auth.users(id)와 1:1 관계

CREATE TABLE IF NOT EXISTS users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  join_date DATE NOT NULL,
  group_id TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'USER' CHECK (role IN ('ADMIN', 'USER', 'VIEW')),
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'RESIGNED')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_users_group_id ON users(group_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_join_date ON users(join_date);

-- 코멘트
COMMENT ON TABLE users IS '사용자 프로필 정보';
COMMENT ON COLUMN users.user_id IS 'auth.users(id)와 연결되는 UUID';
COMMENT ON COLUMN users.name IS '사용자 이름';
COMMENT ON COLUMN users.join_date IS '입사일 (YYYY-MM-DD)';
COMMENT ON COLUMN users.group_id IS '소속 그룹 ID';
COMMENT ON COLUMN users.role IS '사용자 권한 (ADMIN/USER/VIEW)';
COMMENT ON COLUMN users.status IS '사용자 상태 (ACTIVE/INACTIVE/RESIGNED)';


-- ================================================================
-- 2. LEAVE_BALANCES 테이블
-- ================================================================
-- 연도별 연차 잔액 관리
-- 연차 데이터는 INTEGER 타입 (10배수: 1일 = 10, 0.5일 = 5)

CREATE TABLE IF NOT EXISTS leave_balances (
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  total INTEGER NOT NULL DEFAULT 0 CHECK (total >= 0),  -- 17일 → 170
  used INTEGER NOT NULL DEFAULT 0 CHECK (used >= 0),    -- 4.5일 → 45
  remain INTEGER NOT NULL DEFAULT 0 CHECK (remain >= 0), -- 12.5일 → 125
  expire_at DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, year)
);

-- 인덱스
CREATE INDEX idx_leave_balances_year ON leave_balances(year);
CREATE INDEX idx_leave_balances_expire_at ON leave_balances(expire_at);
CREATE INDEX idx_leave_balances_remain ON leave_balances(remain) WHERE remain > 0;

-- 코멘트
COMMENT ON TABLE leave_balances IS '연도별 연차 잔액';
COMMENT ON COLUMN leave_balances.total IS '해당 연도 발생 연차 (10배수: 17일 = 170)';
COMMENT ON COLUMN leave_balances.used IS '사용한 연차 (10배수: 4.5일 = 45)';
COMMENT ON COLUMN leave_balances.remain IS '잔여 연차 (10배수: 12.5일 = 125)';
COMMENT ON COLUMN leave_balances.expire_at IS '연차 만료일';


-- ================================================================
-- 3. LEAVE_RESERVATIONS 테이블
-- ================================================================
-- 연차 예약 관리 (신청/승인/취소)

CREATE TABLE IF NOT EXISTS leave_reservations (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  date DATE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('FULL', 'HALF')),
  session TEXT CHECK (session IN ('AM', 'PM') OR session IS NULL),
  amount INTEGER NOT NULL CHECK (amount IN (5, 10)),  -- 0.5일 = 5, 1일 = 10
  status TEXT NOT NULL DEFAULT 'RESERVED' CHECK (status IN ('RESERVED', 'USED', 'CANCELLED')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- 제약조건: HALF 타입이면 session 필수
  CONSTRAINT chk_half_session CHECK (
    (type = 'HALF' AND session IS NOT NULL) OR
    (type = 'FULL' AND session IS NULL)
  ),

  -- 제약조건: 같은 날짜에 중복 예약 방지
  CONSTRAINT uq_user_date_session UNIQUE (user_id, date, session)
);

-- 인덱스
CREATE INDEX idx_leave_reservations_user_id ON leave_reservations(user_id);
CREATE INDEX idx_leave_reservations_date ON leave_reservations(date);
CREATE INDEX idx_leave_reservations_status ON leave_reservations(status);
CREATE INDEX idx_leave_reservations_user_date ON leave_reservations(user_id, date);

-- 코멘트
COMMENT ON TABLE leave_reservations IS '연차 예약 (신청/승인/취소)';
COMMENT ON COLUMN leave_reservations.type IS '연차 타입 (FULL: 종일, HALF: 반차)';
COMMENT ON COLUMN leave_reservations.session IS '반차 세션 (AM: 오전, PM: 오후)';
COMMENT ON COLUMN leave_reservations.amount IS '차감 연차량 (10배수: 0.5일 = 5, 1일 = 10)';
COMMENT ON COLUMN leave_reservations.status IS '예약 상태 (RESERVED: 예약됨, USED: 사용완료, CANCELLED: 취소됨)';


-- ================================================================
-- 4. LEAVE_HISTORY 테이블
-- ================================================================
-- 연차 사용 이력 (승인 완료된 연차 기록)

CREATE TABLE IF NOT EXISTS leave_history (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  date DATE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('FULL', 'HALF')),
  session TEXT CHECK (session IN ('AM', 'PM') OR session IS NULL),
  amount INTEGER NOT NULL CHECK (amount IN (5, 10)),  -- 0.5일 = 5, 1일 = 10
  weekday TEXT NOT NULL CHECK (weekday IN ('MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN')),
  source_year INTEGER NOT NULL,  -- FIFO: 차감된 연차의 발생 연도
  used_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_leave_history_user_id ON leave_history(user_id);
CREATE INDEX idx_leave_history_date ON leave_history(date);
CREATE INDEX idx_leave_history_weekday ON leave_history(weekday);
CREATE INDEX idx_leave_history_source_year ON leave_history(source_year);
CREATE INDEX idx_leave_history_user_date ON leave_history(user_id, date DESC);

-- 코멘트
COMMENT ON TABLE leave_history IS '연차 사용 이력';
COMMENT ON COLUMN leave_history.weekday IS '사용한 요일 (통계 분석용)';
COMMENT ON COLUMN leave_history.source_year IS '차감된 연차의 발생 연도 (FIFO 원칙)';
COMMENT ON COLUMN leave_history.used_at IS '실제 사용 처리된 시간';


-- ================================================================
-- 5. LEAVE_USAGE_STATS 테이블 (선택적)
-- ================================================================
-- 요일별 사용 통계 (Materialized View 또는 실시간 집계)
-- 실시간 집계로 대체 가능하므로 필요시 생성

-- CREATE MATERIALIZED VIEW leave_usage_stats AS
-- SELECT
--   user_id,
--   weekday,
--   SUM(amount) as total_used,
--   COUNT(*) as count
-- FROM leave_history
-- GROUP BY user_id, weekday;


-- ================================================================
-- RLS (Row Level Security) 정책
-- ================================================================

-- 역할 확인 함수 (RLS 안전)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE user_id = auth.uid() AND role = 'ADMIN'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public;

CREATE OR REPLACE FUNCTION is_user()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE user_id = auth.uid() AND role = 'USER'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public;

CREATE OR REPLACE FUNCTION is_view()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE user_id = auth.uid() AND role = 'VIEW'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public;

-- ================================================================
-- RPC functions
-- ================================================================

CREATE OR REPLACE FUNCTION public.get_user_leave_status(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total numeric := 0;
  v_used numeric := 0;
  v_reserved numeric := 0;
  v_remain numeric := 0;
  v_balances jsonb := '[]'::jsonb;
  v_nearest jsonb := null;
BEGIN
  -- Access control: admin, view, or owner
  IF NOT (is_admin() OR is_view() OR auth.uid() = p_user_id) THEN
    RAISE EXCEPTION 'Not authorized.';
  END IF;

  SELECT
    COALESCE(SUM(total), 0) / 10.0,
    COALESCE(SUM(used), 0) / 10.0,
    COALESCE(SUM(remain), 0) / 10.0
  INTO v_total, v_used, v_remain
  FROM leave_balances
  WHERE user_id = p_user_id;

  SELECT COALESCE(SUM(amount), 0) / 10.0
  INTO v_reserved
  FROM leave_reservations
  WHERE user_id = p_user_id
    AND status = 'RESERVED';

  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'user_id', user_id,
        'year', year,
        'total', total / 10.0,
        'used', used / 10.0,
        'remain', remain / 10.0,
        'expire_at', expire_at
      ) ORDER BY year DESC
    ),
    '[]'::jsonb
  )
  INTO v_balances
  FROM leave_balances
  WHERE user_id = p_user_id;

  SELECT jsonb_build_object(
    'year', year,
    'amount', remain / 10.0,
    'expire_at', expire_at
  )
  INTO v_nearest
  FROM leave_balances
  WHERE user_id = p_user_id
    AND remain > 0
  ORDER BY expire_at ASC
  LIMIT 1;

  RETURN jsonb_build_object(
    'user_id', p_user_id,
    'total', v_total,
    'used', v_used,
    'reserved', v_reserved,
    'remain', v_remain,
    'balances', v_balances,
    'nearest_expiry', v_nearest
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.reserve_leave(
  p_user_id uuid,
  p_date date,
  p_type text,
  p_session text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_amount integer;
  v_remaining integer;
  v_reservation_id bigint;
  v_result jsonb;
BEGIN
  -- Access control: admin or owner
  IF NOT (is_admin() OR auth.uid() = p_user_id) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Not authorized.');
  END IF;

  IF p_type NOT IN ('FULL', 'HALF') THEN
    RETURN jsonb_build_object('success', false, 'message', 'Invalid leave type.');
  END IF;

  IF p_type = 'HALF' AND (p_session IS NULL OR p_session NOT IN ('AM', 'PM')) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Half-day requires AM or PM.');
  END IF;

  IF p_type = 'FULL' THEN
    p_session := NULL;
  END IF;

  -- Sunday check
  IF EXTRACT(DOW FROM p_date) = 0 THEN
    RETURN jsonb_build_object('success', false, 'message', 'Sundays are not allowed.');
  END IF;

  v_amount := CASE WHEN p_type = 'FULL' THEN 10 ELSE 5 END;

  SELECT COALESCE(SUM(remain), 0)
  INTO v_remaining
  FROM leave_balances
  WHERE user_id = p_user_id;

  IF v_remaining < v_amount THEN
    RETURN jsonb_build_object('success', false, 'message', 'Insufficient remaining leave.');
  END IF;

  -- Duplicate checks
  IF EXISTS (
    SELECT 1 FROM leave_reservations
    WHERE user_id = p_user_id
      AND date = p_date
      AND status IN ('RESERVED', 'USED')
      AND type = 'FULL'
  ) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Full-day leave already exists.');
  END IF;

  IF p_type = 'FULL' AND EXISTS (
    SELECT 1 FROM leave_reservations
    WHERE user_id = p_user_id
      AND date = p_date
      AND status IN ('RESERVED', 'USED')
      AND type = 'HALF'
  ) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Half-day leave already exists.');
  END IF;

  IF p_type = 'HALF' AND EXISTS (
    SELECT 1 FROM leave_reservations
    WHERE user_id = p_user_id
      AND date = p_date
      AND status IN ('RESERVED', 'USED')
      AND type = 'HALF'
      AND session = p_session
  ) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Same session already reserved.');
  END IF;

  INSERT INTO leave_reservations (
    user_id,
    date,
    type,
    session,
    amount,
    status
  )
  VALUES (
    p_user_id,
    p_date,
    p_type,
    p_session,
    v_amount,
    'RESERVED'
  )
  RETURNING id INTO v_reservation_id;

  IF p_date <= current_date THEN
    v_result := public._approve_reservation(v_reservation_id);
    IF COALESCE((v_result->>'success')::boolean, false) THEN
      RETURN v_result || jsonb_build_object('reservation_id', v_reservation_id);
    END IF;
    RETURN v_result;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Leave reserved.',
    'reservation_id', v_reservation_id
  );
END;
$$;

CREATE OR REPLACE FUNCTION public._approve_reservation(p_reservation_id bigint)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_reservation leave_reservations%ROWTYPE;
  v_remaining integer;
  v_deduct integer;
  v_weekday text;
  v_balance leave_balances%ROWTYPE;
BEGIN
  SELECT *
  INTO v_reservation
  FROM leave_reservations
  WHERE id = p_reservation_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Reservation not found.');
  END IF;

  IF v_reservation.status <> 'RESERVED' THEN
    RETURN jsonb_build_object('success', false, 'message', 'Reservation is not pending.');
  END IF;

  -- Lock balances for this user
  PERFORM 1 FROM leave_balances WHERE user_id = v_reservation.user_id FOR UPDATE;

  SELECT COALESCE(SUM(remain), 0)
  INTO v_remaining
  FROM leave_balances
  WHERE user_id = v_reservation.user_id;

  IF v_remaining < v_reservation.amount THEN
    RETURN jsonb_build_object('success', false, 'message', 'Insufficient remaining leave.');
  END IF;

  v_weekday := CASE EXTRACT(DOW FROM v_reservation.date)
    WHEN 0 THEN 'SUN'
    WHEN 1 THEN 'MON'
    WHEN 2 THEN 'TUE'
    WHEN 3 THEN 'WED'
    WHEN 4 THEN 'THU'
    WHEN 5 THEN 'FRI'
    WHEN 6 THEN 'SAT'
  END;

  v_remaining := v_reservation.amount;

  FOR v_balance IN
    SELECT *
    FROM leave_balances
    WHERE user_id = v_reservation.user_id
      AND remain > 0
    ORDER BY expire_at ASC
    FOR UPDATE
  LOOP
    EXIT WHEN v_remaining <= 0;

    v_deduct := LEAST(v_balance.remain, v_remaining);

    UPDATE leave_balances
    SET used = used + v_deduct,
        remain = remain - v_deduct
    WHERE user_id = v_balance.user_id
      AND year = v_balance.year;

    INSERT INTO leave_history (
      user_id,
      date,
      type,
      session,
      amount,
      weekday,
      source_year,
      used_at
    )
    VALUES (
      v_reservation.user_id,
      v_reservation.date,
      v_reservation.type,
      v_reservation.session,
      v_deduct,
      v_weekday,
      v_balance.year,
      NOW()
    );

    v_remaining := v_remaining - v_deduct;
  END LOOP;

  IF v_remaining > 0 THEN
    RAISE EXCEPTION 'Insufficient remaining leave.';
  END IF;

  UPDATE leave_reservations
  SET status = 'USED'
  WHERE id = p_reservation_id;

  RETURN jsonb_build_object('success', true, 'message', 'Leave approved.');
END;
$$;

CREATE OR REPLACE FUNCTION public.approve_leave(p_reservation_id bigint)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_admin() THEN
    RETURN jsonb_build_object('success', false, 'message', 'Not authorized.');
  END IF;

  RETURN public._approve_reservation(p_reservation_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.cancel_leave(p_reservation_id bigint)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_reservation leave_reservations%ROWTYPE;
BEGIN
  -- Admin or owner can cancel
  SELECT *
  INTO v_reservation
  FROM leave_reservations
  WHERE id = p_reservation_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Reservation not found.');
  END IF;

  IF NOT (is_admin() OR auth.uid() = v_reservation.user_id) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Not authorized.');
  END IF;

  IF v_reservation.status <> 'RESERVED' THEN
    RETURN jsonb_build_object('success', false, 'message', 'Reservation is not pending.');
  END IF;

  UPDATE leave_reservations
  SET status = 'CANCELLED'
  WHERE id = p_reservation_id;

  RETURN jsonb_build_object('success', true, 'message', 'Reservation cancelled.');
END;
$$;

CREATE OR REPLACE FUNCTION public.cancel_leave_history(p_history_id bigint)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_history leave_history%ROWTYPE;
  v_item leave_history%ROWTYPE;
BEGIN
  IF NOT is_admin() THEN
    RETURN jsonb_build_object('success', false, 'message', 'Not authorized.');
  END IF;

  SELECT *
  INTO v_history
  FROM leave_history
  WHERE id = p_history_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'History not found.');
  END IF;

  -- Revert all matching history entries (same reservation scope)
  FOR v_item IN
    SELECT *
    FROM leave_history
    WHERE user_id = v_history.user_id
      AND date = v_history.date
      AND type = v_history.type
      AND (session IS NOT DISTINCT FROM v_history.session)
    FOR UPDATE
  LOOP
    UPDATE leave_balances
    SET used = used - v_item.amount,
        remain = remain + v_item.amount
    WHERE user_id = v_item.user_id
      AND year = v_item.source_year;
  END LOOP;

  DELETE FROM leave_history
  WHERE user_id = v_history.user_id
    AND date = v_history.date
    AND type = v_history.type
    AND (session IS NOT DISTINCT FROM v_history.session);

  UPDATE leave_reservations
  SET status = 'CANCELLED'
  WHERE user_id = v_history.user_id
    AND date = v_history.date
    AND type = v_history.type
    AND (session IS NOT DISTINCT FROM v_history.session)
    AND status = 'USED';

  RETURN jsonb_build_object('success', true, 'message', 'Leave usage cancelled.');
END;
$$;

CREATE OR REPLACE FUNCTION public.approve_due_reservations()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row record;
  v_result jsonb;
  v_approved integer := 0;
  v_failed integer := 0;
BEGIN
  FOR v_row IN
    SELECT id
    FROM leave_reservations
    WHERE status = 'RESERVED'
      AND date <= current_date
    ORDER BY date, id
    FOR UPDATE SKIP LOCKED
  LOOP
    v_result := public._approve_reservation(v_row.id);
    IF COALESCE((v_result->>'success')::boolean, false) THEN
      v_approved := v_approved + 1;
    ELSE
      v_failed := v_failed + 1;
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'approved', v_approved,
    'failed', v_failed
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_leave_status(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reserve_leave(uuid, date, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.approve_leave(bigint) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_leave(bigint) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_leave_history(bigint) TO authenticated;

-- ================================================================
-- Cron (KST 00:00:00 => UTC 15:00:00)
-- ================================================================
CREATE EXTENSION IF NOT EXISTS pg_cron;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM cron.job WHERE jobname = 'approve-due-leaves'
  ) THEN
    PERFORM cron.schedule(
      'approve-due-leaves',
      '0 15 * * *',
      $$select public.approve_due_reservations();$$
    );
  END IF;
END
$$;

-- RLS 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_history ENABLE ROW LEVEL SECURITY;

-- 관리자: 전체 허용 / 사용자: 조회+삽입 / VIEW: 조회만

-- users
CREATE POLICY "users_select" ON users
  FOR SELECT USING (is_admin() OR is_view() OR auth.uid() = user_id);

CREATE POLICY "users_insert" ON users
  FOR INSERT WITH CHECK (
    is_admin() OR (auth.uid() = user_id AND role = 'USER')
  );

CREATE POLICY "users_update" ON users
  FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "users_delete" ON users
  FOR DELETE USING (is_admin());

-- leave_balances
CREATE POLICY "leave_balances_select" ON leave_balances
  FOR SELECT USING (is_admin() OR is_view() OR auth.uid() = user_id);

CREATE POLICY "leave_balances_insert" ON leave_balances
  FOR INSERT WITH CHECK (is_admin() OR (is_user() AND auth.uid() = user_id));

CREATE POLICY "leave_balances_update" ON leave_balances
  FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "leave_balances_delete" ON leave_balances
  FOR DELETE USING (is_admin());

-- leave_reservations
CREATE POLICY "leave_reservations_select" ON leave_reservations
  FOR SELECT USING (is_admin() OR is_view() OR auth.uid() = user_id);

CREATE POLICY "leave_reservations_insert" ON leave_reservations
  FOR INSERT WITH CHECK (is_admin() OR (is_user() AND auth.uid() = user_id));

CREATE POLICY "leave_reservations_update" ON leave_reservations
  FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "leave_reservations_delete" ON leave_reservations
  FOR DELETE USING (is_admin());

-- leave_history
CREATE POLICY "leave_history_select" ON leave_history
  FOR SELECT USING (is_admin() OR is_view() OR auth.uid() = user_id);

CREATE POLICY "leave_history_insert" ON leave_history
  FOR INSERT WITH CHECK (is_admin() OR (is_user() AND auth.uid() = user_id));

CREATE POLICY "leave_history_update" ON leave_history
  FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "leave_history_delete" ON leave_history
  FOR DELETE USING (is_admin());


-- ================================================================
-- 트리거: updated_at 자동 갱신
-- ================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leave_balances_updated_at
  BEFORE UPDATE ON leave_balances
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leave_reservations_updated_at
  BEFORE UPDATE ON leave_reservations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- ================================================================
-- 유틸리티 뷰: 화면 표시용 변환
-- ================================================================
-- INTEGER를 DECIMAL로 변환하여 조회하는 뷰

CREATE OR REPLACE VIEW leave_balances_display AS
SELECT
  lb.user_id,
  lb.year,
  lb.total / 10.0 AS total,
  lb.used / 10.0 AS used,
  lb.remain / 10.0 AS remain,
  lb.expire_at,
  lb.created_at,
  lb.updated_at
FROM leave_balances lb
JOIN users u ON u.user_id = lb.user_id
WHERE u.status = 'ACTIVE';

CREATE OR REPLACE VIEW leave_reservations_display AS
SELECT
  lr.id,
  lr.user_id,
  lr.date,
  lr.type,
  lr.session,
  lr.amount / 10.0 AS amount,
  lr.status,
  lr.created_at,
  lr.updated_at
FROM leave_reservations lr
JOIN users u ON u.user_id = lr.user_id
WHERE u.status = 'ACTIVE';

CREATE OR REPLACE VIEW leave_history_display AS
SELECT
  lh.id,
  lh.user_id,
  lh.date,
  lh.type,
  lh.session,
  lh.amount / 10.0 AS amount,
  lh.weekday,
  lh.source_year,
  lh.used_at,
  lh.created_at
FROM leave_history lh
JOIN users u ON u.user_id = lh.user_id
WHERE u.status = 'ACTIVE';

COMMENT ON VIEW leave_balances_display IS '화면 표시용 연차 잔액 (DECIMAL 변환)';
COMMENT ON VIEW leave_reservations_display IS '화면 표시용 연차 예약 (DECIMAL 변환)';
COMMENT ON VIEW leave_history_display IS '화면 표시용 연차 이력 (DECIMAL 변환)';
