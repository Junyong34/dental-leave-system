import { LogOut } from 'lucide-react'
import { useNavigate } from 'react-router'
import { useAuthStore } from '../../store/authStore'

export default function UserProfile() {
  const navigate = useNavigate()
  const { username, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '8px 16px',
          backgroundColor: '#f9fafb',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
        }}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'linear-gradient(to bottom right, #3b82f6, #4f46e5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <span style={{ color: 'white', fontWeight: '600', fontSize: '14px' }}>
            {username?.charAt(0).toUpperCase()}
          </span>
        </div>
        <span
          style={{
            color: '#111827',
            fontWeight: '600',
            fontSize: '14px',
            whiteSpace: 'nowrap',
          }}
        >
          {username}
        </span>
      </div>
      <div
        onClick={handleLogout}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleLogout()
          }
        }}
        role="button"
        tabIndex={0}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500',
          color: '#dc2626',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#fee2e2'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#fef2f2'
        }}
      >
        <LogOut size={16} />
        <span>로그아웃</span>
      </div>
    </div>
  )
}
