<template>
  <div class="simulation-results-container">
    <!-- 节能效果概览 -->
    <el-card shadow="hover" class="results-card">
      <div slot="header" class="card-header">
        <h3 class="card-title">
          <i class="fa fa-bar-chart"></i> 节能效果概览
        </h3>
      </div>
      <el-row :gutter="20" class="results-metrics">
        <el-col :xs="24" :sm="12" :md="6">
          <div class="metric-item">
            <h4 class="metric-name">预计节能量</h4>
            <div class="metric-value">
              <span class="value-number">{{ simulationResults.expectedSavings }}</span>
              <span class="value-unit">kWh</span>
            </div>
            <div class="metric-desc">策略实施后的预计节能量</div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <div class="metric-item">
            <h4 class="metric-name">节能率</h4>
            <div class="metric-value">
              <span class="value-number">{{ simulationResults.savingsRate }}</span>
              <span class="value-unit">%</span>
            </div>
            <div class="metric-desc">相比基准能耗的节能比例</div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <div class="metric-item">
            <h4 class="metric-name">预计收益</h4>
            <div class="metric-value">
              <span class="value-number">¥{{ simulationResults.expectedRevenue }}</span>
            </div>
            <div class="metric-desc">按当前电价计算的年收益</div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <div class="metric-item">
            <h4 class="metric-name">投资回收期</h4>
            <div class="metric-value">
              <span class="value-number">{{ simulationResults.paybackPeriod }}</span>
              <span class="value-unit">年</span>
            </div>
            <div class="metric-desc">策略实施的投资回收周期</div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 模拟结果图表 -->
    <el-row :gutter="20">
      <el-col :xs="24" :md="12">
        <el-card shadow="hover" class="chart-card">
          <div slot="header" class="card-header">
            <h3 class="card-title">能耗对比分析</h3>
          </div>
          <div class="chart-container">
            <div ref="energyComparisonChart" class="chart"></div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :md="12">
        <el-card shadow="hover" class="chart-card">
          <div slot="header" class="card-header">
            <h3 class="card-title">策略节能贡献分布</h3>
          </div>
          <div class="chart-container">
            <div ref="strategyContributionChart" class="chart"></div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 策略效果详情 -->
    <el-card shadow="hover" class="details-card">
      <div slot="header" class="card-header">
        <h3 class="card-title">策略效果详情</h3>
      </div>
      <el-table :data="strategyDetails" stripe style="width: 100%">
        <el-table-column prop="name" label="策略名称" width="200" />
        <el-table-column prop="savings" label="节能量(kWh)" width="150" />
        <el-table-column prop="savingsRate" label="节能率(%)" width="120">
          <template slot-scope="scope">
            <el-progress :percentage="scope.row.savingsRate" :stroke-width="6" />
          </template>
        </el-table-column>
        <el-table-column prop="investment" label="投资成本(元)" width="150" />
        <el-table-column prop="annualRevenue" label="年收益(元)" width="150" />
        <el-table-column prop="paybackPeriod" label="回收期(年)" width="120" />
        <el-table-column prop="description" label="策略描述" />
      </el-table>
    </el-card>

    <!-- 实施建议 -->
    <el-card shadow="hover" class="recommendation-card">
      <div slot="header" class="card-header">
        <h3 class="card-title">
          <i class="fa fa-lightbulb-o"></i> 实施建议
        </h3>
      </div>
      <div class="recommendation-content">
        <el-timeline>
          <el-timeline-item
            v-for="(item, index) in recommendations"
            :key="index"
            :timestamp="item.timestamp"
            placement="top"
          >
            <el-card shadow="hover">
              <h4 class="recommendation-title">{{ item.title }}</h4>
              <p class="recommendation-desc">{{ item.content }}</p>
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </div>
    </el-card>
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'SimulationResults',
  props: {
    simulationResults: {
      type: Object,
      required: true,
      default: () => ({})
    },
    strategyDetails: {
      type: Array,
      required: true,
      default: () => []
    },
    recommendations: {
      type: Array,
      required: true,
      default: () => []
    },
    baseEnergyConsumption: {
      type: Number,
      required: true,
      default: 0
    }
  },
  data() {
    return {
      energyComparisonChart: null,
      strategyContributionChart: null
    }
  },
  watch: {
    simulationResults: {
      handler() {
        if (this.simulationResults && this.strategyDetails.length > 0) {
          this.$nextTick(() => {
            this.drawCharts()
          })
        }
      },
      deep: true
    }
  },
  beforeDestroy() {
    this.disposeCharts()
    window.removeEventListener('resize', this.handleResize)
  },
  mounted() {
    window.addEventListener('resize', this.handleResize)
  },
  methods: {
    drawCharts() {
      this.disposeCharts()
      if (this.strategyDetails.length > 0 && this.baseEnergyConsumption > 0) {
        this.drawEnergyComparisonChart()
        this.drawStrategyContributionChart()
      }
    },
    disposeCharts() {
      if (this.energyComparisonChart) {
        this.energyComparisonChart.dispose()
        this.energyComparisonChart = null
      }
      if (this.strategyContributionChart) {
        this.strategyContributionChart.dispose()
        this.strategyContributionChart = null
      }
    },
    drawEnergyComparisonChart() {
      const chartDom = this.$refs.energyComparisonChart
      if (!chartDom) return

      this.energyComparisonChart = echarts.init(chartDom)

      const totalSavings = this.strategyDetails.reduce((sum, item) => sum + item.savings, 0)

      const option = {
        title: {
          text: '能耗对比',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          formatter: function(params) {
            return params[0].name + ': ' + params[0].value.toLocaleString() + ' kWh'
          }
        },
        legend: {
          data: ['基准能耗', '实施后能耗'],
          bottom: 10
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '15%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: ['能耗对比']
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            formatter: '{value} kWh'
          }
        },
        series: [
          {
            name: '基准能耗',
            type: 'bar',
            data: [this.baseEnergyConsumption],
            itemStyle: {
              color: '#409EFF'
            }
          },
          {
            name: '实施后能耗',
            type: 'bar',
            data: [this.baseEnergyConsumption - totalSavings],
            itemStyle: {
              color: '#67C23A'
            }
          }
        ]
      }

      this.energyComparisonChart.setOption(option)

      window.addEventListener('resize', this.handleResize)
    },
    drawStrategyContributionChart() {
      const chartDom = this.$refs.strategyContributionChart
      if (!chartDom) return

      this.strategyContributionChart = echarts.init(chartDom)

      const option = {
        title: {
          text: '各策略节能贡献分布',
          left: 'center'
        },
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} kWh ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          data: this.strategyDetails.map(item => item.name)
        },
        series: [
          {
            name: '节能贡献',
            type: 'pie',
            radius: '50%',
            data: this.strategyDetails.map(item => ({
              value: item.savings,
              name: item.name
            })),
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

      this.strategyContributionChart.setOption(option)

      window.addEventListener('resize', this.handleResize)
    },
    handleResize() {
      if (this.energyComparisonChart) {
        this.energyComparisonChart.resize()
      }
      if (this.strategyContributionChart) {
        this.strategyContributionChart.resize()
      }
    }
  }
}
</script>

<style scoped>
.simulation-results-container {
  width: 100%;
}

.results-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 18px;
  color: #303133;
  margin: 0;
  display: flex;
  align-items: center;
}

.card-title i {
  margin-right: 8px;
  color: #409EFF;
}

.results-metrics {
  padding: 10px 0;
}

.metric-item {
  text-align: center;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 10px;
}

.metric-name {
  font-size: 14px;
  color: #606266;
  margin: 0 0 10px 0;
}

.metric-value {
  display: flex;
  align-items: baseline;
  justify-content: center;
  margin-bottom: 5px;
}

.value-number {
  font-size: 28px;
  font-weight: bold;
  color: #409EFF;
}

.value-unit {
  font-size: 14px;
  color: #909399;
  margin-left: 5px;
}

.metric-desc {
  font-size: 12px;
  color: #909399;
}

.chart-card {
  margin-bottom: 20px;
}

.chart-container {
  height: 300px;
}

.chart {
  width: 100%;
  height: 100%;
}

.details-card {
  margin-bottom: 20px;
}

.recommendation-card {
  margin-bottom: 20px;
}

.recommendation-content {
  padding: 10px 0;
}

.recommendation-title {
  font-size: 16px;
  color: #303133;
  margin: 0 0 10px 0;
}

.recommendation-desc {
  font-size: 14px;
  color: #606266;
  margin: 0;
  line-height: 1.6;
}
</style>
