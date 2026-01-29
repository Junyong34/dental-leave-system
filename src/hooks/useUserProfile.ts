import { useEffect, useState } from 'react'
import { getUserByIdOptional } from '@/lib/supabase/api/user'
import { useAuthStore } from '@/store/authStore'
import type { User } from '@/types/leave'

type UserProfileState = {
  user: User | null
  loading: boolean
  error: string | null
}

export default function useUserProfile(): UserProfileState {
  const userId = useAuthStore((state) => state.user?.id)
  const authLoading = useAuthStore((state) => state.loading)
  const [state, setState] = useState<UserProfileState>({
    user: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    if (authLoading) {
      setState((prev) => ({ ...prev, loading: true }))
      return
    }

    if (!userId) {
      setState({ user: null, loading: false, error: null })
      return
    }

    let isMounted = true
    setState((prev) => ({ ...prev, loading: true, error: null }))

    const loadProfile = async () => {
      const result = await getUserByIdOptional(userId)
      if (!isMounted) return

      if (!result.success) {
        setState({
          user: null,
          loading: false,
          error: result.error || '사용자 권한 정보를 불러오지 못했습니다.',
        })
        return
      }

      setState({
        user: result.data ?? null,
        loading: false,
        error: null,
      })
    }

    loadProfile()

    return () => {
      isMounted = false
    }
  }, [authLoading, userId])

  return state
}
