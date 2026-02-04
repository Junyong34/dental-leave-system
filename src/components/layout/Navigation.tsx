import { Dialog, IconButton } from '@radix-ui/themes'
import {
  Calendar,
  CheckCircle,
  FileText,
  LayoutDashboard,
  Menu,
  Moon,
  Settings,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router'
import useUserProfile from '@/hooks/useUserProfile'
import type { UserRole } from '@/types/leave'
import { hasRequiredRole } from '@/utils/permissions'

const navLinkStyle = {
  position: 'relative' as const,
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '7px 12px',
  fontSize: '14px',
  fontWeight: '500',
  transition: 'all 0.2s',
  textDecoration: 'none',
}

const indicatorStyle = {
  position: 'absolute' as const,
  bottom: 0,
  left: 0,
  right: 0,
  height: '2px',
}

type NavItem = {
  to: string
  label: string
  icon: typeof LayoutDashboard
  requiredRoles?: UserRole[]
}

const navItems: NavItem[] = [
  { to: '/', label: '대시보드', icon: LayoutDashboard },
  { to: '/calendar', label: '연차 캘린더', icon: Calendar },
  { to: '/request', label: '연차 신청', icon: FileText },
  {
    to: '/approval',
    label: '연차 승인',
    icon: CheckCircle,
    requiredRoles: ['ADMIN'],
  },
  // { to: '/history', label: '연차 내역', icon: History },
  { to: '/night-shift-stats', label: '야간 진료', icon: Moon },
  { to: '/settings', label: '설정', icon: Settings, requiredRoles: ['ADMIN'] },
]

export default function Navigation() {
  const location = useLocation()
  const { user, loading } = useUserProfile()
  const role = user?.role ?? null
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)

  const isActive = (path: string) => {
    return location.pathname === path
  }

  const canAccess = (requiredRoles?: UserRole[]) => {
    if (!requiredRoles) return true
    if (loading) return false
    return hasRequiredRole(role, requiredRoles)
  }

  const visibleItems = navItems.filter((item) => canAccess(item.requiredRoles))

  useEffect(() => {
    const media = window.matchMedia('(min-width: 1200px)')
    const handleChange = (event: MediaQueryListEvent) => {
      setIsDesktop(event.matches)
    }
    setIsDesktop(media.matches)
    media.addEventListener('change', handleChange)
    return () => media.removeEventListener('change', handleChange)
  }, [])

  useEffect(() => {
    if (isDesktop && isMobileMenuOpen) {
      setIsMobileMenuOpen(false)
    }
  }, [isDesktop, isMobileMenuOpen])

  const renderNavLinks = (variant: 'desktop' | 'mobile') => {
    return visibleItems.map((item) => {
      const Icon = item.icon
      const active = isActive(item.to)
      const isMobile = variant === 'mobile'

      return (
        <Link
          key={item.to}
          to={item.to}
          onClick={() => {
            if (isMobile) setIsMobileMenuOpen(false)
          }}
          style={{
            ...navLinkStyle,
            width: isMobile ? '100%' : 'auto',
            justifyContent: isMobile ? 'space-between' : 'flex-start',
            padding: isMobile ? '10px 12px' : navLinkStyle.padding,
            borderRadius: isMobile ? '8px' : undefined,
            backgroundColor: isMobile && active ? '#eff6ff' : 'transparent',
            color: active ? '#2563eb' : '#4b5563',
          }}
        >
          <span
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            <Icon size={18} />
            <span>{item.label}</span>
          </span>
          {!isMobile && (
            <div
              style={{
                ...indicatorStyle,
                backgroundColor: active ? '#2563eb' : 'transparent',
              }}
            />
          )}
        </Link>
      )
    })
  }

  return (
    <nav>
      {isDesktop ? (
        <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
          {navItems
            .filter((item) => canAccess(item.requiredRoles))
            .map((item) => {
              const Icon = item.icon
              const active = isActive(item.to)

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  style={{
                    ...navLinkStyle,
                    color: active ? '#2563eb' : '#4b5563',
                  }}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                  <div
                    style={{
                      ...indicatorStyle,
                      backgroundColor: active ? '#2563eb' : 'transparent',
                    }}
                  />
                </Link>
              )
            })}
        </div>
      ) : (
        <>
          <div
            style={{
              borderBottom: '1px solid #e5e7eb',
              padding: '8px 12px',
              alignItems: 'center',
              justifyContent: 'space-between',
              display: 'flex',
            }}
          >
            <IconButton
              variant="ghost"
              aria-label="메뉴 열기"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={18} />
            </IconButton>
          </div>

          <Dialog.Root
            open={isMobileMenuOpen}
            onOpenChange={setIsMobileMenuOpen}
          >
            <Dialog.Content
              style={{
                width: '85vw',
                maxWidth: '320px',
                height: '100vh',
                margin: 0,
                borderRadius: 0,
                position: 'fixed',
                top: 0,
                right: 0,
              }}
            >
              <Dialog.Title>메뉴</Dialog.Title>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  marginTop: 16,
                }}
              >
                {renderNavLinks('mobile')}
              </div>
            </Dialog.Content>
          </Dialog.Root>
        </>
      )}
    </nav>
  )
}
