import { ReactNode } from 'react'
import {
  AppstoreOutlined,
  BarChartOutlined,
  DashboardOutlined,
  ExperimentOutlined,
  LockOutlined,
  SettingOutlined,
  DeploymentUnitOutlined,
  DatabaseOutlined,
  WarningOutlined,
  TeamOutlined,
  ScheduleOutlined,
} from '@ant-design/icons'

export type MenuItem = {
  key: string
  label: string
  path: string
  icon?: ReactNode
  children?: MenuItem[]
  roles?: string[]
}

export const menus: MenuItem[] = [
  { key: 'dashboard', label: '首页', path: '/dashboard', icon: <DashboardOutlined />, roles: ['*'] },
  {
    key: 'analysis',
    label: '能耗分析',
    path: '/analysis',
    icon: <BarChartOutlined />,
    children: [
      { key: 'analysis-single', label: '单站能耗分析', path: '/analysis/single', roles: ['admin', 'super_admin', 'operator', 'viewer'] },
      { key: 'analysis-ratio', label: '能耗占比分析', path: '/analysis/ratio', roles: ['admin', 'super_admin', 'operator', 'viewer'] },
    ],
  },
  { key: 'alerts', label: '能耗预警', path: '/alerts', icon: <WarningOutlined />, roles: ['admin', 'super_admin', 'operator', 'viewer', 'auditor'] },
  { key: 'compare', label: '多站能耗对比', path: '/compare', icon: <AppstoreOutlined />, roles: ['admin', 'super_admin', 'operator', 'viewer'] },
  { key: 'strategy', label: '节能策略模拟', path: '/strategy', icon: <ExperimentOutlined />, roles: ['admin', 'super_admin'] },
  { key: 'devices', label: '设备管理', path: '/devices', icon: <DatabaseOutlined />, roles: ['admin', 'super_admin', 'operator'] },
  {
    key: 'system',
    label: '系统管理',
    path: '/system',
    icon: <SettingOutlined />,
    children: [
      { key: 'system-overview', label: '系统概览', path: '/system/overview', roles: ['admin', 'super_admin'] },
      { key: 'system-users', label: '用户管理', path: '/system/users', roles: ['admin', 'super_admin'] },
      { key: 'system-roles', label: '角色管理', path: '/system/roles', roles: ['admin', 'super_admin'] },
      { key: 'system-matrix', label: '权限矩阵', path: '/system/matrix', roles: ['admin', 'super_admin', 'auditor'] },
      { key: 'system-menus', label: '菜单管理', path: '/system/menus', roles: ['admin', 'super_admin'] },
      { key: 'system-settings', label: '系统设置', path: '/system/settings', roles: ['admin', 'super_admin'] },
      { key: 'system-logs', label: '操作日志', path: '/system/logs', roles: ['admin', 'super_admin', 'auditor'] },
    ],
  },
]

export const defaultRolePermissions: Record<string, string[]> = {
  super_admin: menus.flatMap((m) => (m.children ? m.children.map((c) => c.key) : m.key)),
  admin: [
    'dashboard',
    'analysis-single',
    'analysis-ratio',
    'alerts',
    'compare',
    'strategy',
    'devices',
    'system-overview',
    'system-users',
    'system-roles',
    'system-matrix',
    'system-menus',
    'system-settings',
    'system-logs',
  ],
  operator: ['dashboard', 'analysis-single', 'analysis-ratio', 'alerts', 'compare', 'devices'],
  viewer: ['dashboard', 'analysis-single', 'analysis-ratio', 'alerts', 'compare'],
  auditor: ['dashboard', 'alerts', 'system-matrix', 'system-logs'],
}

export const quickActions = [
  { key: 'refresh', label: '刷新', icon: <ScheduleOutlined /> },
  { key: 'settings', label: '系统设置', icon: <SettingOutlined /> },
  { key: 'logs', label: '操作日志', icon: <LockOutlined /> },
  { key: 'users', label: '用户管理', icon: <TeamOutlined /> },
  { key: 'strategy', label: '节能策略', icon: <DeploymentUnitOutlined /> },
]

