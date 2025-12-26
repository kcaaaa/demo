<template>
  <div class="strategy-evaluation-report-container">
    <el-card shadow="hover" class="report-card">
      <div slot="header" class="card-header">
        <h3 class="card-title">
          <i class="fa fa-file-text-o"></i> 策略评估报告
        </h3>
        <div class="header-actions">
          <el-select v-model="selectedStrategy" placeholder="选择策略" size="small" style="width: 200px;">
            <el-option
              v-for="strategy in strategyList"
              :key="strategy.id"
              :label="strategy.name"
              :value="strategy.id">
            </el-option>
          </el-select>
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            size="small"
            style="width: 240px;">
          </el-date-picker>
          <el-button type="primary" size="small" @click="handleGenerateReport">
            <i class="fa fa-bar-chart"></i> 生成报告
          </el-button>
          <el-button size="small" @click="handleExportReport">
            <i class="fa fa-file-pdf-o"></i> 导出PDF
          </el-button>
        </div>
      </div>

      <div v-if="reportGenerated" class="report-content">
        <div class="report-overview">
          <el-row :gutter="20">
            <el-col :xs="24" :sm="12" :lg="6">
              <el-card shadow="hover" class="kpi-card">
                <div class="kpi-content">
                  <div class="kpi-icon success">
                    <i class="fa fa-leaf"></i>
                  </div>
                  <div class="kpi-info">
                    <div class="kpi-value">{{ reportOverview.energySavings }}%</div>
                    <div class="kpi-label">节能率</div>
                  </div>
                </div>
              </el-card>
            </el-col>
            <el-col :xs="24" :sm="12" :lg="6">
              <el-card shadow="hover" class="kpi-card">
                <div class="kpi-content">
                  <div class="kpi-icon primary">
                    <i class="fa fa-yen"></i>
                  </div>
                  <div class="kpi-info">
                    <div class="kpi-value">¥{{ formatNumber(reportOverview.costSavings) }}</div>
                    <div class="kpi-label">节约成本</div>
                  </div>
                </div>
              </el-card>
            </el-col>
            <el-col :xs="24" :sm="12" :lg="6">
              <el-card shadow="hover" class="kpi-card">
                <div class="kpi-content">
                  <div class="kpi-icon warning">
                    <i class="fa fa-leaf"></i>
                  </div>
                  <div class="kpi-info">
                    <div class="kpi-value">{{ reportOverview.co2Reduction }}吨</div>
                    <div class="kpi-label">减排CO₂</div>
                  </div>
                </div>
              </el-card>
            </el-col>
            <el-col :xs="24" :sm="12" :lg="6">
              <el-card shadow="hover" class="kpi-card">
                <div class="kpi-content">
                  <div class="kpi-icon info">
                    <i class="fa fa-clock-o"></i>
                  </div>
                  <div class="kpi-info">
                    <div class="kpi-value">{{ reportOverview.roi }}个月</div>
                    <div class="kpi-label">投资回报期</div>
                  </div>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>

        <el-tabs v-model="activeTab" type="card" class="report-tabs">
          <el-tab-pane label="执行摘要" name="summary">
            <div class="summary-panel">
              <el-card shadow="hover">
                <div slot="header" class="card-header">
                  <span><i class="fa fa-info-circle"></i> 报告概述</span>
                </div>
                <div class="summary-content">
                  <div class="summary-item">
                    <span class="summary-label">评估策略</span>
                    <span class="summary-value">{{ currentStrategyName }}</span>
                  </div>
                  <div class="summary-item">
                    <span class="summary-label">评估周期</span>
                    <span class="summary-value">{{ formatDate(dateRange[0]) }} 至 {{ formatDate(dateRange[1]) }}</span>
                  </div>
                  <div class="summary-item">
                    <span class="summary-label">生成时间</span>
                    <span class="summary-value">{{ new Date().toLocaleString() }}</span>
                  </div>
                  <div class="summary-item">
                    <span class="summary-label">报告版本</span>
                    <span class="summary-value">V1.0</span>
                  </div>
                </div>
              </el-card>

              <el-card shadow="hover" class="conclusion-card">
                <div slot="header" class="card-header">
                  <span><i class="fa fa-check-circle"></i> 评估结论</span>
                </div>
                <div class="conclusion-content">
                  <el-alert
                    :title="evaluationConclusion.title"
                    :type="evaluationConclusion.type"
                    :description="evaluationConclusion.description"
                    show-icon
                    :closable="false"
                    class="conclusion-alert">
                  </el-alert>
                  <div class="conclusion-details">
                    <div v-for="(item, index) in evaluationConclusion.points" :key="index" class="conclusion-point">
                      <i :class="['fa', item.positive ? 'fa-thumbs-up' : 'fa-exclamation-circle', item.positive ? 'positive' : 'warning']"></i>
                      <span>{{ item.text }}</span>
                    </div>
                  </div>
                </div>
              </el-card>

              <el-card shadow="hover">
                <div slot="header" class="card-header">
                  <span><i class="fa fa-star"></i> 关键指标摘要</span>
                </div>
                <el-table :data="keyMetricsSummary" stripe style="width: 100%">
                  <el-table-column prop="metric" label="指标" width="180"></el-table-column>
                  <el-table-column prop="baseline" label="基准值" width="120">
                    <template slot-scope="scope">
                      {{ scope.row.baseline }}{{ scope.row.unit }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="actual" label="实际值" width="120">
                    <template slot-scope="scope">
                      {{ scope.row.actual }}{{ scope.row.unit }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="change" label="变化幅度">
                    <template slot-scope="scope">
                      <span :class="scope.row.change >= 0 ? 'positive-change' : 'negative-change'">
                        {{ scope.row.change >= 0 ? '+' : '' }}{{ scope.row.change }}%
                      </span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="rating" label="评级" width="100">
                    <template slot-scope="scope">
                      <el-tag :type="getRatingType(scope.row.rating)" size="small">{{ scope.row.rating }}</el-tag>
                    </template>
                  </el-table-column>
                </el-table>
              </el-card>
            </div>
          </el-tab-pane>

          <el-tab-pane label="节能分析" name="energy">
            <div class="energy-panel">
              <el-row :gutter="20">
                <el-col :xs="24" :lg="12">
                  <el-card shadow="hover">
                    <div slot="header" class="card-header">
                      <span><i class="fa fa-bar-chart"></i> 能耗对比趋势</span>
                    </div>
                    <div ref="energyTrendRef" class="chart-container"></div>
                  </el-card>
                </el-col>
                <el-col :xs="24" :lg="12">
                  <el-card shadow="hover">
                    <div slot="header" class="card-header">
                      <span><i class="fa fa-pie-chart"></i> 节能贡献分析</span>
                    </div>
                    <div ref="energyContributionRef" class="chart-container"></div>
                  </el-card>
                </el-col>
              </el-row>

              <el-card shadow="hover" class="energy-detail-card">
                <div slot="header" class="card-header">
                  <span><i class="fa fa-table"></i> 分项能耗分析</span>
                </div>
                <el-table :data="energyDetailData" stripe style="width: 100%">
                  <el-table-column prop="category" label="能耗类别" width="120"></el-table-column>
                  <el-table-column prop="baseline" label="基准能耗(kWh)" width="150">
                    <template slot-scope="scope">
                      {{ formatNumber(scope.row.baseline) }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="actual" label="实际能耗(kWh)" width="150">
                    <template slot-scope="scope">
                      {{ formatNumber(scope.row.actual) }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="savings" label="节约量(kWh)">
                    <template slot-scope="scope">
                      <span class="positive-change">{{ formatNumber(scope.row.savings) }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="savingsRate" label="节能率">
                    <template slot-scope="scope">
                      <span class="positive-change">{{ scope.row.savingsRate }}%</span>
                    </template>
                  </el-table-column>
                </el-table>
              </el-card>
            </div>
          </el-tab-pane>

          <el-tab-pane label="成本效益" name="cost">
            <div class="cost-panel">
              <el-row :gutter="20">
                <el-col :xs="24" :lg="12">
                  <el-card shadow="hover">
                    <div slot="header" class="card-header">
                      <span><i class="fa fa-line-chart"></i> 投资回报曲线</span>
                    </div>
                    <div ref="roiCurveRef" class="chart-container"></div>
                  </el-card>
                </el-col>
                <el-col :xs="24" :lg="12">
                  <el-card shadow="hover">
                    <div slot="header" class="card-header">
                      <span><i class="fa fa-money"></i> 成本分布</span>
                    </div>
                    <div ref="costDistributionRef" class="chart-container"></div>
                  </el-card>
                </el-col>
              </el-row>

              <el-card shadow="hover" class="cost-summary-card">
                <div slot="header" class="card-header">
                  <span><i class="fa fa-calculator"></i> 成本效益汇总</span>
                </div>
                <div class="cost-summary">
                  <el-row :gutter="20">
                    <el-col :xs="24" :md="8">
                      <div class="cost-item">
                        <div class="cost-label">总投资成本</div>
                        <div class="cost-value">¥{{ formatNumber(costSummary.totalInvestment) }}</div>
                      </div>
                    </el-col>
                    <el-col :xs="24" :md="8">
                      <div class="cost-item">
                        <div class="cost-label">年度节约</div>
                        <div class="cost-value positive">¥{{ formatNumber(costSummary.annualSavings) }}</div>
                      </div>
                    </el-col>
                    <el-col :xs="24" :md="8">
                      <div class="cost-item">
                        <div class="cost-label">投资回报期</div>
                        <div class="cost-value">{{ costSummary.paybackPeriod }}个月</div>
                      </div>
                    </el-col>
                    <el-col :xs="24" :md="8">
                      <div class="cost-item">
                        <div class="cost-label">5年净收益</div>
                        <div class="cost-value positive">¥{{ formatNumber(costSummary.fiveYearNetBenefit) }}</div>
                      </div>
                    </el-col>
                    <el-col :xs="24" :md="8">
                      <div class="cost-item">
                        <div class="cost-label">内部收益率</div>
                        <div class="cost-value">{{ costSummary.irr }}%</div>
                      </div>
                    </el-col>
                    <el-col :xs="24" :md="8">
                      <div class="cost-item">
                        <div class="cost-label">效益成本比</div>
                        <div class="cost-value">{{ costSummary.bcr }}</div>
                      </div>
                    </el-col>
                  </el-row>
                </div>
              </el-card>
            </div>
          </el-tab-pane>

          <el-tab-pane label="环境效益" name="environment">
            <div class="environment-panel">
              <el-row :gutter="20">
                <el-col :xs="24" :lg="12">
                  <el-card shadow="hover">
                    <div slot="header" class="card-header">
                      <span><i class="fa fa-cloud"></i> 碳排放对比</span>
                    </div>
                    <div ref="carbonEmissionRef" class="chart-container"></div>
                  </el-card>
                </el-col>
                <el-col :xs="24" :lg="12">
                  <el-card shadow="hover">
                    <div slot="header" class="card-header">
                      <span><i class="fa fa-recycle"></i> 能源结构优化</span>
                    </div>
                    <div ref="energyStructureRef" class="chart-container"></div>
                  </el-card>
                </el-col>
              </el-row>

              <el-card shadow="hover" class="environment-summary-card">
                <div slot="header" class="card-header">
                  <span><i class="fa fa-globe"></i> 环境效益汇总</span>
                </div>
                <el-table :data="environmentSummary" stripe style="width: 100%">
                  <el-table-column prop="indicator" label="环境指标" width="180"></el-table-column>
                  <el-table-column prop="baseline" label="基准值" width="150"></el-table-column>
                  <el-table-column prop="actual" label="实际值"></el-table-column>
                  <el-table-column prop="reduction" label="减排量">
                    <template slot-scope="scope">
                      <span class="positive-change">{{ scope.row.reduction }}</span>
                    </template>
                  </el-table-column>
                </el-table>
              </el-card>
            </div>
          </el-tab-pane>

          <el-tab-pane label="对比分析" name="comparison">
            <div class="comparison-panel">
              <el-row :gutter="20">
                <el-col :xs="24" :lg="16">
                  <el-card shadow="hover">
                    <div slot="header" class="card-header">
                      <span><i class="fa fa-bar-chart"></i> 多维度对比</span>
                    </div>
                    <div ref="radarComparisonRef" class="chart-container"></div>
                  </el-card>
                </el-col>
                <el-col :xs="24" :lg="8">
                  <el-card shadow="hover">
                    <div slot="header" class="card-header">
                      <span><i class="fa fa-trophy"></i> 评分结果</span>
                    </div>
                    <div class="score-result">
                      <div class="overall-score">
                        <div class="score-circle">
                          <el-progress type="circle" :percentage="overallScore" :stroke-width="12" :width="140" :color="getScoreColor(overallScore)"></el-progress>
                        </div>
                        <div class="score-label">综合评分</div>
                      </div>
                      <div class="score-breakdown">
                        <div class="score-item" v-for="(item, index) in scoreBreakdown" :key="index">
                          <span class="score-item-name">{{ item.name }}</span>
                          <div class="score-item-bar">
                            <el-progress :percentage="item.score" :show-text="false" :stroke-width="8" :color="getScoreColor(item.score)"></el-progress>
                          </div>
                          <span class="score-item-value">{{ item.score }}分</span>
                        </div>
                      </div>
                    </div>
                  </el-card>
                </el-col>
              </el-row>

              <el-card shadow="hover" class="comparison-table-card">
                <div slot="header" class="card-header">
                  <span><i class="fa fa-columns"></i> 与同类策略对比</span>
                </div>
                <el-table :data="comparisonData" stripe style="width: 100%">
                  <el-table-column prop="strategy" label="策略名称" width="180"></el-table-column>
                  <el-table-column prop="energySavings" label="节能率" width="100">
                    <template slot-scope="scope">
                      <span :class="scope.row.energySavings >= currentStrategyData.energySavings ? 'positive-change' : ''">
                        {{ scope.row.energySavings }}%
                      </span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="costSavings" label="节约成本" width="120">
                    <template slot-scope="scope">
                      ¥{{ formatNumber(scope.row.costSavings) }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="implementationCost" label="实施成本" width="120">
                    <template slot-scope="scope">
                      ¥{{ formatNumber(scope.row.implementationCost) }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="paybackPeriod" label="回报周期" width="100">
                    <template slot-scope="scope">
                      {{ scope.row.paybackPeriod }}个月
                    </template>
                  </el-table-column>
                  <el-table-column prop="complexity" label="复杂度" width="100">
                    <template slot-scope="scope">
                      <el-tag :type="getComplexityType(scope.row.complexity)" size="small">{{ scope.row.complexity }}</el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="rating" label="评级" width="100">
                    <template slot-scope="scope">
                      <el-tag :type="getRatingType(scope.row.rating)" size="small">{{ scope.row.rating }}</el-tag>
                    </template>
                  </el-table-column>
                </el-table>
              </el-card>
            </div>
          </el-tab-pane>

          <el-tab-pane label="建议措施" name="recommendations">
            <div class="recommendations-panel">
              <el-card shadow="hover" class="recommendation-card">
                <div slot="header" class="card-header">
                  <span><i class="fa fa-lightbulb-o"></i> 优化建议</span>
                </div>
                <div class="recommendation-list">
                  <el-collapse accordion>
                    <el-collapse-item v-for="(rec, index) in optimizationRecommendations" :key="index" :title="rec.title">
                      <div class="recommendation-content">
                        <div class="rec-priority">
                          <el-tag :type="getPriorityType(rec.priority)" size="small">{{ getPriorityText(rec.priority) }}</el-tag>
                          <span class="rec-expected-effect">预期效果: {{ rec.expectedEffect }}</span>
                        </div>
                        <div class="rec-description">{{ rec.description }}</div>
                        <div class="rec-implementation">
                          <h5>实施步骤:</h5>
                          <ol>
                            <li v-for="(step, stepIndex) in rec.implementationSteps" :key="stepIndex">{{ step }}</li>
                          </ol>
                        </div>
                        <div class="rec-requirements">
                          <h5>资源需求:</h5>
                          <el-tag v-for="req in rec.requirements" :key="req" type="info" size="small" class="req-tag">{{ req }}</el-tag>
                        </div>
                      </div>
                    </el-collapse-item>
                  </el-collapse>
                </div>
              </el-card>

              <el-card shadow="hover" class="action-plan-card">
                <div slot="header" class="card-header">
                  <span><i class="fa fa-list-ol"></i> 后续行动计划</span>
                </div>
                <el-table :data="actionPlan" stripe style="width: 100%">
                  <el-table-column type="index" label="序号" width="60"></el-table-column>
                  <el-table-column prop="action" label="行动项" width="200"></el-table-column>
                  <el-table-column prop="timeline" label="时间安排" width="150"></el-table-column>
                  <el-table-column prop="owner" label="负责人" width="120"></el-table-column>
                  <el-table-column prop="priority" label="优先级">
                    <template slot-scope="scope">
                      <el-tag :type="getPriorityType(scope.row.priority)" size="small">{{ scope.row.priority }}</el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="status" label="状态" width="100">
                    <template slot-scope="scope">
                      <el-tag :type="getActionStatusType(scope.row.status)" size="small">{{ scope.row.status }}</el-tag>
                    </template>
                  </el-table-column>
                </el-table>
              </el-card>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>

      <div v-else class="empty-state">
        <div class="empty-content">
          <i class="fa fa-file-text-o empty-icon"></i>
          <h3>暂无评估报告</h3>
          <p>请选择策略和时间范围，生成评估报告</p>
          <el-button type="primary" @click="handleGenerateReport">
            <i class="fa fa-bar-chart"></i> 生成报告
          </el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'StrategyEvaluationReport',
  data() {
    return {
      activeTab: 'summary',
      selectedStrategy: 'strategy_001',
      dateRange: [
        new Date(new Date().setDate(new Date().getDate() - 30)),
        new Date()
      ],
      reportGenerated: false,
      strategyList: [
        { id: 'strategy_001', name: '候车大厅智能照明策略' },
        { id: 'strategy_002', name: '站台空调智能调节策略' },
        { id: 'strategy_003', name: '电梯运行优化策略' },
        { id: 'strategy_004', name: '站房通风系统优化策略' },
        { id: 'strategy_005', name: '照明与空调联动策略' }
      ],
      reportOverview: {
        energySavings: 18.5,
        costSavings: 156000,
        co2Reduction: 45.2,
        roi: 14
      },
      currentStrategyData: {
        energySavings: 18.5
      },
      evaluationConclusion: {
        title: '策略实施效果优秀',
        type: 'success',
        description: '该策略在评估周期内表现出色，节能效果显著，投资回报合理，建议继续实施并推广。',
        points: [
          { text: '整体节能率达到18.5%，超过预期目标15%', positive: true },
          { text: '累计节约电费15.6万元，投资回报期约14个月', positive: true },
          { text: '碳排放减少45.2吨，环境效益显著', positive: true },
          { text: '系统运行稳定，用户体验良好', positive: true },
          { text: '建议进一步优化控制算法，提升节能潜力', positive: false }
        ]
      },
      keyMetricsSummary: [
        { metric: '照明能耗', baseline: 85000, actual: 68200, unit: 'kWh', change: -19.8, rating: '优秀' },
        { metric: '空调能耗', baseline: 120000, actual: 99600, unit: 'kWh', change: -17.0, rating: '良好' },
        { metric: '通风能耗', baseline: 35000, actual: 30100, unit: 'kWh', change: -14.0, rating: '良好' },
        { metric: '综合能耗', baseline: 240000, actual: 197900, unit: 'kWh', change: -17.5, rating: '优秀' },
        { metric: '系统可用率', baseline: 99.0, actual: 99.5, unit: '%', change: 0.5, rating: '优秀' },
        { metric: '用户满意度', baseline: 85, actual: 92, unit: '分', change: 8.2, rating: '优秀' }
      ],
      energyDetailData: [
        { category: '照明能耗', baseline: 85000, actual: 68200, savings: 16800, savingsRate: 19.8 },
        { category: '空调能耗', baseline: 120000, actual: 99600, savings: 20400, savingsRate: 17.0 },
        { category: '通风能耗', baseline: 35000, actual: 30100, savings: 4900, savingsRate: 14.0 },
        { category: '电梯能耗', baseline: 28000, actual: 24500, savings: 3500, savingsRate: 12.5 },
        { category: '其他能耗', baseline: 22000, actual: 19500, savings: 2500, savingsRate: 11.4 }
      ],
      costSummary: {
        totalInvestment: 185000,
        annualSavings: 187200,
        paybackPeriod: 14,
        fiveYearNetBenefit: 751000,
        irr: 28.5,
        bcr: 3.2
      },
      environmentSummary: [
        { indicator: 'CO₂排放减少', baseline: '0吨', actual: '45.2吨', reduction: '-45.2吨' },
        { indicator: 'SO₂排放减少', baseline: '0kg', actual: '120kg', reduction: '-120kg' },
        { indicator: '氮氧化物减排', baseline: '0kg', actual: '85kg', reduction: '-85kg' },
        { indicator: '相当于植树', baseline: '0棵', actual: '2480棵', reduction: '+2480棵' }
      ],
      overallScore: 85,
      scoreBreakdown: [
        { name: '节能效果', score: 90 },
        { name: '成本效益', score: 82 },
        { name: '实施难度', score: 78 },
        { name: '环境效益', score: 88 },
        { name: '可持续性', score: 85 }
      ],
      comparisonData: [
        { strategy: '候车大厅智能照明策略', energySavings: 18.5, costSavings: 156000, implementationCost: 185000, paybackPeriod: 14, complexity: '低', rating: '优秀' },
        { strategy: '站台空调智能调节策略', energySavings: 15.2, costSavings: 128000, implementationCost: 220000, paybackPeriod: 18, complexity: '中', rating: '良好' },
        { strategy: '电梯运行优化策略', energySavings: 12.8, costSavings: 85000, implementationCost: 95000, paybackPeriod: 12, complexity: '低', rating: '良好' },
        { strategy: '站房通风系统优化策略', energySavings: 10.5, costSavings: 72000, implementationCost: 150000, paybackPeriod: 22, complexity: '中', rating: '一般' },
        { strategy: '照明与空调联动策略', energySavings: 22.0, costSavings: 185000, implementationCost: 280000, paybackPeriod: 16, complexity: '高', rating: '优秀' }
      ],
      optimizationRecommendations: [
        {
          title: '优化传感器布局，提升数据采集精度',
          priority: 'high',
          expectedEffect: '预计可进一步提升节能效果3-5%',
          description: '当前传感器布局存在部分盲区，建议增加传感器密度，优化位置分布，提高数据采集的准确性和时效性。',
          implementationSteps: [
            '分析现有传感器覆盖情况，识别监测盲区',
            '制定新增传感器部署方案',
            '采购并安装新传感器设备',
            '校准传感器参数，确保数据准确性',
            '更新控制系统算法，利用新增数据'
          ],
          requirements: ['传感器设备', '安装人员', '调试工具', '系统集成']
        },
        {
          title: '引入机器学习算法，优化控制策略',
          priority: 'high',
          expectedEffect: '预计可提升节能效果5-8%',
          description: '当前采用固定规则的控制策略，建议引入机器学习算法，根据历史数据和实时环境自动调整控制参数。',
          implementationSteps: [
            '收集并整理历史运行数据',
            '选择适合的机器学习模型',
            '训练模型并验证效果',
            '逐步部署到生产环境',
            '持续监控和优化模型性能'
          ],
          requirements: ['数据科学家', 'GPU服务器', '数据平台', '模型部署']
        },
        {
          title: '加强设备维护，确保最佳运行状态',
          priority: 'medium',
          expectedEffect: '维持节能效果，减少故障率',
          description: '定期维护可以确保设备始终处于最佳运行状态，避免因设备老化导致的效率下降。',
          implementationSteps: [
            '制定设备维护计划',
            '安排定期巡检和保养',
            '及时更换老化部件',
            '记录维护数据，分析设备状态'
          ],
          requirements: ['维护人员', '备品备件', '维护工具']
        },
        {
          title: '扩展策略覆盖范围',
          priority: 'medium',
          expectedEffect: '扩大节能效果受益范围',
          description: '当前策略主要覆盖候车大厅，建议逐步扩展到站台、办公区等其他区域。',
          implementationSteps: [
            '评估其他区域的节能潜力',
            '制定扩展实施计划',
            '分阶段推进策略部署',
            '监控扩展后的效果'
          ],
          requirements: ['项目资金', '实施团队', '设备采购']
        }
      ],
      actionPlan: [
        { action: '完成传感器盲区分析', timeline: '本周内', owner: '技术部', priority: '高', status: '未开始' },
        { action: '采购新增传感器设备', timeline: '2周内', owner: '采购部', priority: '高', status: '未开始' },
        { action: '部署机器学习环境', timeline: '1个月内', owner: '技术部', priority: '中', status: '未开始' },
        { action: '制定设备维护计划', timeline: '本周内', owner: '运维部', priority: '中', status: '未开始' },
        { action: '评估其他区域扩展方案', timeline: '2周内', owner: '策划部', priority: '低', status: '未开始' }
      ],
      energyTrendChart: null,
      energyContributionChart: null,
      roiCurveChart: null,
      costDistributionChart: null,
      carbonEmissionChart: null,
      energyStructureChart: null,
      radarComparisonChart: null
    }
  },
  mounted() {
    this.initCharts()
    window.addEventListener('resize', this.handleResize)
  },
  computed: {
    currentStrategyName() {
      const strategy = this.strategyList.find(s => s.id === this.selectedStrategy)
      return strategy ? strategy.name : ''
    }
  },
  mounted() {
    if (this.reportGenerated) {
      this.initCharts()
    }
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
      if (this.energyTrendChart) this.energyTrendChart.resize()
      if (this.energyContributionChart) this.energyContributionChart.resize()
      if (this.roiCurveChart) this.roiCurveChart.resize()
      if (this.costDistributionChart) this.costDistributionChart.resize()
      if (this.carbonEmissionChart) this.carbonEmissionChart.resize()
      if (this.energyStructureChart) this.energyStructureChart.resize()
      if (this.radarComparisonChart) this.radarComparisonChart.resize()
    },
    disposeCharts() {
      if (this.energyTrendChart) {
        this.energyTrendChart.dispose()
        this.energyTrendChart = null
      }
      if (this.energyContributionChart) {
        this.energyContributionChart.dispose()
        this.energyContributionChart = null
      }
      if (this.roiCurveChart) {
        this.roiCurveChart.dispose()
        this.roiCurveChart = null
      }
      if (this.costDistributionChart) {
        this.costDistributionChart.dispose()
        this.costDistributionChart = null
      }
      if (this.carbonEmissionChart) {
        this.carbonEmissionChart.dispose()
        this.carbonEmissionChart = null
      }
      if (this.energyStructureChart) {
        this.energyStructureChart.dispose()
        this.energyStructureChart = null
      }
      if (this.radarComparisonChart) {
        this.radarComparisonChart.dispose()
        this.radarComparisonChart = null
      }
    },
    initCharts() {
      this.disposeCharts()
      this.$nextTick(() => {
        this.initEnergyTrendChart()
        this.initEnergyContributionChart()
        this.initROICurveChart()
        this.initCostDistributionChart()
        this.initCarbonEmissionChart()
        this.initEnergyStructureChart()
        this.initRadarComparisonChart()
      })
    },
    initEnergyTrendChart() {
      const chartDom = this.$refs.energyTrendRef
      if (!chartDom) return
      this.energyTrendChart = echarts.init(chartDom)
      const days = []
      const baseline = []
      const actual = []
      for (let i = 1; i <= 30; i++) {
        days.push(`${i}日`)
        baseline.push(8000 + Math.random() * 500)
        actual.push(6500 + Math.random() * 400)
      }
      const option = {
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['基准能耗', '实际能耗'],
          bottom: 0
        },
        grid: {
          left: '60px',
          right: '20px',
          top: '40px',
          bottom: '50px'
        },
        xAxis: {
          type: 'category',
          data: days
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
            type: 'line',
            data: baseline,
            smooth: true,
            lineStyle: { color: '#909399' },
            itemStyle: { color: '#909399' }
          },
          {
            name: '实际能耗',
            type: 'line',
            data: actual,
            smooth: true,
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [{
                  offset: 0, color: 'rgba(103, 194, 58, 0.3)'
                }, {
                  offset: 1, color: 'rgba(103, 194, 58, 0.05)'
                }]
              }
            },
            lineStyle: { color: '#67C23A' },
            itemStyle: { color: '#67C23A' }
          }
        ]
      }
      this.energyTrendChart.setOption(option)
    },
    initEnergyContributionChart() {
      const chartDom = this.$refs.energyContributionRef
      if (!chartDom) return
      this.energyContributionChart = echarts.init(chartDom)
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
          center: ['40%', '50%'],
          avoidLabelOverlap: false,
          label: { show: false },
          data: [
            { value: 16800, name: '照明节能', itemStyle: { color: '#67C23A' } },
            { value: 20400, name: '空调节能', itemStyle: { color: '#409EFF' } },
            { value: 4900, name: '通风节能', itemStyle: { color: '#E6A23C' } },
            { value: 3500, name: '电梯节能', itemStyle: { color: '#909399' } },
            { value: 2500, name: '其他节能', itemStyle: { color: '#F56C6C' } }
          ]
        }]
      }
      this.energyContributionChart.setOption(option)
    },
    initROICurveChart() {
      const chartDom = this.$refs.roiCurveRef
      if (!chartDom) return
      this.roiCurveChart = echarts.init(chartDom)
      const months = []
      const cumulativeSavings = []
      const cumulativeCost = []
      let savings = 0
      let cost = 185000
      for (let i = 0; i <= 24; i++) {
        months.push(`第${i}个月`)
        if (i === 0) {
          cumulativeSavings.push(0)
          cumulativeCost.push(cost)
        } else {
          savings += 15600
          cumulativeSavings.push(savings)
          cumulativeCost.push(cost)
        }
      }
      const option = {
        tooltip: { trigger: 'axis' },
        legend: { data: ['累计节约', '累计投资'], bottom: 0 },
        grid: {
          left: '70px',
          right: '20px',
          top: '40px',
          bottom: '50px'
        },
        xAxis: {
          type: 'category',
          data: months
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            formatter: '¥{value}'
          }
        },
        series: [
          {
            name: '累计节约',
            type: 'line',
            data: cumulativeSavings,
            smooth: true,
            lineStyle: { color: '#67C23A' },
            itemStyle: { color: '#67C23A' },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [{
                  offset: 0, color: 'rgba(103, 194, 58, 0.3)'
                }, {
                  offset: 1, color: 'rgba(103, 194, 58, 0.05)'
                }]
              }
            }
          },
          {
            name: '累计投资',
            type: 'line',
            data: cumulativeCost,
            smooth: true,
            lineStyle: { color: '#F56C6C' },
            itemStyle: { color: '#F56C6C' }
          }
        ]
      }
      this.roiCurveChart.setOption(option)
    },
    initCostDistributionChart() {
      const chartDom = this.$refs.costDistributionRef
      if (!chartDom) return
      this.costDistributionChart = echarts.init(chartDom)
      const option = {
        tooltip: { trigger: 'item', formatter: '{b}: ¥{c} ({d}%)' },
        series: [{
          type: 'pie',
          radius: ['40%', '70%'],
          data: [
            { value: 95000, name: '硬件设备', itemStyle: { color: '#409EFF' } },
            { value: 45000, name: '软件开发', itemStyle: { color: '#67C23A' } },
            { value: 30000, name: '安装调试', itemStyle: { color: '#E6A23C' } },
            { value: 15000, name: '培训服务', itemStyle: { color: '#909399' } }
          ]
        }]
      }
      this.costDistributionChart.setOption(option)
    },
    initCarbonEmissionChart() {
      const chartDom = this.$refs.carbonEmissionRef
      if (!chartDom) return
      this.carbonEmissionChart = echarts.init(chartDom)
      const option = {
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        legend: { data: ['基准排放', '实际排放'], bottom: 0 },
        grid: {
          left: '60px',
          right: '20px',
          top: '40px',
          bottom: '50px'
        },
        xAxis: {
          type: 'category',
          data: ['照明', '空调', '通风', '电梯', '其他']
        },
        yAxis: {
          type: 'value',
          axisLabel: { formatter: '{value} 吨' }
        },
        series: [
          {
            name: '基准排放',
            type: 'bar',
            data: [42.5, 60.0, 17.5, 14.0, 11.0],
            itemStyle: { color: '#909399' }
          },
          {
            name: '实际排放',
            type: 'bar',
            data: [34.1, 49.8, 15.1, 12.3, 9.8],
            itemStyle: { color: '#67C23A' }
          }
        ]
      }
      this.carbonEmissionChart.setOption(option)
    },
    initEnergyStructureChart() {
      const chartDom = this.$refs.energyStructureRef
      if (!chartDom) return
      this.energyStructureChart = echarts.init(chartDom)
      const option = {
        tooltip: { trigger: 'item', formatter: '{b}: {d}%' },
        legend: { orient: 'vertical', right: '5%', top: 'center' },
        series: [{
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['40%', '50%'],
          data: [
            { value: 45, name: '清洁能源', itemStyle: { color: '#67C23A' } },
            { value: 35, name: '水电', itemStyle: { color: '#409EFF' } },
            { value: 20, name: '其他', itemStyle: { color: '#E6A23C' } }
          ]
        }]
      }
      this.energyStructureChart.setOption(option)
    },
    initRadarComparisonChart() {
      const chartDom = this.$refs.radarComparisonRef
      if (!chartDom) return
      this.radarComparisonChart = echarts.init(chartDom)
      const option = {
        tooltip: {},
        legend: {
          data: ['当前策略', '行业平均'],
          bottom: 0
        },
        radar: {
          indicator: [
            { name: '节能效果', max: 100 },
            { name: '成本效益', max: 100 },
            { name: '实施难度', max: 100 },
            { name: '环境效益', max: 100 },
            { name: '可持续性', max: 100 },
            { name: '用户满意度', max: 100 }
          ]
        },
        series: [{
          type: 'radar',
          data: [
            {
              value: [90, 82, 78, 88, 85, 92],
              name: '当前策略',
              areaStyle: { color: 'rgba(64, 158, 255, 0.3)' },
              lineStyle: { color: '#409EFF' },
              itemStyle: { color: '#409EFF' }
            },
            {
              value: [75, 70, 65, 72, 68, 75],
              name: '行业平均',
              lineStyle: { color: '#909399' },
              itemStyle: { color: '#909399' }
            }
          ]
        }]
      }
      this.radarComparisonChart.setOption(option)
    },
    getRatingType(rating) {
      const types = {
        '优秀': 'success',
        '良好': 'primary',
        '一般': 'warning',
        '较差': 'danger'
      }
      return types[rating] || 'info'
    },
    getScoreColor(score) {
      if (score >= 80) return '#67C23A'
      if (score >= 60) return '#E6A23C'
      return '#F56C6C'
    },
    getComplexityType(complexity) {
      const types = {
        '低': 'success',
        '中': 'warning',
        '高': 'danger'
      }
      return types[complexity] || 'info'
    },
    getPriorityType(priority) {
      const types = {
        'high': 'danger',
        'medium': 'warning',
        'low': 'info'
      }
      return types[priority] || 'info'
    },
    getPriorityText(priority) {
      const texts = {
        'high': '高优先级',
        'medium': '中优先级',
        'low': '低优先级'
      }
      return texts[priority] || '未知'
    },
    getActionStatusType(status) {
      const types = {
        '未开始': 'info',
        '进行中': 'warning',
        '已完成': 'success'
      }
      return types[status] || 'info'
    },
    formatNumber(num) {
      return num.toLocaleString()
    },
    formatDate(date) {
      if (!date) return ''
      return new Date(date).toLocaleDateString('zh-CN')
    },
    handleGenerateReport() {
      this.reportGenerated = true
      this.$nextTick(() => {
        this.initCharts()
      })
      this.$message.success('报告生成成功')
    },
    handleExportReport() {
      this.$message.info('正在导出PDF报告...')
      setTimeout(() => {
        this.$message.success('报告导出成功')
      }, 2000)
    }
  }
}
</script>

<style scoped>
.strategy-evaluation-report-container {
  padding: 20px;
  background-color: #f5f7fa;
}

.report-card {
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
  color: #303133;
}

.card-title i {
  margin-right: 8px;
  color: #409EFF;
}

.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.report-overview {
  margin-bottom: 20px;
}

.kpi-card {
  margin-bottom: 20px;
}

.kpi-content {
  display: flex;
  align-items: center;
  padding: 10px;
}

.kpi-icon {
  width: 56px;
  height: 56px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 24px;
}

.kpi-icon.primary {
  background: linear-gradient(135deg, #409EFF 0%, #66b1ff 100%);
  color: #fff;
}

.kpi-icon.success {
  background: linear-gradient(135deg, #67C23A 0%, #85ce61 100%);
  color: #fff;
}

.kpi-icon.warning {
  background: linear-gradient(135deg, #E6A23C 0%, #f3c36b 100%);
  color: #fff;
}

.kpi-icon.info {
  background: linear-gradient(135deg, #909399 0%, #b3b8bd 100%);
  color: #fff;
}

.kpi-info {
  flex: 1;
}

.kpi-value {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  line-height: 1.2;
}

.kpi-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

.report-tabs {
  margin-top: 20px;
}

.summary-panel {
  padding: 10px;
}

.summary-content {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 6px;
}

.summary-label {
  color: #606266;
}

.summary-value {
  font-weight: 600;
  color: #303133;
}

.conclusion-card {
  margin-top: 20px;
}

.conclusion-alert {
  margin-bottom: 15px;
}

.conclusion-details {
  padding: 10px;
}

.conclusion-point {
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #ebeef5;
}

.conclusion-point:last-child {
  border-bottom: none;
}

.conclusion-point i {
  margin-right: 10px;
  font-size: 16px;
}

.conclusion-point i.positive {
  color: #67C23A;
}

.conclusion-point i.warning {
  color: #E6A23C;
}

.energy-panel,
.cost-panel,
.environment-panel,
.comparison-panel,
.recommendations-panel {
  padding: 10px;
}

.chart-container {
  height: 300px;
}

.energy-detail-card,
.cost-summary-card,
.environment-summary-card,
.comparison-table-card,
.recommendation-card,
.action-plan-card {
  margin-top: 20px;
}

.positive-change {
  color: #67C23A;
  font-weight: 600;
}

.negative-change {
  color: #F56C6C;
  font-weight: 600;
}

.cost-summary {
  padding: 20px;
}

.cost-item {
  text-align: center;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 8px;
  margin-bottom: 15px;
}

.cost-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 10px;
}

.cost-value {
  font-size: 24px;
  font-weight: 700;
  color: #303133;
}

.cost-value.positive {
  color: #67C23A;
}

.score-result {
  padding: 20px;
}

.overall-score {
  text-align: center;
  margin-bottom: 30px;
}

.score-circle {
  margin-bottom: 10px;
}

.score-label {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.score-breakdown {
  padding: 0 10px;
}

.score-item {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.score-item-name {
  width: 80px;
  font-size: 14px;
  color: #606266;
}

.score-item-bar {
  flex: 1;
  margin: 0 10px;
}

.score-item-value {
  width: 60px;
  text-align: right;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.recommendation-list {
  padding: 10px;
}

.rec-priority {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 10px;
}

.rec-expected-effect {
  font-size: 14px;
  color: #67C23A;
}

.rec-description {
  color: #606266;
  line-height: 1.6;
  margin-bottom: 15px;
}

.rec-implementation,
.rec-requirements {
  margin-top: 15px;
}

.rec-implementation h5,
.rec-requirements h5 {
  margin: 10px 0;
  font-size: 14px;
  color: #303133;
}

.rec-implementation ol {
  padding-left: 20px;
  color: #606266;
}

.rec-implementation li {
  margin-bottom: 5px;
  line-height: 1.6;
}

.req-tag {
  margin-right: 8px;
  margin-bottom: 8px;
}

.empty-state {
  padding: 80px 0;
  text-align: center;
}

.empty-content {
  max-width: 400px;
  margin: 0 auto;
}

.empty-icon {
  font-size: 64px;
  color: #C0C4CC;
  margin-bottom: 20px;
}

.empty-content h3 {
  margin: 0 0 10px;
  color: #606266;
}

.empty-content p {
  color: #909399;
  margin-bottom: 20px;
}

@media (max-width: 768px) {
  .strategy-evaluation-report-container {
    padding: 10px;
  }

  .header-actions {
    flex-wrap: wrap;
    gap: 8px;
  }

  .summary-content {
    grid-template-columns: 1fr;
  }

  .chart-container {
    height: 250px;
  }
}
</style>
