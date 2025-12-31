<template>
  <div class="system-energy-analysis">
    <div class="filter-section">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="系统选择">
          <el-select v-model="filterForm.systemId" placeholder="全部系统" clearable>
            <el-option v-for="system in systemList" :key="system.id" :label="system.name" :value="system.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="filterForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="统计粒度">
          <el-select v-model="filterForm.granularity" placeholder="请选择">
            <el-option label="按天" value="day" />
            <el-option label="按周" value="week" />
            <el-option label="按月" value="month" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">
            <i class="fa fa-search"></i> 查询
          </el-button>
          <el-button @click="handleReset">
            <i class="fa fa-refresh"></i> 重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="stats-cards">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-content">
              <div class="stat-icon" style="background: linear-gradient(135deg, #409EFF 0%, #66b1ff 100%);">
                <i class="fa fa-bolt"></i>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.totalConsumption.toFixed(2) }}</div>
                <div class="stat-label">总能耗 (kWh)</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-content">
              <div class="stat-icon" style="background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);">
                <i class="fa fa-line-chart"></i>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.avgDailyConsumption.toFixed(2) }}</div>
                <div class="stat-label">日均能耗 (kWh)</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-content">
              <div class="stat-icon" style="background: linear-gradient(135deg, #e6a23c 0%, #f0c78a 100%);">
                <i class="fa fa-arrows-h"></i>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.peakValue.toFixed(2) }}</div>
                <div class="stat-label">峰值能耗 (kWh)</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-content">
              <div class="stat-icon" style="background: linear-gradient(135deg, #f56c6c 0%, #f89898 100%);">
                <i class="fa fa-tachometer"></i>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.avgLoadRate }}%</div>
                <div class="stat-label">平均负载率</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <div class="chart-section">
      <el-row :gutter="20">
        <el-col :span="16">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>能耗趋势分析</span>
                <el-radio-group v-model="chartType" size="small">
                  <el-radio-button label="line">折线图</el-radio-button>
                  <el-radio-button label="bar">柱状图</el-radio-button>
                </el-radio-group>
              </div>
            </template>
            <div ref="trendChartRef" class="chart-container"></div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card shadow="hover">
            <template #header>
              <span>系统能耗占比</span>
            </template>
            <div ref="pieChartRef" class="chart-container"></div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <div class="table-section">
      <el-card shadow="hover">
        <template #header>
          <div class="card-header">
            <span>能耗详情列表</span>
            <el-button type="primary" size="small" @click="handleExport">
              <i class="fa fa-download"></i> 导出报表
            </el-button>
          </div>
        </template>
        <el-table :data="energyData" stripe v-loading="loading">
          <el-table-column prop="date" label="日期" width="120" />
          <el-table-column prop="systemName" label="系统名称" width="180" />
          <el-table-column prop="consumption" label="能耗 (kWh)" width="120" align="right">
            <template #default="scope">
              <span>{{ scope.row.consumption.toFixed(2) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="peakPower" label="峰值功率 (kW)" width="130" align="right">
            <template #default="scope">
              <span>{{ scope.row.peakPower.toFixed(2) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="avgPower" label="平均功率 (kW)" width="130" align="right">
            <template #default="scope">
              <span>{{ scope.row.avgPower.toFixed(2) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="loadRate" label="负载率 (%)" width="100" align="center">
            <template #default="scope">
              <el-tag :type="getLoadRateType(scope.row.loadRate)">{{ scope.row.loadRate }}%</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="cost" label="预估费用 (元)" width="120" align="right">
            <template #default="scope">
              <span>¥{{ scope.row.cost.toFixed(2) }}</span>
            </template>
          </el-table-column>
        </el-table>
        <div class="pagination-section">
          <el-pagination
            v-model:current-page="pagination.currentPage"
            v-model:page-size="pagination.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="pagination.total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'

export default {
  name: 'SystemEnergyAnalysis',
  setup() {
    const loading = ref(false)
    const chartType = ref('line')
    const trendChartRef = ref(null)
    const pieChartRef = ref(null)
    let trendChart = null
    let pieChart = ref(false)

    const filterForm = reactive({
      systemId: '',
      dateRange: [],
      granularity: 'day'
    })

    const systemList = ref([
      { id: 'SYS001', name: '照明系统' },
      { id: 'SYS002', name: '空调系统' },
      { id: 'SYS003', name: '通风系统' },
      { id: 'SYS004', name: '给排水系统' },
      { id: 'SYS005', name: '电梯系统' },
      { id: 'SYS006', name: '安防系统' }
    ])

    const stats = reactive({
      totalConsumption: 125680.50,
      avgDailyConsumption: 4196.02,
      peakValue: 8562.30,
      avgLoadRate: 68
    })

    const energyData = ref([])

    const pagination = reactive({
      currentPage: 1,
      pageSize: 10,
      total: 0
    })

    const generateMockData = () => {
      const data = []
      const systems = ['照明系统', '空调系统', '通风系统', '给排水系统', '电梯系统', '安防系统']
      const startDate = new Date('2024-01-01')

      for (let i = 0; i < 30; i++) {
        const currentDate = new Date(startDate)
        currentDate.setDate(startDate.getDate() + i)
        const dateStr = currentDate.toISOString().split('T')[0]

        systems.forEach(system => {
          data.push({
            id: `${dateStr}-${system}`,
            date: dateStr,
            systemName: system,
            consumption: Math.random() * 500 + 100,
            peakPower: Math.random() * 200 + 50,
            avgPower: Math.random() * 100 + 30,
            loadRate: Math.floor(Math.random() * 40 + 50),
            cost: Math.random() * 500 + 100
          })
        })
      }

      return data
    }

    const initChart = () => {
      if (trendChartRef.value) {
        trendChart = echarts.init(trendChartRef.value)
        updateTrendChart()
      }

      if (pieChartRef.value) {
        pieChart = echarts.init(pieChartRef.value)
        updatePieChart()
      }

      window.addEventListener('resize', handleResize)
    }

    const handleResize = () => {
      trendChart && trendChart.resize()
      pieChart && pieChart.resize()
    }

    const updateTrendChart = () => {
      const dates = energyData.value
        .slice(0, 30)
        .map(item => item.date)
        .filter((date, index, self) => self.indexOf(date) === index)

      const seriesData = systemList.value.map(system => ({
        name: system.name,
        type: chartType.value,
        data: dates.map(date => {
          const items = energyData.value.filter(
            d => d.date === date && d.systemName === system.name
          )
          return items.length > 0 ? items[0].consumption : 0
        }),
        smooth: true,
        emphasis: { focus: 'series' }
      }))

      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'cross' }
        },
        legend: {
          data: systemList.value.map(s => s.name),
          bottom: 0
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '15%',
          top: '10%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: chartType.value === 'bar',
          data: dates
        },
        yAxis: {
          type: 'value',
          name: '能耗 (kWh)',
          axisLabel: { formatter: '{value}' }
        },
        series: seriesData
      }

      trendChart.setOption(option)
    }

    const updatePieChart = () => {
      const pieData = systemList.value.map(system => {
        const total = energyData.value
          .filter(d => d.systemName === system.name)
          .reduce((sum, d) => sum + d.consumption, 0)
        return { name: system.name, value: total }
      })

      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} kWh ({d}%)'
        },
        legend: {
          orient: 'vertical',
          right: '5%',
          top: 'center'
        },
        series: [{
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['35%', '50%'],
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
              fontSize: 16,
              fontWeight: 'bold'
            }
          },
          labelLine: { show: false },
          data: pieData
        }]
      }

      pieChart.setOption(option)
    }

    const handleQuery = () => {
      loading.value = true
      setTimeout(() => {
        energyData.value = generateMockData()
        pagination.total = energyData.value.length
        loading.value = false
        nextTick(() => {
          updateTrendChart()
          updatePieChart()
        })
      }, 500)
    }

    const handleReset = () => {
      filterForm.systemId = ''
      filterForm.dateRange = []
      filterForm.granularity = 'day'
      handleQuery()
    }

    const handleExport = () => {
      const csvContent = [
        ['日期', '系统名称', '能耗 (kWh)', '峰值功率 (kW)', '平均功率 (kW)', '负载率 (%)', '预估费用 (元)'],
        ...energyData.value.map(item => [
          item.date,
          item.systemName,
          item.consumption.toFixed(2),
          item.peakPower.toFixed(2),
          item.avgPower.toFixed(2),
          item.loadRate,
          item.cost.toFixed(2)
        ])
      ].map(row => row.join(',')).join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `系统能耗分析_${new Date().toISOString().split('T')[0]}.csv`
      link.click()
    }

    const getLoadRateType = (rate) => {
      if (rate >= 80) return 'success'
      if (rate >= 60) return 'warning'
      return 'danger'
    }

    const handleSizeChange = () => {
      handleQuery()
    }

    const handleCurrentChange = () => {
      handleQuery()
    }

    watch(chartType, () => {
      nextTick(() => {
        updateTrendChart()
      })
    })

    onMounted(() => {
      handleQuery()
      nextTick(() => {
        initChart()
      })
    })

    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
      trendChart && trendChart.dispose()
      pieChart && pieChart.dispose()
    })

    return {
      loading,
      chartType,
      trendChartRef,
      pieChartRef,
      filterForm,
      systemList,
      stats,
      energyData,
      pagination,
      handleQuery,
      handleReset,
      handleExport,
      getLoadRateType,
      handleSizeChange,
      handleCurrentChange
    }
  }
}
</script>

<style scoped>
.system-energy-analysis {
  padding: 0;
}

.filter-section {
  margin-bottom: 20px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 4px;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.stats-cards {
  margin-bottom: 20px;
}

.stat-card {
  border-radius: 8px;
}

.stat-content {
  display: flex;
  align-items: center;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
}

.stat-icon i {
  font-size: 24px;
  color: #fff;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

.chart-section {
  margin-bottom: 20px;
}

.chart-section .el-row {
  margin-bottom: 20px;
}

.chart-container {
  height: 350px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header span {
  font-weight: 500;
}

.table-section {
  margin-bottom: 20px;
}

.pagination-section {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
