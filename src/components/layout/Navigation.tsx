import {
  Calendar,
  CheckCircle,
  FileText,
  History,
  LayoutDashboard,
  Settings,
} from 'lucide-react'
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
  { to: '/history', label: '연차 내역', icon: History },
  { to: '/settings', label: '설정', icon: Settings, requiredRoles: ['ADMIN'] },
]

export default function Navigation() {
  const location = useLocation()
  const { user, loading } = useUserProfile()
  const role = user?.role ?? null

  const isActive = (path: string) => {
    return location.pathname === path
  }

  const canAccess = (requiredRoles?: UserRole[]) => {
    if (!requiredRoles) return true
    if (loading) return false
    return hasRequiredRole(role, requiredRoles)
  }

  return (
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
  )
}
