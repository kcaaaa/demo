import { useEffect } from 'react'
import { Button, Card, Form, Input, Typography, message } from 'antd'
import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import useAuthStore from '../../stores/auth'

const LoginPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isAuthed, hydrate } = useAuthStore()

  useEffect(() => {
    hydrate()
    if (isAuthed()) {
      navigate('/station-select')
    }
  }, [])

  const onFinish = async (values: { username: string; password: string }) => {
    const ok = await login(values.username, values.password)
    if (ok) {
      message.success('登录成功')
      // 登录成功后跳转到站点选择页
      navigate('/station-select', { replace: true })
    } else {
      message.error('用户名或密码错误，或账号已停用')
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
        padding: 24,
      }}
    >
      <Card style={{ width: 420, boxShadow: '0 12px 32px rgba(0,0,0,0.12)' }}>
        <Typography.Title level={3} style={{ textAlign: 'center', marginBottom: 8 }}>
          高铁站节能降耗演示系统
        </Typography.Title>
        <Typography.Paragraph style={{ textAlign: 'center', color: '#86909c' }}>
          演示账号：admin / admin123
        </Typography.Paragraph>
        <Form layout="vertical" initialValues={{ username: 'admin', password: 'admin123' }} onFinish={onFinish}>
          <Form.Item label="用户名" name="username" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input prefix={<UserOutlined />} placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item label="密码" name="password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="请输入密码" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default LoginPage

