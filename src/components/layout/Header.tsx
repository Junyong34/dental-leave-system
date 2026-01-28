import Navigation from './Navigation'
import UserProfile from './UserProfile'

export default function Header() {
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-blue-600">
              🏥 연차 관리 시스템
            </h1>
          </div>
          <div className="flex justify-end h-16">
            <div className="flex items-center gap-4">
              <UserProfile />
            </div>
          </div>
          <Navigation />
        </div>
      </div>
    </nav>
  )
}
