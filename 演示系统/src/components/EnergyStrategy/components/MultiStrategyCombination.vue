<template>
  <div class="multi-strategy-container">
    <el-card shadow="hover" class="combination-card">
      <div slot="header" class="card-header">
        <h3 class="card-title">
          <i class="fa fa-cubes"></i> 多策略组合模拟
        </h3>
        <div class="header-actions">
          <el-button type="success" size="small" @click="handleOptimize">
            <i class="fa fa-magic"></i> 智能优化组合
          </el-button>
          <el-button type="primary" size="small" @click="handleCompare">
            <i class="fa fa-balance-scale"></i> 对比分析
          </el-button>
        </div>
      </div>
      
      <!-- 策略拖拽排序区域 -->
      <div class="strategy-sort-area">
        <div class="sort-header">
          <span class="sort-title">
            <i class="fa fa-list-ol"></i> 已选策略（拖拽调整优先级）
          </span>
          <span class="strategy-count">已选 {{ selectedStrategies.length }} 个策略</span>
        </div>
        <draggable
          v-model="selectedStrategies"
          item-key="id"
          :animation="300"
          ghost-class="ghost"
          handle=".drag-handle"
          @end="onDragEnd"
        >
          <template #item="{ element, index }">
            <div class="strategy-item">
              <div class="drag-handle">
                <i class="fa fa-sort"></i>
              </div>
              <div class="strategy-icon" :style="{ backgroundColor: getStrategyColor(element.type) }">
                <i :class="['fa', getStrategyIcon(element.type)]"></i>
              </div>
              <div class="strategy-info">
                <div class="strategy-name">{{ element.name }}</div>
                <div class="strategy-priority">
                  <el-tag size="mini" :type="getPriorityType(index + 1)">
                    优先级 {{ index + 1 }}
                  </el-tag>
                  <span class="strategy-savings">
                    预计节能 {{ element.savings }}%
                  </span>
                </div>
              </div>
              <div class="strategy-effect">
                <el-progress
                  type="circle"
                  :percentage="element.savings"
                  :width="50"
                  :stroke-width="4"
                  :color="getProgressColor(element.savings)"
                />
              </div>
              <div class="strategy-actions">
                <el-button type="text" size="mini" @click="handleConfigure(element)">
                  <i class="fa fa-cog"></i>
                </el-button>
                <el-button type="text" size="mini" danger @click="handleRemove(element)">
                  <i class="fa fa-times"></i>
                </el-button>
              </div>
            </div>
          </template>
        </draggable>
      </div>
      
      <!-- 策略选择区域 -->
      <div class="strategy-select-area">
        <div class="select-header">
          <span class="select-title">
            <i class="fa fa-plus-circle"></i> 添加策略
          </span>
        </div>
        <div class="available-strategies">
          <el-row :gutter="15">
            <el-col
              v-for="strategy in availableStrategies"
              :key="strategy.id"
              :xs="24"
              :sm="12"
              :md="8"
            >
              <div
                class="strategy-card"
                :class="{ disabled: isStrategySelected(strategy.id) }"
                @click="!isStrategySelected(strategy.id) && handleAdd(strategy)"
              >
                <div class="card-icon" :style="{ backgroundColor: strategy.color }">
                  <i :class="['fa', strategy.icon]"></i>
                </div>
                <div class="card-content">
                  <h4 class="card-name">{{ strategy.name }}</h4>
                  <p class="card-desc">{{ strategy.description }}</p>
                  <div class="card-stats">
                    <span class="stat-item">
                      <i class="fa fa-leaf"></i> 节能 {{ strategy.savings }}%
                    </span>
                    <span class="stat-item">
                      <i class="fa fa-money"></i> 投资 {{ strategy.investment }}万
                    </span>
                  </div>
                </div>
                <div v-if="isStrategySelected(strategy.id)" class="selected-badge">
                  <i class="fa fa-check"></i>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>
      
      <!-- 组合效果分析 -->
      <div v-if="selectedStrategies.length > 0" class="combination-analysis">
        <h4 class="analysis-title">
          <i class="fa fa-pie-chart"></i> 组合效果分析
        </h4>
        <el-row :gutter="20">
          <el-col :xs="24" :md="16">
            <div class="chart-container">
              <div ref="combinationChart" class="echart-container"></div>
            </div>
          </el-col>
          <el-col :xs="24" :md="8">
            <div class="summary-stats">
              <div class="stat-card">
                <div class="stat-icon" style="background: linear-gradient(135deg, #67C23A, #95DE64)">
                  <i class="fa fa-leaf"></i>
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ totalSavings.toFixed(1) }}%</div>
                  <div class="stat-label">总节能率</div>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon" style="background: linear-gradient(135deg, #409EFF, #66B1FF)">
                  <i class="fa fa-plug"></i>
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ totalSavingskWh.toLocaleString() }}</div>
                  <div class="stat-label">年节能量(kWh)</div>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon" style="background: linear-gradient(135deg, #E6A23C, #F7C94B)">
                  <i class="fa fa-yen"></i>
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ totalSavingsRMB.toLocaleString() }}</div>
                  <div class="stat-label">年节省费用(元)</div>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon" style="background: linear-gradient(135deg, #F5222D, #FF7875)">
                  <i class="fa fa-clock-o"></i>
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ avgPaybackPeriod.toFixed(1) }}</div>
                  <div class="stat-label">平均回收期(年)</div>
                </div>
              </div>
            </div>
            
            <div class="combination-warning" v-if="hasPotentialConflict">
              <i class="fa fa-exclamation-triangle"></i>
              <span>策略组合可能存在冲突，建议调整优先级</span>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-card>
    
    <!-- 策略配置对话框 -->
    <el-dialog
      title="策略参数配置"
      :visible.sync="configDialogVisible"
      width="60%"
      top="5vh"
    >
      <div v-if="currentStrategy" class="config-content">
        <h4 class="config-title">
          <i :class="['fa', getStrategyIcon(currentStrategy.type)]"></i>
          {{ currentStrategy.name }} - 参数配置
        </h4>
        
        <el-form :model="currentStrategyConfig" label-position="left" label-width="140px">
          <template v-if="currentStrategy.type === 'lighting'">
            <el-row :gutter="20">
              <el-col :xs="24" :md="12">
                <el-form-item label="灯具改造比例">
                  <el-slider
                    v-model="currentStrategyConfig.ledRatio"
                    :min="0"
                    :max="100"
                    :format-tooltip="val => val + '%'"
                  />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :md="12">
                <el-form-item label="智能控制覆盖率">
                  <el-slider
                    v-model="currentStrategyConfig.controlCoverage"
                    :min="0"
                    :max="100"
                    :format-tooltip="val => val + '%'"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </template>
          
          <template v-if="currentStrategy.type === 'airConditioning'">
            <el-row :gutter="20">
              <el-col :xs="24" :md="8">
                <el-form-item label="目标温度(°C)">
                  <el-input-number
                    v-model="currentStrategyConfig.targetTemp"
                    :min="20"
                    :max="26"
                    :step="0.5"
                  />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :md="8">
                <el-form-item label="变频设备比例">
                  <el-slider
                    v-model="currentStrategyConfig.vfdRatio"
                    :min="0"
                    :max="100"
                    :format-tooltip="val => val + '%'"
                  />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :md="8">
                <el-form-item label="夜间模式">
                  <el-switch v-model="currentStrategyConfig.nightMode" />
                </el-form-item>
              </el-col>
            </el-row>
          </template>
          
          <template v-if="currentStrategy.type === 'ventilation'">
            <el-row :gutter="20">
              <el-col :xs="24" :md="8">
                <el-form-item label="CO₂上限(ppm)">
                  <el-input-number
                    v-model="currentStrategyConfig.co2Limit"
                    :min="600"
                    :max="1500"
                    :step="50"
                  />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :md="8">
                <el-form-item label="变频控制">
                  <el-switch v-model="currentStrategyConfig.vfdControl" />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :md="8">
                <el-form-item label="热回收">
                  <el-switch v-model="currentStrategyConfig.heatRecovery" />
                </el-form-item>
              </el-col>
            </el-row>
          </template>
          
          <template v-if="currentStrategy.type === 'renewableEnergy'">
            <el-row :gutter="20">
              <el-col :xs="24" :md="8">
                <el-form-item label="光伏面积(m²)">
                  <el-input-number
                    v-model="currentStrategyConfig.solarArea"
                    :min="0"
                    :max="50000"
                    :step="100"
                  />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :md="8">
                <el-form-item label="储能配置(kWh)">
                  <el-input-number
                    v-model="currentStrategyConfig.storage"
                    :min="0"
                    :max="10000"
                    :step="100"
                  />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :md="8">
                <el-form-item label="最大并网功率(kW)">
                  <el-input-number
                    v-model="currentStrategyConfig.gridConnection"
                    :min="0"
                    :max="5000"
                    :step="100"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </template>
          
          <template v-if="currentStrategy.type === 'smartControl'">
            <el-row :gutter="20">
              <el-col :xs="24" :md="6">
                <el-form-item label="AI调度">
                  <el-switch v-model="currentStrategyConfig.aiDispatch" />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :md="6">
                <el-form-item label="负荷预测">
                  <el-switch v-model="currentStrategyConfig.loadForecast" />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :md="6">
                <el-form-item label="需量控制">
                  <el-switch v-model="currentStrategyConfig.demandControl" />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :md="6">
                <el-form-item label="异常检测">
                  <el-switch v-model="currentStrategyConfig.anomalyDetection" />
                </el-form-item>
              </el-col>
            </el-row>
          </template>
        </el-form>
      </div>
      
      <div slot="footer" class="dialog-footer">
        <el-button @click="configDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveConfig">保存配置</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import draggable from 'vuedraggable'
import * as echarts from 'echarts'

export default {
  name: 'MultiStrategyCombination',
  components: {
    draggable
  },
  data() {
    return {
      selectedStrategies: [
        {
          id: 'strategy-001',
          type: 'lighting',
          name: '照明系统优化',
          savings: 5,
          investment: 120,
          paybackPeriod: 2.5,
          config: {}
        },
        {
          id: 'strategy-002',
          type: 'airConditioning',
          name: '空调系统改造',
          savings: 9,
          investment: 280,
          paybackPeriod: 3.2,
          config: {}
        }
      ],
      availableStrategies: [
        {
          id: 'strategy-003',
          type: 'ventilation',
          name: '通风系统优化',
          description: '安装CO2传感器实现智能通风控制',
          savings: 3.5,
          investment: 90,
          paybackPeriod: 2.0,
          icon: 'fa-wind',
          color: '#67C23A'
        },
        {
          id: 'strategy-004',
          type: 'renewableEnergy',
          name: '光伏发电系统',
          description: '屋顶安装太阳能光伏发电装置',
          savings: 12,
          investment: 850,
          paybackPeriod: 5.5,
          icon: 'fa-sun-o',
          color: '#E6A23C'
        },
        {
          id: 'strategy-005',
          type: 'energyStorage',
          name: '储能系统',
          description: '配置电池储能系统实现峰谷套利',
          savings: 7,
          investment: 520,
          paybackPeriod: 4.2,
          icon: 'fa-battery-three-quarters',
          color: '#13C2C2'
        },
        {
          id: 'strategy-006',
          type: 'smartControl',
          name: '智能控制系统',
          description: 'AI驱动的综合能源管理平台',
          savings: 5.5,
          investment: 180,
          paybackPeriod: 2.0,
          icon: 'fa-cogs',
          color: '#909399'
        }
      ],
      configDialogVisible: false,
      currentStrategy: null,
      currentStrategyConfig: {},
      baseEnergyConsumption: 16000000,
      combinationChart: null,
      resizeHandler: null
    }
  },
  computed: {
    totalSavings() {
      return this.selectedStrategies.reduce((sum, s) => sum + s.savings, 0)
    },
    totalSavingskWh() {
      return Math.round(this.baseEnergyConsumption * (this.totalSavings / 100))
    },
    totalSavingsRMB() {
      return Math.round(this.totalSavingskWh * 0.8)
    },
    avgPaybackPeriod() {
      if (this.selectedStrategies.length === 0) return 0
      const totalInvestment = this.selectedStrategies.reduce((sum, s) => sum + s.investment * 10000, 0)
      return totalInvestment / (this.totalSavingsRMB * 10000)
    },
    hasPotentialConflict() {
      const types = this.selectedStrategies.map(s => s.type)
      return types.includes('smartControl') && types.length > 3
    }
  },
  watch: {
    selectedStrategies: {
      handler() {
        this.$nextTick(() => {
          this.initChart()
        })
      },
      deep: true
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initChart()
      this.bindResize()
    })
  },
  beforeUnmount() {
    if (this.combinationChart) {
      this.combinationChart.dispose()
      this.combinationChart = null
    }
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler)
      this.resizeHandler = null
    }
  },
  methods: {
    initChart() {
      if (!this.$refs.combinationChart) return
      // 重建图表实例，保证切换/重新渲染后可见
      if (this.combinationChart) {
        this.combinationChart.dispose()
      }
      const chartDom = this.$refs.combinationChart
      this.combinationChart = echarts.init(chartDom)
      const names = this.selectedStrategies.map(s => s.name)
      const savingsData = this.selectedStrategies.map(s => s.savings)
      const investmentData = this.selectedStrategies.map(s => s.investment)
      const paybackData = this.selectedStrategies.map(s => s.paybackPeriod)

      const option = {
        tooltip: { trigger: 'axis' },
        legend: { data: ['节能率(%)', '投资(万)', '回收期(年)'], bottom: 0 },
        grid: { left: '5%', right: '10%', top: '10%', bottom: '15%', containLabel: true },
        xAxis: [{ type: 'category', data: names }],
        yAxis: [
          { type: 'value', name: '节能率(%)', position: 'left' },
          { type: 'value', name: '投资(万) / 回收期', position: 'right' }
        ],
        series: [
          {
            name: '节能率(%)',
            type: 'bar',
            data: savingsData,
            itemStyle: { color: '#67C23A' },
            barWidth: 24
          },
          {
            name: '投资(万)',
            type: 'bar',
            yAxisIndex: 1,
            data: investmentData,
            itemStyle: { color: '#409EFF' },
            barWidth: 24
          },
          {
            name: '回收期(年)',
            type: 'line',
            yAxisIndex: 1,
            data: paybackData,
            smooth: true,
            itemStyle: { color: '#E6A23C' }
          }
        ]
      }
      
      this.combinationChart.setOption(option)
    },

    bindResize() {
      this.resizeHandler = () => {
        if (this.combinationChart) this.combinationChart.resize()
      }
      window.addEventListener('resize', this.resizeHandler)
    },
    
    isStrategySelected(id) {
      return this.selectedStrategies.some(s => s.id === id)
    },
    
    handleAdd(strategy) {
      if (this.isStrategySelected(strategy.id)) return
      
      this.selectedStrategies.push({
        ...strategy,
        config: {}
      })
    },
    
    handleRemove(strategy) {
      const index = this.selectedStrategies.findIndex(s => s.id === strategy.id)
      if (index > -1) {
        this.selectedStrategies.splice(index, 1)
      }
    },
    
    handleConfigure(strategy) {
      this.currentStrategy = strategy
      this.currentStrategyConfig = { ...strategy.config } || {}
      this.configDialogVisible = true
    },
    
    handleSaveConfig() {
      if (this.currentStrategy) {
        const index = this.selectedStrategies.findIndex(s => s.id === this.currentStrategy.id)
        if (index > -1) {
          this.selectedStrategies[index].config = { ...this.currentStrategyConfig }
          this.selectedStrategies[index].savings = this.calculateSavings(
            this.currentStrategy.type,
            this.currentStrategyConfig
          )
        }
      }
      this.configDialogVisible = false
    },
    
    calculateSavings(type, config) {
      const baseSavings = {
        lighting: 5,
        airConditioning: 9,
        ventilation: 3.5,
        renewableEnergy: 12,
        energyStorage: 7,
        smartControl: 5.5
      }
      
      let multiplier = 1
      if (type === 'lighting') {
        multiplier = (config.ledRatio || 100) / 100
      } else if (type === 'airConditioning') {
        multiplier = (config.vfdRatio || 100) / 100
      }
      
      return Math.round(baseSavings[type] * multiplier * 10) / 10
    },
    
    handleOptimize() {
      this.$message.info('正在智能优化策略组合...')
      setTimeout(() => {
        this.selectedStrategies = [
          {
            id: 'strategy-001',
            type: 'lighting',
            name: '照明系统优化',
            savings: 5,
            investment: 120,
            paybackPeriod: 2.5,
            config: {}
          },
          {
            id: 'strategy-006',
            type: 'smartControl',
            name: '智能控制系统',
            savings: 5.5,
            investment: 180,
            paybackPeriod: 2.0,
            config: {}
          },
          {
            id: 'strategy-003',
            type: 'ventilation',
            name: '通风系统优化',
            savings: 3.5,
            investment: 90,
            paybackPeriod: 2.0,
            config: {}
          }
        ]
        this.$message.success('策略组合优化完成，推荐以上3个策略组合')
      }, 1500)
    },
    
    handleCompare() {
      this.$emit('compare', this.selectedStrategies)
      this.$nextTick(() => {
        this.initChart()
      })
    },
    
    onDragEnd() {
      this.$emit('priorityChange', this.selectedStrategies)
    },
    
    getStrategyColor(type) {
      const colors = {
        lighting: '#F7C94B',
        airConditioning: '#409EFF',
        ventilation: '#67C23A',
        renewableEnergy: '#E6A23C',
        energyStorage: '#13C2C2',
        smartControl: '#909399'
      }
      return colors[type] || '#409EFF'
    },
    
    getStrategyIcon(type) {
      const icons = {
        lighting: 'fa-lightbulb-o',
        airConditioning: 'fa-snowflake-o',
        ventilation: 'fa-wind',
        renewableEnergy: 'fa-sun-o',
        energyStorage: 'fa-battery-three-quarters',
        smartControl: 'fa-cogs'
      }
      return icons[type] || 'fa-file-text-o'
    },
    
    getPriorityType(priority) {
      if (priority === 1) return 'danger'
      if (priority === 2) return 'warning'
      if (priority === 3) return 'info'
      return ''
    },
    
    getProgressColor(savings) {
      if (savings >= 10) return '#67C23A'
      if (savings >= 5) return '#409EFF'
      return '#E6A23C'
    }
  }
}
</script>

<style scoped>
.multi-strategy-container {
  margin-bottom: 20px;
}

.combination-card {
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
  color: #67C23A;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.strategy-sort-area {
  background: #F5F7FA;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
}

.sort-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.sort-title {
  font-weight: 500;
  color: #303133;
  display: flex;
  align-items: center;
}

.sort-title i {
  margin-right: 8px;
  color: #409EFF;
}

.strategy-count {
  font-size: 12px;
  color: #909399;
}

.strategy-item {
  display: flex;
  align-items: center;
  background: #fff;
  border: 1px solid #EBEEF5;
  border-radius: 8px;
  padding: 12px 15px;
  margin-bottom: 10px;
  cursor: default;
  transition: all 0.3s ease;
}

.strategy-item:hover {
  border-color: #409EFF;
}

.strategy-item.ghost {
  opacity: 0.5;
  background: #F5F7FA;
}

.drag-handle {
  cursor: move;
  margin-right: 15px;
  color: #C0C4CC;
}

.drag-handle:hover {
  color: #409EFF;
}

.strategy-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
}

.strategy-icon i {
  font-size: 18px;
  color: #fff;
}

.strategy-info {
  flex: 1;
}

.strategy-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 5px;
}

.strategy-priority {
  display: flex;
  align-items: center;
  gap: 10px;
}

.strategy-savings {
  font-size: 12px;
  color: #67C23A;
}

.strategy-effect {
  margin-right: 15px;
}

.strategy-actions {
  display: flex;
  gap: 5px;
}

.strategy-select-area {
  margin-bottom: 20px;
}

.select-header {
  margin-bottom: 15px;
}

.select-title {
  font-weight: 500;
  color: #303133;
  display: flex;
  align-items: center;
}

.select-title i {
  margin-right: 8px;
  color: #67C23A;
}

.available-strategies {
  min-height: 100px;
}

.strategy-card {
  background: #fff;
  border: 1px solid #EBEEF5;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.strategy-card:hover:not(.disabled) {
  border-color: #67C23A;
  box-shadow: 0 2px 12px rgba(103, 194, 58, 0.2);
}

.strategy-card.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.card-icon {
  width: 45px;
  height: 45px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
}

.card-icon i {
  font-size: 20px;
  color: #fff;
}

.card-content {
  margin-bottom: 10px;
}

.card-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin: 0 0 5px 0;
}

.card-desc {
  font-size: 12px;
  color: #909399;
  margin: 0 0 10px 0;
  line-height: 1.4;
  height: 34px;
  overflow: hidden;
}

.card-stats {
  display: flex;
  gap: 15px;
}

.stat-item {
  font-size: 12px;
  color: #67C23A;
}

.stat-item i {
  margin-right: 3px;
}

.selected-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 24px;
  height: 24px;
  background: #67C23A;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.selected-badge i {
  font-size: 12px;
  color: #fff;
}

.combination-analysis {
  background: #F5F7FA;
  border-radius: 8px;
  padding: 20px;
}

.analysis-title {
  font-size: 16px;
  color: #303133;
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
}

.analysis-title i {
  margin-right: 8px;
  color: #409EFF;
}

.chart-container {
  background: #fff;
  border-radius: 8px;
  padding: 15px;
}

.echart-container {
  height: 300px;
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.stat-card {
  background: #fff;
  border-radius: 8px;
  padding: 15px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-icon {
  width: 45px;
  height: 45px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon i {
  font-size: 20px;
  color: #fff;
}

.stat-value {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.stat-label {
  font-size: 12px;
  color: #909399;
}

.combination-warning {
  background: #FFFBE6;
  border: 1px solid #FFE58F;
  border-radius: 8px;
  padding: 12px 15px;
  margin-top: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #D48806;
}

.config-content {
  padding: 10px 0;
}

.config-title {
  font-size: 16px;
  color: #303133;
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .header-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .summary-stats {
    grid-template-columns: 1fr;
  }
}
</style>
