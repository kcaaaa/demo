import { Breadcrumb, Space, Typography } from 'antd'

type Props = {
  title: string
  subtitle?: string
  items?: { title: string; path?: string }[]
  extra?: React.ReactNode
}

const PageHeader = ({ title, subtitle, items = [], extra }: Props) => (
  <div className="page-header">
    <Space direction="vertical" size={4} style={{ width: '100%' }}>
      {items.length ? (
        <Breadcrumb>
          {items.map((i) => (
            <Breadcrumb.Item key={i.title}>{i.title}</Breadcrumb.Item>
          ))}
        </Breadcrumb>
      ) : null}
      <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
        <div>
          <Typography.Title level={3} style={{ margin: 0 }}>
            {title}
          </Typography.Title>
          {subtitle ? (
            <Typography.Text type="secondary" style={{ display: 'block' }}>
              {subtitle}
            </Typography.Text>
          ) : null}
        </div>
        {extra}
      </Space>
    </Space>
  </div>
)

export default PageHeader

