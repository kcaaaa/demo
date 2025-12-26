import { createRouter, createWebHashHistory } from 'vue-router'
// 导入组件
import HomeEnhanced from '../components/Home/HomeEnhanced.vue'
import StationAnalysis from '../components/StationAnalysis/StationAnalysis.vue'
import EnergyRatio from '../components/EnergyRatio/EnergyRatio.vue'
import EnergyAlert from '../components/EnergyAlert/EnergyAlert.vue'
import MultiStationCompare from '../components/MultiStationCompare/MultiStationCompare.vue'
import EnergyStrategy from '../components/EnergyStrategy/EnergyStrategy.vue'
import DeviceManagement from '../components/DeviceSystemManagement/DeviceSystemManagement.vue'
import SystemManagement from '../components/SystemManagement/SystemManagement.vue'
import Login from '../components/Auth/Login.vue'
import {
  getCurrentUser,
  getHomePath,
  hasAccess
} from '../utils/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { title: '登录', public: true }
  },
  {
    path: '/',
    name: 'Home',
    component: HomeEnhanced,
    meta: { title: '首页', requiresAuth: true }
  },
  {
    path: '/station-analysis',
    name: 'StationAnalysis',
    component: StationAnalysis,
    meta: { title: '单站能耗分析', requiresAuth: true }
  },
  {
    path: '/energy-ratio',
    name: 'EnergyRatio',
    component: EnergyRatio,
    meta: { title: '能耗占比分析', requiresAuth: true }
  },
  {
    path: '/energy-alert',
    name: 'EnergyAlert',
    component: EnergyAlert,
    meta: { title: '能耗分析预警', requiresAuth: true }
  },
  {
    path: '/multi-station-compare',
    name: 'MultiStationCompare',
    component: MultiStationCompare,
    meta: { title: '多站能耗对比', requiresAuth: true }
  },
  {
    path: '/energy-strategy',
    name: 'EnergyStrategy',
    component: EnergyStrategy,
    meta: { title: '节能策略模拟', requiresAuth: true }
  },
  {
    path: '/device-management',
    name: 'DeviceManagement',
    component: DeviceManagement,
    meta: { title: '设备管理', requiresAuth: true }
  },
  {
    path: '/system-management',
    name: 'SystemManagement',
    component: SystemManagement,
    meta: { title: '系统管理', requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// 路由守卫 - 鉴权 & 设置标题
router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = `高铁站节能降耗演示系统 - ${to.meta.title}`
  }

  const isPublic = to.meta.public
  const user = getCurrentUser()

  if (!isPublic && !user) {
    return next({ path: '/login', query: { redirect: to.fullPath } })
  }

  if (user && to.path === '/login') {
    return next(getHomePath(user.role))
  }

  if (user && !hasAccess(to.path)) {
    return next(getHomePath(user.role))
  }

  next()
})

export default router