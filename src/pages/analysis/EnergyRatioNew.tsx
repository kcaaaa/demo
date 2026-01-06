/**
 * 能耗占比分析 - 按照Figma设计稿完全重构
 * 设计稿：https://www.figma.com/design/k5TBKzoZJ0DPn5LobyEc20/%E9%AB%98%E9%93%81%E7%AB%99%E8%83%BD%E8%80%97%E6%BC%94%E7%A4%BA?node-id=34-5&m=dev
 */

import React, { useState } from 'react'
import { Card, Row, Col, Button, Space, Select, Table, message, Progress, Tag } from 'antd'
import {
  SearchOutlined,
  ReloadOutlined,
  DownloadOutlined,
} from '@ant-design/icons'
import PageHeader from '../../components/PageHeader'
import Chart from '../../components/Chart'
import { exportCsv, sleep } from '../../utils/mock'
import './energyratio.css'

// 根据分析维度生成差异化数据
const generateDimensionData = (dimension: string) => {
  if (dimension === 'area') {
    // 按区域分析
    return {
      topMetrics: [
        { title: '能源总体占比', percentage: 100, change: '+0.0%', color: '#1890ff', trend: 'stable' },
        { title: '候车大厅占比', percentage: 38, change: '+2.3%', color: '#f5222d', trend: 'up' },
        { title: '办公区域占比', percentage: 27, change: '+1.5%', color: '#52c41a', trend: 'up' },
        { title: '商业区域占比', percentage: 20, change: '-0.8%', color: '#faad14', trend: 'down' },
      ],
      pieData: [
        { value: 3825, name: '候车工程', itemStyle: { color: '#5B8FF9' } },
        { value: 2650, name: '办公区域', itemStyle: { color: '#5AD8A6' } },
        { value: 1980, name: '景区区域', itemStyle: { color: '#945FB9' } },
        { value: 1470, name: '其他场地', itemStyle: { color: '#FF9D4D' } },
      ],
      barCategories: ['商务中心', '未来大楼', '经营区域', '优质区'],
      barLastMonth: [28, 24, 20, 15],
      barThisMonth: [26, 22, 18, 14],
      radarIndicators: [
        { name: '候车大厅', max: 100 },
        { name: '办公区域', max: 100 },
        { name: '商业区域', max: 100 },
        { name: '站台区域', max: 100 },
        { name: '其他区域', max: 100 },
      ],
      radarData: [
        { value: [75, 80, 70, 85, 65], name: '上月' },
        { value: [85, 88, 82, 90, 72], name: '本月' },
      ],
      energyTypes: [
        { name: '候车大厅', percentage: 38, color: '#1890ff' },
        { name: '办公区域', percentage: 27, color: '#52c41a' },
        { name: '商业区域', percentage: 20, color: '#722ed1' },
        { name: '其他区域', percentage: 15, color: '#faad14' },
      ],
      trendData: {
        legend: ['候车大厅', '办公区域', '商业区域'],
        series: [
          { name: '候车大厅', data: [8000, 7800, 8200, 8500, 8400, 8700, 8900, 8800, 9000, 9200, 9100, 9300], color: '#1890ff' },
          { name: '办公区域', data: [5500, 5400, 5600, 5800, 5700, 6000, 6100, 6000, 6200, 6400, 6300, 6500], color: '#52c41a' },
          { name: '商业区域', data: [4200, 4100, 4300, 4500, 4400, 4600, 4700, 4650, 4800, 4900, 4850, 5000], color: '#722ed1' },
        ],
      },
      detailData: [
        { key: 1, name: '候车大厅', energy: '12500 kWh', percentage: '38%', cost: '¥10,625', yoy: '+3.2%', mom: '+2.1%' },
        { key: 2, name: '办公区域', energy: '8900 kWh', percentage: '27%', cost: '¥7,565', yoy: '+2.5%', mom: '+1.6%' },
        { key: 3, name: '商业区域', energy: '6600 kWh', percentage: '20%', cost: '¥5,610', yoy: '-1.2%', mom: '-0.5%' },
        { key: 4, name: '站台区域', energy: '3200 kWh', percentage: '10%', cost: '¥2,720', yoy: '+1.8%', mom: '+0.8%' },
        { key: 5, name: '其他区域', energy: '1650 kWh', percentage: '5%', cost: '¥1,403', yoy: '+0.5%', mom: '+0.2%' },
      ],
    }
  } else if (dimension === 'device') {
    // 按设备类型分析
    return {
      topMetrics: [
        { title: '能源总体占比', percentage: 100, change: '+0.0%', color: '#1890ff', trend: 'stable' },
        { title: '空调系统占比', percentage: 45, change: '+3.5%', color: '#f5222d', trend: 'up' },
        { title: '照明系统占比', percentage: 30, change: '+2.1%', color: '#52c41a', trend: 'up' },
        { title: '电梯系统占比', percentage: 12, change: '+0.5%', color: '#faad14', trend: 'up' },
      ],
      pieData: [
        { value: 4500, name: '空调系统', itemStyle: { color: '#5B8FF9' } },
        { value: 3000, name: '照明系统', itemStyle: { color: '#5AD8A6' } },
        { value: 1200, name: '电梯系统', itemStyle: { color: '#945FB9' } },
        { value: 1300, name: '其他设备', itemStyle: { color: '#FF9D4D' } },
      ],
      barCategories: ['空调系统', '照明系统', '电梯系统', '供电系统'],
      barLastMonth: [45, 30, 12, 8],
      barThisMonth: [48, 32, 13, 9],
      radarIndicators: [
        { name: '空调系统', max: 100 },
        { name: '照明系统', max: 100 },
        { name: '电梯系统', max: 100 },
        { name: '供电系统', max: 100 },
        { name: '其他设备', max: 100 },
      ],
      radarData: [
        { value: [85, 75, 60, 70, 55], name: '上月' },
        { value: [92, 85, 68, 78, 65], name: '本月' },
      ],
      energyTypes: [
        { name: '空调系统', percentage: 45, color: '#1890ff' },
        { name: '照明系统', percentage: 30, color: '#52c41a' },
        { name: '电梯系统', percentage: 12, color: '#722ed1' },
        { name: '其他设备', percentage: 13, color: '#faad14' },
      ],
      trendData: {
        legend: ['空调系统', '照明系统', '电梯系统'],
        series: [
          { name: '空调系统', data: [9500, 9200, 9600, 10000, 9800, 10200, 10500, 10300, 10600, 10800, 10700, 11000], color: '#1890ff' },
          { name: '照明系统', data: [6300, 6100, 6400, 6600, 6500, 6800, 6900, 6850, 7000, 7200, 7100, 7300], color: '#52c41a' },
          { name: '电梯系统', data: [2500, 2450, 2550, 2600, 2580, 2650, 2700, 2680, 2750, 2800, 2780, 2850], color: '#722ed1' },
        ],
      },
      detailData: [
        { key: 1, name: '空调系统', energy: '14850 kWh', percentage: '45%', cost: '¥12,623', yoy: '+3.5%', mom: '+2.8%' },
        { key: 2, name: '照明系统', energy: '9900 kWh', percentage: '30%', cost: '¥8,415', yoy: '+2.1%', mom: '+1.5%' },
        { key: 3, name: '电梯系统', energy: '3960 kWh', percentage: '12%', cost: '¥3,366', yoy: '+0.5%', mom: '+0.3%' },
        { key: 4, name: '供电系统', energy: '2640 kWh', percentage: '8%', cost: '¥2,244', yoy: '+1.2%', mom: '+0.8%' },
        { key: 5, name: '其他设备', energy: '1650 kWh', percentage: '5%', cost: '¥1,403', yoy: '+0.8%', mom: '+0.4%' },
      ],
    }
  } else if (dimension === 'time') {
    // 按时间周期分析
    return {
      topMetrics: [
        { title: '能源总体占比', percentage: 100, change: '+0.0%', color: '#1890ff', trend: 'stable' },
        { title: '高峰时段占比', percentage: 42, change: '+4.2%', color: '#f5222d', trend: 'up' },
        { title: '平峰时段占比', percentage: 35, change: '+1.8%', color: '#52c41a', trend: 'up' },
        { title: '低峰时段占比', percentage: 23, change: '-2.5%', color: '#faad14', trend: 'down' },
      ],
      pieData: [
        { value: 4200, name: '高峰时段', itemStyle: { color: '#5B8FF9' } },
        { value: 3500, name: '平峰时段', itemStyle: { color: '#5AD8A6' } },
        { value: 2300, name: '低峰时段', itemStyle: { color: '#945FB9' } },
      ],
      barCategories: ['0-6时', '6-12时', '12-18时', '18-24时'],
      barLastMonth: [18, 35, 32, 25],
      barThisMonth: [16, 38, 35, 27],
      radarIndicators: [
        { name: '高峰时段', max: 100 },
        { name: '平峰时段', max: 100 },
        { name: '低峰时段', max: 100 },
        { name: '夜间时段', max: 100 },
        { name: '节假日', max: 100 },
      ],
      radarData: [
        { value: [90, 75, 55, 45, 60], name: '上月' },
        { value: [95, 82, 62, 52, 68], name: '本月' },
      ],
      energyTypes: [
        { name: '高峰时段', percentage: 42, color: '#1890ff' },
        { name: '平峰时段', percentage: 35, color: '#52c41a' },
        { name: '低峰时段', percentage: 23, color: '#722ed1' },
      ],
      trendData: {
        legend: ['高峰时段', '平峰时段', '低峰时段'],
        series: [
          { name: '高峰时段', data: [8800, 8600, 9000, 9300, 9100, 9500, 9700, 9600, 9800, 10000, 9900, 10200], color: '#1890ff' },
          { name: '平峰时段', data: [7300, 7100, 7400, 7700, 7500, 7900, 8000, 7950, 8100, 8300, 8200, 8500], color: '#52c41a' },
          { name: '低峰时段', data: [4800, 4700, 4900, 5100, 5000, 5200, 5300, 5250, 5400, 5600, 5500, 5700], color: '#722ed1' },
        ],
      },
      detailData: [
        { key: 1, name: '高峰时段(7-9时)', energy: '8820 kWh', percentage: '42%', cost: '¥7,497', yoy: '+4.2%', mom: '+3.5%' },
        { key: 2, name: '平峰时段(9-17时)', energy: '7350 kWh', percentage: '35%', cost: '¥6,248', yoy: '+1.8%', mom: '+1.2%' },
        { key: 3, name: '低峰时段(17-22时)', energy: '4830 kWh', percentage: '23%', cost: '¥4,106', yoy: '-2.5%', mom: '-1.8%' },
      ],
    }
  } else {
    // 按能源类型分析
    return {
      topMetrics: [
        { title: '能源总体占比', percentage: 100, change: '+0.0%', color: '#1890ff', trend: 'stable' },
        { title: '电力能源占比', percentage: 65, change: '+2.8%', color: '#f5222d', trend: 'up' },
        { title: '天然气占比', percentage: 20, change: '+1.2%', color: '#52c41a', trend: 'up' },
        { title: '供暖占比', percentage: 15, change: '-1.5%', color: '#faad14', trend: 'down' },
      ],
      pieData: [
        { value: 6500, name: '电力能源', itemStyle: { color: '#5B8FF9' } },
        { value: 2000, name: '天然气', itemStyle: { color: '#5AD8A6' } },
        { value: 1500, name: '供暖', itemStyle: { color: '#945FB9' } },
      ],
      barCategories: ['电力', '天然气', '供暖', '其他'],
      barLastMonth: [63, 22, 18, 7],
      barThisMonth: [65, 20, 15, 10],
      radarIndicators: [
        { name: '电力能源', max: 100 },
        { name: '天然气', max: 100 },
        { name: '供暖', max: 100 },
        { name: '用水', max: 100 },
        { name: '其他能源', max: 100 },
      ],
      radarData: [
        { value: [88, 70, 65, 55, 48], name: '上月' },
        { value: [92, 78, 72, 62, 55], name: '本月' },
      ],
      energyTypes: [
        { name: '电力能源', percentage: 65, color: '#1890ff' },
        { name: '天然气', percentage: 20, color: '#52c41a' },
        { name: '供暖', percentage: 15, color: '#722ed1' },
      ],
      trendData: {
        legend: ['电力能源', '天然气', '供暖'],
        series: [
          { name: '电力能源', data: [13600, 13200, 13800, 14200, 14000, 14500, 14800, 14600, 15000, 15300, 15100, 15600], color: '#1890ff' },
          { name: '天然气', data: [4200, 4000, 4300, 4400, 4350, 4550, 4600, 4570, 4700, 4850, 4800, 5000], color: '#52c41a' },
          { name: '供暖', data: [3150, 3050, 3200, 3300, 3250, 3400, 3450, 3420, 3500, 3600, 3570, 3700], color: '#722ed1' },
        ],
      },
      detailData: [
        { key: 1, name: '电力能源', energy: '21450 kWh', percentage: '65%', cost: '¥18,233', yoy: '+2.8%', mom: '+2.2%' },
        { key: 2, name: '天然气', energy: '6600 kWh', percentage: '20%', cost: '¥5,610', yoy: '+1.2%', mom: '+0.8%' },
        { key: 3, name: '供暖', energy: '4950 kWh', percentage: '15%', cost: '¥4,208', yoy: '-1.5%', mom: '-1.0%' },
      ],
    }
  }
}

const EnergyRatioNew = () => {
  const [loading, setLoading] = useState(false)
  const [selectedDimension, setSelectedDimension] = useState('area')

  // 根据选择的维度生成数据
  const dimensionData = generateDimensionData(selectedDimension)

  // 顶部4个进度环指标
  const topProgressMetrics = dimensionData.topMetrics

  // 区域能耗占比数据（饼图）
  const areaDistributionData = dimensionData.pieData

  // 建设年份能耗对比数据（柱状图分组）
  const yearComparisonData = {
    categories: dimensionData.barCategories,
    lastMonth: dimensionData.barLastMonth,
    thisMonth: dimensionData.barThisMonth,
  }

  // 多维度雷达图数据
  const radarIndicators = dimensionData.radarIndicators

  const radarData = dimensionData.radarData

  // 能源类型占比（横向进度条）
  const energyTypesData = dimensionData.energyTypes

  // 能耗趋势对比（折线图）
  const trendComparisonData = {
    months: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    ...dimensionData.trendData,
  }

  // 详细数据表格
  const detailData = dimensionData.detailData

  // 查询
  const handleQuery = async () => {
    setLoading(true)
    await sleep(500)
    const dimensionText = selectedDimension === 'area' ? '按区域分析' : 
                          selectedDimension === 'device' ? '按设备类型' :
                          selectedDimension === 'time' ? '按时间周期' : '按能源类型'
    message.success(`查询成功：${dimensionText}`)
    setLoading(false)
  }

  // 重置
  const handleReset = () => {
    setSelectedDimension('area')
    message.info('已重置筛选条件')
  }
  
  // 切换分析维度
  const handleDimensionChange = (value: string) => {
    setSelectedDimension(value)
    const dimensionText = value === 'area' ? '按区域分析' : 
                          value === 'device' ? '按设备类型' :
                          value === 'time' ? '按时间周期' : '按能源类型'
    message.info(`切换至${dimensionText}`)
  }

  // 导出CSV
  const handleExportCsv = () => {
    const data = [
      ['能耗占比分析数据导出'],
      [],
      ['分析维度', selectedDimension === 'area' ? '按区域' : '按设备类型'],
      [],
      ['顶部指标'],
      ['指标名称', '百分比', '同比变化'],
      ...topProgressMetrics.map(m => [m.title, `${m.percentage}%`, m.change]),
      [],
      ['详细数据'],
      ['名称', '能耗', '占比', '成本', '同比', '环比'],
      ...detailData.map(d => [d.name, d.energy, d.percentage, d.cost, d.yoy, d.mom]),
    ]
    exportCsv(data, `能耗占比分析_${new Date().toISOString().slice(0, 10)}.csv`)
  }

  // ECharts配置
  const areaDistributionOption = {
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
        name: '区域能耗占比',
        type: 'pie',
        radius: ['45%', '70%'],
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
        data: areaDistributionData,
      },
    ],
  }

  const yearComparisonOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
    },
    legend: {
      data: ['上月', '本月'],
      top: 0,
    },
    grid: {
      left: 80,
      right: 40,
      bottom: 30,
      top: 40,
    },
    xAxis: {
      type: 'category',
      data: yearComparisonData.categories,
      axisLabel: { fontSize: 12 },
    },
    yAxis: {
      type: 'value',
      name: '能耗 (千kWh)',
    },
    series: [
      {
        name: '上月',
        type: 'bar',
        data: yearComparisonData.lastMonth,
        itemStyle: { color: '#c9cdd4' },
        barWidth: 20,
      },
      {
        name: '本月',
        type: 'bar',
        data: yearComparisonData.thisMonth,
        itemStyle: { color: '#1890ff' },
        barWidth: 20,
      },
    ],
  }

  const radarOption = {
    tooltip: {},
    legend: {
      data: radarData.map(d => d.name),
      bottom: 0,
    },
    radar: {
      indicator: radarIndicators,
      shape: 'polygon',
      splitNumber: 5,
      name: {
        textStyle: {
          color: '#4e5969',
        },
      },
      splitLine: {
        lineStyle: {
          color: '#e8e8e8',
        },
      },
      splitArea: {
        show: true,
        areaStyle: {
          color: ['#f5f7fa', '#fafbfc'],
        },
      },
    },
    series: [
      {
        name: '多维度能耗对比',
        type: 'radar',
        data: radarData.map((d, idx) => ({
          value: d.value,
          name: d.name,
          areaStyle: {
            color: idx === 0 ? 'rgba(114, 46, 209, 0.2)' : 'rgba(82, 196, 26, 0.2)',
          },
          lineStyle: {
            color: idx === 0 ? '#722ed1' : '#52c41a',
            width: 2,
          },
        })),
      },
    ],
  }

  const trendComparisonOption = {
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      data: trendComparisonData.legend,
      top: 0,
    },
    grid: {
      left: 60,
      right: 40,
      bottom: 40,
      top: 40,
    },
    xAxis: {
      type: 'category',
      data: trendComparisonData.months,
    },
    yAxis: {
      type: 'value',
      name: '能耗 (kWh)',
    },
    series: trendComparisonData.series.map((s: any) => ({
      name: s.name,
      type: 'line',
      data: s.data,
      smooth: true,
      lineStyle: { width: 2, color: s.color },
      itemStyle: { color: s.color },
    })),
  }

  const tableColumns = [
    { title: '名称', dataIndex: 'name', key: 'name', width: 140 },
    { title: '能耗', dataIndex: 'energy', key: 'energy', width: 120 },
    {
      title: '占比',
      dataIndex: 'percentage',
      key: 'percentage',
      width: 80,
      render: (v: string) => <Tag color="blue">{v}</Tag>,
    },
    { title: '成本', dataIndex: 'cost', key: 'cost', width: 100 },
    {
      title: '环比变化',
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
      title: '同比变化',
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
    <div className="energy-ratio-container">
      <PageHeader
        title="能耗比较分析"
        subtitle="多维度对比分析，深入洞察能耗变化"
        items={[{ title: '首页', path: '/dashboard' }, { title: '能耗比较分析' }]}
        extra={
          <Space>
            <Select value={selectedDimension} onChange={handleDimensionChange} style={{ width: 140 }}>
              <Select.Option value="area">按区域分析</Select.Option>
              <Select.Option value="device">按设备类型</Select.Option>
              <Select.Option value="time">按时间周期</Select.Option>
              <Select.Option value="energy">按能源类型</Select.Option>
            </Select>
            <Button icon={<SearchOutlined />} type="primary" onClick={handleQuery} loading={loading}>
              查询
            </Button>
            <Button icon={<DownloadOutlined />} onClick={handleExportCsv}>
              生成报告
            </Button>
          </Space>
        }
      />

      {/* 顶部4个进度环指标 */}
      <Row gutter={[16, 16]}>
        {topProgressMetrics.map((metric, idx) => (
          <Col xs={24} sm={12} lg={6} key={idx}>
            <Card bordered={false} className="progress-metric-card">
              <div className="progress-metric-inner">
                <Progress
                  type="circle"
                  percent={metric.percentage}
                  strokeColor={metric.color}
                  width={90}
                  format={() => (
                    <div className="progress-inner-text">
                      <div className="progress-value">{metric.percentage}%</div>
                    </div>
                  )}
                />
                <div className="progress-info">
                  <div className="progress-title">{metric.title}</div>
                  <Tag
                    color={metric.trend === 'up' ? 'red' : metric.trend === 'down' ? 'green' : 'default'}
                    style={{ fontSize: 12, border: 'none', marginTop: 4 }}
                  >
                    {metric.change}
                  </Tag>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* 区域能耗占比 + 建设年份能耗对比 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="区域能耗占比对比" bordered={false} extra={<span style={{ fontSize: 12, color: '#86909c' }}>各区域能耗占比</span>}>
            <Chart option={areaDistributionOption} height={300} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="建设年份能耗对比" bordered={false} extra={<span style={{ fontSize: 12, color: '#86909c' }}>本期与上期对比</span>}>
            <Chart option={yearComparisonOption} height={300} />
          </Card>
        </Col>
      </Row>

      {/* 多维度雷达图 + 能源类型占比（横向进度条） */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="多维度能效对比" bordered={false} extra={<span style={{ fontSize: 12, color: '#86909c' }}>各维度能效评分</span>}>
            <Chart option={radarOption} height={300} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="能源类型占比" bordered={false} extra={<span style={{ fontSize: 12, color: '#86909c' }}>各类型能源占比分布</span>}>
            <div className="energy-types-progress-ratio">
              {energyTypesData.map((item, idx) => (
                <div key={idx} className="energy-type-item-ratio">
                  <div className="energy-type-header-ratio">
                    <span className="energy-type-name-ratio">{item.name}</span>
                    <span className="energy-type-percentage-ratio">{item.percentage}%</span>
                  </div>
                  <Progress
                    percent={item.percentage}
                    strokeColor={item.color}
                    showInfo={false}
                    strokeWidth={16}
                    style={{ marginBottom: 0 }}
                  />
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      {/* 能耗趋势对比 */}
      <Card title="能耗趋势对比" bordered={false} style={{ marginTop: 16 }} extra={<span style={{ fontSize: 12, color: '#86909c' }}>全年能源类型趋势对比</span>}>
        <Chart option={trendComparisonOption} height={260} />
      </Card>

      {/* 详细数据表格 */}
      <Card
        title="详细数据对比"
        bordered={false}
        style={{ marginTop: 16 }}
        extra={
          <Button type="link" onClick={() => message.info('查看全部数据')}>
            查看全部 →
          </Button>
        }
      >
        <Table
          dataSource={detailData}
          columns={tableColumns}
          pagination={false}
          size="small"
        />
      </Card>
    </div>
  )
}

export default EnergyRatioNew

