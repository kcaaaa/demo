// AI汇总分析数据类型定义
export type AIAnalysisData = {
  potential: number // 节能潜力百分比
  trendTag: string // 趋势标签
  trendColor: string // 趋势颜色
  optimizeTarget: string // 待优化目标
  suggestion: string // 优化建议
  description: string // 详细描述
}

// 不同站点类型的AI分析数据
export const aiAnalysisDataByType: Record<string, AIAnalysisData> = {
  large: {
    potential: 76,
    trendTag: '趋势良好',
    trendColor: 'green',
    optimizeTarget: '空调系统',
    suggestion: '照明调光',
    description: '大型站能耗高，空调系统占比35%，建议引入智能温控；照明可采用分区调光策略，预计节能18-25%。',
  },
  medium: {
    potential: 62,
    trendTag: '运行平稳',
    trendColor: 'blue',
    optimizeTarget: '电梯能耗',
    suggestion: '设备巡检',
    description: '中型站整体运行稳定，电梯系统负载波动较大，建议优化调度算法；加强设备定期巡检，预计节能12-18%。',
  },
  small: {
    potential: 45,
    trendTag: '表现优良',
    trendColor: 'cyan',
    optimizeTarget: '照明系统',
    suggestion: '分时段控制',
    description: '小型站能耗管理较好，照明系统可进一步优化，建议采用人流感应+分时段控制策略，预计节能8-12%。',
  },
}

// 不同站点类型的基础数据
export const dashboardDataByType = {
  large: {
    systemInfo: { version: 'v1.0.0', lastUpdate: '2026-01-04 10:30:00', status: 'running', totalStations: 15 },
    keyMetrics: {
      totalEnergy: { value: 185430, unit: 'kWh', yoy: 5.2, mom: -2.1 },
      unitAreaEnergy: { value: 155.8, unit: 'kWh/m²', yoy: 3.1, mom: -1.8 },
      energyCost: { value: 129450, unit: '元', yoy: 4.7, mom: -3.2 },
      energyEfficiency: { value: 82.5, unit: '%', yoy: 2.3, mom: 1.5 },
    },
    alerts: { total: 28, high: 5, medium: 11, low: 12 },
    trend: {
      x: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      energy: [18340, 17880, 18210, 19200, 20050, 19500, 18650],
      cost: [12800, 12500, 12700, 13400, 14000, 13600, 13000],
      efficiency: [81, 81.5, 82, 83, 84, 83.5, 82.8],
    },
  },
  medium: {
    systemInfo: { version: 'v1.0.0', lastUpdate: '2026-01-04 10:30:00', status: 'running', totalStations: 15 },
    keyMetrics: {
      totalEnergy: { value: 125430, unit: 'kWh', yoy: 3.8, mom: -1.5 },
      unitAreaEnergy: { value: 125.8, unit: 'kWh/m²', yoy: 2.5, mom: -1.2 },
      energyCost: { value: 89450, unit: '元', yoy: 3.2, mom: -2.1 },
      energyEfficiency: { value: 87.5, unit: '%', yoy: 1.8, mom: 1.2 },
    },
    alerts: { total: 18, high: 2, medium: 7, low: 9 },
    trend: {
      x: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      energy: [12340, 11880, 12010, 13200, 14050, 13800, 12650],
      cost: [8600, 8300, 8400, 9200, 9800, 9600, 8800],
      efficiency: [86, 86.5, 87, 88, 89, 88.5, 87.8],
    },
  },
  small: {
    systemInfo: { version: 'v1.0.0', lastUpdate: '2026-01-04 10:30:00', status: 'running', totalStations: 15 },
    keyMetrics: {
      totalEnergy: { value: 68240, unit: 'kWh', yoy: 2.1, mom: -0.8 },
      unitAreaEnergy: { value: 95.3, unit: 'kWh/m²', yoy: 1.5, mom: -0.6 },
      energyCost: { value: 47820, unit: '元', yoy: 1.9, mom: -1.1 },
      energyEfficiency: { value: 91.2, unit: '%', yoy: 1.2, mom: 0.8 },
    },
    alerts: { total: 12, high: 1, medium: 4, low: 7 },
    trend: {
      x: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      energy: [6800, 6500, 6700, 7200, 7600, 7400, 6900],
      cost: [4760, 4550, 4690, 5040, 5320, 5180, 4830],
      efficiency: [90, 90.5, 91, 92, 93, 92.5, 91.5],
    },
  },
}

// 默认使用大型站数据
export const dashboardData = dashboardDataByType.large

export const singleStationMock = {
  stationList: [
    { label: '北京南站', value: 'beijing-south' },
    { label: '上海虹桥站', value: 'shanghai-hongqiao' },
    { label: '广州南站', value: 'guangzhou-south' },
    { label: '深圳北站', value: 'shenzhen-north' },
    { label: '杭州东站', value: 'hangzhou-east' },
    { label: '成都东站', value: 'chengdu-east' },
  ],
  structureData: [
    { name: '照明', value: 25 },
    { name: '空调', value: 35 },
    { name: '电梯', value: 15 },
    { name: '给排水', value: 10 },
    { name: '其他', value: 15 },
  ],
  departmentData: [
    { name: '候车大厅', value: 30 },
    { name: '售票厅', value: 15 },
    { name: '站台', value: 20 },
    { name: '办公区', value: 10 },
    { name: '设备房', value: 25 },
  ],
}

export const alertMock = {
  overview: { totalAlerts: 128, newAlertsToday: 15, highLevelAlerts: 23, mediumLevelAlerts: 45, lowLevelAlerts: 60 },
  alerts: [
    {
      id: 1,
      time: '2026-01-03 14:30:00',
      station: '北京南站',
      type: '能耗突增',
      level: 'high',
      content: '候车大厅空调系统能耗突增30%',
      status: 'unprocessed',
      handler: '',
      details: '从14:00起能耗突增，疑似温控失效',
    },
    {
      id: 2,
      time: '2026-01-03 13:00:00',
      station: '上海虹桥站',
      type: '超阈值',
      level: 'medium',
      content: '站台照明功率超阈值15%',
      status: 'processing',
      handler: '运营专员',
      details: '计划调低照度，等待确认',
    },
  ],
}

export const matrixMock = [
  { permission: '系统管理 - 用户管理', super_admin: true, admin: null, operator: false, viewer: false, auditor: false },
  { permission: '系统管理 - 角色管理', super_admin: true, admin: true, operator: false, viewer: false, auditor: false },
  { permission: '系统管理 - 菜单管理', super_admin: true, admin: true, operator: false, viewer: false, auditor: false },
  { permission: '系统管理 - 系统设置', super_admin: true, admin: true, operator: false, viewer: false, auditor: false },
  { permission: '系统管理 - 操作日志', super_admin: true, admin: true, operator: false, viewer: false, auditor: true },
  { permission: '能耗分析 - 单站分析', super_admin: true, admin: true, operator: true, viewer: true, auditor: false },
  { permission: '能耗分析 - 多站对比', super_admin: true, admin: true, operator: true, viewer: true, auditor: false },
  { permission: '能耗分析 - 趋势预测', super_admin: true, admin: true, operator: true, viewer: false, auditor: false },
  { permission: '报表管理 - 能耗报表', super_admin: true, admin: true, operator: true, viewer: true, auditor: false },
  { permission: '报表管理 - 导出报表', super_admin: true, admin: true, operator: true, viewer: false, auditor: false },
]

export const logMock = [
  {
    id: 1,
    time: '2026-01-03 10:00:00',
    user: 'admin',
    type: 'login',
    module: '认证模块',
    content: '管理员登录系统',
    ip: '192.168.1.100',
    status: 'success',
  },
  {
    id: 2,
    time: '2026-01-03 10:05:00',
    user: 'admin',
    type: 'operation',
    module: '系统管理',
    content: '新增用户 operator',
    ip: '192.168.1.100',
    status: 'success',
  },
]

