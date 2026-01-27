import { Outlet } from 'react-router'
import Header from './Header'

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col rt-r-gap-4 rt-r-m-6 ">
      <Header />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
