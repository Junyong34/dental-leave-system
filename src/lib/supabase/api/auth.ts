/**
 * Supabase Auth API
 * 인증 관련 모든 로직을 캡슐화합니다.
 */

import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js'
import { supabase } from '../client'

/**
 * 로그인 결과
 */
export interface LoginResult {
  success: boolean
  session: Session | null
  user: User | null
  error?: string
}

/**
 * Auth 상태 변경 콜백
 */
export type AuthStateChangeCallback = (
  event: AuthChangeEvent,
  session: Session | null
) => void

/**
 * 이메일/비밀번호 로그인
 *
 * @param email - 사용자 이메일
 * @param password - 비밀번호
 * @returns 로그인 결과
 *
 * @example
 * ```ts
 * const result = await loginWithEmail('user@example.com', 'password123')
 * if (result.success) {
 *   console.log('로그인 성공:', result.user)
 * }
 * ```
 */
export async function loginWithEmail(
  email: string,
  password: string
): Promise<LoginResult> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return {
        success: false,
        session: null,
        user: null,
        error: error.message,
      }
    }

    return {
      success: true,
      session: data.session,
      user: data.user,
    }
  } catch (err) {
    return {
      success: false,
      session: null,
      user: null,
      error: err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다',
    }
  }
}

/**
 * 로그아웃
 *
 * @returns 성공 여부
 *
 * @example
 * ```ts
 * const success = await logout()
 * if (success) {
 *   console.log('로그아웃 완료')
 * }
 * ```
 */
export async function logout(): Promise<boolean> {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('로그아웃 실패:', error)
      return false
    }
    return true
  } catch (err) {
    console.error('로그아웃 중 예외 발생:', err)
    return false
  }
}

/**
 * 현재 세션 가져오기
 *
 * @returns 현재 세션 또는 null
 *
 * @example
 * ```ts
 * const session = await getSession()
 * if (session) {
 *   console.log('세션 유효:', session.user.email)
 * }
 * ```
 */
export async function getSession(): Promise<Session | null> {
  try {
    const { data, error } = await supabase.auth.getSession()
    if (error) {
      console.error('세션 조회 실패:', error)
      return null
    }
    return data.session
  } catch (err) {
    console.error('세션 조회 중 예외 발생:', err)
    return null
  }
}

/**
 * 현재 사용자 가져오기
 *
 * @returns 현재 사용자 또는 null
 *
 * @example
 * ```ts
 * const user = await getCurrentUser()
 * if (user) {
 *   console.log('사용자 ID:', user.id)
 * }
 * ```
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data, error } = await supabase.auth.getUser()
    if (error) {
      console.error('사용자 조회 실패:', error)
      return null
    }
    return data.user
  } catch (err) {
    console.error('사용자 조회 중 예외 발생:', err)
    return null
  }
}

/**
 * Auth 상태 변경 구독
 *
 * ⚠️ 주의: 앱에서 단 한 번만 호출해야 합니다 (보통 App.tsx 또는 main.tsx)
 *
 * @param callback - 상태 변경 시 실행할 콜백
 * @returns unsubscribe 함수
 *
 * @example
 * ```ts
 * // App.tsx에서 1회만 호출
 * useEffect(() => {
 *   const unsubscribe = subscribeToAuthChanges((event, session) => {
 *     console.log('Auth 이벤트:', event)
 *     if (event === 'SIGNED_IN') {
 *       console.log('로그인됨:', session?.user.email)
 *     } else if (event === 'SIGNED_OUT') {
 *       console.log('로그아웃됨')
 *     }
 *   })
 *
 *   return () => unsubscribe()
 * }, [])
 * ```
 */
export function subscribeToAuthChanges(
  callback: AuthStateChangeCallback
): () => void {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(callback)

  return () => {
    subscription.unsubscribe()
  }
}

/**
 * 비밀번호 재설정 이메일 전송
 *
 * @param email - 사용자 이메일
 * @returns 성공 여부와 에러 메시지
 *
 * @example
 * ```ts
 * const result = await sendPasswordResetEmail('user@example.com')
 * if (result.success) {
 *   console.log('비밀번호 재설정 이메일 전송됨')
 * }
 * ```
 */
export async function sendPasswordResetEmail(
  email: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다',
    }
  }
}

/**
 * 비밀번호 업데이트
 *
 * @param newPassword - 새 비밀번호
 * @returns 성공 여부와 에러 메시지
 *
 * @example
 * ```ts
 * const result = await updatePassword('newPassword123')
 * if (result.success) {
 *   console.log('비밀번호 변경 완료')
 * }
 * ```
 */
export async function updatePassword(
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다',
    }
  }
}
