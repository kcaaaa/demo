import { Button, Card, DatePicker, Form, Input, Select, Space, Table, Tag, message } from 'antd'
import PageHeader from '../../components/PageHeader'
import { logMock } from '../../mock/data'

const LogPage = () => {
  const columns = [
    { title: '时间', dataIndex: 'time' },
    { title: '操作人', dataIndex: 'user' },
    { title: '类型', dataIndex: 'type', render: (v: string) => <Tag color="blue">{typeLabel(v)}</Tag> },
    { title: '模块', dataIndex: 'module' },
    { title: '操作内容', dataIndex: 'content' },
    { title: 'IP', dataIndex: 'ip' },
    { title: '结果', dataIndex: 'status', render: (v: string) => <Tag color={v === 'success' ? 'green' : 'red'}>{v}</Tag> },
  ]

  const exportCsv = () => {
    const header = ['时间', '操作人', '类型', '模块', '操作内容', 'IP', '状态']
    const rows = logMock.map((l) => [l.time, l.user, l.type, l.module, l.content, l.ip, l.status])
    const csv = [header, ...rows].map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `操作日志_${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    message.success('已导出 CSV')
  }

  return (
    <div>
      <PageHeader title="操作日志" subtitle="筛选、导出、清理" />
      <Card>
        <Form layout="inline" style={{ marginBottom: 12 }}>
          <Form.Item label="日志类型">
            <Select
              allowClear
              style={{ width: 160 }}
              options={[
                { value: 'login', label: '登录' },
                { value: 'operation', label: '操作' },
                { value: 'error', label: '错误' },
                { value: 'security', label: '安全' },
              ]}
            />
          </Form.Item>
          <Form.Item label="关键词">
            <Input placeholder="操作人或内容" />
          </Form.Item>
          <Form.Item label="时间范围">
            <DatePicker.RangePicker />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary">查询</Button>
              <Button onClick={exportCsv}>导出日志</Button>
              <Button danger>清理旧日志</Button>
            </Space>
          </Form.Item>
        </Form>
        <Table rowKey="id" dataSource={logMock} columns={columns} />
      </Card>
    </div>
  )
}

const typeLabel = (t: string) => {
  switch (t) {
    case 'login':
      return '登录'
    case 'operation':
      return '操作'
    case 'error':
      return '错误'
    case 'security':
      return '安全'
    default:
      return t
  }
}

export default LogPage

