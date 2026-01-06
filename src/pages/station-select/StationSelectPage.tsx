import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Select, Avatar, Typography, Space, message } from 'antd'
import { LogoutOutlined, HomeOutlined, CheckCircleOutlined, WarningOutlined } from '@ant-design/icons'
import { railwayProjects, RailwayProject, Station, getProjectStatistics } from '../../mock/railway-data'
import StationMap from './components/StationMap'
import useAuthStore from '../../stores/auth'
import './station-select.css'
import 'leaflet/dist/leaflet.css'

const { Title, Text } = Typography

const StationSelectPage = () => {
  const navigate = useNavigate()
  const { logout, user } = useAuthStore()
  const [selectedProject, setSelectedProject] = useState<RailwayProject>(railwayProjects[0])
  const [selectedStation, setSelectedStation] = useState<Station | null>(null)
  const [showPopup, setShowPopup] = useState(false)

  // 计算项目统计数据
  const statistics = getProjectStatistics(selectedProject)

  // 处理项目切换
  const handleProjectChange = (projectId: string) => {
    const project = railwayProjects.find(p => p.id === projectId)
    if (project) {
      setSelectedProject(project)
      setSelectedStation(null)
      setShowPopup(false)
    }
  }

  // 处理站点选择
  const handleStationClick = (station: Station) => {
    setSelectedStation(station)
    setShowPopup(true)
  }

  // 进入监控系统
  const handleEnterSystem = (station: Station) => {
    // 保存选中的站点信息到 localStorage
    localStorage.setItem('selectedStation', JSON.stringify({
      stationId: station.id,
      stationName: station.name,
      projectId: selectedProject.id,
      projectName: selectedProject.name
    }))
    message.success(`正在进入 ${station.name} 监控系统...`)
    navigate('/dashboard')
  }

  // 退出登录
  const handleLogout = () => {
    logout()
    message.success('已退出登录')
    navigate('/login')
  }

  return (
    <div className="station-select-page">
      {/* 顶部区域 */}
      <header className="station-select-header">
        <div className="header-left">
          <div className="logo-container">
            <div className="logo-icon">
              <HomeOutlined />
            </div>
          </div>
          <div className="title-container">
            <Title level={4} style={{ margin: 0, color: '#0F172B' }}>站点选择</Title>
            <Text style={{ fontSize: 12, color: '#62748E' }}>Station Selection</Text>
          </div>
        </div>
        <div className="header-right">
          <div className="user-info">
            <Avatar size={32} style={{ background: 'linear-gradient(135deg, #90A1B9 0%, #45556C 100%)' }}>
              {user?.username?.charAt(0).toUpperCase() || 'A'}
            </Avatar>
            <div className="user-details">
              <Text strong style={{ fontSize: 14, color: '#0F172B' }}>{user?.realName || '管理员'}</Text>
              <Text style={{ fontSize: 12, color: '#62748E' }}>{user?.email || 'admin@system.com'}</Text>
            </div>
            <div className="online-status" />
          </div>
          <Button
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            style={{ borderRadius: 16 }}
          >
            退出
          </Button>
        </div>
      </header>

      {/* 主内容区域 */}
      <div className="station-select-main">
        {/* 左侧控制面板 */}
        <div className="left-panel">
          {/* 项目选择器 */}
          <div className="panel-card">
            <div className="card-header">
              <Title level={5} style={{ margin: 0 }}>选择项目</Title>
              <Text style={{ fontSize: 14, color: '#62748E' }}>切换不同的高铁线路项目</Text>
            </div>
            <Select
              value={selectedProject.id}
              onChange={handleProjectChange}
              style={{ width: '100%' }}
              size="large"
              options={railwayProjects.map(p => ({
                value: p.id,
                label: `${p.name} (${p.stations.length}个站点)`
              }))}
              className="project-selector"
            />
          </div>

          {/* 项目概况 */}
          <div className="panel-card">
            <Title level={5} style={{ margin: 0, marginBottom: 16 }}>项目概况</Title>
            <div className="statistics-grid">
              <div className="stat-card stat-total">
                <div className="stat-header">
                  <HomeOutlined style={{ fontSize: 20 }} />
                  <Text style={{ fontSize: 14, color: '#314158' }}>站点总数</Text>
                </div>
                <Text strong style={{ fontSize: 18, color: '#155DFC' }}>{statistics.total}</Text>
              </div>
              <div className="stat-card stat-normal">
                <div className="stat-header">
                  <CheckCircleOutlined style={{ fontSize: 20 }} />
                  <Text style={{ fontSize: 14, color: '#314158' }}>正常运行</Text>
                </div>
                <Text strong style={{ fontSize: 18, color: '#009966' }}>{statistics.normal}</Text>
              </div>
              <div className="stat-card stat-warning">
                <div className="stat-header">
                  <WarningOutlined style={{ fontSize: 20 }} />
                  <Text style={{ fontSize: 14, color: '#314158' }}>告警站点</Text>
                </div>
                <Text strong style={{ fontSize: 18, color: '#E17100' }}>{statistics.warning}</Text>
              </div>
            </div>
          </div>

          {/* 站点列表 */}
          <div className="panel-card station-list-card">
            <Title level={5} style={{ margin: 0, marginBottom: 16 }}>站点列表</Title>
            <div className="station-list">
              {selectedProject.stations.map(station => (
                <div
                  key={station.id}
                  className="station-item"
                  onClick={() => handleEnterSystem(station)}
                >
                  <div className="station-info">
                    <div className={`status-dot status-${station.status}`} />
                    <Text strong style={{ fontSize: 14 }}>{station.name}</Text>
                  </div>
                  <Text style={{ fontSize: 12, color: '#62748E' }}>
                    {station.energy.toLocaleString()} kWh
                  </Text>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 右侧地图区域 */}
        <div className="right-panel">
          <div className="map-card">
            <div className="card-header">
              <Title level={5} style={{ margin: 0 }}>{selectedProject.name} - 站点分布图</Title>
              <Text style={{ fontSize: 14, color: '#62748E' }}>点击站点进入能耗监控系统</Text>
            </div>
            <StationMap
              project={selectedProject}
              selectedStation={selectedStation}
              showPopup={showPopup}
              onStationClick={handleStationClick}
              onPopupClose={() => setShowPopup(false)}
              onEnterSystem={handleEnterSystem}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default StationSelectPage

