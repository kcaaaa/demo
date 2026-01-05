import { Button, Card, Form, Input, Modal, Space, Switch, Table, Tag } from 'antd'
import { useState } from 'react'
import PageHeader from '../../components/PageHeader'
import { menus } from '../../mock/menu'

type MenuRecord = {
  id: number
  menuName: string
  menuPath: string
  icon?: string
  sort: number
  parent?: string
  status: boolean
}

const initial: MenuRecord[] = menus.flatMap((m, idx) => {
  const base: MenuRecord[] = [
    { id: idx + 1, menuName: m.label, menuPath: m.path, icon: undefined, sort: idx + 1, parent: undefined, status: true },
  ]
  if (m.children) {
    base.push(
      ...m.children.map((c, cidx) => ({
        id: (idx + 1) * 10 + cidx + 1,
        menuName: c.label,
        menuPath: c.path,
        icon: undefined,
        sort: cidx + 1,
        parent: m.label,
        status: true,
      })),
    )
  }
  return base
})

const MenuPage = () => {
  const [data, setData] = useState<MenuRecord[]>(initial)
  const [visible, setVisible] = useState(false)
  const [editing, setEditing] = useState<MenuRecord | null>(null)
  const [form] = Form.useForm<MenuRecord>()

  const openModal = (record?: MenuRecord) => {
    setEditing(record || null)
    form.setFieldsValue(record || { status: true, sort: 1 })
    setVisible(true)
  }

  const onSubmit = () => {
    form.validateFields().then((values) => {
      if (editing) {
        setData((prev) => prev.map((item) => (item.id === editing.id ? { ...editing, ...values } : item)))
      } else {
        setData((prev) => [...prev, { ...values, id: prev.length + 1 }])
      }
      setVisible(false)
    })
  }

  const columns = [
    { title: '名称', dataIndex: 'menuName' },
    { title: '路径', dataIndex: 'menuPath' },
    { title: '父菜单', dataIndex: 'parent', render: (v: string | undefined) => v || '-' },
    { title: '排序', dataIndex: 'sort' },
    { title: '状态', dataIndex: 'status', render: (v: boolean) => <Tag color={v ? 'green' : 'red'}>{v ? '启用' : '禁用'}</Tag> },
    {
      title: '操作',
      render: (_: unknown, record: MenuRecord) => (
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
      <PageHeader title="菜单管理" subtitle="多级菜单、状态、排序与图标配置" />
      <Card
        title="菜单列表"
        extra={
          <Button type="primary" onClick={() => openModal()}>
            新增菜单
          </Button>
        }
      >
        <Table rowKey="id" columns={columns} dataSource={data} />
      </Card>

      <Modal title={editing ? '编辑菜单' : '新增菜单'} open={visible} onCancel={() => setVisible(false)} onOk={onSubmit} destroyOnClose>
        <Form layout="vertical" form={form}>
          <Form.Item name="menuName" label="名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="menuPath" label="路径" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="parent" label="父菜单">
            <Input />
          </Form.Item>
          <Form.Item name="sort" label="排序" rules={[{ required: true }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="status" label="状态" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default MenuPage

