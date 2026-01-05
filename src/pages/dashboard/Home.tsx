import React from 'react'
import PageHeader from '../../components/PageHeader'
import { dashboardDataByType, aiAnalysisDataByType } from '../../mock/data'
import { exportCsv, sleep } from '../../utils/mock'
import HomeView from './Home.view'

const STORAGE_KEY = 'home_filter_state'

const HomePage = () => {
  // 从localStorage加载上次选择的站点类型
  const loadStationType = (): string => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        return parsed.stationType || 'large'
      }
    } catch {
      // 忽略解析错误
    }
    return 'large'
  }

  const [stationType, setStationType] = React.useState<string>(loadStationType())

  // 根据站点类型获取对应数据
  const currentData = React.useMemo(() => {
    return dashboardDataByType[stationType as keyof typeof dashboardDataByType] || dashboardDataByType.large
  }, [stationType])

  const currentAIData = React.useMemo(() => {
    return aiAnalysisDataByType[stationType as keyof typeof aiAnalysisDataByType] || aiAnalysisDataByType.large
  }, [stationType])

  const { keyMetrics, alerts, trend } = currentData

  // 监听localStorage变化，实时更新站点类型
  React.useEffect(() => {
    const handleStorageChange = () => {
      const newType = loadStationType()
      if (newType !== stationType) {
        setStationType(newType)
      }
    }

    // 监听自定义事件（用于同一页面内的变化）
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('localStorageChange', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('localStorageChange', handleStorageChange)
    }
  }, [stationType])

  return (
    <div className="home-page">
      <PageHeader title="首页" subtitle="全局概览 / AI 汇总 / 快速导航" items={[{ title: '首页' }]} />
      <HomeView
        keyMetrics={keyMetrics}
        alerts={alerts}
        trend={trend}
        aiAnalysis={currentAIData}
        onExport={() =>
          exportCsv(
            [
              ['指标', '数值', '单位', '同比', '环比'],
              ...(['totalEnergy', 'unitAreaEnergy', 'energyCost', 'energyEfficiency'] as const).map((k) => {
                const d = keyMetrics[k]
                return [k, d.value, d.unit, d.yoy, d.mom]
              }),
            ],
            `首页概览_${new Date().toISOString().slice(0, 10)}.csv`,
          )
        }
        onRefresh={async () => {
          await sleep(500)
          return Promise.resolve()
        }}
      />
    </div>
  )
}

export default HomePage

