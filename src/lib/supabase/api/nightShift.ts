/**
 * Supabase Night Shift API
 * 야간 근무 관리 관련 모든 데이터 조회/수정/삭제 로직을 캡슐화합니다.
 */

import type {
  ApiResponse,
  Employee,
  EmployeeNightShiftStats,
  EmployeeStatus,
  NightShiftConfig,
  NightShiftRecord,
  NightShiftStats,
  Weekday,
} from '@/types/nightShift'
import { supabase } from '../client'

/**
 * ================================================================
 * Employee Management (직원 관리)
 * ================================================================
 */

/**
 * 모든 직원 조회
 *
 * @param status - 직원 상태 필터 (선택)
 * @returns 직원 목록
 *
 * @example
 * ```ts
 * const result = await getAllEmployees('ACTIVE')
 * if (result.success && result.data) {
 *   console.log('재직 중인 직원:', result.data)
 * }
 * ```
 */
export async function getAllEmployees(
  status?: EmployeeStatus,
): Promise<ApiResponse & { data?: Employee[] }> {
  try {
    let query = supabase.from('employees').select('*').order('name')

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) throw error

    return {
      success: true,
      data: (data as Employee[]) || [],
      message: 'Employees fetched.',
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * 직원 ID로 조회
 *
 * @param id - 직원 ID
 * @returns 직원 정보
 */
export async function getEmployeeById(
  id: number,
): Promise<ApiResponse & { data?: Employee }> {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error

    return {
      success: true,
      data: data as Employee,
      message: 'Employee fetched.',
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * 직원 생성
 *
 * @param name - 직원 이름
 * @param status - 직원 상태 (기본값: ACTIVE)
 * @returns 생성된 직원 정보
 *
 * @example
 * ```ts
 * const result = await createEmployee('홍길동', 'ACTIVE')
 * if (result.success) {
 *   console.log('직원 생성 완료:', result.data)
 * }
 * ```
 */
export async function createEmployee(
  name: string,
  status: EmployeeStatus = 'ACTIVE',
): Promise<ApiResponse & { data?: Employee }> {
  try {
    const { data, error } = await supabase
      .from('employees')
      .insert({ name, status })
      .select()
      .single()

    if (error) throw error

    return {
      success: true,
      data: data as Employee,
      message: 'Employee created.',
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * 여러 직원 생성
 *
 * @param names - 직원 이름 목록
 * @param status - 직원 상태 (기본값: ACTIVE)
 * @returns 생성된 직원 목록
 */
export async function createEmployees(
  names: string[],
  status: EmployeeStatus = 'ACTIVE',
): Promise<ApiResponse & { data?: Employee[] }> {
  try {
    if (names.length === 0) {
      return { success: false, message: 'No employee names provided.' }
    }

    const payload = names.map((name) => ({ name, status }))
    const { data, error } = await supabase
      .from('employees')
      .insert(payload)
      .select()

    if (error) throw error

    return {
      success: true,
      data: (data as Employee[]) || [],
      message: 'Employees created.',
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * 직원 정보 수정
 *
 * @param id - 직원 ID
 * @param updates - 수정할 필드 (name, user_id, status)
 * @returns 수정된 직원 정보
 */
export async function updateEmployee(
  id: number,
  updates: Partial<Pick<Employee, 'name' | 'user_id' | 'status'>>,
): Promise<ApiResponse & { data?: Employee }> {
  try {
    const { data, error } = await supabase
      .from('employees')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return {
      success: true,
      data: data as Employee,
      message: 'Employee updated.',
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * 직원 삭제
 *
 * @param id - 직원 ID
 * @returns 삭제 결과
 */
export async function deleteEmployee(id: number): Promise<ApiResponse> {
  try {
    const { error } = await supabase.from('employees').delete().eq('id', id)

    if (error) throw error

    return { success: true, message: 'Employee deleted.' }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * 직원과 사용자 계정 연동
 *
 * @param employeeId - 직원 ID
 * @param userId - 사용자 UUID
 * @returns 업데이트 결과
 *
 * @example
 * ```ts
 * // 직원이 회원가입 후 연동
 * const result = await linkEmployeeToUser(123, 'user-uuid-123')
 * ```
 */
export async function linkEmployeeToUser(
  employeeId: number,
  userId: string,
): Promise<ApiResponse & { data?: Employee }> {
  try {
    const { data, error } = await supabase
      .from('employees')
      .update({ user_id: userId })
      .eq('id', employeeId)
      .select()
      .single()

    if (error) throw error

    return {
      success: true,
      data: data as Employee,
      message: 'Employee linked to user account.',
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * ================================================================
 * Night Shift Config (야간 요일 설정)
 * ================================================================
 */

/**
 * 야간 요일 설정 전체 조회
 *
 * @returns 야간 요일 설정 목록
 */
export async function getNightShiftConfig(): Promise<
  ApiResponse & { data?: NightShiftConfig[] }
> {
  try {
    const { data, error } = await supabase
      .from('night_shift_config')
      .select('*')
      .order('weekday')

    if (error) throw error

    return {
      success: true,
      data: (data as NightShiftConfig[]) || [],
      message: 'Config fetched.',
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * 활성화된 야간 요일만 조회
 *
 * @returns 활성화된 야간 요일 목록
 */
export async function getActiveNightShiftDays(): Promise<
  ApiResponse & { data?: Weekday[] }
> {
  try {
    const { data, error } = await supabase
      .from('night_shift_config')
      .select('weekday')
      .eq('is_active', true)
      .order('weekday')

    if (error) throw error

    const weekdays = data?.map((row) => row.weekday as Weekday) || []
    return {
      success: true,
      data: weekdays,
      message: 'Active days fetched.',
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * 야간 요일 설정 업데이트
 *
 * @param weekday - 요일
 * @param isActive - 활성화 여부
 * @returns 업데이트 결과
 */
export async function updateNightShiftConfig(
  weekday: Weekday,
  isActive: boolean,
): Promise<ApiResponse & { data?: NightShiftConfig }> {
  try {
    const { data, error } = await supabase
      .from('night_shift_config')
      .upsert({ weekday, is_active: isActive }, { onConflict: 'weekday' })
      .select()
      .single()

    if (error) throw error

    return {
      success: true,
      data: data as NightShiftConfig,
      message: 'Config updated.',
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * ================================================================
 * Night Shift Records (야간 근무 기록)
 * ================================================================
 */

/**
 * 야간 근무 기록 조회
 *
 * @param filters - 필터 옵션
 * @returns 야간 근무 기록 목록
 */
export async function getNightShiftRecords(filters?: {
  employeeId?: number
  startDate?: string
  endDate?: string
}): Promise<ApiResponse & { data?: NightShiftRecord[] }> {
  try {
    let query = supabase
      .from('night_shift_records')
      .select('*')
      .order('work_date', { ascending: false })

    if (filters?.employeeId) {
      query = query.eq('employee_id', filters.employeeId)
    }
    if (filters?.startDate) {
      query = query.gte('work_date', filters.startDate)
    }
    if (filters?.endDate) {
      query = query.lte('work_date', filters.endDate)
    }

    const { data, error } = await query

    if (error) throw error

    return {
      success: true,
      data: (data as NightShiftRecord[]) || [],
      message: 'Records fetched.',
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * 야간 근무 기록 생성 (RPC 사용 - weekday 자동 계산)
 *
 * @param employeeId - 직원 ID
 * @param workDate - 근무 날짜 (YYYY-MM-DD)
 * @returns 생성 결과
 *
 * @example
 * ```ts
 * const result = await createNightShiftRecord(123, '2025-02-10')
 * ```
 */
export async function createNightShiftRecord(
  employeeId: number,
  workDate: string,
): Promise<ApiResponse> {
  try {
    const { data, error } = await supabase.rpc('create_night_shift_record', {
      p_employee_id: employeeId,
      p_work_date: workDate,
    })

    if (error) throw error

    return data as unknown as ApiResponse
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * 야간 근무 기록 삭제
 *
 * @param id - 기록 ID
 * @returns 삭제 결과
 */
export async function deleteNightShiftRecord(id: number): Promise<ApiResponse> {
  try {
    const { error } = await supabase
      .from('night_shift_records')
      .delete()
      .eq('id', id)

    if (error) throw error

    return { success: true, message: 'Record deleted.' }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * 날짜와 직원 ID로 야간 근무 기록 삭제
 *
 * @param employeeId - 직원 ID
 * @param workDate - 근무 날짜
 * @returns 삭제 결과
 */
export async function deleteNightShiftRecordByDate(
  employeeId: number,
  workDate: string,
): Promise<ApiResponse> {
  try {
    const { error } = await supabase
      .from('night_shift_records')
      .delete()
      .eq('employee_id', employeeId)
      .eq('work_date', workDate)

    if (error) throw error

    return { success: true, message: 'Record deleted.' }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * ================================================================
 * Statistics (통계)
 * ================================================================
 */

/**
 * 개별 직원 야간 근무 통계 조회
 *
 * @param employeeId - 직원 ID
 * @param year - 연도
 * @param month - 월 (선택)
 * @returns 요일별 근무 횟수
 *
 * @example
 * ```ts
 * // 2025년 2월 통계
 * const result = await getNightShiftStats(123, 2025, 2)
 * // 반환: { TUE: 3, WED: 2, THU: 4 }
 *
 * // 2025년 전체 통계
 * const result2 = await getNightShiftStats(123, 2025)
 * // 반환: { TUE: 15, WED: 18, THU: 20 }
 * ```
 */
export async function getNightShiftStats(
  employeeId: number,
  year: number,
  month?: number,
): Promise<ApiResponse & { data?: NightShiftStats }> {
  try {
    const { data, error } = await supabase.rpc('get_night_shift_stats', {
      p_employee_id: employeeId,
      p_year: year,
      p_month: month,
    })

    if (error) throw error

    return {
      success: true,
      data: (data as NightShiftStats) || {},
      message: 'Stats fetched.',
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * 전체 직원 야간 근무 통계 조회
 *
 * @param year - 연도
 * @param month - 월 (선택)
 * @returns 전체 직원의 요일별 근무 통계
 *
 * @example
 * ```ts
 * const result = await getAllEmployeesNightShiftStats(2025, 2)
 * if (result.success && result.data) {
 *   result.data.forEach(emp => {
 *     console.log(`${emp.employee_name}: `, emp.stats)
 *   })
 * }
 * ```
 */
export async function getAllEmployeesNightShiftStats(
  year: number,
  month?: number,
): Promise<ApiResponse & { data?: EmployeeNightShiftStats[] }> {
  try {
    const { data, error } = await supabase.rpc(
      'get_all_employees_night_shift_stats',
      {
        p_year: year,
        p_month: month,
      },
    )

    if (error) throw error

    return {
      success: true,
      data: (data as EmployeeNightShiftStats[]) || [],
      message: 'All stats fetched.',
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
