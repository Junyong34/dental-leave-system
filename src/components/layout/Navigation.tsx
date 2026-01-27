import {
  CheckCircle,
  FileText,
  History,
  LayoutDashboard,
  Settings,
} from 'lucide-react'
import { Link, useLocation } from 'react-router'

const navLinkStyle = {
  position: 'relative' as const,
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '12px 16px',
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

export default function Navigation() {
  const location = useLocation()

  const isActive = (path: string) => {
    return location.pathname === path
  }

  return (
    <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
      <Link
        to="/"
        style={{
          ...navLinkStyle,
          color: isActive('/') ? '#2563eb' : '#4b5563',
        }}
      >
        <LayoutDashboard size={18} />
        <span>대시보드</span>
        <div
          style={{
            ...indicatorStyle,
            backgroundColor: isActive('/') ? '#2563eb' : 'transparent',
          }}
        />
      </Link>
      <Link
        to="/request"
        style={{
          ...navLinkStyle,
          color: isActive('/request') ? '#2563eb' : '#4b5563',
        }}
      >
        <FileText size={18} />
        <span>연차 신청</span>
        <div
          style={{
            ...indicatorStyle,
            backgroundColor: isActive('/request') ? '#2563eb' : 'transparent',
          }}
        />
      </Link>
      <Link
        to="/approval"
        style={{
          ...navLinkStyle,
          color: isActive('/approval') ? '#2563eb' : '#4b5563',
        }}
      >
        <CheckCircle size={18} />
        <span>연차 승인</span>
        <div
          style={{
            ...indicatorStyle,
            backgroundColor: isActive('/approval') ? '#2563eb' : 'transparent',
          }}
        />
      </Link>
      <Link
        to="/history"
        style={{
          ...navLinkStyle,
          color: isActive('/history') ? '#2563eb' : '#4b5563',
        }}
      >
        <History size={18} />
        <span>연차 내역</span>
        <div
          style={{
            ...indicatorStyle,
            backgroundColor: isActive('/history') ? '#2563eb' : 'transparent',
          }}
        />
      </Link>
      <Link
        to="/settings"
        style={{
          ...navLinkStyle,
          color: isActive('/settings') ? '#2563eb' : '#4b5563',
        }}
      >
        <Settings size={18} />
        <span>설정</span>
        <div
          style={{
            ...indicatorStyle,
            backgroundColor: isActive('/settings') ? '#2563eb' : 'transparent',
          }}
        />
      </Link>
    </div>
  )
}
