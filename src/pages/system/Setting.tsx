import { useEffect } from 'react'
import { Button, Card, Col, Form, Input, InputNumber, Row, Select, Space, Switch, message } from 'antd'
import PageHeader from '../../components/PageHeader'

type Settings = {
  systemName: string
  refreshInterval: string
  warningThreshold: number
  autoBackup: boolean
  backupFrequency: string
  backupRetention: number
  theme: string
  language: string
  pageSize: number
  minPasswordLength: number
  lockOnFail: boolean
  sessionTimeout: string
}

const STORAGE_KEY = 'hs-system-settings'

const SettingPage = () => {
  const [form] = Form.useForm<Settings>()

  const load = () => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      form.setFieldsValue(JSON.parse(raw))
    } else {
      form.setFieldsValue({
        systemName: '高铁站节能降耗管理系统',
        refreshInterval: '5',
        warningThreshold: 80,
        autoBackup: true,
        backupFrequency: 'daily',
        backupRetention: 30,
        theme: 'light',
        language: 'zh-CN',
        pageSize: 20,
        minPasswordLength: 8,
        lockOnFail: true,
        sessionTimeout: '60',
      })
    }
  }

  useEffect(() => {
    load()
  }, [])

  const save = (values: Settings) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(values))
    message.success('系统设置已保存')
  }

  return (
    <div>
      <PageHeader title="系统设置" subtitle="基础/备份/界面/安全设置" />
      <Form layout="vertical" form={form} onFinish={save} initialValues={{}} onValuesChange={() => {}}>
        <Row gutter={16}>
          <Col span={12}>
            <Card title="基本设置">
              <Form.Item name="systemName" label="系统名称" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="refreshInterval" label="数据刷新间隔(分钟)" rules={[{ required: true }]}>
                <Select options={[{ value: '1', label: '1' }, { value: '5', label: '5' }, { value: '10', label: '10' }, { value: '30', label: '30' }]} />
              </Form.Item>
              <Form.Item name="warningThreshold" label="预警阈值" rules={[{ required: true }]}>
                <InputNumber min={1} max={100} style={{ width: '100%' }} />
              </Form.Item>
            </Card>
          </Col>
          <Col span={12}>
            <Card title="备份设置">
              <Form.Item name="autoBackup" label="自动备份" valuePropName="checked">
                <Switch />
              </Form.Item>
              <Form.Item name="backupFrequency" label="备份频率">
                <Select options={[{ value: 'daily', label: '每日' }, { value: 'weekly', label: '每周' }, { value: 'monthly', label: '每月' }]} />
              </Form.Item>
              <Form.Item name="backupRetention" label="保留天数">
                <InputNumber min={1} max={365} style={{ width: '100%' }} />
              </Form.Item>
            </Card>
          </Col>
        </Row>

        <Row gutter={16} style={{ marginTop: 16 }}>
          <Col span={12}>
            <Card title="界面设置">
              <Form.Item name="theme" label="主题">
                <Select options={[{ value: 'light', label: '明亮' }, { value: 'dark', label: '暗黑' }]} />
              </Form.Item>
              <Form.Item name="language" label="语言">
                <Select options={[{ value: 'zh-CN', label: '中文' }, { value: 'en-US', label: 'English' }]} />
              </Form.Item>
              <Form.Item name="pageSize" label="每页条数">
                <Select options={[10, 20, 50, 100].map((v) => ({ value: v, label: `${v}` }))} />
              </Form.Item>
            </Card>
          </Col>
          <Col span={12}>
            <Card title="安全设置">
              <Form.Item name="minPasswordLength" label="密码最小长度">
                <InputNumber min={6} max={20} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="lockOnFail" label="登录失败锁定" valuePropName="checked">
                <Switch />
              </Form.Item>
              <Form.Item name="sessionTimeout" label="会话超时(分钟)">
                <Select options={[{ value: '30', label: '30' }, { value: '60', label: '60' }, { value: '120', label: '120' }, { value: '480', label: '480' }]} />
              </Form.Item>
            </Card>
          </Col>
        </Row>

        <Space style={{ marginTop: 16 }}>
          <Button type="primary" onClick={() => form.submit()}>
            保存设置
          </Button>
          <Button onClick={load}>加载本地设置</Button>
          <Button onClick={() => form.resetFields()}>重置</Button>
        </Space>
      </Form>
    </div>
  )
}

export default SettingPage

