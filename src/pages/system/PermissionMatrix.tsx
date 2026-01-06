import { Card, Table, Tag } from 'antd'
import PageHeader from '../../components/PageHeader'
import { matrixMock } from '../../mock/data'

const PermissionMatrixPage = () => {
  const columns = [
    { title: '权限项', dataIndex: 'permission' },
    { title: '超级管理员', dataIndex: 'super_admin', render: renderFlag },
    { title: '管理员', dataIndex: 'admin', render: renderFlag },
    { title: '运营', dataIndex: 'operator', render: renderFlag },
    { title: '查看', dataIndex: 'viewer', render: renderFlag },
    { title: '审计', dataIndex: 'auditor', render: renderFlag },
  ]

  return (
    <div>
      <PageHeader title="权限矩阵" subtitle="只读矩阵展示角色与权限关系" />
      <Card>
        <Table rowKey="permission" columns={columns} dataSource={matrixMock} pagination={false} />
      </Card>
    </div>
  )
}

const renderFlag = (v: boolean | null) => {
  if (v === null) return <Tag>-</Tag>
  return <Tag color={v ? 'green' : 'default'}>{v ? '✔' : '✕'}</Tag>
}

export default PermissionMatrixPage

