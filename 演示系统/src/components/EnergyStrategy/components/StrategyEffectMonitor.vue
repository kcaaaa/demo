<template>
  <div class="strategy-effect-monitor-container">
    <el-card shadow="hover" class="monitor-card">
      <div slot="header" class="card-header">
        <h3 class="card-title">
          <i class="fa fa-line-chart"></i> 策略效果监控
        </h3>
        <div class="header-actions">
          <el-button size="small" @click="handleRefresh">
            <i class="fa fa-refresh"></i> 刷新数据
          </el-button>
          <el-button type="primary" size="small" @click="handleExportReport">
            <i class="fa fa-file-pdf-o"></i> 导出报告
          </el-button>
        </div>
      </div>

      <div class="monitor-overview">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :lg="6">
            <el-card shadow="hover" class="kpi-card">
              <div class="kpi-content">
                <div class="kpi-icon success">
                  <i class="fa fa-check-circle"></i>
                </div>
                <div class="kpi-info">
                  <div class="kpi-value">{{ monitorStats.activeStrategies }}</div>
                  <div class="kpi-label">运行中策略</div>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :xs="24" :sm="12" :lg="6">
            <el-card shadow="hover" class="kpi-card">
              <div class="kpi-content">
                <div class="kpi-icon warning">
                  <i class="fa fa-exclamation-triangle"></i>
                </div>
                <div class="kpi-info">
                  <div class="kpi-value">{{ monitorStats.alerts }}</div>
                  <div class="kpi-label">待处理预警</div>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :xs="24" :sm="12" :lg="6">
            <el-card shadow="hover" class="kpi-card">
              <div class="kpi-content">
                <div class="kpi-icon primary">
                  <i class="fa fa-lightbulb-o"></i>
                </div>
                <div class="kpi-info">
                  <div class="kpi-value">{{ monitorStats.avgEffectiveness }}%</div>
                  <div class="kpi-label">平均达成率</div>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :xs="24" :sm="12" :lg="6">
            <el-card shadow="hover" class="kpi-card">
              <div class="kpi-content">
                <div class="kpi-icon info">
                  <i class="fa fa-pie-chart"></i>
                </div>
                <div class="kpi-info">
                  <div class="kpi-value">¥{{ (monitorStats.totalSavings / 10000).toFixed(1) }}万</div>
                  <div class="kpi-label">累计节能收益</div>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <div class="monitor-tabs">
        <el-tabs v-model="activeTab" type="card">
          <el-tab-pane label="实时监控" name="realtime">
            <div class="realtime-panel">
              <el-row :gutter="20">
                <el-col :xs="24" :lg="16">
                  <el-card shadow="hover" class="chart-card">
                    <div slot="header" class="card-header">
                      <span><i class="fa fa-area-chart"></i> 实时节能效果趋势</span>
                      <div class="header-actions">
                        <el-radio-group v-model="timeRange" size="mini" @change="handleTimeRangeChange">
                          <el-radio-button label="day">日</el-radio-button>
                          <el-radio-button label="week">周</el-radio-button>
                          <el-radio-button label="month">月</el-radio-button>
                        </el-radio-group>
                      </div>
                    </div>
                    <div ref="realtimeChartRef" class="chart-container"></div>
                  </el-card>
                </el-col>
                <el-col :xs="24" :lg="8">
                  <el-card shadow="hover" class="status-card">
                    <div slot="header" class="card-header">
                      <span><i class="fa fa-list-ol"></i> 策略运行状态</span>
                    </div>
                    <div class="status-list">
                      <div v-for="(strategy, index) in runningStrategies" :key="index" class="status-item">
                        <div class="status-header">
                          <span class="status-name">{{ strategy.name }}</span>
                          <el-tag :type="getStatusType(strategy.status)" size="mini">
                            {{ getStatusText(strategy.status) }}
                          </el-tag>
                        </div>
                        <el-progress :percentage="strategy.effectiveness" :color="getProgressColor(strategy.effectiveness)" :stroke-width="8"></el-progress>
                        <div class="status-footer">
                          <span><i class="fa fa-clock-o"></i> 运行{{ strategy.runningTime }}</span>
                          <span><i class="fa fa-bolt"></i> 节能{{ strategy.savings }}%</span>
                        </div>
                      </div>
                    </div>
                  </el-card>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :xs="24" :lg="12">
                  <el-card shadow="hover" class="chart-card">
                    <div slot="header" class="card-header">
                      <span><i class="fa fa-bar-chart"></i> 区域效果对比</span>
                    </div>
                    <div ref="areaComparisonChartRef" class="chart-container"></div>
                  </el-card>
                </el-col>
                <el-col :xs="24" :lg="12">
                  <el-card shadow="hover" class="chart-card">
                    <div slot="header" class="card-header">
                      <span><i class="fa fa-pie-chart"></i> 节能收益分布</span>
                    </div>
                    <div ref="savingsDistributionChartRef" class="chart-container"></div>
                  </el-card>
                </el-col>
              </el-row>
            </div>
          </el-tab-pane>

          <el-tab-pane label="预警管理" name="alerts">
            <div class="alerts-panel">
              <el-card shadow="hover" class="filter-card">
                <div class="filter-row">
                  <el-select v-model="alertFilter.level" placeholder="预警等级" clearable size="small" style="width: 150px;">
                    <el-option label="高风险" value="high"></el-option>
                    <el-option label="中风险" value="medium"></el-option>
                    <el-option label="低风险" value="low"></el-option>
                  </el-select>
                  <el-select v-model="alertFilter.status" placeholder="处理状态" clearable size="small" style="width: 150px;">
                    <el-option label="待处理" value="pending"></el-option>
                    <el-option label="处理中" value="processing"></el-option>
                    <el-option label="已处理" value="resolved"></el-option>
                  </el-select>
                  <el-button size="small" @click="handleAlertFilter">筛选</el-button>
                  <el-button size="small" @click="handleBatchProcess">批量处理</el-button>
                </div>
              </el-card>

              <el-table :data="alerts" stripe @selection-change="handleAlertSelection">
                <el-table-column type="selection" width="50"></el-table-column>
                <el-table-column prop="time" label="预警时间" width="160"></el-table-column>
                <el-table-column prop="strategyName" label="策略名称" width="150"></el-table-column>
                <el-table-column prop="level" label="等级" width="80">
                  <template slot-scope="scope">
                    <el-tag :type="getAlertLevelType(scope.row.level)" size="small">
                      {{ getAlertLevelText(scope.row.level) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="content" label="预警内容"></el-table-column>
                <el-table-column prop="expectedSavings" label="预期节能" width="100">
                  <template slot-scope="scope">{{ scope.row.expectedSavings }}%</template>
                </el-table-column>
                <el-table-column prop="actualSavings" label="实际节能" width="100">
                  <template slot-scope="scope">
                    <span :class="{ 'text-danger': scope.row.actualSavings < scope.row.expectedSavings }">
                      {{ scope.row.actualSavings }}%
                    </span>
                  </template>
                </el-table-column>
                <el-table-column prop="status" label="状态" width="100">
                  <template slot-scope="scope">
                    <el-tag :type="getAlertStatusType(scope.row.status)" size="small">
                      {{ getAlertStatusText(scope.row.status) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="150" fixed="right">
                  <template slot-scope="scope">
                    <el-button type="text" size="mini" @click="handleViewAlert(scope.row)">
                      <i class="fa fa-eye"></i> 查看
                    </el-button>
                    <el-button v-if="scope.row.status === 'pending'" type="text" size="mini" @click="handleProcessAlert(scope.row)">
                      <i class="fa fa-cog"></i> 处理
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-tab-pane>

          <el-tab-pane label="效果对比" name="comparison">
            <div class="comparison-panel">
              <el-card shadow="hover" class="comparison-settings">
                <div class="settings-row">
                  <el-select v-model="comparisonForm.strategy1" placeholder="选择策略1" size="small" style="width: 200px;">
                    <el-option v-for="item in allStrategies" :key="item.value" :label="item.label" :value="item.value"></el-option>
                  </el-select>
                  <span class="vs-text">VS</span>
                  <el-select v-model="comparisonForm.strategy2" placeholder="选择策略2" size="small" style="width: 200px;">
                    <el-option v-for="item in allStrategies" :key="item.value" :label="item.label" :value="item.value"></el-option>
                  </el-select>
                  <el-button type="primary" size="small" @click="handleCompare">
                    <i class="fa fa-exchange"></i> 开始对比
                  </el-button>
                </div>
              </el-card>

              <div v-if="comparisonResult" class="comparison-result">
                <el-row :gutter="20">
                  <el-col :xs="24" :lg="12">
                    <el-card shadow="hover" class="strategy-card">
                      <div slot="header" class="card-header">
                        <span class="strategy-name">{{ comparisonResult.strategy1.name }}</span>
                        <el-tag type="primary" size="small">策略1</el-tag>
                      </div>
                      <div class="strategy-metrics">
                        <div class="metric-item">
                          <div class="metric-label">平均节能率</div>
                          <div class="metric-value">{{ comparisonResult.strategy1.avgSavings }}%</div>
                        </div>
                        <div class="metric-item">
                          <div class="metric-label">最高节能率</div>
                          <div class="metric-value">{{ comparisonResult.strategy1.maxSavings }}%</div>
                        </div>
                        <div class="metric-item">
                          <div class="metric-label">投资回报期</div>
                          <div class="metric-value">{{ comparisonResult.strategy1.roi }}个月</div>
                        </div>
                        <div class="metric-item">
                          <div class="metric-label">稳定性评分</div>
                          <div class="metric-value">{{ comparisonResult.strategy1.stability }}/10</div>
                        </div>
                      </div>
                    </el-card>
                  </el-col>
                  <el-col :xs="24" :lg="12">
                    <el-card shadow="hover" class="strategy-card">
                      <div slot="header" class="card-header">
                        <span class="strategy-name">{{ comparisonResult.strategy2.name }}</span>
                        <el-tag type="success" size="small">策略2</el-tag>
                      </div>
                      <div class="strategy-metrics">
                        <div class="metric-item">
                          <div class="metric-label">平均节能率</div>
                          <div class="metric-value">{{ comparisonResult.strategy2.avgSavings }}%</div>
                        </div>
                        <div class="metric-item">
                          <div class="metric-label">最高节能率</div>
                          <div class="metric-value">{{ comparisonResult.strategy2.maxSavings }}%</div>
                        </div>
                        <div class="metric-item">
                          <div class="metric-label">投资回报期</div>
                          <div class="metric-value">{{ comparisonResult.strategy2.roi }}个月</div>
                        </div>
                        <div class="metric-item">
                          <div class="metric-label">稳定性评分</div>
                          <div class="metric-value">{{ comparisonResult.strategy2.stability }}/10</div>
                        </div>
                      </div>
                    </el-card>
                  </el-col>
                </el-row>

                <el-card shadow="hover" class="comparison-chart-card">
                  <div slot="header" class="card-header">
                    <span><i class="fa fa-bar-chart"></i> 效果对比分析</span>
                  </div>
                  <div ref="comparisonChartRef" class="chart-container"></div>
                </el-card>

                <el-card shadow="hover" class="winner-card">
                  <div class="winner-content">
                    <div class="winner-badge">
                      <i class="fa fa-trophy"></i>
                    </div>
                    <div class="winner-text">
                      <h4>对比结论</h4>
                      <p>{{ comparisonResult.conclusion }}</p>
                    </div>
                  </div>
                </el-card>
              </div>

              <div v-else class="empty-comparison">
                <div class="empty-icon">
                  <i class="fa fa-balance-scale"></i>
                </div>
                <div class="empty-text">
                  <h4>选择策略进行效果对比</h4>
                  <p>从下拉菜单中选择两个策略，系统将自动对比分析其节能效果</p>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="趋势分析" name="trend">
            <div class="trend-panel">
              <el-row :gutter="20">
                <el-col :xs="24" :lg="16">
                  <el-card shadow="hover" class="chart-card">
                    <div slot="header" class="card-header">
                      <span><i class="fa fa-line-chart"></i> 节能效果趋势</span>
                      <div class="header-actions">
                        <el-select v-model="trendForm.metric" size="mini" style="width: 120px;" @change="handleTrendMetricChange">
                          <el-option label="节能率" value="savings"></el-option>
                          <el-option label="能耗降低" value="energy"></el-option>
                          <el-option label="成本节约" value="cost"></el-option>
                        </el-select>
                      </div>
                    </div>
                    <div ref="trendChartRef" class="chart-container"></div>
                  </el-card>
                </el-col>
                <el-col :xs="24" :lg="8">
                  <el-card shadow="hover" class="trend-stats-card">
                    <div slot="header" class="card-header">
                      <span><i class="fa fa-calculator"></i> 趋势统计</span>
                    </div>
                    <div class="trend-stats">
                      <div class="trend-stat-item">
                        <div class="trend-stat-label">近30天平均节能率</div>
                        <div class="trend-stat-value">{{ trendStats.avgSavings }}%</div>
                        <div class="trend-stat-change positive">
                          <i class="fa fa-arrow-up"></i> 较上月+{{ trendStats.monthlyChange }}%
                        </div>
                      </div>
                      <div class="trend-stat-item">
                        <div class="trend-stat-label">峰值节能率</div>
                        <div class="trend-stat-value">{{ trendStats.peakSavings }}%</div>
                        <div class="trend-stat-date">出现在{{ trendStats.peakDate }}</div>
                      </div>
                      <div class="trend-stat-item">
                        <div class="trend-stat-label">稳定性指数</div>
                        <div class="trend-stat-value">{{ trendStats.stabilityIndex }}/10</div>
                        <div class="trend-stat-change" :class="trendStats.stabilityIndex >= 7 ? 'positive' : 'negative'">
                          {{ trendStats.stabilityIndex >= 7 ? '稳定运行中' : '波动较大' }}
                        </div>
                      </div>
                    </div>
                  </el-card>
                </el-col>
              </el-row>

              <el-card shadow="hover" class="prediction-card">
                <div slot="header" class="card-header">
                  <span><i class="fa fa-magic"></i> 效果预测</span>
                </div>
                <div class="prediction-content">
                  <el-row :gutter="20">
                    <el-col :xs="24" :md="8">
                      <div class="prediction-item">
                        <div class="prediction-label">预计下月节能率</div>
                        <div class="prediction-value">{{ prediction.nextMonthSavings }}%</div>
                        <el-progress :percentage="prediction.nextMonthSavings" :show-text="false" color="#52C41A"></el-progress>
                      </div>
                    </el-col>
                    <el-col :xs="24" :md="8">
                      <div class="prediction-item">
                        <div class="prediction-label">预计下月节约成本</div>
                        <div class="prediction-value">¥{{ prediction.nextMonthCost.toLocaleString() }}</div>
                        <el-progress :percentage="prediction.confidence" :show-text="false" color="#409EFF"></el-progress>
                        <div class="prediction-confidence">预测可信度{{ prediction.confidence }}%</div>
                      </div>
                    </el-col>
                    <el-col :xs="24" :md="8">
                      <div class="prediction-item">
                        <div class="prediction-label">建议优化方向</div>
                        <div class="prediction-suggestion">{{ prediction.suggestion }}</div>
                      </div>
                    </el-col>
                  </el-row>
                </div>
              </el-card>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-card>

    <el-dialog title="预警详情" :visible.sync="alertDialogVisible" width="600px">
      <div v-if="selectedAlert" class="alert-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="预警时间">{{ selectedAlert.time }}</el-descriptions-item>
          <el-descriptions-item label="预警等级">
            <el-tag :type="getAlertLevelType(selectedAlert.level)" size="small">
              {{ getAlertLevelText(selectedAlert.level) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="策略名称">{{ selectedAlert.strategyName }}</el-descriptions-item>
          <el-descriptions-item label="当前状态">
            <el-tag :type="getAlertStatusType(selectedAlert.status)" size="small">
              {{ getAlertStatusText(selectedAlert.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="预期节能">{{ selectedAlert.expectedSavings }}%</el-descriptions-item>
          <el-descriptions-item label="实际节能">{{ selectedAlert.actualSavings }}%</el-descriptions-item>
          <el-descriptions-item label="预警内容" :span="2">{{ selectedAlert.content }}</el-descriptions-item>
          <el-descriptions-item label="根因分析" :span="2">{{ selectedAlert.rootCause }}</el-descriptions-item>
          <el-descriptions-item label="处理建议" :span="2">{{ selectedAlert.suggestion }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="alertDialogVisible = false">关闭</el-button>
        <el-button v-if="selectedAlert && selectedAlert.status === 'pending'" type="primary" @click="handleProcessAlert(selectedAlert)">开始处理</el-button>
      </span>
    </el-dialog>

    <el-dialog title="处理预警" :visible.sync="processDialogVisible" width="500px">
      <div v-if="selectedAlert">
        <el-form :model="processForm" label-width="100px" size="small">
          <el-form-item label="处理方式">
            <el-select v-model="processForm.method" placeholder="请选择处理方式" style="width: 100%;">
              <el-option label="调整策略参数" value="adjust"></el-option>
              <el-option label="暂停策略运行" value="pause"></el-option>
              <el-option label="优化设备配置" value="optimize"></el-option>
              <el-option label="其他处理" value="other"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="处理说明">
            <el-input type="textarea" v-model="processForm.description" rows="3" placeholder="请输入处理说明"></el-input>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="processDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitProcess">确认处理</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'StrategyEffectMonitor',
  data() {
    return {
      activeTab: 'realtime',
      timeRange: 'day',
      monitorStats: {
        activeStrategies: 8,
        alerts: 5,
        avgEffectiveness: 87,
        totalSavings: 1560000
      },
      runningStrategies: [
        { name: '候车大厅智能照明', status: 'normal', effectiveness: 92, runningTime: '15天3小时', savings: 18.5 },
        { name: '站台空调优化控制', status: 'normal', effectiveness: 85, runningTime: '12天6小时', savings: 15.2 },
        { name: '电梯群控节能', status: 'warning', effectiveness: 68, runningTime: '8天12小时', savings: 8.3 },
        { name: '新风系统智能调节', status: 'normal', effectiveness: 88, runningTime: '5天8小时', savings: 12.1 },
        { name: '地下停车场感应照明', status: 'normal', effectiveness: 95, runningTime: '20天15小时', savings: 22.5 }
      ],
      alertFilter: {
        level: '',
        status: ''
      },
      alerts: [
        { time: '2024-12-26 14:30', strategyName: '电梯群控节能', level: 'medium', content: '节能效果未达预期，实际节能8.3%，预期15%', expectedSavings: 15, actualSavings: 8.3, status: 'pending', rootCause: '客流量高于预期，导致电梯运行频率增加', suggestion: '建议调整客流预测参数，优化调度策略' },
        { time: '2024-12-26 10:15', strategyName: '空调系统优化', level: 'low', content: '部分区域温度波动较大，影响用户体验', expectedSavings: 12, actualSavings: 11.5, status: 'processing', rootCause: '外部温度变化较快，控制系统响应延迟', suggestion: '建议提高控制频率，增强系统响应能力' },
        { time: '2024-12-25 18:45', strategyName: '智能照明控制', level: 'high', content: '照明系统出现异常，部分区域照明不足', expectedSavings: 20, actualSavings: 18, status: 'resolved', rootCause: '传感器故障导致误判', suggestion: '已修复传感器，建议定期维护检查' }
      ],
      selectedAlert: null,
      alertDialogVisible: false,
      processDialogVisible: false,
      processForm: {
        method: '',
        description: ''
      },
      comparisonForm: {
        strategy1: '',
        strategy2: ''
      },
      comparisonResult: null,
      allStrategies: [
        { value: 'lighting1', label: '候车大厅智能照明' },
        { value: 'lighting2', label: '站台LED照明替换' },
        { value: 'ac1', label: '空调系统优化控制' },
        { value: 'ac2', label: '中央空调变频改造' },
        { value: 'control1', label: '电梯群控节能' },
        { value: 'control2', label: '新风系统智能调节' },
        { value: 'control3', label: '地下停车场感应照明' },
        { value: 'comprehensive1', label: '综合节能优化方案' }
      ],
      trendForm: {
        metric: 'savings'
      },
      trendStats: {
        avgSavings: 14.2,
        monthlyChange: 8.5,
        peakSavings: 22.5,
        peakDate: '2024-12-15',
        stabilityIndex: 8.5
      },
      prediction: {
        nextMonthSavings: 16.5,
        nextMonthCost: 185000,
        confidence: 85,
        suggestion: '建议优化空调控制策略，提高低温天气下的节能效果'
      },
      realtimeChart: null,
      areaComparisonChart: null,
      savingsDistributionChart: null,
      comparisonChart: null,
      trendChart: null
    }
  },
  mounted() {
    this.initCharts()
    window.addEventListener('resize', this.handleResize)
  },
  beforeUnmount() {
    this.disposeCharts()
    window.removeEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    this.disposeCharts()
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    handleResize() {
      if (this.realtimeChart) {
        this.realtimeChart.resize()
      }
      if (this.areaComparisonChart) {
        this.areaComparisonChart.resize()
      }
      if (this.savingsDistributionChart) {
        this.savingsDistributionChart.resize()
      }
      if (this.comparisonChart) {
        this.comparisonChart.resize()
      }
      if (this.trendChart) {
        this.trendChart.resize()
      }
    },
    disposeCharts() {
      if (this.realtimeChart) {
        this.realtimeChart.dispose()
        this.realtimeChart = null
      }
      if (this.areaComparisonChart) {
        this.areaComparisonChart.dispose()
        this.areaComparisonChart = null
      }
      if (this.savingsDistributionChart) {
        this.savingsDistributionChart.dispose()
        this.savingsDistributionChart = null
      }
      if (this.comparisonChart) {
        this.comparisonChart.dispose()
        this.comparisonChart = null
      }
      if (this.trendChart) {
        this.trendChart.dispose()
        this.trendChart = null
      }
    },
    initCharts() {
      this.$nextTick(() => {
        this.initRealtimeChart()
        this.initAreaComparisonChart()
        this.initSavingsDistributionChart()
        this.initTrendChart()
      })
    },
    initRealtimeChart() {
      if (this.$refs.realtimeChartRef) {
        this.realtimeChart = echarts.init(this.$refs.realtimeChartRef)
        const hours = ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00']
        const option = {
          tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'cross' }
          },
          legend: {
            data: ['预期节能率', '实际节能率'],
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
            data: hours
          },
          yAxis: {
            type: 'value',
            max: 30
          },
          series: [
            {
              name: '预期节能率',
              type: 'line',
              smooth: true,
              data: [12, 15, 18, 16, 14, 12, 10, 11, 13, 15, 17, 14],
              lineStyle: { color: '#409EFF' },
              itemStyle: { color: '#409EFF' }
            },
            {
              name: '实际节能率',
              type: 'line',
              smooth: true,
              data: [11, 14, 17, 15, 13, 11, 9, 10, 12, 14, 16, 13],
              lineStyle: { color: '#52C41A' },
              itemStyle: { color: '#52C41A' }
            }
          ]
        }
        this.realtimeChart.setOption(option)
      }
    },
    initAreaComparisonChart() {
      if (this.$refs.areaComparisonChartRef) {
        this.areaComparisonChart = echarts.init(this.$refs.areaComparisonChartRef)
        const option = {
          tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' }
          },
          legend: {
            data: ['预期节能率', '实际节能率'],
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
            type: 'value',
            max: 30
          },
          yAxis: {
            type: 'category',
            data: ['候车大厅', '站台区域', '办公区域', '商业区', '地下停车场', '地铁换乘']
          },
          series: [
            {
              name: '预期节能率',
              type: 'bar',
              data: [20, 18, 15, 12, 25, 10],
              itemStyle: { color: '#409EFF', borderRadius: [0, 4, 4, 0] }
            },
            {
              name: '实际节能率',
              type: 'bar',
              data: [18.5, 16.2, 13.8, 11.5, 22.5, 9.2],
              itemStyle: { color: '#52C41A', borderRadius: [0, 4, 4, 0] }
            }
          ]
        }
        this.areaComparisonChart.setOption(option)
      }
    },
    initSavingsDistributionChart() {
      if (this.$refs.savingsDistributionChartRef) {
        this.savingsDistributionChart = echarts.init(this.$refs.savingsDistributionChartRef)
        const option = {
          tooltip: {
            trigger: 'item',
            formatter: '{b}: ¥{c} ({d}%)'
          },
          legend: {
            orient: 'vertical',
            right: 10,
            top: 'center'
          },
          series: [{
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 8,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: { show: false },
            data: [
              { value: 520000, name: '照明系统', itemStyle: { color: '#409EFF' } },
              { value: 680000, name: '空调系统', itemStyle: { color: '#722ED1' } },
              { value: 180000, name: '运输系统', itemStyle: { color: '#52C41A' } },
              { value: 120000, name: '通风系统', itemStyle: { color: '#FAAD14' } },
              { value: 60000, name: '给排水', itemStyle: { color: '#13C2C2' } }
            ]
          }]
        }
        this.savingsDistributionChart.setOption(option)
      }
    },
    initTrendChart() {
      if (this.$refs.trendChartRef) {
        this.trendChart = echarts.init(this.$refs.trendChartRef)
        const days = []
        const savings = []
        for (let i = 1; i <= 30; i++) {
          days.push(`12-${i}`)
          savings.push(Math.floor(Math.random() * 10) + 10)
        }
        const option = {
          tooltip: {
            trigger: 'axis'
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            top: '10%',
            containLabel: true
          },
          xAxis: {
            type: 'category',
            boundaryGap: false,
            data: days
          },
          yAxis: {
            type: 'value'
          },
          series: [{
            type: 'line',
            smooth: true,
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(82, 196, 26, 0.3)' },
                { offset: 1, color: 'rgba(82, 196, 26, 0.05)' }
              ])
            },
            data: savings,
            lineStyle: { color: '#52C41A' },
            itemStyle: { color: '#52C41A' }
          }]
        }
        this.trendChart.setOption(option)
      }
    },
    handleRefresh() {
      this.$message.success('数据刷新中...')
      setTimeout(() => {
        this.$message.success('数据已更新')
      }, 1000)
    },
    handleExportReport() {
      this.$message.success('报告导出中...')
      setTimeout(() => {
        this.$message.success('报告已导出！')
      }, 1500)
    },
    handleTimeRangeChange(value) {
      this.$message.info(`切换至${value === 'day' ? '日' : value === 'week' ? '周' : '月'}数据视图`)
      this.initRealtimeChart()
    },
    handleAlertFilter() {
      this.$message.success('筛选条件已应用')
    },
    handleBatchProcess() {
      this.$message.warning('请先选择要处理的预警')
    },
    handleAlertSelection(selection) {
      console.log('选中预警:', selection)
    },
    handleViewAlert(row) {
      this.selectedAlert = row
      this.alertDialogVisible = true
    },
    handleProcessAlert(row) {
      this.selectedAlert = row
      this.processForm = { method: '', description: '' }
      this.alertDialogVisible = false
      this.processDialogVisible = true
    },
    handleSubmitProcess() {
      this.$message.success('预警处理已提交')
      this.processDialogVisible = false
      if (this.selectedAlert) {
        this.selectedAlert.status = 'processing'
      }
    },
    handleCompare() {
      if (!this.comparisonForm.strategy1 || !this.comparisonForm.strategy2) {
        this.$message.warning('请选择两个策略进行对比')
        return
      }
      if (this.comparisonForm.strategy1 === this.comparisonForm.strategy2) {
        this.$message.warning('请选择不同的策略进行对比')
        return
      }
      this.comparisonResult = {
        strategy1: {
          name: this.allStrategies.find(s => s.value === this.comparisonForm.strategy1)?.label,
          avgSavings: (Math.random() * 10 + 10).toFixed(1),
          maxSavings: (Math.random() * 10 + 20).toFixed(1),
          roi: Math.floor(Math.random() * 6) + 6,
          stability: (Math.random() * 2 + 7).toFixed(1)
        },
        strategy2: {
          name: this.allStrategies.find(s => s.value === this.comparisonForm.strategy2)?.label,
          avgSavings: (Math.random() * 10 + 10).toFixed(1),
          maxSavings: (Math.random() * 10 + 20).toFixed(1),
          roi: Math.floor(Math.random() * 6) + 6,
          stability: (Math.random() * 2 + 7).toFixed(1)
        },
        conclusion: `${this.allStrategies.find(s => s.value === this.comparisonForm.strategy1)?.label}在平均节能率方面表现更优，而${this.allStrategies.find(s => s.value === this.comparisonForm.strategy2)?.label}在稳定性方面更具优势。建议根据实际需求选择合适的策略。`
      }
      this.$nextTick(() => {
        this.initComparisonChart()
      })
    },
    initComparisonChart() {
      if (this.$refs.comparisonChartRef) {
        this.comparisonChart = echarts.init(this.$refs.comparisonChartRef)
        const option = {
          tooltip: { trigger: 'axis' },
          legend: { data: ['策略1', '策略2'], bottom: 0 },
          radar: {
            indicator: [
              { name: '平均节能率', max: 30 },
              { name: '最高节能率', max: 35 },
              { name: '投资回报期', max: 12 },
              { name: '稳定性', max: 10 },
              { name: '实施难度', max: 10 }
            ],
            center: ['50%', '50%'],
            radius: '65%'
          },
          series: [{
            type: 'radar',
            data: [
              {
                value: [
                  parseFloat(this.comparisonResult.strategy1.avgSavings),
                  parseFloat(this.comparisonResult.strategy1.maxSavings),
                  12 - parseFloat(this.comparisonResult.strategy1.roi),
                  parseFloat(this.comparisonResult.strategy1.stability),
                  7
                ],
                name: '策略1',
                itemStyle: { color: '#409EFF' },
                areaStyle: { color: 'rgba(64, 158, 255, 0.3)' }
              },
              {
                value: [
                  parseFloat(this.comparisonResult.strategy2.avgSavings),
                  parseFloat(this.comparisonResult.strategy2.maxSavings),
                  12 - parseFloat(this.comparisonResult.strategy2.roi),
                  parseFloat(this.comparisonResult.strategy2.stability),
                  6
                ],
                name: '策略2',
                itemStyle: { color: '#52C41A' },
                areaStyle: { color: 'rgba(82, 196, 26, 0.3)' }
              }
            ]
          }]
        }
        this.comparisonChart.setOption(option)
      }
    },
    handleTrendMetricChange(value) {
      this.$message.info(`切换至${value === 'savings' ? '节能率' : value === 'energy' ? '能耗降低' : '成本节约'}指标`)
      this.initTrendChart()
    },
    getStatusType(status) {
      const types = { normal: 'success', warning: 'warning', error: 'danger' }
      return types[status] || 'info'
    },
    getStatusText(status) {
      const texts = { normal: '正常', warning: '预警', error: '异常' }
      return texts[status] || status
    },
    getProgressColor(percentage) {
      if (percentage >= 80) return '#52C41A'
      if (percentage >= 60) return '#FAAD14'
      return '#F5222D'
    },
    getAlertLevelType(level) {
      const types = { high: 'danger', medium: 'warning', low: 'info' }
      return types[level] || 'info'
    },
    getAlertLevelText(level) {
      const texts = { high: '高风险', medium: '中风险', low: '低风险' }
      return texts[level] || level
    },
    getAlertStatusType(status) {
      const types = { pending: 'warning', processing: 'primary', resolved: 'success' }
      return types[status] || 'info'
    },
    getAlertStatusText(status) {
      const texts = { pending: '待处理', processing: '处理中', resolved: '已处理' }
      return texts[status] || status
    }
  }
}
</script>

<style scoped>
.strategy-effect-monitor-container {
  padding: 0;
}

.monitor-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1D2129;
}

.card-title i {
  margin-right: 8px;
  color: #409EFF;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.monitor-overview {
  margin-bottom: 20px;
}

.kpi-card {
  margin-bottom: 20px;
}

.kpi-content {
  display: flex;
  align-items: center;
}

.kpi-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #fff;
  margin-right: 16px;
}

.kpi-icon.success {
  background: linear-gradient(135deg, #52C41A 0%, #73D13D 100%);
}

.kpi-icon.warning {
  background: linear-gradient(135deg, #FAAD14 0%, #FFC53D 100%);
}

.kpi-icon.primary {
  background: linear-gradient(135deg, #409EFF 0%, #69C0FF 100%);
}

.kpi-icon.info {
  background: linear-gradient(135deg, #722ED1 0%, #9254DE 100%);
}

.kpi-value {
  font-size: 28px;
  font-weight: 700;
  color: #1D2129;
  line-height: 1.2;
}

.kpi-label {
  font-size: 12px;
  color: #86909C;
  margin-top: 4px;
}

.monitor-tabs {
  margin-top: 20px;
}

.realtime-panel,
.alerts-panel,
.comparison-panel,
.trend-panel {
  padding: 10px 0;
}

.chart-card,
.status-card,
.filter-card,
.comparison-settings,
.trend-stats-card,
.prediction-card,
.comparison-chart-card,
.winner-card {
  margin-bottom: 20px;
}

.chart-container {
  height: 300px;
  width: 100%;
}

.status-list {
  max-height: 400px;
  overflow-y: auto;
}

.status-item {
  padding: 15px;
  border-bottom: 1px solid #F5F7FA;
}

.status-item:last-child {
  border-bottom: none;
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.status-name {
  font-weight: 600;
  color: #1D2129;
}

.status-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 12px;
  color: #86909C;
}

.status-footer i {
  margin-right: 4px;
}

.filter-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}

.text-danger {
  color: #F5222D;
}

.empty-comparison {
  text-align: center;
  padding: 60px 20px;
  background: #F5F7FA;
  border-radius: 8px;
}

.empty-icon {
  font-size: 64px;
  color: #C9CDD4;
  margin-bottom: 20px;
}

.empty-text h4 {
  margin: 0 0 10px;
  color: #1D2129;
}

.empty-text p {
  margin: 0;
  color: #86909C;
}

.settings-row {
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
}

.vs-text {
  font-weight: 700;
  color: #409EFF;
  font-size: 18px;
}

.strategy-card {
  margin-bottom: 20px;
}

.strategy-name {
  font-weight: 600;
  color: #1D2129;
}

.strategy-metrics {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.metric-item {
  text-align: center;
  padding: 15px;
  background: #F5F7FA;
  border-radius: 8px;
}

.metric-label {
  font-size: 12px;
  color: #86909C;
  margin-bottom: 8px;
}

.metric-value {
  font-size: 24px;
  font-weight: 700;
  color: #409EFF;
}

.winner-content {
  display: flex;
  align-items: center;
  padding: 20px;
}

.winner-badge {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #FAAD14 0%, #FFC53D 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: #fff;
  margin-right: 20px;
}

.winner-text h4 {
  margin: 0 0 8px;
  color: #1D2129;
}

.winner-text p {
  margin: 0;
  color: #4E5969;
}

.trend-stats {
  padding: 10px 0;
}

.trend-stat-item {
  padding: 20px;
  background: #F5F7FA;
  border-radius: 8px;
  margin-bottom: 15px;
}

.trend-stat-item:last-child {
  margin-bottom: 0;
}

.trend-stat-label {
  font-size: 12px;
  color: #86909C;
  margin-bottom: 8px;
}

.trend-stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #409EFF;
  line-height: 1.2;
}

.trend-stat-change {
  font-size: 12px;
  color: #86909C;
  margin-top: 8px;
}

.trend-stat-change.positive {
  color: #52C41A;
}

.trend-stat-change.negative {
  color: #F5222D;
}

.trend-stat-date {
  font-size: 12px;
  color: #86909C;
  margin-top: 8px;
}

.prediction-content {
  padding: 20px 0;
}

.prediction-item {
  text-align: center;
  padding: 20px;
  background: #F5F7FA;
  border-radius: 8px;
  height: 100%;
}

.prediction-label {
  font-size: 12px;
  color: #86909C;
  margin-bottom: 12px;
}

.prediction-value {
  font-size: 28px;
  font-weight: 700;
  color: #409EFF;
  margin-bottom: 12px;
}

.prediction-suggestion {
  font-size: 14px;
  color: #4E5969;
  line-height: 1.5;
}

.prediction-confidence {
  font-size: 12px;
  color: #86909C;
  margin-top: 8px;
}

@media (max-width: 768px) {
  .kpi-content {
    flex-direction: column;
    text-align: center;
  }

  .kpi-icon {
    margin-right: 0;
    margin-bottom: 12px;
  }

  .strategy-metrics {
    grid-template-columns: 1fr;
  }

  .settings-row {
    flex-direction: column;
    align-items: stretch;
  }

  .vs-text {
    text-align: center;
    margin: 10px 0;
  }
}
</style>
