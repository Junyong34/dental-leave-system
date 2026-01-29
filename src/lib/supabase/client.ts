/**
 * Supabase 클라이언트 - 단일 인스턴스 (Singleton Pattern)
 *
 * 애플리케이션 전역에서 동일한 Supabase 클라이언트 인스턴스를 사용합니다.
 * 이 패턴을 사용하면 불필요한 연결 생성을 방지하고 메모리를 절약할 수 있습니다.
 *
 * @module supabase/client
 *
 * @example
 * ```ts
 * // 직접 Supabase 클라이언트 사용
 * import { supabase } from '@/lib/supabase/client'
 *
 * const { data, error } = await supabase
 *   .from('users')
 *   .select('*')
 *   .eq('status', 'ACTIVE')
 * ```
 *
 * @example
 * ```ts
 * // 헬퍼 함수 사용
 * import { getSession, getCurrentUser } from '@/lib/supabase/client'
 *
 * const session = await getSession()
 * const user = await getCurrentUser()
 * ```
 */

import { createClient } from '@supabase/supabase-js'
import {
  supabaseClientOptions,
  supabaseConfig,
  validateSupabaseConfig,
} from './config'
import type { Database } from './types/database.types'

// 환경 변수 검증 (앱 시작 시 자동 실행)
validateSupabaseConfig()

/**
 * Supabase 클라이언트 단일 인스턴스
 *
 * TypeScript Database 타입이 적용되어 있어 자동완성과 타입 체크가 지원됩니다.
 * 모든 Supabase 기능(Auth, Database, Storage, Realtime)에 접근할 수 있습니다.
 *
 * @constant
 *
 * @example
 * ```ts
 * // 테이블 조회
 * const { data: users } = await supabase
 *   .from('users')
 *   .select('*')
 *
 * // 인증
 * const { data: session } = await supabase.auth.getSession()
 *
 * // RPC 함수 호출
 * const { data } = await supabase.rpc('reserve_leave', {
 *   p_user_id: 'user123',
 *   p_date: '2024-12-25',
 *   p_type: 'FULL',
 *   p_session: null
 * })
 * ```
 */
export const supabase = createClient<Database>(
  supabaseConfig.url,
  supabaseConfig.anonKey,
  supabaseClientOptions,
)

/**
 * 현재 세션 가져오기
 *
 * localStorage에 저장된 세션을 조회합니다.
 * 세션이 없거나 만료된 경우 null을 반환합니다.
 *
 * @returns {Promise<Session | null>} 현재 세션 또는 null
 *
 * @example
 * ```ts
 * const session = await getSession()
 * if (session) {
 *   console.log('로그인됨:', session.user.email)
 *   console.log('만료 시간:', session.expires_at)
 * }
 * ```
 */
export async function getSession() {
  const { data, error } = await supabase.auth.getSession()
  if (error) {
    console.error('세션 조회 실패:', error)
    return null
  }
  return data.session
}

/**
 * 현재 사용자 정보 가져오기
 *
 * 세션이 유효한 경우 현재 로그인한 사용자의 정보를 반환합니다.
 * 로그아웃 상태이거나 세션이 만료된 경우 null을 반환합니다.
 *
 * @returns {Promise<User | null>} 현재 사용자 정보 또는 null
 *
 * @example
 * ```ts
 * const user = await getCurrentUser()
 * if (user) {
 *   console.log('사용자 ID:', user.id)
 *   console.log('이메일:', user.email)
 *   console.log('메타데이터:', user.user_metadata)
 * }
 * ```
 */
export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser()
  if (error) {
    console.error('사용자 조회 실패:', error)
    return null
  }
  return data.user
}
