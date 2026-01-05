/**
 * 节能策略模拟 - 按照Figma设计稿完全重构
 * 设计稿：https://www.figma.com/design/k5TBKzoZJ0DPn5LobyEc20/高铁站能耗演示
 * 包含6个Tab：策略推荐、模板管理、策略组合、实时模拟、历史记录、快速模拟
 */

import React, { useState } from 'react'
import {
  Card,
  Row,
  Col,
  Tabs,
  Button,
  Space,
  Tag,
  Progress,
  Table,
  message,
  Radio,
  Input,
  Select,
} from 'antd'
import {
  BulbOutlined,
  FileTextOutlined,
  AppstoreOutlined,
  PlayCircleOutlined,
  HistoryOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  FileProtectOutlined,
  ClockCircleOutlined,
  LineChartOutlined,
  PlusOutlined,
  DownloadOutlined,
  CloseOutlined,
} from '@ant-design/icons'
import PageHeader from '../../components/PageHeader'
import { sleep } from '../../utils/mock'
import './strategy-new.css'

const { TabPane } = Tabs

// 初始模拟记录数据（移到组件外部避免初始化顺序问题）
const initialSimulationRecords = [
  {
    key: 1,
    time: '2024-12-31 02:38:47',
    power: 138.2,
    calc: 6.04,
    improvement: '+10.1%',
    cost: '¥57,485,184',
    efficiency: '86.9%',
  },
  {
    key: 2,
    time: '2024-12-31 04:49:47',
    power: 176.3,
    calc: 6.78,
    improvement: '+10.7%',
    cost: '¥57,480,184',
    efficiency: '86.5%',
  },
  {
    key: 3,
    time: '2024-12-31 06:38:47',
    power: 143.1,
    calc: 6.51,
    improvement: '+10.5%',
    cost: '¥57,479,217',
    efficiency: '86.5%',
  },
  {
    key: 4,
    time: '2024-12-31 08:38:47',
    power: 138.8,
    calc: 6.04,
    improvement: '+10.8%',
    cost: '¥56,627,181',
    efficiency: '83.9%',
  },
  {
    key: 5,
    time: '2024-12-31 10:38:47',
    power: 149.3,
    calc: 8.51,
    improvement: '+10.2%',
    cost: '¥56,617,516',
    efficiency: '84.3%',
  },
]

const StrategyNew = () => {
  const [activeTab, setActiveTab] = useState('recommendation')
  const [selectedStrategies, setSelectedStrategies] = useState<string[]>([])
  const [simulating, setSimulating] = useState(false)
  const [simulationProgress, setSimulationProgress] = useState(0)
  const [simulationTime, setSimulationTime] = useState('00:00:00')
  const [realTimeMetrics, setRealTimeMetrics] = useState({
    runTime: 145.1,
    avgSimTime: 6.79,
    successRate: 10.7,
    estimatedRevenue: '58,211,093',
    temperature: 87.5,
    abnormalEvents: 0,
  })
  const [comparisonData, setComparisonData] = useState([
    { label: '照明系统', current: 23.8, baseline: 1, improvement: 15, change: '+3.5%' },
    { label: '空调系统', current: 76.6, baseline: 1.01, improvement: 53, change: '+6.8%' },
    { label: '电梯系统', current: 17.4, baseline: 0.61, improvement: 12, change: '+0.8%' },
    { label: '供电系统', current: 36.9, baseline: 0.64, improvement: 8, change: '-1.3%' },
    { label: '储能系统', current: 16.3, baseline: 0.66, improvement: 10, change: '+1.6%' },
  ])
  const [dynamicSimulationRecords, setDynamicSimulationRecords] = useState(initialSimulationRecords)
  
  // 快速模拟相关状态
  const [quickSimulating, setQuickSimulating] = useState(false)
  const [timePeriod, setTimePeriod] = useState('natural')
  const [areaSelection, setAreaSelection] = useState('area1')
  const [quickStats, setQuickStats] = useState({
    energyImprovement: 5.2,
    mechanicalRate: 8.5,
    totalImprovement: 15.3,
    carbonCost: 580,
  })
  const [quickResults, setQuickResults] = useState({
    savingsRate: 8.5,
    costSaving: 12480,
    energySaving: 156,
  })

  // 策略推荐数据
  const recommendedStrategies = [
    {
      id: 1,
      icon: '☀️',
      color: '#faad14',
      title: 'LED照明调控方案',
      desc: '支持根据实时采集数据智能控制各区域亮度及开关状态',
      status: '已启用',
      statusColor: 'green',
      saving: '节能率80%',
    },
    {
      id: 2,
      icon: '❄️',
      color: '#1890ff',
      title: '空调管控智能策略',
      desc: '监控室内温湿度实现设定范围内的智能化控制与管理',
      status: '已启用',
      statusColor: 'green',
      saving: '预计节能12%',
    },
    {
      id: 3,
      icon: '🏢',
      color: '#52c41a',
      title: '电梯系统控制',
      desc: '基于人流量监控的时段错峰控制与按需调度电梯运行策略',
      status: '未启用',
      statusColor: 'default',
      saving: '预计节能5%',
    },
    {
      id: 4,
      icon: '☀️',
      color: '#ff4d4f',
      title: '光伏发电系统',
      desc: '作为高效能源实现发电满足用电的协同配合控制',
      status: '已启用',
      statusColor: 'green',
      saving: '预计节能22%',
    },
  ]

  // 模板管理数据
  const templates = [
    {
      id: 1,
      title: '工业园区节能模板',
      desc: '适用于工业园区的综合节能方案',
      strategies: 12,
      usage: 35,
      date: '2024-01-15',
    },
    {
      id: 2,
      title: '办公大楼节能模板',
      desc: '针对办公楼提优化的节能策略',
      strategies: 8,
      usage: 52,
      date: '2024-02-20',
    },
    {
      id: 3,
      title: '商业综合体模板',
      desc: '商场、酒店等商业场所的节能方案',
      strategies: 15,
      usage: 28,
      date: '2024-03-10',
    },
    {
      id: 4,
      title: '医疗机构节能模板',
      desc: '医院、诊所等医疗场所的专用模板',
      strategies: 10,
      usage: 18,
      date: '2024-04-05',
    },
  ]

  // 策略组合 - 推荐模块数据
  const combinationRecommendations = [
    {
      id: 'green',
      icon: '🌿',
      color: '#52c41a',
      bgColor: '#f0fff4',
      title: '绿色能源优化',
      desc: '光伏清洁能源设备最高优化控制策略',
      saving: '节能 3.5%',
      cost: '成本 5279',
      status: '添加',
    },
    {
      id: 'light',
      icon: '☀️',
      color: '#faad14',
      bgColor: '#fffbe6',
      title: '光伏发电系统',
      desc: '整合分布式光伏发电的协同管理',
      saving: '节能 12%',
      cost: '成本 6327',
      status: '添加',
    },
    {
      id: 'storage',
      icon: '⚡',
      color: '#1890ff',
      bgColor: '#e6f7ff',
      title: '储能系统',
      desc: '动态配置储能设备的充放电策略',
      saving: '节能 7%',
      cost: '成本 5209',
      status: '添加',
    },
    {
      id: 'ai',
      icon: '⚙️',
      color: '#722ed1',
      bgColor: '#f9f0ff',
      title: '智能控制系统',
      desc: '闭置深度学习的中枢管理优化模型',
      saving: '节能 5.3%',
      cost: '成本 1387',
      status: '添加',
    },
  ]

  // 已选策略列表
  const currentCombination = [
    { id: 'ground', title: '地面照明优化', saving: '节能率: 3.5%' },
    { id: 'ac', title: '空调能效化', saving: '节能率: 7.8%' },
  ]

  // 历史记录数据
  const historyRecords = [
    {
      key: 1,
      id: 1,
      name: 'LED照明调控方案',
      type: '启用策略',
      operator: 'admin',
      time: '2024-12-31 10:30:25',
      result: '成功',
      saving: '8%',
    },
    {
      key: 2,
      id: 2,
      name: '空调管控智能策略',
      type: '修改参数',
      operator: 'user1',
      time: '2024-12-31 09:15:42',
      result: '成功',
      saving: '12%',
    },
    {
      key: 3,
      id: 3,
      name: '光伏发电系统',
      type: '模拟运行',
      operator: 'admin',
      time: '2024-12-30 16:45:18',
      result: '成功',
      saving: '22%',
    },
    {
      key: 4,
      id: 4,
      name: '电梯系统控制',
      type: '停用策略',
      operator: 'user2',
      time: '2024-12-30 14:20:33',
      result: '失败',
      saving: '5%',
    },
    {
      key: 5,
      id: 5,
      name: '夜间照明优化',
      type: '启用策略',
      operator: 'user1',
      time: '2024-12-29 11:05:55',
      result: '成功',
      saving: '9%',
    },
  ]


  // 添加策略到组合
  const handleAddStrategy = (strategyId: string) => {
    if (!selectedStrategies.includes(strategyId)) {
      setSelectedStrategies([...selectedStrategies, strategyId])
      message.success('已添加到策略组合')
    }
  }

  // 从组合中移除策略
  const handleRemoveStrategy = (strategyId: string) => {
    setSelectedStrategies(selectedStrategies.filter((id) => id !== strategyId))
    message.info('已从组合中移除')
  }

  // 保存组合
  const handleSaveCombination = () => {
    message.success('策略组合已保存')
  }

  // 开始模拟
  const handleStartSimulation = async () => {
    setSimulating(true)
    setSimulationProgress(0)
    message.info('开始实时模拟，正在采集系统数据...')
    
    let startTime = Date.now()
    let progressValue = 0
    
    // 模拟进度更新和实时数据更新
    const simulationInterval = setInterval(() => {
      if (progressValue >= 100) {
        clearInterval(simulationInterval)
        setSimulating(false)
        message.success('实时模拟完成！节能效果显著')
        
        // 添加新的模拟记录
        const newRecord = {
          key: dynamicSimulationRecords.length + 1,
          time: new Date().toLocaleString('zh-CN', { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit',
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit',
            hour12: false 
          }).replace(/\//g, '-'),
          power: (130 + Math.random() * 50).toFixed(1),
          calc: (6 + Math.random() * 3).toFixed(2),
          improvement: `+${(10 + Math.random() * 2).toFixed(1)}%`,
          cost: `¥${(56000000 + Math.random() * 2000000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`,
          efficiency: `${(83 + Math.random() * 5).toFixed(1)}%`,
        }
        setDynamicSimulationRecords([newRecord, ...dynamicSimulationRecords])
        return
      }
      
      progressValue += 2
      setSimulationProgress(Math.min(progressValue, 100))
      
      // 更新运行时间
      const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000)
      const hours = Math.floor(elapsedSeconds / 3600)
      const minutes = Math.floor((elapsedSeconds % 3600) / 60)
      const seconds = elapsedSeconds % 60
      setSimulationTime(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      )
      
      // 动态更新实时指标
      setRealTimeMetrics({
        runTime: parseFloat((140 + Math.random() * 15).toFixed(1)),
        avgSimTime: parseFloat((6 + Math.random() * 2).toFixed(2)),
        successRate: parseFloat((10 + Math.random() * 2).toFixed(1)),
        estimatedRevenue: (56000000 + Math.random() * 5000000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ','),
        temperature: parseFloat((85 + Math.random() * 5).toFixed(1)),
        abnormalEvents: Math.floor(Math.random() * 2),
      })
      
      // 动态更新改善对比数据
      setComparisonData([
        {
          label: '照明系统',
          current: parseFloat((20 + Math.random() * 8).toFixed(1)),
          baseline: parseFloat((0.9 + Math.random() * 0.2).toFixed(2)),
          improvement: Math.floor(10 + Math.random() * 10),
          change: `+${(3 + Math.random() * 2).toFixed(1)}%`,
        },
        {
          label: '空调系统',
          current: parseFloat((70 + Math.random() * 15).toFixed(1)),
          baseline: parseFloat((0.95 + Math.random() * 0.15).toFixed(2)),
          improvement: Math.floor(45 + Math.random() * 15),
          change: `+${(6 + Math.random() * 2).toFixed(1)}%`,
        },
        {
          label: '电梯系统',
          current: parseFloat((15 + Math.random() * 5).toFixed(1)),
          baseline: parseFloat((0.55 + Math.random() * 0.15).toFixed(2)),
          improvement: Math.floor(8 + Math.random() * 8),
          change: `+${(0.5 + Math.random() * 1).toFixed(1)}%`,
        },
        {
          label: '供电系统',
          current: parseFloat((32 + Math.random() * 10).toFixed(1)),
          baseline: parseFloat((0.6 + Math.random() * 0.1).toFixed(2)),
          improvement: Math.floor(5 + Math.random() * 8),
          change: Math.random() > 0.3 ? `+${(1 + Math.random()).toFixed(1)}%` : `-${(Math.random() * 2).toFixed(1)}%`,
        },
        {
          label: '储能系统',
          current: parseFloat((14 + Math.random() * 5).toFixed(1)),
          baseline: parseFloat((0.62 + Math.random() * 0.1).toFixed(2)),
          improvement: Math.floor(8 + Math.random() * 6),
          change: `+${(1.2 + Math.random() * 1).toFixed(1)}%`,
        },
      ])
    }, 500) // 每500ms更新一次
  }

  // 停止模拟
  const handleStopSimulation = () => {
    setSimulating(false)
    setSimulationProgress(0)
    setSimulationTime('00:00:00')
    message.warning('实时模拟已停止')
  }

  // 开始快速模拟
  const handleQuickSimulation = async () => {
    setQuickSimulating(true)
    message.loading({ content: '正在快速计算节能方案...', key: 'quick-sim', duration: 0 })
    
    // 模拟计算过程
    await sleep(1500)
    
    // 根据选择的参数生成不同的模拟结果
    const baseMultiplier = timePeriod === 'month' ? 1.5 : timePeriod === 'week' ? 1.2 : 1.0
    const areaMultiplier = areaSelection === 'area3' ? 1.3 : areaSelection === 'area2' ? 1.15 : 1.0
    const totalMultiplier = baseMultiplier * areaMultiplier
    
    // 更新模拟统计数据
    setQuickStats({
      energyImprovement: parseFloat((4 + Math.random() * 3).toFixed(1)),
      mechanicalRate: parseFloat((7 + Math.random() * 3).toFixed(1)),
      totalImprovement: parseFloat((12 + Math.random() * 6).toFixed(1)),
      carbonCost: Math.floor(500 + Math.random() * 200),
    })
    
    // 更新模拟结果
    setQuickResults({
      savingsRate: parseFloat((7 + Math.random() * 3).toFixed(1)),
      costSaving: Math.floor((10000 + Math.random() * 10000) * totalMultiplier),
      energySaving: Math.floor((120 + Math.random() * 80) * totalMultiplier),
    })
    
    setQuickSimulating(false)
    message.success({ 
      content: `快速模拟完成！预计节能率 ${(7 + Math.random() * 3).toFixed(1)}%`, 
      key: 'quick-sim',
      duration: 3
    })
  }
  
  // 重置快速模拟
  const handleResetQuickSimulation = () => {
    setTimePeriod('natural')
    setAreaSelection('area1')
    setQuickStats({
      energyImprovement: 5.2,
      mechanicalRate: 8.5,
      totalImprovement: 15.3,
      carbonCost: 580,
    })
    setQuickResults({
      savingsRate: 8.5,
      costSaving: 12480,
      energySaving: 156,
    })
    message.info('已重置为默认参数')
  }

  // 历史记录表格列
  const historyColumns = [
    { title: '记录ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: '策略名称', dataIndex: 'name', key: 'name', width: 200 },
    { title: '操作类型', dataIndex: 'type', key: 'type', width: 120 },
    { title: '操作人', dataIndex: 'operator', key: 'operator', width: 100 },
    { title: '操作时间', dataIndex: 'time', key: 'time', width: 180 },
    {
      title: '结果',
      dataIndex: 'result',
      key: 'result',
      width: 80,
      render: (text: string) => (
        <Tag color={text === '成功' ? 'green' : 'red'}>{text}</Tag>
      ),
    },
    { title: '节电率', dataIndex: 'saving', key: 'saving', width: 80 },
  ]

  // 实时模拟表格列
  const simulationColumns = [
    { title: '时间', dataIndex: 'time', key: 'time', width: 180 },
    { title: '功率(kW)', dataIndex: 'power', key: 'power', width: 100 },
    { title: '预计节能量(kWh)', dataIndex: 'calc', key: 'calc', width: 140 },
    {
      title: '节能改善',
      dataIndex: 'improvement',
      key: 'improvement',
      width: 100,
      render: (text: string) => (
        <Tag color="green">{text}</Tag>
      ),
    },
    { title: '碳排放额度', dataIndex: 'cost', key: 'cost', width: 130 },
    { title: '节能效益', dataIndex: 'efficiency', key: 'efficiency', width: 100 },
  ]

  return (
    <div className="strategy-new-container">
      <PageHeader
        title="节能策略模拟系统"
        subtitle="策略推荐 · 规则管理 · 实时模拟 · 效果评估"
        items={[{ title: '首页', path: '/dashboard' }, { title: '节能策略模拟' }]}
        extra={
          <Space>
            <Button type="primary" icon={<PlusOutlined />}>
              导入策略
            </Button>
            <Button icon={<DownloadOutlined />}>导出报告</Button>
          </Space>
        }
      />

      {/* 顶部状态卡片 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="status-card-strategy">
            <div className="status-card-inner">
              <div className="status-icon-strategy" style={{ background: '#f0fff4' }}>
                <CheckCircleOutlined style={{ fontSize: 24, color: '#52c41a' }} />
              </div>
              <div className="status-info-strategy">
                <div className="status-label-strategy">运行正常</div>
                <div className="status-value-strategy">运行中</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="status-card-strategy">
            <div className="status-card-inner">
              <div className="status-icon-strategy" style={{ background: '#f0f5ff' }}>
                <FileProtectOutlined style={{ fontSize: 24, color: '#722ed1' }} />
              </div>
              <div className="status-info-strategy">
                <div className="status-label-strategy">策略数量</div>
                <div className="status-value-strategy">48</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="status-card-strategy">
            <div className="status-card-inner">
              <div className="status-icon-strategy" style={{ background: '#fff7e6' }}>
                <ClockCircleOutlined style={{ fontSize: 24, color: '#faad14' }} />
              </div>
              <div className="status-info-strategy">
                <div className="status-label-strategy">历史记录</div>
                <div className="status-value-strategy">156</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="status-card-strategy">
            <div className="status-card-inner">
              <div className="status-icon-strategy" style={{ background: '#e6f7ff' }}>
                <LineChartOutlined style={{ fontSize: 24, color: '#1890ff' }} />
              </div>
              <div className="status-info-strategy">
                <div className="status-label-strategy">最后更新</div>
                <div className="status-value-strategy">2024-12-26</div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Tabs标签页 */}
      <Card bordered={false} style={{ marginTop: 16 }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          tabBarStyle={{ marginBottom: 24 }}
        >
          {/* Tab 1: 策略推荐 */}
          <TabPane
            tab={
              <span>
                <BulbOutlined /> 策略推荐
              </span>
            }
            key="recommendation"
          >
            <div className="tab-content-header">
              <h3>策略推荐</h3>
              <p>基于AI智能分析推荐的节能策略</p>
              <Button type="primary" icon={<PlusOutlined />} style={{ marginTop: 12 }}>
                新增策略
              </Button>
            </div>
            <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
              {recommendedStrategies.map((strategy) => (
                <Col xs={24} sm={12} lg={6} key={strategy.id}>
                  <Card bordered={false} className="strategy-card-rec">
                    <div className="strategy-card-icon" style={{ backgroundColor: `${strategy.color}15` }}>
                      <span style={{ fontSize: 32 }}>{strategy.icon}</span>
                    </div>
                    <h4 className="strategy-card-title">{strategy.title}</h4>
                    <p className="strategy-card-desc">{strategy.desc}</p>
                    <div className="strategy-card-footer">
                      <Tag color={strategy.statusColor}>{strategy.status}</Tag>
                      <Tag color="cyan">{strategy.saving}</Tag>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </TabPane>

          {/* Tab 2: 模板管理 */}
          <TabPane
            tab={
              <span>
                <FileTextOutlined /> 模板管理
              </span>
            }
            key="template"
          >
            <div className="tab-content-header">
              <h3>模板管理</h3>
              <p>管理和使用节能策略模板</p>
              <Button type="primary" icon={<PlusOutlined />} style={{ marginTop: 12 }}>
                新增模板
              </Button>
            </div>
            <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
              {templates.map((template) => (
                <Col xs={24} sm={12} key={template.id}>
                  <Card bordered={false} className="template-card">
                    <div className="template-card-header">
                      <FileTextOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                      <h4>{template.title}</h4>
                    </div>
                    <p className="template-card-desc">{template.desc}</p>
                    <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                      <Col span={8}>
                        <div className="template-stat">
                          <div className="template-stat-value">{template.strategies}</div>
                          <div className="template-stat-label">包含策略</div>
                        </div>
                      </Col>
                      <Col span={8}>
                        <div className="template-stat">
                          <div className="template-stat-value">{template.usage}</div>
                          <div className="template-stat-label">使用次数</div>
                        </div>
                      </Col>
                      <Col span={8}>
                        <div className="template-stat-date">
                          <div className="template-stat-value">{template.date}</div>
                          <div className="template-stat-label">创建日期</div>
                        </div>
                      </Col>
                    </Row>
                    <div className="template-card-actions">
                      <Button type="link">应用</Button>
                      <Button type="link">编辑</Button>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </TabPane>

          {/* Tab 3: 策略组合 */}
          <TabPane
            tab={
              <span>
                <AppstoreOutlined /> 策略组合
              </span>
            }
            key="combination"
          >
            <div className="tab-content-header">
              <h3>多策略组合模拟</h3>
              <p>组合多个策略进行协同优化，已选 2 个策略</p>
              <Space style={{ marginTop: 12 }}>
                <Button type="primary" icon={<CheckCircleOutlined />} onClick={handleSaveCombination}>
                  保存组合
                </Button>
                <Button type="primary" icon={<PlayCircleOutlined />}>
                  开始模拟
                </Button>
              </Space>
            </div>

            <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
              {/* 左侧：已选策略 */}
              <Col xs={24} lg={8}>
                <Card title="已选策略" bordered={false} className="combination-selected-card">
                  {currentCombination.map((item) => (
                    <div key={item.id} className="selected-strategy-item">
                      <div className="selected-strategy-icon">
                        <span style={{ fontSize: 20 }}>☀️</span>
                      </div>
                      <div className="selected-strategy-info">
                        <div className="selected-strategy-title">{item.title}</div>
                        <div className="selected-strategy-saving">{item.saving}</div>
                      </div>
                    </div>
                  ))}
                </Card>
              </Col>

              {/* 右侧：推荐模块 */}
              <Col xs={24} lg={16}>
                <h4 style={{ marginBottom: 16, fontSize: 16, fontWeight: 600 }}>推荐模块</h4>
                <Row gutter={[16, 16]}>
                  {combinationRecommendations.map((rec) => (
                    <Col xs={24} sm={12} key={rec.id}>
                      <Card bordered={false} className="combination-rec-card" style={{ background: rec.bgColor }}>
                        <div className="combination-rec-header">
                          <div className="combination-rec-icon">
                            <span style={{ fontSize: 32 }}>{rec.icon}</span>
                          </div>
                          <Tag color={rec.color.includes('52c41a') ? 'green' : rec.color.includes('faad14') ? 'orange' : 'blue'}>
                            {rec.status}
                          </Tag>
                        </div>
                        <h4 className="combination-rec-title">{rec.title}</h4>
                        <p className="combination-rec-desc">{rec.desc}</p>
                        <div className="combination-rec-footer">
                          <span className="combination-rec-saving">{rec.saving}</span>
                          <span className="combination-rec-cost">{rec.cost}</span>
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Col>
            </Row>

            {/* 组合效果分析 */}
            <div className="combination-analysis" style={{ marginTop: 32 }}>
              <h4 style={{ marginBottom: 16, fontSize: 16, fontWeight: 600 }}>
                <LineChartOutlined /> 组合效果分析
              </h4>
              <Row gutter={[16, 16]}>
                <Col xs={12} sm={6}>
                  <div className="analysis-stat-card" style={{ background: '#f0fff4' }}>
                    <div className="analysis-stat-icon" style={{ color: '#52c41a' }}>🌿</div>
                    <div className="analysis-stat-value" style={{ color: '#52c41a' }}>14.0%</div>
                    <div className="analysis-stat-label">节能改善</div>
                  </div>
                </Col>
                <Col xs={12} sm={6}>
                  <div className="analysis-stat-card" style={{ background: '#e6f7ff' }}>
                    <div className="analysis-stat-icon" style={{ color: '#1890ff' }}>⚡</div>
                    <div className="analysis-stat-value" style={{ color: '#1890ff' }}>2,240,000</div>
                    <div className="analysis-stat-label">年节省电量(kWh)</div>
                  </div>
                </Col>
                <Col xs={12} sm={6}>
                  <div className="analysis-stat-card" style={{ background: '#fffbe6' }}>
                    <div className="analysis-stat-icon" style={{ color: '#faad14' }}>💰</div>
                    <div className="analysis-stat-value" style={{ color: '#faad14' }}>1,792,000</div>
                    <div className="analysis-stat-label">年节省费用(元)</div>
                  </div>
                </Col>
                <Col xs={12} sm={6}>
                  <div className="analysis-stat-card" style={{ background: '#fff0f6' }}>
                    <div className="analysis-stat-icon" style={{ color: '#eb2f96' }}>📉</div>
                    <div className="analysis-stat-value" style={{ color: '#eb2f96' }}>0.0</div>
                    <div className="analysis-stat-label">碳排放减量</div>
                  </div>
                </Col>
              </Row>
            </div>
          </TabPane>

          {/* Tab 4: 实时模拟 */}
          <TabPane
            tab={
              <span>
                <PlayCircleOutlined /> 实时模拟
              </span>
            }
            key="simulation"
          >
            <div className="tab-content-header">
              <h3>实时模拟</h3>
              <p>模拟执行节能策略，实时分析能源改善情况与节能效果</p>
              <Space style={{ marginTop: 12 }}>
                <Button danger icon={<CloseOutlined />} onClick={handleStopSimulation} disabled={!simulating}>
                  停止模拟
                </Button>
                <Button type="primary" icon={<PlayCircleOutlined />} onClick={handleStartSimulation} loading={simulating}>
                  {simulating ? '模拟中...' : '开始模拟'}
                </Button>
              </Space>
            </div>

            {/* 模拟进度 */}
            <Card bordered={false} style={{ marginTop: 24 }} className="simulation-progress-card">
              <div className="simulation-progress-header">
                <ClockCircleOutlined style={{ color: '#1890ff' }} />
                <span>{simulating ? '模拟运行中' : '模拟进度'}</span>
                <span className="simulation-time">{simulationTime}</span>
              </div>
              <div className="simulation-progress-desc">
                {simulating ? '实时采集能耗数据并分析节能效果' : '等待开始模拟'}
              </div>
              <Progress 
                percent={simulationProgress} 
                strokeColor={simulating ? { '0%': '#108ee9', '100%': '#52c41a' } : '#1890ff'} 
                strokeWidth={12} 
                status={simulating ? 'active' : 'normal'}
              />
              <div className="simulation-progress-label">
                <span>完成进度</span>
                <span>{simulationProgress}%</span>
              </div>
            </Card>

            {/* 实时输出指标 */}
            <div style={{ marginTop: 32 }}>
              <h4>实时输出指标</h4>
              <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col xs={12} sm={8} lg={4}>
                  <div className="simulation-metric">
                    <ClockCircleOutlined style={{ fontSize: 20, color: '#1890ff' }} />
                    <div className="simulation-metric-value">{realTimeMetrics.runTime}</div>
                    <div className="simulation-metric-label">真实运行时间(s)</div>
                  </div>
                </Col>
                <Col xs={12} sm={8} lg={4}>
                  <div className="simulation-metric">
                    <ThunderboltOutlined style={{ fontSize: 20, color: '#faad14' }} />
                    <div className="simulation-metric-value">{realTimeMetrics.avgSimTime}</div>
                    <div className="simulation-metric-label">平均模拟时间(s)</div>
                  </div>
                </Col>
                <Col xs={12} sm={8} lg={4}>
                  <div className="simulation-metric">
                    <CheckCircleOutlined style={{ fontSize: 20, color: '#52c41a' }} />
                    <div className="simulation-metric-value">{realTimeMetrics.successRate}%</div>
                    <div className="simulation-metric-label">节能改善率</div>
                  </div>
                </Col>
                <Col xs={12} sm={8} lg={4}>
                  <div className="simulation-metric">
                    <span style={{ fontSize: 20 }}>💰</span>
                    <div className="simulation-metric-value" style={{ fontSize: 16 }}>¥{realTimeMetrics.estimatedRevenue}</div>
                    <div className="simulation-metric-label">估算年收益</div>
                  </div>
                </Col>
                <Col xs={12} sm={8} lg={4}>
                  <div className="simulation-metric">
                    <LineChartOutlined style={{ fontSize: 20, color: '#722ed1' }} />
                    <div className="simulation-metric-value">{realTimeMetrics.temperature}%</div>
                    <div className="simulation-metric-label">系统效率</div>
                  </div>
                </Col>
                <Col xs={12} sm={8} lg={4}>
                  <div className="simulation-metric">
                    <span style={{ fontSize: 20 }}>⚠️</span>
                    <div className="simulation-metric-value" style={{ color: realTimeMetrics.abnormalEvents > 0 ? '#ff4d4f' : '#52c41a' }}>
                      {realTimeMetrics.abnormalEvents}
                    </div>
                    <div className="simulation-metric-label">异常事件</div>
                  </div>
                </Col>
              </Row>
            </div>

            {/* 实时输出改善对比 */}
            <div style={{ marginTop: 32 }}>
              <h4>实时输出改善对比</h4>
              <div className="simulation-comparison">
                {comparisonData.map((item, idx) => (
                  <div key={idx} className="comparison-item">
                    <div className="comparison-header">
                      <span className="comparison-label">{item.label}</span>
                      <span className="comparison-values">当前值: {item.current} 基准值: {item.baseline}</span>
                      <span className={`comparison-change ${item.change.startsWith('+') ? 'positive' : 'negative'}`}>
                        {item.change}
                      </span>
                    </div>
                    <Progress 
                      percent={item.improvement} 
                      strokeColor={idx % 2 === 0 ? '#1890ff' : '#52c41a'} 
                      showInfo={false}
                      status={simulating ? 'active' : 'normal'}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* 模拟数据记录 */}
            <div style={{ marginTop: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h4>模拟数据记录</h4>
                <Space>
                  {simulating && <Tag color="processing">实时更新中...</Tag>}
                  <Button type="link" icon={<DownloadOutlined />}>导出数据</Button>
                </Space>
              </div>
              <Table
                dataSource={dynamicSimulationRecords}
                columns={simulationColumns}
                pagination={{ pageSize: 7, showSizeChanger: true, showTotal: (total) => `共 ${total} 条记录` }}
                size="small"
                scroll={{ x: 800 }}
              />
            </div>
          </TabPane>

          {/* Tab 5: 历史记录 */}
          <TabPane
            tab={
              <span>
                <HistoryOutlined /> 历史记录
              </span>
            }
            key="history"
          >
            <div className="tab-content-header">
              <h3>历史记录</h3>
              <p>查看策略操作历史记录</p>
              <Button type="primary" icon={<DownloadOutlined />} style={{ marginTop: 12 }}>
                导出
              </Button>
            </div>
            <Table
              dataSource={historyRecords}
              columns={historyColumns}
              pagination={{ pageSize: 10 }}
              style={{ marginTop: 24 }}
              scroll={{ x: 1000 }}
            />
          </TabPane>

          {/* Tab 6: 快速模拟 */}
          <TabPane
            tab={
              <span>
                <ThunderboltOutlined /> 快速模拟
              </span>
            }
            key="quick"
          >
            <div className="tab-content-header">
              <h3>快速模拟</h3>
              <p>快速设置参数并启动节能模拟，即时获取节能效果预测</p>
              <Space style={{ marginTop: 12 }}>
                <Button onClick={handleResetQuickSimulation} disabled={quickSimulating}>
                  重置
                </Button>
                <Button 
                  type="primary" 
                  icon={<PlayCircleOutlined />} 
                  onClick={handleQuickSimulation}
                  loading={quickSimulating}
                >
                  {quickSimulating ? '计算中...' : '开始模拟'}
                </Button>
              </Space>
            </div>

            {/* 快速模拟热设置 */}
            <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
              <Col xs={24} lg={14}>
                <Card title="快速模拟热设置" bordered={false}>
                  <div className="quick-setting-item">
                    <label>时段选择</label>
                    <Radio.Group 
                      value={timePeriod} 
                      onChange={(e) => setTimePeriod(e.target.value)}
                      style={{ width: '100%' }}
                      disabled={quickSimulating}
                    >
                      <Radio.Button value="natural" style={{ width: '25%' }}>自然日</Radio.Button>
                      <Radio.Button value="week" style={{ width: '25%' }}>近7天</Radio.Button>
                      <Radio.Button value="month" style={{ width: '25%' }}>近30天</Radio.Button>
                      <Radio.Button value="custom" style={{ width: '25%' }}>自定义</Radio.Button>
                    </Radio.Group>
                  </div>

                  <div className="quick-setting-item">
                    <label>区域设置</label>
                    <Radio.Group 
                      value={areaSelection} 
                      onChange={(e) => setAreaSelection(e.target.value)}
                      style={{ width: '100%' }}
                      disabled={quickSimulating}
                    >
                      <Radio.Button value="area1" style={{ width: '33.33%' }}>候车大厅</Radio.Button>
                      <Radio.Button value="area2" style={{ width: '33.33%' }}>办公区域</Radio.Button>
                      <Radio.Button value="area3" style={{ width: '33.33%' }}>全站范围</Radio.Button>
                    </Radio.Group>
                  </div>

                  <div className="quick-setting-item">
                    <label>区域范围</label>
                    <Input 
                      placeholder="请输入区域范围" 
                      defaultValue="1-5层全部区域"
                      disabled={quickSimulating}
                    />
                  </div>

                  <div className="quick-setting-item">
                    <label>模拟策略</label>
                    <Select 
                      defaultValue="combined" 
                      style={{ width: '100%' }}
                      disabled={quickSimulating}
                    >
                      <Select.Option value="lighting">照明优化</Select.Option>
                      <Select.Option value="hvac">空调优化</Select.Option>
                      <Select.Option value="combined">综合策略</Select.Option>
                      <Select.Option value="custom">自定义</Select.Option>
                    </Select>
                  </div>

                  <div className="quick-setting-item">
                    <label>基准能耗</label>
                    <Input 
                      placeholder="输入基准能耗值" 
                      defaultValue="5000 kWh/天"
                      disabled={quickSimulating}
                    />
                  </div>

                  <div className="quick-setting-item">
                    <label>目标节能率</label>
                    <Input 
                      placeholder="输入目标节能率" 
                      defaultValue="10%"
                      disabled={quickSimulating}
                    />
                  </div>
                </Card>
              </Col>

              <Col xs={24} lg={10}>
                <Card title="模拟统计" bordered={false}>
                  <div className="quick-stat-item" style={{ background: '#fffbe6', borderLeft: '3px solid #faad14' }}>
                    <div className="quick-stat-icon">⚡</div>
                    <div className="quick-stat-content">
                      <div className="quick-stat-value">{quickStats.energyImprovement}%</div>
                      <div className="quick-stat-label">能源效率改善</div>
                    </div>
                  </div>

                  <div className="quick-stat-item" style={{ background: '#f9f0ff', borderLeft: '3px solid #722ed1' }}>
                    <div className="quick-stat-icon">⏱️</div>
                    <div className="quick-stat-content">
                      <div className="quick-stat-value">{quickStats.mechanicalRate}%</div>
                      <div className="quick-stat-label">设备运行效率</div>
                    </div>
                  </div>

                  <div className="quick-stat-item" style={{ background: '#f0fff4', borderLeft: '3px solid #52c41a' }}>
                    <div className="quick-stat-icon">📈</div>
                    <div className="quick-stat-content">
                      <div className="quick-stat-value">{quickStats.totalImprovement}%</div>
                      <div className="quick-stat-label">总能耗改善</div>
                    </div>
                  </div>

                  <div className="quick-stat-item" style={{ background: '#fff2e8', borderLeft: '3px solid #ff7a45' }}>
                    <div className="quick-stat-icon">💰</div>
                    <div className="quick-stat-content">
                      <div className="quick-stat-value">¥{quickStats.carbonCost.toLocaleString()}</div>
                      <div className="quick-stat-label">日均节约成本</div>
                    </div>
                  </div>

                  <div className="quick-notice">
                    <span>💡</span>
                    <span>数据来源于历史记录结合AI智能预测，实际效果可能存在差异</span>
                  </div>
                </Card>
              </Col>
            </Row>

            {/* 模拟结果预览 */}
            <div style={{ marginTop: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h4>模拟结果预览</h4>
                {quickSimulating && <Tag color="processing">计算中...</Tag>}
              </div>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={8}>
                  <div className="quick-result-card">
                    <LineChartOutlined style={{ fontSize: 20, color: '#52c41a' }} />
                    <div className="quick-result-value">{quickResults.savingsRate}%</div>
                    <div className="quick-result-label">预计节能率</div>
                  </div>
                </Col>
                <Col xs={24} sm={8}>
                  <div className="quick-result-card">
                    <span style={{ fontSize: 20 }}>💰</span>
                    <div className="quick-result-value">¥{quickResults.costSaving.toLocaleString()}</div>
                    <div className="quick-result-label">预计日节省费用</div>
                  </div>
                </Col>
                <Col xs={24} sm={8}>
                  <div className="quick-result-card">
                    <ThunderboltOutlined style={{ fontSize: 20, color: '#faad14' }} />
                    <div className="quick-result-value">{quickResults.energySaving} kWh</div>
                    <div className="quick-result-label">预计日节省电量</div>
                  </div>
                </Col>
              </Row>
            </div>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  )
}

export default StrategyNew

