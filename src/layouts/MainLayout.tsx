import { Layout, Menu, Dropdown, Avatar, Space, Switch, Typography, Button } from 'antd'
import {
  LogoutOutlined,
  MoonOutlined,
  SunOutlined,
  UserOutlined,
  DownOutlined,
  SwapOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useMemo, useState, useEffect } from 'react'
import useAuthStore from '../stores/auth'
import useUIStore from '../stores/ui'
import { menus } from '../mock/menu'
import './mainLayout.css'

const { Header, Sider, Content } = Layout
const { Text } = Typography

const MainLayout = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { current, logout } = useAuthStore()
  const { theme, collapsed, setTheme, toggleCollapse } = useUIStore()
  const [stationInfo, setStationInfo] = useState<{
    stationName: string
    projectName: string
  } | null>(null)

  // 读取当前选择的站点信息
  useEffect(() => {
    const info = localStorage.getItem('selectedStation')
    if (info) {
      try {
        const parsed = JSON.parse(info)
        setStationInfo({
          stationName: parsed.stationName,
          projectName: parsed.projectName,
        })
      } catch (e) {
        console.error('Failed to parse station info', e)
      }
    }
  }, [])

  const filterMenu = (list = menus): typeof menus =>
    list
      .filter((m) => {
        if (!current) return false
        if (m.roles?.includes('*')) return true
        if (!m.roles) return true
        return m.roles.includes(current.role)
      })
      .map((m) => ({
        ...m,
        children: m.children ? filterMenu(m.children) : undefined,
      }))

  const items = useMemo(() => filterMenu(), [current])

  const onMenuClick = ({ key }: { key: string }) => {
    const target = findPath(items, key)
    if (target) navigate(target)
  }

  return (
    <Layout className="app-shell">
      <Sider collapsible collapsed={collapsed} onCollapse={toggleCollapse} width={228} theme="light">
        <div className="logo-area" onClick={() => navigate('/dashboard')}>
          <div className="logo-dot" />
          <div className="logo-text">
            <div className="title">能源监控平台</div>
            {!collapsed && <div className="subtitle">High-speed Rail Energy</div>}
          </div>
        </div>
        <Menu
          mode="inline"
          selectedKeys={findSelectedKeys(items, location.pathname)}
          onClick={onMenuClick}
          items={mapToAntd(items)}
        />
      </Sider>
      <Layout>
        <Header className="header-bar">
          <Space align="center" size={16}>
            <Space>
              <SunOutlined />
              <Switch
                checkedChildren={<MoonOutlined />}
                unCheckedChildren={<SunOutlined />}
                checked={theme === 'dark'}
                onChange={(checked) => setTheme(checked ? 'dark' : 'light')}
              />
            </Space>
            {stationInfo && (
              <Space 
                style={{ 
                  marginLeft: '24px',
                  padding: '6px 16px',
                  background: '#f5f7fa',
                  borderRadius: '8px',
                }}
              >
                <EnvironmentOutlined style={{ color: '#1890ff' }} />
                <Text style={{ fontSize: 14 }}>
                  <Text type="secondary">{stationInfo.projectName}</Text>
                  <Text style={{ margin: '0 8px', color: '#d9d9d9' }}>|</Text>
                  <Text strong>{stationInfo.stationName}</Text>
                </Text>
              </Space>
            )}
          </Space>
          <Space align="center" size={16}>
            <Button
              type="default"
              icon={<SwapOutlined />}
              onClick={() => navigate('/station-select')}
              style={{
                borderRadius: '8px',
                height: '36px',
                padding: '0 16px',
              }}
            >
              切换项目
            </Button>
            <Dropdown
              menu={{
                items: [
                  { key: 'profile', label: '个人信息', icon: <UserOutlined /> },
                  { key: 'logout', label: '退出登录', icon: <LogoutOutlined />, danger: true },
                ],
                onClick: ({ key }) => {
                  if (key === 'logout') {
                    logout()
                    navigate('/login')
                  }
                },
              }}
            >
              <Space className="user-box">
                <Avatar size={32} icon={<UserOutlined />} />
                <div className="user-meta">
                  <Text strong>{current?.nickname}</Text>
                  <Text type="secondary">{current?.role}</Text>
                </div>
                <DownOutlined />
              </Space>
            </Dropdown>
          </Space>
        </Header>
        <Content className="layout-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

const mapToAntd = (data: any[] = []): any[] =>
  data.map((m) => ({
    key: m.key,
    icon: m.icon,
    label: m.label,
    children: m.children ? mapToAntd(m.children) : undefined,
  }))

const findPath = (data: any[], key: string): string | undefined => {
  for (const item of data) {
    if (item.key === key) return item.path
    if (item.children) {
      const hit = findPath(item.children, key)
      if (hit) return hit
    }
  }
  return undefined
}

const findSelectedKeys = (data: any[], path: string): string[] => {
  for (const item of data) {
    if (item.path === path) return [item.key]
    if (item.children) {
      const child = findSelectedKeys(item.children, path)
      if (child.length) return [item.key, ...child]
    }
  }
  return []
}

export default MainLayout

