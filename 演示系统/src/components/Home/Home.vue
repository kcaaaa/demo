<template>
  <div class="home-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>首页</h2>
      <div class="header-actions">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
        />
        <el-button type="primary" @click="refreshData">
          <i class="fa fa-refresh"></i> 刷新数据
        </el-button>
      </div>
    </div>

    <!-- 核心指标展示 -->
    <div class="core-indicators">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
          <el-card shadow="hover" class="indicator-card">
            <div class="indicator-content">
              <div class="indicator-icon energy">
                <i class="fa fa-bolt"></i>
              </div>
              <div class="indicator-info">
                <div class="indicator-label">总能耗</div>
                <div class="indicator-value">{{ coreIndicators.totalEnergy }} kWh</div>
                <div class="indicator-change">
                  <span :class="coreIndicators.totalEnergyChange > 0 ? 'increase' : 'decrease'">
                    <i class="fa" :class="coreIndicators.totalEnergyChange > 0 ? 'fa-arrow-up' : 'fa-arrow-down'"></i>
                    {{ Math.abs(coreIndicators.totalEnergyChange) }}%
                  </span>
                  <span class="change-text">较昨日</span>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
          <el-card shadow="hover" class="indicator-card">
            <div class="indicator-content">
              <div class="indicator-icon cost">
                <i class="fa fa-yen"></i>
              </div>
              <div class="indicator-info">
                <div class="indicator-label">总费用</div>
                <div class="indicator-value">¥{{ coreIndicators.totalCost }}</div>
                <div class="indicator-change">
                  <span :class="coreIndicators.totalCostChange > 0 ? 'increase' : 'decrease'">
                    <i class="fa" :class="coreIndicators.totalCostChange > 0 ? 'fa-arrow-up' : 'fa-arrow-down'">
                    </i>
                    {{ Math.abs(coreIndicators.totalCostChange) }}%
                  </span>
                  <span class="change-text">较昨日</span>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
          <el-card shadow="hover" class="indicator-card">
            <div class="indicator-content">
              <div class="indicator-icon efficiency">
                <i class="fa fa-line-chart"></i>
              </div>
              <div class="indicator-info">
                <div class="indicator-label">能效指标</div>
                <div class="indicator-value">{{ coreIndicators.efficiencyIndex }} kgce/人</div>
                <div class="indicator-change">
                  <span :class="coreIndicators.efficiencyIndexChange > 0 ? 'increase' : 'decrease'">
                    <i class="fa" :class="coreIndicators.efficiencyIndexChange > 0 ? 'fa-arrow-up' : 'fa-arrow-down'">
                    </i>
                    {{ Math.abs(coreIndicators.efficiencyIndexChange) }}%
                  </span>
                  <span class="change-text">较昨日</span>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
          <el-card shadow="hover" class="indicator-card">
            <div class="indicator-content">
              <div class="indicator-icon alert">
                <i class="fa fa-exclamation-triangle"></i>
              </div>
              <div class="indicator-info">
                <div class="indicator-label">预警数量</div>
                <div class="indicator-value">{{ coreIndicators.alertCount }}</div>
                <div class="indicator-change">
                  <span :class="coreIndicators.alertCountChange > 0 ? 'increase' : 'decrease'">
                    <i class="fa" :class="coreIndicators.alertCountChange > 0 ? 'fa-arrow-up' : 'fa-arrow-down'">
                    </i>
                    {{ Math.abs(coreIndicators.alertCountChange) }}%
                  </span>
                  <span class="change-text">较昨日</span>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 能耗趋势图 -->
    <div class="energy-trend">
      <el-card shadow="hover">
        <template #header>
          <div class="card-header">
            <span>能耗趋势图</span>
            <el-select v-model="trendTimeRange" placeholder="选择时间范围" size="small">
              <el-option label="今日" value="today" />
              <el-option label="昨日" value="yesterday" />
              <el-option label="本周" value="week" />
              <el-option label="本月" value="month" />
            </el-select>
          </div>
        </template>
        <div id="energyTrendChart" class="chart-container"></div>
      </el-card>
    </div>

    <!-- 区域能耗分析与设备能耗分析 -->
    <div class="analysis-section">
      <el-row :gutter="20">
        <!-- 区域能耗分析 -->
        <el-col :xs="24" :md="12" :lg="12" :xl="12">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>区域能耗分析</span>
                <el-button size="small" type="primary" @click="viewAreaDetail">
                  <i class="fa fa-search"></i> 查看详情
                </el-button>
              </div>
            </template>
            <div id="areaEnergyChart" class="chart-container"></div>
          </el-card>
        </el-col>

        <!-- 设备能耗分析 -->
        <el-col :xs="24" :md="12" :lg="12" :xl="12">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>设备能耗分析</span>
                <el-button size="small" type="primary" @click="viewDeviceDetail">
                  <i class="fa fa-search"></i> 查看详情
                </el-button>
              </div>
            </template>
            <div id="deviceEnergyChart" class="chart-container"></div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 时段能耗分析与能耗预警记录 -->
    <div class="bottom-section">
      <el-row :gutter="20">
        <!-- 时段能耗分析 -->
        <el-col :xs="24" :md="12" :lg="12" :xl="12">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>时段能耗分析</span>
              </div>
            </template>
            <div id="timeEnergyChart" class="chart-container"></div>
          </el-card>
        </el-col>

        <!-- 能耗预警记录 -->
        <el-col :xs="24" :md="12" :lg="12" :xl="12">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>能耗预警记录</span>
                <el-button size="small" type="primary" @click="viewAllAlerts">
                  <i class="fa fa-list"></i> 查看全部
                </el-button>
              </div>
            </template>
            <div class="alert-table">
              <el-table :data="alertRecords" stripe style="width: 100%">
                <el-table-column prop="time" label="预警时间" width="150" />
                <el-table-column prop="station" label="高铁站" width="120" />
                <el-table-column prop="area" label="区域" width="100" />
                <el-table-column prop="type" label="预警类型" width="120">
                  <template #default="scope">
                    <el-tag :type="getAlertTypeTag(scope.row.type)">
                      {{ scope.row.type }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="description" label="预警描述" />
                <el-table-column label="操作" width="100" fixed="right">
                  <template #default="scope">
                    <el-button type="text" size="small" @click="handleAlert(scope.row)">
                      <i class="fa fa-eye"></i> 处理
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { ref, onMounted, onUnmounted, reactive } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'Home',
  setup() {
    const router = useRouter()
    const dateRange = ref([])
    const trendTimeRange = ref('today')
    let energyTrendChart = null
    let areaEnergyChart = null
    let deviceEnergyChart = null
    let timeEnergyChart = null

    // 核心指标数据
    const coreIndicators = reactive({
      totalEnergy: 12543.6,
      totalEnergyChange: -2.3,
      totalCost: 8960.5,
      totalCostChange: -1.8,
      efficiencyIndex: 12.5,
      efficiencyIndexChange: -0.5,
      alertCount: 12,
      alertCountChange: 15.4
    })

    // 预警记录数据
    const alertRecords = reactive([
      {
        time: '2024-01-15 08:30',
        station: '北京南站',
        area: '候车厅',
        type: '超耗预警',
        description: '候车厅照明能耗超出阈值15%',
        status: '未处理'
      },
      {
        time: '2024-01-15 09:15',
        station: '上海虹桥站',
        area: '空调系统',
        type: '异常能耗',
        description: '空调系统能耗异常波动',
        status: '未处理'
      },
      {
        time: '2024-01-15 10:45',
        station: '广州南站',
        area: '电梯系统',
        type: '超耗预警',
        description: '电梯系统能耗超出阈值20%',
        status: '未处理'
      },
      {
        time: '2024-01-15 11:20',
        station: '深圳北站',
        area: '照明系统',
        type: '异常能耗',
        description: '照明系统能耗异常增高',
        status: '未处理'
      },
      {
        time: '2024-01-15 14:30',
        station: '杭州东站',
        area: '空调系统',
        type: '超耗预警',
        description: '空调系统能耗超出阈值18%',
        status: '未处理'
      }
    ])

    // 初始化能耗趋势图
    const initEnergyTrendChart = () => {
      const chartDom = document.getElementById('energyTrendChart')
      energyTrendChart = echarts.init(chartDom)

      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#6a7985'
            }
          }
        },
        legend: {
          data: ['实际能耗', '预测能耗'],
          top: 0
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            type: 'category',
            boundaryGap: false,
            data: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00']
          }
        ],
        yAxis: [
          {
            type: 'value',
            name: '能耗 (kWh)',
            min: 0,
            max: 1500
          }
        ],
        series: [
          {
            name: '实际能耗',
            type: 'line',
            stack: 'Total',
            smooth: true,
            lineStyle: {
              width: 3,
              color: '#409EFF'
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(64, 158, 255, 0.5)' },
                { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
              ])
            },
            emphasis: {
              focus: 'series'
            },
            data: [820, 932, 901, 934, 1290, 1330, 1320, 1450, 1330, 1220, 1020, 930]
          },
          {
            name: '预测能耗',
            type: 'line',
            stack: 'Total',
            smooth: true,
            lineStyle: {
              width: 2,
              type: 'dashed',
              color: '#909399'
            },
            emphasis: {
              focus: 'series'
            },
            data: [800, 900, 850, 950, 1250, 1300, 1350, 1400, 1350, 1200, 1050, 950]
          }
        ]
      }

      energyTrendChart.setOption(option)
    }

    // 初始化区域能耗分析图
    const initAreaEnergyChart = () => {
      const chartDom = document.getElementById('areaEnergyChart')
      areaEnergyChart = echarts.init(chartDom)

      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} kWh ({d}%)'
        },
        legend: {
          orient: 'vertical',
          right: 10,
          top: 'center'
        },
        series: [
          {
            name: '区域能耗',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '18',
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: [
              { value: 3500, name: '候车厅' },
              { value: 2800, name: '站台' },
              { value: 2200, name: '办公区' },
              { value: 1800, name: '设备间' },
              { value: 1500, name: '其他区域' }
            ]
          }
        ]
      }

      areaEnergyChart.setOption(option)
    }

    // 初始化设备能耗分析图
    const initDeviceEnergyChart = () => {
      const chartDom = document.getElementById('deviceEnergyChart')
      deviceEnergyChart = echarts.init(chartDom)

      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'value',
          boundaryGap: [0, 0.01]
        },
        yAxis: {
          type: 'category',
          data: ['空调系统', '照明系统', '电梯系统', '通风系统', '给排水系统', '其他设备']
        },
        series: [
          {
            name: '能耗 (kWh)',
            type: 'bar',
            data: [4200, 3500, 1800, 1200, 800, 1043],
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                { offset: 0, color: '#409EFF' },
                { offset: 1, color: '#67C23A' }
              ])
            }
          }
        ]
      }

      deviceEnergyChart.setOption(option)
    }

    // 初始化时段能耗分析图
    const initTimeEnergyChart = () => {
      const chartDom = document.getElementById('timeEnergyChart')
      timeEnergyChart = echarts.init(chartDom)

      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: {
          data: ['能耗值'],
          top: 0
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: ['早高峰', '上午', '下午', '晚高峰', '夜间']
        },
        yAxis: {
          type: 'value',
          name: '能耗 (kWh)'
        },
        series: [
          {
            name: '能耗值',
            type: 'bar',
            data: [3200, 2800, 2500, 3000, 1000],
            itemStyle: {
              color: function(params) {
                const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8']
                return colors[params.dataIndex]
              }
            },
            label: {
              show: true,
              position: 'top'
            }
          }
        ]
      }

      timeEnergyChart.setOption(option)
    }

    // 获取预警类型标签颜色
    const getAlertTypeTag = (type) => {
      const typeMap = {
        '超耗预警': 'warning',
        '异常能耗': 'danger',
        '效率低下': 'info'
      }
      return typeMap[type] || 'default'
    }

    // 刷新数据
    const refreshData = () => {
      // 模拟刷新数据
      console.log('刷新数据')
      // 这里可以添加实际的数据刷新逻辑
    }

    // 查看区域详情
    const viewAreaDetail = () => {
      router.push('/station-analysis')
    }

    // 查看设备详情
    const viewDeviceDetail = () => {
      router.push('/energy-ratio')
    }

    // 查看全部预警
    const viewAllAlerts = () => {
      router.push('/energy-alert')
    }

    // 处理预警
    const handleAlert = (row) => {
      console.log('处理预警:', row)
      // 这里可以添加实际的预警处理逻辑
    }

    // 响应式处理
    const handleResize = () => {
      energyTrendChart && energyTrendChart.resize()
      areaEnergyChart && areaEnergyChart.resize()
      deviceEnergyChart && deviceEnergyChart.resize()
      timeEnergyChart && timeEnergyChart.resize()
    }

    // 生命周期钩子
    onMounted(() => {
      initEnergyTrendChart()
      initAreaEnergyChart()
      initDeviceEnergyChart()
      initTimeEnergyChart()
      window.addEventListener('resize', handleResize)
    })

    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
      energyTrendChart && energyTrendChart.dispose()
      areaEnergyChart && areaEnergyChart.dispose()
      deviceEnergyChart && deviceEnergyChart.dispose()
      timeEnergyChart && timeEnergyChart.dispose()
    })

    return {
      dateRange,
      trendTimeRange,
      coreIndicators,
      alertRecords,
      refreshData,
      viewAreaDetail,
      viewDeviceDetail,
      viewAllAlerts,
      handleAlert,
      getAlertTypeTag
    }
  }
}
</script>

<style scoped>
.home-container {
  padding: 20px;
  background-color: #f5f7fa;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.core-indicators {
  margin-bottom: 20px;
}

.indicator-card {
  height: 100%;
}

.indicator-content {
  display: flex;
  align-items: center;
  padding: 10px 0;
}

.indicator-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #fff;
  margin-right: 15px;
}

.indicator-icon.energy {
  background-color: #409EFF;
}

.indicator-icon.cost {
  background-color: #67C23A;
}

.indicator-icon.efficiency {
  background-color: #E6A23C;
}

.indicator-icon.alert {
  background-color: #F56C6C;
}

.indicator-info {
  flex: 1;
}

.indicator-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 5px;
}

.indicator-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 5px;
}

.indicator-change {
  display: flex;
  align-items: center;
  gap: 5px;
}

.indicator-change .increase {
  color: #F56C6C;
}

.indicator-change .decrease {
  color: #67C23A;
}

.change-text {
  font-size: 12px;
  color: #909399;
}

.energy-trend {
  margin-bottom: 20px;
}

.analysis-section {
  margin-bottom: 20px;
}

.chart-container {
  height: 350px;
  width: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.alert-table {
  max-height: 350px;
  overflow-y: auto;
}

.bottom-section {
  margin-bottom: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .header-actions {
    width: 100%;
    justify-content: space-between;
  }

  .indicator-content {
    flex-direction: column;
    text-align: center;
  }

  .indicator-icon {
    margin-right: 0;
    margin-bottom: 10px;
  }
}
</style>