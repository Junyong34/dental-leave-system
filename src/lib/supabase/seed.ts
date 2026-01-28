/**
 * Supabase 샘플 데이터 마이그레이션 스크립트
 *
 * sampleData.ts의 더미 데이터를 실제 Supabase 테이블에 INSERT합니다.
 *
 * 사용법:
 * 1. 먼저 schema.sql을 Supabase SQL Editor에서 실행
 * 2. Supabase Auth에서 테스트 계정 4개 생성 (또는 아래 함수 실행)
 * 3. 이 파일을 실행: npm run seed (package.json에 스크립트 추가 필요)
 *
 * 주의사항:
 * - 연차 데이터는 자동으로 10배수로 변환됩니다 (1.0 → 10, 0.5 → 5)
 * - user_id는 실제 auth.users의 UUID로 매핑해야 합니다
 */

import { sampleData } from '@/data/sampleData'
import { supabase } from './client'

/**
 * 소수점 연차 데이터를 INTEGER로 변환 (10배수)
 */
function toInteger(value: number): number {
  return Math.round(value * 10)
}

/**
 * 1단계: Supabase Auth에 테스트 사용자 생성
 * (실제로는 Supabase Dashboard에서 수동으로 생성하거나,
 *  Service Role Key를 사용해야 합니다)
 */
export async function createTestUsers() {
  console.log('⚠️  이 함수는 참고용입니다.')
  console.log(
    '실제로는 Supabase Dashboard > Authentication에서 수동으로 유저를 생성하세요.',
  )
  console.log('')
  console.log('생성할 유저 정보:')
  console.log('1. 김철수 - test1@example.com / password123')
  console.log('2. 이영희 - test2@example.com / password123')
  console.log('3. 박민수 - test3@example.com / password123')
  console.log('')
  console.log('생성 후 각 유저의 UUID를 확인하여 USER_ID_MAP에 입력하세요.')

  // 참고: 실제 생성 코드 (Service Role Key 필요)
  // const { data, error } = await supabaseAdmin.auth.admin.createUser({
  //   email: 'test1@example.com',
  //   password: 'password123',
  //   email_confirm: true
  // })
}

/**
 * 2단계: 샘플 데이터의 user_id를 실제 UUID로 매핑
 * Supabase Dashboard에서 생성한 유저의 UUID를 여기에 입력하세요
 */
const USER_ID_MAP: Record<string, string> = {
  // 예시 (실제 UUID로 변경 필요):
  U001: '00000000-0000-0000-0000-000000000001', // 김철수
  U002: '00000000-0000-0000-0000-000000000002', // 이영희
  U003: '00000000-0000-0000-0000-000000000003', // 박민수
}

/**
 * 3단계: users 테이블에 데이터 삽입
 */
export async function seedUsers() {
  console.log('👤 users 테이블 데이터 삽입 중...')

  const usersData = sampleData.users.map((user) => ({
    user_id: USER_ID_MAP[user.user_id],
    name: user.name,
    join_date: user.join_date,
    group_id: user.group_id,
    status: user.status,
  }))

  const { data, error } = await supabase
    .from('users')
    .insert(usersData)
    .select()

  if (error) {
    console.error('❌ users 삽입 실패:', error.message)
    throw error
  }

  console.log('✅ users 삽입 완료:', data?.length, '건')
  return data
}

/**
 * 4단계: leave_balances 테이블에 데이터 삽입
 */
export async function seedLeaveBalances() {
  console.log('💰 leave_balances 테이블 데이터 삽입 중...')

  const balancesData = sampleData.balances.map((balance) => ({
    user_id: USER_ID_MAP[balance.user_id],
    year: balance.year,
    total: toInteger(balance.total), // 17.0 → 170
    used: toInteger(balance.used), // 4.5 → 45
    remain: toInteger(balance.remain), // 12.5 → 125
    expire_at: balance.expire_at,
  }))

  const { data, error } = await supabase
    .from('leave_balances')
    .insert(balancesData)
    .select()

  if (error) {
    console.error('❌ leave_balances 삽입 실패:', error.message)
    throw error
  }

  console.log('✅ leave_balances 삽입 완료:', data?.length, '건')
  return data
}

/**
 * 5단계: leave_reservations 테이블에 데이터 삽입
 */
export async function seedLeaveReservations() {
  console.log('📅 leave_reservations 테이블 데이터 삽입 중...')

  const reservationsData = sampleData.reservations.map((reservation) => ({
    user_id: USER_ID_MAP[reservation.user_id],
    date: reservation.date,
    type: reservation.type,
    session: reservation.session,
    amount: toInteger(reservation.amount), // 1.0 → 10, 0.5 → 5
    status: reservation.status,
    created_at: reservation.created_at,
  }))

  const { data, error } = await supabase
    .from('leave_reservations')
    .insert(reservationsData)
    .select()

  if (error) {
    console.error('❌ leave_reservations 삽입 실패:', error.message)
    throw error
  }

  console.log('✅ leave_reservations 삽입 완료:', data?.length, '건')
  return data
}

/**
 * 6단계: leave_history 테이블에 데이터 삽입
 */
export async function seedLeaveHistory() {
  console.log('📜 leave_history 테이블 데이터 삽입 중...')

  const historyData = sampleData.history.map((history) => ({
    user_id: USER_ID_MAP[history.user_id],
    date: history.date,
    type: history.type,
    session: history.session,
    amount: toInteger(history.amount), // 1.0 → 10, 0.5 → 5
    weekday: history.weekday,
    source_year: history.source_year,
    used_at: history.used_at,
  }))

  const { data, error } = await supabase
    .from('leave_history')
    .insert(historyData)
    .select()

  if (error) {
    console.error('❌ leave_history 삽입 실패:', error.message)
    throw error
  }

  console.log('✅ leave_history 삽입 완료:', data?.length, '건')
  return data
}

/**
 * 전체 시드 데이터 삽입 실행
 */
export async function seedAll() {
  console.log('🌱 Supabase 시드 데이터 삽입 시작...\n')

  try {
    // 순서대로 실행 (외래키 제약조건 때문)
    await seedUsers()
    await seedLeaveBalances()
    await seedLeaveReservations()
    await seedLeaveHistory()

    console.log('\n🎉 모든 시드 데이터 삽입 완료!')
  } catch (error) {
    console.error('\n❌ 시드 데이터 삽입 실패:', error)
    throw error
  }
}

/**
 * 테이블 초기화 (데이터 삭제)
 */
export async function resetTables() {
  console.log('🗑️  테이블 데이터 삭제 중...')

  try {
    // 역순으로 삭제 (외래키 제약조건 때문)
    await supabase.from('leave_history').delete().neq('id', 0)
    await supabase.from('leave_reservations').delete().neq('id', 0)
    await supabase
      .from('leave_balances')
      .delete()
      .neq('user_id', '00000000-0000-0000-0000-000000000000')
    await supabase
      .from('users')
      .delete()
      .neq('user_id', '00000000-0000-0000-0000-000000000000')

    console.log('✅ 테이블 초기화 완료')
  } catch (error) {
    console.error('❌ 테이블 초기화 실패:', error)
    throw error
  }
}

/**
 * CLI에서 직접 실행
 */
if (require.main === module) {
  console.log('='.repeat(60))
  console.log('Supabase 샘플 데이터 마이그레이션 도구')
  console.log('='.repeat(60))
  console.log('')

  const command = process.argv[2]

  switch (command) {
    case 'seed':
      seedAll()
      break
    case 'reset':
      resetTables()
      break
    case 'users':
      createTestUsers()
      break
    default:
      console.log('사용법:')
      console.log(
        '  npx tsx src/lib/supabase/seed.ts users  - 테스트 유저 정보 출력',
      )
      console.log(
        '  npx tsx src/lib/supabase/seed.ts seed   - 시드 데이터 삽입',
      )
      console.log('  npx tsx src/lib/supabase/seed.ts reset  - 테이블 초기화')
  }
}
