<template>
  <div class="strategy-recommendation-container">
    <el-card shadow="hover" class="recommendation-card">
      <div slot="header" class="card-header">
        <h3 class="card-title">
          <i class="fa fa-lightbulb-o"></i> 智能策略推荐
        </h3>
        <div class="header-actions">
          <el-button size="small" @click="handleReset">
            <i class="fa fa-refresh"></i> 重置条件
          </el-button>
          <el-button type="primary" size="small" @click="handleGetRecommendation" :loading="recommendationLoading">
            <i class="fa fa-magic"></i> 获取推荐
          </el-button>
        </div>
      </div>

      <div class="recommendation-settings">
        <el-row :gutter="20">
          <el-col :xs="24" :lg="16">
            <el-card shadow="hover" class="settings-card">
              <div slot="header" class="card-header">
                <span><i class="fa fa-sliders"></i> 推荐条件设置</span>
              </div>
              <el-form :model="recommendationForm" label-width="100px" size="small">
                <el-row :gutter="20">
                  <el-col :xs="24" :sm="12">
                    <el-form-item label="车站类型">
                      <el-select v-model="recommendationForm.stationType" placeholder="请选择车站类型" style="width: 100%;">
                        <el-option label="特大型枢纽站" value="hub"></el-option>
                        <el-option label="大型车站" value="large"></el-option>
                        <el-option label="中型车站" value="medium"></el-option>
                        <el-option label="小型车站" value="small"></el-option>
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="12">
                    <el-form-item label="用能特点">
                      <el-select v-model="recommendationForm.energyFeature" placeholder="请选择用能特点" style="width: 100%;">
                        <el-option label="制冷为主" value="cooling"></el-option>
                        <el-option label="采暖为主" value="heating"></el-option>
                        <el-option label="照明为主" value="lighting"></el-option>
                        <el-option label="综合用能" value="comprehensive"></el-option>
                      </el-select>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :xs="24" :sm="12">
                    <el-form-item label="预算范围">
                      <el-select v-model="recommendationForm.budgetRange" placeholder="请选择预算范围" style="width: 100%;">
                        <el-option label="低预算 (50万以下)" value="low"></el-option>
                        <el-option label="中预算 (50-200万)" value="medium"></el-option>
                        <el-option label="高预算 (200-500万)" value="high"></el-option>
                        <el-option label="超高预算 (500万以上)" value="premium"></el-option>
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="12">
                    <el-form-item label="节能目标">
                      <el-select v-model="recommendationForm.savingGoal" placeholder="请选择节能目标" style="width: 100%;">
                        <el-option label="5%-10%" value="low"></el-option>
                        <el-option label="10%-20%" value="medium"></el-option>
                        <el-option label="20%-30%" value="high"></el-option>
                        <el-option label="30%以上" value="premium"></el-option>
                      </el-select>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :xs="24" :sm="12">
                    <el-form-item label="实施周期">
                      <el-select v-model="recommendationForm.implementationCycle" placeholder="请选择实施周期" style="width: 100%;">
                        <el-option label="短期 (1-3个月)" value="short"></el-option>
                        <el-option label="中期 (3-6个月)" value="medium"></el-option>
                        <el-option label="长期 (6-12个月)" value="long"></el-option>
                        <el-option label="持续优化" value="continuous"></el-option>
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="12">
                    <el-form-item label="设备状况">
                      <el-select v-model="recommendationForm.equipmentStatus" placeholder="请选择设备状况" style="width: 100%;">
                        <el-option label="老化严重" value="poor"></el-option>
                        <el-option label="一般" value="normal"></el-option>
                        <el-option label="良好" value="good"></el-option>
                        <el-option label="全新/近期更换" value="excellent"></el-option>
                      </el-select>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :xs="24" :sm="12">
                    <el-form-item label="地区气候">
                      <el-select v-model="recommendationForm.climateZone" placeholder="请选择地区气候" style="width: 100%;">
                        <el-option label="严寒地区" value="severe-cold"></el-option>
                        <el-option label="寒冷地区" value="cold"></el-option>
                        <el-option label="夏热冬冷" value="hot-summer-cold-winter"></el-option>
                        <el-option label="夏热冬暖" value="hot-summer-warm-winter"></el-option>
                        <el-option label="温和地区" value="temperate"></el-option>
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="12">
                    <el-form-item label="客流量">
                      <el-select v-model="recommendationForm.passengerFlow" placeholder="请选择客流量等级" style="width: 100%;">
                        <el-option label="日均1万以下" value="low"></el-option>
                        <el-option label="日均1-5万" value="medium"></el-option>
                        <el-option label="日均5-10万" value="high"></el-option>
                        <el-option label="日均10万以上" value="premium"></el-option>
                      </el-select>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-form-item label="重点关注">
                  <el-checkbox-group v-model="recommendationForm.priorities">
                    <el-checkbox label="照明节能">照明节能</el-checkbox>
                    <el-checkbox label="空调系统">空调系统</el-checkbox>
                    <el-checkbox label="电梯系统">电梯系统</el-checkbox>
                    <el-checkbox label="给排水">给排水</el-checkbox>
                    <el-checkbox label="供电系统">供电系统</el-checkbox>
                    <el-checkbox label="可再生能源">可再生能源</el-checkbox>
                  </el-checkbox-group>
                </el-form-item>
              </el-form>
            </el-card>
          </el-col>
          <el-col :xs="24" :lg="8">
            <el-card shadow="hover" class="quick-stats-card">
              <div slot="header" class="card-header">
                <span><i class="fa fa-bar-chart"></i> 推荐统计</span>
              </div>
              <div class="stats-content">
                <div class="stat-item">
                  <div class="stat-value">{{ recommendationStats.totalStrategies }}</div>
                  <div class="stat-label">可用策略</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">{{ recommendationStats.recommendedCount }}</div>
                  <div class="stat-label">推荐数量</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">{{ recommendationStats.avgSavings }}%</div>
                  <div class="stat-label">平均节能率</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">¥{{ recommendationStats.avgInvestment }}</div>
                  <div class="stat-label">平均投资(万)</div>
                </div>
              </div>
              <div class="filter-section">
                <div class="filter-label">筛选推荐结果</div>
                <el-select v-model="recommendationFilter" placeholder="筛选条件" size="small" style="width: 100%;">
                  <el-option label="全部推荐" value="all"></el-option>
                  <el-option label="高置信度优先" value="confidence"></el-option>
                  <el-option label="高节能率优先" value="savings"></el-option>
                  <el-option label="低成本优先" value="cost"></el-option>
                  <el-option label="快速回报优先" value="roi"></el-option>
                </el-select>
              </div>
              <div class="match-section">
                <div class="match-label">推荐匹配度</div>
                <el-slider
                  v-model="matchThreshold"
                  :min="50"
                  :max="100"
                  :marks="matchMarks"
                  :step="5"
                  @change="handleMatchThresholdChange"
                ></el-slider>
                <div class="match-value">{{ matchThreshold }}% 以上</div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <div v-if="recommendationResult.length > 0" class="recommendation-results">
        <div class="results-header">
          <h4 class="results-title">
            <i class="fa fa-check-circle"></i> 推荐结果 ({{ filteredRecommendations.length }}个)
          </h4>
          <div class="results-actions">
            <el-button-group size="small">
              <el-button :type="viewMode === 'card' ? 'primary' : ''" @click="viewMode = 'card'">
                <i class="fa fa-th-large"></i> 卡片
              </el-button>
              <el-button :type="viewMode === 'list' ? 'primary' : ''" @click="viewMode = 'list'">
                <i class="fa fa-list"></i> 列表
              </el-button>
              <el-button :type="viewMode === 'comparison' ? 'primary' : ''" @click="viewMode = 'comparison'">
                <i class="fa fa-columns"></i> 对比
              </el-button>
            </el-button-group>
            <el-button size="small" @click="handleExportRecommendations">
              <i class="fa fa-download"></i> 导出推荐
            </el-button>
          </div>
        </div>

        <div v-if="viewMode === 'card'" class="results-cards">
          <el-row :gutter="20">
            <el-col
              v-for="strategy in filteredRecommendations"
              :key="strategy.id"
              :xs="24"
              :sm="12"
              :lg="8"
              :xl="6"
            >
              <el-card
                shadow="hover"
                class="strategy-card"
                :class="{ 'recommended': strategy.confidence >= 85 }"
              >
                <div class="card-badge" v-if="strategy.confidence >= 85">
                  <i class="fa fa-star"></i> 强烈推荐
                </div>
                <div class="card-badge secondary" v-else-if="strategy.confidence >= 70">
                  <i class="fa fa-thumbs-up"></i> 推荐
                </div>
                <div class="card-header">
                  <div class="strategy-icon" :style="{ background: strategy.iconBg }">
                    <i :class="['fa', strategy.icon]"></i>
                  </div>
                  <div class="strategy-info">
                    <h4 class="strategy-name">{{ strategy.name }}</h4>
                    <div class="strategy-category">{{ strategy.category }}</div>
                  </div>
                </div>
                <div class="card-body">
                  <div class="strategy-metrics">
                    <div class="metric-row">
                      <span class="metric-label">节能率</span>
                      <span class="metric-value highlight">{{ strategy.savingsRate }}%</span>
                    </div>
                    <div class="metric-row">
                      <span class="metric-label">投资成本</span>
                      <span class="metric-value">¥{{ strategy.investment }}万</span>
                    </div>
                    <div class="metric-row">
                      <span class="metric-label">回收周期</span>
                      <span class="metric-value">{{ strategy.paybackPeriod }}年</span>
                    </div>
                    <div class="metric-row">
                      <span class="metric-label">置信度</span>
                      <el-progress
                        :percentage="strategy.confidence"
                        :color="getConfidenceColor(strategy.confidence)"
                        :stroke-width="8"
                        :show-text="false"
                      ></el-progress>
                    </div>
                  </div>
                  <div class="strategy-match">
                    <div class="match-indicator">
                      <div class="match-bar">
                        <div class="match-fill" :style="{ width: strategy.matchScore + '%' }"></div>
                      </div>
                      <span class="match-text">匹配度 {{ strategy.matchScore }}%</span>
                    </div>
                  </div>
                  <div class="strategy-tags">
                    <el-tag
                      v-for="tag in strategy.tags.slice(0, 3)"
                      :key="tag"
                      size="mini"
                      type="info"
                    >
                      {{ tag }}
                    </el-tag>
                  </div>
                  <div class="strategy-summary">
                    {{ strategy.summary }}
                  </div>
                </div>
                <div class="card-footer">
                  <el-button size="small" @click="handleViewDetail(strategy)">
                    <i class="fa fa-eye"></i> 查看详情
                  </el-button>
                  <el-button type="primary" size="small" @click="handleApplyStrategy(strategy)">
                    <i class="fa fa-check"></i> 应用策略
                  </el-button>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>

        <div v-if="viewMode === 'list'" class="results-list">
          <el-table
            :data="filteredRecommendations"
            stripe
            style="width: 100%"
            row-key="id"
            :default-sort="{ prop: 'matchScore', order: 'descending' }"
          >
            <el-table-column prop="name" label="策略名称" min-width="150">
              <template slot-scope="scope">
                <div class="table-strategy-name">
                  <div class="strategy-icon-small" :style="{ background: scope.row.iconBg }">
                    <i :class="['fa', scope.row.icon]"></i>
                  </div>
                  <span>{{ scope.row.name }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="category" label="策略类型" width="120"></el-table-column>
            <el-table-column prop="savingsRate" label="节能率" width="100">
              <template slot-scope="scope">
                <span class="highlight-text">{{ scope.row.savingsRate }}%</span>
              </template>
            </el-table-column>
            <el-table-column prop="investment" label="投资(万)" width="100">
              <template slot-scope="scope">¥{{ scope.row.investment }}</template>
            </el-table-column>
            <el-table-column prop="paybackPeriod" label="回收期" width="80"></el-table-column>
            <el-table-column prop="confidence" label="置信度" width="150">
              <template slot-scope="scope">
                <el-progress
                  :percentage="scope.row.confidence"
                  :color="getConfidenceColor(scope.row.confidence)"
                  :stroke-width="10"
                  :show-text="false"
                ></el-progress>
              </template>
            </el-table-column>
            <el-table-column prop="matchScore" label="匹配度" width="120" sortable>
              <template slot-scope="scope">
                <el-progress
                  :percentage="scope.row.matchScore"
                  :color="getMatchColor(scope.row.matchScore)"
                  :stroke-width="10"
                  :show-text="false"
                ></el-progress>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200" fixed="right">
              <template slot-scope="scope">
                <el-button size="mini" @click="handleViewDetail(scope.row)">
                  <i class="fa fa-eye"></i> 详情
                </el-button>
                <el-button type="primary" size="mini" @click="handleApplyStrategy(scope.row)">
                  <i class="fa fa-check"></i> 应用
                </el-button>
                <el-button size="mini" @click="handleAddToComparison(scope.row)">
                  <i class="fa fa-plus"></i> 对比
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div v-if="viewMode === 'comparison'" class="results-comparison">
          <el-card shadow="hover">
            <div slot="header" class="card-header">
              <span>策略对比分析</span>
              <el-button
                v-if="comparisonStrategies.length > 0"
                type="text"
                size="small"
                @click="comparisonStrategies = []"
              >
                <i class="fa fa-times"></i> 清除对比
              </el-button>
            </div>
            <div v-if="comparisonStrategies.length === 0" class="comparison-empty">
              <i class="fa fa-columns"></i>
              <p>请从列表中选择至少2个策略进行对比</p>
              <el-button type="primary" size="small" @click="viewMode = 'list'">
                <i class="fa fa-list"></i> 进入列表选择
              </el-button>
            </div>
            <div v-else class="comparison-content">
              <el-table :data="comparisonStrategies" stripe style="width: 100%">
                <el-table-column prop="name" label="策略名称" width="150"></el-table-column>
                <el-table-column label="节能率">
                  <template slot-scope="scope">
                    <span class="highlight-text">{{ scope.row.savingsRate }}%</span>
                  </template>
                </el-table-column>
                <el-table-column label="投资成本">
                  <template slot-scope="scope">¥{{ scope.row.investment }}万</template>
                </el-table-column>
                <el-table-column label="回收周期">
                  <template slot-scope="scope">{{ scope.row.paybackPeriod }}年</template>
                </el-table-column>
                <el-table-column label="置信度">
                  <template slot-scope="scope">
                    <el-progress
                      :percentage="scope.row.confidence"
                      :color="getConfidenceColor(scope.row.confidence)"
                      :stroke-width="15"
                      :show-text="true"
                    ></el-progress>
                  </template>
                </el-table-column>
                <el-table-column label="匹配度">
                  <template slot-scope="scope">
                    <el-progress
                      :percentage="scope.row.matchScore"
                      :color="getMatchColor(scope.row.matchScore)"
                      :stroke-width="15"
                      :show-text="true"
                    ></el-progress>
                  </template>
                </el-table-column>
                <el-table-column label="实施难度">
                  <template slot-scope="scope">
                    <el-rate
                      :value="scope.row.difficulty"
                      :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
                      disabled
                      show-score
                    ></el-rate>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="100">
                  <template slot-scope="scope">
                    <el-button type="primary" size="mini" @click="handleApplyStrategy(scope.row)">
                      应用
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
              <div class="comparison-chart">
                <h4>节能效果对比</h4>
                <div ref="comparisonChart" class="chart"></div>
              </div>
            </div>
          </el-card>
        </div>
      </div>

      <div v-else-if="hasSearched" class="empty-state">
        <i class="fa fa-search"></i>
        <h4>未找到匹配策略</h4>
        <p>请尝试调整推荐条件或降低匹配度阈值</p>
        <el-button type="primary" size="small" @click="handleReset">
          <i class="fa fa-refresh"></i> 重新搜索
        </el-button>
      </div>
    </el-card>

    <el-dialog
      :title="selectedStrategy?.name"
      :visible.sync="detailDialogVisible"
      width="70%"
      top="5vh"
      class="strategy-detail-dialog"
    >
      <div v-if="selectedStrategy" class="strategy-detail">
        <el-row :gutter="20">
          <el-col :xs="24" :lg="16">
            <el-card shadow="hover" class="detail-main-card">
              <div slot="header" class="card-header">
                <span>策略详情</span>
                <div class="detail-badges">
                  <el-tag type="success">节能率 {{ selectedStrategy.savingsRate }}%</el-tag>
                  <el-tag type="warning">置信度 {{ selectedStrategy.confidence }}%</el-tag>
                </div>
              </div>
              <div class="detail-content">
                <div class="detail-section">
                  <h4><i class="fa fa-info-circle"></i> 策略概述</h4>
                  <p>{{ selectedStrategy.fullDescription }}</p>
                </div>
                <div class="detail-section">
                  <h4><i class="fa fa-cog"></i> 实施要点</h4>
                  <ul class="detail-list">
                    <li v-for="(point, index) in selectedStrategy.implementationPoints" :key="index">
                      {{ point }}
                    </li>
                  </ul>
                </div>
                <div class="detail-section">
                  <h4><i class="fa fa-exclamation-triangle"></i> 注意事项</h4>
                  <ul class="detail-list warning">
                    <li v-for="(note, index) in selectedStrategy.notes" :key="index">
                      {{ note }}
                    </li>
                  </ul>
                </div>
                <div class="detail-section">
                  <h4><i class="fa fa-line-chart"></i> 预期效果</h4>
                  <div class="effect-preview">
                    <div class="effect-item">
                      <div class="effect-label">年节电量</div>
                      <div class="effect-value">{{ selectedStrategy.annualSavings }}万kWh</div>
                    </div>
                    <div class="effect-item">
                      <div class="effect-label">年节约成本</div>
                      <div class="effect-value">¥{{ selectedStrategy.annualCostSavings }}万元</div>
                    </div>
                    <div class="effect-item">
                      <div class="effect-label">碳减排</div>
                      <div class="effect-value">{{ selectedStrategy.carbonReduction }}吨CO₂</div>
                    </div>
                  </div>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :xs="24" :lg="8">
            <el-card shadow="hover" class="detail-side-card">
              <div slot="header" class="card-header">
                <span>参数配置</span>
              </div>
              <div class="parameter-config">
                <div class="config-item" v-for="param in selectedStrategy.parameters" :key="param.name">
                  <div class="config-label">{{ param.label }}</div>
                  <el-slider
                    v-model="param.value"
                    :min="param.min"
                    :max="param.max"
                    :step="param.step"
                    :marks="param.marks"
                    :disabled="!param.editable"
                  ></el-slider>
                  <div class="config-value">{{ param.value }}{{ param.unit }}</div>
                </div>
              </div>
            </el-card>
            <el-card shadow="hover" class="detail-side-card">
              <div slot="header" class="card-header">
                <span>应用条件</span>
              </div>
              <div class="conditions-list">
                <div class="condition-item" v-for="condition in selectedStrategy.conditions" :key="condition.label">
                  <i :class="['fa', condition.icon]"></i>
                  <span>{{ condition.label }}</span>
                  <el-tag size="mini" :type="condition.met ? 'success' : 'info'">
                    {{ condition.met ? '已满足' : '未满足' }}
                  </el-tag>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="detailDialogVisible = false">
          <i class="fa fa-times"></i> 关闭
        </el-button>
        <el-button type="primary" @click="handleApplyStrategy(selectedStrategy)">
          <i class="fa fa-check"></i> 应用此策略
        </el-button>
      </span>
    </el-dialog>

    <el-dialog
      title="应用策略"
      :visible.sync="applyDialogVisible"
      width="50%"
      top="30vh"
    >
      <div class="apply-confirm">
        <div class="apply-icon">
          <i class="fa fa-check-circle"></i>
        </div>
        <h3>确认应用策略？</h3>
        <p>您即将应用以下策略：</p>
        <div class="apply-strategy-info">
          <div class="apply-strategy-name">{{ applyingStrategy?.name }}</div>
          <div class="apply-strategy-metrics">
            <span>预期节能率: <strong>{{ applyingStrategy?.savingsRate }}%</strong></span>
            <span>投资成本: <strong>¥{{ applyingStrategy?.investment }}万</strong></span>
          </div>
        </div>
        <el-checkbox v-model="applyConfirmed">我已确认了解策略详情及预期效果</el-checkbox>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="applyDialogVisible = false">取消</el-button>
        <el-button type="primary" :disabled="!applyConfirmed" @click="confirmApplyStrategy">
          确认应用
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed, watch, onMounted, nextTick } from 'vue'
import draggable from 'vuedraggable'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import * as XLSX from 'xlsx'

export default {
  name: 'StrategyRecommendation',
  components: {
    draggable
  },
  props: {
    stationData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      recommendationForm: {
        stationType: '',
        energyFeature: '',
        budgetRange: '',
        savingGoal: '',
        implementationCycle: '',
        equipmentStatus: '',
        climateZone: '',
        passengerFlow: '',
        priorities: []
      },
      recommendationFilter: 'all',
      matchThreshold: 70,
      matchMarks: {
        50: '50%',
        70: '70%',
        85: '85%',
        100: '100%'
      },
      recommendationLoading: false,
      recommendationResult: [],
      hasSearched: false,
      viewMode: 'card',
      comparisonStrategies: [],
      detailDialogVisible: false,
      selectedStrategy: null,
      applyDialogVisible: false,
      applyingStrategy: null,
      applyConfirmed: false,
      comparisonChart: null
    };
  },
  computed: {
    recommendationStats() {
      const allStrategies = this.getAllAvailableStrategies();
      return {
        totalStrategies: allStrategies.length,
        recommendedCount: this.recommendationResult.length,
        avgSavings: this.recommendationResult.length > 0
          ? Math.round(this.recommendationResult.reduce((sum, s) => sum + s.savingsRate, 0) / this.recommendationResult.length)
          : 0,
        avgInvestment: this.recommendationResult.length > 0
          ? Math.round(this.recommendationResult.reduce((sum, s) => sum + s.investment, 0) / this.recommendationResult.length)
          : 0
      };
    },
    filteredRecommendations() {
      let result = [...this.recommendationResult];
      switch (this.recommendationFilter) {
        case 'confidence':
          result.sort((a, b) => b.confidence - a.confidence);
          break;
        case 'savings':
          result.sort((a, b) => b.savingsRate - a.savingsRate);
          break;
        case 'cost':
          result.sort((a, b) => a.investment - b.investment);
          break;
        case 'roi':
          result.sort((a, b) => {
            const roiA = a.savingsRate / a.investment;
            const roiB = b.savingsRate / b.investment;
            return roiB - roiA;
          });
          break;
        default:
          result.sort((a, b) => b.matchScore - a.matchScore);
      }
      return result.filter(s => s.matchScore >= this.matchThreshold);
    }
  },
  watch: {
    viewMode(newVal) {
      if (newVal === 'comparison' && this.comparisonStrategies.length > 0) {
        this.$nextTick(() => {
          this.initComparisonChart();
        });
      }
    }
  },
  mounted() {
    this.loadRecommendationData();
  },
  methods: {
    loadRecommendationData() {
      const savedForm = localStorage.getItem('recommendationForm');
      if (savedForm) {
        this.recommendationForm = JSON.parse(savedForm);
      }
      this.recommendationResult = [];
    },
    handleReset() {
      this.recommendationForm = {
        stationType: '',
        energyFeature: '',
        budgetRange: '',
        savingGoal: '',
        implementationCycle: '',
        equipmentStatus: '',
        climateZone: '',
        passengerFlow: '',
        priorities: []
      };
      this.recommendationResult = [];
      this.hasSearched = false;
      this.matchThreshold = 70;
      localStorage.removeItem('recommendationForm');
      ElMessage.success('已重置推荐条件');
    },
    handleMatchThresholdChange(value) {
      ElMessage.info(`匹配度阈值已调整为 ${value}%`);
    },
    handleGetRecommendation() {
      if (!this.validateForm()) {
        return;
      }
      this.recommendationLoading = true;
      localStorage.setItem('recommendationForm', JSON.stringify(this.recommendationForm));
      setTimeout(() => {
        this.recommendationResult = this.generateRecommendations();
        this.hasSearched = true;
        this.recommendationLoading = false;
        ElMessage.success(`找到 ${this.recommendationResult.length} 个匹配策略`);
      }, 1500);
    },
    validateForm() {
      if (!this.recommendationForm.stationType) {
        ElMessage.warning('请选择车站类型');
        return false;
      }
      if (!this.recommendationForm.energyFeature) {
        ElMessage.warning('请选择用能特点');
        return false;
      }
      if (!this.recommendationForm.budgetRange) {
        ElMessage.warning('请选择预算范围');
        return false;
      }
      if (!this.recommendationForm.savingGoal) {
        ElMessage.warning('请选择节能目标');
        return false;
      }
      return true;
    },
    generateRecommendations() {
      const allStrategies = this.getAllAvailableStrategies();
      const form = this.recommendationForm;
      return allStrategies.map(strategy => {
        let matchScore = 0;
        const criteria = this.getMatchingCriteria(strategy);
        criteria.forEach(criterion => {
          if (form[criterion.field] === criterion.value ||
              (criterion.values && criterion.values.includes(form[criterion.field]))) {
            matchScore += criterion.weight;
          }
        });
        const priorityBonus = this.calculatePriorityBonus(strategy);
        matchScore = Math.min(95, matchScore + priorityBonus);
        return {
          ...strategy,
          matchScore: Math.round(matchScore),
          confidence: this.calculateConfidence(strategy),
          annualSavings: Math.round(strategy.savingsRate * 0.8),
          annualCostSavings: Math.round(strategy.savingsRate * 0.6),
          carbonReduction: Math.round(strategy.savingsRate * 0.5),
          parameters: this.generateParameters(strategy),
          conditions: this.generateConditions(strategy)
        };
      }).filter(s => s.matchScore >= 50).sort((a, b) => b.matchScore - a.matchScore);
    },
    getAllAvailableStrategies() {
      return [
        {
          id: 'LED照明改造',
          name: 'LED照明改造',
          category: '照明节能',
          icon: 'fa-lightbulb-o',
          iconBg: 'linear-gradient(135deg, #FFD700, #FFA500)',
          savingsRate: 25,
          investment: 80,
          paybackPeriod: 2.5,
          confidence: 92,
          difficulty: 2,
          tags: ['照明', '改造', '快速回报'],
          summary: '采用高效LED灯具替代传统光源，智能控制系统实现按需照明',
          fullDescription: 'LED照明改造项目通过将传统荧光灯、金卤灯等替换为高效LED灯具，配合智能照明控制系统，实现照明能耗的大幅降低。改造范围包括站厅、站台、候车室等公共区域。',
          implementationPoints: [
            '现场勘查确定改造范围和灯具数量',
            '选择适合车站环境的高防护等级LED灯具',
            '设计智能照明控制方案',
            '分区域分批次实施改造',
            '安装调试智能控制系统'
          ],
          notes: [
            '需考虑灯具的防护等级和散热性能',
            '智能控制系统需与车站BA系统对接',
            '建议优先改造高使用频率区域'
          ]
        },
        {
          id: '空调系统优化',
          name: '空调系统优化',
          category: '空调系统',
          icon: 'fa-snowflake-o',
          iconBg: 'linear-gradient(135deg, #00BFFF, #1E90FF)',
          savingsRate: 18,
          investment: 150,
          paybackPeriod: 3,
          confidence: 88,
          difficulty: 4,
          tags: ['空调', '优化', '智能控制'],
          summary: '优化空调运行策略，实现按需供冷供热，降低空调系统能耗',
          fullDescription: '空调系统优化项目通过引入变频控制、负荷预测、智能调度等技术手段，优化空调机组的运行效率。结合站内客流和外部气象条件，实现空调系统的精细化控制。',
          implementationPoints: [
            '部署空调智能控制系统',
            '安装温度传感器和能耗监测设备',
            '建立负荷预测模型',
            '优化机组启停时间和运行参数',
            '实现与BA系统的数据对接'
          ],
          notes: [
            '需确保与现有空调品牌的兼容性',
            '负荷预测模型需要历史数据训练',
            '建议在过渡季节进行系统调试'
          ]
        },
        {
          id: '电梯节能改造',
          name: '电梯节能改造',
          category: '电梯系统',
          icon: 'fa-cubes',
          iconBg: 'linear-gradient(135deg, #20B2AA, #008B8B)',
          savingsRate: 15,
          investment: 60,
          paybackPeriod: 2,
          confidence: 85,
          difficulty: 3,
          tags: ['电梯', '节能', '改造'],
          summary: '采用电梯群控优化和能量回馈技术，降低电梯系统能耗',
          fullDescription: '电梯节能改造项目包括电梯群控系统升级、能量回馈装置安装和电梯门机变频改造。通过智能调度减少电梯空载运行，将制动能量回馈电网。',
          implementationPoints: [
            '评估现有电梯群控系统状态',
            '设计群控优化方案',
            '安装能量回馈装置',
            '升级电梯门机控制系统',
            '调试优化群控参数'
          ],
          notes: [
            '能量回馈装置需与电梯品牌兼容',
            '改造期间需保障电梯正常运行',
            '建议选择客流高峰前后时段施工'
          ]
        },
        {
          id: '光伏发电系统',
          name: '光伏发电系统',
          category: '可再生能源',
          icon: 'fa-solar-panel',
          iconBg: 'linear-gradient(135deg, #32CD32, #228B22)',
          savingsRate: 12,
          investment: 300,
          paybackPeriod: 6,
          confidence: 75,
          difficulty: 5,
          tags: ['光伏', '可再生', '长期收益'],
          summary: '在车站屋顶和站台雨棚安装光伏发电系统，实现绿色能源供给',
          fullDescription: '光伏发电系统项目利用车站建筑屋顶和站台雨棚等可用面积，安装分布式光伏发电设备。所发电量优先自用，余电上网，实现电费节约和碳减排双重效益。',
          implementationPoints: [
            '勘察可用屋面资源',
            '进行光伏系统设计和发电量模拟',
            '办理并网手续',
            '采购安装光伏组件和逆变器',
            '建设监控系统实现运维管理'
          ],
          notes: [
            '需考虑屋面结构承载能力',
            '需协调电力公司办理并网',
            '运维需要专业人员定期清洁检查'
          ]
        },
        {
          id: '智能能源管理系统',
          name: '智能能源管理系统',
          category: '综合节能',
          icon: 'fa-desktop',
          iconBg: 'linear-gradient(135deg, #9370DB, #6A5ACD)',
          savingsRate: 22,
          investment: 200,
          paybackPeriod: 3.5,
          confidence: 80,
          difficulty: 4,
          tags: ['系统', '智能', '管理'],
          summary: '建设智能能源管理平台，实现全站能耗监测、分析和优化',
          fullDescription: '智能能源管理系统通过部署能耗监测设备、建设数据采集平台、开发能耗分析模块，实现车站能源使用的精细化管理。系统支持异常报警、节能诊断和策略优化建议。',
          implementationPoints: [
            '梳理车站用能系统和计量现状',
            '部署智能电表和传感器',
            '建设数据采集和存储平台',
            '开发能耗分析和可视化模块',
            '建立节能诊断和报警机制'
          ],
          notes: [
            '需要与车站现有SCADA系统对接',
            '数据采集频率需满足分析需求',
            '建议配备专职能耗管理人员'
          ]
        },
        {
          id: '给排水系统优化',
          name: '给排水系统优化',
          category: '给排水',
          icon: 'fa-tint',
          iconBg: 'linear-gradient(135deg, #00CED1, #008B8B)',
          savingsRate: 10,
          investment: 40,
          paybackPeriod: 2,
          confidence: 82,
          difficulty: 3,
          tags: ['给排水', '优化', '节水'],
          summary: '优化给排水系统运行策略，实现节水降耗',
          fullDescription: '给排水系统优化项目包括水泵变频控制优化、管道泄漏检测、卫生器具改造和雨水回收利用。通过技术手段减少水资源浪费，降低排水系统能耗。',
          implementationPoints: [
            '检测给排水系统泄漏点',
            '改造老旧管道和阀门',
            '安装水泵变频控制装置',
            '改造节水型卫生器具',
            '建设雨水收集回用系统'
          ],
          notes: [
            '需定期进行泄漏检测',
            '节水器具需符合卫生标准',
            '雨水回用需处理达标'
          ]
        },
        {
          id: '蓄冷蓄热系统',
          name: '蓄冷蓄热系统',
          category: '空调系统',
          icon: 'fa-asterisk',
          iconBg: 'linear-gradient(135deg, #FF6347, #DC143C)',
          savingsRate: 20,
          investment: 350,
          paybackPeriod: 4,
          confidence: 78,
          difficulty: 5,
          tags: ['蓄能', '空调', '削峰填谷'],
          summary: '利用蓄冷蓄热技术，实现空调系统的负荷转移和能耗优化',
          fullDescription: '蓄冷蓄热系统利用夜间低价电进行蓄冷/蓄热，白天高峰时段释放利用，有效降低空调系统运行成本，同时减轻电网峰谷差，提高能源利用效率。',
          implementationPoints: [
            '进行负荷分析和系统设计',
            '安装蓄冷/蓄热设备和换热系统',
            '配置智能控制系统',
            '优化运行策略和调度方案',
            '建立运维管理制度'
          ],
          notes: [
            '需要较大的设备安装空间',
            '需评估夜间电力供应能力',
            '系统运行需要专业操作人员'
          ]
        },
        {
          id: '能耗监测改造',
          name: '能耗监测改造',
          category: '综合节能',
          icon: 'fa-bar-chart',
          iconBg: 'linear-gradient(135deg, #4682B4, #5F9EA0)',
          savingsRate: 8,
          investment: 50,
          paybackPeriod: 1.5,
          confidence: 90,
          difficulty: 2,
          tags: ['监测', '数据', '管理'],
          summary: '完善能耗分项计量体系，为精细化管理提供数据支撑',
          fullDescription: '能耗监测改造项目通过在各用能系统和设备处安装智能电表、水表等计量设备，实现能耗数据的自动采集和分析。建立分项计量体系，为节能诊断和绩效考核提供数据支撑。',
          implementationPoints: [
            '制定分项计量方案',
            '采购安装智能计量设备',
            '建设数据采集传输网络',
            '开发数据分析和展示平台',
            '建立能耗数据管理制度'
          ],
          notes: [
            '需与现有配电系统配合施工',
            '数据采集设备需防护处理',
            '建议选择Modbus/TCP协议设备'
          ]
        }
      ];
    },
    getMatchingCriteria(strategy) {
      const criteriaMap = {
        'LED照明改造': [
          { field: 'stationType', value: 'large', weight: 10 },
          { field: 'energyFeature', value: 'lighting', weight: 15 },
          { field: 'equipmentStatus', values: ['poor', 'normal'], weight: 10 },
          { field: 'budgetRange', values: ['low', 'medium'], weight: 10 }
        ],
        '空调系统优化': [
          { field: 'stationType', value: 'large', weight: 12 },
          { field: 'energyFeature', values: ['cooling', 'heating', 'comprehensive'], weight: 15 },
          { field: 'implementationCycle', values: ['short', 'medium'], weight: 8 }
        ],
        '电梯节能改造': [
          { field: 'stationType', value: 'hub', weight: 12 },
          { field: 'passengerFlow', values: ['high', 'premium'], weight: 15 },
          { field: 'equipmentStatus', values: ['poor', 'normal'], weight: 10 }
        ],
        '光伏发电系统': [
          { field: 'budgetRange', values: ['high', 'premium'], weight: 15 },
          { field: 'climateZone', values: ['hot-summer-cold-winter', 'hot-summer-warm-winter'], weight: 12 },
          { field: 'implementationCycle', values: ['long', 'continuous'], weight: 10 }
        ],
        '智能能源管理系统': [
          { field: 'stationType', values: ['hub', 'large'], weight: 12 },
          { field: 'savingGoal', values: ['high', 'premium'], weight: 10 },
          { field: 'implementationCycle', values: ['medium', 'long'], weight: 8 }
        ],
        '给排水系统优化': [
          { field: 'energyFeature', value: 'comprehensive', weight: 10 },
          { field: 'budgetRange', values: ['low', 'medium'], weight: 12 },
          { field: 'implementationCycle', values: ['short'], weight: 10 }
        ],
        '蓄冷蓄热系统': [
          { field: 'energyFeature', values: ['cooling', 'heating'], weight: 15 },
          { field: 'budgetRange', values: ['high', 'premium'], weight: 12 },
          { field: 'climateZone', values: ['severe-cold', 'cold', 'hot-summer-cold-winter'], weight: 10 },
          { field: 'passengerFlow', values: ['high', 'premium'], weight: 8 }
        ],
        '能耗监测改造': [
          { field: 'savingGoal', values: ['low', 'medium'], weight: 12 },
          { field: 'implementationCycle', values: ['short'], weight: 15 },
          { field: 'budgetRange', values: ['low'], weight: 10 }
        ]
      };
      return criteriaMap[strategy.id] || [];
    },
    calculatePriorityBonus(strategy) {
      let bonus = 0;
      const priorities = this.recommendationForm.priorities;
      const categoryMap = {
        '照明节能': '照明节能',
        '空调系统': '空调系统',
        '电梯系统': '电梯系统',
        '给排水': '给排水',
        '供电系统': '综合节能',
        '可再生能源': '可再生能源'
      };
      priorities.forEach(priority => {
        const category = categoryMap[priority];
        if (category && strategy.category.includes(category)) {
          bonus += 8;
        }
      });
      return bonus;
    },
    calculateConfidence(strategy) {
      let baseConfidence = strategy.confidence;
      if (this.recommendationForm.equipmentStatus === 'excellent') {
        baseConfidence -= 5;
      }
      if (this.recommendationForm.passengerFlow === 'premium') {
        baseConfidence += 5;
      }
      return Math.min(95, Math.max(60, baseConfidence));
    },
    generateParameters(strategy) {
      const paramConfigs = {
        'LED照明改造': [
          { name: '灯具替换率', label: '灯具替换率', value: 80, min: 50, max: 100, step: 5, unit: '%', editable: true, marks: { 50: '50%', 100: '100%' } },
          { name: '智能控制覆盖率', label: '智能控制覆盖率', value: 60, min: 0, max: 100, step: 10, unit: '%', editable: true, marks: { 0: '0%', 100: '100%' } }
        ],
        '空调系统优化': [
          { name: '温度设定优化', label: '温度设定优化', value: 24, min: 22, max: 28, step: 1, unit: '°C', editable: true, marks: { 22: '22°C', 28: '28°C' } },
          { name: '新风量优化', label: '新风量优化', value: 15, min: 5, max: 30, step: 5, unit: '%', editable: true, marks: { 5: '5%', 30: '30%' } }
        ],
        '电梯节能改造': [
          { name: '群控优化', label: '群控优化', value: 70, min: 0, max: 100, step: 10, unit: '%', editable: true, marks: { 0: '0%', 100: '100%' } },
          { name: '能量回馈比例', label: '能量回馈比例', value: 25, min: 10, max: 40, step: 5, unit: '%', editable: true, marks: { 10: '10%', 40: '40%' } }
        ],
        '光伏发电系统': [
          { name: '装机容量', label: '装机容量', value: 500, min: 100, max: 2000, step: 100, unit: 'kW', editable: true, marks: { 100: '100kW', 2000: '2MW' } },
          { name: '自用比例', label: '自用比例', value: 80, min: 50, max: 100, step: 5, unit: '%', editable: true, marks: { 50: '50%', 100: '100%' } }
        ],
        '智能能源管理系统': [
          { name: '监测点位', label: '监测点位', value: 200, min: 50, max: 500, step: 50, unit: '个', editable: true, marks: { 50: '50', 500: '500' } },
          { name: '分析频率', label: '分析频率', value: 15, min: 5, max: 60, step: 5, unit: 'min', editable: true, marks: { 5: '5min', 60: '60min' } }
        ],
        '给排水系统优化': [
          { name: '水泵变频比例', label: '水泵变频比例', value: 60, min: 0, max: 100, step: 10, unit: '%', editable: true, marks: { 0: '0%', 100: '100%' } }
        ],
        '蓄冷蓄热系统': [
          { name: '蓄能容量', label: '蓄能容量', value: 1000, min: 500, max: 3000, step: 100, unit: 'kWh', editable: true, marks: { 500: '500kWh', 3000: '3000kWh' } }
        ],
        '能耗监测改造': [
          { name: '计量点位', label: '计量点位', value: 100, min: 20, max: 300, step: 10, unit: '个', editable: true, marks: { 20: '20', 300: '300' } },
          { name: '采集频率', label: '采集频率', value: 15, min: 1, max: 60, step: 1, unit: 'min', editable: true, marks: { 1: '1min', 60: '60min' } }
        ]
      };
      return paramConfigs[strategy.id] || [
        { name: '参数1', label: '参数1', value: 50, min: 0, max: 100, step: 10, unit: '%', editable: true, marks: { 0: '0%', 100: '100%' } }
      ];
    },
    generateConditions(strategy) {
      const conditionsMap = {
        'LED照明改造': [
          { label: '现有照明能耗占比 > 15%', icon: 'fa-check-circle', met: true },
          { label: '灯具使用年限 > 5年', icon: 'fa-check-circle', met: true },
          { label: '具备智能控制系统接口', icon: 'fa-exclamation-circle', met: false }
        ],
        '空调系统优化': [
          { label: '空调系统运行时间 > 8小时/天', icon: 'fa-check-circle', met: true },
          { label: '具备BAS系统接口', icon: 'fa-check-circle', met: true },
          { label: '空调能耗占比 > 30%', icon: 'fa-check-circle', met: true }
        ],
        '光伏发电系统': [
          { label: '可用屋顶面积 >= 5000㎡', icon: 'fa-check-circle', met: true },
          { label: '年日照小时数 >= 1200h', icon: 'fa-check-circle', met: true },
          { label: '电力并网条件具备', icon: 'fa-exclamation-circle', met: false }
        ],
        '智能能源管理系统': [
          { label: '具备数据采集网络', icon: 'fa-exclamation-circle', met: false },
          { label: '配备专职能耗管理人员', icon: 'fa-check-circle', met: true },
          { label: '年度能耗费用 > 500万', icon: 'fa-check-circle', met: true }
        ]
      };
      return conditionsMap[strategy.id] || [
        { label: '基础条件已满足', icon: 'fa-check-circle', met: true },
        { label: '设备状态良好', icon: 'fa-check-circle', met: true }
      ];
    },
    getConfidenceColor(confidence) {
      if (confidence >= 85) return '#67C23A';
      if (confidence >= 70) return '#409EFF';
      return '#E6A23C';
    },
    getMatchColor(matchScore) {
      if (matchScore >= 85) return '#67C23A';
      if (matchScore >= 70) return '#409EFF';
      return '#E6A23C';
    },
    handleViewDetail(strategy) {
      this.selectedStrategy = strategy;
      this.detailDialogVisible = true;
    },
    handleApplyStrategy(strategy) {
      this.applyingStrategy = strategy;
      this.applyConfirmed = false;
      this.applyDialogVisible = true;
    },
    confirmApplyStrategy() {
      if (this.applyingStrategy) {
        if (!this.appliedStrategies) {
          this.appliedStrategies = [];
        }
        this.appliedStrategies.push({
          ...this.applyingStrategy,
          appliedTime: new Date().toISOString(),
          parameters: this.applyingStrategy.parameters.map(p => ({
            name: p.name,
            value: p.value,
            unit: p.unit
          }))
        });
        ElMessage.success(`策略 "${this.applyingStrategy.name}" 已添加到模拟方案`);
        this.applyDialogVisible = false;
        this.$emit('strategy-applied', this.applyingStrategy);
      }
    },
    handleAddToComparison(strategy) {
      if (this.comparisonStrategies.length >= 3) {
        ElMessage.warning('最多同时对比3个策略');
        return;
      }
      if (this.comparisonStrategies.find(s => s.id === strategy.id)) {
        ElMessage.warning('该策略已在对比列表中');
        return;
      }
      this.comparisonStrategies.push(strategy);
      if (this.viewMode === 'comparison') {
        this.$nextTick(() => {
          this.initComparisonChart();
        });
      }
    },
    handleExportRecommendations() {
      const data = this.filteredRecommendations.map(s => ({
        策略名称: s.name,
        策略类型: s.category,
        节能率: s.savingsRate + '%',
        投资成本: '¥' + s.investment + '万',
        回收周期: s.paybackPeriod + '年',
        置信度: s.confidence + '%',
        匹配度: s.matchScore + '%'
      }));
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, '策略推荐');
      XLSX.writeFile(wb, '策略推荐结果.xlsx');
      ElMessage.success('推荐结果已导出');
    },
    initComparisonChart() {
      if (this.$refs.comparisonChart && this.comparisonChart === null) {
        const echarts = require('echarts');
        this.comparisonChart = echarts.init(this.$refs.comparisonChart);
      }
      if (this.comparisonChart) {
        const option = {
          tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
          legend: { data: ['节能率', '投资成本', '回收周期'] },
          grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
          xAxis: {
            type: 'category',
            data: this.comparisonStrategies.map(s => s.name)
          },
          yAxis: [
            { type: 'value', name: '节能率/%', position: 'left' },
            { type: 'value', name: '投资/回收', position: 'right' }
          ],
          series: [
            {
              name: '节能率',
              type: 'bar',
              data: this.comparisonStrategies.map(s => s.savingsRate),
              itemStyle: { color: '#409EFF' }
            },
            {
              name: '投资成本',
              type: 'bar',
              data: this.comparisonStrategies.map(s => s.investment),
              itemStyle: { color: '#67C23A' }
            },
            {
              name: '回收周期',
              type: 'line',
              yAxisIndex: 1,
              data: this.comparisonStrategies.map(s => s.paybackPeriod),
              itemStyle: { color: '#E6A23C' }
            }
          ]
        };
        this.comparisonChart.setOption(option);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.strategy-recommendation-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 100px);
}

.recommendation-card {
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .card-title {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #1d2129;
    display: flex;
    align-items: center;
    gap: 8px;

    i {
      color: #409EFF;
    }
  }

  .header-actions {
    display: flex;
    gap: 8px;
  }
}

.recommendation-settings {
  margin-bottom: 20px;
}

.settings-card {
  border-radius: 8px;
}

.quick-stats-card {
  border-radius: 8px;

  .stats-content {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
    padding: 10px 0;

    .stat-item {
      text-align: center;
      padding: 15px 10px;
      background: #f5f7fa;
      border-radius: 8px;

      .stat-value {
        font-size: 24px;
        font-weight: 700;
        color: #409EFF;
        line-height: 1.2;
      }

      .stat-label {
        font-size: 12px;
        color: #86909c;
        margin-top: 5px;
      }
    }
  }

  .filter-section {
    margin-top: 20px;

    .filter-label {
      font-size: 14px;
      font-weight: 500;
      color: #1d2129;
      margin-bottom: 8px;
    }
  }

  .match-section {
    margin-top: 20px;

    .match-label {
      font-size: 14px;
      font-weight: 500;
      color: #1d2129;
      margin-bottom: 10px;
    }

    .match-value {
      text-align: center;
      font-size: 14px;
      font-weight: 600;
      color: #409EFF;
      margin-top: 8px;
    }
  }
}

.recommendation-results {
  .results-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 15px 20px;
    background: #f0f5ff;
    border-radius: 8px;

    .results-title {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #1d2129;
      display: flex;
      align-items: center;
      gap: 8px;

      i {
        color: #409EFF;
      }
    }

    .results-actions {
      display: flex;
      gap: 10px;
    }
  }
}

.results-cards {
  .strategy-card {
    position: relative;
    margin-bottom: 20px;
    transition: all 0.3s ease;
    border-radius: 8px;

    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    }

    &.recommended {
      border: 2px solid #67C23A;
    }

    .card-badge {
      position: absolute;
      top: 10px;
      right: 10px;
      padding: 4px 12px;
      background: #67C23A;
      color: #fff;
      font-size: 12px;
      font-weight: 500;
      border-radius: 20px;
      z-index: 10;

      &.secondary {
        background: #409EFF;
      }
    }

    .card-body {
      padding: 15px 0;

      .strategy-metrics {
        margin-bottom: 15px;

        .metric-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid #f0f0f0;

          &:last-child {
            border-bottom: none;
          }

          .metric-label {
            font-size: 13px;
            color: #86909c;
          }

          .metric-value {
            font-size: 14px;
            font-weight: 600;
            color: #1d2129;

            &.highlight {
              color: #F56C6C;
              font-size: 16px;
            }
          }
        }
      }

      .strategy-match {
        margin-bottom: 15px;

        .match-indicator {
          .match-bar {
            height: 6px;
            background: #e4e7ed;
            border-radius: 3px;
            overflow: hidden;
            margin-bottom: 5px;

            .match-fill {
              height: 100%;
              background: linear-gradient(90deg, #409EFF, #67C23A);
              border-radius: 3px;
              transition: width 0.3s ease;
            }
          }

          .match-text {
            font-size: 12px;
            color: #86909c;
          }
        }
      }

      .strategy-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
        margin-bottom: 12px;
      }

      .strategy-summary {
        font-size: 13px;
        color: #86909c;
        line-height: 1.5;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    }

    .card-footer {
      display: flex;
      justify-content: space-between;
      padding-top: 15px;
      border-top: 1px solid #f0f0f0;
    }
  }
}

.table-strategy-name {
  display: flex;
  align-items: center;
  gap: 10px;

  .strategy-icon-small {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 14px;
  }
}

.highlight-text {
  color: #F56C6C;
  font-weight: 600;
}

.results-comparison {
  .comparison-empty {
    text-align: center;
    padding: 60px 20px;
    color: #86909c;

    i {
      font-size: 48px;
      color: #dcdfe6;
      margin-bottom: 20px;
    }

    p {
      margin: 10px 0 20px;
    }
  }

  .comparison-content {
    .comparison-chart {
      margin-top: 30px;

      h4 {
        margin: 0 0 15px;
        font-size: 14px;
        font-weight: 600;
        color: #1d2129;
      }

      .chart {
        height: 350px;
      }
    }
  }
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: #86909c;

  i {
    font-size: 64px;
    color: #dcdfe6;
    margin-bottom: 20px;
  }

  h4 {
    margin: 10px 0;
    font-size: 18px;
    color: #1d2129;
  }

  p {
    margin: 10px 0 20px;
  }
}

.strategy-detail-dialog {
  .strategy-detail {
    .detail-main-card {
      .detail-badges {
        display: flex;
        gap: 10px;
      }

      .detail-content {
        .detail-section {
          margin-bottom: 25px;

          &:last-child {
            margin-bottom: 0;
          }

          h4 {
            margin: 0 0 15px;
            font-size: 15px;
            font-weight: 600;
            color: #1d2129;
            display: flex;
            align-items: center;
            gap: 8px;

            i {
              color: #409EFF;
            }
          }

          p {
            margin: 0;
            line-height: 1.8;
            color: #4e5969;
          }

          .detail-list {
            margin: 0;
            padding-left: 20px;

            li {
              line-height: 2;
              color: #4e5969;

              &.warning {
                color: #E6A23C;
              }
            }
          }

          .effect-preview {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;

            .effect-item {
              text-align: center;
              padding: 20px;
              background: #f5f7fa;
              border-radius: 8px;

              .effect-label {
                font-size: 13px;
                color: #86909c;
                margin-bottom: 8px;
              }

              .effect-value {
                font-size: 20px;
                font-weight: 700;
                color: #409EFF;
              }
            }
          }
        }
      }
    }

    .detail-side-card {
      margin-bottom: 20px;

      &:last-child {
        margin-bottom: 0;
      }

      .parameter-config {
        .config-item {
          margin-bottom: 20px;

          &:last-child {
            margin-bottom: 0;
          }

          .config-label {
            font-size: 13px;
            font-weight: 500;
            color: #1d2129;
            margin-bottom: 10px;
          }

          .config-value {
            text-align: center;
            font-size: 14px;
            font-weight: 600;
            color: #409EFF;
            margin-top: 8px;
          }
        }
      }

      .conditions-list {
        .condition-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 0;
          border-bottom: 1px solid #f0f0f0;

          &:last-child {
            border-bottom: none;
          }

          i {
            color: #409EFF;
            width: 20px;
            text-align: center;
          }

          span {
            flex: 1;
            font-size: 13px;
            color: #4e5969;
          }
        }
      }
    }
  }
}

.apply-confirm {
  text-align: center;
  padding: 20px;

  .apply-icon {
    i {
      font-size: 64px;
      color: #67C23A;
      margin-bottom: 20px;
    }
  }

  h3 {
    margin: 10px 0;
    font-size: 18px;
    color: #1d2129;
  }

  p {
    margin: 10px 0 20px;
    color: #86909c;
  }

  .apply-strategy-info {
    background: #f5f7fa;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;

    .apply-strategy-name {
      font-size: 18px;
      font-weight: 600;
      color: #409EFF;
      margin-bottom: 10px;
    }

    .apply-strategy-metrics {
      display: flex;
      justify-content: center;
      gap: 30px;

      span {
        font-size: 14px;
        color: #4e5969;

        strong {
          color: #F56C6C;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .strategy-recommendation-container {
    padding: 10px;
  }

  .results-header {
    flex-direction: column;
    gap: 15px;
  }

  .effect-preview {
    grid-template-columns: 1fr !important;
  }
}
</style>