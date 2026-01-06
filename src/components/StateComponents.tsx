/**
 * 全局状态组件
 * Loading / Empty / Error 统一样式与交互
 */

import React from 'react'
import { Spin, Empty as AntEmpty, Button, Result } from 'antd'
import { ReloadOutlined, InboxOutlined } from '@ant-design/icons'

/**
 * 全局 Loading 组件
 */
export const Loading: React.FC<{ tip?: string; size?: 'small' | 'default' | 'large' }> = ({
  tip = '加载中...',
  size = 'default',
}) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '48px 24px',
      minHeight: '200px',
    }}
  >
    <Spin size={size} tip={tip} />
  </div>
)

/**
 * 全局 Empty 组件
 */
export const Empty: React.FC<{
  description?: string
  image?: React.ReactNode
  action?: React.ReactNode
}> = ({ description = '暂无数据', image, action }) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '48px 24px',
      minHeight: '200px',
    }}
  >
    <AntEmpty
      image={image || <InboxOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />}
      imageStyle={{ height: 80 }}
      description={<span style={{ color: '#86909c' }}>{description}</span>}
    >
      {action}
    </AntEmpty>
  </div>
)

/**
 * 全局 Error 组件
 */
export const ErrorState: React.FC<{
  title?: string
  message?: string
  onRetry?: () => void
  showRetry?: boolean
}> = ({
  title = '加载失败',
  message = '数据加载出错，请稍后重试',
  onRetry,
  showRetry = true,
}) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '48px 24px',
      minHeight: '200px',
    }}
  >
    <Result
      status="error"
      title={title}
      subTitle={message}
      extra={
        showRetry && onRetry ? (
          <Button type="primary" icon={<ReloadOutlined />} onClick={onRetry}>
            重试
          </Button>
        ) : null
      }
    />
  </div>
)

/**
 * 卡片级 Loading（用于卡片内部）
 */
export const CardLoading: React.FC<{ tip?: string }> = ({ tip = '加载中...' }) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '24px',
      minHeight: '120px',
    }}
  >
    <Spin tip={tip} />
  </div>
)

/**
 * 表格 Loading（用于表格内部）
 */
export const TableLoading: React.FC = () => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '32px',
      minHeight: '160px',
    }}
  >
    <Spin tip="数据加载中..." />
  </div>
)

/**
 * 骨架屏组件（可用于卡片/列表预加载）
 */
export const SkeletonCard: React.FC = () => (
  <div style={{ padding: '16px', background: '#fff', borderRadius: '8px' }}>
    <div
      style={{
        height: '20px',
        background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
        backgroundSize: '200% 100%',
        animation: 'loading 1.5s ease-in-out infinite',
        borderRadius: '4px',
        marginBottom: '12px',
      }}
    />
    <div
      style={{
        height: '60px',
        background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
        backgroundSize: '200% 100%',
        animation: 'loading 1.5s ease-in-out infinite',
        borderRadius: '4px',
      }}
    />
  </div>
)

