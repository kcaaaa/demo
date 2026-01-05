/**
 * 单站能耗分析 - 按照Figma设计稿完全重构
 * 设计稿：https://www.figma.com/design/k5TBKzoZJ0DPn5LobyEc20/%E9%AB%98%E9%93%81%E7%AB%99%E8%83%BD%E8%80%97%E6%BC%94%E7%A4%BA?node-id=34-4&m=dev
 */

import React, { useState } from 'react'
import { Card, Row, Col, Button, Space, Select, DatePicker, Tag, Table, message, Progress } from 'antd'
import {
  ThunderboltOutlined,
  DashboardOutlined,
  DollarOutlined,
  RiseOutlined,
  SearchOutlined,
  ReloadOutlined,
  DownloadOutlined,
} from '@ant-design/icons'
import PageHeader from '../../components/PageHeader'
import Chart from '../../components/Chart'
import { exportCsv, sleep } from '../../utils/mock'
import './singlestation.css'

const { RangePicker } = DatePicker

// 根据站点和时间周期生成差异化数据
const generateStationData = (station: string, period: string) => {
  // 不同站点的基础系数
  const stationFactors = {
    '北京站': { 
      energyScale: 1.0,  // 能耗规模
      efficiency: 86.5,   // 能源效率
      areaScale: 1.0,     // 面积规模
      seasonFactor: 1.2,  // 季节系数（北方冬季供暖）
    },
    '上海站': { 
      energyScale: 1.15,  // 上海站规模更大
      efficiency: 88.2,   // 效率稍高
      areaScale: 1.2,
      seasonFactor: 0.85, // 季节影响较小
    },
    '广州站': { 
      energyScale: 0.85,  // 广州站规模较小
      efficiency: 90.5,   // 南方站效率最高
      areaScale: 0.9,
      seasonFactor: 0.95, // 常年温暖，能耗稳定
    },
  }

  // 不同时间周期的系数
  const periodFactors = {
    'today': 1.0,
    'yesterday': 0.95,
    'week': 1.05,
    'month': 1.1,
  }

  const factor = stationFactors[station as keyof typeof stationFactors]
  const periodFactor = periodFactors[period as keyof typeof periodFactors]
  const totalFactor = factor.energyScale * periodFactor * factor.seasonFactor

  // 生成24小时能耗趋势（根据站点和时间有明显差异）
  const basePattern = [3500, 3200, 2900, 2800, 3000, 3500, 4200, 4800, 5100, 4900, 4800, 4700, 4500, 4600, 4500, 4400, 4500, 4300, 4100, 3900, 3700, 3500, 3300, 3200]
  
  const trendData = {
    actual: basePattern.map(v => Math.round(v * totalFactor)),
    target: basePattern.map(v => Math.round(v * totalFactor * 1.08)),
    predicted: basePattern.map(v => Math.round(v * totalFactor * 1.02)),
  }

  // 总能耗计算
  const totalEnergy = Math.round(trendData.actual.reduce((a, b) => a + b, 0) * (period === 'month' ? 30 : 1))
  
  // 生成部门能耗排行（不同站点侧重点不同）
  let deptRankingData = []
  if (station === '北京站') {
    deptRankingData = [
      { name: '候车大厅', value: Math.round(45200 * totalFactor), color: '#1890ff' },
      { name: '站台照明', value: Math.round(38500 * totalFactor), color: '#52c41a' },
      { name: '办公区域', value: Math.round(28900 * totalFactor), color: '#faad14' },
      { name: '供暖系统', value: Math.round(35100 * totalFactor), color: '#ff4d4f' },
      { name: '电梯扶梯', value: Math.round(22100 * totalFactor), color: '#722ed1' },
      { name: '其他区域', value: Math.round(12800 * totalFactor), color: '#8c8c8c' },
    ]
  } else if (station === '上海站') {
    deptRankingData = [
      { name: '候车大厅', value: Math.round(52000 * totalFactor), color: '#1890ff' },
      { name: '空调系统', value: Math.round(48500 * totalFactor), color: '#13c2c2' },
      { name: '站台照明', value: Math.round(42000 * totalFactor), color: '#52c41a' },
      { name: '商业区域', value: Math.round(31500 * totalFactor), color: '#faad14' },
      { name: '电梯扶梯', value: Math.round(28600 * totalFactor), color: '#722ed1' },
      { name: '其他区域', value: Math.round(15200 * totalFactor), color: '#8c8c8c' },
    ]
  } else { // 广州站
    deptRankingData = [
      { name: '空调系统', value: Math.round(42000 * totalFactor), color: '#13c2c2' },
      { name: '候车大厅', value: Math.round(38200 * totalFactor), color: '#1890ff' },
      { name: '站台照明', value: Math.round(32500 * totalFactor), color: '#52c41a' },
      { name: '商业区域', value: Math.round(25900 * totalFactor), color: '#faad14' },
      { name: '电梯扶梯', value: Math.round(19600 * totalFactor), color: '#722ed1' },
      { name: '其他区域', value: Math.round(10800 * totalFactor), color: '#8c8c8c' },
    ]
  }

  // 能效趋势（不同站点效率不同）
  const efficiencyBase = factor.efficiency
  const efficiencyData = {
    months: ['一月', '二月', '三月', '四月', '五月', '六月', '七月'],
    lastMonth: [
      efficiencyBase - 4, efficiencyBase - 7, efficiencyBase - 5,
      efficiencyBase - 1, efficiencyBase - 3, efficiencyBase + 1, efficiencyBase
    ],
    thisMonth: [
      efficiencyBase - 1, efficiencyBase - 3, efficiencyBase,
      efficiencyBase + 2, efficiencyBase + 1, efficiencyBase + 4, efficiencyBase + 3
    ],
  }

  // 雷达图数据（不同站点特征不同）
  let radarData = []
  if (station === '北京站') {
    radarData = [
      { value: [82, 75, 88, 70, 65], name: '上月' },
      { value: [90, 85, 92, 78, 72], name: '本月' },
    ]
  } else if (station === '上海站') {
    radarData = [
      { value: [88, 82, 90, 75, 70], name: '上月' },
      { value: [92, 88, 94, 82, 78], name: '本月' },
    ]
  } else { // 广州站
    radarData = [
      { value: [90, 88, 85, 80, 75], name: '上月' },
      { value: [95, 92, 88, 85, 82], name: '本月' },
    ]
  }

  // 能源类型占比（不同站点能源结构不同）
  let energyTypesData = []
  if (station === '北京站') {
    energyTypesData = [
      { name: '电力', percentage: 55, color: '#1890ff' },
      { name: '供暖', percentage: 30, color: '#ff4d4f' },
      { name: '燃气', percentage: 10, color: '#52c41a' },
      { name: '其他', percentage: 5, color: '#8c8c8c' },
    ]
  } else if (station === '上海站') {
    energyTypesData = [
      { name: '电力', percentage: 70, color: '#1890ff' },
      { name: '空调', percentage: 20, color: '#13c2c2' },
      { name: '燃气', percentage: 7, color: '#52c41a' },
      { name: '其他', percentage: 3, color: '#8c8c8c' },
    ]
  } else { // 广州站
    energyTypesData = [
      { name: '电力', percentage: 75, color: '#1890ff' },
      { name: '空调', percentage: 18, color: '#13c2c2' },
      { name: '燃气', percentage: 5, color: '#52c41a' },
      { name: '其他', percentage: 2, color: '#8c8c8c' },
    ]
  }

  return {
    totalEnergy,
    factor,
    trendData,
    deptRankingData,
    efficiencyData,
    radarData,
    energyTypesData,
  }
}

const SingleStationNew = () => {
  const [loading, setLoading] = useState(false)

  // 筛选条件
  const [selectedStation, setSelectedStation] = useState('北京站')
  const [selectedPeriod, setSelectedPeriod] = useState('today')

  // 根据选择生成数据
  const stationData = generateStationData(selectedStation, selectedPeriod)

  // 顶部4个指标卡片（动态计算）
  const topMetrics = [
    {
      title: '总能耗',
      value: stationData.totalEnergy.toLocaleString(),
      unit: 'kWh',
      change: selectedPeriod === 'today' ? '+2.3%' : selectedPeriod === 'yesterday' ? '+1.8%' : selectedPeriod === 'week' ? '+3.5%' : '+4.2%',
      icon: <ThunderboltOutlined />,
      trend: 'up',
      color: '#1890ff',
    },
    {
      title: '单位面积能耗',
      value: (stationData.totalEnergy / (10000 * stationData.factor.areaScale) / (selectedPeriod === 'month' ? 30 : 1)).toFixed(2),
      unit: 'kWh/㎡',
      change: selectedStation === '广州站' ? '-2.1%' : selectedStation === '上海站' ? '-1.5%' : '-1.8%',
      icon: <DashboardOutlined />,
      trend: 'down',
      color: '#52c41a',
    },
    {
      title: '能耗成本',
      value: (stationData.totalEnergy * 0.85).toFixed(2),
      unit: '元',
      change: selectedPeriod === 'month' ? '+5.2%' : '+3.2%',
      icon: <DollarOutlined />,
      trend: 'up',
      color: '#faad14',
    },
    {
      title: '能源效率',
      value: stationData.factor.efficiency.toFixed(1),
      unit: '%',
      change: selectedStation === '广州站' ? '+1.2%' : selectedStation === '上海站' ? '+0.8%' : '+0.5%',
      icon: <RiseOutlined />,
      trend: 'up',
      color: '#722ed1',
    },
  ]

  // 24小时能耗趋势数据
  const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`)
  const trendData = stationData.trendData

  // 部门能耗排行数据
  const deptRankingData = stationData.deptRankingData

  // 能效趋势分析数据
  const efficiencyData = stationData.efficiencyData

  // 多维度雷达图数据
  const radarIndicators = [
    { name: '设备能耗', max: 100 },
    { name: '照明能耗', max: 100 },
    { name: '空调能耗', max: 100 },
    { name: '用水能耗', max: 100 },
    { name: '其他能耗', max: 100 },
  ]

  const radarData = stationData.radarData

  // 能源类型占比
  const energyTypesData = stationData.energyTypesData

  // 常用能耗措施数据（根据站点生成不同的异常记录）
  const anomalyRecords = [
    {
      key: 1,
      time: '2024-01-16 14:30:00',
      power: selectedStation === '上海站' ? '18.6 kW' : selectedStation === '广州站' ? '12.3 kW' : '14.6 kW',
      voltage: '13.00 V',
      status: 'normal',
      statusText: '正常',
      desc: `${selectedStation}设备运行稳定且正常运行`,
    },
    {
      key: 2,
      time: '2024-01-16 13:20:00',
      power: selectedStation === '上海站' ? '10.5 kW' : selectedStation === '广州站' ? '7.2 kW' : '8.5 kW',
      voltage: '8.00 V',
      status: 'warn',
      statusText: '异常',
      desc: selectedStation === '北京站' ? '供暖能耗略高于预期' : '空调能耗略高于预期',
    },
    {
      key: 3,
      time: '2024-01-16 12:13:00',
      power: selectedStation === '上海站' ? '6.2 kW' : selectedStation === '广州站' ? '4.1 kW' : '4.9 kW',
      voltage: '6.00 V',
      status: 'warn',
      statusText: '异常',
      desc: '电流电压超过规格',
    },
    {
      key: 4,
      time: '2024-01-11 16:20:00',
      power: selectedStation === '上海站' ? '16.8 kW' : selectedStation === '广州站' ? '11.5 kW' : '14.0 kW',
      voltage: '10.00 V',
      status: 'normal',
      statusText: '正常',
      desc: '系统自动记忆功能正常',
    },
    {
      key: 5,
      time: '2024-01-10 09:15:00',
      power: selectedStation === '上海站' ? '15.2 kW' : selectedStation === '广州站' ? '10.8 kW' : '12.3 kW',
      voltage: '11.50 V',
      status: 'normal',
      statusText: '正常',
      desc: '系统自动记录信息成功',
    },
  ]

  // 查询
  const handleQuery = async () => {
    setLoading(true)
    await sleep(500)
    message.success(`查询成功：${selectedStation} - ${selectedPeriod === 'today' ? '本日' : selectedPeriod === 'yesterday' ? '昨日' : selectedPeriod === 'week' ? '本周' : '本月'}数据`)
    setLoading(false)
  }

  // 重置
  const handleReset = () => {
    setSelectedStation('北京站')
    setSelectedPeriod('today')
    message.info('已重置筛选条件')
  }
  
  // 切换站点
  const handleStationChange = (value: string) => {
    setSelectedStation(value)
    message.info(`切换至${value}`)
  }
  
  // 切换时间周期
  const handlePeriodChange = (value: string) => {
    setSelectedPeriod(value)
    const periodText = value === 'today' ? '本日' : value === 'yesterday' ? '昨日' : value === 'week' ? '本周' : '本月'
    message.info(`切换至${periodText}数据`)
  }

  // 导出CSV
  const handleExportCsv = () => {
    const data = [
      ['单站能耗分析数据导出'],
      [],
      ['车站', selectedStation],
      ['统计周期', selectedPeriod === 'today' ? '本日' : '本月'],
      [],
      ['顶部指标'],
      ['指标名称', '数值', '单位', '同比变化'],
      ...topMetrics.map(m => [m.title, m.value, m.unit, m.change]),
      [],
      ['异常记录'],
      ['时间', '功率', '电压', '状态', '描述'],
      ...anomalyRecords.map(a => [a.time, a.power, a.voltage, a.statusText, a.desc]),
    ]
    exportCsv(data, `单站能耗分析_${selectedStation}_${new Date().toISOString().slice(0, 10)}.csv`)
  }

  // ECharts配置
  const trendOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
    },
    legend: {
      data: ['实时能耗', '计划能耗', '去年同期'],
      top: 0,
    },
    grid: {
      left: 60,
      right: 40,
      bottom: 40,
      top: 50,
    },
    xAxis: {
      type: 'category',
      data: hours,
      boundaryGap: false,
    },
    yAxis: {
      type: 'value',
      name: '能耗 (kWh)',
    },
    series: [
      {
        name: '实时能耗',
        type: 'line',
        data: trendData.actual,
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
        itemStyle: { color: '#1890ff' },
      },
      {
        name: '计划能耗',
        type: 'line',
        data: trendData.target,
        smooth: true,
        lineStyle: { width: 2, color: '#52c41a', type: 'dashed' },
        itemStyle: { color: '#52c41a' },
      },
      {
        name: '去年同期',
        type: 'line',
        data: trendData.predicted,
        smooth: true,
        lineStyle: { width: 1, color: '#722ed1', type: 'dotted' },
        itemStyle: { color: '#722ed1' },
      },
    ],
  }

  const deptRankingOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
    },
    grid: {
      left: 100,
      right: 80,
      top: 20,
      bottom: 20,
    },
    xAxis: {
      type: 'value',
      name: '能耗 (kWh)',
      axisLabel: { formatter: '{value}' },
    },
    yAxis: {
      type: 'category',
      data: deptRankingData.map(d => d.name).reverse(),
      axisLabel: { fontSize: 12 },
    },
    series: [
      {
        name: '部门能耗',
        type: 'bar',
        data: deptRankingData.map(d => ({ value: d.value, itemStyle: { color: d.color } })).reverse(),
        barWidth: 24,
        label: {
          show: true,
          position: 'right',
          formatter: '{c} kWh',
          fontSize: 12,
        },
      },
    ],
  }

  const efficiencyOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
    },
    legend: {
      data: ['上月', '本月'],
      top: 0,
    },
    grid: {
      left: 50,
      right: 40,
      bottom: 30,
      top: 40,
    },
    xAxis: {
      type: 'category',
      data: efficiencyData.months,
    },
    yAxis: {
      type: 'value',
      name: '能效 (%)',
      max: 100,
    },
    series: [
      {
        name: '上月',
        type: 'bar',
        data: efficiencyData.lastMonth,
        itemStyle: { color: '#c9cdd4' },
        barWidth: 16,
      },
      {
        name: '本月',
        type: 'bar',
        data: efficiencyData.thisMonth,
        itemStyle: { color: '#1890ff' },
        barWidth: 16,
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

  // 能源类型趋势折线图（根据站点不同显示不同的能源类型）
  const getEnergyTrendData = () => {
    if (selectedStation === '北京站') {
      return {
        legend: ['电力', '供暖', '燃气'],
        series: [
          {
            name: '电力',
            type: 'line',
            data: [8500, 8200, 8600, 8800, 8700, 9000, 9200, 9100, 9300, 9500, 9400, 9600],
            smooth: true,
            lineStyle: { width: 2, color: '#1890ff' },
            itemStyle: { color: '#1890ff' },
          },
          {
            name: '供暖',
            type: 'line',
            data: [3500, 3400, 3600, 3700, 3650, 3800, 3850, 3900, 4000, 4100, 4050, 4200],
            smooth: true,
            lineStyle: { width: 2, color: '#ff4d4f' },
            itemStyle: { color: '#ff4d4f' },
          },
          {
            name: '燃气',
            type: 'line',
            data: [1400, 1350, 1450, 1500, 1480, 1550, 1580, 1600, 1650, 1700, 1680, 1750],
            smooth: true,
            lineStyle: { width: 2, color: '#52c41a' },
            itemStyle: { color: '#52c41a' },
          },
        ],
      }
    } else if (selectedStation === '上海站') {
      return {
        legend: ['电力', '空调', '燃气'],
        series: [
          {
            name: '电力',
            type: 'line',
            data: [9800, 9500, 9900, 10100, 10000, 10400, 10600, 10500, 10800, 11000, 10900, 11200],
            smooth: true,
            lineStyle: { width: 2, color: '#1890ff' },
            itemStyle: { color: '#1890ff' },
          },
          {
            name: '空调',
            type: 'line',
            data: [2800, 2700, 2600, 2800, 3200, 3800, 4200, 4100, 3600, 3200, 2800, 2700],
            smooth: true,
            lineStyle: { width: 2, color: '#13c2c2' },
            itemStyle: { color: '#13c2c2' },
          },
          {
            name: '燃气',
            type: 'line',
            data: [1050, 1020, 1100, 1080, 1060, 1150, 1180, 1200, 1250, 1300, 1280, 1350],
            smooth: true,
            lineStyle: { width: 2, color: '#52c41a' },
            itemStyle: { color: '#52c41a' },
          },
        ],
      }
    } else { // 广州站
      return {
        legend: ['电力', '空调', '燃气'],
        series: [
          {
            name: '电力',
            type: 'line',
            data: [7400, 7100, 7300, 7500, 7400, 7600, 7800, 7700, 7900, 8100, 8000, 8200],
            smooth: true,
            lineStyle: { width: 2, color: '#1890ff' },
            itemStyle: { color: '#1890ff' },
          },
          {
            name: '空调',
            type: 'line',
            data: [1600, 1550, 1500, 1700, 2000, 2500, 2800, 2700, 2300, 2000, 1700, 1600],
            smooth: true,
            lineStyle: { width: 2, color: '#13c2c2' },
            itemStyle: { color: '#13c2c2' },
          },
          {
            name: '燃气',
            type: 'line',
            data: [620, 600, 580, 570, 560, 550, 540, 550, 560, 570, 590, 610],
            smooth: true,
            lineStyle: { width: 2, color: '#52c41a' },
            itemStyle: { color: '#52c41a' },
          },
        ],
      }
    }
  }

  const energyTrendData = getEnergyTrendData()
  const energyTrendOption = {
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      data: energyTrendData.legend,
      top: 0,
    },
    grid: {
      left: 50,
      right: 40,
      bottom: 30,
      top: 40,
    },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    },
    yAxis: {
      type: 'value',
      name: '能耗 (kWh)',
    },
    series: energyTrendData.series,
  }

  const tableColumns = [
    { title: '时间', dataIndex: 'time', key: 'time', width: 180 },
    { title: '功率', dataIndex: 'power', key: 'power', width: 100 },
    { title: '电压', dataIndex: 'voltage', key: 'voltage', width: 100 },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: string, record: any) => (
        <Tag color={status === 'normal' ? 'green' : 'orange'}>{record.statusText}</Tag>
      ),
    },
    { title: '描述', dataIndex: 'desc', key: 'desc' },
  ]

  return (
    <div className="single-station-container">
      <PageHeader
        title="能耗监测分析"
        subtitle="实时监控能耗数据,智能分析能耗趋势"
        items={[{ title: '首页', path: '/dashboard' }, { title: '能耗监测分析' }]}
        extra={
          <Space>
            <Select value={selectedStation} onChange={handleStationChange} style={{ width: 140 }}>
              <Select.Option value="北京站">北京站</Select.Option>
              <Select.Option value="上海站">上海站</Select.Option>
              <Select.Option value="广州站">广州站</Select.Option>
            </Select>
            <Select value={selectedPeriod} onChange={handlePeriodChange} style={{ width: 100 }}>
              <Select.Option value="today">本日</Select.Option>
              <Select.Option value="yesterday">昨日</Select.Option>
              <Select.Option value="week">本周</Select.Option>
              <Select.Option value="month">本月</Select.Option>
            </Select>
            <Button icon={<SearchOutlined />} type="primary" onClick={handleQuery} loading={loading}>
              查询
            </Button>
            <Button icon={<DownloadOutlined />} onClick={handleExportCsv}>
              导出CSV
            </Button>
          </Space>
        }
      />

      {/* 顶部4个指标卡片 */}
      <Row gutter={[16, 16]}>
        {topMetrics.map((metric, idx) => (
          <Col xs={24} sm={12} lg={6} key={idx}>
            <Card bordered={false} className="metric-card-single">
              <div className="metric-inner">
                <div className="metric-icon" style={{ backgroundColor: `${metric.color}15` }}>
                  <div style={{ fontSize: 24, color: metric.color }}>{metric.icon}</div>
                </div>
                <div className="metric-info">
                  <div className="metric-label-single">{metric.title}</div>
                  <div className="metric-value-single">
                    {metric.value} <span className="metric-unit-single">{metric.unit}</span>
                  </div>
                  <Tag
                    color={metric.trend === 'up' ? 'red' : 'green'}
                    style={{ marginTop: 4, fontSize: 12, border: 'none' }}
                  >
                    较上月 {metric.change}
                  </Tag>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* 24小时能耗趋势 */}
      <Card title="24小时能耗趋势" bordered={false} style={{ marginTop: 16 }} extra={<span style={{ fontSize: 12, color: '#86909c' }}>实时对比能耗趋势分析</span>}>
        <Chart option={trendOption} height={300} />
      </Card>

      {/* 部门能耗排行 + 能效趋势分析 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="部门能耗排行" bordered={false} extra={<span style={{ fontSize: 12, color: '#86909c' }}>各部门能耗排名对比</span>}>
            <Chart option={deptRankingOption} height={300} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="能效趋势分析" bordered={false} extra={<span style={{ fontSize: 12, color: '#86909c' }}>本期与上期对比</span>}>
            <Chart option={efficiencyOption} height={300} />
          </Card>
        </Col>
      </Row>

      {/* 多维度雷达图 + 能源类型占比（横向进度条） */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="多维度能效分析" bordered={false} extra={<span style={{ fontSize: 12, color: '#86909c' }}>各维度能效评分</span>}>
            <Chart option={radarOption} height={300} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="能源类型占比" bordered={false} extra={<span style={{ fontSize: 12, color: '#86909c' }}>各类型能源占比分布</span>}>
            <div className="energy-types-progress">
              {energyTypesData.map((item, idx) => (
                <div key={idx} className="energy-type-item">
                  <div className="energy-type-header">
                    <span className="energy-type-name">{item.name}</span>
                    <span className="energy-type-percentage">{item.percentage}%</span>
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

      {/* 能源类型趋势 */}
      <Card title="能耗趋势对比" bordered={false} style={{ marginTop: 16 }} extra={<span style={{ fontSize: 12, color: '#86909c' }}>能源类型全年趋势</span>}>
        <Chart option={energyTrendOption} height={260} />
      </Card>

      {/* 异常能耗措施 */}
      <Card
        title="异常能耗措施"
        bordered={false}
        style={{ marginTop: 16 }}
        extra={
          <Button type="primary" size="small" onClick={() => message.info('导出报告')}>
            导出报告
          </Button>
        }
      >
        <Table
          dataSource={anomalyRecords}
          columns={tableColumns}
          pagination={false}
          size="small"
        />
      </Card>
    </div>
  )
}

export default SingleStationNew

