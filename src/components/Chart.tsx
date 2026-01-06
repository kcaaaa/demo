import { useEffect, useRef } from 'react'
import * as echarts from 'echarts'
import { chartTheme } from '../utils/chartTheme'

type Props = {
  option: echarts.EChartsOption | Record<string, any>
  height?: number
  loading?: boolean
}

const Chart = ({ option, height = 260, loading = false }: Props) => {
  const ref = useRef<HTMLDivElement | null>(null)
  const chartRef = useRef<echarts.EChartsType>()

  useEffect(() => {
    if (!ref.current) return
    chartRef.current = echarts.init(ref.current)
    
    // 合并全局主题到 option
    const mergedOption = {
      ...chartTheme,
      ...option,
      color: option.color || chartTheme.color,
      tooltip: { ...chartTheme.tooltip, ...option.tooltip },
      legend: { ...chartTheme.legend, ...option.legend },
      grid: { ...chartTheme.grid, ...option.grid },
      xAxis: option.xAxis ? (Array.isArray(option.xAxis) 
        ? option.xAxis.map((x: any) => ({ ...chartTheme.categoryAxis, ...x }))
        : { ...chartTheme.categoryAxis, ...option.xAxis }
      ) : undefined,
      yAxis: option.yAxis ? (Array.isArray(option.yAxis)
        ? option.yAxis.map((y: any) => ({ ...chartTheme.valueAxis, ...y }))
        : { ...chartTheme.valueAxis, ...option.yAxis }
      ) : undefined,
    }
    
    chartRef.current.setOption(mergedOption)
    const handle = () => chartRef.current?.resize()
    window.addEventListener('resize', handle)
    return () => {
      window.removeEventListener('resize', handle)
      chartRef.current?.dispose()
    }
  }, [])

  useEffect(() => {
    if (chartRef.current) {
      const mergedOption = {
        ...chartTheme,
        ...option,
        color: option.color || chartTheme.color,
        tooltip: { ...chartTheme.tooltip, ...option.tooltip },
        legend: { ...chartTheme.legend, ...option.legend },
        grid: { ...chartTheme.grid, ...option.grid },
      }
      chartRef.current.setOption(mergedOption)
    }
  }, [option])

  useEffect(() => {
    if (chartRef.current) {
      if (loading) {
        chartRef.current.showLoading('default', {
          text: '加载中...',
          color: '#1890ff',
          textColor: '#4e5969',
          maskColor: 'rgba(255, 255, 255, 0.8)',
        })
      } else {
        chartRef.current.hideLoading()
      }
    }
  }, [loading])

  return <div ref={ref} style={{ width: '100%', height }} />
}

export default Chart

