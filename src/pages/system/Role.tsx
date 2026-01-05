import { useState } from 'react'
import { Button, Card, Form, Input, Modal, Space, Switch, Table, Tag, Tree } from 'antd'
import PageHeader from '../../components/PageHeader'
import { defaultRolePermissions, menus } from '../../mock/menu'
import { RoleKey } from '../../stores/auth'

type RoleRecord = {
  id: string
  roleName: string
  roleKey: RoleKey
  description: string
  status: boolean
  permissions: string[]
}

const initialRoles: RoleRecord[] = [
  { id: 'r1', roleName: '超级管理员', roleKey: 'super_admin', description: '拥有全部权限', status: true, permissions: defaultRolePermissions.super_admin },
  { id: 'r2', roleName: '管理员', roleKey: 'admin', description: '管理权限', status: true, permissions: defaultRolePermissions.admin },
  { id: 'r3', roleName: '运营', roleKey: 'operator', description: '运营权限', status: true, permissions: defaultRolePermissions.operator },
]

const RolePage = () => {
  const [roles, setRoles] = useState<RoleRecord[]>(initialRoles)
  const [visible, setVisible] = useState(false)
  const [editing, setEditing] = useState<RoleRecord | null>(null)
  const [form] = Form.useForm<RoleRecord>()
  const columns = [
    { title: '角色名称', dataIndex: 'roleName' },
    { title: '标识', dataIndex: 'roleKey', render: (v: string) => <Tag color="blue">{v}</Tag> },
    { title: '描述', dataIndex: 'description' },
    { title: '状态', dataIndex: 'status', render: (v: boolean) => <Tag color={v ? 'green' : 'red'}>{v ? '启用' : '停用'}</Tag> },
    {
      title: '操作',
      render: (_: unknown, record: RoleRecord) => (
        <Space>
          <Button size="small" type="link" onClick={() => openModal(record)}>
            编辑
          </Button>
        </Space>
      ),
    },
  ]

  const openModal = (record?: RoleRecord) => {
    setEditing(record || null)
    form.setFieldsValue(
      record || { id: '', roleName: '', roleKey: 'admin', description: '', status: true, permissions: [] },
    )
    setVisible(true)
  }

  const onSubmit = () => {
    form.validateFields().then((values) => {
      if (editing) {
        setRoles((prev) => prev.map((r) => (r.id === editing.id ? { ...editing, ...values } : r)))
      } else {
        setRoles((prev) => [...prev, { ...values, id: `r${prev.length + 1}` }])
      }
      setVisible(false)
    })
  }

  return (
    <div>
      <PageHeader title="角色管理" subtitle="角色创建/编辑/权限配置" />
      <Card
        title="角色列表"
        extra={
          <Button type="primary" onClick={() => openModal()}>
            新增角色
          </Button>
        }
      >
        <Table rowKey="id" columns={columns} dataSource={roles} />
      </Card>

      <Modal
        title={editing ? '编辑角色' : '新增角色'}
        open={visible}
        onCancel={() => setVisible(false)}
        onOk={onSubmit}
        width={720}
        destroyOnClose
      >
        <Form layout="vertical" form={form}>
          <Form.Item name="roleName" label="角色名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="roleKey" label="角色标识" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="status" label="状态" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item label="权限配置" name="permissions">
            <Tree
              checkable
              defaultExpandAll
              treeData={toTree(menus)}
              fieldNames={{ title: 'label', key: 'key' }}
              height={260}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

const toTree = (list: any[] = []): any[] =>
  list.map((m) => ({
    title: m.label,
    key: m.key,
    children: m.children ? toTree(m.children) : undefined,
  }))

export default RolePage

