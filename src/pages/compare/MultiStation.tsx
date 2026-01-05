import React, { useState } from 'react'
import { Card, Col, DatePicker, Row, Select, Space, Table, Tag, Button, message, Spin } from 'antd'
import { SearchOutlined, ReloadOutlined, DownloadOutlined } from '@ant-design/icons'
import moment from 'moment'
import PageHeader from '../../components/PageHeader'
import Chart from '../../components/Chart'
import { exportCsv, sleep } from '../../utils/mock'

const stations = [
  { label: '北京南站', value: 'beijing' },
  { label: '上海虹桥站', value: 'shanghai' },
  { label: '广州南站', value: 'guangzhou' },
  { label: '杭州东站', value: 'hangzhou' },
  { label: '深圳北站', value: 'shenzhen' },
  { label: '成都东站', value: 'chengdu' },
]

const MultiStation = () => {
  const [selected, setSelected] = useState(['beijing', 'shanghai', 'guangzhou'])
  const [dateRange, setDateRange] = useState<any>([moment().subtract(30, 'days'), moment()])
  const [energyType, setEnergyType] = useState('total')
  const [loading, setLoading] = useState(false)
  const [chartLoading, setChartLoading] = useState(false)

  const handleQuery = async () => {
    if (selected.length === 0) {
      message.warning('请至少选择一个站点')
      return
    }
    setLoading(true)
    setChartLoading(true)
    await sleep(600)
    message.success('对比分析完成')
    setChartLoading(false)
    setLoading(false)
  }

  const handleReset = () => {
    setSelected(['beijing', 'shanghai', 'guangzhou'])
    setDateRange([moment().subtract(30, 'days'), moment()])
    setEnergyType('total')
    message.info('已重置筛选条件')
  }

  const handleExport = () => {
    const data = [
      ['站点', '总能耗(kWh)', '单位面积能耗(kWh/㎡)', '同比(%)', '能效等级'],
      ...mockTableData.map((row) => [row.station, row.totalEnergy, row.unitEnergy, row.yoy, row.efficiencyLevel]),
    ]
    exportCsv(data, `多站能耗对比_${new Date().toISOString().slice(0, 10)}.csv`)
  }

  const stationName = (val: string) => stations.find((s) => s.value === val)?.label || val

  const mockTableData = [
    { key: 1, station: '北京南站', totalEnergy: 1256000, unitEnergy: 85.6, yoy: -5.2, efficiencyLevel: '一级', rank: 1 },
    { key: 2, station: '上海虹桥站', totalEnergy: 1150000, unitEnergy: 88.1, yoy: -3.8, efficiencyLevel: '一级', rank: 2 },
    { key: 3, station: '广州南站', totalEnergy: 980000, unitEnergy: 92.3, yoy: -2.1, efficiencyLevel: '二级', rank: 3 },
    { key: 4, station: '杭州东站', totalEnergy: 860000, unitEnergy: 78.5, yoy: -6.5, efficiencyLevel: '一级', rank: 4 },
    { key: 5, station: '深圳北站', totalEnergy: 820000, unitEnergy: 95.2, yoy: 1.2, efficiencyLevel: '三级', rank: 5 },
    { key: 6, station: '成都东站', totalEnergy: 750000, unitEnergy: 82.3, yoy: -4.3, efficiencyLevel: '一级', rank: 6 },
  ].filter((row) => selected.includes(stations.find((s) => s.label === row.station)?.value || ''))

  const barOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    xAxis: { type: 'category', data: mockTableData.map((d) => d.station) },
    yAxis: { type: 'value', name: '能耗(kWh)' },
    series: [
      {
        name: '总能耗',
        type: 'bar',
        data: mockTableData.map((d) => d.totalEnergy),
        itemStyle: { color: '#1890ff' },
      },
    ],
  }

  const lineOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: mockTableData.map((d) => d.station) },
    xAxis: { type: 'category', data: ['1月', '2月', '3月', '4月', '5月', '6月'] },
    yAxis: { type: 'value', name: '能耗(kWh)' },
    series: mockTableData.map((d, idx) => ({
      name: d.station,
      type: 'line',
      smooth: true,
      data: [320000, 330000, 310000, 340000, 360000, 350000].map((v) => v - idx * 12000),
    })),
  }

  const tableColumns = [
    { 
      title: '排名', 
      dataIndex: 'rank', 
      key: 'rank', 
      width: 80,
      sorter: (a: any, b: any) => a.rank - b.rank,
      render: (v: number) => (
        <span style={{ 
          fontWeight: 700, 
          color: v === 1 ? '#faad14' : v === 2 ? '#a6a6a6' : v === 3 ? '#cd7f32' : 'inherit' 
        }}>
          {v}
        </span>
      ),
    },
    { title: '站点', dataIndex: 'station', key: 'station', width: 150, fixed: 'left' as const },
    {
      title: '总能耗(kWh)',
      dataIndex: 'totalEnergy',
      key: 'totalEnergy',
      width: 150,
      sorter: (a: any, b: any) => a.totalEnergy - b.totalEnergy,
      render: (v: number) => <span style={{ fontWeight: 600 }}>{v.toLocaleString()}</span>,
    },
    {
      title: '单位面积能耗(kWh/㎡)',
      dataIndex: 'unitEnergy',
      key: 'unitEnergy',
      width: 180,
      sorter: (a: any, b: any) => a.unitEnergy - b.unitEnergy,
    },
    {
      title: '同比(%)',
      dataIndex: 'yoy',
      key: 'yoy',
      width: 120,
      sorter: (a: any, b: any) => a.yoy - b.yoy,
      render: (v: number) => <Tag color={v >= 0 ? 'red' : 'green'}>{v > 0 ? `+${v}` : v}%</Tag>,
    },
    {
      title: '能效等级',
      dataIndex: 'efficiencyLevel',
      key: 'efficiencyLevel',
      width: 120,
      render: (v: string) => {
        const colorMap: Record<string, string> = { 一级: 'green', 二级: 'blue', 三级: 'orange', 四级: 'red' }
        return <Tag color={colorMap[v] || 'default'}>{v}</Tag>
      },
    },
  ]

  return (
    <div>
      <PageHeader
        title="多站能耗对比"
        subtitle="站点选择 · 对比分析 · 能效评估"
        items={[{ title: '首页', href: '/' }, { title: '多站能耗对比' }]}
      />

      <Card bordered={false} style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <div style={{ marginBottom: 8, fontWeight: 600, color: 'var(--text-color)' }}>选择站点（可多选）</div>
            <Select
              mode="multiple"
              allowClear
              maxTagCount="responsive"
              style={{ width: '100%' }}
              placeholder="请选择站点"
              options={stations}
              value={selected}
              onChange={setSelected}
            />
          </Col>

          <Col xs={24} md={6}>
            <div style={{ marginBottom: 8, fontWeight: 600, color: 'var(--text-color)' }}>时间范围</div>
            <DatePicker.RangePicker value={dateRange} onChange={setDateRange} style={{ width: '100%' }} />
          </Col>

          <Col xs={24} md={4}>
            <div style={{ marginBottom: 8, fontWeight: 600, color: 'var(--text-color)' }}>能耗类型</div>
            <Select value={energyType} onChange={setEnergyType} style={{ width: '100%' }}>
              <Select.Option value="total">总能耗</Select.Option>
              <Select.Option value="electric">电力</Select.Option>
              <Select.Option value="water">水</Select.Option>
              <Select.Option value="gas">燃气</Select.Option>
            </Select>
          </Col>

          <Col xs={24} md={6}>
            <div style={{ marginBottom: 8, opacity: 0 }}>-</div>
            <Space>
              <Button type="primary" icon={<SearchOutlined />} onClick={handleQuery} loading={loading}>
                对比分析
              </Button>
              <Button icon={<ReloadOutlined />} onClick={handleReset}>
                重置
              </Button>
              <Button icon={<DownloadOutlined />} onClick={handleExport}>
                导出
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Row gutter={[16, 16]}>
        {mockTableData.slice(0, 4).map((data, idx) => (
          <Col xs={24} sm={12} md={6} key={data.key}>
            <Card>
              <div style={{ fontSize: 14, color: 'var(--text-color-secondary)', marginBottom: 8 }}>{data.station}</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-color)', marginBottom: 8 }}>
                {(data.totalEnergy / 10000).toFixed(1)}万
              </div>
              <Space size="small">
                <Tag color={data.yoy >= 0 ? 'red' : 'green'}>同比 {data.yoy}%</Tag>
                <Tag color="blue">{data.efficiencyLevel}</Tag>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      <Spin spinning={chartLoading}>
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24} lg={12}>
            <Card title="总能耗对比" bordered={false}>
              <Chart option={barOption} height={320} loading={chartLoading} />
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="能耗趋势对比" bordered={false}>
              <Chart option={lineOption} height={320} loading={chartLoading} />
            </Card>
          </Col>
        </Row>
      </Spin>

      <Card title="能效排名表" bordered={false} style={{ marginTop: 16 }}>
        <Table
          rowKey="key"
          dataSource={mockTableData}
          columns={tableColumns}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
        />
      </Card>
    </div>
  )
}

export default MultiStation
