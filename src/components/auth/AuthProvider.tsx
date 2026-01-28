import { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router'
import { subscribeToAuthChanges } from '@/lib/supabase/api/auth'
import { useAuthStore } from '@/store/authStore'
import { setFlashNotice } from '@/utils/flashNotice'

export default function AuthProvider() {
  const initialize = useAuthStore((state) => state.initialize)
  const setUser = useAuthStore((state) => state.setUser)
  const navigate = useNavigate()

  useEffect(() => {
    let isMounted = true
    let unsubscribe = () => {}

    const bootstrap = async () => {
      await initialize()
      if (!isMounted) return

      unsubscribe = subscribeToAuthChanges((event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setUser(session?.user || null, session)
          return
        }

        if (event === 'TOKEN_REFRESH_FAILED') {
          setUser(null, null)
          setFlashNotice({
            message: '세션이 만료되어 다시 로그인해 주세요.',
            tone: 'red',
          })
          if (window.location.pathname !== '/login') {
            navigate('/login', { replace: true })
          }
          return
        }

        if (event === 'SIGNED_OUT') {
          setUser(null, null)
          setFlashNotice({
            message: '로그아웃되었습니다.',
            tone: 'yellow',
          })
          if (window.location.pathname !== '/login') {
            navigate('/login', { replace: true })
          }
        }
      })
    }

    bootstrap()

    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [initialize, navigate, setUser])

  return <Outlet />
}
