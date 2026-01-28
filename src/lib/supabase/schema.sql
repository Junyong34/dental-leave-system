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
  user_id,
  year,
  total / 10.0 AS total,
  used / 10.0 AS used,
  remain / 10.0 AS remain,
  expire_at,
  created_at,
  updated_at
FROM leave_balances;

CREATE OR REPLACE VIEW leave_reservations_display AS
SELECT
  id,
  user_id,
  date,
  type,
  session,
  amount / 10.0 AS amount,
  status,
  created_at,
  updated_at
FROM leave_reservations;

CREATE OR REPLACE VIEW leave_history_display AS
SELECT
  id,
  user_id,
  date,
  type,
  session,
  amount / 10.0 AS amount,
  weekday,
  source_year,
  used_at,
  created_at
FROM leave_history;

COMMENT ON VIEW leave_balances_display IS '화면 표시용 연차 잔액 (DECIMAL 변환)';
COMMENT ON VIEW leave_reservations_display IS '화면 표시용 연차 예약 (DECIMAL 변환)';
COMMENT ON VIEW leave_history_display IS '화면 표시용 연차 이력 (DECIMAL 변환)';
