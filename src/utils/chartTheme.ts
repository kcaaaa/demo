/**
 * ECharts 全局主题配置
 * 统一色板、字体、阴影，对齐 Design Tokens
 */

export const chartTheme = {
  color: [
    '#1890ff', // 主色
    '#722ed1', // 辅助紫
    '#52c41a', // 成功绿
    '#faad14', // 警告橙
    '#f5222d', // 错误红
    '#13c2c2', // 青色
    '#eb2f96', // 品红
    '#fa8c16', // 橙色
  ],
  backgroundColor: 'transparent',
  textStyle: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: 14,
    color: '#1d2129',
  },
  title: {
    textStyle: {
      fontSize: 16,
      fontWeight: 700,
      color: '#1d2129',
    },
    subtextStyle: {
      fontSize: 12,
      color: '#86909c',
    },
  },
  legend: {
    textStyle: {
      fontSize: 14,
      color: '#4e5969',
    },
    itemWidth: 12,
    itemHeight: 12,
    itemGap: 16,
  },
  tooltip: {
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    borderWidth: 0,
    textStyle: {
      fontSize: 14,
      color: '#fff',
    },
    extraCssText: 'box-shadow: 0 4px 12px rgba(0,0,0,0.15); border-radius: 4px; padding: 10px 12px;',
  },
  grid: {
    left: 48,
    right: 24,
    top: 48,
    bottom: 32,
    containLabel: false,
  },
  categoryAxis: {
    axisLine: {
      lineStyle: {
        color: '#d9d9d9',
      },
    },
    axisTick: {
      lineStyle: {
        color: '#d9d9d9',
      },
    },
    axisLabel: {
      fontSize: 12,
      color: '#4e5969',
    },
    splitLine: {
      lineStyle: {
        color: '#f0f0f0',
      },
    },
  },
  valueAxis: {
    axisLine: {
      show: false,
    },
    axisTick: {
      show: false,
    },
    axisLabel: {
      fontSize: 12,
      color: '#4e5969',
    },
    splitLine: {
      lineStyle: {
        color: '#f0f0f0',
        type: 'dashed',
      },
    },
  },
  line: {
    smooth: true,
    lineStyle: {
      width: 3,
    },
    symbol: 'circle',
    symbolSize: 6,
    emphasis: {
      scale: true,
      scaleSize: 10,
    },
  },
  bar: {
    barMaxWidth: 40,
    itemStyle: {
      borderRadius: [4, 4, 0, 0],
    },
  },
  pie: {
    radius: ['40%', '70%'],
    label: {
      fontSize: 12,
      color: '#4e5969',
    },
    labelLine: {
      length: 10,
      length2: 15,
    },
    itemStyle: {
      borderWidth: 2,
      borderColor: '#fff',
    },
  },
}

/**
 * 暗色主题配置
 */
export const darkChartTheme = {
  ...chartTheme,
  backgroundColor: 'transparent',
  textStyle: {
    ...chartTheme.textStyle,
    color: '#e6e6e6',
  },
  title: {
    textStyle: {
      ...chartTheme.title.textStyle,
      color: '#e6e6e6',
    },
    subtextStyle: {
      ...chartTheme.title.subtextStyle,
      color: '#a6a6a6',
    },
  },
  legend: {
    ...chartTheme.legend,
    textStyle: {
      ...chartTheme.legend.textStyle,
      color: '#a6a6a6',
    },
  },
  categoryAxis: {
    ...chartTheme.categoryAxis,
    axisLine: {
      lineStyle: {
        color: '#434343',
      },
    },
    axisTick: {
      lineStyle: {
        color: '#434343',
      },
    },
    axisLabel: {
      ...chartTheme.categoryAxis.axisLabel,
      color: '#a6a6a6',
    },
    splitLine: {
      lineStyle: {
        color: '#2a2a2a',
      },
    },
  },
  valueAxis: {
    ...chartTheme.valueAxis,
    axisLabel: {
      ...chartTheme.valueAxis.axisLabel,
      color: '#a6a6a6',
    },
    splitLine: {
      lineStyle: {
        color: '#2a2a2a',
        type: 'dashed',
      },
    },
  },
  pie: {
    ...chartTheme.pie,
    label: {
      ...chartTheme.pie.label,
      color: '#a6a6a6',
    },
    itemStyle: {
      ...chartTheme.pie.itemStyle,
      borderColor: '#1f1f1f',
    },
  },
}

