/**
 * Supabase 데이터베이스 타입 정의
 *
 * Supabase 데이터베이스의 스키마를 TypeScript 타입으로 정의합니다.
 * 타입 안정성을 제공하여 컴파일 시점에 오류를 방지합니다.
 *
 * @module supabase/types/database
 *
 * @remarks
 * 이 파일은 수동으로 작성되었습니다.
 * 실제 Supabase 프로젝트 연결 후, 아래 명령어로 자동 생성할 수 있습니다:
 *
 * ```bash
 * npx supabase gen types typescript --project-id <PROJECT_ID> > src/lib/supabase/types/database.types.ts
 * ```
 *
 * @example
 * ```ts
 * import type { Database, Tables } from '@/lib/supabase/types/database.types'
 *
 * // 테이블 Row 타입 사용
 * type User = Tables<'users'>
 *
 * // Database 타입과 함께 클라이언트 생성
 * const supabase = createClient<Database>(url, key)
 * ```
 */

import type {
  LeaveBalance,
  LeaveHistory,
  LeaveReservation,
  LeaveSession,
  LeaveType,
  LeaveUsageStats,
  ReservationStatus,
  User,
  UserStatus,
  Weekday,
} from '@/types/leave'

/**
 * Supabase 데이터베이스 스키마
 *
 * 전체 데이터베이스 구조를 정의합니다.
 * 테이블, 뷰, 함수(RPC), Enum 타입을 포함합니다.
 */
export interface Database {
  public: {
    /**
     * 테이블 정의
     *
     * Row: SELECT 쿼리 결과 타입
     * Insert: INSERT 쿼리 입력 타입
     * Update: UPDATE 쿼리 입력 타입
     */
    Tables: {
      /**
       * 사용자(직원) 테이블
       *
       * 직원의 기본 정보를 저장합니다.
       */
      users: {
        /** SELECT 결과 타입 */
        Row: User
        /** INSERT 입력 타입 (user_id는 자동 생성 가능) */
        Insert: Omit<User, 'user_id'> & { user_id?: string }
        /** UPDATE 입력 타입 (user_id는 변경 불가) */
        Update: Partial<Omit<User, 'user_id'>>
      }

      /**
       * 연차 잔액 테이블 (연도별)
       *
       * 연도별 연차 발생 및 사용 현황을 추적합니다.
       * FIFO(선입선출) 방식으로 연차를 차감합니다.
       */
      leave_balances: {
        /** SELECT 결과 타입 */
        Row: LeaveBalance
        /** INSERT 입력 타입 (remain은 자동 계산 가능) */
        Insert: Omit<LeaveBalance, 'remain'> & { remain?: number }
        /** UPDATE 입력 타입 (PK는 변경 불가) */
        Update: Partial<Omit<LeaveBalance, 'user_id' | 'year'>>
      }

      /**
       * 연차 예약 테이블
       *
       * 사용자가 신청한 연차를 저장합니다.
       * 상태: RESERVED(예약됨), USED(사용완료), CANCELLED(취소됨)
       */
      leave_reservations: {
        /** SELECT 결과 타입 */
        Row: LeaveReservation
        /** INSERT 입력 타입 (id, created_at은 자동 생성) */
        Insert: Omit<LeaveReservation, 'id' | 'created_at'> & {
          id?: number
          created_at?: string
        }
        /** UPDATE 입력 타입 (PK와 생성 시각은 변경 불가) */
        Update: Partial<
          Omit<LeaveReservation, 'id' | 'user_id' | 'created_at'>
        >
      }

      /**
       * 연차 사용 이력 테이블
       *
       * 실제로 사용이 완료된 연차의 이력을 저장합니다.
       * 연도별 차감 정보(source_year)를 포함합니다.
       */
      leave_history: {
        /** SELECT 결과 타입 */
        Row: LeaveHistory
        /** INSERT 입력 타입 (id, used_at은 자동 생성) */
        Insert: Omit<LeaveHistory, 'id' | 'used_at'> & {
          id?: number
          used_at?: string
        }
        /** UPDATE 입력 타입 (PK와 사용 시각은 변경 불가) */
        Update: Partial<Omit<LeaveHistory, 'id' | 'user_id' | 'used_at'>>
      }

      /**
       * 요일별 연차 사용 통계 테이블
       *
       * 사용자별 요일별 연차 사용 패턴을 추적합니다.
       * 월요일/금요일 선호도 분석 등에 활용됩니다.
       */
      leave_usage_stats: {
        /** SELECT 결과 타입 */
        Row: LeaveUsageStats
        /** INSERT 입력 타입 */
        Insert: LeaveUsageStats
        /** UPDATE 입력 타입 (PK는 변경 불가) */
        Update: Partial<Omit<LeaveUsageStats, 'user_id' | 'weekday'>>
      }
    }

    /**
     * 뷰 정의
     *
     * DB에 생성된 View들의 타입을 정의합니다.
     * 필요 시 구체적인 뷰를 추가하세요.
     */
    Views: {
      /**
       * 사용자별 연차 현황 뷰 (예: user_leave_status)
       * 실제 뷰가 생성되면 정의 추가
       */
      [key: string]: {
        Row: Record<string, unknown>
      }
    }

    /**
     * RPC 함수 정의
     *
     * Supabase 데이터베이스에 정의된 PostgreSQL 함수들입니다.
     * 복잡한 비즈니스 로직을 서버 측에서 처리합니다.
     */
    Functions: {
      /**
       * 연차 신청 함수 (RPC)
       *
       * 연차 유효성 검증 및 예약을 한 번에 처리합니다.
       * 잔액 확인, 중복 체크, 그룹 제한 등을 자동으로 검증합니다.
       *
       * @example
       * ```ts
       * const { data, error } = await supabase.rpc('reserve_leave', {
       *   p_user_id: 'U001',
       *   p_date: '2024-12-25',
       *   p_type: 'FULL',
       *   p_session: null
       * })
       * ```
       */
      reserve_leave: {
        Args: {
          p_user_id: string
          p_date: string
          p_type: LeaveType
          p_session: LeaveSession
        }
        Returns: {
          success: boolean
          message: string
          reservation_id?: number
        }
      }

      /**
       * 연차 승인 함수 (RPC)
       *
       * 예약된 연차를 승인하고 실제 사용 이력으로 전환합니다.
       * 잔액 차감(FIFO)도 함께 처리됩니다.
       *
       * @example
       * ```ts
       * const { data } = await supabase.rpc('approve_leave', {
       *   p_reservation_id: 123
       * })
       * ```
       */
      approve_leave: {
        Args: {
          p_reservation_id: number
        }
        Returns: {
          success: boolean
          message: string
        }
      }

      /**
       * 연차 취소 함수 (RPC)
       *
       * 예약된 연차를 취소 상태로 변경합니다.
       * 이미 사용 완료된 연차는 취소할 수 없습니다.
       *
       * @example
       * ```ts
       * const { data } = await supabase.rpc('cancel_leave', {
       *   p_reservation_id: 123
       * })
       * ```
       */
      cancel_leave: {
        Args: {
          p_reservation_id: number
        }
        Returns: {
          success: boolean
          message: string
        }
      }

      /**
       * 사용자 연차 현황 조회 함수 (RPC)
       *
       * 사용자의 전체 연차 현황을 집계하여 반환합니다.
       * 총 발생 연차, 사용 연차, 예약 연차, 잔여 연차를 계산합니다.
       *
       * @example
       * ```ts
       * const { data } = await supabase.rpc('get_user_leave_status', {
       *   p_user_id: 'U001'
       * })
       * // { total: 17, used: 5, reserved: 2, remain: 10 }
       * ```
       */
      get_user_leave_status: {
        Args: {
          p_user_id: string
        }
        Returns: {
          total: number
          used: number
          reserved: number
          remain: number
        }
      }
    }

    /**
     * Enum 타입 정의
     *
     * PostgreSQL Enum 타입들을 정의합니다.
     */
    Enums: {
      /** 사용자 상태: ACTIVE(활성), INACTIVE(비활성), RESIGNED(퇴사) */
      user_status: UserStatus
      /** 연차 타입: FULL(종일), HALF(반차) */
      leave_type: LeaveType
      /** 반차 세션: AM(오전), PM(오후) */
      leave_session: 'AM' | 'PM'
      /** 예약 상태: RESERVED(예약), USED(사용완료), CANCELLED(취소) */
      reservation_status: ReservationStatus
      /** 요일: MON, TUE, WED, THU, FRI, SAT, SUN */
      weekday: Weekday
    }
  }
}

/**
 * 테이블 Row 타입 헬퍼
 *
 * 테이블 이름으로 Row 타입을 쉽게 가져올 수 있습니다.
 *
 * @template T - 테이블 이름
 *
 * @example
 * ```ts
 * type User = Tables<'users'>
 * type LeaveBalance = Tables<'leave_balances'>
 * ```
 */
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

/**
 * Enum 타입 헬퍼
 *
 * Enum 이름으로 타입을 쉽게 가져올 수 있습니다.
 *
 * @template T - Enum 이름
 *
 * @example
 * ```ts
 * type UserStatus = Enums<'user_status'>
 * type LeaveType = Enums<'leave_type'>
 * ```
 */
export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T]
