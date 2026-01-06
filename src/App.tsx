import { ConfigProvider } from 'antd'
import zhCN from 'antd/es/locale/zh_CN'
import { RouterProvider } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary'
import './App.css'
import router from './router'

const App = () => {
  return (
    <ErrorBoundary>
      <ConfigProvider locale={zhCN} componentSize="middle">
        <RouterProvider router={router} />
      </ConfigProvider>
    </ErrorBoundary>
  )
}

export default App
