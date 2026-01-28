/**
 * 연차 관리 시스템 샘플 데이터
 * 3명의 사용자 데이터 (다양한 근속연수 및 사용 패턴)
 */

import type {
  LeaveBalance,
  LeaveHistory,
  LeaveReservation,
  LeaveUsageStats,
  User,
} from '../types/leave'

/**
 * 샘플 사용자 3명
 * - 김철수: 근속 5년 (2020-03-01 입사) -> 17일 연차
 * - 이영희: 근속 2년 (2023-01-15 입사) -> 15일 연차
 * - 박민수: 근속 10년 (2015-06-01 입사) -> 20일 연차
 */
export const sampleUsers: User[] = [
  {
    user_id: 'U001',
    name: '김철수',
    join_date: '2020-03-01',
    group_id: 'G01',
    role: 'USER',
    status: 'ACTIVE',
  },
  {
    user_id: 'U002',
    name: '이영희',
    join_date: '2023-01-15',
    group_id: 'G01',
    role: 'USER',
    status: 'ACTIVE',
  },
  {
    user_id: 'U003',
    name: '박민수',
    join_date: '2015-06-01',
    group_id: 'G02',
    role: 'USER',
    status: 'ACTIVE',
  },
]

/**
 * 연차 잔액 데이터
 * - U001(김철수): 2024년 이월 연차 1.0 + 2025년 17일
 * - U002(이영희): 2025년 15일
 * - U003(박민수): 2024년 이월 3.5 + 2025년 20일
 */
export const sampleLeaveBalances: LeaveBalance[] = [
  // U001 - 김철수 (근속 5년)
  {
    user_id: 'U001',
    year: 2024,
    total: 17.0,
    used: 16.0,
    remain: 1.0, // 이월
    expire_at: '2025-12-31',
  },
  {
    user_id: 'U001',
    year: 2025,
    total: 17.0,
    used: 4.5,
    remain: 12.5,
    expire_at: '2026-12-31',
  },

  // U002 - 이영희 (근속 2년)
  {
    user_id: 'U002',
    year: 2025,
    total: 15.0,
    used: 8.5,
    remain: 6.5,
    expire_at: '2026-12-31',
  },

  // U003 - 박민수 (근속 10년)
  {
    user_id: 'U003',
    year: 2024,
    total: 20.0,
    used: 16.5,
    remain: 3.5, // 이월
    expire_at: '2025-12-31',
  },
  {
    user_id: 'U003',
    year: 2025,
    total: 20.0,
    used: 2.0,
    remain: 18.0,
    expire_at: '2026-12-31',
  },
]

/**
 * 연차 예약 데이터
 */
export const sampleLeaveReservations: LeaveReservation[] = [
  // U001 - 김철수
  {
    id: 1,
    user_id: 'U001',
    date: '2025-02-10',
    type: 'FULL',
    session: null,
    amount: 1.0,
    status: 'RESERVED',
    created_at: '2025-01-20T09:00:00Z',
  },
  {
    id: 2,
    user_id: 'U001',
    date: '2025-03-05',
    type: 'HALF',
    session: 'PM',
    amount: 0.5,
    status: 'RESERVED',
    created_at: '2025-01-22T14:30:00Z',
  },

  // U002 - 이영희
  {
    id: 3,
    user_id: 'U002',
    date: '2025-02-14',
    type: 'FULL',
    session: null,
    amount: 1.0,
    status: 'RESERVED',
    created_at: '2025-01-25T10:15:00Z',
  },

  // U003 - 박민수
  {
    id: 4,
    user_id: 'U003',
    date: '2025-03-20',
    type: 'HALF',
    session: 'AM',
    amount: 0.5,
    status: 'RESERVED',
    created_at: '2025-01-26T11:00:00Z',
  },
  {
    id: 5,
    user_id: 'U003',
    date: '2025-04-10',
    type: 'FULL',
    session: null,
    amount: 1.0,
    status: 'RESERVED',
    created_at: '2025-01-27T08:45:00Z',
  },
]

/**
 * 연차 사용 이력 데이터
 */
export const sampleLeaveHistory: LeaveHistory[] = [
  // U001 - 김철수 (2025년 4.5일 사용)
  {
    id: 1,
    user_id: 'U001',
    date: '2025-01-06',
    type: 'FULL',
    session: null,
    amount: 1.0,
    weekday: 'MON',
    source_year: 2024, // FIFO - 2024년 이월 연차 차감
    used_at: '2025-01-06T09:00:00Z',
  },
  {
    id: 2,
    user_id: 'U001',
    date: '2025-01-10',
    type: 'HALF',
    session: 'AM',
    amount: 0.5,
    weekday: 'FRI',
    source_year: 2025,
    used_at: '2025-01-10T09:00:00Z',
  },
  {
    id: 3,
    user_id: 'U001',
    date: '2025-01-15',
    type: 'FULL',
    session: null,
    amount: 1.0,
    weekday: 'WED',
    source_year: 2025,
    used_at: '2025-01-15T09:00:00Z',
  },
  {
    id: 4,
    user_id: 'U001',
    date: '2025-01-22',
    type: 'FULL',
    session: null,
    amount: 1.0,
    weekday: 'WED',
    source_year: 2025,
    used_at: '2025-01-22T09:00:00Z',
  },
  {
    id: 5,
    user_id: 'U001',
    date: '2025-01-24',
    type: 'FULL',
    session: null,
    amount: 1.0,
    weekday: 'FRI',
    source_year: 2025,
    used_at: '2025-01-24T09:00:00Z',
  },

  // U002 - 이영희 (2025년 8.5일 사용)
  {
    id: 6,
    user_id: 'U002',
    date: '2025-01-03',
    type: 'FULL',
    session: null,
    amount: 1.0,
    weekday: 'FRI',
    source_year: 2025,
    used_at: '2025-01-03T09:00:00Z',
  },
  {
    id: 7,
    user_id: 'U002',
    date: '2025-01-08',
    type: 'FULL',
    session: null,
    amount: 1.0,
    weekday: 'WED',
    source_year: 2025,
    used_at: '2025-01-08T09:00:00Z',
  },
  {
    id: 8,
    user_id: 'U002',
    date: '2025-01-13',
    type: 'HALF',
    session: 'PM',
    amount: 0.5,
    weekday: 'MON',
    source_year: 2025,
    used_at: '2025-01-13T09:00:00Z',
  },
  {
    id: 9,
    user_id: 'U002',
    date: '2025-01-17',
    type: 'FULL',
    session: null,
    amount: 1.0,
    weekday: 'FRI',
    source_year: 2025,
    used_at: '2025-01-17T09:00:00Z',
  },
  {
    id: 10,
    user_id: 'U002',
    date: '2025-01-20',
    type: 'FULL',
    session: null,
    amount: 1.0,
    weekday: 'MON',
    source_year: 2025,
    used_at: '2025-01-20T09:00:00Z',
  },
  {
    id: 11,
    user_id: 'U002',
    date: '2025-01-23',
    type: 'FULL',
    session: null,
    amount: 1.0,
    weekday: 'THU',
    source_year: 2025,
    used_at: '2025-01-23T09:00:00Z',
  },
  {
    id: 12,
    user_id: 'U002',
    date: '2025-01-27',
    type: 'FULL',
    session: null,
    amount: 1.0,
    weekday: 'MON',
    source_year: 2025,
    used_at: '2025-01-27T09:00:00Z',
  },
  {
    id: 13,
    user_id: 'U002',
    date: '2025-01-29',
    type: 'FULL',
    session: null,
    amount: 1.0,
    weekday: 'WED',
    source_year: 2025,
    used_at: '2025-01-29T09:00:00Z',
  },
  {
    id: 14,
    user_id: 'U002',
    date: '2025-01-31',
    type: 'FULL',
    session: null,
    amount: 1.0,
    weekday: 'FRI',
    source_year: 2025,
    used_at: '2025-01-31T09:00:00Z',
  },

  // U003 - 박민수 (2025년 2.0일 사용)
  {
    id: 15,
    user_id: 'U003',
    date: '2025-01-09',
    type: 'HALF',
    session: 'PM',
    amount: 0.5,
    weekday: 'THU',
    source_year: 2024, // FIFO
    used_at: '2025-01-09T09:00:00Z',
  },
  {
    id: 16,
    user_id: 'U003',
    date: '2025-01-14',
    type: 'HALF',
    session: 'AM',
    amount: 0.5,
    weekday: 'TUE',
    source_year: 2024,
    used_at: '2025-01-14T09:00:00Z',
  },
  {
    id: 17,
    user_id: 'U003',
    date: '2025-01-21',
    type: 'FULL',
    session: null,
    amount: 1.0,
    weekday: 'TUE',
    source_year: 2024,
    used_at: '2025-01-21T09:00:00Z',
  },
]

/**
 * 요일별 사용 통계
 */
export const sampleLeaveUsageStats: LeaveUsageStats[] = [
  // U001 - 김철수
  { user_id: 'U001', weekday: 'MON', total_used: 1.0, count: 1 },
  { user_id: 'U001', weekday: 'WED', total_used: 2.0, count: 2 },
  { user_id: 'U001', weekday: 'FRI', total_used: 1.5, count: 2 },

  // U002 - 이영희
  { user_id: 'U002', weekday: 'MON', total_used: 2.5, count: 3 },
  { user_id: 'U002', weekday: 'WED', total_used: 2.0, count: 2 },
  { user_id: 'U002', weekday: 'THU', total_used: 1.0, count: 1 },
  { user_id: 'U002', weekday: 'FRI', total_used: 3.0, count: 3 },

  // U003 - 박민수
  { user_id: 'U003', weekday: 'TUE', total_used: 1.5, count: 2 },
  { user_id: 'U003', weekday: 'THU', total_used: 0.5, count: 1 },
]

/**
 * 전체 샘플 데이터 내보내기
 */
export const sampleData = {
  users: sampleUsers,
  balances: sampleLeaveBalances,
  reservations: sampleLeaveReservations,
  history: sampleLeaveHistory,
  stats: sampleLeaveUsageStats,
}
