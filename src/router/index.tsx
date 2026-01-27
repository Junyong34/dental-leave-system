import { createBrowserRouter } from 'react-router'
import ProtectedRoute from '../components/auth/ProtectedRoute'
import Layout from '../components/layout/Layout'
import Dashboard, { loader as dashboardLoader } from '../pages/Dashboard'
import LeaveApproval from '../pages/LeaveApproval'
import LeaveHistory from '../pages/LeaveHistory'
import LeaveRequest from '../pages/LeaveRequest'
import Login from '../pages/Login'
import Settings from '../pages/Settings'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
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
        element: <LeaveApproval />,
      },
      {
        path: 'history',
        element: <LeaveHistory />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
    ],
  },
])
