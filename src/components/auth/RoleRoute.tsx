import type { ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'
import { Navigate } from 'react-router'
import { getUserByIdOptional } from '@/lib/supabase/api/user'
import { useAuthStore } from '@/store/authStore'
import type { UserRole } from '@/types/leave'
import { setFlashNotice } from '@/utils/flashNotice'
import { hasRequiredRole } from '@/utils/permissions'

type AccessState = 'loading' | 'allowed' | 'denied'

interface RoleRouteProps {
  children: ReactNode
  requiredRoles: UserRole[]
  redirectTo?: string
  deniedMessage?: string
}

export default function RoleRoute({
  children,
  requiredRoles,
  redirectTo = '/',
  deniedMessage = '관리자만 접근할 수 있습니다.',
}: RoleRouteProps) {
  const [status, setStatus] = useState<AccessState>('loading')
  const [denyMessage, setDenyMessage] = useState<string | null>(null)
  const userId = useAuthStore((state) => state.user?.id)
  const loading = useAuthStore((state) => state.loading)
  const noticeSentRef = useRef(false)
  const rolesKey = requiredRoles.join(',')

  useEffect(() => {
    if (loading) return

    if (!userId) {
      setStatus('denied')
      setDenyMessage('인증 정보를 확인할 수 없습니다.')
      return
    }

    let isMounted = true

    const checkRole = async () => {
      setStatus('loading')
      const result = await getUserByIdOptional(userId)
      if (!isMounted) return

      if (!result.success) {
        setStatus('denied')
        setDenyMessage(
          result.error || '사용자 권한 정보를 불러오지 못했습니다.',
        )
        return
      }

      if (!result.data) {
        setStatus('denied')
        setDenyMessage('사용자 정보가 없습니다. 회원 등록이 필요합니다.')
        return
      }

      const roles = rolesKey.split(',') as UserRole[]
      if (!hasRequiredRole(result.data.role, roles)) {
        setStatus('denied')
        setDenyMessage(deniedMessage)
        return
      }

      setStatus('allowed')
      setDenyMessage(null)
    }

    checkRole()

    return () => {
      isMounted = false
    }
  }, [deniedMessage, loading, userId, rolesKey])

  useEffect(() => {
    if (status === 'denied' && denyMessage && !noticeSentRef.current) {
      setFlashNotice({ message: denyMessage, tone: 'red' })
      noticeSentRef.current = true
      return
    }

    if (status === 'allowed') {
      noticeSentRef.current = false
    }
  }, [denyMessage, status])

  if (loading || status === 'loading') {
    return null
  }

  if (status === 'denied') {
    return <Navigate to={redirectTo} replace />
  }

  return <>{children}</>
}
