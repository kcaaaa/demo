import React from 'react'
import {
  Badge,
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Progress,
  Row,
  Segmented,
  Space,
  Tag,
  Tooltip,
  message,
} from 'antd'
import {
  ReloadOutlined,
  DownloadOutlined,
  SettingOutlined,
  BulbOutlined,
  ThunderboltOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons'
import type { Moment } from 'moment'
import Chart from '../../components/Chart'
import { sleep } from '../../utils/mock'
import './home.css'

type Metric = { title: string; value: number; unit: string; yoy: number; mom: number }

type AIAnalysis = {
  potential: number
  trendTag: string
  trendColor: string
  optimizeTarget: string
  suggestion: string
  description: string
}

type Props = {
  keyMetrics: Record<string, Metric>
  alerts: { total: number; high: number; medium: number; low: number }
  trend: { x: string[]; energy: number[]; cost: number[]; efficiency: number[] }
  aiAnalysis: AIAnalysis
  onExport: () => void
  onRefresh: () => Promise<void>
}

// 筛选条件类型
type FilterState = {
  stationType: string
  energyLevel: string
  timeRange: [Moment | null, Moment | null] | null
  viewMode: string
}

const STORAGE_KEY = 'home_filter_state'

// 从 localStorage 加载筛选条件
const loadFilterState = (): Partial<FilterState> => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : {}
  } catch {
    return {}
  }
}

// 保存筛选条件到 localStorage
const saveFilterState = (state: Partial<FilterState>) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (e) {
    console.warn('Failed to save filter state:', e)
  }
}

const HomeView = ({ keyMetrics, alerts, trend, aiAnalysis, onExport, onRefresh }: Props) => {
  const [loading, setLoading] = React.useState(false)
  const [refreshing, setRefreshing] = React.useState(false)
  
  // 加载保存的筛选条件
  const savedFilter = React.useMemo(() => loadFilterState(), [])
  
  const [stationType, setStationType] = React.useState(savedFilter.stationType || 'large')
  const [energyLevel, setEnergyLevel] = React.useState(savedFilter.energyLevel || '1')
  const [timeRange, setTimeRange] = React.useState<[Moment | null, Moment | null] | null>(null)
  const [viewMode, setViewMode] = React.useState(savedFilter.viewMode || '多站仪表盘')

  const metricItems = [
    { title: '总能耗', key: 'totalEnergy' },
    { title: '单位面积能耗', key: 'unitAreaEnergy' },
    { title: '能耗成本', key: 'energyCost' },
    { title: '能源效率', key: 'energyEfficiency' },
  ] as const

  // 应用筛选：保存状态并模拟数据刷新
  const handleApplyFilter = async () => {
    setLoading(true)
    await sleep(500)
    
    // 保存筛选条件
    saveFilterState({
      stationType,
      energyLevel,
      viewMode,
    })
    
    // 触发自定义事件通知数据更新
    window.dispatchEvent(new Event('localStorageChange'))
    
    message.success(`已应用筛选：${stationType === 'large' ? '大型站' : stationType === 'medium' ? '中型站' : '小型站'} / 能耗等级 ${energyLevel}`)
    setLoading(false)
  }

  // 重置筛选
  const handleResetFilter = () => {
    setStationType('large')
    setEnergyLevel('1')
    setTimeRange(null)
    setViewMode('多站仪表盘')
    
    // 清除保存的筛选条件
    localStorage.removeItem(STORAGE_KEY)
    message.info('筛选已重置')
  }

  // 刷新数据
  const handleRefresh = async () => {
    setRefreshing(true)
    await onRefresh()
    message.success('数据已刷新')
    setRefreshing(false)
  }

  // 图表配置
  const trendOption = {
    tooltip: { 
      trigger: 'axis' as const,
      axisPointer: {
        type: 'cross',
        label: { backgroundColor: '#6a7985' }
      }
    },
    legend: { 
      data: ['能耗', '成本', '效率'],
      top: 0,
      right: 0,
    },
    grid: { left: 48, right: 24, bottom: 32, top: 48 },
    xAxis: { 
      type: 'category' as const, 
      data: trend.x,
      boundaryGap: false,
    },
    yAxis: [
      { 
        type: 'value' as const, 
        name: '能耗(kWh)',
        position: 'left',
        axisLabel: { formatter: '{value}' }
      },
      { 
        type: 'value' as const, 
        name: '效率(%)',
        position: 'right',
        axisLabel: { formatter: '{value}%' }
      },
    ],
    series: [
      {
        name: '能耗',
        type: 'line',
        data: trend.energy,
        smooth: true,
        areaStyle: { color: 'rgba(24,144,255,0.15)' },
        lineStyle: { width: 3, color: '#1890ff' },
        emphasis: { focus: 'series' }
      },
      { 
        name: '成本', 
        type: 'line', 
        data: trend.cost, 
        smooth: true, 
        lineStyle: { width: 3, color: '#722ed1' },
        emphasis: { focus: 'series' }
      },
      { 
        name: '效率', 
        type: 'line', 
        yAxisIndex: 1, 
        data: trend.efficiency, 
        smooth: true, 
        lineStyle: { width: 3, color: '#52c41a' },
        emphasis: { focus: 'series' }
      },
    ],
  }

  return (
    <div className="home-page fade-in">
      {/* Hero 区域 */}
      <Card className="hero-card" bordered={false}>
        <div className="hero-left">
          <div className="hero-title">能源监控平台</div>
          <div className="hero-sub">Energy Monitor · 场景：{stationType === 'large' ? '大型站' : stationType === 'medium' ? '中型站' : '小型站'} / {viewMode}</div>
          <Space size={12} wrap>
            <Tag color="blue">运行正常</Tag>
            <Tag color="gold">刷新间隔：30s</Tag>
            <Tag color="purple">主题：浅色</Tag>
            <Tag color="cyan">筛选：{savedFilter.stationType ? '已保存' : '默认'}</Tag>
          </Space>
        </div>
        <Space size={12} wrap>
          <Button icon={<BulbOutlined />} onClick={() => message.info('主题切换功能待开发')}>
            主题切换
          </Button>
          <Button icon={<SettingOutlined />} onClick={() => message.info('个性化配置功能待开发')}>
            个性化配置
          </Button>
          <Button icon={<DownloadOutlined />} onClick={onExport}>
            导出数据
          </Button>
          <Button
            type="primary"
            icon={<ReloadOutlined spin={refreshing} />}
            loading={refreshing}
            onClick={handleRefresh}
          >
            刷新数据
          </Button>
        </Space>
      </Card>

      {/* 高级筛选区域 */}
      <Card className="filter-card" bordered={false}>
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} md={6}>
            <div className="filter-label">车站类型</div>
            <Segmented
              block
              value={stationType}
              onChange={(value) => setStationType(value as string)}
              options={[
                { label: '大型站', value: 'large' },
                { label: '中型站', value: 'medium' },
                { label: '小型站', value: 'small' },
              ]}
            />
          </Col>
          <Col xs={24} md={6}>
            <div className="filter-label">能耗等级</div>
            <Segmented
              block
              value={energyLevel}
              onChange={(value) => setEnergyLevel(value as string)}
              options={[
                { label: '一级(优秀)', value: '1' },
                { label: '二级', value: '2' },
                { label: '三级', value: '3' },
                { label: '四级', value: '4' },
              ]}
            />
          </Col>
          <Col xs={24} md={8}>
            <div className="filter-label">时间范围</div>
            <DatePicker.RangePicker 
              style={{ width: '100%' }} 
              value={timeRange}
              onChange={(dates) => setTimeRange(dates)}
              placeholder={['开始日期', '结束日期']}
            />
          </Col>
          <Col xs={24} md={4}>
            <Space style={{ width: '100%' }} direction="vertical" size={8}>
              <Button 
                type="primary" 
                block 
                icon={<ThunderboltOutlined />} 
                onClick={handleApplyFilter}
                loading={loading}
              >
                应用筛选
              </Button>
              <Button block onClick={handleResetFilter}>
                重置
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 视图切换与关键指标 */}
      <Row gutter={[16, 16]} className="section-row">
        <Col xs={24} lg={16}>
          <Card bordered={false} className="section-card">
            <div className="section-head">
              <div>
                <div className="section-title">视图切换</div>
                <div className="section-sub">单站看板 / 多站仪表盘</div>
              </div>
              <Segmented 
                value={viewMode}
                onChange={(value) => {
                  setViewMode(value as string)
                  saveFilterState({ ...savedFilter, viewMode: value as string })
                }}
                options={['单站看板', '多站仪表盘']} 
              />
            </div>
            <Divider style={{ margin: '12px 0' }} />
            <Row gutter={[12, 12]}>
              {metricItems.map((m) => (
                <Col xs={12} lg={6} key={m.title}>
                  <MetricCard title={m.title} data={keyMetrics[m.key]} />
                </Col>
              ))}
            </Row>
          </Card>
        </Col>

        {/* AI 汇总分析 */}
        <Col xs={24} lg={8}>
          <Card bordered={false} className="section-card">
            <div className="section-head">
              <div>
                <div className="section-title">AI 汇总分析</div>
                <div className="section-sub">近 12 个月 · 多站对比 · 异常识别</div>
              </div>
              <Tag color="blue">Beta</Tag>
            </div>
            <Divider style={{ margin: '12px 0' }} />
            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              <Progress 
                percent={aiAnalysis.potential} 
                status="active" 
                strokeColor={{ from: '#108ee9', to: '#87d068' }} 
              />
              <div style={{ fontSize: '12px', color: '#4e5969' }}>
                节能潜力：<strong>{aiAnalysis.potential}%</strong>
              </div>
              <Space wrap>
                <Tag color={aiAnalysis.trendColor}>{aiAnalysis.trendTag}</Tag>
                <Tag color="orange">待优化：{aiAnalysis.optimizeTarget}</Tag>
                <Tag color="purple">建议：{aiAnalysis.suggestion}</Tag>
              </Space>
              <div style={{ 
                fontSize: '12px', 
                color: '#86909c', 
                lineHeight: '1.6',
                padding: '8px 12px',
                background: '#f5f7fa',
                borderRadius: '4px',
                border: '1px solid #e5e6eb'
              }}>
                {aiAnalysis.description}
              </div>
              <Button 
                type="primary" 
                block 
                icon={<DownloadOutlined />} 
                onClick={async () => {
                  await sleep(300)
                  message.success('AI 分析报告已生成（示例）')
                }}
              >
                生成分析报告
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* 趋势图表与预警信息 */}
      <Row gutter={[16, 16]} className="section-row">
        <Col xs={24} lg={16}>
          <Card title="能耗 / 成本 / 效率趋势" bordered={false} className="section-card">
            <Chart option={trendOption} height={340} />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="预警信息" bordered={false} className="section-card">
            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              <AlertItem color="red" label="高危" value={alerts.high} desc="空调能耗突增 / 设备故障" />
              <AlertItem color="orange" label="中危" value={alerts.medium} desc="照明超阈值 / 能耗突降" />
              <AlertItem color="green" label="低危" value={alerts.low} desc="轻微波动 / 关注趋势" />
              <Divider style={{ margin: '8px 0' }} />
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <Badge color="blue" text={`总计 ${alerts.total} 条`} />
                <Tooltip title="跳转预警中心">
                  <Button 
                    size="small" 
                    type="link" 
                    onClick={() => {
                      window.location.hash = '#/alerts'
                      message.info('跳转至预警中心')
                    }}
                  >
                    查看全部 →
                  </Button>
                </Tooltip>
              </Space>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

/**
 * 指标卡片组件
 */
const MetricCard = ({
  title,
  data,
}: {
  title: string
  data: { value: number; unit: string; yoy: number; mom: number }
}) => (
  <Card className="metric-card" bordered={false}>
    <div className="metric-title">{title}</div>
    <div className="metric-value">
      {data.value.toLocaleString()}
      <span className="metric-unit">{data.unit}</span>
    </div>
    <Space size={8} wrap>
      <Tag color={data.yoy > 0 ? 'red' : data.yoy < 0 ? 'green' : 'default'}>
        同比 {data.yoy > 0 ? '+' : ''}{data.yoy}%
      </Tag>
      <Tag color={data.mom > 0 ? 'red' : data.mom < 0 ? 'green' : 'default'}>
        环比 {data.mom > 0 ? '+' : ''}{data.mom}%
      </Tag>
    </Space>
  </Card>
)

/**
 * 预警项组件
 */
const AlertItem = ({ color, label, value, desc }: { color: string; label: string; value: number; desc: string }) => (
  <div className="alert-item">
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Badge 
        color={color} 
        text={
          <span style={{ fontWeight: 600, fontSize: '14px' }}>
            {label} <span style={{ fontSize: '16px', fontWeight: 700 }}>{value}</span> 条
          </span>
        } 
      />
    </div>
    <div className="alert-desc">
      <ExclamationCircleOutlined />
      <span>{desc}</span>
    </div>
  </div>
)

export default HomeView

