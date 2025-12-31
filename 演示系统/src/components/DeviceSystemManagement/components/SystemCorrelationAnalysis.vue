<template>
  <div class="system-correlation-analysis">
    <div class="filter-section">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="分析系统">
          <el-select v-model="filterForm.systems" multiple placeholder="选择参与分析的系统" collapse-tags collapse-tags-tooltip>
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
        <el-form-item>
          <el-button type="primary" @click="handleAnalyze">
            <i class="fa fa-search"></i> 分析关联
          </el-button>
          <el-button @click="handleReset">
            <i class="fa fa-refresh"></i> 重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="analysis-results" v-if="analysisComplete">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>相关性热力图</span>
                <el-tag type="info">Pearson相关系数</el-tag>
              </div>
            </template>
            <div ref="heatmapRef" class="chart-container"></div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>能耗联动趋势</span>
                <el-radio-group v-model="trendView" size="small">
                  <el-radio-button label="overlay">叠加</el-radio-button>
                  <el-radio-button label="separate">分离</el-radio-button>
                </el-radio-group>
              </div>
            </template>
            <div ref="trendChartRef" class="chart-container"></div>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="12">
          <el-card shadow="hover">
            <template #header>
              <span>关联强度分布</span>
            </template>
            <div ref="distributionRef" class="chart-container"></div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>关键发现</span>
                <el-button type="text" size="small" @click="handleGenerateReport">
                  <i class="fa fa-file-text-o"></i> 生成报告
                </el-button>
              </div>
            </template>
            <div class="findings-list">
              <div v-for="(finding, index) in keyFindings" :key="index" class="finding-item">
                <div class="finding-icon" :class="finding.type">
                  <i :class="finding.icon"></i>
                </div>
                <div class="finding-content">
                  <div class="finding-title">{{ finding.title }}</div>
                  <div class="finding-desc">{{ finding.description }}</div>
                  <div class="finding-impact">
                    <el-tag :type="finding.impactType" size="small">影响度: {{ finding.impact }}</el-tag>
                  </div>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-card shadow="hover" style="margin-top: 20px;">
        <template #header>
          <div class="card-header">
            <span>详细相关性数据</span>
            <el-button type="primary" size="small" @click="handleExportData">
              <i class="fa fa-download"></i> 导出数据
            </el-button>
          </div>
        </template>
        <el-table :data="correlationData" stripe v-loading="loading">
          <el-table-column prop="system1" label="系统1" width="150" />
          <el-table-column prop="system2" label="系统2" width="150" />
          <el-table-column prop="coefficient" label="相关系数" width="120" align="center">
            <template #default="scope">
              <el-tag :type="getCoefficientType(scope.row.coefficient)">
                {{ scope.row.coefficient.toFixed(3) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="strength" label="关联强度" width="120" align="center">
            <template #default="scope">
              <el-tag :type="getStrengthType(scope.row.strength)">{{ scope.row.strength }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="lag" label="时间滞后" width="100" align="center">
            <template #default="scope">
              <span>{{ scope.row.lag }}小时</span>
            </template>
          </el-table-column>
          <el-table-column prop="description" label="关联描述" min-width="250" />
        </el-table>
      </el-card>
    </div>

    <div class="empty-state" v-else>
      <div class="empty-content">
        <i class="fa fa-connectdevelop"></i>
        <h3>系统关联分析</h3>
        <p>请选择参与分析的系统，时间范围后点击"分析关联"按钮开始分析</p>
        <div class="analysis-tips">
          <div class="tip-item">
            <i class="fa fa-lightbulb-o"></i>
            <span>支持多系统相关性分析</span>
          </div>
          <div class="tip-item">
            <i class="fa fa-clock-o"></i>
            <span>识别能耗联动模式</span>
          </div>
          <div class="tip-item">
            <i class="fa fa-exclamation-triangle"></i>
            <span>发现异常关联行为</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'

export default {
  name: 'SystemCorrelationAnalysis',
  setup() {
    const loading = ref(false)
    const analysisComplete = ref(false)
    const trendView = ref('overlay')
    const heatmapRef = ref(null)
    const trendChartRef = ref(null)
    const distributionRef = ref(null)
    let heatmapChart = null
    let trendChart = null
    let distributionChart = null

    const filterForm = reactive({
      systems: ['SYS001', 'SYS002', 'SYS003'],
      dateRange: []
    })

    const systemList = ref([
      { id: 'SYS001', name: '照明系统' },
      { id: 'SYS002', name: '空调系统' },
      { id: 'SYS003', name: '通风系统' },
      { id: 'SYS004', name: '给排水系统' },
      { id: 'SYS005', name: '电梯系统' },
      { id: 'SYS006', name: '安防系统' }
    ])

    const correlationData = ref([])
    const keyFindings = ref([])

    const generateMockCorrelationData = (systems) => {
      const data = []
      const descriptions = {
        strong: ['存在强正向联动关系', '能耗模式高度同步', '建议协调调度'],
        moderate: ['存在中度关联', '部分时段联动明显', '关注能耗峰值'],
        weak: ['关联性较弱', '相对独立运行', '可优化控制策略'],
        negative: ['存在负相关关系', '呈现互补能耗模式', '可用于负荷平衡']
      }

      for (let i = 0; i < systems.length; i++) {
        for (let j = i + 1; j < systems.length; j++) {
          const coef = Math.random() * 2 - 0.5
          let strength, descIndex
          if (coef > 0.7) { strength = '强相关'; descIndex = 0; }
          else if (coef > 0.4) { strength = '中等相关'; descIndex = 1; }
          else if (coef > 0.2) { strength = '弱相关'; descIndex = 2; }
          else if (coef > -0.2) { strength = '几乎无关'; descIndex = 2; }
          else { strength = '负相关'; descIndex = 3; }

          data.push({
            id: `${systems[i]}-${systems[j]}`,
            system1: systemList.value.find(s => s.id === systems[i])?.name || systems[i],
            system2: systemList.value.find(s => s.id === systems[j])?.name || systems[j],
            coefficient: coef,
            strength: strength,
            lag: Math.floor(Math.random() * 4),
            description: descriptions[descIndex][Math.floor(Math.random() * 3)]
          })
        }
      }
      return data.sort((a, b) => Math.abs(b.coefficient) - Math.abs(a.coefficient))
    }

    const generateKeyFindings = (correlations) => {
      const findings = []
      const strongPos = correlations.filter(c => c.coefficient > 0.7)
      const strongNeg = correlations.filter(c => c.coefficient < -0.3)
      const weak = correlations.filter(c => Math.abs(c.coefficient) < 0.2)

      if (strongPos.length > 0) {
        findings.push({
          type: 'warning',
          icon: 'fa fa-exclamation-circle',
          title: '强联动系统组',
          description: `${strongPos.length}组系统存在强正向关联，建议协调运行策略以优化整体能耗`,
          impact: '高',
          impactType: 'danger'
        })
      }

      if (strongNeg.length > 0) {
        findings.push({
          type: 'success',
          icon: 'fa fa-check-circle',
          title: '负荷互补优化',
          description: `${strongNeg.length}组系统呈现负相关，可利用互补特性进行负荷平衡`,
          impact: '中',
          impactType: 'warning'
        })
      }

      if (weak.length > 0) {
        findings.push({
          type: 'info',
          icon: 'fa fa-info-circle',
          title: '独立运行系统',
          description: `${weak.length}组系统关联性较弱，可考虑独立优化控制策略`,
          impact: '低',
          impactType: 'info'
        })
      }

      findings.push({
        type: 'success',
        icon: 'fa fa-lightbulb-o',
        title: '优化建议',
        description: '空调与通风系统存在较强关联，建议采用联动控制策略，预计可降低综合能耗5-10%',
        impact: '高',
        impactType: 'success'
      })

      return findings
    }

    const initCharts = () => {
      if (heatmapRef.value) {
        heatmapChart = echarts.init(heatmapRef.value)
        updateHeatmap()
      }

      if (trendChartRef.value) {
        trendChart = echarts.init(trendChartRef.value)
        updateTrendChart()
      }

      if (distributionRef.value) {
        distributionChart = echarts.init(distributionRef.value)
        updateDistribution()
      }

      window.addEventListener('resize', handleResize)
    }

    const handleResize = () => {
      heatmapChart && heatmapChart.resize()
      trendChart && trendChart.resize()
      distributionChart && distributionChart.resize()
    }

    const updateHeatmap = () => {
      const systems = filterForm.systems.map(id => {
        const system = systemList.value.find(s => s.id === id)
        return system ? system.name : id
      })

      const data = []
      for (let i = 0; i < systems.length; i++) {
        for (let j = 0; j < systems.length; j++) {
          if (i === j) {
            data.push([i, j, 1])
          } else {
            const coef = correlationData.value.find(c =>
              (c.system1 === systems[i] && c.system2 === systems[j]) ||
              (c.system1 === systems[j] && c.system2 === systems[i])
            )?.coefficient || Math.random() * 0.6 + 0.2
            data.push([i, j, coef])
          }
        }
      }

      const option = {
        tooltip: {
          position: 'top',
          formatter: (params) => {
            if (params.value[0] === params.value[1]) return '自身'
            return `${systems[params.value[0]]} - ${systems[params.value[1]]}<br/>相关系数: ${params.value[2].toFixed(3)}`
          }
        },
        grid: {
          left: '15%',
          right: '15%',
          top: '10%',
          bottom: '15%'
        },
        xAxis: {
          type: 'category',
          data: systems,
          splitArea: { show: true }
        },
        yAxis: {
          type: 'category',
          data: systems,
          splitArea: { show: true }
        },
        visualMap: {
          min: -0.5,
          max: 1,
          calculable: true,
          orient: 'horizontal',
          left: 'center',
          bottom: '0%',
          inRange: {
            color: ['#f5222d', '#faad14', '#f0f0f0', '#52c41a', '#389e0d']
          }
        },
        series: [{
          type: 'heatmap',
          data: data,
          label: { show: systems.length <= 4 },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }]
      }

      heatmapChart.setOption(option)
    }

    const updateTrendChart = () => {
      const dates = []
      for (let i = 0; i < 30; i++) {
        const date = new Date()
        date.setDate(date.getDate() - 29 + i)
        dates.push(date.toISOString().split('T')[0])
      }

      const series = filterForm.systems.map((systemId, index) => {
        const system = systemList.value.find(s => s.id === systemId)
        const baseValue = 100 + index * 50
        return {
          name: system?.name || systemId,
          type: 'line',
          data: dates.map(() => baseValue + Math.random() * 100),
          smooth: true,
          emphasis: { focus: 'series' },
          yAxisIndex: trendView.value === 'separate' ? index : 0
        }
      })

      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'cross' }
        },
        legend: {
          data: filterForm.systems.map(id => systemList.value.find(s => s.id === id)?.name),
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
          boundaryGap: false,
          data: dates
        },
        yAxis: trendView.value === 'separate' ? filterForm.systems.map((_, i) => ({
          type: 'value',
          name: systemList.value.find(s => s.id === filterForm.systems[i])?.name,
          position: i % 2 === 0 ? 'left' : 'right'
        })) : {
          type: 'value',
          name: '能耗 (kWh)'
        },
        series: series
      }

      trendChart.setOption(option, true)
    }

    const updateDistribution = () => {
      const positive = correlationData.value.filter(c => c.coefficient > 0).length
      const negative = correlationData.value.filter(c => c.coefficient < 0).length
      const strong = correlationData.value.filter(c => Math.abs(c.coefficient) > 0.6).length
      const moderate = correlationData.value.filter(c => Math.abs(c.coefficient) > 0.3 && Math.abs(c.coefficient) <= 0.6).length
      const weak = correlationData.value.filter(c => Math.abs(c.coefficient) <= 0.3).length

      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c}组 ({d}%)'
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
          label: { show: false },
          emphasis: {
            label: {
              show: true,
              fontSize: 16,
              fontWeight: 'bold'
            }
          },
          data: [
            { value: strong, name: '强相关', itemStyle: { color: '#389e0d' } },
            { value: moderate, name: '中等相关', itemStyle: { color: '#1890ff' } },
            { value: weak, name: '弱相关', itemStyle: { color: '#faad14' } },
            { value: negative, name: '负相关', itemStyle: { color: '#f5222d' } }
          ]
        }]
      }

      distributionChart.setOption(option)
    }

    const handleAnalyze = () => {
      if (filterForm.systems.length < 2) {
        return
      }

      loading.value = true
      analysisComplete.value = false

      setTimeout(() => {
        correlationData.value = generateMockCorrelationData(filterForm.systems)
        keyFindings.value = generateKeyFindings(correlationData.value)
        loading.value = false
        analysisComplete.value = true

        nextTick(() => {
          initCharts()
        })
      }, 800)
    }

    const handleReset = () => {
      filterForm.systems = ['SYS001', 'SYS002', 'SYS003']
      filterForm.dateRange = []
      analysisComplete.value = false
    }

    const handleExportData = () => {
      const csvContent = [
        ['系统1', '系统2', '相关系数', '关联强度', '时间滞后(小时)', '关联描述'],
        ...correlationData.value.map(item => [
          item.system1,
          item.system2,
          item.coefficient.toFixed(3),
          item.strength,
          item.lag,
          item.description
        ])
      ].map(row => row.join(',')).join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `系统关联分析_${new Date().toISOString().split('T')[0]}.csv`
      link.click()
    }

    const handleGenerateReport = () => {
      console.log('Generating report...')
    }

    const getCoefficientType = (coef) => {
      if (coef > 0.7) return 'success'
      if (coef > 0.4) return ''
      if (coef > 0.2) return 'info'
      if (coef > -0.2) return 'info'
      return 'warning'
    }

    const getStrengthType = (strength) => {
      if (strength === '强相关') return 'success'
      if (strength === '中等相关') return ''
      if (strength === '负相关') return 'warning'
      return 'info'
    }

    watch(trendView, () => {
      nextTick(() => {
        updateTrendChart()
      })
    })

    onMounted(() => {
      handleAnalyze()
    })

    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
      heatmapChart && heatmapChart.dispose()
      trendChart && trendChart.dispose()
      distributionChart && distributionChart.dispose()
    })

    return {
      loading,
      analysisComplete,
      trendView,
      filterForm,
      systemList,
      correlationData,
      keyFindings,
      heatmapRef,
      trendChartRef,
      distributionRef,
      handleAnalyze,
      handleReset,
      handleExportData,
      handleGenerateReport,
      getCoefficientType,
      getStrengthType
    }
  }
}
</script>

<style scoped>
.system-correlation-analysis {
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

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header span {
  font-weight: 500;
}

.chart-container {
  height: 350px;
}

.findings-list {
  max-height: 350px;
  overflow-y: auto;
}

.finding-item {
  display: flex;
  align-items: flex-start;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.finding-item:last-child {
  border-bottom: none;
}

.finding-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  flex-shrink: 0;
}

.finding-icon.warning {
  background: linear-gradient(135deg, #faad14 0%, #ffc53d 100%);
}

.finding-icon.success {
  background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
}

.finding-icon.info {
  background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
}

.finding-icon i {
  font-size: 18px;
  color: #fff;
}

.finding-content {
  flex: 1;
}

.finding-title {
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.finding-desc {
  font-size: 13px;
  color: #606266;
  margin-bottom: 8px;
  line-height: 1.5;
}

.finding-impact {
  display: flex;
  gap: 8px;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 500px;
  background: #fafafa;
  border-radius: 8px;
}

.empty-content {
  text-align: center;
  padding: 40px;
}

.empty-content > i {
  font-size: 64px;
  color: #409EFF;
  margin-bottom: 20px;
}

.empty-content h3 {
  font-size: 24px;
  color: #303133;
  margin-bottom: 12px;
}

.empty-content p {
  color: #909399;
  margin-bottom: 30px;
}

.analysis-tips {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-top: 30px;
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #606266;
}

.tip-item i {
  font-size: 20px;
  color: #409EFF;
}
</style>
