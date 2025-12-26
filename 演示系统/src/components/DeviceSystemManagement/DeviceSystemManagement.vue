<template>
  <div class="device-system-management">
    <el-card shadow="hover">
      <template #header>
        <div class="page-header">
          <h2>设备与系统管理</h2>
          <div class="header-actions">
            <el-radio-group v-model="activeModule" size="small">
              <el-radio-button label="system">系统管理</el-radio-button>
              <el-radio-button label="energy">系统能耗分析</el-radio-button>
              <el-radio-button label="correlation">系统关联分析</el-radio-button>
              <el-radio-button label="category">设备分类</el-radio-button>
              <el-radio-button label="maintenance">维护记录</el-radio-button>
              <el-radio-button label="forecast">能耗预测</el-radio-button>
              <el-radio-button label="warning">异常预警</el-radio-button>
              <el-radio-button label="report">报表生成</el-radio-button>
            </el-radio-group>
          </div>
        </div>
      </template>

      <component :is="currentComponent" />
    </el-card>
  </div>
</template>

<script>
import { defineAsyncComponent, computed } from 'vue'

export default {
  name: 'DeviceSystemManagement',
  data() {
    return {
      activeModule: 'system'
    }
  },
  computed: {
    currentComponent() {
      const componentMap = {
        system: defineAsyncComponent(() => import('./components/SystemManage.vue')),
        energy: defineAsyncComponent(() => import('./components/SystemEnergyAnalysis.vue')),
        correlation: defineAsyncComponent(() => import('./components/SystemCorrelationAnalysis.vue')),
        category: defineAsyncComponent(() => import('./components/DeviceCategoryManage.vue')),
        maintenance: defineAsyncComponent(() => import('./components/DeviceMaintenanceRecord.vue')),
        forecast: defineAsyncComponent(() => import('./components/DeviceEnergyForecast.vue')),
        warning: defineAsyncComponent(() => import('./components/DeviceEarlyWarning.vue')),
        report: defineAsyncComponent(() => import('./components/DeviceReportGenerate.vue'))
      }
      return componentMap[this.activeModule] || componentMap.system
    }
  }
}
</script>

<style scoped>
.device-system-management {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-header h2 {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.header-actions {
  flex: 1;
  display: flex;
  justify-content: flex-end;
}
</style>
