<template>
  <div class="multi-station-compare-container">
    <!-- 页面标题 -->
    <el-card shadow="hover" class="page-header">
      <h1 class="page-title">
        <i class="fa fa-line-chart"></i> 多站能耗对比分析
      </h1>
      <p class="page-subtitle">对不同高铁站的能耗数据进行全面对比分析，找出节能潜力</p>
    </el-card>

    <!-- 筛选条件 -->
    <el-card shadow="hover" class="filter-card">
      <div class="filter-container">
        <div class="filter-item">
          <span class="filter-label">站点选择</span>
          <el-select 
            v-model="selectedStations" 
            multiple 
            placeholder="请选择站点" 
            style="width: 300px"
            collapse-tags
          >
            <el-option 
              v-for="station in stationOptions" 
              :key="station.value" 
              :label="station.label" 
              :value="station.value"
            />
          </el-select>
        </div>
        <div class="filter-item">
          <span class="filter-label">时间范围</span>
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 300px"
          />
        </div>
        <div class="filter-item">
          <span class="filter-label">能源类型</span>
          <el-select v-model="energyType" placeholder="请选择能源类型" style="width: 150px">
            <el-option label="总能耗" value="total" />
            <el-option label="电力" value="electricity" />
            <el-option label="燃气" value="gas" />
            <el-option label="水" value="water" />
          </el-select>
        </div>
        <div class="filter-item">
          <el-button type="primary" @click="handleCompare">
            <i class="fa fa-search"></i> 对比分析
          </el-button>
          <el-button @click="handleReset">
            <i class="fa fa-refresh"></i> 重置
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 对比概览 -->
    <el-row :gutter="20" class="overview-row" v-if="selectedStations.length > 0">
      <el-col :xs="24" :sm="12" :md="8" v-for="station in selectedStations" :key="station">
        <el-card shadow="hover" class="station-overview-card">
          <div class="station-header">
            <h3 class="station-name">{{ getStationName(station) }}</h3>
            <i class="fa fa-building station-icon"></i>
          </div>
          <div class="station-metrics">
            <div class="metric-item">
              <span class="metric-label">总能耗</span>
              <span class="metric-value">{{ getStationMetric(station, 'totalEnergy') }}</span>
              <span class="metric-unit">kWh</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">单位面积能耗</span>
              <span class="metric-value">{{ getStationMetric(station, 'energyPerArea') }}</span>
              <span class="metric-unit">kWh/m²</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">同比变化</span>
              <span class="metric-value" :class="getTrendClass(getStationMetric(station, 'yearOnYear'))">
                {{ getStationMetric(station, 'yearOnYear') }}%
              </span>
            </div>
            <div class="metric-item">
              <span class="metric-label">环比变化</span>
              <span class="metric-value" :class="getTrendClass(getStationMetric(station, 'monthOnMonth'))">
                {{ getStationMetric(station, 'monthOnMonth') }}%
              </span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 对比图表 -->
    <el-row :gutter="20" class="charts-row" v-if="selectedStations.length > 0">
      <!-- 总能耗对比 -->
      <el-col :xs="24">
        <el-card shadow="hover" class="chart-card">
          <div slot="header" class="card-header">
            <h3 class="card-title">
              <i class="fa fa-bar-chart"></i> 总能耗对比
            </h3>
          </div>
          <div class="chart-container">
            <div ref="totalEnergyChart" class="chart"></div>
          </div>
        </el-card>
      </el-col>

      <!-- 能耗趋势对比 -->
      <el-col :xs="24">
        <el-card shadow="hover" class="chart-card">
          <div slot="header" class="card-header">
            <h3 class="card-title">
              <i class="fa fa-line-chart"></i> 能耗趋势对比
            </h3>
            <el-select v-model="trendTimeInterval" placeholder="选择时间间隔" size="small">
              <el-option label="日" value="day" />
              <el-option label="周" value="week" />
              <el-option label="月" value="month" />
            </el-select>
          </div>
          <div class="chart-container">
            <div ref="energyTrendChart" class="chart"></div>
          </div>
        </el-card>
      </el-col>

      <!-- 能耗结构对比 -->
      <el-col :xs="24" :md="12">
        <el-card shadow="hover" class="chart-card">
          <div slot="header" class="card-header">
            <h3 class="card-title">
              <i class="fa fa-pie-chart"></i> 能耗结构对比
            </h3>
          </div>
          <div class="chart-container">
            <div ref="energyStructureChart" class="chart"></div>
          </div>
        </el-card>
      </el-col>

      <!-- 单位面积能耗对比 -->
      <el-col :xs="24" :md="12">
        <el-card shadow="hover" class="chart-card">
          <div slot="header" class="card-header">
            <h3 class="card-title">
              <i class="fa fa-tachometer"></i> 单位面积能耗对比
            </h3>
          </div>
          <div class="chart-container">
            <div ref="energyPerAreaChart" class="chart"></div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 对比结果分析 -->
    <el-row :gutter="20" v-if="selectedStations.length > 0">
      <el-col :xs="24">
        <el-card shadow="hover" class="analysis-card">
          <div slot="header" class="card-header">
            <h3 class="card-title">
              <i class="fa fa-lightbulb-o"></i> 对比结果分析
            </h3>
          </div>
          <div class="analysis-content">
            <div class="analysis-section">
              <h4 class="section-title">能耗水平排名</h4>
              <el-table :data="stationRanking" stripe border style="width: 100%">
                <el-table-column prop="rank" label="排名" width="80" />
                <el-table-column prop="station" label="站点" width="150" />
                <el-table-column prop="totalEnergy" label="总能耗(kWh)" width="120" sortable />
                <el-table-column prop="energyPerArea" label="单位面积能耗(kWh/m²)" width="150" sortable />
                <el-table-column prop="yearOnYear" label="同比变化(%)" width="120">
                  <template #default="scope">
                    <span :class="getTrendClass(scope.row.yearOnYear)">{{ scope.row.yearOnYear }}%</span>
                  </template>
                </el-table-column>
              </el-table>
            </div>
            <div class="analysis-section">
              <h4 class="section-title">节能潜力分析</h4>
              <el-timeline>
                <el-timeline-item
                  v-for="(item, index) in energySavingPotential"
                  :key="index"
                  :timestamp="item.station"
                  :type="'success'"
                  placement="top"
                >
                  <div class="timeline-content">
                    <p class="potential-title">{{ item.title }}</p>
                    <p class="potential-description">{{ item.description }}</p>
                    <p class="potential-value">预计节能潜力：{{ item.potential }}kWh/年</p>
                  </div>
                </el-timeline-item>
              </el-timeline>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { ref, onMounted, onUnmounted, reactive, computed, watch } from 'vue'

export default {
  name: 'MultiStationCompare',
  setup() {
    // 站点选项
    const stationOptions = ref([
      { label: '北京南站', value: 'beijing' },
      { label: '上海虹桥站', value: 'shanghai' },
      { label: '广州南站', value: 'guangzhou' },
      { label: '深圳北站', value: 'shenzhen' },
      { label: '杭州东站', value: 'hangzhou' },
      { label: '南京南站', value: 'nanjing' },
      { label: '成都东站', value: 'chengdu' },
      { label: '武汉站', value: 'wuhan' }
    ])

    // 选中的站点
    const selectedStations = ref(['beijing', 'shanghai', 'guangzhou', 'shenzhen'])

    // 筛选条件
    const dateRange = ref([new Date('2024-01-01'), new Date('2024-01-31')])
    const energyType = ref('total')
    const trendTimeInterval = ref('day')

    // 调色板，保持图例/图表颜色一致
    const palette = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399', '#722ED1', '#13C2C2', '#FA8C16']
    const getColor = (index) => palette[index % palette.length]

    // 站点能耗数据
    const stationEnergyData = reactive({
      beijing: {
        totalEnergy: 1256000,
        energyPerArea: 85.6,
        yearOnYear: -5.2,
        monthOnMonth: 2.8,
        energyStructure: [
          { name: '电力', value: 785000 },
          { name: '燃气', value: 285000 },
          { name: '水', value: 186000 }
        ],
        dailyTrend: Array.from({ length: 31 }, (_, i) => Math.floor(Math.random() * 5000) + 38000),
        monthTrend: [24500, 23800, 25200, 24100, 25600, 24800]
      },
      shanghai: {
        totalEnergy: 1428000,
        energyPerArea: 92.3,
        yearOnYear: -3.8,
        monthOnMonth: 3.5,
        energyStructure: [
          { name: '电力', value: 892000 },
          { name: '燃气', value: 325000 },
          { name: '水', value: 211000 }
        ],
        dailyTrend: Array.from({ length: 31 }, (_, i) => Math.floor(Math.random() * 6000) + 42000),
        monthTrend: [23800, 23200, 24500, 23900, 24800, 24100]
      },
      guangzhou: {
        totalEnergy: 1185000,
        energyPerArea: 81.2,
        yearOnYear: -6.5,
        monthOnMonth: 1.9,
        energyStructure: [
          { name: '电力', value: 723000 },
          { name: '燃气', value: 268000 },
          { name: '水', value: 194000 }
        ],
        dailyTrend: Array.from({ length: 31 }, (_, i) => Math.floor(Math.random() * 4500) + 35000),
        monthTrend: [22800, 22500, 23500, 23200, 24200, 23800]
      },
      shenzhen: {
        totalEnergy: 1092000,
        energyPerArea: 78.5,
        yearOnYear: -4.9,
        monthOnMonth: 2.2,
        energyStructure: [
          { name: '电力', value: 682000 },
          { name: '燃气', value: 245000 },
          { name: '水', value: 165000 }
        ],
        dailyTrend: Array.from({ length: 31 }, (_, i) => Math.floor(Math.random() * 4000) + 32000),
        monthTrend: [21500, 20800, 22200, 21800, 22600, 22000]
      },
      hangzhou: {
        totalEnergy: 987000,
        energyPerArea: 73.8,
        yearOnYear: -7.2,
        monthOnMonth: 1.5,
        energyStructure: [
          { name: '电力', value: 612000 },
          { name: '燃气', value: 228000 },
          { name: '水', value: 147000 }
        ],
        dailyTrend: Array.from({ length: 31 }, (_, i) => Math.floor(Math.random() * 3500) + 28000),
        monthTrend: [18500, 18200, 19100, 18800, 19600, 19000]
      },
      nanjing: {
        totalEnergy: 895000,
        energyPerArea: 70.2,
        yearOnYear: -5.8,
        monthOnMonth: 2.1,
        energyStructure: [
          { name: '电力', value: 558000 },
          { name: '燃气', value: 205000 },
          { name: '水', value: 132000 }
        ],
        dailyTrend: Array.from({ length: 31 }, (_, i) => Math.floor(Math.random() * 3000) + 26000),
        monthTrend: [16800, 16400, 17500, 17200, 18000, 17600]
      },
      chengdu: {
        totalEnergy: 932000,
        energyPerArea: 72.5,
        yearOnYear: -6.1,
        monthOnMonth: 1.8,
        energyStructure: [
          { name: '电力', value: 582000 },
          { name: '燃气', value: 218000 },
          { name: '水', value: 132000 }
        ],
        dailyTrend: Array.from({ length: 31 }, (_, i) => Math.floor(Math.random() * 3200) + 27000),
        monthTrend: [17400, 17000, 18100, 17800, 18600, 18200]
      },
      wuhan: {
        totalEnergy: 867000,
        energyPerArea: 69.8,
        yearOnYear: -4.5,
        monthOnMonth: 2.5,
        energyStructure: [
          { name: '电力', value: 538000 },
          { name: '燃气', value: 198000 },
          { name: '水', value: 131000 }
        ],
        dailyTrend: Array.from({ length: 31 }, (_, i) => Math.floor(Math.random() * 2800) + 24000),
        monthTrend: [16200, 15800, 16900, 16600, 17400, 17000]
      }
    })

    // 图表引用
    const totalEnergyChart = ref(null)
    const energyTrendChart = ref(null)
    const energyStructureChart = ref(null)
    const energyPerAreaChart = ref(null)

    // 图表实例
    let totalEnergyChartInstance = null
    let energyTrendChartInstance = null
    let energyStructureChartInstance = null
    let energyPerAreaChartInstance = null

    // 获取站点名称
    const getStationName = (stationKey) => {
      const station = stationOptions.value.find(s => s.value === stationKey)
      return station ? station.label : stationKey
    }

    // 获取站点指标
    const getStationMetric = (stationKey, metric) => {
      return stationEnergyData[stationKey]?.[metric] || 0
    }

    // 获取趋势样式
    const getTrendClass = (value) => {
      if (value > 0) return 'trend-up'
      if (value < 0) return 'trend-down'
      return ''
    }

    // 站点排名
    const stationRanking = computed(() => {
      return selectedStations.value
        .map(station => ({
          station: getStationName(station),
          totalEnergy: stationEnergyData[station].totalEnergy,
          energyPerArea: stationEnergyData[station].energyPerArea,
          yearOnYear: stationEnergyData[station].yearOnYear
        }))
        .sort((a, b) => a.totalEnergy - b.totalEnergy)
        .map((item, index) => ({
          ...item,
          rank: index + 1
        }))
    })

    // 节能潜力
    const energySavingPotential = computed(() => {
      return selectedStations.value
        .map(station => ({
          station: getStationName(station),
          title: `${getStationName(station)}节能潜力分析`,
          description: `通过对比分析，${getStationName(station)}的单位面积能耗高于行业平均水平${Math.abs(stationEnergyData[station].yearOnYear)}%，主要体现在${stationEnergyData[station].totalEnergy > 1200000 ? '空调系统' : '照明系统'}能耗过高`,
          potential: Math.floor(stationEnergyData[station].totalEnergy * 0.15)
        }))
        .sort((a, b) => b.potential - a.potential)
    })

    const getTrendXAxis = () => {
      if (trendTimeInterval.value === 'day') {
        return Array.from({ length: 31 }, (_, i) => `${i + 1}日`)
      }
      if (trendTimeInterval.value === 'week') {
        return ['第1周', '第2周', '第3周', '第4周', '第5周']
      }
      return ['1月', '2月', '3月', '4月', '5月', '6月']
    }

    const getTrendDataByInterval = (stationKey) => {
      const data = stationEnergyData[stationKey]
      if (!data) return []
      if (trendTimeInterval.value === 'day') {
        return data.dailyTrend
      }
      if (trendTimeInterval.value === 'week') {
        const weeks = []
        const chunkSize = Math.ceil(data.dailyTrend.length / 5)
        for (let i = 0; i < data.dailyTrend.length; i += chunkSize) {
          const slice = data.dailyTrend.slice(i, i + chunkSize)
          const avg = Math.round(slice.reduce((a, b) => a + b, 0) / slice.length)
          weeks.push(avg)
        }
        return weeks
      }
      return data.monthTrend || []
    }

    // 初始化总能耗对比图表
    const initTotalEnergyChart = () => {
      if (!totalEnergyChart.value) return
      if (totalEnergyChartInstance) {
        totalEnergyChartInstance.dispose()
      }
      totalEnergyChartInstance = echarts.init(totalEnergyChart.value)
      
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: {
          data: selectedStations.value.map(getStationName),
          top: 0,
          left: 'center'
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '12%',
          top: 40,
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: ['总能耗']
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            formatter: '{value}'
          }
        },
        series: selectedStations.value.map((station, index) => ({
          name: getStationName(station),
          type: 'bar',
          data: [stationEnergyData[station].totalEnergy],
          itemStyle: {
            color: getColor(index)
          }
        }))
      }
      
      totalEnergyChartInstance.setOption(option, true)
    }

    // 初始化能耗趋势对比图表
    const initEnergyTrendChart = () => {
      if (!energyTrendChart.value) return
      if (energyTrendChartInstance) {
        energyTrendChartInstance.dispose()
      }
      energyTrendChartInstance = echarts.init(energyTrendChart.value)
      
      const xAxisData = getTrendXAxis()
      
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross'
          }
        },
        legend: {
          data: selectedStations.value.map(getStationName),
          bottom: 0
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '12%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: xAxisData
        },
        yAxis: {
          type: 'value',
          name: '能耗(kWh)'
        },
        series: selectedStations.value.map((station, index) => ({
          name: getStationName(station),
          type: 'line',
          data: getTrendDataByInterval(station),
          smooth: true,
          itemStyle: {
            color: getColor(index)
          },
          areaStyle: {
            opacity: 0.12,
            color: getColor(index)
          },
          showSymbol: false
        }))
      }
      
      energyTrendChartInstance.setOption(option, true)
    }

    // 初始化能耗结构对比图表
    const initEnergyStructureChart = () => {
      if (!energyStructureChart.value) return
      if (energyStructureChartInstance) {
        energyStructureChartInstance.dispose()
      }
      energyStructureChartInstance = echarts.init(energyStructureChart.value)
      
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} ({d}%)'
        },
        legend: {
          data: ['电力', '燃气', '水'],
          bottom: 10
        },
        series: selectedStations.value.map((station, index) => ({
          name: getStationName(station),
          type: 'pie',
          radius: [`${index * 15 + 15}%`, `${index * 15 + 30}%`],
          center: ['50%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '12',
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: stationEnergyData[station].energyStructure.map((item, i) => ({
            ...item,
            itemStyle: { color: getColor(i) }
          }))
        }))
      }
      
      energyStructureChartInstance.setOption(option)
    }

    // 初始化单位面积能耗对比图表
    const initEnergyPerAreaChart = () => {
      if (!energyPerAreaChart.value) return
      if (energyPerAreaChartInstance) {
        energyPerAreaChartInstance.dispose()
      }
      energyPerAreaChartInstance = echarts.init(energyPerAreaChart.value)
      
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
          name: '单位面积能耗(kWh/m²)'
        },
        yAxis: {
          type: 'category',
          data: selectedStations.value.map(getStationName)
        },
        series: [
          {
            name: '单位面积能耗',
            type: 'bar',
            data: selectedStations.value.map(station => stationEnergyData[station].energyPerArea),
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                { offset: 0, color: getColor(0) },
                { offset: 1, color: getColor(1) }
              ])
            },
            label: {
              show: true,
              position: 'right'
            }
          }
        ]
      }
      
      energyPerAreaChartInstance.setOption(option, true)
    }

    // 初始化所有图表
    const initCharts = () => {
      // 确保 DOM 已渲染再初始化，避免空容器导致不显示
      requestAnimationFrame(() => {
        initTotalEnergyChart()
        initEnergyTrendChart()
        initEnergyStructureChart()
        initEnergyPerAreaChart()
      })
    }

    // 处理窗口大小变化
    const handleWindowResize = () => {
      totalEnergyChartInstance?.resize()
      energyTrendChartInstance?.resize()
      energyStructureChartInstance?.resize()
      energyPerAreaChartInstance?.resize()
    }

    // 对比分析
    const handleCompare = () => {
      if (selectedStations.value.length === 0) {
        alert('请至少选择一个站点进行对比')
        return
      }
      initCharts()
    }

    // 重置
    const handleReset = () => {
      selectedStations.value = ['beijing', 'shanghai', 'guangzhou', 'shenzhen']
      dateRange.value = [new Date('2024-01-01'), new Date('2024-01-31')]
      energyType.value = 'total'
      trendTimeInterval.value = 'day'
      initCharts()
    }

    // 生命周期
    onMounted(() => {
      initCharts()
      window.addEventListener('resize', handleWindowResize)
    })

    watch(trendTimeInterval, () => {
      initEnergyTrendChart()
    })

    watch(selectedStations, () => {
      initTotalEnergyChart()
      initEnergyTrendChart()
      initEnergyStructureChart()
      initEnergyPerAreaChart()
    })

    onUnmounted(() => {
      window.removeEventListener('resize', handleWindowResize)
      totalEnergyChartInstance?.dispose()
      energyTrendChartInstance?.dispose()
      energyStructureChartInstance?.dispose()
      energyPerAreaChartInstance?.dispose()
    })

    return {
      stationOptions,
      selectedStations,
      dateRange,
      energyType,
      trendTimeInterval,
      totalEnergyChart,
      energyTrendChart,
      energyStructureChart,
      energyPerAreaChart,
      getStationName,
      getStationMetric,
      getTrendClass,
      stationRanking,
      energySavingPotential,
      handleCompare,
      handleReset
    }
  }
}
</script>

<style scoped>
.multi-station-compare-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 20px;
}

.page-title {
  margin: 0 0 10px 0;
  font-size: 28px;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 10px;
}

.page-subtitle {
  margin: 0;
  font-size: 16px;
  color: #606266;
}

.filter-card {
  margin-bottom: 20px;
}

.filter-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: center;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-label {
  font-weight: bold;
  color: #606266;
}

.overview-row {
  margin-bottom: 20px;
}

.station-overview-card {
  height: 100%;
  transition: all 0.3s;
}

.station-overview-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.1);
}

.station-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

.station-name {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.station-icon {
  font-size: 24px;
  color: #409EFF;
}

.station-metrics {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.metric-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.metric-label {
  font-size: 14px;
  color: #606266;
}

.metric-value {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.metric-unit {
  font-size: 12px;
  color: #909399;
}

.trend-up {
  color: #F56C6C;
}

.trend-down {
  color: #67C23A;
}

.charts-row {
  margin-bottom: 20px;
}

.chart-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  margin: 0;
  font-size: 18px;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 10px;
}

.chart-container {
  height: 350px;
  padding: 10px;
}

.chart {
  width: 100%;
  height: 100%;
}

.analysis-card {
  margin-bottom: 20px;
}

.analysis-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.analysis-section {
  padding: 10px 0;
}

.section-title {
  margin: 0 0 15px 0;
  font-size: 16px;
  color: #303133;
}

.timeline-content {
  padding: 10px;
}

.potential-title {
  margin: 0 0 5px 0;
  font-weight: bold;
  color: #303133;
}

.potential-description {
  margin: 0 0 5px 0;
  color: #606266;
  font-size: 14px;
}

.potential-value {
  margin: 0;
  color: #409EFF;
  font-weight: bold;
  font-size: 14px;
}
</style>
