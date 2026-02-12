import { createBrowserRouter, type RouteObject } from 'react-router'
import AuthProvider from '@/components/auth/AuthProvider'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import RoleRoute from '@/components/auth/RoleRoute'
import Layout from '@/components/layout/Layout'
import Dashboard, { loader as dashboardLoader } from '@/pages/Dashboard'
import LeaveApproval from '@/pages/LeaveApproval'
import LeaveCalendar from '@/pages/LeaveCalendar'
import LeaveCalendarView from '@/pages/LeaveCalendarView'
import LeaveHistory from '@/pages/LeaveHistory'
import LeaveRequest from '@/pages/LeaveRequest'
import Login from '@/pages/Login'
import NightShiftStatsPage from '@/pages/NightShiftStats'
import ResetPassword from '@/pages/ResetPassword'
import Settings from '@/pages/Settings'
import GeneralSettings from '@/pages/Settings/GeneralSettings'
import NightShiftManagement from '@/pages/Settings/NightShift'
import SignupRequests from '@/pages/Settings/SignupRequests'
import UserHistory from '@/pages/Settings/UserHistory'
import UserLeaveManagement from '@/pages/Settings/UserLeaveManagement'
import UserRegistration from '@/pages/UserRegistration'

// Public routes
const publicRoutes: RouteObject[] = [
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/reset-password',
    element: <ResetPassword />,
  },
  {
    path: '/register',
    element: (
      <ProtectedRoute>
        <UserRegistration />
      </ProtectedRoute>
    ),
  },
]

// Settings sub-routes (ADMIN only)
const settingsRoutes: RouteObject[] = [
  {
    index: true,
    element: <GeneralSettings />,
  },
  {
    path: 'leave-management',
    element: <UserLeaveManagement />,
  },
  {
    path: 'signup-requests',
    element: <SignupRequests />,
  },
  {
    path: 'history',
    element: <UserHistory />,
  },
  {
    path: 'night-shift',
    element: <NightShiftManagement />,
  },
]

// Protected main app routes
const protectedRoutes: RouteObject[] = [
  {
    index: true,
    element: <Dashboard />,
    loader: dashboardLoader,
  },
  {
    path: 'calendar',
    element: <LeaveCalendar />,
  },
  {
    path: 'leave-calendar-view',
    element: <LeaveCalendarView />,
  },
  {
    path: 'request',
    element: <LeaveRequest />,
  },
  {
    path: 'approval',
    element: (
      <RoleRoute requiredRoles={['ADMIN']}>
        <LeaveApproval />
      </RoleRoute>
    ),
  },
  {
    path: 'history',
    element: <LeaveHistory />,
  },
  {
    path: 'night-shift-stats',
    element: <NightShiftStatsPage />,
  },
  {
    path: 'settings',
    element: (
      <RoleRoute requiredRoles={['ADMIN']}>
        <Settings />
      </RoleRoute>
    ),
    children: settingsRoutes,
  },
]

export const router = createBrowserRouter([
  {
    element: <AuthProvider />,
    children: [
      ...publicRoutes,
      {
        path: '/',
        element: (
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        ),
        children: protectedRoutes,
      },
    ],
  },
])
