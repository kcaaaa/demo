import React, { useState } from 'react'
import { Card, Col, DatePicker, Input, Row, Select, Space, Table, Tag, Button, message, Spin } from 'antd'
import { SearchOutlined, ReloadOutlined, DownloadOutlined } from '@ant-design/icons'
import moment from 'moment'
import PageHeader from '../../components/PageHeader'
import Chart from '../../components/Chart'
import { exportCsv, sleep } from '../../utils/mock'

const EnergyRatio = () => {
  const [keyword, setKeyword] = useState('')
  const [dateRange, setDateRange] = useState<any>([moment().subtract(30, 'days'), moment()])
  const [energyType, setEnergyType] = useState('total')
  const [loading, setLoading] = useState(false)
  const [chartLoading, setChartLoading] = useState(false)

  const handleQuery = async () => {
    setLoading(true)
    setChartLoading(true)
    await sleep(600)
    message.success('查询完成')
    setChartLoading(false)
    setLoading(false)
  }

  const handleReset = () => {
    setKeyword('')
    setDateRange([moment().subtract(30, 'days'), moment()])
    setEnergyType('total')
    message.info('已重置筛选条件')
  }

  const handleExport = () => {
    const data = [
      ['名称', '能耗值(kWh)', '占比(%)', '成本(元)', '同比(%)', '环比(%)'],
      ...mockTableData.map((row) => [row.name, row.energyConsumption, row.percentage, row.cost, row.yearOnYear, row.monthOnMonth]),
    ]
    exportCsv(data, `能耗占比分析_${new Date().toISOString().slice(0, 10)}.csv`)
  }

  const mockTableData = [
    { key: 1, name: '候车大厅', energyConsumption: 12500, percentage: 35, cost: 8750, yearOnYear: -5.2, monthOnMonth: 2.1 },
    { key: 2, name: '站台区域', energyConsumption: 8200, percentage: 22, cost: 6200, yearOnYear: 3.2, monthOnMonth: -1.2 },
    { key: 3, name: '办公区域', energyConsumption: 6500, percentage: 18, cost: 4875, yearOnYear: 1.5, monthOnMonth: 0.8 },
    { key: 4, name: '商业区域', energyConsumption: 5800, percentage: 16, cost: 4350, yearOnYear: -2.3, monthOnMonth: -0.5 },
    { key: 5, name: '设备机房', energyConsumption: 3200, percentage: 9, cost: 2400, yearOnYear: 0.8, monthOnMonth: 1.2 },
  ]

  const pieOption = (title: string, data: { value: number; name: string; itemStyle: { color: string } }[]) => ({
    title: { text: title, left: 'center', top: 12, textStyle: { fontSize: 14, fontWeight: 600 } },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} kWh ({d}%)',
    },
    series: [
      {
        name: title,
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: true,
        label: {
          show: true,
          formatter: '{b}: {d}%',
          fontSize: 12,
        },
        data,
      },
    ],
  })

  const areaOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
    },
    legend: { data: ['空调', '照明', '动力', '其他'] },
    xAxis: { type: 'category', data: ['1月', '2月', '3月', '4月', '5月', '6月'] },
    yAxis: { type: 'value', name: '能耗(kWh)' },
    series: [
      {
        name: '空调',
        type: 'line',
        stack: 'Total',
        areaStyle: { color: 'rgba(24, 144, 255, 0.3)' },
        data: [12800, 12300, 13500, 13900, 13200, 12900],
        itemStyle: { color: '#1890ff' },
      },
      {
        name: '照明',
        type: 'line',
        stack: 'Total',
        areaStyle: { color: 'rgba(82, 196, 26, 0.3)' },
        data: [6800, 6500, 6900, 7100, 6800, 6600],
        itemStyle: { color: '#52c41a' },
      },
      {
        name: '动力',
        type: 'line',
        stack: 'Total',
        areaStyle: { color: 'rgba(250, 173, 20, 0.3)' },
        data: [5400, 5200, 5600, 5800, 5500, 5300],
        itemStyle: { color: '#faad14' },
      },
      {
        name: '其他',
        type: 'line',
        stack: 'Total',
        areaStyle: { color: 'rgba(114, 46, 209, 0.3)' },
        data: [3200, 3100, 3300, 3400, 3300, 3200],
        itemStyle: { color: '#722ed1' },
      },
    ],
  }

  const tableColumns = [
    { 
      title: '名称', 
      dataIndex: 'name', 
      key: 'name', 
      width: 150,
      fixed: 'left' as const,
    },
    {
      title: '能耗值(kWh)',
      dataIndex: 'energyConsumption',
      key: 'energyConsumption',
      width: 150,
      sorter: (a: any, b: any) => a.energyConsumption - b.energyConsumption,
      render: (v: number) => <span style={{ fontWeight: 600 }}>{v.toLocaleString()}</span>,
    },
    {
      title: '占比(%)',
      dataIndex: 'percentage',
      key: 'percentage',
      width: 100,
      sorter: (a: any, b: any) => a.percentage - b.percentage,
      render: (v: number) => (
        <Tag color="blue" style={{ minWidth: '50px', textAlign: 'center' }}>
          {v}%
        </Tag>
      ),
    },
    { 
      title: '成本(元)', 
      dataIndex: 'cost', 
      key: 'cost', 
      width: 120, 
      sorter: (a: any, b: any) => a.cost - b.cost,
      render: (v: number) => `¥${v.toLocaleString()}`,
    },
    {
      title: '同比(%)',
      dataIndex: 'yearOnYear',
      key: 'yearOnYear',
      width: 100,
      sorter: (a: any, b: any) => a.yearOnYear - b.yearOnYear,
      render: (v: number) => (
        <Tag color={v > 0 ? 'red' : v < 0 ? 'green' : 'default'}>
          {v > 0 ? `+${v}` : v}%
        </Tag>
      ),
    },
    {
      title: '环比(%)',
      dataIndex: 'monthOnMonth',
      key: 'monthOnMonth',
      width: 100,
      sorter: (a: any, b: any) => a.monthOnMonth - b.monthOnMonth,
      render: (v: number) => (
        <Tag color={v > 0 ? 'red' : v < 0 ? 'green' : 'default'}>
          {v > 0 ? `+${v}` : v}%
        </Tag>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="能耗占比分析"
        subtitle="区域/设备/时段/能耗类型占比与趋势"
        items={[{ title: '首页', href: '/' }, { title: '能耗占比分析' }]}
      />

      <Card bordered={false} style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={6}>
            <div style={{ marginBottom: 8, fontWeight: 600, color: 'var(--text-color)' }}>关键词</div>
            <Input placeholder="设备名称/区域名称" value={keyword} onChange={(e) => setKeyword(e.target.value)} allowClear />
          </Col>

          <Col xs={24} md={8}>
            <div style={{ marginBottom: 8, fontWeight: 600, color: 'var(--text-color)' }}>日期范围</div>
            <DatePicker.RangePicker value={dateRange} onChange={setDateRange} style={{ width: '100%' }} />
          </Col>

          <Col xs={24} md={6}>
            <div style={{ marginBottom: 8, fontWeight: 600, color: 'var(--text-color)' }}>能耗类型</div>
            <Select value={energyType} onChange={setEnergyType} style={{ width: '100%' }}>
              <Select.Option value="total">总能耗</Select.Option>
              <Select.Option value="electric">电力</Select.Option>
              <Select.Option value="water">水</Select.Option>
              <Select.Option value="gas">燃气</Select.Option>
            </Select>
          </Col>

          <Col xs={24} md={4}>
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
          <Col xs={24} md={12} lg={6}>
            <Card>
              <Chart
                option={pieOption('按区域', [
                  { value: 12500, name: '候车大厅', itemStyle: { color: '#1890ff' } },
                  { value: 8200, name: '站台区域', itemStyle: { color: '#52c41a' } },
                  { value: 6500, name: '办公区域', itemStyle: { color: '#faad14' } },
                  { value: 5800, name: '商业区域', itemStyle: { color: '#722ed1' } },
                  { value: 3200, name: '设备机房', itemStyle: { color: '#13c2c2' } },
                ])}
                height={240}
                loading={chartLoading}
              />
            </Card>
          </Col>
          <Col xs={24} md={12} lg={6}>
            <Card>
              <Chart
                option={pieOption('按设备类型', [
                  { value: 15625, name: '空调', itemStyle: { color: '#1890ff' } },
                  { value: 8750, name: '照明', itemStyle: { color: '#52c41a' } },
                  { value: 7000, name: '动力', itemStyle: { color: '#faad14' } },
                  { value: 3500, name: '电梯', itemStyle: { color: '#722ed1' } },
                  { value: 1400, name: '其他', itemStyle: { color: '#13c2c2' } },
                ])}
                height={240}
                loading={chartLoading}
              />
            </Card>
          </Col>
          <Col xs={24} md={12} lg={6}>
            <Card>
              <Chart
                option={pieOption('按时段', [
                  { value: 12000, name: '早高峰(7-9时)', itemStyle: { color: '#1890ff' } },
                  { value: 9500, name: '白天(9-18时)', itemStyle: { color: '#52c41a' } },
                  { value: 11000, name: '晚高峰(18-21时)', itemStyle: { color: '#faad14' } },
                  { value: 4500, name: '夜间(21-7时)', itemStyle: { color: '#722ed1' } },
                ])}
                height={240}
                loading={chartLoading}
              />
            </Card>
          </Col>
          <Col xs={24} md={12} lg={6}>
            <Card>
              <Chart
                option={pieOption('按能耗类型', [
                  { value: 28000, name: '电力', itemStyle: { color: '#1890ff' } },
                  { value: 5000, name: '水', itemStyle: { color: '#52c41a' } },
                  { value: 3200, name: '燃气', itemStyle: { color: '#faad14' } },
                  { value: 1000, name: '其他', itemStyle: { color: '#722ed1' } },
                ])}
                height={240}
                loading={chartLoading}
              />
            </Card>
          </Col>
        </Row>

        <Card title="能耗占比堆叠趋势" bordered={false} style={{ marginTop: 16 }}>
          <Chart option={areaOption} height={320} loading={chartLoading} />
        </Card>
      </Spin>

      <Card title="详细数据" bordered={false} style={{ marginTop: 16 }}>
        <Table
          rowKey="key"
          loading={loading}
          columns={tableColumns}
          dataSource={mockTableData}
          scroll={{ x: 900 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条数据`,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
        />
      </Card>
    </div>
  )
}

export default EnergyRatio
