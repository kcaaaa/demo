/**
 * 首页 - 完全按照Figma设计稿重构
 * 设计稿：https://www.figma.com/design/k5TBKzoZJ0DPn5LobyEc20/%E9%AB%98%E9%93%81%E7%AB%99%E8%83%BD%E8%80%97%E6%BC%94%E7%A4%BA?node-id=34-2&m=dev
 */

import React, { useState } from 'react'
import { Card, Row, Col, Progress, Badge, Table, Button, Tag, Space, message, DatePicker, Select, Modal, Alert, Statistic, Divider, Tooltip } from 'antd'
import {
  ThunderboltOutlined,
  DashboardOutlined,
  DollarOutlined,
  RiseOutlined,
  DownloadOutlined,
  ReloadOutlined,
  CalendarOutlined,
  LineChartOutlined,
  CloseOutlined,
  SyncOutlined,
  EnvironmentOutlined,
  BulbOutlined,
  BarChartOutlined,
  ExperimentOutlined,
  RobotOutlined,
  FundOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  FileTextOutlined,
} from '@ant-design/icons'
import PageHeader from '../../components/PageHeader'
import Chart from '../../components/Chart'
import { exportCsv, sleep } from '../../utils/mock'
import moment from 'moment'
import './homepage.css'

const { RangePicker } = DatePicker
const { Option } = Select

const HomePage = () => {
  const [loading, setLoading] = useState(false)
  const [aiAnalysisVisible, setAiAnalysisVisible] = useState(false)
  const [selectedStations, setSelectedStations] = useState(['北京站', '上海站', '广州站'])
  const [dateRange, setDateRange] = useState<[moment.Moment, moment.Moment]>([
    moment().subtract(1, 'month'),
    moment(),
  ])
  const [analyzing, setAnalyzing] = useState(false)

  // AI分析报告状态
  const [aiReportVisible, setAiReportVisible] = useState(false)
  const [reportGenerating, setReportGenerating] = useState(false)
  const [aiReportDateRange, setAiReportDateRange] = useState<[moment.Moment, moment.Moment]>([
    moment('2025-10'),
    moment('2025-11'),
  ])
  const [aiReportStations, setAiReportStations] = useState(['北京站', '上海站', '广州站'])
  const [analysisType, setAnalysisType] = useState('comprehensive')
  const [reportGenerated, setReportGenerated] = useState(false)

  // 顶部指标数据
  const topMetrics = [
    {
      title: '总能耗',
      value: '12,406.4',
      unit: 'kWh',
      change: '+2.8%',
      icon: <ThunderboltOutlined style={{ fontSize: 24, color: '#1890ff' }} />,
      trend: 'up',
    },
    {
      title: '单位面积能耗',
      value: '8,300.5',
      unit: 'kWh/㎡',
      change: '-1.8%',
      icon: <DashboardOutlined style={{ fontSize: 24, color: '#52c41a' }} />,
      trend: 'down',
    },
    {
      title: '能耗成本',
      value: '¥9,305',
      unit: '元',
      change: '+3.2%',
      icon: <DollarOutlined style={{ fontSize: 24, color: '#faad14' }} />,
      trend: 'up',
    },
    {
      title: '能源效率',
      value: '12.3',
      unit: '%',
      change: '+0.5%',
      icon: <RiseOutlined style={{ fontSize: 24, color: '#722ed1' }} />,
      trend: 'up',
    },
  ]

  // 可选站点列表
  const availableStations = [
    '北京站', '上海站', '广州站', '深圳站', '杭州站', 
    '南京站', '武汉站', '成都站', '重庆站', '西安站',
    '天津站', '青岛站', '大连站', '沈阳站', '长春站'
  ]

  // AI总结分析数据
  const aiSummary = {
    title: `${dateRange[0].format('YYYY-MM')} 至 ${dateRange[1].format('YYYY-MM')} | 选定车站：${selectedStations.slice(0, 3).join('、')}等${selectedStations.length}个`,
    sections: [
      {
        label: '【能耗总量】',
        content: '本年度总计能耗 1,432,240 kWh，相比去年同期下降 2.8%。其中电力占比 60%，天然气 25%，水资源 15%。',
        color: '#1890ff',
      },
      {
        label: '【设备分析】',
        content: '7个设备处于预警状态，其中 3个设备的能耗值相比上周上涨超过10%，建议关注空调系统1#机组、照明系统3#回路、电梯系统2#。',
        color: '#722ed1',
      },
      {
        label: '【重要发现】',
        content: '分析发现本周光伏发电产生21,328度，较上周增长18%，有效降低了市电消耗；深夜（22:00-6:00）时段存在能耗异常，建议加强夜间巡检及部分区域控制策略。',
        color: '#52c41a',
      },
      {
        label: '【综合建议】',
        content: '建议优先排查空调和照明系统，预计可实现5-8%的节能空间。根据历史数据对比，建议在午间高峰（11:00-13:00）调整空调运行模式。',
        color: '#faad14',
      },
    ],
    metrics: [
      { label: '2日', value: 2, unit: '天', desc: '监控周期' },
      { label: '15.6%', value: 15.6, unit: '%', desc: '节能率' },
      { label: '¥1.42万', value: 14200, unit: '元', desc: '节省成本' },
      { label: '0.82', value: 0.82, unit: '', desc: '能效指标' },
    ],
  }

  // 处理站点选择
  const handleStationChange = (values: string[]) => {
    setSelectedStations(values)
  }

  // 处理时间范围变化
  const handleDateRangeChange = (dates: any) => {
    if (dates) {
      setDateRange(dates)
    }
  }

  // 开始AI分析
  const handleStartAnalysis = async () => {
    if (selectedStations.length === 0) {
      message.warning('请至少选择一个站点')
      return
    }
    setAnalyzing(true)
    await sleep(2000)
    setAnalyzing(false)
    message.success('AI分析完成')
    setAiAnalysisVisible(true)
  }

  // 快捷时间范围选择
  const handleQuickTimeRange = (type: string) => {
    let start, end
    switch (type) {
      case 'week':
        start = moment().subtract(7, 'days')
        end = moment()
        break
      case 'month':
        start = moment().subtract(1, 'month')
        end = moment()
        break
      case 'quarter':
        start = moment().subtract(3, 'months')
        end = moment()
        break
      case 'year':
        start = moment().subtract(1, 'year')
        end = moment()
        break
      default:
        return
    }
    setDateRange([start, end])
  }

  // 实时动态数据
  const liveUpdates = [
    {
      id: 1,
      icon: '🟢',
      color: 'green',
      title: '今日能耗处于优秀区间',
      desc: '当前能耗 3,287 kWh，处于历史最优20%水平，设备运行平稳',
      time: '2分钟前',
    },
    {
      id: 2,
      icon: '🟡',
      color: 'orange',
      title: '空调负荷偏高，需关注',
      desc: '候车大厅3#空调机组负荷率达92%，建议适当调整温度设定点',
      time: '5分钟前',
    },
    {
      id: 3,
      icon: '🔴',
      color: 'red',
      title: '1号主变压器温度预警',
      desc: '主变压器1#温度达85℃，已超出正常运行范围75℃，需立即现场排查',
      time: '8分钟前',
    },
  ]

  // 能耗分布数据
  const distributionData = [
    { value: 5250, name: '照明灯具', itemStyle: { color: '#36CFC9' } },
    { value: 3150, name: '电力动力', itemStyle: { color: '#5B8FF9' } },
    { value: 2100, name: '办公设备', itemStyle: { color: '#945FB9' } },
    { value: 1550, name: '其他负载', itemStyle: { color: '#FF9D4D' } },
  ]

  // 月度能耗数据
  const monthlyData = {
    months: ['1月', '2月', '3月', '4月', '5月', '6月'],
    values: [85200, 79800, 88400, 92100, 87600, 90300],
  }

  // 关键能耗指标（进度环）
  const keyIndicators = [
    { label: '峰值负荷', value: 86, color: '#1890ff', unit: '%' },
    { label: '设备利用率', value: 73, color: '#52c41a', unit: '%' },
    { label: '能耗达标率', value: 92, color: '#faad14', unit: '%' },
    { label: '系统健康度', value: 95, color: '#722ed1', unit: '%' },
  ]

  // 负荷曲线数据
  const loadCurveData = {
    hours: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    values: [
      2800, 2600, 2400, 2500, 2700, 3200, 4100, 4800, 5200, 5400, 5600, 5800,
      6000, 5900, 5700, 5500, 5300, 5100, 4900, 4500, 4200, 3800, 3400, 3000,
    ],
  }

  // 异常情况数据
  const anomalies = [
    {
      key: 1,
      station: '候车大厅',
      device: '照明系统',
      value: 18.5,
      percentage: '+12%',
      cost: '¥1,295',
      yoy: '+3.2%',
      mom: '+2.1%',
    },
    {
      key: 2,
      station: '票厅大楼',
      device: '空调系统',
      value: 45.6,
      percentage: '+8%',
      cost: '¥3,150',
      yoy: '+3.3%',
      mom: '+1.6%',
    },
    {
      key: 3,
      station: '经营区域',
      device: '电梯系统',
      value: 8.9,
      percentage: '-5%',
      cost: '¥7,360',
      yoy: '-2.8%',
      mom: '-0.5%',
    },
    {
      key: 4,
      station: '办公区域',
      device: '照明',
      value: 6.8,
      percentage: '+3%',
      cost: '¥4,780',
      yoy: '+4.2%',
      mom: '+3.1%',
    },
    {
      key: 5,
      station: '景区区域',
      device: '其他',
      value: 3.4,
      percentage: '-2%',
      cost: '¥2,380',
      yoy: '+3.2%',
      mom: '+1.2%',
    },
  ]

  // 刷新数据
  const handleRefresh = async () => {
    setLoading(true)
    await sleep(800)
    message.success('数据已刷新')
    setLoading(false)
  }

  // 导出数据
  const handleExport = () => {
    const data = [
      ['首页概览数据导出'],
      [],
      ['顶部指标'],
      ['指标名称', '数值', '单位', '同比变化'],
      ...topMetrics.map(m => [m.title, m.value, m.unit, m.change]),
      [],
      ['异常情况'],
      ['站点', '设备', '能耗值', '占比', '成本', '同比', '环比'],
      ...anomalies.map(a => [a.station, a.device, a.value, a.percentage, a.cost, a.yoy, a.mom]),
    ]
    exportCsv(data, `首页概览_${new Date().toISOString().slice(0, 10)}.csv`)
  }

  // 生成AI分析报告
  const handleGenerateReport = async () => {
    if (aiReportStations.length === 0) {
      message.warning('请至少选择一个站点')
      return
    }
    setReportGenerating(true)
    await sleep(2500)
    setReportGenerating(false)
    setReportGenerated(true)
    message.success('AI分析报告生成成功')
  }

  // 导出AI报告
  const handleExportReport = () => {
    message.success('AI分析报告已导出为PDF')
  }

  // 刷新AI报告
  const handleRefreshReport = async () => {
    setReportGenerating(true)
    await sleep(1500)
    setReportGenerating(false)
    message.success('AI分析报告已刷新')
  }

  // AI分析报告数据
  const aiReportData = {
    dataStats: {
      stationCount: aiReportStations.length,
      daysCount: aiReportDateRange[1].diff(aiReportDateRange[0], 'days'),
      deviceCount: 120,
      totalEnergy: 1250000,
    },
    keyFindings: [
      {
        id: 1,
        type: 'success',
        icon: 'lightbulb',
        title: '节能效果显著',
        description: '本期能耗较上期下降15.2%，节能措施效果明显，主要得益于空调系统优化和照明智能调控。',
        metricValue: '15.2%',
        metricTrend: 'down',
      },
      {
        id: 2,
        type: 'warning',
        icon: 'warning',
        title: '设备运行关注点',
        description: '候车大厅3号空调机组运行效率偏低，能耗占比达32%，建议进行设备检修和参数优化。',
        metricValue: '32%',
        metricTrend: 'up',
      },
      {
        id: 3,
        type: 'info',
        icon: 'info',
        title: '负荷特征分析',
        description: '工作日与非工作日能耗差异明显，周末能耗平均降低28%，建议针对性制定运行策略。',
        metricValue: '28%',
        metricTrend: 'down',
      },
    ],
    trendAnalysis: [
      {
        id: 1,
        direction: 'down',
        title: '总能耗趋势',
        description: '整体能耗呈现稳定下降趋势，月均降幅3.5%',
        change: '-12.5%',
      },
      {
        id: 2,
        direction: 'up',
        title: '能效提升趋势',
        description: '系统能源效率持续改善，效率指标提升显著',
        change: '+8.3%',
      },
    ],
    conclusions: [
      {
        id: 1,
        type: 'success',
        title: '节能策略有效',
        description: '实施的节能策略产生了显著效果，建议继续执行并扩大应用范围。预计全年可实现节能率18%，节省成本约¥142万元。',
      },
      {
        id: 2,
        type: 'warning',
        title: '设备维护建议',
        description: '部分老旧设备能耗偏高，建议制定设备更新计划。优先更换3号空调机组，预计投资回报期为2.3年。',
      },
      {
        id: 3,
        type: 'info',
        title: '运行优化方向',
        description: '基于AI预测模型，建议在高峰时段提前2小时启动预冷预热，可有效降低峰值能耗15-20%。',
      },
    ],
  }

  // ECharts配置
  const distributionOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{a}<br/>{b}: {c} kWh ({d}%)',
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      bottom: '10%',
      itemGap: 12,
    },
    series: [
      {
        name: '能耗分布',
        type: 'pie',
        radius: ['45%', '75%'],
        center: ['60%', '50%'],
        avoidLabelOverlap: true,
        label: {
          show: true,
          formatter: '{b}\n{d}%',
          fontSize: 12,
        },
        labelLine: {
          show: true,
          length: 10,
          length2: 15,
        },
        data: distributionData,
      },
    ],
  }

  const monthlyOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: '{b}<br/>{a}: {c} kWh',
    },
    xAxis: {
      type: 'category',
      data: monthlyData.months,
      axisLabel: { fontSize: 12 },
    },
    yAxis: {
      type: 'value',
      name: '能耗 (kWh)',
      axisLabel: { formatter: '{value}' },
    },
    series: [
      {
        name: '月度能耗',
        type: 'bar',
        data: monthlyData.values,
        itemStyle: {
          color: '#1890ff',
          borderRadius: [4, 4, 0, 0],
        },
        barWidth: '50%',
      },
    ],
  }

  const loadCurveOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
    },
    xAxis: {
      type: 'category',
      data: loadCurveData.hours,
      boundaryGap: false,
    },
    yAxis: {
      type: 'value',
      name: '负荷 (kW)',
    },
    series: [
      {
        name: '实时负荷',
        type: 'line',
        data: loadCurveData.values,
        smooth: true,
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(24, 144, 255, 0.4)' },
              { offset: 1, color: 'rgba(24, 144, 255, 0.05)' },
            ],
          },
        },
        lineStyle: { width: 2, color: '#1890ff' },
      },
    ],
  }

  const tableColumns = [
    { title: '名称', dataIndex: 'station', key: 'station', width: 120 },
    { title: '能耗类别', dataIndex: 'device', key: 'device', width: 120 },
    {
      title: '能耗',
      dataIndex: 'value',
      key: 'value',
      width: 100,
      render: (v: number) => `${v} kWh`,
    },
    {
      title: '占比',
      dataIndex: 'percentage',
      key: 'percentage',
      width: 80,
      render: (v: string) => (
        <Tag color={v.startsWith('+') ? 'red' : v.startsWith('-') ? 'green' : 'default'}>
          {v}
        </Tag>
      ),
    },
    { title: '成本', dataIndex: 'cost', key: 'cost', width: 100 },
    {
      title: '同期增长',
      dataIndex: 'yoy',
      key: 'yoy',
      width: 100,
      render: (v: string) => (
        <span style={{ color: v.startsWith('+') ? '#f5222d' : '#52c41a', fontWeight: 600 }}>
          {v}
        </span>
      ),
    },
    {
      title: '环比增长',
      dataIndex: 'mom',
      key: 'mom',
      width: 100,
      render: (v: string) => (
        <span style={{ color: v.startsWith('+') ? '#f5222d' : '#52c41a', fontWeight: 600 }}>
          {v}
        </span>
      ),
    },
  ]

  return (
    <div className="homepage-container">
      <PageHeader
        title="首页"
        subtitle="全局概览 · AI智能分析 · 实时监控"
        items={[{ title: '首页' }]}
        extra={
          <Space>
            <Button icon={<CalendarOutlined />}>本月</Button>
            <Button icon={<DownloadOutlined />} onClick={handleExport}>
              导出
            </Button>
            <Button type="primary" icon={<ReloadOutlined spin={loading} />} onClick={handleRefresh} loading={loading}>
              刷新
            </Button>
          </Space>
        }
      />

      {/* 顶部4个指标卡片 */}
      <Row gutter={[16, 16]} className="top-metrics-row">
        {topMetrics.map((metric, idx) => (
          <Col xs={24} sm={12} lg={6} key={idx}>
            <Card className="metric-card-top" bordered={false}>
              <div className="metric-card-inner">
                <div className="metric-icon-wrapper">{metric.icon}</div>
                <div className="metric-content">
                  <div className="metric-label">{metric.title}</div>
                  <div className="metric-value-main">
                    {metric.value} <span className="metric-unit-main">{metric.unit}</span>
                  </div>
                  <div className="metric-change">
                    <Tag color={metric.trend === 'up' ? 'red' : 'green'} style={{ fontSize: '12px', border: 'none' }}>
                      较上月 {metric.change}
                    </Tag>
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* AI汇总分析模块 - 按照Figma设计重构 */}
      <div className="ai-analysis-section" style={{ marginTop: 16 }}>
        <Card
          bordered={false}
          className="ai-analysis-card"
          style={{
            background: 'linear-gradient(135deg, #EFF6FF 0%, #EEF2FF 50%, #F5F3FF 100%)',
            border: '1px solid #DBEAFE',
            boxShadow: '0px 1px 2px -1px rgba(0, 0, 0, 0.1), 0px 1px 3px 0px rgba(0, 0, 0, 0.1)',
            borderRadius: '16px',
            padding: '25px',
          }}
        >
          {/* 标题区域 */}
          <div style={{ marginBottom: 24 }}>
            <Space>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #2B7FFF 0%, #4F39F6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0px 4px 6px -4px rgba(43, 127, 255, 0.3), 0px 10px 15px -3px rgba(43, 127, 255, 0.3)',
                }}
              >
                <LineChartOutlined style={{ fontSize: 20, color: '#fff' }} />
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#0F172B', lineHeight: '24px' }}>
                  AI汇总分析
                </div>
                <div style={{ fontSize: 14, color: '#45556C', lineHeight: '20px', marginTop: 4 }}>
                  基于时间与站点维度的智能能耗分析汇总
                </div>
              </div>
            </Space>
          </div>

          {/* 筛选控制区域 */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            {/* 时间范围选择 */}
            <Col xs={24} md={12}>
              <div
                style={{
                  background: '#fff',
                  padding: '17px',
                  borderRadius: '16px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0px 1px 2px -1px rgba(0, 0, 0, 0.1), 0px 1px 3px 0px rgba(0, 0, 0, 0.1)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <CalendarOutlined style={{ fontSize: 16, color: '#314158' }} />
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#314158' }}>分析时间范围</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <DatePicker
                    picker="month"
                    value={dateRange[0]}
                    onChange={(date) => setDateRange([date || moment(), dateRange[1]])}
                    format="YYYY-MM"
                    style={{ flex: 1, borderRadius: '12px' }}
                    placeholder="开始月份"
                  />
                  <span style={{ fontSize: 16, fontWeight: 700, color: '#90A1B9' }}>至</span>
                  <DatePicker
                    picker="month"
                    value={dateRange[1]}
                    onChange={(date) => setDateRange([dateRange[0], date || moment()])}
                    format="YYYY-MM"
                    style={{ flex: 1, borderRadius: '12px' }}
                    placeholder="结束月份"
                  />
                </div>
              </div>
            </Col>

            {/* 站点选择 */}
            <Col xs={24} md={12}>
              <div
                style={{
                  background: '#fff',
                  padding: '17px',
                  borderRadius: '16px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0px 1px 2px -1px rgba(0, 0, 0, 0.1), 0px 1px 3px 0px rgba(0, 0, 0, 0.1)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <EnvironmentOutlined style={{ fontSize: 16, color: '#314158' }} />
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#314158' }}>选择站点</span>
                  </div>
                  <span style={{ fontSize: 12, color: '#62748E' }}>已选 {selectedStations.length} 个</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {availableStations.slice(0, 8).map((station) => (
                    <Button
                      key={station}
                      size="small"
                      type={selectedStations.includes(station) ? 'primary' : 'default'}
                      style={{
                        borderRadius: '12px',
                        background: selectedStations.includes(station)
                          ? 'linear-gradient(90deg, #2B7FFF 0%, #4F39F6 100%)'
                          : '#F1F5F9',
                        border: 'none',
                        color: selectedStations.includes(station) ? '#fff' : '#45556C',
                        boxShadow: selectedStations.includes(station)
                          ? '0px 2px 4px -2px rgba(43, 127, 255, 0.3), 0px 4px 6px -1px rgba(43, 127, 255, 0.3)'
                          : 'none',
                      }}
                      onClick={() => {
                        if (selectedStations.includes(station)) {
                          setSelectedStations(selectedStations.filter((s) => s !== station))
                        } else {
                          setSelectedStations([...selectedStations, station])
                        }
                      }}
                    >
                      {station}
                    </Button>
                  ))}
                </div>
              </div>
            </Col>
          </Row>

          {/* 分析结果展示区域 */}
          <div
            style={{
              background: '#fff',
              padding: '25px',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              boxShadow: '0px 1px 2px -1px rgba(0, 0, 0, 0.1), 0px 1px 3px 0px rgba(0, 0, 0, 0.1)',
            }}
          >
            {/* 结果标题 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #2B7FFF 0%, #4F39F6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0px 4px 6px -4px rgba(43, 127, 255, 0.3), 0px 10px 15px -3px rgba(43, 127, 255, 0.3)',
                }}
              >
                <ThunderboltOutlined style={{ fontSize: 24, color: '#fff' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#0F172B', lineHeight: '24px' }}>
                  {dateRange[0].format('YYYY-MM')} 至 {dateRange[1].format('YYYY-MM')} ·{' '}
                  {selectedStations.slice(0, 2).join('、')}
                  {selectedStations.length > 2 && `等${selectedStations.length}个站点`}
                </div>
              </div>
            </div>

            {/* 4个分析卡片 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
              {/* 能耗趋势 */}
              <div
                style={{
                  background: '#EFF6FF',
                  borderLeft: '4px solid #2B7FFF',
                  padding: '16px 16px 16px 20px',
                  borderRadius: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <LineChartOutlined style={{ fontSize: 16, color: '#155DFC', marginTop: 2 }} />
                  <div style={{ flex: 1, fontSize: 14, color: '#314158', lineHeight: '20px' }}>
                    <span style={{ fontWeight: 600, display: 'inline-block', marginRight: 8 }}>能耗趋势：</span>
                    在选定时间范围内，{selectedStations.length}个站点总能耗为
                    <span style={{ color: '#155DFC', fontWeight: 600 }}> 49,712 kWh</span>
                    ，平均每站点
                    <span style={{ color: '#155DFC', fontWeight: 600 }}> 24,856 kWh</span>
                    ，整体较上期增长
                    <span style={{ color: '#E7000B', fontWeight: 600 }}> +5.2%</span>
                    。能耗最高站点为{selectedStations[0] || '国贸站'}，能耗最低站点为
                    {selectedStations[1] || '王府井站'}。
                  </div>
                </div>
              </div>

              {/* 预测分析 */}
              <div
                style={{
                  background: '#ECFDF5',
                  borderLeft: '4px solid #00BC7D',
                  padding: '16px 16px 16px 20px',
                  borderRadius: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <RiseOutlined style={{ fontSize: 13, color: '#009966', marginTop: 2 }} />
                  <div style={{ flex: 1, fontSize: 14, color: '#314158', lineHeight: '20px' }}>
                    <span style={{ fontWeight: 600, display: 'inline-block', marginRight: 8 }}>预测分析：</span>
                    基于历史数据和关联性分析，预测11月下旬能耗将呈现
                    <span style={{ color: '#009966', fontWeight: 600 }}> 下降趋势</span>
                    。客流量与能耗呈现
                    <span style={{ color: '#009966', fontWeight: 600 }}> 0.82强相关性</span>
                    （阈值0.7），气温每降低1℃预计能耗增加
                    <span style={{ color: '#155DFC', fontWeight: 600 }}> 2.3%</span>
                    。建议提前启动预热策略，预计可节约
                    <span style={{ color: '#009966', fontWeight: 600 }}> 8-12%</span>
                    能耗。
                  </div>
                </div>
              </div>

              {/* 策略推荐 */}
              <div
                style={{
                  background: '#FFFBEB',
                  borderLeft: '4px solid #FE9A00',
                  padding: '16px 16px 16px 20px',
                  borderRadius: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <BulbOutlined style={{ fontSize: 10, color: '#E17100', marginTop: 2 }} />
                  <div style={{ flex: 1, fontSize: 14, color: '#314158', lineHeight: '20px' }}>
                    <span style={{ fontWeight: 600, display: 'inline-block', marginRight: 8 }}>策略推荐：</span>
                    分析发现该时段
                    <span style={{ color: '#E17100', fontWeight: 600 }}> 照明能耗占比32%</span>
                    ，建议在日照充足区域降低照明强度30%；空调能耗与室外温度呈现强相关，建议结合天气预报提前2小时启动预冷预热；设备负荷峰值期间效率降低8%，建议分散负荷运行。综合实施预计可实现
                    <span style={{ color: '#009966', fontWeight: 600 }}> 节能率15.8%</span>
                    ，年化收益
                    <span style={{ color: '#009966', fontWeight: 600 }}> ¥142万</span>
                    。
                  </div>
                </div>
              </div>

              {/* 多站点对比 */}
              <div
                style={{
                  background: '#F5F3FF',
                  borderLeft: '4px solid #8E51FF',
                  padding: '16px 16px 16px 20px',
                  borderRadius: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <BarChartOutlined style={{ fontSize: 12, color: '#7F22FE', marginTop: 2 }} />
                  <div style={{ flex: 1, fontSize: 14, color: '#314158', lineHeight: '20px' }}>
                    <span style={{ fontWeight: 600, display: 'inline-block', marginRight: 8 }}>多站点对比：</span>
                    {selectedStations[0] || '国贸站'}能耗效率最高，单位面积能耗为
                    <span style={{ color: '#7F22FE', fontWeight: 600 }}> 8.2 kWh/㎡</span>；
                    {selectedStations[1] || '王府井站'}能耗波动最大，峰谷差达
                    <span style={{ color: '#7F22FE', fontWeight: 600 }}> 35%</span>；
                    {selectedStations[1] || '王府井站'}设备老化严重，效率仅为新设备的
                    <span style={{ color: '#E7000B', fontWeight: 600 }}> 67.5%</span>
                    。建议优先对低效站点进行设备升级改造，预计投资回报期为
                    <span style={{ color: '#009966', fontWeight: 600 }}> 2.3年</span>
                    。
                  </div>
                </div>
              </div>
            </div>

            {/* 底部统计指标 */}
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={6}>
                <div
                  style={{
                    background: 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)',
                    border: '1px solid #DDD6FF',
                    borderRadius: '12px',
                    padding: '17px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: 12, color: '#7F22FE', marginBottom: 4 }}>关联强度</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#7008E7', lineHeight: '32px' }}>0.82</div>
                  <div style={{ fontSize: 12, color: '#62748E' }}>平均值</div>
                </div>
              </Col>
              <Col xs={12} sm={6}>
                <div
                  style={{
                    background: 'linear-gradient(135deg, #ECFDF5 0%, #D0FAE5 100%)',
                    border: '1px solid #A4F4CF',
                    borderRadius: '12px',
                    padding: '17px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: 12, color: '#009966', marginBottom: 4 }}>节能潜力</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#007A55', lineHeight: '32px' }}>15.8%</div>
                  <div style={{ fontSize: 12, color: '#62748E' }}>节能率</div>
                </div>
              </Col>
              <Col xs={12} sm={6}>
                <div
                  style={{
                    background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C6 100%)',
                    border: '1px solid #FEE685',
                    borderRadius: '12px',
                    padding: '17px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: 12, color: '#E17100', marginBottom: 4 }}>预计收益</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#BB4D00', lineHeight: '32px' }}>¥142万</div>
                  <div style={{ fontSize: 12, color: '#62748E' }}>年化</div>
                </div>
              </Col>
              <Col xs={12} sm={6}>
                <div
                  style={{
                    background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
                    border: '1px solid #BEDBFF',
                    borderRadius: '12px',
                    padding: '17px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: 12, color: '#155DFC', marginBottom: 4 }}>分析报告数</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#1447E6', lineHeight: '32px' }}>28</div>
                  <div style={{ fontSize: 12, color: '#62748E' }}>份</div>
                </div>
              </Col>
            </Row>
          </div>
        </Card>
      </div>

      {/* 系统提醒 + 实时动态（右侧列） */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={24}>
          <Card title="系统提醒" bordered={false} extra={<span style={{ fontSize: '12px', color: '#62748E' }}>最新告警与通知信息</span>}>
            <div className="live-updates-list">
              {liveUpdates.map((update) => (
                <div key={update.id} className={`live-update-item live-update-${update.color}`}>
                  <div className="live-update-icon">{update.icon}</div>
                  <div className="live-update-content">
                    <div className="live-update-title">{update.title}</div>
                    <div className="live-update-desc">{update.desc}</div>
                    <div className="live-update-time">{update.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      {/* 能耗分布 + 月度能耗 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="能耗分布" bordered={false} extra={<span style={{ fontSize: '12px', color: '#86909c' }}>按设备类型分类占比</span>}>
            <Chart option={distributionOption} height={300} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="月度能耗" bordered={false} extra={<span style={{ fontSize: '12px', color: '#86909c' }}>近6个月能耗统计</span>}>
            <Chart option={monthlyOption} height={300} />
          </Card>
        </Col>
      </Row>

      {/* 关键能耗指标（进度环） */}
      <Card title="关键能耗指标" bordered={false} style={{ marginTop: 16 }} extra={<span style={{ fontSize: '12px', color: '#86909c' }}>实时运行指标</span>}>
        <Row gutter={[16, 16]}>
          {keyIndicators.map((indicator, idx) => (
            <Col xs={12} sm={12} lg={6} key={idx}>
              <div className="indicator-progress-card">
                <Progress
                  type="circle"
                  percent={indicator.value}
                  strokeColor={indicator.color}
                  width={100}
                  format={() => (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '20px', fontWeight: 700, color: indicator.color }}>
                        {indicator.value}{indicator.unit}
                      </div>
                    </div>
                  )}
                />
                <div className="indicator-label">{indicator.label}</div>
              </div>
            </Col>
          ))}
        </Row>
      </Card>

      {/* 负荷曲线 */}
      <Card title="负荷曲线分析" bordered={false} style={{ marginTop: 16 }} extra={<span style={{ fontSize: '12px', color: '#86909c' }}>24小时逐时负荷分布</span>}>
        <Chart option={loadCurveOption} height={260} />
      </Card>

      {/* 异常情况列表 */}
      <Card
        title="异常情况汇总"
        bordered={false}
        style={{ marginTop: 16 }}
        extra={
          <Button type="link" onClick={() => message.info('跳转至详情页')}>
            查看全部 →
          </Button>
        }
      >
        <Table
          dataSource={anomalies}
          columns={tableColumns}
          pagination={false}
          size="small"
        />
      </Card>

      {/* AI分析报告模块 - 独立功能 */}
      <Card
        bordered={false}
        style={{
          marginTop: 24,
          background: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 50%, #F0FDFA 100%)',
          borderRadius: '16px',
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)',
        }}
      >
        {/* 标题区域 */}
        <div style={{ marginBottom: 24 }}>
          <Space align="center">
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #0EA5E9 0%, #06B6D4 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0px 4px 12px rgba(14, 165, 233, 0.4)',
              }}
            >
              <ExperimentOutlined style={{ fontSize: 24, color: '#fff' }} />
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', lineHeight: '28px' }}>
                AI分析报告
              </div>
              <div style={{ fontSize: 14, color: '#64748B', lineHeight: '20px', marginTop: 2 }}>
                基于多维数据的AI算法分析 · 预测分析 · 策略推荐 · 决策支持
              </div>
            </div>
          </Space>
        </div>

        {/* 筛选控制区域 */}
        <Card
          bordered={false}
          style={{
            background: '#fff',
            borderRadius: '12px',
            marginBottom: 20,
            boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.06)',
          }}
        >
          <Row gutter={[16, 16]}>
            {/* 时间范围选择 */}
            <Col xs={24} md={8}>
              <div style={{ marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#334155' }}>
                <CalendarOutlined style={{ marginRight: 6 }} />
                分析时间范围
              </div>
              <Space direction="vertical" style={{ width: '100%' }}>
                <DatePicker
                  picker="month"
                  value={aiReportDateRange[0]}
                  onChange={(date) => date && setAiReportDateRange([date, aiReportDateRange[1]])}
                  format="YYYY年MM月"
                  style={{ width: '100%', borderRadius: '8px' }}
                  placeholder="开始月份"
                />
                <DatePicker
                  picker="month"
                  value={aiReportDateRange[1]}
                  onChange={(date) => date && setAiReportDateRange([aiReportDateRange[0], date])}
                  format="YYYY年MM月"
                  style={{ width: '100%', borderRadius: '8px' }}
                  placeholder="结束月份"
                />
              </Space>
            </Col>

            {/* 站点选择 */}
            <Col xs={24} md={8}>
              <div style={{ marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#334155' }}>
                <EnvironmentOutlined style={{ marginRight: 6 }} />
                选择站点（支持多选）
              </div>
              <Select
                mode="multiple"
                value={aiReportStations}
                onChange={setAiReportStations}
                style={{ width: '100%', borderRadius: '8px' }}
                placeholder="选择分析站点"
                maxTagCount={2}
                options={availableStations.map((station) => ({
                  label: station,
                  value: station,
                }))}
              />
            </Col>

            {/* 分析类型选择 */}
            <Col xs={24} md={8}>
              <div style={{ marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#334155' }}>
                <RobotOutlined style={{ marginRight: 6 }} />
                分析类型
              </div>
              <Select
                value={analysisType}
                onChange={setAnalysisType}
                style={{ width: '100%', borderRadius: '8px' }}
                options={[
                  { label: '综合分析', value: 'comprehensive' },
                  { label: '能耗趋势分析', value: 'trend' },
                  { label: '设备效率分析', value: 'efficiency' },
                  { label: '节能效果分析', value: 'saving' },
                ]}
              />
            </Col>
          </Row>

          {/* 操作按钮 */}
          <div style={{ marginTop: 16 }}>
            {/* 功能说明 */}
            <div
              style={{
                marginBottom: 12,
                padding: '12px 16px',
                background: '#F0F9FF',
                borderRadius: '8px',
                border: '1px solid #BAE6FD',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <InfoCircleOutlined style={{ fontSize: 16, color: '#0EA5E9', marginTop: 2, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#0C4A6E', marginBottom: 4 }}>
                    功能说明
                  </div>
                  <div style={{ fontSize: 12, color: '#075985', lineHeight: '1.6' }}>
                    AI分析报告将基于您选择的时间范围、站点和分析类型，运用深度学习算法进行多维度数据分析。
                    报告包含：数据来源统计、关键发现、趋势分析图表、综合结论等内容，帮助您全面了解能耗状况并制定优化策略。
                    生成时间约2-3秒，报告生成后可导出为PDF格式。
                  </div>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <Button
                onClick={() => {
                  setAiReportDateRange([moment('2025-10'), moment('2025-11')])
                  setAiReportStations(['北京站', '上海站', '广州站'])
                  setAnalysisType('comprehensive')
                  setReportGenerated(false)
                  message.info('筛选条件已重置')
                }}
              >
                重置
              </Button>
              <Button
                type="primary"
                icon={<SyncOutlined spin={reportGenerating} />}
                loading={reportGenerating}
                onClick={handleGenerateReport}
                style={{
                  background: 'linear-gradient(135deg, #0EA5E9 0%, #06B6D4 100%)',
                  border: 'none',
                  borderRadius: '8px',
                }}
              >
                生成分析报告
              </Button>
            </div>
          </div>
        </Card>

        {/* 报告结果展示区域 */}
        {reportGenerated && (
          <div style={{ animation: 'fadeIn 0.5s ease-in' }}>
            {/* 报告汇总说明 */}
            <Card
              bordered={false}
              style={{
                background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 50%, #F0F9FF 100%)',
                borderRadius: '12px',
                marginBottom: 20,
                boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.06)',
                border: '1px solid #86EFAC',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0px 4px 12px rgba(16, 185, 129, 0.3)',
                  }}
                >
                  <CheckCircleOutlined style={{ fontSize: 24, color: '#fff' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#065F46', marginBottom: 8 }}>
                    📋 报告生成完成
                  </div>
                  <div style={{ fontSize: 13, color: '#047857', lineHeight: '1.6', marginBottom: 12 }}>
                    本次AI分析报告已成功生成，基于您选择的
                    <Tag color="blue" style={{ margin: '0 4px' }}>
                      {aiReportDateRange[0].format('YYYY年MM月')} 至 {aiReportDateRange[1].format('YYYY年MM月')}
                    </Tag>
                    时间范围，对
                    <Tag color="green" style={{ margin: '0 4px' }}>
                      {aiReportStations.length}个站点
                    </Tag>
                    进行了
                    <Tag color="purple" style={{ margin: '0 4px' }}>
                      {analysisType === 'comprehensive' ? '综合分析' : analysisType === 'trend' ? '能耗趋势分析' : analysisType === 'efficiency' ? '设备效率分析' : '节能效果分析'}
                    </Tag>
                    。
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 12,
                      padding: '12px',
                      background: '#fff',
                      borderRadius: '8px',
                      border: '1px solid #D1FAE5',
                    }}
                  >
                    <div style={{ flex: '1 1 200px' }}>
                      <div style={{ fontSize: 11, color: '#6B7280', marginBottom: 4 }}>分析站点</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#065F46' }}>
                        {aiReportStations.slice(0, 3).join('、')}
                        {aiReportStations.length > 3 && `等${aiReportStations.length}个站点`}
                      </div>
                    </div>
                    <div style={{ flex: '1 1 200px' }}>
                      <div style={{ fontSize: 11, color: '#6B7280', marginBottom: 4 }}>数据覆盖</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#065F46' }}>
                        {aiReportData.dataStats.daysCount}天 · {aiReportData.dataStats.deviceCount}台设备
                      </div>
                    </div>
                    <div style={{ flex: '1 1 200px' }}>
                      <div style={{ fontSize: 11, color: '#6B7280', marginBottom: 4 }}>总能耗</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#065F46' }}>
                        {aiReportData.dataStats.totalEnergy.toLocaleString()} kWh
                      </div>
                    </div>
                    <div style={{ flex: '1 1 200px' }}>
                      <div style={{ fontSize: 11, color: '#6B7280', marginBottom: 4 }}>生成时间</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#065F46' }}>
                        {new Date().toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                  <div style={{ marginTop: 12, fontSize: 12, color: '#047857', lineHeight: '1.6' }}>
                    💡 <strong>报告内容包含：</strong>数据来源统计、关键发现（{aiReportData.keyFindings.length}项）、趋势分析图表、综合结论（{aiReportData.conclusions.length}项）等模块，您可以通过下方按钮导出PDF或查看详细分析。
                  </div>
                </div>
              </div>
            </Card>

            {/* 数据统计汇总 */}
            <Card
              bordered={false}
              style={{
                background: '#fff',
                borderRadius: '12px',
                marginBottom: 20,
                boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.06)',
              }}
            >
              <div style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 16 }}>
                📊 数据来源统计
              </div>
              <Row gutter={[16, 16]}>
                <Col xs={12} sm={6}>
                  <Statistic
                    title="涉及站点"
                    value={aiReportData.dataStats.stationCount}
                    suffix="个"
                    prefix={<EnvironmentOutlined style={{ color: '#0EA5E9' }} />}
                  />
                </Col>
                <Col xs={12} sm={6}>
                  <Statistic
                    title="分析天数"
                    value={aiReportData.dataStats.daysCount}
                    suffix="天"
                    prefix={<CalendarOutlined style={{ color: '#06B6D4' }} />}
                  />
                </Col>
                <Col xs={12} sm={6}>
                  <Statistic
                    title="设备数量"
                    value={aiReportData.dataStats.deviceCount}
                    suffix="台"
                    prefix={<DashboardOutlined style={{ color: '#8B5CF6' }} />}
                  />
                </Col>
                <Col xs={12} sm={6}>
                  <Statistic
                    title="总能耗"
                    value={aiReportData.dataStats.totalEnergy}
                    suffix="kWh"
                    prefix={<ThunderboltOutlined style={{ color: '#F59E0B' }} />}
                  />
                </Col>
              </Row>
            </Card>

            {/* 关键发现展示 */}
            <Card
              bordered={false}
              style={{
                background: '#fff',
                borderRadius: '12px',
                marginBottom: 20,
                boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.06)',
              }}
            >
              <div style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 16 }}>
                💡 关键发现
              </div>
              <Space direction="vertical" style={{ width: '100%' }} size={12}>
                {aiReportData.keyFindings.map((finding) => (
                  <Alert
                    key={finding.id}
                    message={
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 600 }}>{finding.title}</span>
                        <Tag
                          color={finding.metricTrend === 'down' ? 'green' : 'red'}
                          style={{ fontSize: '14px', fontWeight: 600 }}
                        >
                          {finding.metricTrend === 'down' ? <ArrowDownOutlined /> : <ArrowUpOutlined />}{' '}
                          {finding.metricValue}
                        </Tag>
                      </div>
                    }
                    description={finding.description}
                    type={finding.type as 'success' | 'info' | 'warning' | 'error'}
                    showIcon
                    style={{ borderRadius: '8px' }}
                  />
                ))}
              </Space>
            </Card>

            {/* 趋势分析展示 */}
            <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
              <Col xs={24} lg={16}>
                <Card
                  bordered={false}
                  style={{
                    background: '#fff',
                    borderRadius: '12px',
                    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.06)',
                  }}
                >
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 16 }}>
                    📈 趋势分析图表
                  </div>
                  <Chart
                    option={{
                      tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
                      legend: { data: ['能耗趋势', '效率趋势'], bottom: 0 },
                      xAxis: {
                        type: 'category',
                        data: ['10-01', '10-08', '10-15', '10-22', '10-29', '11-05', '11-12', '11-19', '11-26'],
                      },
                      yAxis: [
                        { type: 'value', name: '能耗(kWh)' },
                        { type: 'value', name: '效率(%)', max: 100 },
                      ],
                      series: [
                        {
                          name: '能耗趋势',
                          type: 'line',
                          data: [45000, 43500, 42000, 40500, 39000, 37500, 36000, 35000, 34000],
                          smooth: true,
                          areaStyle: { color: 'rgba(14, 165, 233, 0.15)' },
                          lineStyle: { color: '#0EA5E9', width: 3 },
                        },
                        {
                          name: '效率趋势',
                          type: 'line',
                          yAxisIndex: 1,
                          data: [82, 83, 84, 85, 86, 87, 88, 89, 90],
                          smooth: true,
                          lineStyle: { color: '#10B981', width: 3 },
                        },
                      ],
                    }}
                    height={300}
                  />
                </Card>
              </Col>

              <Col xs={24} lg={8}>
                <Card
                  bordered={false}
                  style={{
                    background: '#fff',
                    borderRadius: '12px',
                    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.06)',
                    height: '100%',
                  }}
                >
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 16 }}>
                    📊 趋势洞察
                  </div>
                  <Space direction="vertical" style={{ width: '100%' }} size={16}>
                    {aiReportData.trendAnalysis.map((trend) => (
                      <div
                        key={trend.id}
                        style={{
                          padding: '16px',
                          background: trend.direction === 'down' ? '#F0FDF4' : '#FEF3C7',
                          borderRadius: '8px',
                          border: `1px solid ${trend.direction === 'down' ? '#BBF7D0' : '#FDE68A'}`,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                          {trend.direction === 'down' ? (
                            <ArrowDownOutlined style={{ fontSize: 20, color: '#10B981', marginRight: 8 }} />
                          ) : (
                            <ArrowUpOutlined style={{ fontSize: 20, color: '#F59E0B', marginRight: 8 }} />
                          )}
                          <span style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>{trend.title}</span>
                        </div>
                        <div style={{ fontSize: 13, color: '#64748B', marginBottom: 8 }}>{trend.description}</div>
                        <Tag
                          color={trend.direction === 'down' ? 'green' : 'orange'}
                          style={{ fontSize: '16px', fontWeight: 700 }}
                        >
                          {trend.change}
                        </Tag>
                      </div>
                    ))}
                  </Space>
                </Card>
              </Col>
            </Row>

            {/* 综合结论报告 */}
            <Card
              bordered={false}
              style={{
                background: '#fff',
                borderRadius: '12px',
                marginBottom: 20,
                boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.06)',
              }}
            >
              <div style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 16 }}>
                📝 综合结论
              </div>
              <Space direction="vertical" style={{ width: '100%' }} size={12}>
                {aiReportData.conclusions.map((conclusion) => (
                  <Alert
                    key={conclusion.id}
                    message={conclusion.title}
                    description={conclusion.description}
                    type={conclusion.type as 'success' | 'info' | 'warning' | 'error'}
                    showIcon
                    style={{ borderRadius: '8px' }}
                  />
                ))}
              </Space>
            </Card>

            {/* 操作按钮组 */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <Button
                icon={<FileTextOutlined />}
                onClick={() => setAiReportVisible(true)}
                style={{ borderRadius: '8px' }}
              >
                详细分析
              </Button>
              <Button icon={<DownloadOutlined />} onClick={handleExportReport} style={{ borderRadius: '8px' }}>
                导出报告
              </Button>
              <Button
                type="primary"
                icon={<ReloadOutlined spin={reportGenerating} />}
                loading={reportGenerating}
                onClick={handleRefreshReport}
                style={{
                  background: 'linear-gradient(135deg, #0EA5E9 0%, #06B6D4 100%)',
                  border: 'none',
                  borderRadius: '8px',
                }}
              >
                刷新分析
              </Button>
            </div>
          </div>
        )}

        {/* 未生成报告提示 */}
        {!reportGenerated && (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              background: '#fff',
              borderRadius: '12px',
              boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.06)',
            }}
          >
            <ExperimentOutlined style={{ fontSize: 64, color: '#CBD5E1', marginBottom: 16 }} />
            <div style={{ fontSize: 16, color: '#64748B', marginBottom: 8 }}>
              请配置筛选条件并点击"生成分析报告"按钮
            </div>
            <div style={{ fontSize: 14, color: '#94A3B8' }}>
              AI将基于多维度数据进行深度分析，生成个性化的分析报告
            </div>
          </div>
        )}
      </Card>

      {/* AI分析报告详细弹窗 */}
      <Modal
        title="AI分析报告 - 详细分析"
        visible={aiReportVisible}
        onCancel={() => setAiReportVisible(false)}
        width={1200}
        footer={[
          <Button key="export" icon={<DownloadOutlined />} onClick={handleExportReport}>
            导出PDF
          </Button>,
          <Button key="close" type="primary" onClick={() => setAiReportVisible(false)}>
            关闭
          </Button>,
        ]}
      >
        <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {/* 预测分析模块 */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FundOutlined style={{ color: '#0EA5E9' }} />
              预测分析
            </h3>
            <Card size="small">
              <p>
                基于LSTM深度学习模型，预测未来7天能耗趋势。预测准确率达92%，置信度0.85。预计未来一周能耗将下降8-12%，主要受气温回升和节假日因素影响。
              </p>
              <Chart
                option={{
                  tooltip: { trigger: 'axis' },
                  legend: { data: ['历史数据', '预测数据'] },
                  xAxis: {
                    type: 'category',
                    data: ['今天', '+1天', '+2天', '+3天', '+4天', '+5天', '+6天', '+7天'],
                  },
                  yAxis: { type: 'value', name: '能耗(kWh)' },
                  series: [
                    {
                      name: '历史数据',
                      type: 'line',
                      data: [34000, null, null, null, null, null, null, null],
                      lineStyle: { color: '#0EA5E9', width: 3 },
                    },
                    {
                      name: '预测数据',
                      type: 'line',
                      data: [34000, 33200, 32500, 31800, 31000, 30500, 30200, 29800],
                      lineStyle: { color: '#8B5CF6', width: 3, type: 'dashed' },
                      areaStyle: { color: 'rgba(139, 92, 246, 0.1)' },
                    },
                  ],
                }}
                height={250}
              />
            </Card>
          </div>

          {/* 关联性分析模块 */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <DashboardOutlined style={{ color: '#06B6D4' }} />
              关联性分析
            </h3>
            <Row gutter={[12, 12]}>
              <Col span={12}>
                <Card size="small" title="设备关联分析">
                  <p>空调系统与照明系统能耗呈强正相关（r=0.78），建议协同优化控制策略。</p>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" title="环境关联分析">
                  <p>室外温度与总能耗相关系数0.82，每升温1℃能耗增加2.3%。</p>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" title="时间关联分析">
                  <p>工作日能耗比周末高28%，夜间（22:00-6:00）能耗占比仅12%。</p>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" title="成本关联分析">
                  <p>能耗成本与运行时长呈线性关系，优化运行时段可降低成本15%。</p>
                </Card>
              </Col>
            </Row>
          </div>

          {/* 策略推荐模块 */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <BulbOutlined style={{ color: '#F59E0B' }} />
              策略推荐
            </h3>
            <Space direction="vertical" style={{ width: '100%' }} size={8}>
              <Alert
                message="设备优化策略"
                description="建议调整空调系统运行参数，将设定温度上调1℃，预计节能8-12%，年节省成本¥8.5万。"
                type="success"
                showIcon
              />
              <Alert
                message="运行优化策略"
                description="在低负荷时段（22:00-6:00）降低照明强度50%，预计节能5-8%，不影响安全照明需求。"
                type="info"
                showIcon
              />
              <Alert
                message="管理优化策略"
                description="建立能耗实时监控机制，设置阈值预警，及时发现和处理异常能耗。"
                type="warning"
                showIcon
              />
            </Space>
          </div>

          {/* 影响分析模块 */}
          <div>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <RiseOutlined style={{ color: '#10B981' }} />
              影响分析
            </h3>
            <Row gutter={[12, 12]}>
              <Col span={12}>
                <Card size="small">
                  <Statistic
                    title="经济效益"
                    value={142000}
                    prefix="¥"
                    suffix="/ 年"
                    valueStyle={{ color: '#10B981' }}
                  />
                  <p style={{ fontSize: 12, color: '#64748B', marginTop: 8 }}>投资回报期：2.3年</p>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small">
                  <Statistic
                    title="环境效益"
                    value={150}
                    suffix="吨CO₂"
                    valueStyle={{ color: '#06B6D4' }}
                  />
                  <p style={{ fontSize: 12, color: '#64748B', marginTop: 8 }}>年碳减排量</p>
                </Card>
              </Col>
            </Row>
          </div>
        </div>
      </Modal>

      {/* AI详细分析结果弹窗 */}
      <Modal
        title="AI汇总分析详细报告"
        visible={aiAnalysisVisible}
        onCancel={() => setAiAnalysisVisible(false)}
        width={1200}
        footer={[
          <Button key="export" icon={<DownloadOutlined />} onClick={() => message.success('报告已导出')}>
            导出PDF
          </Button>,
          <Button key="exportExcel" icon={<DownloadOutlined />} onClick={() => message.success('数据已导出')}>
            导出Excel
          </Button>,
          <Button key="close" type="primary" onClick={() => setAiAnalysisVisible(false)}>
            关闭
          </Button>,
        ]}
        className="ai-analysis-modal"
      >
        {/* 分析概览 */}
        <div className="analysis-section">
          <h3>📊 分析概览</h3>
          <Row gutter={[16, 16]}>
            <Col span={6}>
              <div className="analysis-stat-card">
                <div className="stat-value">1,432,240</div>
                <div className="stat-label">总能耗 (kWh)</div>
                <div className="stat-change" style={{ color: '#52c41a' }}>↓ 2.8%</div>
              </div>
            </Col>
            <Col span={6}>
              <div className="analysis-stat-card">
                <div className="stat-value">¥1,245,680</div>
                <div className="stat-label">总成本 (元)</div>
                <div className="stat-change" style={{ color: '#52c41a' }}>↓ 3.5%</div>
              </div>
            </Col>
            <Col span={6}>
              <div className="analysis-stat-card">
                <div className="stat-value">85.2%</div>
                <div className="stat-label">能源效率</div>
                <div className="stat-change" style={{ color: '#52c41a' }}>↑ 1.2%</div>
              </div>
            </Col>
            <Col span={6}>
              <div className="analysis-stat-card">
                <div className="stat-value">7</div>
                <div className="stat-label">异常事件</div>
                <div className="stat-change" style={{ color: '#f5222d' }}>↑ 2</div>
              </div>
            </Col>
          </Row>
        </div>

        {/* 时间趋势分析 */}
        <div className="analysis-section">
          <h3>📈 时间趋势分析</h3>
          <Chart 
            option={{
              tooltip: { trigger: 'axis' },
              legend: { data: ['能耗', '成本', '效率'] },
              xAxis: { 
                type: 'category', 
                data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'] 
              },
              yAxis: [
                { type: 'value', name: '能耗(kWh)', position: 'left' },
                { type: 'value', name: '效率(%)', position: 'right', max: 100 }
              ],
              series: [
                {
                  name: '能耗',
                  type: 'line',
                  data: [120000, 115000, 125000, 130000, 128000, 135000, 140000, 138000, 142000, 145000, 143000, 148000],
                  smooth: true,
                  itemStyle: { color: '#1890ff' }
                },
                {
                  name: '效率',
                  type: 'line',
                  yAxisIndex: 1,
                  data: [82, 83, 84, 85, 84, 86, 87, 85, 86, 87, 86, 88],
                  smooth: true,
                  itemStyle: { color: '#52c41a' }
                }
              ]
            }}
            height={280}
          />
        </div>

        {/* 站点对比分析 */}
        <div className="analysis-section">
          <h3>🏢 站点对比分析</h3>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Chart 
                option={{
                  tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
                  xAxis: { type: 'category', data: selectedStations.slice(0, 5) },
                  yAxis: { type: 'value', name: '能耗(kWh)' },
                  series: [{
                    name: '站点能耗',
                    type: 'bar',
                    data: [128000, 135000, 142000, 138000, 145000],
                    itemStyle: { 
                      color: (params: any) => {
                        const colors = ['#1890ff', '#52c41a', '#faad14', '#722ed1', '#eb2f96']
                        return colors[params.dataIndex]
                      }
                    }
                  }]
                }}
                height={250}
              />
            </Col>
            <Col span={12}>
              <Chart 
                option={{
                  tooltip: { trigger: 'item' },
                  legend: { orient: 'vertical', left: 'left' },
                  series: [{
                    name: '能耗占比',
                    type: 'pie',
                    radius: ['40%', '70%'],
                    data: selectedStations.slice(0, 5).map((station, idx) => ({
                      value: [128, 135, 142, 138, 145][idx],
                      name: station
                    }))
                  }]
                }}
                height={250}
              />
            </Col>
          </Row>
        </div>

        {/* 异常检测分析 */}
        <div className="analysis-section">
          <h3>⚠️ 异常检测分析</h3>
          <Table
            dataSource={[
              { key: 1, time: '2024-12-25 14:30', station: '北京站', type: '能耗突增', level: '高危', detail: '空调系统能耗突增35%' },
              { key: 2, time: '2024-12-26 09:15', station: '上海站', type: '设备异常', level: '中危', detail: '照明系统部分区域断电' },
              { key: 3, time: '2024-12-27 16:45', station: '广州站', type: '能耗波动', level: '低危', detail: '电梯能耗轻微波动' },
            ]}
            columns={[
              { title: '时间', dataIndex: 'time', key: 'time', width: 180 },
              { title: '站点', dataIndex: 'station', key: 'station', width: 120 },
              { title: '类型', dataIndex: 'type', key: 'type', width: 120 },
              { 
                title: '等级', 
                dataIndex: 'level', 
                key: 'level', 
                width: 100,
                render: (level: string) => (
                  <Tag color={level === '高危' ? 'red' : level === '中危' ? 'orange' : 'blue'}>
                    {level}
                  </Tag>
                )
              },
              { title: '详情', dataIndex: 'detail', key: 'detail' },
            ]}
            pagination={false}
            size="small"
          />
        </div>

        {/* 优化建议 */}
        <div className="analysis-section">
          <h3>💡 优化建议</h3>
          <div className="recommendation-list">
            <div className="recommendation-item">
              <Badge status="success" />
              <span><strong>空调系统优化：</strong>建议在午间高峰期（11:00-13:00）调整温度设定，预计可节能5-8%</span>
            </div>
            <div className="recommendation-item">
              <Badge status="processing" />
              <span><strong>照明系统改造：</strong>建议更换LED灯具，预计年节省费用约12万元</span>
            </div>
            <div className="recommendation-item">
              <Badge status="warning" />
              <span><strong>设备维护计划：</strong>建议对3台设备进行重点维护，避免能耗异常</span>
            </div>
            <div className="recommendation-item">
              <Badge status="error" />
              <span><strong>能源管理制度：</strong>建议加强夜间能源管理，减少非必要能耗</span>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default HomePage

