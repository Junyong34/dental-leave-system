import { createBrowserRouter } from 'react-router'
import AuthProvider from '../components/auth/AuthProvider'
import ProtectedRoute from '../components/auth/ProtectedRoute'
import RoleRoute from '../components/auth/RoleRoute'
import Layout from '../components/layout/Layout'
import Dashboard, { loader as dashboardLoader } from '../pages/Dashboard'
import LeaveApproval from '../pages/LeaveApproval'
import LeaveHistory from '../pages/LeaveHistory'
import LeaveRequest from '../pages/LeaveRequest'
import Login from '../pages/Login'
import Settings from '../pages/Settings'
import GeneralSettings from '../pages/Settings/GeneralSettings'
import UserHistory from '../pages/Settings/UserHistory'
import UserLeaveManagement from '../pages/Settings/UserLeaveManagement'
import UserRegistration from '../pages/UserRegistration'

export const router = createBrowserRouter([
  {
    element: <AuthProvider />,
    children: [
      {
        path: '/login',
        element: <Login />,
      },
      {
        path: '/register',
        element: (
          <ProtectedRoute>
            <UserRegistration />
          </ProtectedRoute>
        ),
      },
      {
        path: '/',
        element: (
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <Dashboard />,
            loader: dashboardLoader,
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
            path: 'settings',
            element: (
              <RoleRoute requiredRoles={['ADMIN']}>
                <Settings />
              </RoleRoute>
            ),
            children: [
              {
                index: true,
                element: <GeneralSettings />,
              },
              {
                path: 'leave-management',
                element: <UserLeaveManagement />,
              },
              {
                path: 'history',
                element: <UserHistory />,
              },
            ],
          },
        ],
      },
    ],
  },
])
