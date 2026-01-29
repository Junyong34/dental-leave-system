/**
 * Supabase Leave API
 * 연차 관련 모든 데이터 조회/수정/삭제 로직을 캡슐화합니다.
 */

import type {
  LeaveBalance,
  LeaveHistory,
  LeaveReservation,
  LeaveSession,
  LeaveType,
  ReservationStatus,
} from '@/types/leave'
import { supabase } from '../client'

/**
 * API 응답 타입
 */
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

/**
 * 연차 잔액 조회 (연도별)
 *
 * @param userId - 사용자 ID
 * @param year - 연도 (선택, 없으면 전체)
 * @returns 연도별 연차 잔액 목록
 *
 * @example
 * ```ts
 * const result = await getLeaveBalances('user123', 2024)
 * if (result.success && result.data) {
 *   console.log('2024년 잔액:', result.data)
 * }
 * ```
 */
export async function getLeaveBalances(
  userId: string,
  year?: number,
): Promise<ApiResponse<LeaveBalance[]>> {
  try {
    let query = supabase
      .from('leave_balances_display')
      .select('*')
      .eq('user_id', userId)
      .order('year', { ascending: false })

    if (year) {
      query = query.eq('year', year)
    }

    const { data, error } = await query

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: (data || []) as unknown as LeaveBalance[] }
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다',
    }
  }
}

/**
 * 연차 총량 수정 (총 연차만 변경, 잔여 연차 자동 계산)
 *
 * @param userId - 사용자 ID
 * @param year - 연도
 * @param total - 변경할 총 연차 (0.5 단위)
 * @returns 수정 결과
 */
export async function updateLeaveBalance(
  userId: string,
  year: number,
  total: number,
): Promise<ApiResponse<LeaveBalance>> {
  try {
    const totalValue = Number(total)
    if (Number.isNaN(totalValue) || totalValue < 0) {
      return { success: false, error: '총 연차 값이 올바르지 않습니다.' }
    }

    const totalInt = Math.round(totalValue * 10)

    const { data: current, error: fetchError } = await supabase
      .from('leave_balances')
      .select('used')
      .eq('user_id', userId)
      .eq('year', year)
      .single()

    if (fetchError) {
      return { success: false, error: fetchError.message }
    }

    const usedInt = current?.used ?? 0
    const remainInt = totalInt - usedInt

    if (remainInt < 0) {
      return {
        success: false,
        error: '총 연차가 사용 연차보다 적을 수 없습니다.',
      }
    }

    const { data, error } = await supabase
      .from('leave_balances')
      .update({ total: totalInt, remain: remainInt })
      .eq('user_id', userId)
      .eq('year', year)
      .select('*')
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    if (!data) {
      return { success: false, error: '수정된 데이터가 없습니다.' }
    }

    const normalized: LeaveBalance = {
      user_id: data.user_id,
      year: data.year,
      total: data.total / 10,
      used: data.used / 10,
      remain: data.remain / 10,
      expire_at: data.expire_at,
    }

    return { success: true, data: normalized }
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다',
    }
  }
}

/**
 * 연차 예약 목록 조회
 *
 * @param userId - 사용자 ID
 * @param status - 예약 상태 필터 (선택)
 * @returns 예약 목록
 *
 * @example
 * ```ts
 * const result = await getLeaveReservations('user123', 'RESERVED')
 * if (result.success && result.data) {
 *   console.log('예약 건수:', result.data.length)
 * }
 * ```
 */
export async function getLeaveReservations(
  userId: string,
  status?: ReservationStatus,
): Promise<ApiResponse<LeaveReservation[]>> {
  try {
    let query = supabase
      .from('leave_reservations_display')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: true })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      return { success: false, error: error.message }
    }

    return {
      success: true,
      data: (data || []) as unknown as LeaveReservation[],
    }
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다',
    }
  }
}

/**
 * 모든 사용자의 연차 예약 조회 (관리자용)
 *
 * @param status - 예약 상태 필터 (선택)
 * @returns 전체 예약 목록
 *
 * @example
 * ```ts
 * const result = await getAllLeaveReservations('RESERVED')
 * if (result.success && result.data) {
 *   console.log('전체 예약:', result.data.length)
 * }
 * ```
 */
export async function getAllLeaveReservations(
  status?: ReservationStatus,
): Promise<ApiResponse<LeaveReservation[]>> {
  try {
    let query = supabase
      .from('leave_reservations_display')
      .select('*')
      .order('date', { ascending: true })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      return { success: false, error: error.message }
    }

    return {
      success: true,
      data: (data || []) as unknown as LeaveReservation[],
    }
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다',
    }
  }
}

/**
 * 연차 사용 이력 조회
 *
 * @param userId - 사용자 ID
 * @param startDate - 시작일 (선택)
 * @param endDate - 종료일 (선택)
 * @returns 사용 이력 목록
 *
 * @example
 * ```ts
 * const result = await getLeaveHistory('user123', '2024-01-01', '2024-12-31')
 * if (result.success && result.data) {
 *   console.log('2024년 사용 이력:', result.data)
 * }
 * ```
 */
export async function getLeaveHistory(
  userId: string,
  startDate?: string,
  endDate?: string,
): Promise<ApiResponse<LeaveHistory[]>> {
  try {
    let query = supabase
      .from('leave_history_display')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })

    if (startDate) {
      query = query.gte('date', startDate)
    }

    if (endDate) {
      query = query.lte('date', endDate)
    }

    const { data, error } = await query

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: (data || []) as unknown as LeaveHistory[] }
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다',
    }
  }
}

/**
 * 연차 신청 (RPC 함수 호출)
 *
 * @param userId - 사용자 ID
 * @param date - 날짜 (YYYY-MM-DD)
 * @param type - 연차 타입 (FULL/HALF)
 * @param session - 반차 세션 (AM/PM, HALF일 경우 필수)
 * @returns 신청 결과
 *
 * @example
 * ```ts
 * const result = await reserveLeave('user123', '2024-12-25', 'FULL', null)
 * if (result.success) {
 *   console.log('연차 신청 성공')
 * }
 * ```
 */
export async function reserveLeave(
  userId: string,
  date: string,
  type: LeaveType,
  session: LeaveSession,
): Promise<ApiResponse<{ reservation_id?: number; message?: string }>> {
  try {
    const { data, error } = await supabase.rpc('reserve_leave', {
      p_user_id: userId,
      p_date: date,
      p_type: type,
      p_session: session,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return {
      success: !!data?.success,
      data:
        (data as { reservation_id?: number; message?: string }) || undefined,
      error: data?.success ? undefined : data?.message,
    }
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다',
    }
  }
}

/**
 * 연차 취소 (RPC 함수 호출)
 *
 * @param reservationId - 예약 ID
 * @returns 취소 결과
 *
 * @example
 * ```ts
 * const result = await cancelLeave(123)
 * if (result.success) {
 *   console.log('연차 취소 완료')
 * }
 * ```
 */
export async function cancelLeave(
  reservationId: number,
): Promise<ApiResponse<{ message?: string }>> {
  try {
    const { data, error } = await supabase.rpc('cancel_leave', {
      p_reservation_id: reservationId,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return {
      success: !!data?.success,
      data: (data as { message?: string }) || undefined,
      error: data?.success ? undefined : data?.message,
    }
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다',
    }
  }
}

/**
 * 사용된 연차를 취소하고 복구 (RPC 함수 호출)
 *
 * @param historyId - 히스토리 ID
 * @returns 취소 및 복구 결과
 *
 * @example
 * ```ts
 * const result = await cancelLeaveHistory(123)
 * if (result.success) {
 *   console.log('연차 취소 및 복구 완료')
 * }
 * ```
 */
export async function cancelLeaveHistory(
  historyId: number,
): Promise<ApiResponse<{ message?: string }>> {
  try {
    const { data, error } = await supabase.rpc('cancel_leave_history', {
      p_history_id: historyId,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return {
      success: !!data?.success,
      data: (data as { message?: string }) || undefined,
      error: data?.success ? undefined : data?.message,
    }
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다',
    }
  }
}

/**
 * 사용 완료된 예약을 취소하고 복구 (예약 ID 기반)
 *
 * @param reservationId - 예약 ID
 * @returns 취소 및 복구 결과
 *
 * @example
 * ```ts
 * const result = await cancelLeaveUsedReservation(123)
 * if (result.success) {
 *   console.log('연차 취소 및 복구 완료')
 * }
 * ```
 */
export async function cancelLeaveUsedReservation(
  reservationId: number,
): Promise<ApiResponse<{ message?: string }>> {
  try {
    const { data, error } = await supabase.rpc('cancel_leave_by_reservation', {
      p_reservation_id: reservationId,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return {
      success: !!data?.success,
      data: (data as { message?: string }) || undefined,
      error: data?.success ? undefined : data?.message,
    }
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다',
    }
  }
}

/**
 * 모든 사용자의 연차 히스토리 조회 (관리자용)
 *
 * @param startDate - 시작일 (선택)
 * @param endDate - 종료일 (선택)
 * @returns 전체 사용 이력 목록
 *
 * @example
 * ```ts
 * const result = await getAllLeaveHistory()
 * if (result.success && result.data) {
 *   console.log('전체 사용 이력:', result.data.length)
 * }
 * ```
 */
export async function getAllLeaveHistory(
  startDate?: string,
  endDate?: string,
): Promise<ApiResponse<LeaveHistory[]>> {
  try {
    let query = supabase
      .from('leave_history_display')
      .select('*')
      .order('date', { ascending: false })

    if (startDate) {
      query = query.gte('date', startDate)
    }

    if (endDate) {
      query = query.lte('date', endDate)
    }

    const { data, error } = await query

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: (data || []) as unknown as LeaveHistory[] }
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다',
    }
  }
}
