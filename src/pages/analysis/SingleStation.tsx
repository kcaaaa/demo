import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Select, DatePicker, Button, Space, Table, Tag, message, Radio, InputNumber, Spin, Modal, Descriptions } from 'antd'
import { SearchOutlined, ReloadOutlined, DownloadOutlined, CheckOutlined, EyeOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import moment from 'moment'
import Chart from '../../components/Chart'
import PageHeader from '../../components/PageHeader'
import { sleep, exportCsv } from '../../utils/mock'

// 模拟生成基于筛选条件的数据
const generateTrendData = (station: string, granularity: string, predictDays: number) => {
  const baseEnergy = station === 'station1' ? 12500 : station === 'station2' ? 10800 : 11200
  const length = granularity === 'day' ? 10 : granularity === 'week' ? 8 : 6
  
  const dates = Array.from({ length }, (_, i) => {
    if (granularity === 'day') return `01/${String(i + 1).padStart(2, '0')}`
    if (granularity === 'week') return `W${i + 1}`
    return `${i + 1}月`
  })
  
  const energy = Array.from({ length }, () => Math.round(baseEnergy + (Math.random() - 0.5) * 1500))
  
  // 预测数据：最后 predictDays 个点
  const predictStart = Math.max(0, length - Math.ceil(predictDays / (granularity === 'day' ? 1 : granularity === 'week' ? 7 : 30)))
  const predictEnergy = energy.map((v, i) => (i >= predictStart ? Math.round(v * (0.95 + Math.random() * 0.1)) : null))
  
  const cost = energy.map((v) => Math.round(v * 1.5))
  const efficiency = energy.map(() => Math.round(80 + Math.random() * 10))
  
  return { dates, energy, predictEnergy, cost, efficiency }
}

// 异常记录类型
type Anomaly = {
  key: number
  time: string
  type: string
  device: string
  value: string
  status: string
  detail: string
  threshold: number
  currentValue: number
  suggestion: string
}

const SingleStation = () => {
  const [station, setStation] = useState('station1')
  const [dateRange, setDateRange] = useState<any>([moment().subtract(30, 'days'), moment()])
  const [granularity, setGranularity] = useState<'day' | 'week' | 'month'>('day')
  const [predictDays, setPredictDays] = useState(7)
  const [loading, setLoading] = useState(false)
  const [chartLoading, setChartLoading] = useState(false)
  
  // 数据状态
  const [trendData, setTrendData] = useState(() => generateTrendData('station1', 'day', 7))
  
  // 异常详情弹窗
  const [detailVisible, setDetailVisible] = useState(false)
  const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(null)

  // 查询：根据筛选条件更新数据
  const handleQuery = async () => {
    setLoading(true)
    setChartLoading(true)
    await sleep(600)
    
    // 根据筛选条件生成新数据
    const newData = generateTrendData(station, granularity, predictDays)
    setTrendData(newData)
    
    message.success(`查询完成：${station === 'station1' ? '北京站' : station === 'station2' ? '上海站' : station === 'station3' ? '广州站' : '深圳站'}，粒度：${granularity === 'day' ? '日' : granularity === 'week' ? '周' : '月'}`)
    setChartLoading(false)
    setLoading(false)
  }

  // 重置筛选条件
  const handleReset = () => {
    setStation('station1')
    setDateRange([moment().subtract(30, 'days'), moment()])
    setGranularity('day')
    setPredictDays(7)
    
    // 重置数据
    const defaultData = generateTrendData('station1', 'day', 7)
    setTrendData(defaultData)
    
    message.info('已重置筛选条件')
  }

  // 导出CSV
  const handleExport = () => {
    const stationName = station === 'station1' ? '北京站' : station === 'station2' ? '上海站' : station === 'station3' ? '广州站' : '深圳站'
    const data = [
      ['车站', stationName],
      ['时间范围', `${dateRange[0].format('YYYY-MM-DD')} 至 ${dateRange[1].format('YYYY-MM-DD')}`],
      ['粒度', granularity === 'day' ? '日' : granularity === 'week' ? '周' : '月'],
      ['预测天数', predictDays],
      [],
      ['时间', '能耗(kWh)', '成本(元)', '效率(%)', '预测能耗(kWh)'],
      ...trendData.dates.map((d, i) => [
        d,
        trendData.energy[i],
        trendData.cost[i],
        trendData.efficiency[i],
        trendData.predictEnergy[i] || '-',
      ]),
    ]
    exportCsv(data, `单站能耗_${stationName}_${new Date().toISOString().slice(0, 10)}.csv`)
  }

  // 趋势图表配置
  const trendOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { 
        type: 'cross',
        label: { backgroundColor: '#6a7985' }
      },
    },
    legend: { 
      data: ['实际能耗', '预测能耗', '成本', '效率'],
      top: 0,
      right: 0,
    },
    xAxis: { 
      type: 'category', 
      data: trendData.dates,
      boundaryGap: false,
    },
    yAxis: [
      { 
        type: 'value', 
        name: '能耗/成本', 
        position: 'left',
        axisLabel: { formatter: '{value}' }
      },
      { 
        type: 'value', 
        name: '效率(%)', 
        position: 'right', 
        max: 100,
        axisLabel: { formatter: '{value}%' }
      },
    ],
    series: [
      {
        name: '实际能耗',
        type: 'line',
        data: trendData.energy,
        lineStyle: { width: 3, color: '#1890ff' },
        itemStyle: { color: '#1890ff' },
        areaStyle: { color: 'rgba(24,144,255,0.1)' },
        smooth: true,
        emphasis: { focus: 'series' },
      },
      {
        name: '预测能耗',
        type: 'line',
        data: trendData.predictEnergy,
        lineStyle: { width: 3, type: 'dashed', color: '#faad14' },
        itemStyle: { color: '#faad14', borderType: 'dashed' },
        symbol: 'circle',
        symbolSize: 6,
        emphasis: { focus: 'series' },
      },
      {
        name: '成本',
        type: 'line',
        data: trendData.cost,
        lineStyle: { width: 2, color: '#722ed1' },
        itemStyle: { color: '#722ed1' },
        smooth: true,
        emphasis: { focus: 'series' },
      },
      {
        name: '效率',
        type: 'line',
        yAxisIndex: 1,
        data: trendData.efficiency,
        lineStyle: { width: 2, color: '#52c41a' },
        itemStyle: { color: '#52c41a' },
        smooth: true,
        emphasis: { focus: 'series' },
      },
    ],
  }

  const ratioOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} kWh ({d}%)',
    },
    legend: { orient: 'vertical', left: 'left' },
    series: [
      {
        name: '能耗占比',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: true,
        label: {
          show: true,
          formatter: '{b}: {d}%',
        },
        data: [
          { value: 5625, name: '空调', itemStyle: { color: '#1890ff' } },
          { value: 3125, name: '照明', itemStyle: { color: '#52c41a' } },
          { value: 2500, name: '动力', itemStyle: { color: '#faad14' } },
          { value: 1250, name: '其他', itemStyle: { color: '#722ed1' } },
        ],
      },
    ],
  }

  const deptCompareOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['部门A', '部门B', '部门C'] },
    xAxis: { type: 'category', data: trendData.dates.slice(0, 7) },
    yAxis: { type: 'value', name: '能耗(kWh)' },
    series: [
      { name: '部门A', type: 'bar', data: [4200, 3900, 4500, 4300, 3800, 4100, 4400], itemStyle: { color: '#1890ff' } },
      { name: '部门B', type: 'bar', data: [3800, 3600, 4000, 3900, 3500, 3750, 3950], itemStyle: { color: '#52c41a' } },
      { name: '部门C', type: 'bar', data: [4500, 4300, 4700, 4700, 4300, 4550, 4750], itemStyle: { color: '#722ed1' } },
    ],
  }

  // 异常记录数据
  const [anomalies, setAnomalies] = useState<Anomaly[]>([
    {
      key: 1,
      time: '2024-01-15 14:30',
      type: '突增',
      device: '空调1',
      value: '+35%',
      status: '未处理',
      detail: '能耗突增35%，疑似设备故障',
      threshold: 12000,
      currentValue: 16200,
      suggestion: '建议：检查空调压缩机是否故障，检查温度设定是否异常。',
    },
    {
      key: 2,
      time: '2024-01-14 09:15',
      type: '突降',
      device: '照明2',
      value: '-22%',
      status: '已处理',
      detail: '照明系统能耗异常下降',
      threshold: 3000,
      currentValue: 2340,
      suggestion: '建议：检查照明回路是否故障，确认区域是否停用。',
    },
    {
      key: 3,
      time: '2024-01-13 16:45',
      type: '突增',
      device: '动力设备',
      value: '+18%',
      status: '未处理',
      detail: '动力设备能耗超出正常范围',
      threshold: 8000,
      currentValue: 9440,
      suggestion: '建议：检查动力设备负载情况，确认运行模式是否正常。',
    },
  ])

  // 标记已处理
  const handleMarkProcessed = async (key: number) => {
    setLoading(true)
    await sleep(400)
    setAnomalies((prev) => prev.map((a) => (a.key === key ? { ...a, status: '已处理' } : a)))
    message.success('已标记为已处理')
    setLoading(false)
  }

  // 查看详情
  const handleViewDetail = (record: Anomaly) => {
    setSelectedAnomaly(record)
    setDetailVisible(true)
  }

  return (
    <div>
      <PageHeader
        title="单站能耗分析"
        subtitle="多维度数据展示 · 趋势预测 · 异常检测"
        items={[{ title: '首页', href: '/' }, { title: '单站能耗分析' }]}
      />

      <Card bordered={false} style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={6}>
            <div style={{ marginBottom: 8, fontWeight: 600, color: 'var(--text-color)' }}>车站</div>
            <Select value={station} onChange={setStation} style={{ width: '100%' }}>
              <Select.Option value="station1">北京站</Select.Option>
              <Select.Option value="station2">上海站</Select.Option>
              <Select.Option value="station3">广州站</Select.Option>
              <Select.Option value="station4">深圳站</Select.Option>
            </Select>
          </Col>

          <Col xs={24} md={8}>
            <div style={{ marginBottom: 8, fontWeight: 600, color: 'var(--text-color)' }}>时间范围</div>
            <DatePicker.RangePicker value={dateRange} onChange={setDateRange} style={{ width: '100%' }} />
          </Col>

          <Col xs={24} md={4}>
            <div style={{ marginBottom: 8, fontWeight: 600, color: 'var(--text-color)' }}>粒度</div>
            <Radio.Group value={granularity} onChange={(e) => setGranularity(e.target.value)} buttonStyle="solid">
              <Radio.Button value="day">日</Radio.Button>
              <Radio.Button value="week">周</Radio.Button>
              <Radio.Button value="month">月</Radio.Button>
            </Radio.Group>
          </Col>

          <Col xs={24} md={4}>
            <div style={{ marginBottom: 8, fontWeight: 600, color: 'var(--text-color)' }}>预测天数</div>
            <InputNumber
              min={1}
              max={30}
              value={predictDays}
              onChange={(v) => setPredictDays(v || 7)}
              style={{ width: '100%' }}
            />
          </Col>

          <Col xs={24} md={2}>
            <div style={{ marginBottom: 8, opacity: 0 }}>-</div>
            <Button type="primary" icon={<SearchOutlined />} onClick={handleQuery} loading={loading} block>
              查询
            </Button>
          </Col>
        </Row>

        <Row gutter={8} style={{ marginTop: 12 }}>
          <Col>
            <Button icon={<ReloadOutlined />} onClick={handleReset}>
              重置
            </Button>
          </Col>
          <Col>
            <Button icon={<DownloadOutlined />} onClick={handleExport}>
              导出CSV
            </Button>
          </Col>
        </Row>
      </Card>

      <Spin spinning={chartLoading}>
        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <Card title="能耗/成本/效率趋势（含预测）" bordered={false}>
              <Chart option={trendOption} height={340} loading={chartLoading} />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24} lg={12}>
            <Card title="设备类型能耗占比" bordered={false}>
              <Chart option={ratioOption} height={300} loading={chartLoading} />
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="部门能耗对比" bordered={false}>
              <Chart option={deptCompareOption} height={300} loading={chartLoading} />
            </Card>
          </Col>
        </Row>
      </Spin>

      <Card title="异常记录" bordered={false} style={{ marginTop: 16 }}>
        <Table
          dataSource={anomalies}
          loading={loading}
          columns={[
            { 
              title: '时间', 
              dataIndex: 'time', 
              key: 'time', 
              width: 180,
              sorter: (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime(),
            },
            {
              title: '类型',
              dataIndex: 'type',
              key: 'type',
              width: 100,
              render: (t) => (
                <Tag color={t === '突增' ? 'red' : 'orange'} icon={<ExclamationCircleOutlined />}>
                  {t}
                </Tag>
              ),
              filters: [
                { text: '突增', value: '突增' },
                { text: '突降', value: '突降' },
              ],
              onFilter: (value, record) => record.type === value,
            },
            { title: '设备', dataIndex: 'device', key: 'device', width: 120 },
            { 
              title: '变化', 
              dataIndex: 'value', 
              key: 'value', 
              width: 100,
              render: (v) => (
                <span style={{ 
                  color: v.startsWith('+') ? '#f5222d' : '#52c41a',
                  fontWeight: 600 
                }}>
                  {v}
                </span>
              ),
            },
            { title: '详情', dataIndex: 'detail', key: 'detail', ellipsis: true },
            {
              title: '状态',
              dataIndex: 'status',
              key: 'status',
              width: 100,
              render: (s) => (
                <Tag color={s === '已处理' ? 'green' : 'default'}>
                  {s}
                </Tag>
              ),
              filters: [
                { text: '未处理', value: '未处理' },
                { text: '已处理', value: '已处理' },
              ],
              onFilter: (value, record) => record.status === value,
            },
            {
              title: '操作',
              key: 'action',
              width: 180,
              fixed: 'right',
              render: (_, record) => (
                <Space size="small">
                  {record.status === '未处理' && (
                    <Button 
                      size="small" 
                      type="link" 
                      icon={<CheckOutlined />} 
                      onClick={() => handleMarkProcessed(record.key)}
                    >
                      标记已处理
                    </Button>
                  )}
                  <Button 
                    size="small" 
                    type="link" 
                    icon={<EyeOutlined />} 
                    onClick={() => handleViewDetail(record)}
                  >
                    详情
                  </Button>
                </Space>
              ),
            },
          ]}
          pagination={{ 
            pageSize: 10, 
            showSizeChanger: true, 
            showTotal: (total) => `共 ${total} 条异常记录`,
            showQuickJumper: true,
          }}
        />
      </Card>

      {/* 异常详情弹窗 */}
      <Modal
        title={
          <Space>
            <ExclamationCircleOutlined style={{ color: selectedAnomaly?.type === '突增' ? '#f5222d' : '#faad14' }} />
            <span>异常详情</span>
          </Space>
        }
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailVisible(false)}>
            关闭
          </Button>,
          selectedAnomaly?.status === '未处理' && (
            <Button
              key="process"
              type="primary"
              icon={<CheckOutlined />}
              onClick={async () => {
                await handleMarkProcessed(selectedAnomaly!.key)
                setDetailVisible(false)
              }}
            >
              标记已处理
            </Button>
          ),
        ]}
        width={600}
      >
        {selectedAnomaly && (
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="时间" span={2}>
              {selectedAnomaly.time}
            </Descriptions.Item>
            <Descriptions.Item label="异常类型">
              <Tag color={selectedAnomaly.type === '突增' ? 'red' : 'orange'}>
                {selectedAnomaly.type}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={selectedAnomaly.status === '已处理' ? 'green' : 'default'}>
                {selectedAnomaly.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="设备名称" span={2}>
              {selectedAnomaly.device}
            </Descriptions.Item>
            <Descriptions.Item label="阈值" span={1}>
              {selectedAnomaly.threshold.toLocaleString()} kWh
            </Descriptions.Item>
            <Descriptions.Item label="当前值" span={1}>
              <span style={{ 
                color: selectedAnomaly.type === '突增' ? '#f5222d' : '#faad14',
                fontWeight: 600 
              }}>
                {selectedAnomaly.currentValue.toLocaleString()} kWh ({selectedAnomaly.value})
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="异常描述" span={2}>
              {selectedAnomaly.detail}
            </Descriptions.Item>
            <Descriptions.Item label="处理建议" span={2}>
              <div style={{ 
                padding: '8px 12px', 
                background: '#f0f2f5', 
                borderRadius: '4px',
                color: '#4e5969',
                lineHeight: '1.6'
              }}>
                {selectedAnomaly.suggestion}
              </div>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  )
}

export default SingleStation
