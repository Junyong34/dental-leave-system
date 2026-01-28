/**
 * Supabase User API
 *
 * 사용자(직원) 정보 조회, 수정, 생성, 삭제 등의 로직을 캡슐화합니다.
 * 모든 함수는 일관된 ApiResponse 형태로 결과를 반환합니다.
 *
 * @module supabase/api/user
 *
 * @example
 * ```ts
 * import { getUserById, getAllUsers, updateUser } from '@/lib/supabase/api/user'
 *
 * // 특정 사용자 조회
 * const user = await getUserById('user123')
 *
 * // 활성 사용자 목록 조회
 * const activeUsers = await getAllUsers('ACTIVE')
 *
 * // 사용자 정보 수정
 * await updateUser('user123', { name: '홍길동' })
 * ```
 */

import { supabase } from '../client'
import type { User, UserStatus } from '@/types/leave'

/**
 * API 응답 타입
 *
 * 모든 API 함수는 이 형태로 결과를 반환합니다.
 *
 * @template T - 응답 데이터 타입
 * @property {boolean} success - 성공 여부
 * @property {T} [data] - 응답 데이터 (성공 시)
 * @property {string} [error] - 에러 메시지 (실패 시)
 */
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

/**
 * 사용자 정보 조회 (ID로)
 *
 * user_id를 사용하여 특정 사용자의 정보를 조회합니다.
 * 단일 사용자 정보를 가져올 때 사용합니다.
 *
 * @param userId - 사용자 ID (user_id)
 * @returns {Promise<ApiResponse<User>>} 사용자 정보
 *
 * @example
 * ```ts
 * const result = await getUserById('U001')
 * if (result.success && result.data) {
 *   console.log('사용자 이름:', result.data.name)
 *   console.log('입사일:', result.data.join_date)
 *   console.log('그룹:', result.data.group_id)
 * }
 * ```
 */
export async function getUserById(userId: string): Promise<ApiResponse<User>> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: data as User }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다',
    }
  }
}

/**
 * 모든 사용자 목록 조회
 *
 * 모든 사용자를 이름 순으로 정렬하여 조회합니다.
 * 선택적으로 상태(ACTIVE/INACTIVE/RESIGNED)로 필터링할 수 있습니다.
 *
 * @param status - 사용자 상태 필터 (선택, 미지정 시 전체 조회)
 * @returns {Promise<ApiResponse<User[]>>} 사용자 목록
 *
 * @example
 * ```ts
 * // 활성 사용자만 조회
 * const result = await getAllUsers('ACTIVE')
 * if (result.success && result.data) {
 *   console.log('활성 사용자 수:', result.data.length)
 *   result.data.forEach(user => console.log(user.name))
 * }
 *
 * // 전체 사용자 조회
 * const allUsers = await getAllUsers()
 * ```
 */
export async function getAllUsers(
  status?: UserStatus
): Promise<ApiResponse<User[]>> {
  try {
    let query = supabase.from('users').select('*').order('name', { ascending: true })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: data || [] }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다',
    }
  }
}

/**
 * 그룹별 사용자 목록 조회
 *
 * 특정 그룹에 속한 사용자들을 조회합니다.
 * 연차 제한을 그룹 단위로 관리할 때 유용합니다.
 *
 * @param groupId - 그룹 ID (예: 'G01', 'G02')
 * @param status - 사용자 상태 필터 (선택)
 * @returns {Promise<ApiResponse<User[]>>} 그룹 내 사용자 목록
 *
 * @example
 * ```ts
 * // 특정 그룹의 활성 사용자 조회
 * const result = await getUsersByGroup('G01', 'ACTIVE')
 * if (result.success && result.data) {
 *   console.log('그룹 G01의 활성 사용자:', result.data.length)
 * }
 * ```
 */
export async function getUsersByGroup(
  groupId: string,
  status?: UserStatus
): Promise<ApiResponse<User[]>> {
  try {
    let query = supabase
      .from('users')
      .select('*')
      .eq('group_id', groupId)
      .order('name', { ascending: true })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: data || [] }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다',
    }
  }
}

/**
 * 사용자 정보 수정
 *
 * 사용자의 특정 필드를 수정합니다.
 * user_id는 수정할 수 없으며, 나머지 필드는 선택적으로 수정 가능합니다.
 *
 * @param userId - 사용자 ID (수정 대상)
 * @param updates - 수정할 필드들 (Partial 타입)
 * @returns {Promise<ApiResponse<User>>} 수정된 사용자 정보
 *
 * @example
 * ```ts
 * // 이름과 상태 수정
 * const result = await updateUser('U001', {
 *   name: '홍길동',
 *   status: 'ACTIVE'
 * })
 *
 * // 그룹만 변경
 * await updateUser('U001', { group_id: 'G02' })
 * ```
 */
export async function updateUser(
  userId: string,
  updates: Partial<Omit<User, 'user_id'>>
): Promise<ApiResponse<User>> {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: data as User }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다',
    }
  }
}

/**
 * 사용자 상태 변경
 *
 * 사용자의 상태만 변경하는 헬퍼 함수입니다.
 * 퇴사 처리, 휴직 처리 등에 사용됩니다.
 *
 * @param userId - 사용자 ID
 * @param status - 새로운 상태 (ACTIVE | INACTIVE | RESIGNED)
 * @returns {Promise<ApiResponse<User>>} 수정된 사용자 정보
 *
 * @example
 * ```ts
 * // 퇴사 처리
 * await updateUserStatus('U001', 'RESIGNED')
 *
 * // 활성화
 * await updateUserStatus('U001', 'ACTIVE')
 * ```
 */
export async function updateUserStatus(
  userId: string,
  status: UserStatus
): Promise<ApiResponse<User>> {
  return updateUser(userId, { status })
}

/**
 * 사용자 생성
 *
 * 새로운 사용자(직원)를 시스템에 등록합니다.
 * 입사 처리 시 사용됩니다.
 *
 * @param user - 생성할 사용자 정보 (모든 필드 필수)
 * @returns {Promise<ApiResponse<User>>} 생성된 사용자 정보
 *
 * @example
 * ```ts
 * const result = await createUser({
 *   user_id: 'U005',
 *   name: '홍길동',
 *   join_date: '2024-01-01',
 *   group_id: 'G01',
 *   status: 'ACTIVE'
 * })
 *
 * if (result.success) {
 *   console.log('신규 직원 등록 완료:', result.data)
 * }
 * ```
 */
export async function createUser(user: User): Promise<ApiResponse<User>> {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert(user)
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: data as User }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다',
    }
  }
}

/**
 * 사용자 삭제 (Soft Delete)
 *
 * 실제로 DB에서 삭제하지 않고 상태를 'RESIGNED'로 변경합니다.
 * 연차 이력 등 과거 데이터를 보존하기 위한 Soft Delete 방식입니다.
 *
 * @param userId - 삭제할 사용자 ID
 * @returns {Promise<ApiResponse<void>>} 성공 여부
 *
 * @example
 * ```ts
 * const result = await deleteUser('U001')
 * if (result.success) {
 *   console.log('사용자 퇴사 처리 완료')
 * } else {
 *   console.error('삭제 실패:', result.error)
 * }
 * ```
 *
 * @see updateUserStatus - 실제로는 이 함수를 사용하여 상태 변경
 */
export async function deleteUser(userId: string): Promise<ApiResponse<void>> {
  return updateUserStatus(userId, 'RESIGNED').then((result) => ({
    success: result.success,
    error: result.error,
  }))
}
