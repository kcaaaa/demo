import React, { Component, ReactNode } from 'react'
import { Result, Button } from 'antd'

type Props = {
  children: ReactNode
}

type State = {
  hasError: boolean
  error?: Error
}

/**
 * 全局错误边界组件
 * 捕获子组件树的 JavaScript 错误，记录日志并显示降级 UI
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    // 生产环境可上报到监控平台
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '120px 24px', textAlign: 'center' }}>
          <Result
            status="error"
            title="页面加载失败"
            subTitle="抱歉，当前页面遇到错误，请刷新或联系管理员。"
            extra={[
              <Button type="primary" key="refresh" onClick={() => window.location.reload()}>
                刷新页面
              </Button>,
              <Button key="home" onClick={() => (window.location.href = '/')}>
                返回首页
              </Button>,
            ]}
          />
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <div style={{ marginTop: 24, textAlign: 'left', maxWidth: 800, margin: '24px auto' }}>
              <pre style={{ background: '#f5f5f5', padding: 16, borderRadius: 4, overflow: 'auto' }}>
                {this.state.error.toString()}
                {this.state.error.stack}
              </pre>
            </div>
          )}
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary

