import React, { useState } from 'react'
import { Badge, Button, Card, Col, Row, Select, Space, Table, Tag, message, Spin, Modal } from 'antd'
import { SearchOutlined, ReloadOutlined, DownloadOutlined, EyeOutlined, CheckOutlined } from '@ant-design/icons'
import PageHeader from '../../components/PageHeader'
import Chart from '../../components/Chart'
import { exportCsv, sleep } from '../../utils/mock'

const AlertCenter = () => {
  const [status, setStatus] = useState<string>('all')
  const [level, setLevel] = useState<string>('all')
  const [loading, setLoading] = useState(false)
  const [chartLoading, setChartLoading] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])

  const [alerts, setAlerts] = useState([
    {
      key: 1,
      time: '2024-01-15 14:30',
      station: '北京站',
      type: '能耗突增',
      level: '高危',
      content: '空调系统能耗突增35%',
      status: 'unprocessed',
      handler: '-',
      detail: '检测到空调系统1#机组能耗异常升高，可能存在设备故障',
    },
    {
      key: 2,
      time: '2024-01-15 12:15',
      station: '上海站',
      type: '阈值超标',
      level: '中危',
      content: '照明能耗超出阈值18%',
      status: 'processing',
      handler: '张三',
      detail: '站台照明系统能耗超出设定阈值，需现场排查',
    },
    {
      key: 3,
      time: '2024-01-15 09:20',
      station: '广州站',
      type: '能耗波动',
      level: '低危',
      content: '电梯能耗轻微波动',
      status: 'resolved',
      handler: '李四',
      detail: '电梯系统能耗出现轻微波动，已确认为正常运行',
    },
    {
      key: 4,
      time: '2024-01-14 16:45',
      station: '深圳站',
      type: '设备异常',
      level: '高危',
      content: '动力设备能耗异常',
      status: 'unprocessed',
      handler: '-',
      detail: '动力设备运行异常，能耗超出正常范围',
    },
    {
      key: 5,
      time: '2024-01-14 11:30',
      station: '北京站',
      type: '能耗突降',
      level: '中危',
      content: '照明系统能耗突降22%',
      status: 'resolved',
      handler: '王五',
      detail: '照明系统部分区域断电，已修复',
    },
  ])

  const filteredAlerts = alerts.filter((a) => {
    if (status !== 'all' && a.status !== status) return false
    if (level !== 'all' && a.level !== level) return false
    return true
  })

  const handleQuery = async () => {
    setLoading(true)
    setChartLoading(true)
    await sleep(600)
    message.success('查询完成')
    setChartLoading(false)
    setLoading(false)
  }

  const handleReset = () => {
    setStatus('all')
    setLevel('all')
    message.info('已重置筛选条件')
  }

  const handleExport = () => {
    const data = [
      ['时间', '站点', '类型', '等级', '内容', '状态', '处理人'],
      ...filteredAlerts.map((a) => [
        a.time,
        a.station,
        a.type,
        a.level,
        a.content,
        statusLabel(a.status),
        a.handler,
      ]),
    ]
    exportCsv(data, `预警记录_${new Date().toISOString().slice(0, 10)}.csv`)
  }

  const handleMarkProcessed = async (key: number) => {
    setLoading(true)
    await sleep(400)
    setAlerts((prev) =>
      prev.map((a) => (a.key === key ? { ...a, status: 'processing', handler: '当前用户' } : a))
    )
    message.success('已标记为处理中')
    setLoading(false)
  }

  const handleResolve = async (key: number) => {
    setLoading(true)
    await sleep(400)
    setAlerts((prev) => prev.map((a) => (a.key === key ? { ...a, status: 'resolved' } : a)))
    message.success('已标记为已解决')
    setLoading(false)
  }

  // 批量标记处理
  const handleBatchProcess = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要处理的预警')
      return
    }
    setLoading(true)
    await sleep(500)
    setAlerts((prev) =>
      prev.map((a) => (selectedRowKeys.includes(a.key) && a.status === 'unprocessed' 
        ? { ...a, status: 'processing', handler: '当前用户' } 
        : a))
    )
    message.success(`已批量标记 ${selectedRowKeys.length} 条预警为处理中`)
    setSelectedRowKeys([])
    setLoading(false)
  }

  // 批量标记解决
  const handleBatchResolve = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要解决的预警')
      return
    }
    setLoading(true)
    await sleep(500)
    setAlerts((prev) =>
      prev.map((a) => (selectedRowKeys.includes(a.key) && a.status !== 'resolved'
        ? { ...a, status: 'resolved' }
        : a))
    )
    message.success(`已批量标记 ${selectedRowKeys.length} 条预警为已解决`)
    setSelectedRowKeys([])
    setLoading(false)
  }

  // 行选择配置
  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
    getCheckboxProps: (record: any) => ({
      disabled: record.status === 'resolved',
    }),
  }

  const handleViewDetail = (record: any) => {
    Modal.info({
      title: '预警详情',
      width: 600,
      content: (
        <div>
          <p><strong>时间：</strong>{record.time}</p>
          <p><strong>站点：</strong>{record.station}</p>
          <p><strong>类型：</strong>{record.type}</p>
          <p><strong>等级：</strong><Tag color={levelColor(record.level)}>{record.level}</Tag></p>
          <p><strong>内容：</strong>{record.content}</p>
          <p><strong>详细说明：</strong>{record.detail}</p>
          <p><strong>状态：</strong><Tag color={statusColor(record.status)}>{statusLabel(record.status)}</Tag></p>
          <p><strong>处理人：</strong>{record.handler}</p>
        </div>
      ),
    })
  }

  const overview = {
    total: alerts.length,
    high: alerts.filter((a) => a.level === '高危').length,
    medium: alerts.filter((a) => a.level === '中危').length,
    low: alerts.filter((a) => a.level === '低危').length,
    unprocessed: alerts.filter((a) => a.status === 'unprocessed').length,
  }

  const levelPie = {
    tooltip: { trigger: 'item', formatter: '{a} <br/>{b}: {c} ({d}%)' },
    series: [
      {
        name: '预警等级分布',
        type: 'pie',
        radius: ['40%', '70%'],
        data: [
          { value: overview.high, name: '高危', itemStyle: { color: '#f5222d' } },
          { value: overview.medium, name: '中危', itemStyle: { color: '#faad14' } },
          { value: overview.low, name: '低危', itemStyle: { color: '#52c41a' } },
        ],
        label: { formatter: '{b}: {c}' },
      },
    ],
  }

  const trendOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['高危', '中危', '低危'] },
    xAxis: { type: 'category', data: ['1日', '2日', '3日', '4日', '5日', '6日', '7日'] },
    yAxis: { type: 'value', name: '预警数' },
    series: [
      { name: '高危', type: 'line', data: [5, 3, 4, 6, 2, 5, 3], itemStyle: { color: '#f5222d' } },
      { name: '中危', type: 'line', data: [8, 10, 7, 9, 11, 8, 12], itemStyle: { color: '#faad14' } },
      { name: '低危', type: 'line', data: [12, 15, 10, 13, 16, 14, 18], itemStyle: { color: '#52c41a' } },
    ],
  }

  const columns = [
    { title: '时间', dataIndex: 'time', key: 'time', width: 160 },
    { title: '站点', dataIndex: 'station', key: 'station', width: 100 },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (v: string) => <Tag color="blue">{v}</Tag>,
    },
    {
      title: '等级',
      dataIndex: 'level',
      key: 'level',
      width: 100,
      render: (v: string) => <Badge color={levelColor(v)} text={v} />,
    },
    { title: '内容', dataIndex: 'content', key: 'content' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (v: string) => <Tag color={statusColor(v)}>{statusLabel(v)}</Tag>,
    },
    { title: '处理人', dataIndex: 'handler', key: 'handler', width: 100 },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: any, record: any) => (
        <Space size="small">
          <Button size="small" type="link" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
            详情
          </Button>
          {record.status === 'unprocessed' && (
            <Button size="small" type="link" icon={<CheckOutlined />} onClick={() => handleMarkProcessed(record.key)}>
              处理
            </Button>
          )}
          {record.status === 'processing' && (
            <Button size="small" type="link" onClick={() => handleResolve(record.key)}>
              解决
            </Button>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="能耗分析预警"
        subtitle="实时监控 · 智能异常检测 · 分级预警 · 处理流程"
        items={[{ title: '首页', href: '/' }, { title: '能耗分析预警' }]}
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <div style={{ fontSize: 14, color: 'var(--text-color-secondary)', marginBottom: 8 }}>预警总数</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-color)' }}>{overview.total}</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <div style={{ fontSize: 14, color: 'var(--text-color-secondary)', marginBottom: 8 }}>高危预警</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#f5222d' }}>{overview.high}</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <div style={{ fontSize: 14, color: 'var(--text-color-secondary)', marginBottom: 8 }}>中危预警</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#faad14' }}>{overview.medium}</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <div style={{ fontSize: 14, color: 'var(--text-color-secondary)', marginBottom: 8 }}>待处理</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#1890ff' }}>{overview.unprocessed}</div>
          </Card>
        </Col>
      </Row>

      <Card bordered={false} style={{ marginTop: 16 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <div style={{ marginBottom: 8, fontWeight: 600, color: 'var(--text-color)' }}>预警状态</div>
            <Select value={status} onChange={setStatus} style={{ width: '100%' }}>
              <Select.Option value="all">全部</Select.Option>
              <Select.Option value="unprocessed">未处理</Select.Option>
              <Select.Option value="processing">处理中</Select.Option>
              <Select.Option value="resolved">已解决</Select.Option>
            </Select>
          </Col>

          <Col xs={24} md={8}>
            <div style={{ marginBottom: 8, fontWeight: 600, color: 'var(--text-color)' }}>预警等级</div>
            <Select value={level} onChange={setLevel} style={{ width: '100%' }}>
              <Select.Option value="all">全部</Select.Option>
              <Select.Option value="高危">高危</Select.Option>
              <Select.Option value="中危">中危</Select.Option>
              <Select.Option value="低危">低危</Select.Option>
            </Select>
          </Col>

          <Col xs={24} md={8}>
            <div style={{ marginBottom: 8, opacity: 0 }}>-</div>
            <Space>
              <Button type="primary" icon={<SearchOutlined />} onClick={handleQuery} loading={loading}>
                查询
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

      <Spin spinning={chartLoading}>
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24} lg={12}>
            <Card title="预警等级分布" bordered={false}>
              <Chart option={levelPie} height={300} loading={chartLoading} />
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="预警趋势" bordered={false}>
              <Chart option={trendOption} height={300} loading={chartLoading} />
            </Card>
          </Col>
        </Row>
      </Spin>

      <Card 
        title="预警列表" 
        bordered={false} 
        style={{ marginTop: 16 }}
        extra={
          selectedRowKeys.length > 0 && (
            <Space>
              <span style={{ color: 'var(--text-color-secondary)' }}>
                已选择 <strong style={{ color: 'var(--primary-color)' }}>{selectedRowKeys.length}</strong> 条
              </span>
              <Button 
                size="small" 
                type="primary" 
                onClick={handleBatchProcess}
                disabled={loading}
              >
                批量标记处理
              </Button>
              <Button 
                size="small" 
                onClick={handleBatchResolve}
                disabled={loading}
              >
                批量标记解决
              </Button>
              <Button 
                size="small" 
                onClick={() => setSelectedRowKeys([])}
              >
                取消选择
              </Button>
            </Space>
          )
        }
      >
        <Table
          rowKey="key"
          dataSource={filteredAlerts}
          columns={columns}
          loading={loading}
          rowSelection={rowSelection}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条预警记录`,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
        />
      </Card>
    </div>
  )
}

const levelColor = (level: string) => {
  const map: Record<string, string> = { 高危: 'red', 中危: 'orange', 低危: 'green' }
  return map[level] || 'default'
}

const statusColor = (status: string) => {
  const map: Record<string, string> = { unprocessed: 'default', processing: 'blue', resolved: 'green' }
  return map[status] || 'default'
}

const statusLabel = (status: string) => {
  const map: Record<string, string> = { unprocessed: '未处理', processing: '处理中', resolved: '已解决' }
  return map[status] || status
}

export default AlertCenter
