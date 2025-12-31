<template>
  <div class="energy-ratio-container">
    <el-card shadow="hover" class="energy-card">
      <template #header>
        <div class="card-header">
          <h2>能耗比例分析</h2>
          <div class="header-actions">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              size="small"
              style="margin-right: 10px"
            />
            <el-select v-model="energyType" placeholder="能耗类型" size="small" style="width: 120px; margin-right: 10px">
              <el-option label="总能耗" value="total" />
              <el-option label="电力" value="electricity" />
              <el-option label="空调" value="airConditioning" />
              <el-option label="照明" value="lighting" />
              <el-option label="其他" value="other" />
            </el-select>
            <el-button type="primary" size="small" @click="handleRefresh">
              <i class="fas fa-sync-alt"></i> 刷新数据
            </el-button>
            <el-button size="small" @click="handleExport">
              <i class="fas fa-download"></i> 导出报表
            </el-button>
          </div>
        </div>
      </template>
      
      <!-- 能耗比例概览 -->
      <div class="ratio-overview">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :lg="6">
            <el-card class="overview-card">
              <div class="card-content">
                <div class="card-icon total-icon">
                  <i class="fas fa-bolt"></i>
                </div>
                <div class="card-info">
                  <div class="card-title">总能耗占比</div>
                  <div class="card-value">{{ totalEnergyRatio }}%</div>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :xs="24" :sm="12" :lg="6">
            <el-card class="overview-card">
              <div class="card-content">
                <div class="card-icon electricity-icon">
                  <i class="fas fa-plug"></i>
                </div>
                <div class="card-info">
                  <div class="card-title">电力能耗占比</div>
                  <div class="card-value">{{ electricityRatio }}%</div>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :xs="24" :sm="12" :lg="6">
            <el-card class="overview-card">
              <div class="card-content">
                <div class="card-icon ac-icon">
                  <i class="fas fa-snowflake"></i>
                </div>
                <div class="card-info">
                  <div class="card-title">空调能耗占比</div>
                  <div class="card-value">{{ acRatio }}%</div>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :xs="24" :sm="12" :lg="6">
            <el-card class="overview-card">
              <div class="card-content">
                <div class="card-icon lighting-icon">
                  <i class="fas fa-lightbulb"></i>
                </div>
                <div class="card-info">
                  <div class="card-title">照明能耗占比</div>
                  <div class="card-value">{{ lightingRatio }}%</div>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <!-- 能耗比例图表 -->
      <div class="ratio-charts">
        <el-row :gutter="20">
          <el-col :xs="24" :lg="12">
            <el-card class="chart-card">
              <template #header>
                <div class="card-title">按区域能耗比例</div>
              </template>
              <div ref="areaChart" class="chart-container"></div>
            </el-card>
          </el-col>
          <el-col :xs="24" :lg="12">
            <el-card class="chart-card">
              <template #header>
                <div class="card-title">按设备类型能耗比例</div>
              </template>
              <div ref="deviceTypeChart" class="chart-container"></div>
            </el-card>
          </el-col>
        </el-row>
        
        <el-row :gutter="20" style="margin-top: 20px">
          <el-col :xs="24" :lg="12">
            <el-card class="chart-card">
              <template #header>
                <div class="card-title">按时段能耗比例</div>
              </template>
              <div ref="timeChart" class="chart-container"></div>
            </el-card>
          </el-col>
          <el-col :xs="24" :lg="12">
            <el-card class="chart-card">
              <template #header>
                <div class="card-title">能耗类型分布</div>
              </template>
              <div ref="energyTypeChart" class="chart-container"></div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <!-- 能耗趋势分析 -->
      <div class="trend-analysis">
        <el-card class="trend-card">
          <template #header>
            <div class="card-title">能耗比例趋势</div>
          </template>
          <div ref="trendChart" class="chart-container-large"></div>
        </el-card>
      </div>

      <!-- 详细数据分析 -->
      <div class="detailed-analysis">
        <el-card class="analysis-card">
          <template #header>
            <div class="card-header">
              <h3>详细数据分析</h3>
              <el-select v-model="analysisDimension" placeholder="分析维度" size="small" style="width: 120px">
                <el-option label="区域" value="area" />
                <el-option label="设备类型" value="deviceType" />
                <el-option label="时段" value="time" />
              </el-select>
            </div>
          </template>
          <el-table :data="detailedData" stripe style="width: 100%">
            <el-table-column prop="name" label="名称" width="120" />
            <el-table-column prop="energyConsumption" label="能耗值" width="150">
              <template #default="scope">
                {{ scope.row.energyConsumption }} kWh
              </template>
            </el-table-column>
            <el-table-column prop="percentage" label="占比" width="100">
              <template #default="scope">
                <el-progress :percentage="scope.row.percentage" :stroke-width="10" />
              </template>
            </el-table-column>
            <el-table-column prop="cost" label="成本" width="120">
              <template #default="scope">
                ¥{{ scope.row.cost }}
              </template>
            </el-table-column>
            <el-table-column prop="yearOnYear" label="同比变化" width="120">
              <template #default="scope">
                <span :class="scope.row.yearOnYear >= 0 ? 'increase' : 'decrease'">
                  {{ scope.row.yearOnYear >= 0 ? '+' : '' }}{{ scope.row.yearOnYear }}%
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="monthOnMonth" label="环比变化" width="120">
              <template #default="scope">
                <span :class="scope.row.monthOnMonth >= 0 ? 'increase' : 'decrease'">
                  {{ scope.row.monthOnMonth >= 0 ? '+' : '' }}{{ scope.row.monthOnMonth }}%
                </span>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </div>
    </el-card>
  </div>
</template>

<script>
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import * as echarts from 'echarts'

export default {
  name: 'EnergyRatio',
  setup() {
    // 图表实例
    const areaChart = ref(null)
    const deviceTypeChart = ref(null)
    const timeChart = ref(null)
    const energyTypeChart = ref(null)
    const trendChart = ref(null)
    let areaChartInstance = null
    let deviceTypeChartInstance = null
    let timeChartInstance = null
    let energyTypeChartInstance = null
    let trendChartInstance = null

    // 筛选条件
    const dateRange = ref([])
    const energyType = ref('total')
    const analysisDimension = ref('area')

    // 概览数据
    const totalEnergyRatio = ref(100)
    const electricityRatio = ref(45)
    const acRatio = ref(30)
    const lightingRatio = ref(15)

    // 详细数据
    const detailedData = reactive([
      { name: '候车大厅', energyConsumption: 12500, percentage: 35, cost: 8750, yearOnYear: -5.2, monthOnMonth: 2.1 },
      { name: '售票区域', energyConsumption: 4500, percentage: 12.6, cost: 3150, yearOnYear: 3.5, monthOnMonth: 1.8 },
      { name: '站台区域', energyConsumption: 8200, percentage: 22.9, cost: 5740, yearOnYear: -2.8, monthOnMonth: -0.5 },
      { name: '办公区域', energyConsumption: 6800, percentage: 19, cost: 4760, yearOnYear: 4.2, monthOnMonth: 3.1 },
      { name: '其他区域', energyConsumption: 3400, percentage: 9.5, cost: 2380, yearOnYear: 1.5, monthOnMonth: -1.2 }
    ])

    // 初始化按区域能耗比例图表
    const initAreaChart = () => {
      if (areaChartInstance) {
        areaChartInstance.dispose()
      }
      areaChartInstance = echarts.init(areaChart.value)
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} kWh ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 10,
          data: ['候车大厅', '售票区域', '站台区域', '办公区域', '其他区域']
        },
        series: [
          {
            name: '区域能耗',
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['60%', '50%'],
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
                fontSize: '16',
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: [
              { value: 12500, name: '候车大厅' },
              { value: 4500, name: '售票区域' },
              { value: 8200, name: '站台区域' },
              { value: 6800, name: '办公区域' },
              { value: 3400, name: '其他区域' }
            ]
          }
        ]
      }
      areaChartInstance.setOption(option)
    }

    // 初始化按设备类型能耗比例图表
    const initDeviceTypeChart = () => {
      if (deviceTypeChartInstance) {
        deviceTypeChartInstance.dispose()
      }
      deviceTypeChartInstance = echarts.init(deviceTypeChart.value)
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
          axisLabel: {
            formatter: '{value}%'
          }
        },
        yAxis: {
          type: 'category',
          data: ['空调系统', '照明系统', '电力设备', '通风系统', '其他设备']
        },
        series: [
          {
            name: '能耗占比',
            type: 'bar',
            data: [35, 20, 25, 15, 5],
            itemStyle: {
              borderRadius: [0, 4, 4, 0],
              color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                { offset: 0, color: '#409EFF' },
                { offset: 1, color: '#67C23A' }
              ])
            }
          }
        ]
      }
      deviceTypeChartInstance.setOption(option)
    }

    // 初始化按时段能耗比例图表
    const initTimeChart = () => {
      if (timeChartInstance) {
        timeChartInstance.dispose()
      }
      timeChartInstance = echarts.init(timeChart.value)
      const option = {
        tooltip: {
          trigger: 'item'
        },
        radar: {
          indicator: [
            { name: '00:00-06:00', max: 100 },
            { name: '06:00-12:00', max: 100 },
            { name: '12:00-18:00', max: 100 },
            { name: '18:00-24:00', max: 100 }
          ]
        },
        series: [
          {
            name: '时段能耗比例',
            type: 'radar',
            data: [
              {
                value: [15, 35, 30, 20],
                name: '能耗占比',
                areaStyle: {
                  color: 'rgba(64, 158, 255, 0.3)'
                },
                lineStyle: {
                  color: '#409EFF'
                },
                itemStyle: {
                  color: '#409EFF'
                }
              }
            ]
          }
        ]
      }
      timeChartInstance.setOption(option)
    }

    // 初始化能耗类型分布图表
    const initEnergyTypeChart = () => {
      if (energyTypeChartInstance) {
        energyTypeChartInstance.dispose()
      }
      energyTypeChartInstance = echarts.init(energyTypeChart.value)
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} kWh ({d}%)'
        },
        legend: {
          orient: 'horizontal',
          bottom: 10,
          data: ['电力', '空调', '照明', '其他']
        },
        series: [
          {
            name: '能耗类型',
            type: 'pie',
            radius: '60%',
            center: ['50%', '40%'],
            data: [
              { value: 16000, name: '电力' },
              { value: 10800, name: '空调' },
              { value: 5400, name: '照明' },
              { value: 1800, name: '其他' }
            ],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      }
      energyTypeChartInstance.setOption(option)
    }

    // 初始化能耗比例趋势图表
    const initTrendChart = () => {
      if (trendChartInstance) {
        trendChartInstance.dispose()
      }
      trendChartInstance = echarts.init(trendChart.value)
      const option = {
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['电力', '空调', '照明', '其他']
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            formatter: '{value}%'
          }
        },
        series: [
          {
            name: '电力',
            type: 'line',
            stack: 'Total',
            data: [42, 45, 43, 46, 44, 47, 45, 48, 46, 49, 47, 50],
            areaStyle: {
              color: 'rgba(64, 158, 255, 0.3)'
            },
            lineStyle: {
              color: '#409EFF'
            }
          },
          {
            name: '空调',
            type: 'line',
            stack: 'Total',
            data: [28, 30, 32, 35, 38, 42, 45, 48, 45, 42, 38, 32],
            areaStyle: {
              color: 'rgba(233, 30, 99, 0.3)'
            },
            lineStyle: {
              color: '#E91E63'
            }
          },
          {
            name: '照明',
            type: 'line',
            stack: 'Total',
            data: [18, 17, 16, 14, 13, 11, 10, 9, 11, 13, 15, 17],
            areaStyle: {
              color: 'rgba(255, 205, 86, 0.3)'
            },
            lineStyle: {
              color: '#FFCD56'
            }
          },
          {
            name: '其他',
            type: 'line',
            stack: 'Total',
            data: [12, 8, 9, 5, 5, 0, 0, 0, 5, 6, 8, 10],
            areaStyle: {
              color: 'rgba(76, 175, 80, 0.3)'
            },
            lineStyle: {
              color: '#4CAF50'
            }
          }
        ]
      }
      trendChartInstance.setOption(option)
    }

    // 响应式调整图表大小
    const handleResize = () => {
      if (areaChartInstance) {
        areaChartInstance.resize()
      }
      if (deviceTypeChartInstance) {
        deviceTypeChartInstance.resize()
      }
      if (timeChartInstance) {
        timeChartInstance.resize()
      }
      if (energyTypeChartInstance) {
        energyTypeChartInstance.resize()
      }
      if (trendChartInstance) {
        trendChartInstance.resize()
      }
    }

    // 刷新数据
    const handleRefresh = () => {
      // 刷新数据逻辑
      console.log('刷新数据')
      alert('数据已刷新')
    }

    // 导出报表
    const handleExport = () => {
      // 导出报表逻辑
      console.log('导出报表')
      alert('报表导出功能开发中')
    }

    // 生命周期钩子
    onMounted(() => {
      initAreaChart()
      initDeviceTypeChart()
      initTimeChart()
      initEnergyTypeChart()
      initTrendChart()
      window.addEventListener('resize', handleResize)
    })

    onUnmounted(() => {
      if (areaChartInstance) {
        areaChartInstance.dispose()
      }
      if (deviceTypeChartInstance) {
        deviceTypeChartInstance.dispose()
      }
      if (timeChartInstance) {
        timeChartInstance.dispose()
      }
      if (energyTypeChartInstance) {
        energyTypeChartInstance.dispose()
      }
      if (trendChartInstance) {
        trendChartInstance.dispose()
      }
      window.removeEventListener('resize', handleResize)
    })

    return {
      areaChart,
      deviceTypeChart,
      timeChart,
      energyTypeChart,
      trendChart,
      dateRange,
      energyType,
      analysisDimension,
      totalEnergyRatio,
      electricityRatio,
      acRatio,
      lightingRatio,
      detailedData,
      handleRefresh,
      handleExport
    }
  }
}
</script>

<style scoped>
.energy-ratio-container {
  padding: 20px;
}

.energy-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.card-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.header-actions {
  display: flex;
  align-items: center;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

/* 能耗比例概览 */
.ratio-overview {
  margin-bottom: 20px;
}

.overview-card {
  height: 120px;
  border-radius: 8px;
  transition: all 0.3s;
}

.overview-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.card-content {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.card-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-right: 20px;
}

.total-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.electricity-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.ac-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.lighting-icon {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  color: white;
}

.card-info {
  flex: 1;
}

.card-value {
  font-size: 24px;
  font-weight: 700;
  color: #303133;
  margin-top: 5px;
}

/* 能耗比例图表 */
.ratio-charts {
  margin-bottom: 20px;
}

.chart-card {
  height: 300px;
}

.chart-container {
  width: 100%;
  height: calc(100% - 40px);
}

.chart-container-large {
  width: 100%;
  height: 400px;
}

/* 能耗趋势分析 */
.trend-analysis {
  margin-bottom: 20px;
}

.trend-card {
  margin-bottom: 20px;
}

/* 详细数据分析 */
.detailed-analysis {
  margin-bottom: 20px;
}

.analysis-card {
  margin-bottom: 20px;
}

/* 数据变化样式 */
.increase {
  color: #f56c6c;
}

.decrease {
  color: #67c23a;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .energy-ratio-container {
    padding: 10px;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .card-header h2,
  .card-header h3 {
    margin-bottom: 10px;
  }
  
  .header-actions {
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
  }
  
  .header-actions .el-date-picker,
  .header-actions .el-select,
  .header-actions .el-button {
    width: 100%;
    margin-right: 0;
    margin-bottom: 10px;
  }
  
  .card-content {
    flex-direction: column;
    text-align: center;
  }
  
  .card-icon {
    margin-right: 0;
    margin-bottom: 10px;
  }
}
</style>