import { useMemo, useState } from 'react'
import { Button, Card, Form, Input, Modal, Select, Space, Switch, Table, Tag, message } from 'antd'
import PageHeader from '../../components/PageHeader'
import useAuthStore, { RoleKey, User } from '../../stores/auth'

type FormValues = Partial<User>

const UserPage = () => {
  const { users, upsertUser, toggleUserStatus } = useAuthStore()
  const [visible, setVisible] = useState(false)
  const [editing, setEditing] = useState<User | undefined>()
  const [form] = Form.useForm<FormValues>()

  const dataSource = useMemo(() => users, [users])

  const openModal = (record?: User) => {
    setEditing(record)
    form.setFieldsValue(record || { role: 'operator', status: true })
    setVisible(true)
  }

  const onSubmit = () => {
    form.validateFields().then((values) => {
      upsertUser({ ...editing, ...values })
      message.success(editing ? '已更新用户' : '已新增用户')
      setVisible(false)
    })
  }

  const columns = [
    { title: '用户名', dataIndex: 'username' },
    { title: '昵称', dataIndex: 'nickname' },
    { title: '角色', dataIndex: 'role', render: (v: RoleKey) => <Tag color="blue">{v}</Tag> },
    { title: '邮箱', dataIndex: 'email' },
    {
      title: '状态',
      dataIndex: 'status',
      render: (v: boolean, record: User) => (
        <Switch checked={v} onChange={(val) => toggleUserStatus(record.id, val)} />
      ),
    },
    { title: '最后登录', dataIndex: 'lastLogin' },
    {
      title: '操作',
      render: (_: unknown, record: User) => (
        <Space>
          <Button size="small" type="link" onClick={() => openModal(record)}>
            编辑
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <PageHeader title="用户管理" subtitle="增删改查、状态控制、角色分配" />
      <Card
        title="用户列表"
        extra={
          <Button type="primary" onClick={() => openModal()}>
            新增用户
          </Button>
        }
      >
        <Table rowKey="id" columns={columns} dataSource={dataSource} />
      </Card>

      <Modal
        title={editing ? '编辑用户' : '新增用户'}
        open={visible}
        onCancel={() => setVisible(false)}
        onOk={onSubmit}
        destroyOnClose
      >
        <Form layout="vertical" form={form}>
          <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input />
          </Form.Item>
          {!editing && (
            <Form.Item name="password" label="密码" rules={[{ required: true, message: '请输入密码' }]}>
              <Input.Password />
            </Form.Item>
          )}
          <Form.Item name="nickname" label="昵称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="role" label="角色" rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'super_admin', label: 'super_admin' },
                { value: 'admin', label: 'admin' },
                { value: 'operator', label: 'operator' },
                { value: 'viewer', label: 'viewer' },
                { value: 'auditor', label: 'auditor' },
              ]}
            />
          </Form.Item>
          <Form.Item name="email" label="邮箱">
            <Input type="email" />
          </Form.Item>
          <Form.Item name="status" label="状态" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default UserPage

