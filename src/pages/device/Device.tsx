import React, { useState } from 'react'
import { Card, Col, Form, Input, Row, Select, Space, Table, Tag, Button, Modal, message, Spin, Tabs } from 'antd'
import { SearchOutlined, ReloadOutlined, PlusOutlined, EditOutlined, DeleteOutlined, DownloadOutlined } from '@ant-design/icons'
import PageHeader from '../../components/PageHeader'
import Chart from '../../components/Chart'
import { exportCsv, sleep } from '../../utils/mock'

type SystemRecord = {
  systemId: string
  systemName: string
  systemType: string
  deviceCount: number
  totalPower: number
  status: string
  createTime: string
}

const Device = () => {
  const [systemType, setSystemType] = useState<string>('')
  const [status, setStatus] = useState<string>('')
  const [keyword, setKeyword] = useState('')
  const [loading, setLoading] = useState(false)
  const [chartLoading, setChartLoading] = useState(false)

  const [data, setData] = useState<SystemRecord[]>([
    {
      systemId: 'sys-1',
      systemName: '照明系统1',
      systemType: '照明',
      deviceCount: 120,
      totalPower: 320,
      status: 'running',
      createTime: '2025-01-01',
    },
    {
      systemId: 'sys-2',
      systemName: '空调系统1',
      systemType: '空调',
      deviceCount: 80,
      totalPower: 450,
      status: 'running',
      createTime: '2025-02-10',
    },
    {
      systemId: 'sys-3',
      systemName: '通风系统1',
      systemType: '通风',
      deviceCount: 50,
      totalPower: 180,
      status: 'stop',
      createTime: '2025-03-15',
    },
  ])

  const [visible, setVisible] = useState(false)
  const [editing, setEditing] = useState<SystemRecord | null>(null)
  const [form] = Form.useForm<SystemRecord>()

  const openModal = (record?: SystemRecord) => {
    setEditing(record || null)
    if (record) {
      form.setFieldsValue(record)
    } else {
      form.resetFields()
      form.setFieldsValue({
        systemId: `sys-${Date.now()}`,
        status: 'running',
        createTime: new Date().toISOString().slice(0, 10),
      })
    }
    setVisible(true)
  }

  const handleQuery = async () => {
    setLoading(true)
    setChartLoading(true)
    await sleep(600)
    message.success('查询完成')
    setChartLoading(false)
    setLoading(false)
  }

  const handleReset = () => {
    setSystemType('')
    setStatus('')
    setKeyword('')
    message.info('已重置筛选条件')
  }

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)
      await sleep(400)

      if (editing) {
        setData((prev) => prev.map((item) => (item.systemId === editing.systemId ? { ...item, ...values } : item)))
        message.success('系统信息已更新')
      } else {
        setData((prev) => [...prev, values])
        message.success('系统已添加')
      }

      setVisible(false)
      setLoading(false)
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (systemId: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '删除后无法恢复，确定要删除此系统吗？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        setLoading(true)
        await sleep(400)
        setData((prev) => prev.filter((i) => i.systemId !== systemId))
        message.success('系统已删除')
        setLoading(false)
      },
    })
  }

  const handleExport = () => {
    const exportData = [
      ['系统ID', '系统名称', '类型', '设备数', '总功率(kW)', '状态', '创建时间'],
      ...filteredData.map((row) => [
        row.systemId,
        row.systemName,
        row.systemType,
        row.deviceCount,
        row.totalPower,
        row.status === 'running' ? '运行中' : '停机',
        row.createTime,
      ]),
    ]
    exportCsv(exportData, `设备系统列表_${new Date().toISOString().slice(0, 10)}.csv`)
  }

  const filteredData = data.filter((item) => {
    if (systemType && item.systemType !== systemType) return false
    if (status && item.status !== status) return false
    if (keyword && !item.systemName.includes(keyword)) return false
    return true
  })

  const systemColumns = [
    { title: '系统ID', dataIndex: 'systemId', key: 'systemId', width: 120 },
    { title: '系统名称', dataIndex: 'systemName', key: 'systemName', width: 150 },
    {
      title: '类型',
      dataIndex: 'systemType',
      key: 'systemType',
      width: 100,
      render: (v: string) => <Tag color="blue">{v}</Tag>,
    },
    { title: '设备数', dataIndex: 'deviceCount', key: 'deviceCount', width: 100 },
    { title: '总功率(kW)', dataIndex: 'totalPower', key: 'totalPower', width: 120 },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (v: string) => <Tag color={v === 'running' ? 'green' : 'default'}>{v === 'running' ? '运行中' : '停机'}</Tag>,
    },
    { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 120 },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: unknown, record: SystemRecord) => (
        <Space size="small">
          <Button size="small" type="link" icon={<EditOutlined />} onClick={() => openModal(record)}>
            编辑
          </Button>
          <Button size="small" type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.systemId)}>
            删除
          </Button>
        </Space>
      ),
    },
  ]

  const trendOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['照明', '空调', '通风'] },
    xAxis: { type: 'category', data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'] },
    yAxis: { type: 'value', name: '能耗(kWh)' },
    series: [
      { name: '照明', type: 'line', data: [120, 132, 101, 134, 90, 230, 210], itemStyle: { color: '#1890ff' } },
      { name: '空调', type: 'line', data: [220, 182, 191, 234, 290, 330, 310], itemStyle: { color: '#52c41a' } },
      { name: '通风', type: 'line', data: [150, 232, 201, 154, 190, 330, 410], itemStyle: { color: '#faad14' } },
    ],
  }

  const ratioOption = {
    tooltip: { trigger: 'item', formatter: '{a} <br/>{b}: {c} kWh ({d}%)' },
    series: [
      {
        name: '能耗占比',
        type: 'pie',
        radius: ['40%', '70%'],
        data: [
          { value: 5625, name: '照明', itemStyle: { color: '#1890ff' } },
          { value: 8750, name: '空调', itemStyle: { color: '#52c41a' } },
          { value: 4500, name: '通风', itemStyle: { color: '#faad14' } },
        ],
        label: { formatter: '{b}: {d}%' },
      },
    ],
  }

  return (
    <div>
      <PageHeader
        title="设备管理"
        subtitle="系统管理 · 能耗分析 · 设备分类 · 维护记录 · 能耗预测 · 异常预警"
        items={[{ title: '首页', path: '/' }, { title: '设备管理' }]}
      />

      <Card bordered={false} style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={5}>
            <div style={{ marginBottom: 8, fontWeight: 600, color: 'var(--text-color)' }}>关键词</div>
            <Input placeholder="系统名称" value={keyword} onChange={(e) => setKeyword(e.target.value)} allowClear />
          </Col>

          <Col xs={24} md={5}>
            <div style={{ marginBottom: 8, fontWeight: 600, color: 'var(--text-color)' }}>系统类型</div>
            <Select value={systemType} onChange={setSystemType} style={{ width: '100%' }} allowClear placeholder="全部">
              <Select.Option value="照明">照明</Select.Option>
              <Select.Option value="空调">空调</Select.Option>
              <Select.Option value="通风">通风</Select.Option>
              <Select.Option value="电梯">电梯</Select.Option>
            </Select>
          </Col>

          <Col xs={24} md={5}>
            <div style={{ marginBottom: 8, fontWeight: 600, color: 'var(--text-color)' }}>状态</div>
            <Select value={status} onChange={setStatus} style={{ width: '100%' }} allowClear placeholder="全部">
              <Select.Option value="running">运行中</Select.Option>
              <Select.Option value="stop">停机</Select.Option>
            </Select>
          </Col>

          <Col xs={24} md={9}>
            <div style={{ marginBottom: 8, opacity: 0 }}>-</div>
            <Space>
              <Button type="primary" icon={<SearchOutlined />} onClick={handleQuery} loading={loading}>
                查询
              </Button>
              <Button icon={<ReloadOutlined />} onClick={handleReset}>
                重置
              </Button>
              <Button icon={<PlusOutlined />} onClick={() => openModal()}>
                新增系统
              </Button>
              <Button icon={<DownloadOutlined />} onClick={handleExport}>
                导出
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Card title="系统列表" bordered={false} style={{ marginBottom: 16 }}>
        <Table
          rowKey="systemId"
          dataSource={filteredData}
          columns={systemColumns}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
        />
      </Card>

      <Spin spinning={chartLoading}>
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={16}>
            <Card title="系统能耗趋势" bordered={false}>
              <Chart option={trendOption} height={320} loading={chartLoading} />
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card title="系统能耗占比" bordered={false}>
              <Chart option={ratioOption} height={320} loading={chartLoading} />
            </Card>
          </Col>
        </Row>
      </Spin>

      <Card title="其他功能" bordered={false} style={{ marginTop: 16 }}>
        <Tabs
          items={[
            {
              key: 'maintenance',
              label: '维护记录',
              children: (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-color-secondary)' }}>
                  维护记录功能（待实现）
                </div>
              ),
            },
            {
              key: 'warning',
              label: '异常预警',
              children: (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-color-secondary)' }}>
                  异常预警功能（待实现）
                </div>
              ),
            },
            {
              key: 'report',
              label: '报表生成',
              children: (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-color-secondary)' }}>
                  报表生成功能（待实现）
                </div>
              ),
            },
            {
              key: 'prediction',
              label: '能耗预测',
              children: (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-color-secondary)' }}>
                  能耗预测功能（待实现）
                </div>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        title={editing ? '编辑系统' : '新增系统'}
        open={visible}
        onOk={handleSave}
        onCancel={() => setVisible(false)}
        confirmLoading={loading}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="systemId" label="系统ID" rules={[{ required: true, message: '请输入系统ID' }]}>
            <Input disabled={!!editing} />
          </Form.Item>
          <Form.Item name="systemName" label="系统名称" rules={[{ required: true, message: '请输入系统名称' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="systemType" label="系统类型" rules={[{ required: true, message: '请选择系统类型' }]}>
            <Select>
              <Select.Option value="照明">照明</Select.Option>
              <Select.Option value="空调">空调</Select.Option>
              <Select.Option value="通风">通风</Select.Option>
              <Select.Option value="电梯">电梯</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="deviceCount" label="设备数量" rules={[{ required: true, message: '请输入设备数量' }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="totalPower" label="总功率(kW)" rules={[{ required: true, message: '请输入总功率' }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="status" label="状态" rules={[{ required: true, message: '请选择状态' }]}>
            <Select>
              <Select.Option value="running">运行中</Select.Option>
              <Select.Option value="stop">停机</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="createTime" label="创建时间">
            <Input disabled />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Device
