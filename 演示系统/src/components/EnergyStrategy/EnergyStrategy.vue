<template>
  <div class="energy-strategy-container">
    <el-card shadow="hover" class="page-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="page-title">
            <i class="fa fa-lightbulb-o"></i> 节能策略模拟系统
          </h1>
          <p class="page-subtitle">智能推荐 · 组合优化 · 实时仿真 · 效果评估</p>
        </div>
        <div class="header-right">
          <el-tag type="success" size="small">
            <i class="fa fa-check-circle"></i> 系统正常运行
          </el-tag>
        </div>
      </div>
    </el-card>

    <el-card shadow="hover" class="system-status-card">
      <div slot="header" class="card-header">
        <span><i class="fa fa-server"></i> 系统状态监控</span>
      </div>
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="6">
          <div class="status-item">
            <div class="status-icon success">
              <i class="fa fa-check-circle"></i>
            </div>
            <div class="status-info">
              <div class="status-value">运行正常</div>
              <div class="status-label">模拟引擎</div>
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <div class="status-item">
            <div class="status-icon primary">
              <i class="fa fa-database"></i>
            </div>
            <div class="status-info">
              <div class="status-value">{{ dataCount }}</div>
              <div class="status-label">策略模板数</div>
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <div class="status-item">
            <div class="status-icon warning">
              <i class="fa fa-history"></i>
            </div>
            <div class="status-info">
              <div class="status-value">{{ historyCount }}</div>
              <div class="status-label">历史记录数</div>
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <div class="status-item">
            <div class="status-icon info">
              <i class="fa fa-calendar"></i>
            </div>
            <div class="status-info">
              <div class="status-value">{{ lastUpdate }}</div>
              <div class="status-label">最后更新</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <el-card shadow="hover" class="navigation-card">
      <el-tabs v-model="activeTab" type="card" @tab-click="handleTabClick">
        <el-tab-pane label="策略推荐" name="recommendation">
          <span slot="label">
            <i class="fa fa-lightbulb-o"></i> 策略推荐
          </span>
          <StrategyRecommendation />
        </el-tab-pane>
        <el-tab-pane label="模板管理" name="template">
          <span slot="label">
            <i class="fa fa-folder-open"></i> 模板管理
          </span>
          <StrategyTemplate />
        </el-tab-pane>
        <el-tab-pane label="策略组合" name="combination">
          <span slot="label">
            <i class="fa fa-cubes"></i> 策略组合
          </span>
          <MultiStrategyCombination @strategy-change="handleStrategyChange" />
        </el-tab-pane>
        <el-tab-pane label="实时模拟" name="simulation">
          <span slot="label">
            <i class="fa fa-clock-o"></i> 实时模拟
          </span>
          <RealTimeSimulation />
        </el-tab-pane>
        <el-tab-pane label="历史记录" name="history">
          <span slot="label">
            <i class="fa fa-history"></i> 历史记录
          </span>
          <StrategyHistory />
        </el-tab-pane>
        <el-tab-pane label="快速模拟" name="quick">
          <span slot="label">
            <i class="fa fa-rocket"></i> 快速模拟
          </span>
          <div class="quick-simulation-container">
            <el-row :gutter="20">
              <el-col :xs="24" :lg="16">
                <el-card shadow="hover">
                  <div slot="header" class="card-header">
                    <span><i class="fa fa-sliders"></i> 快速模拟设置</span>
                  </div>
                  <el-form :model="quickForm" label-width="100px" size="small">
                    <el-row :gutter="20">
                      <el-col :xs="24" :sm="12">
                        <el-form-item label="目标站点">
                          <el-select v-model="quickForm.station" placeholder="请选择站点" style="width: 100%;">
                            <el-option v-for="station in stationOptions" :key="station.value" :label="station.label" :value="station.value" />
                          </el-select>
                        </el-form-item>
                      </el-col>
                      <el-col :xs="24" :sm="12">
                        <el-form-item label="模拟周期">
                          <el-select v-model="quickForm.period" placeholder="请选择模拟周期" style="width: 100%;">
                            <el-option label="日模拟" value="day" />
                            <el-option label="周模拟" value="week" />
                            <el-option label="月模拟" value="month" />
                            <el-option label="年模拟" value="year" />
                          </el-select>
                        </el-form-item>
                      </el-col>
                    </el-row>
                    <el-form-item label="选择策略">
                      <el-checkbox-group v-model="quickForm.strategies">
                        <el-checkbox label="lighting">
                          <i class="fa fa-lightbulb-o"></i> 照明优化
                        </el-checkbox>
                        <el-checkbox label="airConditioning">
                          <i class="fa fa-snowflake-o"></i> 空调改造
                        </el-checkbox>
                        <el-checkbox label="ventilation">
                          <i class="fa fa-wind"></i> 通风优化
                        </el-checkbox>
                        <el-checkbox label="renewableEnergy">
                          <i class="fa fa-solar-panel"></i> 光伏系统
                        </el-checkbox>
                        <el-checkbox label="energyStorage">
                          <i class="fa fa-battery-half"></i> 储能系统
                        </el-checkbox>
                        <el-checkbox label="smartControl">
                          <i class="fa fa-microchip"></i> 智能控制
                        </el-checkbox>
                      </el-checkbox-group>
                    </el-form-item>
                    <el-form-item>
                      <el-button type="primary" @click="handleQuickSimulate" :loading="quickSimulating">
                        <i class="fa fa-play"></i> 开始模拟
                      </el-button>
                      <el-button @click="handleQuickReset">
                        <i class="fa fa-refresh"></i> 重置
                      </el-button>
                    </el-form-item>
                  </el-form>
                </el-card>
              </el-col>
              <el-col :xs="24" :lg="8">
                <el-card shadow="hover" class="quick-stats-card">
                  <div slot="header" class="card-header">
                    <span><i class="fa fa-chart-bar"></i> 模拟统计</span>
                  </div>
                  <div class="stats-content">
                    <div class="stat-item">
                      <div class="stat-icon lighting">
                        <i class="fa fa-lightbulb-o"></i>
                      </div>
                      <div class="stat-info">
                        <div class="stat-value">{{ quickStats.lightingSavings }}%</div>
                        <div class="stat-label">照明节能率</div>
                      </div>
                    </div>
                    <div class="stat-item">
                      <div class="stat-icon airConditioning">
                        <i class="fa fa-snowflake-o"></i>
                      </div>
                      <div class="stat-info">
                        <div class="stat-value">{{ quickStats.acSavings }}%</div>
                        <div class="stat-label">空调节能率</div>
                      </div>
                    </div>
                    <div class="stat-item">
                      <div class="stat-icon total">
                        <i class="fa fa-bolt"></i>
                      </div>
                      <div class="stat-info">
                        <div class="stat-value">{{ quickStats.totalSavings }}%</div>
                        <div class="stat-label">总节能率</div>
                      </div>
                    </div>
                    <div class="stat-item">
                      <div class="stat-icon investment">
                        <i class="fa fa-yen"></i>
                      </div>
                      <div class="stat-info">
                        <div class="stat-value">¥{{ quickStats.investment }}</div>
                        <div class="stat-label">预估投资(万)</div>
                      </div>
                    </div>
                  </div>
                </el-card>
              </el-col>
            </el-row>
            <el-row v-if="quickResults" :gutter="20" style="margin-top: 20px;">
              <el-col :xs="24">
                <el-card shadow="hover">
                  <div slot="header" class="card-header">
                    <span><i class="fa fa-chart-line"></i> 模拟结果</span>
                    <el-button type="primary" size="small" @click="handleSaveToHistory">
                      <i class="fa fa-save"></i> 保存到历史
                    </el-button>
                  </div>
                  <el-row :gutter="20">
                    <el-col :xs="24" :sm="12" :md="6">
                      <div class="result-card highlight">
                        <div class="result-icon">
                          <i class="fa fa-piggy-bank"></i>
                        </div>
                        <div class="result-value">{{ quickResults.savings }}万</div>
                        <div class="result-label">年节约能耗</div>
                      </div>
                    </el-col>
                    <el-col :xs="24" :sm="12" :md="6">
                      <div class="result-card success">
                        <div class="result-icon">
                          <i class="fa fa-percentage"></i>
                        </div>
                        <div class="result-value">{{ quickResults.savingsRate }}%</div>
                        <div class="result-label">节能率</div>
                      </div>
                    </el-col>
                    <el-col :xs="24" :sm="12" :md="6">
                      <div class="result-card info">
                        <div class="result-icon">
                          <i class="fa fa-clock"></i>
                        </div>
                        <div class="result-value">{{ quickResults.paybackPeriod }}年</div>
                        <div class="result-label">投资回收期</div>
                      </div>
                    </el-col>
                    <el-col :xs="24" :sm="12" :md="6">
                      <div class="result-card warning">
                        <div class="result-icon">
                          <i class="fa fa-leaf"></i>
                        </div>
                        <div class="result-value">{{ quickResults.co2Reduction }}吨</div>
                        <div class="result-label">年减排CO₂</div>
                      </div>
                    </el-col>
                  </el-row>
                  <div class="chart-section">
                    <div ref="quickChart" class="chart-container"></div>
                  </div>
                </el-card>
              </el-col>
            </el-row>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import StrategyRecommendation from './components/StrategyRecommendation.vue'
import StrategyTemplate from './components/StrategyTemplate.vue'
import MultiStrategyCombination from './components/MultiStrategyCombination.vue'
import RealTimeSimulation from './components/RealTimeSimulation.vue'
import StrategyHistory from './components/StrategyHistory.vue'

export default {
  name: 'EnergyStrategy',
  components: {
    StrategyRecommendation,
    StrategyTemplate,
    MultiStrategyCombination,
    RealTimeSimulation,
    StrategyHistory
  },
  data() {
    return {
      activeTab: 'recommendation',
      quickForm: {
        station: 'BJ',
        period: 'year',
        strategies: ['lighting', 'airConditioning', 'smartControl']
      },
      quickSimulating: false,
      quickResults: null,
      quickStats: {
        lightingSavings: 5.2,
        acSavings: 8.5,
        totalSavings: 15.3,
        investment: 580
      },
      stationOptions: [
        { label: '北京南站', value: 'BJ' },
        { label: '上海虹桥站', value: 'SH' },
        { label: '广州南站', value: 'GZ' },
        { label: '深圳北站', value: 'SZ' },
        { label: '杭州东站', value: 'HZ' },
        { label: '成都东站', value: 'CD' }
      ],
      dataCount: 48,
      historyCount: 156,
      lastUpdate: '2024-12-26',
      quickChart: null,
      resizeHandler: null
    }
  },
  beforeUnmount() {
    if (this.quickChart) {
      this.quickChart.dispose();
      this.quickChart = null;
    }
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
      this.resizeHandler = null;
    }
  },
  beforeDestroy() {
    if (this.quickChart) {
      this.quickChart.dispose();
      this.quickChart = null;
    }
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
      this.resizeHandler = null;
    }
  },
  mounted() {
    this.initQuickChart()
  },
  beforeDestroy() {
    if (this.quickChart) {
      this.quickChart.dispose()
    }
  },
  methods: {
    handleTabClick(tab) {
      if (tab.name === 'simulation') {
        this.$nextTick(() => {
          this.$emit('tab-change', 'simulation')
        })
      }
    },
    handleStrategyChange(strategies) {
      console.log('策略组合变化:', strategies)
    },
    handleQuickSimulate() {
      this.quickSimulating = true
      setTimeout(() => {
        const selectedCount = this.quickForm.strategies.length
        const baseSavings = 12 + (selectedCount - 1) * 3
        const savingsVariation = Math.random() * 5
        const totalSavings = (baseSavings + savingsVariation).toFixed(1)
        const investment = selectedCount * 150 + Math.floor(Math.random() * 100)

        this.quickResults = {
          savings: (120 + selectedCount * 40).toFixed(0),
          savingsRate: totalSavings,
          paybackPeriod: (2 + Math.random() * 2).toFixed(1),
          co2Reduction: (80 + selectedCount * 25).toFixed(0)
        }

        this.quickStats = {
          lightingSavings: (4 + Math.random() * 2).toFixed(1),
          acSavings: (7 + Math.random() * 3).toFixed(1),
          totalSavings: parseFloat(totalSavings),
          investment: investment
        }

        this.updateQuickChart()
        this.quickSimulating = false
        this.$message.success('模拟完成！')
      }, 1500)
    },
    handleQuickReset() {
      this.quickForm = {
        station: 'BJ',
        period: 'year',
        strategies: ['lighting', 'airConditioning', 'smartControl']
      }
      this.quickResults = null
      this.quickStats = {
        lightingSavings: 5.2,
        acSavings: 8.5,
        totalSavings: 15.3,
        investment: 580
      }
      this.$message.info('已重置')
    },
    handleSaveToHistory() {
      if (!this.quickResults) {
        this.$message.warning('请先完成模拟')
        return
      }
      this.$message.success('已保存到历史记录')
      this.historyCount++
    },
    initQuickChart() {
      if (this.$refs.quickChart) {
        this.quickChart = echarts.init(this.$refs.quickChart)
        const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
        const baseData = [320, 350, 380, 420, 480, 520, 560, 550, 490, 440, 380, 340]
        const optimizedData = baseData.map(v => Math.round(v * (1 - 0.15 + Math.random() * 0.05)))

        const option = {
          tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'cross' }
          },
          legend: {
            data: ['优化前能耗', '优化后能耗'],
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
            data: months,
            axisLine: { lineStyle: { color: '#dcdfe6' } },
            axisLabel: { color: '#606266' }
          },
          yAxis: {
            type: 'value',
            name: 'kWh',
            axisLine: { lineStyle: { color: '#dcdfe6' } },
            axisLabel: { color: '#606266' },
            splitLine: { lineStyle: { color: '#ebeef5' } }
          },
          series: [
            {
              name: '优化前能耗',
              type: 'bar',
              data: baseData,
              itemStyle: { color: '#f56c6c' },
              barWidth: '30%'
            },
            {
              name: '优化后能耗',
              type: 'bar',
              data: optimizedData,
              itemStyle: { color: '#67c23a' },
              barWidth: '30%'
            }
          ]
        }

        this.quickChart.setOption(option)
        this.resizeHandler = () => this.quickChart.resize()
        window.addEventListener('resize', this.resizeHandler)
      }
    },
    updateQuickChart() {
      if (this.quickChart) {
        const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
        const baseData = [320, 350, 380, 420, 480, 520, 560, 550, 490, 440, 380, 340]
        const savingsRate = parseFloat(this.quickResults.savingsRate) / 100
        const optimizedData = baseData.map(v => Math.round(v * (1 - savingsRate)))

        this.quickChart.setOption({
          series: [
            { data: baseData },
            { data: optimizedData }
          ]
        })
      }
    }
  }
}
</script>

<style scoped>
.energy-strategy-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 20px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 28px;
  color: #303133;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
}

.page-title i {
  color: #409EFF;
  margin-right: 12px;
}

.page-subtitle {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.navigation-card {
  margin-bottom: 20px;
}

.navigation-card >>> .el-tabs__item {
  font-size: 14px;
}

.navigation-card >>> .el-tabs__item i {
  margin-right: 5px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header span {
  display: flex;
  align-items: center;
  font-weight: 500;
}

.card-header span i {
  margin-right: 8px;
  color: #409EFF;
}

.quick-simulation-container {
  padding: 20px 0;
}

.quick-stats-card {
  height: 100%;
}

.stats-content {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.stat-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background: #fafbfc;
  border-radius: 8px;
}

.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  font-size: 20px;
  color: #fff;
}

.stat-icon.lighting { background: linear-gradient(135deg, #f6d365, #fda085); }
.stat-icon.airConditioning { background: linear-gradient(135deg, #a18cd1, #fbc2eb); }
.stat-icon.total { background: linear-gradient(135deg, #84fab0, #8fd3f4); }
.stat-icon.investment { background: linear-gradient(135deg, #ffecd2, #fcb69f); }

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.stat-label {
  font-size: 12px;
  color: #909399;
}

.result-card {
  padding: 20px;
  border-radius: 12px;
  text-align: center;
  margin-bottom: 20px;
}

.result-card.highlight {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
}

.result-card.success {
  background: linear-gradient(135deg, #11998e, #38ef7d);
  color: #fff;
}

.result-card.info {
  background: linear-gradient(135deg, #2193b0, #6dd5ed);
  color: #fff;
}

.result-card.warning {
  background: linear-gradient(135deg, #f5af19, #f12711);
  color: #fff;
}

.result-icon {
  font-size: 28px;
  margin-bottom: 10px;
}

.result-value {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 5px;
}

.result-label {
  font-size: 12px;
  opacity: 0.9;
}

.chart-section {
  margin-top: 20px;
}

.chart-container {
  height: 350px;
}

.system-status-card {
  margin: 0 0 20px 0;
}

.status-item {
  display: flex;
  align-items: center;
  padding: 15px;
  background: #fafbfc;
  border-radius: 10px;
  margin-bottom: 15px;
}

.status-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  font-size: 22px;
  color: #fff;
}

.status-icon.success { background: linear-gradient(135deg, #11998e, #38ef7d); }
.status-icon.primary { background: linear-gradient(135deg, #667eea, #764ba2); }
.status-icon.warning { background: linear-gradient(135deg, #f5af19, #f12711); }
.status-icon.info { background: linear-gradient(135deg, #2193b0, #6dd5ed); }

.status-info {
  flex: 1;
}

.status-value {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.status-label {
  font-size: 12px;
  color: #909399;
}

@media (max-width: 768px) {
  .energy-strategy-container {
    padding: 10px;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .page-title {
    font-size: 24px;
  }

  .quick-simulation-container {
    padding: 10px 0;
  }
}
</style>
