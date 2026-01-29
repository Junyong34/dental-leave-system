/**
 * Auth Store - 전역 인증 상태 관리
 *
 * Zustand를 사용하여 애플리케이션의 인증 상태를 전역으로 관리합니다.
 * localStorage에 상태를 영속화하여 페이지 새로고침 시에도 로그인 상태를 유지합니다.
 *
 * @module authStore
 *
 * @example
 * ```tsx
 * // 컴포넌트에서 사용
 * import { useAuthStore } from '@/store/authStore'
 *
 * function MyComponent() {
 *   const { isAuthenticated, user, login, logout } = useAuthStore()
 *
 *   const handleLogin = async () => {
 *     const success = await login('user@example.com', 'password')
 *     if (success) {
 *       console.log('로그인 성공!')
 *     }
 *   }
 *
 *   return (
 *     <div>
 *       {isAuthenticated ? (
 *         <>
 *           <p>안녕하세요, {user?.email}</p>
 *           <button onClick={logout}>로그아웃</button>
 *         </>
 *       ) : (
 *         <button onClick={handleLogin}>로그인</button>
 *       )}
 *     </div>
 *   )
 * }
 * ```
 *
 * @example
 * ```tsx
 * // App.tsx에서 초기화
 * import { useAuthStore } from '@/store/authStore'
 * import { subscribeToAuthChanges } from '@/lib/supabase/api/auth'
 *
 * function App() {
 *   const { initialize, setUser } = useAuthStore()
 *
 *   useEffect(() => {
 *     // 앱 시작 시 세션 복원
 *     initialize()
 *
 *     // Auth 상태 변경 구독
 *     const unsubscribe = subscribeToAuthChanges((event, session) => {
 *       if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
 *         setUser(session?.user || null, session)
 *       } else if (event === 'SIGNED_OUT') {
 *         setUser(null, null)
 *       }
 *     })
 *
 *     return () => unsubscribe()
 *   }, [])
 *
 *   return <YourApp />
 * }
 * ```
 */

import type { Session, User } from '@supabase/supabase-js'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  getCurrentUser,
  getSession,
  loginWithEmail,
  logout as supabaseLogout,
} from '@/lib/supabase/api/auth'

/**
 * 인증 상태 인터페이스
 */
interface AuthState {
  /**
   * 사용자 로그인 여부
   */
  isAuthenticated: boolean

  /**
   * 현재 로그인한 사용자 정보
   * 로그아웃 상태일 경우 null
   */
  user: User | null

  /**
   * 현재 세션 정보
   * 로그아웃 상태일 경우 null
   */
  session: Session | null

  /**
   * 초기화 로딩 상태
   * 앱 시작 시 세션 복원 중일 때 true
   */
  loading: boolean

  /**
   * 현재 로그인한 사용자 이름 (user_metadata.name)
   */
  username: string | null

  /**
   * 이메일/비밀번호로 로그인
   *
   * @param email - 사용자 이메일
   * @param password - 비밀번호
   * @returns 로그인 성공 여부
   *
   * @example
   * ```tsx
   * const { login } = useAuthStore()
   * const success = await login('user@example.com', 'password')
   * if (success) {
   *   console.log('로그인 성공')
   * } else {
   *   console.log('로그인 실패')
   * }
   * ```
   */
  login: (email: string, password: string) => Promise<boolean>

  /**
   * 로그아웃
   *
   * @example
   * ```tsx
   * const { logout } = useAuthStore()
   * await logout()
   * console.log('로그아웃 완료')
   * ```
   */
  logout: () => Promise<void>

  /**
   * 앱 시작 시 세션 초기화
   *
   * localStorage에 저장된 세션을 복원하고 유효성을 검증합니다.
   * App.tsx에서 useEffect로 한 번만 호출해야 합니다.
   *
   * @example
   * ```tsx
   * // App.tsx
   * useEffect(() => {
   *   useAuthStore.getState().initialize()
   * }, [])
   * ```
   */
  initialize: () => Promise<void>

  /**
   * Auth 상태 직접 업데이트
   *
   * 주로 Supabase의 onAuthStateChange 구독에서 사용됩니다.
   * 일반적으로 직접 호출할 필요가 없습니다.
   *
   * @param user - 사용자 정보 (null이면 로그아웃 상태)
   * @param session - 세션 정보 (null이면 로그아웃 상태)
   *
   * @example
   * ```tsx
   * // App.tsx에서 Auth 구독
   * subscribeToAuthChanges((event, session) => {
   *   const { setUser } = useAuthStore.getState()
   *   if (event === 'SIGNED_IN') {
   *     setUser(session?.user || null, session)
   *   }
   * })
   * ```
   */
  setUser: (user: User | null, session: Session | null) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      session: null,
      username: null,
      loading: true,

      /**
       * Supabase 이메일/비밀번호 로그인
       *
       * 로그인 성공 시 사용자 정보와 세션을 Store에 저장합니다.
       */
      login: async (email: string, password: string) => {
        const result = await loginWithEmail(email, password)

        if (result.success && result.user && result.session) {
          set({
            isAuthenticated: true,
            user: result.user,
            session: result.session,
            username:
              result.user.user_metadata?.name || result.user.email || null,
          })
          return true
        }

        return false
      },

      /**
       * 로그아웃
       *
       * Supabase 로그아웃을 수행하고 Store 상태를 초기화합니다.
       */
      logout: async () => {
        await supabaseLogout()
        set({
          isAuthenticated: false,
          user: null,
          session: null,
          username: null,
        })
      },

      /**
       * 앱 시작 시 세션 초기화
       *
       * localStorage에 저장된 세션의 유효성을 검증하고 복원합니다.
       * 세션이 유효하지 않으면 로그아웃 상태로 설정됩니다.
       */
      initialize: async () => {
        set({ loading: true })

        const session = await getSession()
        const user = await getCurrentUser()

        if (session && user) {
          set({
            isAuthenticated: true,
            user,
            session,
            username: user.user_metadata?.name || user.email || null,
          })
        } else {
          set({
            isAuthenticated: false,
            user: null,
            session: null,
            username: null,
          })
        }

        set({ loading: false })
      },

      /**
       * Auth 상태 업데이트 (Auth 구독에서 호출)
       *
       * Supabase의 onAuthStateChange 이벤트에서 호출됩니다.
       * user와 session이 모두 있을 때만 isAuthenticated를 true로 설정합니다.
       */
      setUser: (user: User | null, session: Session | null) => {
        set({
          isAuthenticated: !!user && !!session,
          user,
          session,
          username: user?.user_metadata?.name || user?.email || null,
        })
      },
    }),
    {
      name: 'auth-storage',
      /**
       * localStorage 영속화 설정
       *
       * session은 Supabase에서 자체 관리하므로 persist에서 제외합니다.
       * isAuthenticated와 user만 localStorage에 저장됩니다.
       */
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        username: state.username,
      }),
    },
  ),
)
