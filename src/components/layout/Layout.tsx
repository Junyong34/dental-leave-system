import {
  CheckCircle,
  FileText,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router'
import { useAuthStore } from '../../store/authStore'

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { username, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path: string) => {
    return location.pathname === path
  }

  const getLinkClassName = (path: string) => {
    const baseClass =
      'inline-flex items-center gap-2 px-1 pt-1 border-b-2 text-sm font-medium transition-colors'
    return isActive(path)
      ? `${baseClass} border-blue-500 text-gray-900`
      : `${baseClass} border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700`
  }

  const getMobileLinkClassName = (path: string) => {
    const baseClass =
      'flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium transition-colors'
    return isActive(path)
      ? `${baseClass} bg-blue-50 text-blue-600`
      : `${baseClass} text-gray-700 hover:bg-gray-50 hover:text-gray-900`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-blue-600">
                  🏥 연차 관리 시스템
                </h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link to="/" className={getLinkClassName('/')}>
                  <LayoutDashboard size={18} />
                  대시보드
                </Link>
                <Link to="/request" className={getLinkClassName('/request')}>
                  <FileText size={18} />
                  연차 신청
                </Link>
                <Link to="/approval" className={getLinkClassName('/approval')}>
                  <CheckCircle size={18} />
                  연차 승인
                </Link>
                <Link to="/history" className={getLinkClassName('/history')}>
                  <History size={18} />
                  연차 내역
                </Link>
                <Link to="/settings" className={getLinkClassName('/settings')}>
                  <Settings size={18} />
                  설정
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 text-sm text-gray-700">
                <span>{username}</span>
                <button
                  onClick={handleLogout}
                  type="button"
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <LogOut size={16} />
                  로그아웃
                </button>
              </div>
              <div className="flex items-center sm:hidden">
                <button
                  type="button"
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  <span className="sr-only">메뉴 열기</span>
                  {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 모바일 메뉴 */}
        {isMobileMenuOpen && (
          <div className="sm:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/"
                className={getMobileLinkClassName('/')}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <LayoutDashboard size={20} />
                대시보드
              </Link>
              <Link
                to="/request"
                className={getMobileLinkClassName('/request')}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FileText size={20} />
                연차 신청
              </Link>
              <Link
                to="/approval"
                className={getMobileLinkClassName('/approval')}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <CheckCircle size={20} />
                연차 승인
              </Link>
              <Link
                to="/history"
                className={getMobileLinkClassName('/history')}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <History size={20} />
                연차 내역
              </Link>
              <Link
                to="/settings"
                className={getMobileLinkClassName('/settings')}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Settings size={20} />
                설정
              </Link>
              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="px-3 py-2 text-sm text-gray-700">
                  <span className="font-medium">{username}</span>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  <LogOut size={20} />
                  로그아웃
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
