// 高铁项目数据配置
export interface Station {
  id: string
  name: string
  lat: number
  lng: number
  energy: number
  status: 'normal' | 'warning'
}

export interface RailwayProject {
  id: string
  name: string
  center: { lat: number; lng: number }
  zoom: number
  stations: Station[]
}

// 项目数据
export const railwayProjects: RailwayProject[] = [
  {
    id: 'jinghu',
    name: '京沪高铁',
    center: { lat: 35.0, lng: 117.5 },
    zoom: 6,
    stations: [
      { id: 'bjn', name: '北京南站', lat: 39.8651, lng: 116.3785, energy: 25450, status: 'normal' },
      { id: 'tjn', name: '天津南站', lat: 38.9733, lng: 117.0635, energy: 22230, status: 'normal' },
      { id: 'jnx', name: '济南西站', lat: 36.6801, lng: 116.8865, energy: 28680, status: 'warning' },
      { id: 'xzd', name: '徐州东站', lat: 34.2857, lng: 117.2082, energy: 24340, status: 'normal' },
      { id: 'njn', name: '南京南站', lat: 31.9394, lng: 118.8120, energy: 26870, status: 'normal' },
      { id: 'szb', name: '苏州北站', lat: 31.4095, lng: 120.6955, energy: 21560, status: 'normal' },
      { id: 'ksn', name: '昆山南站', lat: 31.2426, lng: 120.9980, energy: 19450, status: 'normal' },
      { id: 'shhq', name: '上海虹桥站', lat: 31.1959, lng: 121.3203, energy: 27120, status: 'normal' }
    ]
  },
  {
    id: 'jingguang',
    name: '京广高铁',
    center: { lat: 31.0, lng: 113.0 },
    zoom: 6,
    stations: [
      { id: 'bjx', name: '北京西站', lat: 39.8937, lng: 116.3226, energy: 26800, status: 'normal' },
      { id: 'sjz', name: '石家庄站', lat: 38.0458, lng: 114.5143, energy: 23500, status: 'normal' },
      { id: 'zzd', name: '郑州东站', lat: 34.7175, lng: 113.7214, energy: 31500, status: 'warning' },
      { id: 'wh', name: '武汉站', lat: 30.6106, lng: 114.4308, energy: 29200, status: 'normal' },
      { id: 'csn', name: '长沙南站', lat: 28.1496, lng: 113.0733, energy: 27800, status: 'normal' },
      { id: 'hyd', name: '衡阳东站', lat: 26.8335, lng: 112.6155, energy: 22100, status: 'normal' },
      { id: 'gzn', name: '广州南站', lat: 23.0026, lng: 113.2643, energy: 33200, status: 'normal' },
      { id: 'szb_jg', name: '深圳北站', lat: 22.6089, lng: 114.0299, energy: 30500, status: 'normal' }
    ]
  },
  {
    id: 'hukun',
    name: '沪昆高铁',
    center: { lat: 27.0, lng: 109.0 },
    zoom: 6,
    stations: [
      { id: 'shhq_hk', name: '上海虹桥站', lat: 31.1959, lng: 121.3203, energy: 27120, status: 'normal' },
      { id: 'hzd', name: '杭州东站', lat: 30.2906, lng: 120.2129, energy: 28900, status: 'normal' },
      { id: 'jh', name: '金华站', lat: 29.1089, lng: 119.6486, energy: 21300, status: 'normal' },
      { id: 'sr', name: '上饶站', lat: 28.3767, lng: 117.9710, energy: 20500, status: 'normal' },
      { id: 'ncx', name: '南昌西站', lat: 28.6089, lng: 115.8134, energy: 26400, status: 'normal' },
      { id: 'csn_hk', name: '长沙南站', lat: 28.1496, lng: 113.0733, energy: 31300, status: 'warning' },
      { id: 'hhn', name: '怀化南站', lat: 27.5268, lng: 109.9990, energy: 23800, status: 'normal' },
      { id: 'gyb', name: '贵阳北站', lat: 26.6761, lng: 106.7628, energy: 25200, status: 'normal' },
      { id: 'kmn', name: '昆明南站', lat: 24.9669, lng: 102.7412, energy: 27600, status: 'normal' },
      { id: 'yx', name: '玉溪站', lat: 24.3387, lng: 102.5218, energy: 19800, status: 'normal' }
    ]
  },
  {
    id: 'hada',
    name: '哈大高铁',
    center: { lat: 43.0, lng: 124.0 },
    zoom: 6,
    stations: [
      { id: 'hebx', name: '哈尔滨西站', lat: 45.7098, lng: 126.5495, energy: 24500, status: 'normal' },
      { id: 'ccx', name: '长春西站', lat: 43.8888, lng: 125.1913, energy: 23100, status: 'normal' },
      { id: 'spd', name: '四平东站', lat: 43.1526, lng: 124.3955, energy: 19600, status: 'normal' },
      { id: 'tlx', name: '铁岭西站', lat: 42.2245, lng: 123.8445, energy: 20800, status: 'normal' },
      { id: 'syb', name: '沈阳北站', lat: 41.7848, lng: 123.5101, energy: 30100, status: 'warning' },
      { id: 'pjb', name: '盘锦北站', lat: 41.1198, lng: 122.0694, energy: 21900, status: 'normal' },
      { id: 'ykd', name: '营口东站', lat: 40.6638, lng: 122.1949, energy: 20300, status: 'normal' },
      { id: 'dlb', name: '大连北站', lat: 39.0722, lng: 121.6256, energy: 25700, status: 'normal' }
    ]
  }
]

// 根据项目ID获取项目数据
export const getProjectById = (id: string): RailwayProject | undefined => {
  return railwayProjects.find(p => p.id === id)
}

// 根据站点ID获取站点数据
export const getStationById = (projectId: string, stationId: string): Station | undefined => {
  const project = getProjectById(projectId)
  return project?.stations.find(s => s.id === stationId)
}

// 计算项目统计数据
export const getProjectStatistics = (project: RailwayProject) => {
  const total = project.stations.length
  const warning = project.stations.filter(s => s.status === 'warning').length
  const normal = total - warning
  return { total, normal, warning }
}

