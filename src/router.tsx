import { createBrowserRouter, Navigate } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import LoginPage from './pages/auth/Login'
import StationSelectPage from './pages/station-select/StationSelectPage'
import HomePage from './pages/dashboard/HomePage'
import SingleStationPage from './pages/analysis/SingleStationNew'
import EnergyRatioPage from './pages/analysis/EnergyRatioNew'
import AlertCenterPage from './pages/alerts/AlertCenter'
import MultiStationPage from './pages/compare/MultiStation'
import StrategyPage from './pages/strategy/StrategyNew'
import DevicePage from './pages/device/Device'
import SystemOverviewPage from './pages/system/Overview'
import UserPage from './pages/system/User'
import RolePage from './pages/system/Role'
import PermissionMatrixPage from './pages/system/PermissionMatrix'
import MenuPage from './pages/system/Menu'
import SettingPage from './pages/system/Setting'
import LogPage from './pages/system/Log'
import ProtectedRoute from './routes/ProtectedRoute'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/station-select',
    element: (
      <ProtectedRoute>
        <StationSelectPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <HomePage />, handle: { roles: ['*'] } },
      { path: 'analysis/single', element: <SingleStationPage />, handle: { roles: ['admin', 'super_admin', 'operator', 'viewer'] } },
      { path: 'analysis/ratio', element: <EnergyRatioPage />, handle: { roles: ['admin', 'super_admin', 'operator', 'viewer'] } },
      { path: 'alerts', element: <AlertCenterPage />, handle: { roles: ['admin', 'super_admin', 'operator', 'viewer', 'auditor'] } },
      { path: 'compare', element: <MultiStationPage />, handle: { roles: ['admin', 'super_admin', 'operator', 'viewer'] } },
      { path: 'strategy', element: <StrategyPage />, handle: { roles: ['admin', 'super_admin'] } },
      { path: 'devices', element: <DevicePage />, handle: { roles: ['admin', 'super_admin', 'operator'] } },
      {
        path: 'system',
        children: [
          { index: true, element: <Navigate to="/system/overview" replace /> },
          { path: 'overview', element: <SystemOverviewPage />, handle: { roles: ['admin', 'super_admin'] } },
          { path: 'users', element: <UserPage />, handle: { roles: ['admin', 'super_admin'] } },
          { path: 'roles', element: <RolePage />, handle: { roles: ['admin', 'super_admin'] } },
          { path: 'matrix', element: <PermissionMatrixPage />, handle: { roles: ['admin', 'super_admin', 'auditor'] } },
          { path: 'menus', element: <MenuPage />, handle: { roles: ['admin', 'super_admin'] } },
          { path: 'settings', element: <SettingPage />, handle: { roles: ['admin', 'super_admin'] } },
          { path: 'logs', element: <LogPage />, handle: { roles: ['admin', 'super_admin', 'auditor'] } },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
], {
  basename: '/demo',
})

export default router

