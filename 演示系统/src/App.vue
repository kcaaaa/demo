<template>
  <div v-if="isLoginPage" class="login-container">
    <router-view />
  </div>
  <div v-else class="app-container">
    <!-- 侧边导航菜单 -->
    <el-aside :width="isCollapse ? '64px' : '200px'" class="app-aside">
      <div class="aside-header">
        <div class="logo-container">
          <i class="fa fa-building-o"></i>
          <span v-if="!isCollapse" class="logo-text">高铁站节能降耗</span>
        </div>
        <el-button type="text" class="collapse-btn" @click="toggleCollapse">
          <i class="fa" :class="isCollapse ? 'fa-angle-right' : 'fa-angle-left'"></i>
        </el-button>
      </div>
      
      <el-menu
        :default-active="route.path"
        class="el-menu-vertical-demo"
        :collapse="isCollapse"
        router
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
        :collapse-transition="false"
      >
        <el-menu-item
          v-for="item in filteredMenuItems"
          :key="item.path"
          :index="item.path"
        >
          <i :class="['fa', item.icon]"></i>
          <template #title>{{ item.label }}</template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 主内容区域 -->
    <el-container class="app-main">
      <!-- 顶部导航栏 -->
      <el-header class="app-header">
        <div class="header-left">
          <el-button type="text" class="mobile-collapse-btn" @click="toggleCollapse">
            <i class="fa fa-bars"></i>
          </el-button>
          <span class="breadcrumb">
            <el-breadcrumb separator="/">
              <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
              <el-breadcrumb-item v-for="(item, index) in breadcrumbItems" :key="index">
                {{ item.name }}
              </el-breadcrumb-item>
            </el-breadcrumb>
          </span>
        </div>
        <div class="header-right">
          <el-tag type="info" size="small">
            角色：{{ roleLabel }}
          </el-tag>
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <i class="fa fa-user-circle-o"></i>
              <span class="user-name">{{ currentUser.displayName }}</span>
              <i class="fa fa-angle-down"></i>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <i class="fa fa-user"></i> 个人中心
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <i class="fa fa-sign-out"></i> 退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 内容区域 -->
      <el-main class="app-content">
        <router-view />
      </el-main>
    </el-container>

    <!-- 个人中心 -->
    <el-dialog
      title="个人中心"
      :visible.sync="profileDialogVisible"
      width="420px"
    >
      <el-form :model="profileForm" label-width="100px">
        <el-form-item label="显示名称">
          <el-input v-model="profileForm.displayName" placeholder="展示用昵称" />
        </el-form-item>
        <el-form-item label="用户名">
          <el-input v-model="profileForm.username" placeholder="登录用户名" />
        </el-form-item>
        <el-form-item label="新密码">
          <el-input v-model="profileForm.password" placeholder="不修改可留空" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="profileDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveProfile">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  getCurrentUser,
  logout,
  getAllowedRoutes,
  getHomePath,
  updateProfile
} from './utils/auth'

const MENU_ITEMS = [
  { path: '/', label: '首页', icon: 'fa-home' },
  { path: '/station-analysis', label: '单站能耗分析', icon: 'fa-bar-chart' },
  { path: '/energy-ratio', label: '能耗占比分析', icon: 'fa-pie-chart' },
  { path: '/energy-alert', label: '能耗分析预警', icon: 'fa-exclamation-triangle' },
  { path: '/multi-station-compare', label: '多站能耗对比', icon: 'fa-line-chart' },
  { path: '/energy-strategy', label: '节能策略模拟', icon: 'fa-lightbulb-o' },
  { path: '/device-management', label: '设备管理', icon: 'fa-server' },
  { path: '/system-management', label: '系统管理', icon: 'fa-wrench' }
]

export default {
  name: 'App',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const isCollapse = ref(false)
    const profileDialogVisible = ref(false)
    const profileForm = ref({
      username: '',
      displayName: '',
      password: ''
    })

    const currentUser = ref(getCurrentUser() || { displayName: '访客', role: '' })

    const refreshUser = () => {
      currentUser.value = getCurrentUser() || { displayName: '访客', role: '' }
    }

    const roleLabel = computed(() => {
      const map = {
        admin: '管理员',
        single: '单站演示',
        multi: '多站演示'
      }
      return map[currentUser.value.role] || '访客'
    })

    const allowedPaths = computed(() => getAllowedRoutes(currentUser.value.role))

    const filteredMenuItems = computed(() =>
      MENU_ITEMS.filter(item => allowedPaths.value.includes(item.path))
    )

    const breadcrumbItems = computed(() => {
      const items = []
      if (route.path !== '/') {
        const matched = route.matched
        matched.forEach(item => {
          if (item.path !== '/') {
            items.push({
              name: item.meta.title,
              path: item.path
            })
          }
        })
      }
      return items
    })

    const toggleCollapse = () => {
      isCollapse.value = !isCollapse.value
    }

    const isLoginPage = computed(() => route.path === '/login')

    const handleCommand = (cmd) => {
      if (cmd === 'logout') {
        logout()
        router.replace('/login')
        return
      }
      if (cmd === 'profile') {
        profileForm.value = {
          username: currentUser.value.username,
          displayName: currentUser.value.displayName,
          password: ''
        }
        profileDialogVisible.value = true
      }
    }

    const saveProfile = () => {
      const payload = {
        username: profileForm.value.username?.trim(),
        displayName: profileForm.value.displayName?.trim()
      }
      if (profileForm.value.password) {
        payload.password = profileForm.value.password.trim()
      }
      const updated = updateProfile(payload)
      if (updated) {
        currentUser.value = updated
        profileDialogVisible.value = false
        ElMessage.success('个人信息已更新')
      } else {
        ElMessage.error('更新失败，请重新登录')
        router.replace('/login')
      }
    }

    const handleResize = () => {
      if (window.innerWidth < 768) {
        isCollapse.value = true
      }
    }

    onMounted(() => {
      refreshUser()
      handleResize()
      window.addEventListener('resize', handleResize)
      if (!currentUser.value.role) {
        router.replace('/login')
      }
      // 如果当前路由不在权限列表，跳转到可访问首页
      if (currentUser.value.role && !allowedPaths.value.includes(route.path)) {
        router.replace(getHomePath(currentUser.value.role))
      }
    })

    // 登录跳转后刷新头部与菜单信息
    watch(
      () => route.fullPath,
      () => {
        refreshUser()
      }
    )

    return {
      route,
      isCollapse,
      toggleCollapse,
      breadcrumbItems,
      filteredMenuItems,
      currentUser,
      roleLabel,
      profileDialogVisible,
      profileForm,
      saveProfile,
      handleCommand,
      isLoginPage
    }
  }
}
</script>

<style>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', Arial, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: #303133;
  background-color: #f5f7fa;
}

.login-container {
  min-height: 100vh;
}

/* 应用容器 */
.app-container {
  display: flex;
  min-height: 100vh;
}

/* 侧边导航 */
.app-aside {
  background-color: #304156;
  color: #fff;
  box-shadow: 2px 0 6px rgba(0, 21, 41, 0.35);
  overflow: hidden;
  transition: width 0.28s;
}

.aside-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 60px;
  background-color: #263445;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 600;
  color: #fff;
}

.logo-container i {
  font-size: 24px;
  color: #409EFF;
}

.logo-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.collapse-btn {
  color: #fff;
  font-size: 16px;
}

/* 菜单样式 */
.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 200px;
}

.el-menu {
  border-right: none;
}

.el-menu-item {
  height: 56px;
  line-height: 56px;
}

/* 主内容区域 */
.app-main {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
  min-height: 0;
}

/* 顶部导航栏 */
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  padding: 0 20px;
  z-index: 10;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.mobile-collapse-btn {
  display: none;
  font-size: 18px;
  color: #606266;
}

.breadcrumb {
  font-size: 14px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #606266;
}

.user-info i {
  font-size: 18px;
}

.user-name {
  white-space: nowrap;
}

/* 内容区域 */
.app-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: #f5f7fa;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .app-aside {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    z-index: 100;
    transition: transform 0.28s;
    transform: translateX(-100%);
  }
  
  .app-aside.collapse {
    transform: translateX(0);
  }
  
  .mobile-collapse-btn {
    display: block;
  }
  
  .app-content {
    padding: 10px;
  }
}
</style>
