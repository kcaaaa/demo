import { createI18n } from 'vue-i18n'

const messages = {
  zh: {
    home: {
      title: '首页',
      refreshInterval: '刷新频率',
      export: '导出数据',
      viewMode: '视图模式',
      singleStation: '单站看板',
      multiStation: '多站看板',
      personalize: '个性化配置',
      refresh: '刷新数据',
      indicators: {
        totalEnergy: '总能耗',
        todayEnergy: '今日累计',
        unitEnergy: '单位面积能耗',
        energySaved: '节能量',
        energyIntensity: '能耗强度',
        onlineRate: '设备在线率',
        alertCount: '异常告警',
        savedAmount: '节约电费',
        carbonReduction: '减碳量',
        peakShaving: '削峰量',
        powerFactor: '功率因数'
      },
      trend: {
        title: '能耗趋势',
        hours: '24小时',
        days: '7天',
        months: '30天'
      },
      devices: {
        title: '设备在线状态',
        online: '在线',
        offline: '离线',
        warning: '预警',
        total: '设备总数',
        normal: '正常运行',
        abnormal: '异常设备'
      },
      alerts: {
        title: '告警信息',
        high: '高',
        medium: '中',
        low: '低',
        time: '时间',
        station: '车站',
        level: '级别',
        content: '告警内容',
        handling: '处理状态'
      },
      ratio: {
        title: '能耗占比',
        electricity: '用电',
        water: '用水',
        gas: '用气',
        heating: '供热',
        cooling: '供冷'
      },
      comparison: {
        title: '同比分析',
        samePeriod: '同期',
        lastMonth: '上月',
        yesterday: '昨日',
        increase: '上升',
        decrease: '下降',
        noChange: '持平'
      },
      stationMap: {
        title: '车站分布',
        comparison: '能耗对比',
        ranking: '节能排名'
      },
      scenarios: {
        workday: '工作日模式',
        holiday: '节假日模式',
        event: '重大活动模式'
      },
      filter: {
        title: '高级筛选',
        timeRange: '时间段',
        stationType: '车站类型',
        energyLevel: '能耗等级',
        apply: '应用筛选',
        reset: '重置',
        all: '全部',
        to: '至',
        startDate: '开始日期',
        endDate: '结束日期'
      },
      settings: {
        title: '个性化配置',
        theme: '主题设置',
        language: '语言设置',
        refresh: '刷新频率',
        threshold: '指标阈值'
      },
      exportOptions: {
        excel: 'Excel格式',
        csv: 'CSV格式',
        pdf: 'PDF格式'
      },
      quickActions: {
        refresh: '刷新数据',
        filter: '数据筛选',
        export: '导出报表',
        settings: '系统设置'
      },
      personalConfig: {
        title: '个性化配置',
        dashboard: '看板设置',
        defaultView: '默认视图',
        chartCount: '图表数量',
        theme: '主题',
        light: '浅色',
        dark: '深色',
        language: '语言',
        refreshRate: '刷新频率',
        save: '保存',
        cancel: '取消',
        defaultStations: '默认车站',
        alertThreshold: '告警阈值',
        energyAlert: '能耗告警阈值(kWh)',
        deviceAlert: '设备告警阈值(台)'
      }
    }
  },
  en: {
    home: {
      title: 'Home',
      refreshInterval: 'Refresh Interval',
      export: 'Export Data',
      viewMode: 'View Mode',
      singleStation: 'Single Station',
      multiStation: 'Multi Station',
      personalize: 'Personalize',
      refresh: 'Refresh',
      indicators: {
        totalEnergy: 'Total Energy',
        todayEnergy: 'Today Total',
        unitEnergy: 'Unit Area Energy',
        energySaved: 'Energy Saved',
        energyIntensity: 'Energy Intensity',
        onlineRate: 'Device Online Rate',
        alertCount: 'Alert Count',
        savedAmount: 'Cost Saved',
        carbonReduction: 'Carbon Reduction',
        peakShaving: 'Peak Shaving',
        powerFactor: 'Power Factor'
      },
      trend: {
        title: 'Energy Trend',
        hours: '24 Hours',
        days: '7 Days',
        months: '30 Days'
      },
      devices: {
        title: 'Device Status',
        online: 'Online',
        offline: 'Offline',
        warning: 'Warning',
        total: 'Total Devices',
        normal: 'Normal',
        abnormal: 'Abnormal'
      },
      alerts: {
        title: 'Alert Information',
        high: 'High',
        medium: 'Medium',
        low: 'Low',
        time: 'Time',
        station: 'Station',
        level: 'Level',
        content: 'Content',
        handling: 'Status'
      },
      ratio: {
        title: 'Energy Ratio',
        electricity: 'Electricity',
        water: 'Water',
        gas: 'Gas',
        heating: 'Heating',
        cooling: 'Cooling'
      },
      comparison: {
        title: 'YoY Analysis',
        samePeriod: 'Same Period',
        lastMonth: 'Last Month',
        yesterday: 'Yesterday',
        increase: 'Up',
        decrease: 'Down',
        noChange: 'No Change'
      },
      stationMap: {
        title: 'Station Map',
        comparison: 'Energy Comparison',
        ranking: 'Energy Saving Ranking'
      },
      scenarios: {
        workday: 'Workday Mode',
        holiday: 'Holiday Mode',
        event: 'Event Mode'
      },
      filter: {
        title: 'Advanced Filter',
        timeRange: 'Time Range',
        stationType: 'Station Type',
        energyLevel: 'Energy Level',
        apply: 'Apply',
        reset: 'Reset',
        all: 'All',
        to: 'To',
        startDate: 'Start Date',
        endDate: 'End Date'
      },
      settings: {
        title: 'Personal Settings',
        theme: 'Theme',
        language: 'Language',
        refresh: 'Refresh Rate',
        threshold: 'Indicator Threshold'
      },
      exportOptions: {
        excel: 'Excel Format',
        csv: 'CSV Format',
        pdf: 'PDF Format'
      },
      quickActions: {
        refresh: 'Refresh Data',
        filter: 'Data Filter',
        export: 'Export Report',
        settings: 'System Settings'
      },
      personalConfig: {
        title: 'Personal Settings',
        dashboard: 'Dashboard Settings',
        defaultView: 'Default View',
        chartCount: 'Chart Count',
        theme: 'Theme',
        light: 'Light',
        dark: 'Dark',
        language: 'Language',
        refreshRate: 'Refresh Rate',
        save: 'Save',
        cancel: 'Cancel',
        defaultStations: 'Default Stations',
        alertThreshold: 'Alert Thresholds',
        energyAlert: 'Energy Alert (kWh)',
        deviceAlert: 'Device Alert (units)'
      }
    }
  }
}

const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('language') || 'zh',
  fallbackLocale: 'zh',
  messages
})

export { i18n, messages }
