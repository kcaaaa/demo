<template>
  <div class="home-container" :class="{ 'dark-mode': isDarkMode }">
    <div class="page-header">
      <div class="header-left">
        <h2>首页</h2>
        <el-tag v-if="currentScenario" :type="getScenarioType(currentScenario.type)" size="small">
          <i :class="currentScenario.icon"></i>
          {{ currentScenario.name }}
        </el-tag>
      </div>
      <div class="header-actions">
        <el-button size="small" @click="toggleTheme">
          <i :class="[isDarkMode ? 'fa fa-sun-o' : 'fa fa-moon-o']"></i>
        </el-button>
        
        <el-dropdown @command="handleRefreshIntervalChange">
          <el-button size="small">
            <i class="fa fa-clock-o"></i> 刷新间隔: {{ refreshInterval }}s
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="10">10s</el-dropdown-item>
              <el-dropdown-item command="30">30s</el-dropdown-item>
              <el-dropdown-item command="60">60s</el-dropdown-item>
              <el-dropdown-item command="300">5min</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        
        <el-dropdown @command="handleExport">
          <el-button type="primary" size="small">
            <i class="fa fa-download"></i> 导出
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="excel">Excel</el-dropdown-item>
              <el-dropdown-item command="pdf">PDF</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        
        <el-button size="small" @click="showPersonalizeDialog = true">
          <i class="fa fa-cog"></i> 个性化配置
        </el-button>
        
        <el-button type="primary" @click="refreshData">
          <i class="fa fa-refresh"></i> 刷新数据
        </el-button>
      </div>
    </div>

    <div class="advanced-filter">
      <el-card shadow="hover" class="filter-card">
        <div class="filter-content">
          <div class="filter-item">
            <label>车站类型:</label>
            <el-select v-model="filterForm.stationType" placeholder="全部" size="small" clearable>
              <el-option label="大型站" value="large" />
              <el-option label="中型站" value="medium" />
              <el-option label="小型站" value="small" />
            </el-select>
          </div>
          <div class="filter-item">
            <label>能耗等级:</label>
            <el-select v-model="filterForm.energyLevel" placeholder="全部" size="small" clearable>
              <el-option label="一级(优秀)" value="1" />
              <el-option label="二级(良好)" value="2" />
              <el-option label="三级(一般)" value="3" />
              <el-option label="四级(较差)" value="4" />
            </el-select>
          </div>
          <div class="filter-item">
            <label>时间范围:</label>
            <el-date-picker
              v-model="filterForm.timeRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              size="small"
              format="YYYY-MM-DD HH:mm"
              value-format="YYYY-MM-DD HH:mm:ss"
            />
          </div>
          <div class="filter-item">
            <el-button type="primary" size="small" @click="applyFilters">
              <i class="fa fa-search"></i> 应用
            </el-button>
            <el-button size="small" @click="resetFilters">
              <i class="fa fa-refresh"></i> 重置
            </el-button>
          </div>
        </div>
      </el-card>
    </div>

    <div class="view-switcher">
      <el-radio-group v-model="currentView" @change="handleViewChange">
        <el-radio-button value="single">单站看板</el-radio-button>
        <el-radio-button value="multi">多站仪表盘</el-radio-button>
      </el-radio-group>
      <el-select v-if="currentView === 'single'" v-model="selectedStation" size="small" style="margin-left: 10px;">
        <el-option v-for="station in stations" :key="station.id" :label="station.name" :value="station.id" />
      </el-select>
    </div>

    <!-- AI分析筛选组件 -->
    <div class="ai-analysis-filter">
      <el-card shadow="hover" class="filter-card">
        <div class="filter-content">
          <div class="filter-header">
            <h3><i class="fa fa-brain"></i> AI分析筛选</h3>
            <el-button size="small" @click="generateAiAnalysis" type="primary">
              <i class="fa fa-magic"></i> 生成分析报告
            </el-button>
          </div>
          <div class="filter-controls">
            <div class="filter-item">
              <label>分析时间范围:</label>
              <el-date-picker
                v-model="aiAnalysisFilter.timeRange"
                type="monthrange"
                range-separator="至"
                start-placeholder="开始月份"
                end-placeholder="结束月份"
                format="YYYY年MM月"
                value-format="YYYY-MM"
                size="small"
                :default-value="['2025-10', '2025-11']"
              />
            </div>
            <div class="filter-item">
              <label>站点选择:</label>
              <el-select 
                v-model="aiAnalysisFilter.selectedStations" 
                multiple 
                filterable 
                collapse-tags
                placeholder="选择站点（支持多选）" 
                size="small"
                style="width: 250px;"
              >
                <el-option
                  v-for="station in allStations"
                  :key="station.id"
                  :label="station.name"
                  :value="station.id"
                >
                  <div class="station-option">
                    <span>{{ station.name }}</span>
                    <el-tag size="small" :type="getStationTypeTag(station.type)">{{ station.typeName }}</el-tag>
                  </div>
                </el-option>
              </el-select>
            </div>
            <div class="filter-item">
              <label>分析类型:</label>
              <el-select v-model="aiAnalysisFilter.analysisType" placeholder="选择分析类型" size="small" style="width: 180px;">
                <el-option label="综合分析" value="comprehensive" />
                <el-option label="能耗趋势分析" value="trend" />
                <el-option label="设备效率分析" value="efficiency" />
                <el-option label="节能效果分析" value="saving" />
              </el-select>
            </div>
            <div class="filter-item">
              <el-button size="small" @click="resetAiFilters" style="margin-right: 10px;">
                <i class="fa fa-refresh"></i> 重置
              </el-button>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- AI分析结果汇总展示 -->
    <div v-if="aiAnalysisResults.show" class="ai-analysis-summary">
      <el-card shadow="hover">
        <template #header>
          <div class="card-header">
            <span><i class="fa fa-chart-line"></i> AI分析汇总报告</span>
            <div class="summary-actions">
              <el-button size="small" @click="exportAiAnalysis" type="primary" link>
                <i class="fa fa-download"></i> 导出报告
              </el-button>
              <el-button size="small" @click="viewFullAnalysis" link>
                <i class="fa fa-eye"></i> 查看详细
              </el-button>
            </div>
          </div>
        </template>

        <div class="summary-content">
          <!-- 数据来源统计 -->
          <div class="summary-section">
            <h4><i class="fa fa-database"></i> 数据来源统计</h4>
            <el-row :gutter="20">
              <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
                <div class="stat-card">
                  <div class="stat-icon">
                    <i class="fa fa-building"></i>
                  </div>
                  <div class="stat-info">
                    <div class="stat-value">{{ aiAnalysisResults.dataStats.stationCount }}</div>
                    <div class="stat-label">涉及站点</div>
                  </div>
                </div>
              </el-col>
              <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
                <div class="stat-card">
                  <div class="stat-icon">
                    <i class="fa fa-calendar"></i>
                  </div>
                  <div class="stat-info">
                    <div class="stat-value">{{ aiAnalysisResults.dataStats.daysCount }}</div>
                    <div class="stat-label">分析天数</div>
                  </div>
                </div>
              </el-col>
              <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
                <div class="stat-card">
                  <div class="stat-icon">
                    <i class="fa fa-cog"></i>
                  </div>
                  <div class="stat-info">
                    <div class="stat-value">{{ aiAnalysisResults.dataStats.deviceCount }}</div>
                    <div class="stat-label">设备数量</div>
                  </div>
                </div>
              </el-col>
              <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
                <div class="stat-card">
                  <div class="stat-icon">
                    <i class="fa fa-bolt"></i>
                  </div>
                  <div class="stat-info">
                    <div class="stat-value">{{ aiAnalysisResults.dataStats.totalEnergy }}</div>
                    <div class="stat-label">总能耗(kWh)</div>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>

          <!-- 关键发现 -->
          <div class="summary-section">
            <h4><i class="fa fa-lightbulb-o"></i> 关键发现</h4>
            <div class="findings-grid">
              <div v-for="finding in aiAnalysisResults.keyFindings" :key="finding.id" class="finding-card">
                <div class="finding-header">
                  <span class="finding-icon" :class="finding.type">
                    <i :class="finding.icon"></i>
                  </span>
                  <span class="finding-title">{{ finding.title }}</span>
                </div>
                <div class="finding-content">
                  <p class="finding-description">{{ finding.description }}</p>
                  <div class="finding-metric">
                    <span class="metric-label">关键指标:</span>
                    <span class="metric-value" :class="finding.metricTrend">
                      {{ finding.metricValue }}
                      <i :class="finding.metricTrend === 'up' ? 'fa fa-arrow-up' : 'fa fa-arrow-down'"></i>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 趋势分析 -->
          <div class="summary-section">
            <h4><i class="fa fa-trending-up"></i> 趋势分析</h4>
            <el-row :gutter="20">
              <el-col :xs="24" :lg="16">
                <div class="trend-chart-container">
                  <div id="aiTrendChart" class="chart-container"></div>
                </div>
              </el-col>
              <el-col :xs="24" :lg="8">
                <div class="trend-insights">
                  <div v-for="trend in aiAnalysisResults.trendAnalysis" :key="trend.id" class="trend-item">
                    <div class="trend-indicator" :class="trend.direction">
                      <i :class="trend.direction === 'up' ? 'fa fa-arrow-up' : 'fa fa-arrow-down'"></i>
                    </div>
                    <div class="trend-info">
                      <div class="trend-title">{{ trend.title }}</div>
                      <div class="trend-description">{{ trend.description }}</div>
                      <div class="trend-value" :class="trend.direction">
                        {{ trend.change }}
                      </div>
                    </div>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>

          <!-- 综合结论 -->
          <div class="summary-section">
            <h4><i class="fa fa-comments"></i> 综合结论</h4>
            <el-alert
              v-for="conclusion in aiAnalysisResults.conclusions"
              :key="conclusion.id"
              :type="conclusion.type"
              :title="conclusion.title"
              :description="conclusion.description"
              show-icon
              class="conclusion-alert"
            />
          </div>
        </div>
      </el-card>
    </div>

    <div v-if="currentView === 'single'" class="single-station-view">
      <div class="core-indicators">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6" v-for="(indicator, index) in coreIndicators" :key="index">
            <el-card shadow="hover" class="indicator-card" :class="indicator.class">
              <div class="indicator-content">
                <div class="indicator-icon" :style="{ background: indicator.color }">
                  <i :class="indicator.icon"></i>
                </div>
                <div class="indicator-info">
                  <div class="indicator-label">{{ indicator.label }}</div>
                  <div class="indicator-value">
                    {{ indicator.value }}
                    <span class="unit">{{ indicator.unit }}</span>
                  </div>
                  <div class="indicator-threshold" v-if="indicator.threshold">
                    <el-progress 
                      :percentage="getThresholdPercentage(indicator)" 
                      :color="getThresholdColor(indicator)"
                      :stroke-width="3"
                      :show-text="false"
                    />
                    <span class="threshold-text">
                      <i class="fa fa-bell"></i>
                      阈值: {{ indicator.threshold }}
                    </span>
                  </div>
                  <div class="indicator-change" v-if="indicator.change !== undefined">
                    <span :class="indicator.change >= 0 ? 'increase' : 'decrease'">
                      <i class="fa" :class="indicator.change >= 0 ? 'fa-arrow-up' : 'fa-arrow-down'"></i>
                      {{ Math.abs(indicator.change) }}%
                    </span>
                    <span class="change-text">较昨日</span>
                  </div>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <div class="energy-trend">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>能耗趋势图</span>
              <div class="chart-actions">
                <el-radio-group v-model="trendTimeGranularity" size="small" @change="handleTrendGranularityChange">
                  <el-radio-button value="hour">小时</el-radio-button>
                  <el-radio-button value="day">日</el-radio-button>
                  <el-radio-button value="week">周</el-radio-button>
                  <el-radio-button value="month">月</el-radio-button>
                  <el-radio-button value="year">年</el-radio-button>
                </el-radio-group>
              </div>
            </div>
          </template>
          <div id="energyTrendChart" class="chart-container"></div>
        </el-card>
      </div>

      <div class="energy-structure">
        <el-row :gutter="20">
          <el-col :xs="24" :md="12" :lg="12" :xl="12">
            <el-card shadow="hover">
              <template #header>
                <div class="card-header">
                  <span>能耗结构饼图</span>
                </div>
              </template>
              <div id="energyStructureChart" class="chart-container"></div>
            </el-card>
          </el-col>
          <el-col :xs="24" :md="12" :lg="12" :xl="12">
            <el-card shadow="hover">
              <template #header>
                <div class="card-header">
                  <span>节能效果评估</span>
                </div>
              </template>
              <div id="energySavingEffectChart" class="chart-container"></div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <div class="analysis-section">
        <el-row :gutter="20">
          <el-col :xs="24" :md="12" :lg="12" :xl="12">
            <el-card shadow="hover">
              <template #header>
                <div class="card-header">
                  <span>区域能耗分析</span>
                </div>
              </template>
              <div id="areaEnergyChart" class="chart-container"></div>
            </el-card>
          </el-col>
          <el-col :xs="24" :md="12" :lg="12" :xl="12">
            <el-card shadow="hover">
              <template #header>
                <div class="card-header">
                  <span>重点区域能耗排名</span>
                  <el-button size="small" type="primary" link @click="viewAreaRankingDetail">
                    查看详情
                  </el-button>
                </div>
              </template>
              <div class="ranking-list">
                <div 
                  v-for="(item, index) in areaRankings" 
                  :key="item.id" 
                  class="ranking-item"
                  @click="viewAreaDetail(item)"
                >
                  <div class="ranking-index" :class="'rank-' + (index + 1)">{{ index + 1 }}</div>
                  <div class="ranking-name">{{ item.name }}</div>
                  <div class="ranking-value">{{ item.energy }} kWh</div>
                  <el-progress 
                    :percentage="item.percentage" 
                    :stroke-width="8"
                    :color="getRankingColor(index)"
                    :show-text="false"
                  />
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <div class="ai-analysis-section">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span><i class="fa fa-brain"></i> AI分析报告</span>
              <div class="ai-header-actions">
                <el-select v-model="aiAnalysisType" size="small" style="width: 150px;">
                  <el-option label="预测分析" value="forecast" />
                  <el-option label="关联性分析" value="correlation" />
                  <el-option label="策略推荐" value="recommendation" />
                  <el-option label="影响分析" value="impact" />
                </el-select>
                <el-button size="small" @click="refreshAiAnalysis">
                  <i class="fa fa-refresh"></i> 刷新
                </el-button>
              </div>
            </div>
          </template>
          
          <div class="ai-analysis-content">
            <!-- 预测分析 -->
            <div v-if="aiAnalysisType === 'forecast'" class="forecast-analysis">
              <div class="ai-section-header">
                <h4><i class="fa fa-line-chart"></i> 设备能耗预测分析</h4>
                <div class="ai-controls">
                  <div class="ai-model-selector">
                    <el-select v-model="selectedAiModel" size="small" style="width: 120px;">
                      <el-option label="LSTM" value="lstm" />
                      <el-option label="Prophet" value="prophet" />
                      <el-option label="ARIMA" value="arima" />
                      <el-option label="XGBoost" value="xgboost" />
                    </el-select>
                  </div>
                  <div class="time-granularity">
                    <el-button-group size="small">
                      <el-button 
                        :type="selectedTimeGranularity === 'day' ? 'primary' : ''"
                        @click="selectedTimeGranularity = 'day'"
                      >日</el-button>
                      <el-button 
                        :type="selectedTimeGranularity === 'week' ? 'primary' : ''"
                        @click="selectedTimeGranularity = 'week'"
                      >周</el-button>
                      <el-button 
                        :type="selectedTimeGranularity === 'month' ? 'primary' : ''"
                        @click="selectedTimeGranularity = 'month'"
                      >月</el-button>
                      <el-button 
                        :type="selectedTimeGranularity === 'year' ? 'primary' : ''"
                        @click="selectedTimeGranularity = 'year'"
                      >年</el-button>
                    </el-button-group>
                  </div>
                </div>
              </div>
              
              <div class="forecast-metrics">
                <el-row :gutter="15">
                  <el-col :span="6" v-for="metric in forecastMetrics" :key="metric.name">
                    <div class="ai-metric-card">
                      <div class="ai-metric-value">{{ metric.value }}</div>
                      <div class="ai-metric-label">{{ metric.label }}</div>
                      <div class="ai-metric-trend" :class="metric.trend">
                        <i :class="metric.trend === 'up' ? 'fa fa-arrow-up' : 'fa fa-arrow-down'"></i>
                        {{ metric.change }}%
                      </div>
                    </div>
                  </el-col>
                </el-row>
              </div>

              <div class="forecast-chart">
                <div id="aiForecastChart" class="ai-chart-container"></div>
              </div>

              <div class="forecast-insights">
                <el-alert
                  v-for="insight in forecastInsights"
                  :key="insight.id"
                  :type="insight.type"
                  :title="insight.title"
                  :description="insight.description"
                  show-icon
                  class="forecast-insight"
                />
              </div>

              <div class="ai-analysis-reports">
                <div class="ai-reports-header">
                  <h5><i class="fa fa-file-text"></i> AI分析报告列表</h5>
                  <el-button size="small" type="primary" link @click="viewAllForecastReports">
                    查看全部
                  </el-button>
                </div>
                <el-table :data="forecastReports" size="small" style="width: 100%">
                  <el-table-column prop="time" label="分析时间" min-width="100">
                    <template #default="scope">
                      {{ formatReportTime(scope.row.time) }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="model" label="预测模型" min-width="100">
                    <template #default="scope">
                      <el-tag size="small" :type="getModelTagType(scope.row.model)">
                        {{ getModelName(scope.row.model) }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="accuracy" label="准确率" min-width="80">
                    <template #default="scope">
                      {{ scope.row.accuracy }}%
                    </template>
                  </el-table-column>
                  <el-table-column prop="prediction" label="预测值" min-width="100">
                    <template #default="scope">
                      {{ scope.row.prediction }} kWh
                    </template>
                  </el-table-column>
                  <el-table-column prop="confidence" label="置信度" min-width="100">
                    <template #default="scope">
                      <el-progress 
                        :percentage="scope.row.confidence" 
                        :stroke-width="6"
                        :show-text="false"
                        :color="getConfidenceColor(scope.row.confidence)"
                      />
                      <span style="font-size: 12px; color: var(--text-secondary);">
                        {{ scope.row.confidence }}%
                      </span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="status" label="状态" min-width="80">
                    <template #default="scope">
                      <el-tag 
                        :type="scope.row.status === 'completed' ? 'success' : 'warning'" 
                        size="small"
                      >
                        {{ scope.row.status === 'completed' ? '已完成' : '进行中' }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" min-width="80" fixed="right">
                    <template #default="scope">
                      <el-button type="primary" size="small" link @click="viewForecastReportDetail(scope.row)">
                        查看详情
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </div>

            <!-- 关联性分析 -->
            <div v-if="aiAnalysisType === 'correlation'" class="correlation-analysis">
              <div class="ai-section-header">
                <h4><i class="fa fa-share-alt"></i> 系统关联性分析</h4>
                <div class="correlation-controls">
                  <el-slider
                    v-model="correlationThreshold"
                    :min="0.3"
                    :max="1.0"
                    :step="0.1"
                    :format-tooltip="formatCorrelationTooltip"
                    style="width: 200px;"
                  />
                  <span class="correlation-threshold-label">阈值: {{ correlationThreshold }}</span>
                </div>
              </div>



              <div class="correlation-insights">
                <el-row :gutter="15">
                  <el-col :span="8" v-for="insight in correlationInsights" :key="insight.id">
                    <el-card shadow="hover" class="correlation-insight-card">
                      <div class="correlation-strength" :class="insight.strength">
                        <i :class="getCorrelationIcon(insight.strength)"></i>
                        {{ insight.strengthText }}
                      </div>
                      <div class="correlation-systems">{{ insight.systems }}</div>
                      <div class="correlation-description">{{ insight.description }}</div>
                      <div class="correlation-recommendation">{{ insight.recommendation }}</div>
                    </el-card>
                  </el-col>
                </el-row>
              </div>

              <div class="ai-analysis-reports">
                <div class="ai-reports-header">
                  <h5><i class="fa fa-file-text"></i> AI关联性分析报告列表</h5>
                  <el-button size="small" type="primary" link @click="viewAllCorrelationReports">
                    查看全部
                  </el-button>
                </div>
                <el-table :data="correlationReports" size="small" style="width: 100%">
                  <el-table-column prop="time" label="分析时间" min-width="100">
                    <template #default="scope">
                      {{ formatReportTime(scope.row.time) }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="metric" label="分析指标" min-width="120">
                    <template #default="scope">
                      {{ getMetricName(scope.row.metric) }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="coefficient" label="相关系数" min-width="100">
                    <template #default="scope">
                      {{ scope.row.coefficient }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="significance" label="显著性" min-width="80">
                    <template #default="scope">
                      <el-tag 
                        :type="getSignificanceTagType(scope.row.significance)" 
                        size="small"
                      >
                        {{ getSignificanceName(scope.row.significance) }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="insights" label="洞察" min-width="180">
                    <template #default="scope">
                      <span class="insight-text">{{ scope.row.insights }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="status" label="状态" min-width="90">
                    <template #default="scope">
                      <el-tag 
                        :type="getStatusTagType(scope.row.status)" 
                        size="small"
                      >
                        {{ getStatusName(scope.row.status) }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" min-width="100" fixed="right">
                    <template #default="scope">
                      <el-button type="primary" size="small" link @click="viewCorrelationReportDetail(scope.row)">
                        查看详情
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </div>

            <!-- 策略推荐 -->
            <div v-if="aiAnalysisType === 'recommendation'" class="recommendation-analysis">
              <div class="ai-section-header">
                <h4><i class="fa fa-lightbulb-o"></i> AI智能策略推荐</h4>
                <div class="recommendation-filters">
                  <el-select v-model="recommendationFilter" size="small" style="width: 120px;">
                    <el-option label="全部策略" value="all" />
                    <el-option label="短期" value="short" />
                    <el-option label="中期" value="medium" />
                    <el-option label="长期" value="long" />
                  </el-select>
                </div>
              </div>

              <div class="recommendation-cards">
                <el-row :gutter="15">
                  <el-col :span="8" v-for="recommendation in aiRecommendations" :key="recommendation.id">
                    <el-card shadow="hover" class="recommendation-card">
                      <div class="recommendation-header">
                        <div class="recommendation-icon" :style="{ background: recommendation.color }">
                          <i :class="recommendation.icon"></i>
                        </div>
                        <div class="recommendation-info">
                          <h5>{{ recommendation.title }}</h5>
                          <div class="recommendation-match">
                            <el-progress 
                              :percentage="recommendation.matchScore" 
                              :color="getMatchScoreColor(recommendation.matchScore)"
                              :stroke-width="6"
                              :show-text="false"
                            />
                            <span class="match-text">匹配度 {{ recommendation.matchScore }}%</span>
                          </div>
                        </div>
                      </div>
                      <div class="recommendation-details">
                        <div class="recommendation-description">{{ recommendation.description }}</div>
                        <div class="recommendation-expected">
                          <div class="expected-item">
                            <span class="expected-label">预期节能率:</span>
                            <span class="expected-value">{{ recommendation.expectedSaving }}%</span>
                          </div>
                          <div class="expected-item">
                            <span class="expected-label">投资回报期:</span>
                            <span class="expected-value">{{ recommendation.paybackPeriod }}月</span>
                          </div>
                          <div class="expected-item">
                            <span class="expected-label">实施难度:</span>
                            <span class="expected-value">{{ recommendation.difficulty }}</span>
                          </div>
                        </div>
                      </div>
                      <div class="recommendation-actions">
                        <el-button size="small" type="primary" @click="viewRecommendationDetail(recommendation)">
                          查看详情
                        </el-button>
                        <el-button size="small" @click="applyRecommendation(recommendation)">
                          应用策略
                        </el-button>
                      </div>
                    </el-card>
                  </el-col>
                </el-row>
              </div>

              <div class="ai-analysis-reports">
                <div class="ai-reports-header">
                  <h5><i class="fa fa-file-text"></i> AI策略推荐报告列表</h5>
                  <el-button size="small" type="primary" link @click="viewAllRecommendationReports">
                    查看全部
                  </el-button>
                </div>
                <el-table :data="recommendationReports" size="small" style="width: 100%">
                  <el-table-column prop="time" label="分析时间" min-width="100">
                    <template #default="scope">
                      {{ formatReportTime(scope.row.time) }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="strategy" label="策略名称" min-width="120">
                    <template #default="scope">
                      {{ scope.row.strategy }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="category" label="策略类别" min-width="100">
                    <template #default="scope">
                      <el-tag 
                        :type="getCategoryTagType(scope.row.category)" 
                        size="small"
                      >
                        {{ scope.row.category }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="matchScore" label="匹配度" min-width="80">
                    <template #default="scope">
                      <el-progress 
                        :percentage="scope.row.matchScore" 
                        :stroke-width="6"
                        :show-text="false"
                        :color="getMatchScoreColor(scope.row.matchScore)"
                      />
                      <span class="sub-text">{{ scope.row.matchScore }}分</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="expectedSaving" label="节能率" min-width="80">
                    <template #default="scope">
                      {{ scope.row.expectedSaving }}%
                    </template>
                  </el-table-column>
                  <el-table-column prop="investment" label="投资成本" min-width="100">
                    <template #default="scope">
                      ¥{{ scope.row.investment }}万
                    </template>
                  </el-table-column>
                  <el-table-column prop="payback" label="回收期" min-width="80">
                    <template #default="scope">
                      {{ scope.row.payback }}年
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" min-width="100" fixed="right">
                    <template #default="scope">
                      <el-button type="primary" size="small" link @click="viewRecommendationReportDetail(scope.row)">
                        查看详情
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </div>

            <!-- 影响分析 -->
            <div v-if="aiAnalysisType === 'impact'" class="impact-analysis">
              <div class="ai-section-header">
                <h4><i class="fa fa-chart-line"></i> 策略影响分析</h4>
                <div class="impact-selector">
                  <el-select v-model="selectedImpactStrategy" size="small" style="width: 150px;">
                    <el-option 
                      v-for="strategy in availableStrategies" 
                      :key="strategy.id" 
                      :label="strategy.name" 
                      :value="strategy.id" 
                    />
                  </el-select>
                </div>
              </div>

              <div class="impact-metrics">
                <el-row :gutter="15">
                  <el-col :span="6" v-for="metric in impactMetrics" :key="metric.name">
                    <div class="impact-metric-card">
                      <div class="impact-metric-icon" :style="{ background: metric.color }">
                        <i :class="metric.icon"></i>
                      </div>
                      <div class="impact-metric-content">
                        <div class="impact-metric-value">{{ metric.value }}</div>
                        <div class="impact-metric-label">{{ metric.label }}</div>
                        <div class="impact-metric-change" :class="metric.changeType">
                          <i :class="metric.changeType === 'positive' ? 'fa fa-arrow-up' : 'fa fa-arrow-down'"></i>
                          {{ metric.changeValue }}
                        </div>
                      </div>
                    </div>
                  </el-col>
                </el-row>
              </div>

              <div class="impact-charts">
                <el-row :gutter="15">
                  <el-col :span="12">
                    <div class="impact-chart">
                      <h5>能耗变化预测</h5>
                      <div id="aiImpactEnergyChart" class="ai-chart-container"></div>
                    </div>
                  </el-col>
                  <el-col :span="12">
                    <div class="impact-chart">
                      <h5>成本效益分析</h5>
                      <div id="aiImpactCostChart" class="ai-chart-container"></div>
                    </div>
                  </el-col>
                </el-row>
              </div>

              <div class="impact-summary">
                <el-card shadow="hover" class="impact-summary-card">
                  <h5><i class="fa fa-info-circle"></i> 影响分析总结</h5>
                  <div class="impact-summary-content">
                    <p v-for="summary in impactSummaries" :key="summary.id" class="impact-summary-item">
                      <i :class="summary.icon"></i>
                      {{ summary.content }}
                    </p>
                  </div>
                </el-card>
              </div>

              <div class="ai-analysis-reports">
                <div class="ai-reports-header">
                  <h5><i class="fa fa-file-text"></i> AI影响分析报告列表</h5>
                  <el-button size="small" type="primary" link @click="viewAllImpactReports">
                    查看全部
                  </el-button>
                </div>
                <el-table :data="impactReports" size="small" style="width: 100%">
                  <el-table-column prop="time" label="分析时间" min-width="100">
                    <template #default="scope">
                      {{ formatReportTime(scope.row.time) }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="strategy" label="策略名称" min-width="120">
                    <template #default="scope">
                      {{ scope.row.strategy }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="energyReduction" label="节能效果" min-width="90">
                    <template #default="scope">
                      {{ scope.row.energyReduction }}%
                    </template>
                  </el-table-column>
                  <el-table-column prop="costSaving" label="成本节约" min-width="90">
                    <template #default="scope">
                      ¥{{ scope.row.costSaving }}万
                    </template>
                  </el-table-column>
                  <el-table-column prop="carbonReduction" label="碳减排" min-width="90">
                    <template #default="scope">
                      {{ scope.row.carbonReduction }}t
                    </template>
                  </el-table-column>
                  <el-table-column prop="roi" label="ROI" min-width="80">
                    <template #default="scope">
                      <el-progress 
                        :percentage="scope.row.roi * 4" 
                        :stroke-width="6"
                        :show-text="false"
                        :color="getRoiColor(scope.row.roi)"
                      />
                      <span class="sub-text">{{ scope.row.roi }}%</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="status" label="状态" min-width="90">
                    <template #default="scope">
                      <el-tag 
                        :type="getStatusTagType(scope.row.status)" 
                        size="small"
                      >
                        {{ getStatusName(scope.row.status) }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" min-width="100" fixed="right">
                    <template #default="scope">
                      <el-button type="primary" size="small" link @click="viewImpactReportDetail(scope.row)">
                        查看详情
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </div>
          </div>
        </el-card>
      </div>

      <div class="bottom-section">
        <el-row :gutter="20">
          <el-col :xs="24" :md="12" :lg="12" :xl="12">
            <el-card shadow="hover">
              <template #header>
                <div class="card-header">
                  <span>设备能耗分析</span>
                </div>
              </template>
              <div id="deviceEnergyChart" class="chart-container"></div>
            </el-card>
          </el-col>
          <el-col :xs="24" :md="12" :lg="12" :xl="12">
            <el-card shadow="hover">
              <template #header>
                <div class="card-header">
                  <span>能耗预警记录</span>
                  <el-badge :value="pendingAlertCount" :max="99" class="alert-badge">
                    <el-button size="small" type="primary" link @click="viewAllAlerts">
                      查看全部
                    </el-button>
                  </el-badge>
                </div>
              </template>
              <div class="alert-table">
                <el-table :data="alertRecords" stripe style="width: 100%" max-height="350">
                  <el-table-column prop="time" label="预警时间" width="150">
                    <template #default="scope">
                      {{ formatTime(scope.row.time) }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="station" label="站点" width="100" />
                  <el-table-column prop="area" label="区域" width="80" />
                  <el-table-column prop="type" label="预警类型" width="100">
                    <template #default="scope">
                      <el-tag :type="getAlertTypeTag(scope.row.type)" size="small">
                        {{ getAlertTypeName(scope.row.type) }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="level" label="级别" width="80">
                    <template #default="scope">
                      <el-tag :type="getAlertLevelTag(scope.row.level)" size="small">
                        {{ getAlertLevelName(scope.row.level) }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="80" fixed="right">
                    <template #default="scope">
                      <el-button type="primary" size="small" link @click="handleAlert(scope.row)">
                        <i class="fa fa-eye"></i>
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </div>

    <div v-if="currentView === 'multi'" class="multi-station-view">
      <div class="multi-station-header">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="8" :md="6" :lg="6" :xl="6" v-for="(stat, index) in multiStationStats" :key="index">
            <el-card shadow="hover" class="stat-card">
              <div class="stat-content">
                <div class="stat-icon" :style="{ background: stat.color }">
                  <i :class="stat.icon"></i>
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ stat.value }}</div>
                  <div class="stat-label">{{ stat.label }}</div>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <div class="multi-station-charts">
        <el-row :gutter="20">
          <el-col :xs="24" :md="12" :lg="12" :xl="12">
            <el-card shadow="hover">
              <template #header>
                <div class="card-header">
                  <span>多站能耗对比</span>
                  <el-select v-model="compareMetric" size="small" style="width: 150px;">
                    <el-option label="总能耗" value="totalEnergy" />
                    <el-option label="单位面积能耗" value="unitAreaEnergy" />
                    <el-option label="能耗费用" value="energyCost" />
                  </el-select>
                </div>
              </template>
              <div id="multiStationCompareChart" class="chart-container"></div>
            </el-card>
          </el-col>
          <el-col :xs="24" :md="12" :lg="12" :xl="12">
            <el-card shadow="hover">
              <template #header>
                <div class="card-header">
                  <span>站点分布地图</span>
                </div>
              </template>
              <div id="stationMapChart" class="chart-container"></div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <div class="multi-station-table">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>站点能耗排名</span>
            </div>
          </template>
          <el-table :data="stationRankings" stripe style="width: 100%">
            <el-table-column type="index" label="排名" width="60" />
            <el-table-column prop="name" label="站点名称" width="150" />
            <el-table-column prop="type" label="站点类型" width="100">
              <template #default="scope">
                <el-tag size="small">{{ getStationTypeName(scope.row.type) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="totalEnergy" label="总能耗" width="120">
              <template #default="scope">
                {{ scope.row.totalEnergy }} kWh
              </template>
            </el-table-column>
            <el-table-column prop="unitAreaEnergy" label="单位面积能耗" width="140">
              <template #default="scope">
                {{ scope.row.unitAreaEnergy }} kWh/m²
              </template>
            </el-table-column>
            <el-table-column prop="energyLevel" label="能耗等级" width="100">
              <template #default="scope">
                <el-tag :type="getEnergyLevelTag(scope.row.energyLevel)" size="small">
                  {{ getEnergyLevelName(scope.row.energyLevel) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="alertCount" label="待处理预警" width="100">
              <template #default="scope">
                <el-badge :value="scope.row.alertCount" :type="scope.row.alertCount > 0 ? 'danger' : 'info'" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100">
              <template #default="scope">
                <el-button type="primary" size="small" link @click="viewStationDetail(scope.row)">
                  查看详情
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </div>
    </div>

    <el-dialog
      v-model="showAlertDetailDialog"
      title="预警详情"
      width="600px"
      destroy-on-close
    >
      <div class="alert-detail" v-if="selectedAlert">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="站点" :span="2">
            {{ selectedAlert.station }}
          </el-descriptions-item>
          <el-descriptions-item label="区域">{{ selectedAlert.area }}</el-descriptions-item>
          <el-descriptions-item label="预警类型">
            <el-tag :type="getAlertTypeTag(selectedAlert.type)" size="small">
              {{ getAlertTypeName(selectedAlert.type) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="预警级别">
            <el-tag :type="getAlertLevelTag(selectedAlert.level)" size="small">
              {{ getAlertLevelName(selectedAlert.level) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="预警时间">
            {{ formatTime(selectedAlert.time) }}
          </el-descriptions-item>
          <el-descriptions-item label="当前值">
            {{ selectedAlert.value }} kWh
          </el-descriptions-item>
          <el-descriptions-item label="阈值">
            {{ selectedAlert.threshold }} kWh
          </el-descriptions-item>
          <el-descriptions-item label="偏差">
            <span :class="selectedAlert.deviation > 0 ? 'increase' : 'decrease'">
              {{ selectedAlert.deviation > 0 ? '+' : '' }}{{ selectedAlert.deviation }}%
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="描述" :span="2">
            {{ selectedAlert.description }}
          </el-descriptions-item>
          <el-descriptions-item label="原因分析" :span="2">
            {{ selectedAlert.cause }}
          </el-descriptions-item>
          <el-descriptions-item label="处理建议" :span="2">
            {{ selectedAlert.suggestion }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="showAlertDetailDialog = false">关闭</el-button>
        <el-button type="primary" @click="handleAlertProcess(selectedAlert)">
          处理
        </el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="showPersonalizeDialog"
      title="个性化配置"
      width="500px"
      destroy-on-close
    >
      <div class="personalize-form">
        <el-form :model="personalizeForm" label-width="120px">
          <el-form-item label="布局模式">
            <el-select v-model="personalizeForm.layout" placeholder="请选择">
              <el-option label="标准布局" value="standard" />
              <el-option label="紧凑布局" value="compact" />
              <el-option label="大屏布局" value="fullscreen" />
            </el-select>
          </el-form-item>
          <el-form-item label="显示指标">
            <el-checkbox-group v-model="personalizeForm.indicators">
              <el-checkbox label="totalEnergy">总能耗</el-checkbox>
              <el-checkbox label="totalCost">总费用</el-checkbox>
              <el-checkbox label="efficiencyIndex">能效指标</el-checkbox>
              <el-checkbox label="alertCount">预警数量</el-checkbox>
              <el-checkbox label="savingRate">节能率</el-checkbox>
              <el-checkbox label="carbonEmission">碳排放</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
          <el-form-item label="显示图表">
            <el-checkbox-group v-model="personalizeForm.charts">
              <el-checkbox label="energyTrend">能耗趋势图</el-checkbox>
              <el-checkbox label="energyStructure">能耗结构饼图</el-checkbox>
              <el-checkbox label="areaEnergy">区域能耗分析</el-checkbox>
              <el-checkbox label="deviceEnergy">设备能耗分析</el-checkbox>
              <el-checkbox label="savingEffect">节能效果评估</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
          <el-form-item label="阈值预警">
            <el-switch v-model="personalizeForm.enableThresholdAlert" />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="showPersonalizeDialog = false">取消</el-button>
        <el-button type="primary" @click="savePersonalizeConfig">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="showThresholdDialog"
      title="指标阈值设置"
      width="600px"
      destroy-on-close
    >
      <div class="threshold-form">
        <el-form :model="thresholdForm" label-width="120px">
          <el-form-item v-for="(threshold, key) in thresholdForm.thresholds" :key="key" :label="getThresholdLabel(key)">
            <el-input v-model="thresholdForm.thresholds[key]" type="number">
              <template #append>{{ getThresholdUnit(key) }}</template>
            </el-input>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="showThresholdDialog = false">取消</el-button>
        <el-button type="primary" @click="saveThresholdConfig">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { ref, reactive, onMounted, onUnmounted, computed, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'HomeEnhanced',
  setup() {
    const router = useRouter()
    const isDarkMode = ref(false)
    const currentView = ref('single')
    const selectedStation = ref('station1')
    const refreshInterval = ref(60)
    const trendTimeGranularity = ref('day')
    const compareMetric = ref('totalEnergy')
    const showAlertDetailDialog = ref(false)
    const showPersonalizeDialog = ref(false)
    const showThresholdDialog = ref(false)
    const selectedAlert = ref(null)
    
    let energyTrendChart = null
    let energyStructureChart = null
    let energySavingEffectChart = null
    let areaEnergyChart = null
    let deviceEnergyChart = null
    let multiStationCompareChart = null
    let stationMapChart = null
    let refreshTimer = null
    let resizeHandler = null

    const handleResize = () => {
      if (energyTrendChart) energyTrendChart.resize()
      if (energyStructureChart) energyStructureChart.resize()
      if (energySavingEffectChart) energySavingEffectChart.resize()
      if (areaEnergyChart) areaEnergyChart.resize()
      if (deviceEnergyChart) deviceEnergyChart.resize()
      if (multiStationCompareChart) multiStationCompareChart.resize()
      if (stationMapChart) stationMapChart.resize()
    }

    // 多站视图初始化，防止切换后元素存在但图表未创建导致无数据
    const initMultiViewCharts = () => {
      nextTick(() => {
        const compareElement = document.getElementById('multiStationCompareChart')
        if (compareElement) {
          if (multiStationCompareChart) {
            multiStationCompareChart.dispose()
          }
          multiStationCompareChart = echarts.init(compareElement)
        }

        const mapElement = document.getElementById('stationMapChart')
        if (mapElement) {
          if (stationMapChart) {
            stationMapChart.dispose()
          }
          stationMapChart = echarts.init(mapElement)
        }

        if (multiStationCompareChart) renderMultiStationCompareChart()
        if (stationMapChart) renderStationMapChart()
      })
    }

    const stations = ref([
      { id: 'station1', name: '北京南站', type: 'large', capacity: 50000, location: '北京', energyLevel: 1 },
      { id: 'station2', name: '上海虹桥站', type: 'large', capacity: 45000, location: '上海', energyLevel: 1 },
      { id: 'station3', name: '广州南站', type: 'large', capacity: 42000, location: '广州', energyLevel: 2 },
      { id: 'station4', name: '深圳北站', type: 'large', capacity: 38000, location: '深圳', energyLevel: 2 },
      { id: 'station5', name: '南京南站', type: 'medium', capacity: 28000, location: '南京', energyLevel: 2 },
      { id: 'station6', name: '杭州东站', type: 'medium', capacity: 25000, location: '杭州', energyLevel: 1 },
      { id: 'station7', name: '成都东站', type: 'large', capacity: 40000, location: '成都', energyLevel: 3 },
      { id: 'station8', name: '武汉站', type: 'large', capacity: 35000, location: '武汉', energyLevel: 2 },
      { id: 'station9', name: '西安北站', type: 'large', capacity: 32000, location: '西安', energyLevel: 3 },
      { id: 'station10', name: '重庆北站', type: 'large', capacity: 30000, location: '重庆', energyLevel: 3 }
    ])

    const currentScenario = ref({
      name: '高峰时段',
      type: 'peak',
      icon: 'fa fa-bolt'
    })

    const filterForm = reactive({
      stationType: '',
      energyLevel: '',
      timeRange: []
    })

    const personalizeForm = reactive({
      layout: 'standard',
      indicators: ['totalEnergy', 'totalCost', 'efficiencyIndex', 'alertCount'],
      charts: ['energyTrend', 'energyStructure', 'areaEnergy', 'deviceEnergy'],
      enableThresholdAlert: true
    })

    const thresholdForm = reactive({
      thresholds: {
        totalEnergy: 15000,
        totalCost: 12000,
        efficiencyIndex: 15,
        alertCount: 10,
        savingRate: 20
      }
    })

    const coreIndicators = computed(() => [
      {
        label: '总能耗',
        value: '12,543.6',
        unit: 'kWh',
        icon: 'fa fa-bolt',
        color: '#409EFF',
        class: 'energy',
        change: -2.3,
        threshold: thresholdForm.thresholds.totalEnergy
      },
      {
        label: '总费用',
        value: '8,960.5',
        unit: '¥',
        icon: 'fa fa-yen',
        color: '#67C23A',
        class: 'cost',
        change: -1.8,
        threshold: thresholdForm.thresholds.totalCost
      },
      {
        label: '节能率',
        value: '15.8',
        unit: '%',
        icon: 'fa fa-pie-chart',
        color: '#E6A23C',
        class: 'saving',
        change: 3.2,
        threshold: thresholdForm.thresholds.savingRate || 20
      },
      {
        label: '能效指标',
        value: '12.5',
        unit: 'kgce/人',
        icon: 'fa fa-line-chart',
        color: '#909399',
        class: 'efficiency',
        change: -0.5,
        threshold: thresholdForm.thresholds.efficiencyIndex
      }
    ])

    const alertRecords = ref([
      {
        time: new Date(),
        station: '北京南站',
        area: '候车厅',
        type: 'over_consumption',
        level: 'urgent',
        description: '候车厅照明能耗超出阈值15%',
        value: 3450,
        threshold: 3000,
        deviation: 15,
        cause: '照明系统长时间处于高亮度模式，且自然采光不足',
        suggestion: '建议调整照明系统亮度策略，增加智能感应控制'
      },
      {
        time: new Date(Date.now() - 3600000),
        station: '上海虹桥站',
        area: '空调系统',
        type: 'abnormal',
        level: 'important',
        description: '空调系统能耗异常波动',
        value: 5200,
        threshold: 4500,
        deviation: 15.6,
        cause: '空调系统参数设置不当，导致频繁启停',
        suggestion: '优化空调系统运行参数，调整温度设定值'
      },
      {
        time: new Date(Date.now() - 7200000),
        station: '广州南站',
        area: '电梯系统',
        type: 'over_consumption',
        level: 'normal',
        description: '电梯系统能耗超出阈值20%',
        value: 1800,
        threshold: 1500,
        deviation: 20,
        cause: '电梯运行模式不合理，高峰期等待时间过长',
        suggestion: '优化电梯群控策略，调整运行参数'
      },
      {
        time: new Date(Date.now() - 10800000),
        station: '杭州东站',
        area: '通风系统',
        type: 'abnormal',
        level: 'important',
        description: '通风系统运行效率下降',
        value: 2100,
        threshold: 1800,
        deviation: 16.7,
        cause: '通风设备维护不及时，风道积尘严重',
        suggestion: '立即进行设备维护清理，检查风道是否畅通'
      }
    ])

    const areaRankings = ref([
      { id: 1, name: '候车厅', energy: 45230, percentage: 35 },
      { id: 2, name: '站台层', energy: 32450, percentage: 25 },
      { id: 3, name: '空调机房', energy: 25960, percentage: 20 },
      { id: 4, name: '站前广场', energy: 12980, percentage: 10 },
      { id: 5, name: '地下停车场', energy: 10384, percentage: 8 }
    ])

    const stationRankings = ref([
      { id: 1, name: '北京南站', type: 'large', totalEnergy: 156230, unitAreaEnergy: 12.5, energyLevel: 1, alertCount: 2 },
      { id: 2, name: '上海虹桥站', type: 'large', totalEnergy: 148560, unitAreaEnergy: 11.8, energyLevel: 1, alertCount: 1 },
      { id: 3, name: '广州南站', type: 'large', totalEnergy: 142300, unitAreaEnergy: 12.1, energyLevel: 2, alertCount: 3 },
      { id: 4, name: '杭州东站', type: 'medium', totalEnergy: 89650, unitAreaEnergy: 10.5, energyLevel: 2, alertCount: 1 },
      { id: 5, name: '南京南站', type: 'medium', totalEnergy: 78560, unitAreaEnergy: 9.8, energyLevel: 2, alertCount: 0 },
      { id: 6, name: '武汉站', type: 'large', totalEnergy: 123450, unitAreaEnergy: 11.2, energyLevel: 1, alertCount: 2 },
      { id: 7, name: '西安北站', type: 'large', totalEnergy: 98760, unitAreaEnergy: 10.8, energyLevel: 2, alertCount: 1 },
      { id: 8, name: '成都东站', type: 'large', totalEnergy: 112340, unitAreaEnergy: 11.5, energyLevel: 2, alertCount: 2 }
    ])

    const multiStationStats = computed(() => [
      { label: '总车站数', value: '8', icon: 'fa fa-building', color: '#409EFF' },
      { label: '总能耗(kWh)', value: '948,846', icon: 'fa fa-bolt', color: '#67C23A' },
      { label: '总费用(¥)', value: '678,432', icon: 'fa fa-yen', color: '#E6A23C' },
      { label: '平均节能率', value: '14.2%', icon: 'fa fa-pie-chart', color: '#909399' }
    ])

    const pendingAlertCount = computed(() => {
      return alertRecords.value.filter(alert => alert.level === 'urgent' || alert.level === 'important').length
    })

    const initCharts = () => {
      const chartIds = ['energyTrendChart', 'energyStructureChart', 'energySavingEffectChart', 'areaEnergyChart', 'deviceEnergyChart', 'multiStationCompareChart', 'stationMapChart']
      
      chartIds.forEach(id => {
        const element = document.getElementById(id)
        if (!element) {
          console.warn(`Chart element ${id} not found`)
          return
        }
      })

      const trendElement = document.getElementById('energyTrendChart')
      if (trendElement) energyTrendChart = echarts.init(trendElement)
      
      const structureElement = document.getElementById('energyStructureChart')
      if (structureElement) energyStructureChart = echarts.init(structureElement)
      
      const savingElement = document.getElementById('energySavingEffectChart')
      if (savingElement) energySavingEffectChart = echarts.init(savingElement)
      
      const areaElement = document.getElementById('areaEnergyChart')
      if (areaElement) areaEnergyChart = echarts.init(areaElement)
      
      const deviceElement = document.getElementById('deviceEnergyChart')
      if (deviceElement) deviceEnergyChart = echarts.init(deviceElement)
      
      const compareElement = document.getElementById('multiStationCompareChart')
      if (compareElement) multiStationCompareChart = echarts.init(compareElement)
      
      const mapElement = document.getElementById('stationMapChart')
      if (mapElement) stationMapChart = echarts.init(mapElement)

      if (energyTrendChart) renderEnergyTrendChart()
      if (energyStructureChart) renderEnergyStructureChart()
      if (energySavingEffectChart) renderEnergySavingEffectChart()
      if (areaEnergyChart) renderAreaEnergyChart()
      if (deviceEnergyChart) renderDeviceEnergyChart()
      if (multiStationCompareChart) renderMultiStationCompareChart()
      if (stationMapChart) renderStationMapChart()
    }

    const renderEnergyTrendChart = () => {
      const hours = []
      const energyData = []
      for (let i = 0; i < 24; i++) {
        hours.push(`${i}:00`)
        energyData.push(Math.round(400 + Math.random() * 200))
      }

      const option = {
        tooltip: { trigger: 'axis' },
        legend: { data: ['实际能耗', '基准能耗', '节能目标'], bottom: 0 },
        grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
        xAxis: { type: 'category', data: hours },
        yAxis: { type: 'value', name: 'kWh' },
        series: [
          { name: '实际能耗', type: 'line', smooth: true, data: energyData, lineStyle: { width: 3 }, itemStyle: { color: '#409EFF' } },
          { name: '基准能耗', type: 'line', data: energyData.map(v => v * 1.15), lineStyle: { type: 'dashed' }, itemStyle: { color: '#909399' } },
          { name: '节能目标', type: 'line', data: energyData.map(v => v * 0.9), lineStyle: { type: 'dotted' }, itemStyle: { color: '#67C23A' } }
        ]
      }
      energyTrendChart.setOption(option)
    }

    const renderEnergyStructureChart = () => {
      const option = {
        tooltip: { trigger: 'item', formatter: '{b}: {c} kWh ({d}%)' },
        legend: { bottom: 0 },
        series: [{
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
          label: { show: false },
          emphasis: { label: { show: true, fontSize: 16, fontWeight: 'bold' } },
          data: [
            { value: 45230, name: '候车厅', itemStyle: { color: '#409EFF' } },
            { value: 32450, name: '站台层', itemStyle: { color: '#67C23A' } },
            { value: 25960, name: '空调机房', itemStyle: { color: '#E6A23C' } },
            { value: 12980, name: '站前广场', itemStyle: { color: '#909399' } },
            { value: 10384, name: '地下停车场', itemStyle: { color: '#F56C6C' } }
          ]
        }]
      }
      energyStructureChart.setOption(option)
    }

    const renderEnergySavingEffectChart = () => {
      const option = {
        tooltip: { trigger: 'axis' },
        legend: { data: ['节能效果', '成本节约'], bottom: 0 },
        grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
        xAxis: { type: 'category', data: ['1月', '2月', '3月', '4月', '5月', '6月'] },
        yAxis: { type: 'value' },
        series: [
          { name: '节能效果', type: 'bar', data: [12.5, 13.2, 14.1, 14.8, 15.3, 15.8], itemStyle: { color: '#409EFF' } },
          { name: '成本节约', type: 'line', smooth: true, data: [10.2, 11.5, 12.8, 13.5, 14.2, 15.1], itemStyle: { color: '#67C23A' } }
        ]
      }
      energySavingEffectChart.setOption(option)
    }

    const renderAreaEnergyChart = () => {
      const option = {
        tooltip: { trigger: 'item' },
        series: [{
          type: 'treemap',
          width: '90%',
          height: '80%',
          breadcrumb: { show: false },
          label: { show: true, formatter: '{b}\\n{c} kWh' },
          itemStyle: { borderColor: '#fff' },
          data: [
            { name: '候车厅', value: 45230, itemStyle: { color: '#409EFF' } },
            { name: '站台层', value: 32450, itemStyle: { color: '#67C23A' } },
            { name: '空调机房', value: 25960, itemStyle: { color: '#E6A23C' } },
            { name: '站前广场', value: 12980, itemStyle: { color: '#909399' } },
            { name: '地下停车场', value: 10384, itemStyle: { color: '#F56C6C' } }
          ]
        }]
      }
      areaEnergyChart.setOption(option)
    }

    const renderDeviceEnergyChart = () => {
      const option = {
        tooltip: { trigger: 'axis' },
        legend: { data: ['照明', '空调', '电梯', '通风'], bottom: 0 },
        grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
        xAxis: { type: 'category', data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '23:59'] },
        yAxis: { type: 'value', name: 'kWh' },
        series: [
          { name: '照明', type: 'bar', stack: 'total', data: [120, 80, 350, 420, 380, 450, 380], itemStyle: { color: '#409EFF' } },
          { name: '空调', type: 'bar', stack: 'total', data: [180, 150, 480, 680, 620, 580, 400], itemStyle: { color: '#67C23A' } },
          { name: '电梯', type: 'bar', stack: 'total', data: [50, 30, 180, 280, 250, 220, 150], itemStyle: { color: '#E6A23C' } },
          { name: '通风', type: 'bar', stack: 'total', data: [80, 70, 150, 180, 170, 160, 120], itemStyle: { color: '#909399' } }
        ]
      }
      deviceEnergyChart.setOption(option)
    }

    const renderMultiStationCompareChart = () => {
      const option = {
        tooltip: { trigger: 'axis' },
        legend: { data: ['北京南站', '上海虹桥站', '广州南站'], bottom: 0 },
        grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
        xAxis: { type: 'category', data: ['1月', '2月', '3月', '4月', '5月', '6月'] },
        yAxis: { type: 'value', name: compareMetric.value === 'energyCost' ? '¥' : 'kWh' },
        series: [
          { name: '北京南站', type: 'bar', data: [24500, 23800, 25200, 24100, 25600, 24800], itemStyle: { color: '#409EFF' } },
          { name: '上海虹桥站', type: 'bar', data: [23800, 23200, 24500, 23900, 24800, 24100], itemStyle: { color: '#67C23A' } },
          { name: '广州南站', type: 'bar', data: [22800, 22500, 23500, 23200, 24200, 23800], itemStyle: { color: '#E6A23C' } }
        ]
      }
      multiStationCompareChart.setOption(option)
    }

    const renderStationMapChart = () => {
      const option = {
        tooltip: { trigger: 'item' },
        xAxis: { show: false, min: 0, max: 100 },
        yAxis: { show: false, min: 0, max: 100 },
        series: [{
          type: 'graph',
          layout: 'none',
          symbolSize: 20,
          roam: true,
          label: { show: true, position: 'right', formatter: '{b}' },
          edgeSymbol: ['circle', 'arrow'],
          edgeSymbolSize: [4, 10],
          data: [
            { name: '北京南站', x: 80, y: 60, itemStyle: { color: '#409EFF' } },
            { name: '上海虹桥站', x: 85, y: 45, itemStyle: { color: '#67C23A' } },
            { name: '广州南站', x: 70, y: 10, itemStyle: { color: '#E6A23C' } },
            { name: '杭州东站', x: 88, y: 35, itemStyle: { color: '#909399' } },
            { name: '南京南站', x: 75, y: 40, itemStyle: { color: '#F56C6C' } }
          ],
          links: [
            { source: '北京南站', target: '上海虹桥站' },
            { source: '上海虹桥站', target: '杭州东站' },
            { source: '杭州东站', target: '南京南站' },
            { source: '南京南站', target: '广州南站' }
          ],
          lineStyle: { color: 'source', curveness: 0.1 }
        }]
      }
      stationMapChart.setOption(option)
    }

    const refreshData = () => {
      ElMessage.success('数据已刷新')
      renderEnergyTrendChart()
      renderEnergyStructureChart()
      // 多站模式下同步刷新多站图表数据
      if (currentView.value === 'multi') {
        initMultiViewCharts()
      }
    }

    const handleRefreshIntervalChange = (command) => {
      refreshInterval.value = parseInt(command)
      ElMessage.success(`刷新间隔已设置为 ${refreshInterval.value}秒`)
      if (refreshTimer) clearInterval(refreshTimer)
      refreshTimer = setInterval(() => {
        refreshData()
      }, refreshInterval.value * 1000)
    }

    const handleExport = (command) => {
      ElMessage.success(`正在导出${command === 'excel' ? 'Excel' : 'PDF'}文件...`)
    }

    const toggleTheme = () => {
      isDarkMode.value = !isDarkMode.value
      document.body.classList.toggle('dark-mode', isDarkMode.value)
      localStorage.setItem('darkMode', isDarkMode.value)
      const theme = isDarkMode.value ? 'dark' : 'light'
      if (energyTrendChart) energyTrendChart.dispose()
      if (energyStructureChart) energyStructureChart.dispose()
      if (energySavingEffectChart) energySavingEffectChart.dispose()
      if (areaEnergyChart) areaEnergyChart.dispose()
      if (deviceEnergyChart) deviceEnergyChart.dispose()
      if (multiStationCompareChart) multiStationCompareChart.dispose()
      if (stationMapChart) stationMapChart.dispose()
      energyTrendChart = null
      energyStructureChart = null
      energySavingEffectChart = null
      areaEnergyChart = null
      deviceEnergyChart = null
      multiStationCompareChart = null
      stationMapChart = null
      setTimeout(initCharts, 100)
    }

    const handleViewChange = (view) => {
      setTimeout(() => {
        if (view === 'multi') {
          initMultiViewCharts()
        } else {
          initCharts()
        }
      }, 100)
    }

    const handleTrendGranularityChange = () => {
      renderEnergyTrendChart()
      ElMessage.success(`时间粒度已切换为${getTimeGranularityName(trendTimeGranularity.value)}`)
    }

    const getTimeGranularityName = (granularity) => {
      const names = { hour: '小时', day: '日', week: '周', month: '月', year: '年' }
      return names[granularity] || granularity
    }

    const applyFilters = () => {
      ElMessage.success('筛选条件已应用')
      refreshData()
    }

    const resetFilters = () => {
      filterForm.stationType = ''
      filterForm.energyLevel = ''
      filterForm.timeRange = []
      ElMessage.success('筛选条件已重置')
    }

    const getScenarioType = (type) => {
      const types = { peak: 'danger', normal: 'success', low: 'info' }
      return types[type] || 'info'
    }

    const getThresholdPercentage = (indicator) => {
      if (!indicator.threshold || !indicator.value) return 0
      const value = parseFloat(indicator.value.replace(/,/g, ''))
      return Math.min(100, Math.round((value / indicator.threshold) * 100))
    }

    const getThresholdColor = (indicator) => {
      const percentage = getThresholdPercentage(indicator)
      if (percentage >= 90) return '#F56C6C'
      if (percentage >= 70) return '#E6A23C'
      return '#67C23A'
    }

    const getRankingColor = (index) => {
      const colors = ['#F56C6C', '#E6A23C', '#409EFF', '#67C23A', '#909399']
      return colors[index] || colors[4]
    }

    const getAlertTypeName = (type) => {
      const names = { over_consumption: '能耗超标', abnormal: '能耗异常', efficiency_low: '能效偏低' }
      return names[type] || type
    }

    const getAlertTypeTag = (type) => {
      const tags = { over_consumption: 'danger', abnormal: 'warning', efficiency_low: 'info' }
      return tags[type] || 'info'
    }

    const getAlertLevelName = (level) => {
      const names = { urgent: '紧急', important: '重要', normal: '一般' }
      return names[level] || level
    }

    const getAlertLevelTag = (level) => {
      const tags = { urgent: 'danger', important: 'warning', normal: 'info' }
      return tags[level] || 'info'
    }

    const getEnergyLevelName = (level) => {
      const names = { 1: '一级(优秀)', 2: '二级(良好)', 3: '三级(一般)', 4: '四级(较差)' }
      return names[level] || level
    }

    const getEnergyLevelTag = (level) => {
      const tags = { 1: 'success', 2: '', 3: 'warning', 4: 'danger' }
      return tags[level] || 'info'
    }

    const getStationTypeName = (type) => {
      const names = { large: '大型站', medium: '中型站', small: '小型站' }
      return names[type] || type
    }

    const getStationTypeTag = (type) => {
      const tags = { large: 'primary', medium: 'success', small: 'warning' }
      return tags[type] || 'info'
    }

    const formatTime = (time) => {
      if (!time) return '-'
      const date = new Date(time)
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
    }

    const handleAlert = (alert) => {
      selectedAlert.value = alert
      showAlertDetailDialog.value = true
    }

    const handleAlertProcess = (alert) => {
      ElMessage.success('预警已标记为已处理')
      showAlertDetailDialog.value = false
    }

    const viewAreaRankingDetail = () => {
      ElMessage.info('查看区域排名详情')
    }

    const viewAreaDetail = (area) => {
      ElMessage.info(`查看${area.name}详情`)
    }

    const viewAllAlerts = () => {
      router.push({ name: 'EnergyAlert' })
    }

    const viewStationDetail = (station) => {
      router.push({ 
        name: 'StationAnalysis', 
        query: { id: station.id, name: station.name }
      })
    }

    const savePersonalizeConfig = () => {
      localStorage.setItem('personalizeConfig', JSON.stringify(personalizeForm))
      ElMessage.success('个性化配置已保存')
      showPersonalizeDialog.value = false
    }

    const saveThresholdConfig = () => {
      localStorage.setItem('thresholdConfig', JSON.stringify(thresholdForm))
      ElMessage.success('阈值设置已保存')
      showThresholdDialog.value = false
    }

    // AI分析相关函数
    const generateAiAnalysis = () => {
      console.log('生成AI分析报告...', aiAnalysisFilter)
      
      if (!aiAnalysisFilter.timeRange || aiAnalysisFilter.timeRange.length === 0) {
        ElMessage.warning('请选择分析时间范围')
        return
      }
      
      if (!aiAnalysisFilter.selectedStations || aiAnalysisFilter.selectedStations.length === 0) {
        ElMessage.warning('请选择至少一个站点')
        return
      }

      if (!aiAnalysisFilter.analysisType) {
        ElMessage.warning('请选择分析类型')
        return
      }

      // 显示加载状态
      const loadingMessage = ElMessage({
        message: '正在生成AI分析报告...',
        type: 'loading',
        duration: 2000
      })
      
      // 模拟生成过程并填充数据
      setTimeout(() => {
        // 获取选中的站点详细信息
        const selectedStationsData = stations.value.filter(station => 
          aiAnalysisFilter.selectedStations.includes(station.id)
        )
        
        // 根据分析类型生成不同的报告内容
        const analysisReport = generateAnalysisByType(aiAnalysisFilter.analysisType, selectedStationsData)
        
        // 填充汇总数据
        aiAnalysisResults.show = true
        aiAnalysisResults.dataStats = {
          stationCount: aiAnalysisFilter.selectedStations.length,
          daysCount: calculateDaysInRange(aiAnalysisFilter.timeRange),
          deviceCount: selectedStationsData.reduce((sum, station) => sum + Math.floor(station.capacity / 50), 0),
          totalEnergy: analysisReport.totalEnergy
        }
        
        aiAnalysisResults.keyFindings = analysisReport.keyFindings
        
        aiAnalysisResults.trendAnalysis = analysisReport.trendAnalysis
        
        aiAnalysisResults.conclusions = analysisReport.conclusions
        
        ElMessage.success('AI分析报告生成完成')
      }, 2000)
    }

    // 根据分析类型生成报告
    const generateAnalysisByType = (analysisType, selectedStations) => {
      const baseEnergy = selectedStations.reduce((sum, station) => sum + station.capacity * 0.8, 0)
      const avgEnergyLevel = selectedStations.reduce((sum, station) => sum + station.energyLevel, 0) / selectedStations.length
      
      switch (analysisType) {
        case 'comprehensive':
          return generateComprehensiveAnalysis(selectedStations, baseEnergy, avgEnergyLevel)
        case 'trend':
          return generateTrendAnalysis(selectedStations, baseEnergy, avgEnergyLevel)
        case 'efficiency':
          return generateEfficiencyAnalysis(selectedStations, baseEnergy, avgEnergyLevel)
        case 'saving':
          return generateSavingAnalysis(selectedStations, baseEnergy, avgEnergyLevel)
        default:
          return generateComprehensiveAnalysis(selectedStations, baseEnergy, avgEnergyLevel)
      }
    }

    // 综合分析报告
    const generateComprehensiveAnalysis = (stations, baseEnergy, avgEnergyLevel) => {
      const efficiency = Math.max(0.75, Math.min(0.95, 1 - (avgEnergyLevel - 1) * 0.1))
      const savingRate = (1 - efficiency) * 100
      
      return {
        totalEnergy: Math.round(baseEnergy * efficiency),
        keyFindings: [
          { 
            id: 'KF001', 
            title: '综合能效表现', 
            description: `${stations.length}个站点平均能效等级为${avgEnergyLevel.toFixed(1)}级，表现${avgEnergyLevel <= 2 ? '优秀' : '良好'}`, 
            impact: avgEnergyLevel <= 2 ? 'positive' : 'neutral',
            type: avgEnergyLevel <= 2 ? 'success' : 'warning',
            icon: 'fa fa-star',
            metricTrend: avgEnergyLevel <= 2 ? 'down' : 'up',
            metricValue: `${savingRate.toFixed(1)}%`
          },
          { 
            id: 'KF002', 
            title: '站点差异分析', 
            description: '大型站与中型站在能耗控制方面存在显著差异', 
            impact: 'neutral',
            type: 'info',
            icon: 'fa fa-balance-scale',
            metricTrend: 'up',
            metricValue: '15.3%'
          },
          { 
            id: 'KF003', 
            title: '优化潜力评估', 
            description: '基于历史数据分析，仍有进一步优化空间', 
            impact: 'positive',
            type: 'info',
            icon: 'fa fa-lightbulb-o',
            metricTrend: 'down',
            metricValue: '8.7%'
          }
        ],
        trendAnalysis: [
          { 
            id: 'TA001', 
            title: '整体能耗趋势', 
            description: '分析期间整体能耗呈下降趋势', 
            change: -2.3,
            direction: 'down'
          },
          { 
            id: 'TA002', 
            title: '季节性波动', 
            description: '受季节因素影响，能耗呈现规律性波动', 
            change: 1.2,
            direction: 'up'
          },
          { 
            id: 'TA003', 
            title: '效率提升趋势', 
            description: '设备运行效率持续改善', 
            change: -1.8,
            direction: 'down'
          }
        ],
        conclusions: [
          { 
            id: 'CL001', 
            title: '综合表现良好', 
            description: '所选站点在分析期间整体表现良好，能耗控制效果显著', 
            type: 'success'
          },
          { 
            id: 'CL002', 
            title: '存在优化空间', 
            description: '建议针对能效等级较低的站点制定专项优化策略', 
            type: 'warning'
          }
        ]
      }
    }

    // 能耗趋势分析报告
    const generateTrendAnalysis = (stations, baseEnergy, avgEnergyLevel) => {
      const trendData = stations.map(station => ({
        ...station,
        trend: Math.random() > 0.5 ? 'up' : 'down',
        change: Math.random() * 10 - 5
      }))
      
      return {
        totalEnergy: Math.round(baseEnergy * 0.85),
        keyFindings: [
          { 
            id: 'KF001', 
            title: '能耗趋势分析', 
            description: '各站点能耗变化趋势分析完成', 
            impact: 'neutral',
            type: 'info',
            icon: 'fa fa-line-chart',
            metricTrend: 'down',
            metricValue: '2.1%'
          },
          { 
            id: 'KF002', 
            title: '异常波动识别', 
            description: '识别出部分时段的异常能耗波动', 
            impact: 'warning',
            type: 'warning',
            icon: 'fa fa-exclamation-triangle',
            metricTrend: 'up',
            metricValue: '3.2%'
          }
        ],
        trendAnalysis: trendData.map((station, index) => ({
          id: `TA00${index + 1}`,
          title: `${station.name}趋势`,
          description: `${station.name}在分析期间能耗${station.trend === 'up' ? '上升' : '下降'}${Math.abs(station.change).toFixed(1)}%`,
          change: station.change,
          direction: station.trend
        })),
        conclusions: [
          { 
            id: 'CL001', 
            title: '趋势分析完成', 
            description: '已完成所选站点的详细能耗趋势分析', 
            type: 'info'
          }
        ]
      }
    }

    // 设备效率分析报告
    const generateEfficiencyAnalysis = (stations, baseEnergy, avgEnergyLevel) => {
      return {
        totalEnergy: Math.round(baseEnergy * 0.9),
        keyFindings: [
          { 
            id: 'KF001', 
            title: '设备效率评估', 
            description: '主要设备运行效率较基准提升', 
            impact: 'positive',
            type: 'success',
            icon: 'fa fa-cogs',
            metricTrend: 'up',
            metricValue: '5.2%'
          },
          { 
            id: 'KF002', 
            title: '维护效果显著', 
            description: '定期维护对设备效率提升效果明显', 
            impact: 'positive',
            type: 'success',
            icon: 'fa fa-wrench',
            metricTrend: 'up',
            metricValue: '3.8%'
          }
        ],
        trendAnalysis: [
          { 
            id: 'TA001', 
            title: '设备效率趋势', 
            description: '设备整体效率保持稳定提升', 
            change: -1.5,
            direction: 'down'
          },
          { 
            id: 'TA002', 
            title: '故障率变化', 
            description: '设备故障率呈下降趋势', 
            change: -2.1,
            direction: 'down'
          }
        ],
        conclusions: [
          { 
            id: 'CL001', 
            title: '效率管理有效', 
            description: '设备效率管理措施效果良好，建议继续执行', 
            type: 'success'
          }
        ]
      }
    }

    // 节能效果分析报告
    const generateSavingAnalysis = (stations, baseEnergy, avgEnergyLevel) => {
      return {
        totalEnergy: Math.round(baseEnergy * 0.78),
        keyFindings: [
          { 
            id: 'KF001', 
            title: '节能效果突出', 
            description: '节能措施实施以来效果显著', 
            impact: 'positive',
            type: 'success',
            icon: 'fa fa-leaf',
            metricTrend: 'down',
            metricValue: '12.3%'
          },
          { 
            id: 'KF002', 
            title: '成本节约明显', 
            description: '能耗降低带来显著的经济效益', 
            impact: 'positive',
            type: 'success',
            icon: 'fa fa-money',
            metricTrend: 'down',
            metricValue: '15.6%'
          }
        ],
        trendAnalysis: [
          { 
            id: 'TA001', 
            title: '节能率趋势', 
            description: '节能效果持续改善', 
            change: -3.2,
            direction: 'down'
          },
          { 
            id: 'TA002', 
            title: '投资回报率', 
            description: '节能投资回报率表现优秀', 
            change: -2.8,
            direction: 'down'
          }
        ],
        conclusions: [
          { 
            id: 'CL001', 
            title: '节能成效显著', 
            description: '节能措施取得显著成效，建议推广应用', 
            type: 'success'
          }
        ]
      }
    }

    // 计算时间范围内的天数
    const calculateDaysInRange = (timeRange) => {
      if (!timeRange || timeRange.length !== 2) return 30
      const start = new Date(timeRange[0] + '-01')
      const end = new Date(timeRange[1] + '-01')
      const diffTime = Math.abs(end - start)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return Math.max(diffDays, 30)
    }

    // 导出AI分析报告
    const exportAiAnalysis = () => {
      if (!aiAnalysisResults.show) {
        ElMessage.warning('请先生成AI分析报告')
        return
      }
      
      ElMessage.success('正在导出AI分析报告...')
      
      // 生成报告数据
      const reportData = {
        reportTitle: 'AI分析汇总报告',
        generatedTime: new Date().toLocaleString('zh-CN'),
        filterSettings: {
          timeRange: aiAnalysisFilter.timeRange,
          selectedStations: aiAnalysisFilter.selectedStations.map(id => {
            const station = stations.value.find(s => s.id === id)
            return station ? station.name : id
          }),
          analysisType: aiAnalysisFilter.analysisType
        },
        dataStats: aiAnalysisResults.dataStats,
        keyFindings: aiAnalysisResults.keyFindings,
        trendAnalysis: aiAnalysisResults.trendAnalysis,
        conclusions: aiAnalysisResults.conclusions
      }
      
      // 模拟导出Excel
      setTimeout(() => {
        const blob = new Blob([JSON.stringify(reportData, null, 2)], { 
          type: 'application/json' 
        })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `AI分析报告_${new Date().toISOString().slice(0, 10)}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        
        ElMessage.success('报告导出完成')
      }, 1000)
    }

    // 查看详细分析
    const viewFullAnalysis = () => {
      if (!aiAnalysisResults.show) {
        ElMessage.warning('请先生成AI分析报告')
        return
      }
      
      ElMessage.info('正在打开详细分析页面...')
      
      // 创建详细分析弹窗
      const detailedAnalysis = `
        <div style="padding: 20px; max-height: 600px; overflow-y: auto;">
          <h3>详细分析报告</h3>
          <hr>
          <h4>数据统计</h4>
          <ul>
            <li>涉及站点: ${aiAnalysisResults.dataStats.stationCount}个</li>
            <li>分析天数: ${aiAnalysisResults.dataStats.daysCount}天</li>
            <li>设备数量: ${aiAnalysisResults.dataStats.deviceCount}台</li>
            <li>总能耗: ${aiAnalysisResults.dataStats.totalEnergy} kWh</li>
          </ul>
          
          <h4>关键发现</h4>
          ${aiAnalysisResults.keyFindings.map(finding => `
            <div style="margin: 10px 0; padding: 10px; border-left: 4px solid #409EFF;">
              <h5>${finding.title}</h5>
              <p>${finding.description}</p>
              <p><strong>关键指标:</strong> ${finding.metricValue}</p>
            </div>
          `).join('')}
          
          <h4>趋势分析</h4>
          ${aiAnalysisResults.trendAnalysis.map(trend => `
            <div style="margin: 10px 0; padding: 10px; background: #f5f7fa;">
              <h5>${trend.title}</h5>
              <p>${trend.description}</p>
              <p><strong>变化:</strong> ${trend.change}%</p>
            </div>
          `).join('')}
          
          <h4>综合结论</h4>
          ${aiAnalysisResults.conclusions.map(conclusion => `
            <div style="margin: 10px 0; padding: 10px; border: 1px solid #e4e7ed;">
              <h5>${conclusion.title}</h5>
              <p>${conclusion.description}</p>
            </div>
          `).join('')}
        </div>
      `
      
      ElMessageBox.alert(detailedAnalysis, '详细分析报告', {
        dangerouslyUseHTMLString: true,
        width: '800px'
      })
    }

    const resetAiFilters = () => {
      aiAnalysisFilter.timeRange = ['2025-10', '2025-11']
      aiAnalysisFilter.selectedStations = []
      aiAnalysisFilter.analysisType = ''
      aiAnalysisResults.show = false
      ElMessage.success('筛选条件已重置')
    }





    const getThresholdLabel = (key) => {
      const labels = { totalEnergy: '总能耗', totalCost: '总费用', efficiencyIndex: '能效指标', alertCount: '预警数量' }
      return labels[key] || key
    }

    const getThresholdUnit = (key) => {
      const units = { totalEnergy: 'kWh', totalCost: '¥', efficiencyIndex: 'kgce/人', alertCount: '个' }
      return units[key] || ''
    }

    // AI分析筛选器数据
    const aiAnalysisFilter = reactive({
      timeRange: ['2025-10', '2025-11'],
      selectedStations: [],
      analysisType: 'comprehensive'
    })

    const allStations = computed(() => stations.value.map(station => ({
      ...station,
      typeName: getStationTypeName(station.type)
    })))

    // AI分析结果汇总数据
    const aiAnalysisResults = reactive({
      show: false,
      dataStats: {
        stationCount: 0,
        daysCount: 0,
        deviceCount: 0,
        totalEnergy: 0
      },
      keyFindings: [],
      trendAnalysis: [],
      conclusions: []
    })

    // AI分析相关数据
    const aiAnalysisType = ref('forecast')
    const selectedAiModel = ref('lstm')
    const selectedCorrelationMetric = ref('energy')
    const correlationThreshold = ref(0.7)
    const selectedImpactStrategy = ref('1')
    const selectedTimeGranularity = ref('day')

    const forecastModels = [
      { id: 'lstm', name: 'LSTM神经网络', accuracy: '94.2%', description: '基于深度学习的时间序列预测模型' },
      { id: 'prophet', name: 'Prophet模型', accuracy: '91.8%', description: 'Facebook开发的时间序列预测工具' },
      { id: 'arima', name: 'ARIMA模型', accuracy: '89.5%', description: '经典的时间序列预测模型' },
      { id: 'xgboost', name: 'XGBoost模型', accuracy: '92.7%', description: '梯度提升决策树模型' }
    ]

    const availableStrategies = [
      { id: '1', name: '智能照明调节', category: '照明优化', expectedSaving: '15-20%' },
      { id: '2', name: '空调系统优化', category: '暖通空调', expectedSaving: '25-30%' },
      { id: '3', name: '电梯节能运行', category: '设备优化', expectedSaving: '8-12%' },
      { id: '4', name: '能源管理系统', category: '综合管理', expectedSaving: '20-25%' }
    ]

    const correlationMetrics = [
      { name: '能耗与客流', value: 0.85, description: '正相关关系强' },
      { name: '温度与空调能耗', value: 0.92, description: '强正相关关系' },
      { name: '照明与时间', value: -0.45, description: '中等负相关关系' },
      { name: '设备效率与能耗', value: -0.78, description: '强负相关关系' },
      { name: '电梯能耗与客流', value: 0.82, description: '强正相关关系' },
      { name: '空气湿度与空调能耗', value: 0.56, description: '中等正相关关系' },
      { name: '时间与照明能耗', value: -0.52, description: '中等负相关关系' },
      { name: '设备负荷率与能耗', value: 0.88, description: '强正相关关系' }
    ]

    const forecastResults = ref([
      { time: '2024-01', actual: 12543, predicted: 12380, accuracy: 98.7 },
      { time: '2024-02', actual: 11890, predicted: 12150, accuracy: 97.8 },
      { time: '2024-03', actual: 13200, predicted: 12980, accuracy: 98.3 },
      { time: '2024-04', actual: 14150, predicted: 14200, accuracy: 99.6 },
      { time: '2024-05', actual: 13890, predicted: 13750, accuracy: 99.0 },
      { time: '2024-06', actual: 14560, predicted: 14420, accuracy: 99.0 }
    ])

    // AI分析卡片/报告演示数据
    const forecastMetrics = ref([
      { name: 'mae', label: '平均绝对误差', value: '2.4%', trend: 'down', change: 1.2 },
      { name: 'rmse', label: '均方根误差', value: '3.1%', trend: 'down', change: 0.9 },
      { name: 'mape', label: '平均绝对百分比误差', value: '1.8%', trend: 'down', change: 0.6 },
      { name: 'r2', label: '拟合优度', value: '0.94', trend: 'up', change: 0.3 }
    ])

    const forecastInsights = ref([
      { id: 'FI001', type: 'success', title: '高峰期预测准确', description: 'LSTM 模型在高峰期预测偏差控制在 2% 内。' },
      { id: 'FI002', type: 'info', title: '节能目标接近达成', description: '未来两周总能耗较基准下降 6.5%，逼近 8% 目标。' },
      { id: 'FI003', type: 'warning', title: '周末波动需关注', description: '周末客流异常会导致预测偏差上升，建议叠加客流特征。' }
    ])

    const correlationInsights = ref([
      { id: 'CI001', strength: 'strong', strengthText: '强相关', systems: '能耗 ↔ 客流', description: '客流增加 10% 时总能耗提升约 8%。', recommendation: '高峰时段预置照明与空调策略。' },
      { id: 'CI002', strength: 'strong', strengthText: '强相关', systems: '室外温度 ↔ 空调能耗', description: '温度每升高 1℃，空调能耗增加 2.3%。', recommendation: '结合天气预报提前 2 小时调整设定点。' },
      { id: 'CI003', strength: 'negative', strengthText: '负相关', systems: '自然光 ↔ 照明能耗', description: '自然光强度提升会显著降低照明能耗。', recommendation: '开启按光照度动态调光，减少全亮时长。' },
      { id: 'CI004', strength: 'strong', strengthText: '强相关', systems: '负荷率 ↔ 设备能耗', description: '设备负荷率与能耗呈指数关系，高负荷时效率降低 8%。', recommendation: '避免设备长时间满负荷运行，实施负荷均衡策略。' },
      { id: 'CI005', strength: 'strong', strengthText: '强相关', systems: '客流 ↔ 电梯能耗', description: '电梯能耗与客流高度相关，客流量增加 15% 时电梯能耗增加 18%。', recommendation: '实施电梯智能调度，高峰期预配置电梯群。' },
      { id: 'CI006', strength: 'moderate', strengthText: '中等相关', systems: '空气湿度 ↔ 空调能耗', description: '湿度每升高 10%，空调除湿能耗增加 3.2%。', recommendation: '湿度超过 65% 时启动除湿模式，合理设置目标湿度。' },
      { id: 'CI007', strength: 'strong', strengthText: '强相关', systems: '设备效率 ↔ 总费用', description: '设备效率下降 10% 时运营成本增加 12.5%。', recommendation: '建立设备定期维护制度，效率低于 85% 时进行维修。' },
      { id: 'CI008', strength: 'moderate', strengthText: '中等相关', systems: '时间 ↔ 照明能耗', description: '夜间照明能耗比白天高 15%，主要集中在 21:00-23:00 时段。', recommendation: '夜间照明采用智能分段控制，21:00 后降低照明强度。' },
      { id: 'CI009', strength: 'strong', strengthText: '强相关', systems: '客流预测 ↔ 总能耗', description: '客流预测准确度高达 95%，可提前 2 小时调整能耗策略。', recommendation: '根据客流预测数据制定能耗调度计划，实现能耗前瞻性管理。' },
      { id: 'CI010', strength: 'moderate', strengthText: '中等相关', systems: '通风系统 ↔ 空气质量', description: '通风系统运行时间与室内空气质量指数呈负相关。', recommendation: '空气质量指数超过 100 时增加通风时长或强度。' }
    ])

    const aiRecommendations = ref([
      {
        id: 'AR001',
        title: '智能照明调节',
        description: '按客流与自然光自动调节亮度与开启时长。',
        expectedSaving: 18.5,
        paybackPeriod: 8,
        difficulty: '低',
        matchScore: 92,
        icon: 'fa fa-lightbulb-o',
        color: '#409EFF'
      },
      {
        id: 'AR002',
        title: '空调系统优化',
        description: '基于预测与分区负荷的自适应送风/水系统调度。',
        expectedSaving: 27.3,
        paybackPeriod: 14,
        difficulty: '中',
        matchScore: 89,
        icon: 'fa fa-snowflake-o',
        color: '#67C23A'
      },
      {
        id: 'AR003',
        title: '电梯节能运行',
        description: '高峰群控+低峰休眠，智能分配梯群负荷。',
        expectedSaving: 10.2,
        paybackPeriod: 6,
        difficulty: '低',
        matchScore: 76,
        icon: 'fa fa-elevator',
        color: '#E6A23C'
      }
    ])

    const recommendationFilter = ref('all')

    // AI分析报告数据
    const forecastReports = ref([
      {
        id: 'FR001',
        time: '2024-12-29 09:30:00',
        model: 'lstm',
        accuracy: 98.7,
        prediction: 14560,
        confidence: 95,
        status: 'completed',
        description: '基于LSTM神经网络的高精度能耗预测',
        actualValue: 14320,
        deviation: 1.7
      },
      {
        id: 'FR002',
        time: '2024-12-29 08:15:00',
        model: 'prophet',
        accuracy: 96.3,
        prediction: 13200,
        confidence: 92,
        status: 'completed',
        description: '基于Prophet模型的季节性能耗预测',
        actualValue: 12890,
        deviation: 2.4
      },
      {
        id: 'FR003',
        time: '2024-12-29 10:45:00',
        model: 'arima',
        accuracy: 94.1,
        prediction: 11890,
        confidence: 89,
        status: 'completed',
        description: '基于ARIMA模型的时间序列预测',
        actualValue: 11650,
        deviation: 2.1
      },
      {
        id: 'FR004',
        time: '2024-12-29 11:20:00',
        model: 'xgboost',
        accuracy: 97.5,
        prediction: 13890,
        confidence: 94,
        status: 'completed',
        description: '基于XGBoost的梯度提升预测',
        actualValue: 13980,
        deviation: 0.6
      },
      {
        id: 'FR005',
        time: '2024-12-29 12:30:00',
        model: 'lstm',
        accuracy: 99.2,
        prediction: 15240,
        confidence: 97,
        status: 'completed',
        description: 'LSTM模型多时段复合预测分析',
        actualValue: 15180,
        deviation: 0.4
      }
    ])

    const correlationReports = ref([
      {
        id: 'CR001',
        time: '2024-12-29 09:00:00',
        model: 'correlation',
        accuracy: 92.5,
        prediction: 'r=0.85',
        confidence: 90,
        metric: 'energy_passenger',
        coefficient: 0.85,
        significance: 'high',
        status: 'completed',
        description: '能耗与客流量关联性分析',
        insights: '客流量与总能耗呈现强正相关关系，相关系数0.85',
        recommendation: '建议在客流高峰期优化能耗配置'
      },
      {
        id: 'CR002',
        time: '2024-12-29 08:30:00',
        model: 'correlation',
        accuracy: 94.1,
        prediction: 'r=0.92',
        confidence: 93,
        metric: 'temperature_ac',
        coefficient: 0.92,
        significance: 'high',
        status: 'completed',
        description: '室外温度与空调能耗关联性分析',
        insights: '空调能耗与室外温度呈现极强正相关，相关系数0.92',
        recommendation: '建议基于天气预报调整空调策略'
      },
      {
        id: 'CR003',
        time: '2024-12-29 10:15:00',
        model: 'correlation',
        accuracy: 88.3,
        prediction: 'r=-0.45',
        confidence: 85,
        metric: 'lighting_time',
        coefficient: -0.45,
        significance: 'medium',
        status: 'completed',
        description: '自然光照与照明能耗关联性分析',
        insights: '照明能耗与自然光照呈现中等负相关，相关系数-0.45',
        recommendation: '建议安装智能照明控制系统'
      },
      {
        id: 'CR004',
        time: '2024-12-29 11:00:00',
        model: 'correlation',
        accuracy: 91.6,
        prediction: 'r=-0.78',
        confidence: 89,
        metric: 'equipment_efficiency',
        coefficient: -0.78,
        significance: 'high',
        status: 'completed',
        description: '设备效率与能耗关联性分析',
        insights: '设备效率与能耗呈现强负相关，相关系数-0.78',
        recommendation: '建议加强设备维护保养'
      },
      {
        id: 'CR005',
        time: '2024-12-29 13:45:00',
        model: 'correlation',
        accuracy: 87.2,
        prediction: 'r=0.81',
        confidence: 82,
        metric: 'cost_tariff',
        coefficient: 0.81,
        significance: 'high',
        status: 'processing',
        description: '峰谷电价与总费用关联性分析',
        insights: '正在进行峰谷电价影响分析',
        recommendation: '待分析完成'
      },
      {
        id: 'CR006',
        time: '2024-12-29 11:30:00',
        model: 'correlation',
        accuracy: 93.7,
        prediction: 'r=0.82',
        confidence: 91,
        metric: 'elevator_passenger',
        coefficient: 0.82,
        significance: 'high',
        status: 'completed',
        description: '电梯能耗与客流量关联性分析',
        insights: '电梯能耗与客流量呈现强正相关，相关系数0.82',
        recommendation: '建议优化电梯群控策略，高峰期预配置电梯群'
      },
      {
        id: 'CR007',
        time: '2024-12-29 12:00:00',
        model: 'correlation',
        accuracy: 86.5,
        prediction: 'r=0.56',
        confidence: 84,
        metric: 'humidity_ac',
        coefficient: 0.56,
        significance: 'medium',
        status: 'completed',
        description: '空气湿度与空调能耗关联性分析',
        insights: '空调能耗与空气湿度呈现中等正相关，相关系数0.56',
        recommendation: '建议湿度超过65%时启动除湿模式，合理设置目标湿度'
      },
      {
        id: 'CR008',
        time: '2024-12-29 12:30:00',
        model: 'correlation',
        accuracy: 87.2,
        prediction: 'r=-0.52',
        confidence: 85,
        metric: 'time_lighting',
        coefficient: -0.52,
        significance: 'medium',
        status: 'completed',
        description: '时间与照明能耗关联性分析',
        insights: '照明能耗与时间呈现中等负相关，相关系数-0.52',
        recommendation: '建议夜间照明采用智能分段控制，21:00后降低照明强度'
      },
      {
        id: 'CR009',
        time: '2024-12-29 13:00:00',
        model: 'correlation',
        accuracy: 94.8,
        prediction: 'r=0.88',
        confidence: 92,
        metric: 'loadrate_energy',
        coefficient: 0.88,
        significance: 'high',
        status: 'completed',
        description: '设备负荷率与能耗关联性分析',
        insights: '设备能耗与负荷率呈现强正相关，相关系数0.88',
        recommendation: '建议避免设备长时间满负荷运行，实施负荷均衡策略'
      },
      {
        id: 'CR010',
        time: '2024-12-29 14:00:00',
        model: 'correlation',
        accuracy: 90.4,
        prediction: 'r=-0.59',
        confidence: 88,
        metric: 'efficiency_cost',
        coefficient: -0.59,
        significance: 'medium',
        status: 'completed',
        description: '设备效率与总费用关联性分析',
        insights: '总费用与设备效率呈现中等负相关，相关系数-0.59',
        recommendation: '建议建立设备定期维护制度，效率低于85%时进行维修'
      },
      {
        id: 'CR011',
        time: '2024-12-29 15:00:00',
        model: 'correlation',
        accuracy: 95.1,
        prediction: 'r=0.79',
        confidence: 93,
        metric: 'passenger_prediction',
        coefficient: 0.79,
        significance: 'high',
        status: 'completed',
        description: '客流预测与总能耗关联性分析',
        insights: '客流预测准确度与总能耗呈现强正相关，相关系数0.79',
        recommendation: '建议根据客流预测数据制定能耗调度计划，实现能耗前瞻性管理'
      }
    ])

    const recommendationReports = ref([
      {
        id: 'RR001',
        time: '2024-12-29 09:15:00',
        model: 'recommendation',
        accuracy: 93.2,
        prediction: '节能率 18.5%',
        confidence: 90,
        strategy: '智能照明调节',
        category: '照明优化',
        matchScore: 92,
        expectedSaving: 18.5,
        investment: 50,
        payback: 2.8,
        status: 'completed',
        description: '基于客流和自然光照的智能照明调节策略',
        priority: 'high',
        implementation: '分阶段实施，先试点后推广'
      },
      {
        id: 'RR002',
        time: '2024-12-29 08:45:00',
        model: 'recommendation',
        accuracy: 91.8,
        prediction: '节能率 27.3%',
        confidence: 88,
        strategy: '空调系统优化',
        category: '暖通空调',
        matchScore: 89,
        expectedSaving: 27.3,
        investment: 120,
        payback: 3.5,
        status: 'completed',
        description: '基于AI预测的空调系统智能调度策略',
        priority: 'high',
        implementation: '需要专业团队进行系统改造'
      },
      {
        id: 'RR003',
        time: '2024-12-29 10:30:00',
        model: 'recommendation',
        accuracy: 88.5,
        prediction: '节能率 10.2%',
        confidence: 84,
        strategy: '电梯节能运行',
        category: '设备优化',
        matchScore: 76,
        expectedSaving: 10.2,
        investment: 30,
        payback: 2.1,
        status: 'completed',
        description: '电梯运行模式优化策略',
        priority: 'medium',
        implementation: '软件升级为主，硬件改造为辅'
      },
      {
        id: 'RR004',
        time: '2024-12-29 11:15:00',
        model: 'recommendation',
        accuracy: 90.6,
        prediction: '节能率 22.1%',
        confidence: 86,
        strategy: '能源管理系统',
        category: '综合管理',
        matchScore: 85,
        expectedSaving: 22.1,
        investment: 80,
        payback: 3.2,
        status: 'processing',
        description: '综合能源监控与优化管理平台',
        priority: 'high',
        implementation: '需要建设完整的能源管理平台'
      },
      {
        id: 'RR005',
        time: '2024-12-29 13:20:00',
        model: 'recommendation',
        accuracy: 89.4,
        prediction: '节能率 15.7%',
        confidence: 83,
        strategy: '余热回收利用',
        category: '热能管理',
        matchScore: 78,
        expectedSaving: 15.7,
        investment: 200,
        payback: 4.8,
        status: 'completed',
        description: '回收设备运行产生的余热用于供暖和热水供应',
        priority: 'medium',
        implementation: '需要建设余热回收管道系统和换热设备'
      }
    ])

    const impactReports = ref([
      {
        id: 'IR001',
        time: '2024-12-29 09:30:00',
        model: 'impact',
        accuracy: 92.8,
        prediction: 'ROI 18.5%',
        confidence: 90,
        strategy: '智能照明调节',
        energyReduction: 15.8,
        costSaving: 142,
        carbonReduction: 126,
        roi: 18.5,
        status: 'completed',
        description: '智能照明调节策略实施效果评估',
        implementationPeriod: '3个月',
        effectiveness: '显著'
      },
      {
        id: 'IR002',
        time: '2024-12-29 08:45:00',
        model: 'impact',
        accuracy: 94.1,
        prediction: 'ROI 22.3%',
        confidence: 92,
        strategy: '空调系统优化',
        energyReduction: 25.6,
        costSaving: 289,
        carbonReduction: 218,
        roi: 22.3,
        status: 'completed',
        description: '空调系统优化策略实施效果评估',
        implementationPeriod: '6个月',
        effectiveness: '显著'
      },
      {
        id: 'IR003',
        time: '2024-12-29 10:20:00',
        model: 'impact',
        accuracy: 88.9,
        prediction: 'ROI 12.1%',
        confidence: 85,
        strategy: '电梯节能运行',
        energyReduction: 8.4,
        costSaving: 67,
        carbonReduction: 54,
        roi: 12.1,
        status: 'completed',
        description: '电梯节能运行策略实施效果评估',
        implementationPeriod: '1个月',
        effectiveness: '良好'
      },
      {
        id: 'IR004',
        time: '2024-12-29 11:30:00',
        model: 'impact',
        accuracy: 90.3,
        prediction: 'ROI 16.8%',
        confidence: 87,
        strategy: '能源管理系统',
        energyReduction: 19.2,
        costSaving: 195,
        carbonReduction: 168,
        roi: 16.8,
        status: 'processing',
        description: '能源管理系统策略实施效果评估',
        implementationPeriod: '12个月',
        effectiveness: '待验证'
      },
      {
        id: 'IR005',
        time: '2024-12-29 14:00:00',
        model: 'impact',
        accuracy: 86.5,
        prediction: 'ROI 28.5%',
        confidence: 83,
        strategy: '设备升级改造',
        energyReduction: 31.2,
        costSaving: 378,
        carbonReduction: 324,
        roi: 28.5,
        status: 'planning',
        description: '设备升级改造策略预期效果评估',
        implementationPeriod: '18个月',
        effectiveness: '预期显著'
      }
    ])

    const correlationResults = ref([])

    const strategyResults = ref([
      { 
        strategy: '智能照明调节', 
        score: 92, 
        saving: '18.5%', 
        investment: '50万', 
        payback: '2.8年',
        description: '根据客流和自然光照自动调节照明亮度'
      },
      { 
        strategy: '空调系统优化', 
        score: 89, 
        saving: '27.3%', 
        investment: '120万', 
        payback: '3.5年',
        description: '基于AI预测的空调系统智能调度'
      },
      { 
        strategy: '能源管理系统', 
        score: 85, 
        saving: '22.1%', 
        investment: '80万', 
        payback: '3.2年',
        description: '综合能源监控与优化管理平台'
      }
    ])

    const impactMetrics = ref([
      { 
        name: '能耗降低', 
        value: '15.8%', 
        changeValue: '+2.3%', 
        changeType: 'positive', 
        icon: 'fa fa-bolt', 
        color: '#409EFF' 
      },
      { 
        name: '成本节约', 
        value: '¥142万', 
        changeValue: '+8.5万', 
        changeType: 'positive', 
        icon: 'fa fa-yen', 
        color: '#67C23A' 
      },
      { 
        name: '碳排放减少', 
        value: '126吨', 
        changeValue: '+12吨', 
        changeType: 'positive', 
        icon: 'fa fa-leaf', 
        color: '#E6A23C' 
      },
      { 
        name: '投资回报率', 
        value: '18.5%', 
        changeValue: '+1.2%', 
        changeType: 'positive', 
        icon: 'fa fa-line-chart', 
        color: '#909399' 
      }
    ])

    const impactSummaries = ref([
      { 
        id: 1, 
        icon: 'fa fa-check-circle', 
        content: '策略实施后预计年度节能率达到15.8%，超过预期目标5.8个百分点' 
      },
      { 
        id: 2, 
        icon: 'fa fa-clock', 
        content: '预计投资回收期为2.8年，显著低于行业平均水平3.5年' 
      },
      { 
        id: 3, 
        icon: 'fa fa-shield', 
        content: '系统可靠性提升12%，设备故障率降低8.5%' 
      },
      { 
        id: 4, 
        icon: 'fa fa-globe', 
        content: '年度碳排放减少126吨，相当于种植6900棵树的环境效益' 
      }
    ])

    // AI分析图表实例
    let aiForecastChart = null
    let aiStrategyChart = null
    let aiImpactEnergyChart = null
    let aiImpactCostChart = null

    // 初始化AI分析图表
    const initAiAnalysisCharts = () => {
      nextTick(() => {
        // 预测分析图表
        const forecastElement = document.getElementById('aiForecastChart')
        if (forecastElement) {
          if (aiForecastChart) {
            aiForecastChart.dispose()
          }
          aiForecastChart = echarts.init(forecastElement)
        }



        // 策略推荐图表
        const strategyElement = document.getElementById('aiStrategyChart')
        if (strategyElement) {
          if (aiStrategyChart) {
            aiStrategyChart.dispose()
          }
          aiStrategyChart = echarts.init(strategyElement)
        }

        // 影响分析图表 - 能耗变化预测
        const impactEnergyElement = document.getElementById('aiImpactEnergyChart')
        if (impactEnergyElement) {
          if (aiImpactEnergyChart) {
            aiImpactEnergyChart.dispose()
          }
          aiImpactEnergyChart = echarts.init(impactEnergyElement)
        }

        // 影响分析图表 - 成本效益分析
        const impactCostElement = document.getElementById('aiImpactCostChart')
        if (impactCostElement) {
          if (aiImpactCostChart) {
            aiImpactCostChart.dispose()
          }
          aiImpactCostChart = echarts.init(impactCostElement)
        }

        // 渲染当前类型的图表
        renderCurrentAiAnalysisChart()
      })
    }

    // 渲染当前AI分析图表
    const renderCurrentAiAnalysisChart = () => {
      // 确保所有相关图表都已初始化
      ensureAiChartsInitialized()
      
      switch (aiAnalysisType.value) {
        case 'forecast':
          if (aiForecastChart) {
            renderAiForecastChart()
          }
          break

        case 'recommendation':
          if (aiStrategyChart) {
            renderAiStrategyChart()
          }
          break
        case 'impact':
          if (aiImpactEnergyChart && aiImpactCostChart) {
            renderAiImpactCharts()
          }
          break
      }
    }

    // 确保AI分析图表已初始化
    const ensureAiChartsInitialized = () => {
      nextTick(() => {
        const forecastElement = document.getElementById('aiForecastChart')
        if (forecastElement) {
          if (!aiForecastChart) {
            aiForecastChart = echarts.init(forecastElement)
          } else if (echarts.getInstanceByDom(forecastElement) !== aiForecastChart) {
            aiForecastChart.dispose()
            aiForecastChart = echarts.init(forecastElement)
          }
        }



        const strategyElement = document.getElementById('aiStrategyChart')
        if (strategyElement) {
          if (!aiStrategyChart) {
            aiStrategyChart = echarts.init(strategyElement)
          } else if (echarts.getInstanceByDom(strategyElement) !== aiStrategyChart) {
            aiStrategyChart.dispose()
            aiStrategyChart = echarts.init(strategyElement)
          }
        }

        const impactEnergyElement = document.getElementById('aiImpactEnergyChart')
        if (impactEnergyElement) {
          if (!aiImpactEnergyChart) {
            aiImpactEnergyChart = echarts.init(impactEnergyElement)
          } else if (echarts.getInstanceByDom(impactEnergyElement) !== aiImpactEnergyChart) {
            aiImpactEnergyChart.dispose()
            aiImpactEnergyChart = echarts.init(impactEnergyElement)
          }
        }

        const impactCostElement = document.getElementById('aiImpactCostChart')
        if (impactCostElement) {
          if (!aiImpactCostChart) {
            aiImpactCostChart = echarts.init(impactCostElement)
          } else if (echarts.getInstanceByDom(impactCostElement) !== aiImpactCostChart) {
            aiImpactCostChart.dispose()
            aiImpactCostChart = echarts.init(impactCostElement)
          }
        }
      })
    }

    // 渲染AI预测分析图表
    const renderAiForecastChart = () => {
      if (!aiForecastChart) return

      const option = {
        tooltip: { 
          trigger: 'axis',
          formatter: (params) => {
            const result = params[0]
            return `${result.axisValue}<br/>
                    实际值: ${result.value[1]} kWh<br/>
                    预测值: ${result.value[2]} kWh<br/>
                    准确率: ${forecastResults.value[result.dataIndex]?.accuracy}%`
          }
        },
        legend: { data: ['实际能耗', '预测能耗', '预测区间'], bottom: 0 },
        grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
        xAxis: { 
          type: 'category', 
          data: forecastResults.value.map(item => item.time) 
        },
        yAxis: { type: 'value', name: 'kWh' },
        series: [
          {
            name: '实际能耗',
            type: 'line',
            data: forecastResults.value.map(item => item.actual),
            itemStyle: { color: '#409EFF' },
            lineStyle: { width: 3 }
          },
          {
            name: '预测能耗',
            type: 'line',
            data: forecastResults.value.map(item => item.predicted),
            itemStyle: { color: '#67C23A' },
            lineStyle: { width: 3, type: 'dashed' }
          },
          {
            name: '预测区间',
            type: 'line',
            stack: 'confidence',
            symbol: 'none',
            lineStyle: { opacity: 0 },
            areaStyle: { opacity: 0.1 },
            data: forecastResults.value.map((item, index) => [index, item.predicted - 500, item.predicted + 500])
          }
        ]
      }
      aiForecastChart.setOption(option)
    }

    // 渲染AI关联性分析图表
    const renderAiCorrelationChart = () => {
      if (!aiCorrelationChart) return

      // 如果没有数据，显示空状态
      if (correlationResults.value.length === 0) {
        const option = {
          title: {
            text: '暂无关联性分析数据',
            left: 'center',
            top: 'center',
            textStyle: {
              color: '#999',
              fontSize: 16
            }
          },
          grid: { left: 0, right: 0, top: 0, bottom: 0 },
          xAxis: { show: false },
          yAxis: { show: false },
          series: []
        }
        aiCorrelationChart.setOption(option)
        return
      }

      // 获取所有唯一指标
      const allMetrics = new Set()
      correlationResults.value.forEach(item => {
        allMetrics.add(item.metric1)
        allMetrics.add(item.metric2)
      })
      
      const metrics = Array.from(allMetrics)
      
      // 创建数据矩阵
      const data = correlationResults.value.map((item, index) => {
        const metric1Index = metrics.indexOf(item.metric1)
        const metric2Index = metrics.indexOf(item.metric2)
        return [metric1Index, metric2Index, Math.abs(item.coefficient)]
      })

      const option = {
        tooltip: {
          position: 'top',
          formatter: (params) => {
            const [x, y, coefficient] = params.value
            const metric1 = metrics[x]
            const metric2 = metrics[y]
            const result = correlationResults.value.find(r => 
              (r.metric1 === metric1 && r.metric2 === metric2) ||
              (r.metric1 === metric2 && r.metric2 === metric1)
            )
            return `${metric1} vs ${metric2}<br/>
                    相关系数: ${result ? result.coefficient.toFixed(3) : coefficient.toFixed(3)}<br/>
                    显著性: ${result?.significance || 'medium'}`
          }
        },
        grid: { left: '10%', right: '10%', top: '10%', bottom: '15%' },
        xAxis: {
          type: 'category',
          data: metrics,
          axisLabel: { 
            rotate: 45,
            fontSize: 10
          },
          splitArea: { show: true }
        },
        yAxis: {
          type: 'category',
          data: metrics,
          axisLabel: { fontSize: 10 },
          splitArea: { show: true }
        },
        series: [{
          name: '相关系数',
          type: 'heatmap',
          data: data,
          label: { 
            show: true,
            formatter: (params) => params.value[2].toFixed(2)
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          itemStyle: {
            color: (params) => {
              const value = params.value[2]
              if (value >= 0.8) return '#d73027'
              if (value >= 0.6) return '#f46d43'
              if (value >= 0.4) return '#fdae61'
              if (value >= 0.2) return '#fee08b'
              return '#e0f3f8'
            }
          }
        }]
      }
      aiCorrelationChart.setOption(option)
    }

    // 渲染AI策略推荐图表
    const renderAiStrategyChart = () => {
      if (!aiStrategyChart) return

      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          formatter: (params) => {
            const data = params[0]
            const strategy = strategyResults.value[data.dataIndex]
            return `${strategy.strategy}<br/>
                    综合评分: ${strategy.score}<br/>
                    节能率: ${strategy.saving}<br/>
                    投资: ${strategy.investment}<br/>
                    回收期: ${strategy.payback}`
          }
        },
        radar: {
          indicator: [
            { name: '节能效果', max: 100 },
            { name: '投资回报', max: 100 },
            { name: '技术成熟度', max: 100 },
            { name: '实施难度', max: 100 },
            { name: '环境效益', max: 100 }
          ],
          center: ['50%', '55%'],
          radius: '60%'
        },
        series: [{
          type: 'radar',
          data: strategyResults.value.map((strategy, index) => ({
            value: [
              strategy.score,
              Math.random() * 20 + 80,
              Math.random() * 15 + 85,
              Math.random() * 25 + 75,
              Math.random() * 20 + 80
            ],
            name: strategy.strategy,
            itemStyle: { 
              color: ['#409EFF', '#67C23A', '#E6A23C'][index] 
            }
          }))
        }]
      }
      aiStrategyChart.setOption(option)
    }

    // 渲染AI影响分析图表
    const renderAiImpactCharts = () => {
      // 获取当前选中策略的数据
      const strategyData = getStrategyImpactData(selectedImpactStrategy.value)
      
      if (aiImpactEnergyChart) {
        const option = {
          tooltip: { trigger: 'axis' },
          legend: { data: ['实施前', '实施后', '节能效果'], bottom: 0 },
          grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
          xAxis: { 
            type: 'category', 
            data: ['1月', '2月', '3月', '4月', '5月', '6月'] 
          },
          yAxis: { type: 'value', name: '能耗(kWh)' },
          series: [
            {
              name: '实施前',
              type: 'line',
              data: strategyData.beforeImplementation,
              itemStyle: { color: '#909399' },
              lineStyle: { type: 'dashed' }
            },
            {
              name: '实施后',
              type: 'line',
              data: strategyData.afterImplementation,
              itemStyle: { color: '#409EFF' },
              lineStyle: { width: 3 }
            },
            {
              name: '节能效果',
              type: 'line',
              data: strategyData.savings,
              itemStyle: { color: '#67C23A' },
              lineStyle: { type: 'dotted' }
            }
          ]
        }
        aiImpactEnergyChart.setOption(option)
      }

      if (aiImpactCostChart) {
        const option = {
          tooltip: { 
            trigger: 'axis',
            formatter: (params) => {
              return params.map(param => 
                `${param.seriesName}: ¥${param.value}万`
              ).join('<br/>')
            }
          },
          legend: { data: ['投资成本', '节能收益'], bottom: 0 },
          grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
          xAxis: { 
            type: 'category', 
            data: ['第一年', '第二年', '第三年', '第四年', '第五年'] 
          },
          yAxis: { type: 'value', name: '金额(万元)' },
          series: [
            {
              name: '投资成本',
              type: 'bar',
              data: strategyData.investmentCost,
              itemStyle: { color: '#F56C6C' }
            },
            {
              name: '节能收益',
              type: 'bar',
              data: strategyData.energySavings,
              itemStyle: { color: '#67C23A' }
            }
          ]
        }
        aiImpactCostChart.setOption(option)
      }
      
      // 更新影响分析总结
      impactSummaries.value = strategyData.summary
    }

    // 获取策略影响数据
    const getStrategyImpactData = (strategyId) => {
      const strategyData = {
        '1': { // 智能照明调节
          beforeImplementation: [12543, 11890, 13200, 14150, 13890, 14560],
          afterImplementation: [10560, 10020, 11120, 11930, 11710, 12270],
          savings: [1983, 1870, 2080, 2220, 2180, 2290],
          investmentCost: [0, 0, 0, 0, 0, 0],
          energySavings: [18.5, 19.2, 20.8, 21.5, 22.1, 23.2],
          summary: [
            { icon: 'fa fa-lightbulb', content: '智能照明系统能根据客流密度自动调节亮度，实现按需照明。' },
            { icon: 'fa fa-chart-line', content: '通过动态调光，预期可节约照明能耗15-20%。' },
            { icon: 'fa fa-calendar', content: '系统可在非高峰时段自动降低照明亮度，无需人工干预。' },
            { icon: 'fa fa-shield', content: '预计年度碳排放减少约120吨CO₂当量。' }
          ]
        },
        '2': { // 空调系统优化
          beforeImplementation: [12543, 11890, 13200, 14150, 13890, 14560],
          afterImplementation: [10050, 9700, 10750, 11500, 11280, 11800],
          savings: [2493, 2190, 2450, 2650, 2610, 2760],
          investmentCost: [0, 0, 5, 0, 0, 0],
          energySavings: [25.0, 25.8, 27.2, 28.5, 29.0, 30.2],
          summary: [
            { icon: 'fa fa-thermometer', content: '智能温控系统根据实际客流密度自动调节空调温度。' },
            { icon: 'fa fa-clock-o', content: '系统可在非高峰时段适度提高空调设定温度，节约能耗。' },
            { icon: 'fa fa-filter', content: '定期自动清洁空调过滤网，提高制冷效率。' },
            { icon: 'fa fa-leaf', content: '预计年度碳排放减少约210吨CO₂当量。' }
          ]
        },
        '3': { // 电梯节能运行
          beforeImplementation: [12543, 11890, 13200, 14150, 13890, 14560],
          afterImplementation: [11530, 10940, 12140, 13010, 12780, 13380],
          savings: [1013, 950, 1060, 1140, 1110, 1180],
          investmentCost: [0, 0, 0, 0, 0, 0],
          energySavings: [9.5, 10.0, 10.8, 11.2, 11.5, 12.0],
          summary: [
            { icon: 'fa fa-arrows-alt', content: '电梯节能模式可根据客流情况动态调整运行策略。' },
            { icon: 'fa fa-user-friends', content: '在低峰时段自动降低电梯运行频率，节约电力消耗。' },
            { icon: 'fa fa-battery-three-quarters', content: '能量回收系统可在电梯下降时回收部分能量。' },
            { icon: 'fa fa-cog', content: '预计年度碳排放减少约85吨CO₂当量。' }
          ]
        },
        '4': { // 能源管理系统
          beforeImplementation: [12543, 11890, 13200, 14150, 13890, 14560],
          afterImplementation: [10300, 9800, 10900, 11700, 11480, 12000],
          savings: [2243, 2090, 2300, 2450, 2410, 2560],
          investmentCost: [0, 0, 2, 0, 0, 0],
          energySavings: [21.0, 22.0, 23.5, 24.5, 25.0, 26.0],
          summary: [
            { icon: 'fa fa-dashboard', content: '智能能源管理系统整合各子系统数据，实现统一调度。' },
            { icon: 'fa fa-cogs', content: '通过实时数据分析，识别能源使用模式和优化机会。' },
            { icon: 'fa fa-lightbulb', content: '系统可预测未来能源需求，优化能源采购计划。' },
            { icon: 'fa fa-chart-bar', content: '预计年度碳排放减少约180吨CO₂当量。' }
          ]
        }
      }
      return strategyData[strategyId] || strategyData['1']
    }

    // AI分析报告相关方法
    const formatReportTime = (time) => {
      const date = new Date(time)
      return `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
    }

    const getModelTagType = (model) => {
      const modelColors = {
        lstm: 'primary',
        prophet: 'success',
        arima: 'warning',
        xgboost: 'info',
        correlation: 'warning',
        recommendation: 'primary',
        impact: 'success'
      }
      return modelColors[model] || 'default'
    }

    const getModelName = (model) => {
      const modelNames = {
        lstm: 'LSTM',
        prophet: 'Prophet',
        arima: 'ARIMA',
        xgboost: 'XGBoost',
        correlation: '相关性模型',
        recommendation: '策略推荐模型',
        impact: '影响分析模型'
      }
      return modelNames[model] || model
    }

    const getConfidenceColor = (confidence) => {
      if (confidence >= 95) return '#67C23A'
      if (confidence >= 90) return '#E6A23C'
      return '#F56C6C'
    }

    const getMatchScoreColor = (score) => {
      if (score >= 90) return '#67C23A'
      if (score >= 75) return '#409EFF'
      if (score >= 60) return '#E6A23C'
      return '#F56C6C'
    }

    const getRoiColor = (roi) => {
      if (roi >= 20) return '#67C23A'
      if (roi >= 15) return '#409EFF'
      if (roi >= 10) return '#E6A23C'
      return '#F56C6C'
    }

    const getCategoryTagType = (category) => {
      const mapping = {
        照明优化: 'primary',
        暖通空调: 'success',
        设备优化: 'warning',
        综合管理: 'info',
        热能管理: 'danger'
      }
      return mapping[category] || 'info'
    }

    const getSignificanceTagType = (significance) => {
      const significanceColors = {
        high: 'danger',
        medium: 'warning',
        low: 'info'
      }
      return significanceColors[significance] || 'default'
    }

    const getSignificanceName = (significance) => {
      const significanceNames = {
        high: '高',
        medium: '中',
        low: '低'
      }
      return significanceNames[significance] || significance
    }

    const getCorrelationIcon = (strength) => {
      const icons = {
        strong: 'fa fa-level-up',
        moderate: 'fa fa-exchange',
        weak: 'fa fa-minus',
        negative: 'fa fa-level-down'
      }
      return icons[strength] || 'fa fa-dot-circle-o'
    }

    const formatCorrelationTooltip = (value) => `${value.toFixed(1)}`

    const getMetricName = (metric) => {
      const metricNames = {
        energy_passenger: '能耗与客流量',
        temperature_ac: '温度与空调能耗',
        lighting_time: '照明与时间',
        equipment_efficiency: '设备效率与能耗',
        cost_tariff: '成本与电价'
      }
      return metricNames[metric] || metric
    }

    const getPriorityTagType = (priority) => {
      const priorityColors = {
        high: 'danger',
        medium: 'warning',
        low: 'info'
      }
      return priorityColors[priority] || 'default'
    }

    const getPriorityName = (priority) => {
      const priorityNames = {
        high: '高',
        medium: '中',
        low: '低'
      }
      return priorityNames[priority] || priority
    }

    const getStatusTagType = (status) => {
      const statusColors = {
        completed: 'success',
        processing: 'warning',
        planning: 'info'
      }
      return statusColors[status] || 'default'
    }

    const getStatusName = (status) => {
      const statusNames = {
        completed: '已完成',
        processing: '进行中',
        planning: '计划中'
      }
      return statusNames[status] || status
    }

    // 预测分析报告方法
    const viewForecastReportDetail = (report) => {
      ElMessageBox.alert(
        `<div style="line-height: 1.8;">
          <h4>${report.description}</h4>
          <p><strong>报告ID:</strong> ${report.id}</p>
          <p><strong>分析时间:</strong> ${formatReportTime(report.time)}</p>
          <p><strong>预测模型:</strong> ${getModelName(report.model)}</p>
          <p><strong>预测值:</strong> ${report.prediction} kWh</p>
          <p><strong>实际值:</strong> ${report.actualValue || '待更新'} ${report.actualValue ? 'kWh' : ''}</p>
          <p><strong>准确率:</strong> ${report.accuracy}%</p>
          <p><strong>置信度:</strong> ${report.confidence}%</p>
          <p><strong>偏差:</strong> ${report.deviation ? report.deviation + '%' : '待计算'}</p>
          <p><strong>状态:</strong> ${getStatusName(report.status)}</p>
        </div>`,
        '预测分析报告详情',
        {
          dangerouslyUseHTMLString: true,
          confirmButtonText: '确定'
        }
      )
    }

    const viewAllForecastReports = () => {
      ElMessage.info('跳转到预测分析报告管理页面')
    }

    // 关联性分析报告方法
    const viewCorrelationReportDetail = (report) => {
      ElMessageBox.alert(
        `<div style="line-height: 1.8;">
          <h4>${report.description}</h4>
          <p><strong>报告ID:</strong> ${report.id}</p>
          <p><strong>分析时间:</strong> ${formatReportTime(report.time)}</p>
          <p><strong>相关系数:</strong> ${report.coefficient}</p>
          <p><strong>显著性:</strong> ${getSignificanceName(report.significance)}</p>
          <p><strong>分析洞察:</strong> ${report.insights}</p>
          <p><strong>推荐建议:</strong> ${report.recommendation}</p>
          <p><strong>状态:</strong> ${getStatusName(report.status)}</p>
        </div>`,
        '关联性分析报告详情',
        {
          dangerouslyUseHTMLString: true,
          confirmButtonText: '确定'
        }
      )
    }

    const viewAllCorrelationReports = () => {
      ElMessage.info('跳转到关联性分析报告管理页面')
    }

    // 策略推荐报告方法
    const viewRecommendationReportDetail = (report) => {
      ElMessageBox.alert(
        `<div style="line-height: 1.8;">
          <h4>${report.description}</h4>
          <p><strong>报告ID:</strong> ${report.id}</p>
          <p><strong>分析时间:</strong> ${formatReportTime(report.time)}</p>
          <p><strong>策略名称:</strong> ${report.strategy}</p>
          <p><strong>策略类别:</strong> ${report.category}</p>
          <p><strong>匹配度:</strong> ${report.matchScore}%</p>
          <p><strong>预期节能率:</strong> ${report.expectedSaving}%</p>
          <p><strong>投资金额:</strong> ${report.investment}万元</p>
          <p><strong>投资回报期:</strong> ${report.payback}年</p>
          <p><strong>实施优先级:</strong> ${getPriorityName(report.priority)}</p>
          <p><strong>实施方式:</strong> ${report.implementation}</p>
          <p><strong>状态:</strong> ${getStatusName(report.status)}</p>
        </div>`,
        '策略推荐报告详情',
        {
          dangerouslyUseHTMLString: true,
          confirmButtonText: '确定'
        }
      )
    }

    const viewAllRecommendationReports = () => {
      ElMessage.info('跳转到策略推荐报告管理页面')
    }

    const viewRecommendationDetail = (recommendation) => {
      ElMessage.info(`查看策略【${recommendation.title}】详情`)
    }

    const applyRecommendation = (recommendation) => {
      ElMessage.success(`已将策略【${recommendation.title}】应用到当前站点`)
    }

    // 影响分析报告方法
    const viewImpactReportDetail = (report) => {
      ElMessageBox.alert(
        `<div style="line-height: 1.8;">
          <h4>${report.description}</h4>
          <p><strong>报告ID:</strong> ${report.id}</p>
          <p><strong>分析时间:</strong> ${formatReportTime(report.time)}</p>
          <p><strong>策略名称:</strong> ${report.strategy}</p>
          <p><strong>能耗降低:</strong> ${report.energyReduction}%</p>
          <p><strong>成本节约:</strong> ${report.costSaving}万元</p>
          <p><strong>碳排放减少:</strong> ${report.carbonReduction}吨</p>
          <p><strong>投资回报率:</strong> ${report.roi}%</p>
          <p><strong>实施周期:</strong> ${report.implementationPeriod}</p>
          <p><strong>实施效果:</strong> ${report.effectiveness}</p>
          <p><strong>状态:</strong> ${getStatusName(report.status)}</p>
        </div>`,
        '影响分析报告详情',
        {
          dangerouslyUseHTMLString: true,
          confirmButtonText: '确定'
        }
      )
    }

    const viewAllImpactReports = () => {
      ElMessage.info('跳转到影响分析报告管理页面')
    }

    // 刷新AI分析数据
    const refreshAiAnalysis = () => {
      ElMessage.success('AI分析数据已刷新')
      
      // 模拟数据更新
      forecastResults.value = forecastResults.value.map(item => ({
        ...item,
        predicted: item.predicted + (Math.random() - 0.5) * 200,
        accuracy: 95 + Math.random() * 4
      }))

      // 只在有关联性分析数据时才更新
      if (correlationResults.value.length > 0) {
        correlationResults.value = correlationResults.value.map(item => ({
          ...item,
          coefficient: item.coefficient + (Math.random() - 0.5) * 0.1
        }))
      }

      // 重新渲染当前图表
      setTimeout(() => {
        renderCurrentAiAnalysisChart()
      }, 100)
    }

    // AI分析图表类型切换时的专用刷新函数
    const refreshAiAnalysisOnTypeChange = () => {
      console.log('AI分析类型已切换到:', aiAnalysisType.value)
      
      // 重新初始化图表
      initAiAnalysisCharts()
      
      // 延迟渲染确保DOM更新完成
      setTimeout(() => {
        renderCurrentAiAnalysisChart()
      }, 200)
    }

    // 监听器
    watch(compareMetric, () => {
      renderMultiStationCompareChart()
    })

    watch(aiAnalysisType, () => {
      nextTick(() => {
        // 使用专用的类型切换刷新函数
        refreshAiAnalysisOnTypeChange()
      })
    })

    // 监听策略选择变化，动态更新影响分析图表
    watch(selectedImpactStrategy, () => {
      console.log('策略已切换到:', selectedImpactStrategy.value)
      nextTick(() => {
        // 确保图表已初始化
        const impactEnergyElement = document.getElementById('aiImpactEnergyChart')
        const impactCostElement = document.getElementById('aiImpactCostChart')
        
        if (impactEnergyElement && !aiImpactEnergyChart) {
          aiImpactEnergyChart = echarts.init(impactEnergyElement)
        }
        
        if (impactCostElement && !aiImpactCostChart) {
          aiImpactCostChart = echarts.init(impactCostElement)
        }
        
        renderAiImpactCharts()
      })
    })

    // 生命周期钩子
    onMounted(() => {
      const savedDarkMode = localStorage.getItem('darkMode') === 'true'
      isDarkMode.value = savedDarkMode
      document.body.classList.toggle('dark-mode', savedDarkMode)
      nextTick(() => {
        initCharts()
        initAiAnalysisCharts()
      })
      resizeHandler = handleResize
      window.addEventListener('resize', resizeHandler)
    })

    onUnmounted(() => {
      if (refreshTimer) clearInterval(refreshTimer)
      if (resizeHandler) {
        window.removeEventListener('resize', resizeHandler)
        resizeHandler = null
      }
      if (energyTrendChart) energyTrendChart.dispose()
      if (energyStructureChart) energyStructureChart.dispose()
      if (energySavingEffectChart) energySavingEffectChart.dispose()
      if (areaEnergyChart) areaEnergyChart.dispose()
      if (deviceEnergyChart) deviceEnergyChart.dispose()
      if (multiStationCompareChart) multiStationCompareChart.dispose()
      if (stationMapChart) stationMapChart.dispose()
      if (aiForecastChart) aiForecastChart.dispose()
      if (aiCorrelationChart) aiCorrelationChart.dispose()
      if (aiStrategyChart) aiStrategyChart.dispose()
      if (aiImpactEnergyChart) aiImpactEnergyChart.dispose()
      if (aiImpactCostChart) aiImpactCostChart.dispose()
    })

    return {
      isDarkMode,
      currentView,
      selectedStation,
      refreshInterval,
      trendTimeGranularity,
      compareMetric,
      showAlertDetailDialog,
      showPersonalizeDialog,
      showThresholdDialog,
      selectedAlert,
      stations,
      currentScenario,
      filterForm,
      personalizeForm,
      thresholdForm,
      coreIndicators,
      alertRecords,
      areaRankings,
      stationRankings,
      multiStationStats,
      pendingAlertCount,
      // AI分析相关数据
      aiAnalysisType,
      selectedAiModel,
      selectedCorrelationMetric,
      selectedImpactStrategy,
      forecastModels,
      availableStrategies,
      correlationMetrics,
      forecastResults,
      forecastMetrics,
      forecastInsights,
      correlationResults,
      strategyResults,
      impactMetrics,
      impactSummaries,
      correlationInsights,
      aiRecommendations,
      recommendationFilter,
      forecastReports,
      correlationReports,
      recommendationReports,
      impactReports,
      refreshAiAnalysis,
      refreshData,
      handleRefreshIntervalChange,
      handleExport,
      toggleTheme,
      handleViewChange,
      handleTrendGranularityChange,
      applyFilters,
      resetFilters,
      getScenarioType,
      getThresholdPercentage,
      getThresholdColor,
      getRankingColor,
      getAlertTypeName,
      getAlertTypeTag,
      getAlertLevelName,
      getAlertLevelTag,
      getEnergyLevelName,
      getEnergyLevelTag,
      getStationTypeName,
      formatTime,
      handleAlert,
      handleAlertProcess,
      viewAreaRankingDetail,
      viewAreaDetail,
      viewAllAlerts,
      viewStationDetail,
      formatReportTime,
      savePersonalizeConfig,
      saveThresholdConfig,
      getThresholdLabel,
      getThresholdUnit,
      getConfidenceColor,
      getMatchScoreColor,
      getRoiColor,
      getCategoryTagType,
      getCorrelationIcon,
      formatCorrelationTooltip,
      viewRecommendationDetail,
      applyRecommendation,
      getModelTagType,
      getModelName,
      getMetricName,
      getSignificanceTagType,
      getSignificanceName,
      getPriorityTagType,
      getPriorityName,
      getStatusTagType,
      getStatusName,
      correlationThreshold,
      viewAllForecastReports,
      viewAllCorrelationReports,
      viewAllRecommendationReports,
      viewAllImpactReports,
      viewForecastReportDetail,
      viewCorrelationReportDetail,
      viewRecommendationReportDetail,
      viewImpactReportDetail,
      // AI分析筛选相关
      aiAnalysisFilter,
      allStations,
      generateAiAnalysis,
      resetAiFilters,
      exportAiAnalysis,
      viewFullAnalysis,
      getStationTypeTag,
      aiAnalysisResults
    }
  }
}
</script>

<style scoped>
.home-container {
  --brand-primary: #1890ff;
  --brand-success: #52c41a;
  --brand-warning: #faad14;
  --brand-danger: #f5222d;
  --brand-info: #909399;
  --text-title: #1d2129;
  --text-sub: #4e5969;
  --card-radius: 12px;
  --icon-size: 48px;
  --control-height: 36px;
  --card-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);

  min-height: 100vh;
  background: #f5f7fa;
  padding: 16px;
}

.dark-mode {
  background: #1a1a2e;
  color: #e0e0e0;
}

.dark-mode .page-header,
.dark-mode .el-card,
.dark-mode .filter-card {
  background: #16213e;
  border-color: #0f3460;
  color: #e0e0e0;
}

.dark-mode .indicator-card,
.dark-mode .stat-card {
  background: #16213e;
  border-color: #0f3460;
  color: #e0e0e0;
}

.dark-mode .ranking-item {
  background: #16213e;
  border-color: #0f3460;
  color: #e0e0e0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
  padding: 12px 16px;
  background: #fff;
  border-radius: var(--card-radius);
  box-shadow: var(--card-shadow);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.header-left h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: var(--text-title);
}

.dark-mode .header-left h2 {
  color: #e0e0e0;
}

.header-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
}

.header-actions :deep(.el-button) {
  height: 32px;
  min-width: 88px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.header-actions :deep(.el-button .fa) {
  margin-right: 6px;
  font-size: 14px;
}

.advanced-filter {
  margin-bottom: 14px;
}

.filter-card {
  border-radius: var(--card-radius);
  box-shadow: var(--card-shadow);
  border: 1px solid #e8ecf3;
  padding: 12px 14px;
}

.filter-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
  align-items: center;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-item label {
  font-size: 14px;
  color: var(--text-sub);
  white-space: nowrap;
}

.filter-item :deep(.el-input__wrapper),
.filter-item :deep(.el-select .el-input__wrapper) {
  border-radius: 10px;
  border: 1px solid #e2e7f0;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.02);
  height: 34px;
}

.filter-item :deep(.el-date-editor .el-input__wrapper) {
  border-radius: 10px;
  height: 34px;
}

.filter-item :deep(.el-select) {
  width: 100%;
  max-width: 240px;
}

.filter-item :deep(.el-input__inner) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
}

.filter-item :deep(.el-select__caret) {
  color: #8a97ab;
}

.filter-content :deep(.el-select),
.filter-content :deep(.el-date-editor) {
  width: 100%;
}

.filter-content :deep(.el-input__inner) {
  height: var(--control-height);
}

.view-switcher {
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.view-switcher :deep(.el-radio-button__inner) {
  padding: 8px 18px;
  height: var(--control-height);
  display: inline-flex;
  align-items: center;
}

.core-indicators {
  margin-bottom: 14px;
}

.indicator-card {
  border-radius: var(--card-radius);
  margin-bottom: 12px;
  transition: all 0.25s;
  box-shadow: var(--card-shadow);
}

.indicator-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.1);
}

.indicator-content {
  display: flex;
  align-items: center;
  gap: 14px;
}

.indicator-icon,
.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 22px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

.indicator-info {
  flex: 1;
}

.indicator-label {
  font-size: 14px;
  color: #86909c;
  margin-bottom: 4px;
}

.indicator-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-title);
  line-height: 1.2;
}

.dark-mode .indicator-value {
  color: #e0e0e0;
}

.indicator-value .unit {
  font-size: 14px;
  font-weight: 500;
  color: #86909c;
  margin-left: 4px;
}

.indicator-threshold {
  margin-top: 8px;
}

.threshold-text {
  font-size: 12px;
  color: #86909c;
  margin-left: 8px;
}

.indicator-change {
  margin-top: 8px;
}

.indicator-change .increase {
  color: var(--brand-danger);
}

.indicator-change .decrease {
  color: var(--brand-success);
}

.change-text {
  font-size: 12px;
  color: #86909c;
  margin-left: 8px;
}

.energy-trend {
  margin-bottom: 14px;
}

.energy-structure {
  margin-bottom: 14px;
}

.analysis-section {
  margin-bottom: 14px;
}

.bottom-section {
  margin-bottom: 14px;
}

.chart-container {
  height: 320px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header span {
  font-weight: 600;
  color: var(--text-title);
}

.chart-actions {
  display: flex;
  gap: 10px;
}

.ranking-list {
  max-height: 350px;
  overflow-y: auto;
}

.ranking-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 10px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid #f0f0f0;
}

.ranking-item:hover {
  background: #f5f7fa;
  border-color: #e6f0ff;
}

.dark-mode .ranking-item:hover {
  background: #1a1a2e;
}

.ranking-index {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  margin-right: 12px;
}

.ranking-index.rank-1 { background: linear-gradient(135deg, #f56c6c, #e64545); }
.ranking-index.rank-2 { background: linear-gradient(135deg, #e6a23c, #d4942a); }
.ranking-index.rank-3 { background: linear-gradient(135deg, #409eff, #2d7fd9); }
.ranking-index.rank-4, .ranking-index.rank-5 { background: #909399; }

.ranking-name {
  flex: 1;
  font-size: 14px;
  color: var(--text-title);
}

.dark-mode .ranking-name {
  color: #e0e0e0;
}

.ranking-value {
  font-size: 14px;
  color: var(--text-title);
  margin: 0 15px;
  width: 100px;
  text-align: right;
}

.dark-mode .ranking-value {
  color: #e0e0e0;
}

.ranking-item :deep(.el-progress) {
  flex: 1;
  max-width: 120px;
}

.alert-badge {
  margin-left: 10px;
}

.alert-table {
  max-height: 350px;
  overflow-y: auto;
}

.dark-mode .alert-table {
  background: #16213e;
}

.multi-station-view {
  margin-top: 14px;
}

.multi-station-header {
  margin-bottom: 14px;
}

.stat-card {
  border-radius: var(--card-radius);
  margin-bottom: 16px;
  box-shadow: var(--card-shadow);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 14px;
}

.stat-icon {
  width: var(--icon-size);
  height: var(--icon-size);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 22px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-title);
}

.dark-mode .stat-value {
  color: #e0e0e0;
}

.stat-label {
  font-size: 14px;
  color: #86909c;
}

.multi-station-charts {
  margin-bottom: 14px;
}

.multi-station-table {
  margin-bottom: 14px;
}

.alert-detail {
  padding: 10px 0;
}

.personalize-form,
.threshold-form {
  padding: 10px 0;
}

::deep(.el-card) {
  border-radius: var(--card-radius);
}

:deep(.el-card__header) {
  padding: 14px 18px;
  border-bottom: 1px solid #ebeef5;
}

.dark-mode :deep(.el-card__header) {
  border-bottom-color: #0f3460;
}

:deep(.el-dialog__header) {
  padding: 18px 20px;
  border-bottom: 1px solid #ebeef5;
}

.dark-mode :deep(.el-dialog__header) {
  border-bottom-color: #0f3460;
}

:deep(.el-descriptions__label) {
  width: 120px;
}

::deep(.el-card) {
  border-radius: var(--card-radius);
}

::deep(.el-dialog__header) {
  padding: 18px 20px;
  border-bottom: 1px solid #ebeef5;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
    justify-content: flex-start;
  }

  .filter-content {
    grid-template-columns: 1fr;
  }

  .indicator-content {
    flex-direction: column;
    text-align: center;
  }

  .chart-container {
    height: 280px;
  }
}

/* AI分析报告样式 */
.ai-analysis-section {
  margin-bottom: 14px;
}

.ai-analysis-reports {
  margin-top: 12px;
}

.ai-analysis-reports .sub-text {
  font-size: 12px;
  color: var(--text-sub);
  margin-left: 4px;
}

.ai-analysis-reports :deep(.el-table) {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e8ecf3;
}

.ai-analysis-reports :deep(.el-table__header th) {
  background: #f6f8fb;
  color: #4e5969;
  font-weight: 600;
  height: 44px;
}

.ai-analysis-reports :deep(.el-table__body tr) {
  transition: background-color 0.2s ease;
}

.ai-analysis-reports :deep(.el-table__body tr:hover) {
  background: #f9fbff;
}

.ai-analysis-reports :deep(.el-table__row .el-progress) {
  margin-top: 2px;
}

.ai-analysis-reports :deep(.el-tag) {
  border-radius: 10px;
}

.ai-analysis-reports :deep(.el-button.is-text) {
  color: var(--brand-primary);
}

.ai-header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.ai-analysis-content {
  min-height: 340px;
}

.ai-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
}

.ai-section-header h4 {
  margin: 0;
  color: var(--text-title);
  font-size: 16px;
  font-weight: 600;
}

.dark-mode .ai-section-header {
  border-bottom-color: #0f3460;
}

.dark-mode .ai-section-header h4 {
  color: #e0e0e0;
}

/* 预测分析样式 */
.forecast-metrics {
  margin-bottom: 20px;
}

.ai-metric-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  text-align: center;
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
}

.ai-metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.dark-mode .ai-metric-card {
  background: #1e1e1e;
  border-color: #333;
}

.ai-metric-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 5px;
}

.ai-metric-label {
  font-size: 14px;
  color: #86909c;
  margin-bottom: 8px;
}

.ai-metric-trend {
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.ai-metric-trend.up {
  color: #52c41a;
}

.ai-metric-trend.down {
  color: #f5222d;
}

.ai-chart-container {
  height: 280px;
  width: 100%;
  margin-bottom: 14px;
}

.forecast-insight {
  margin-bottom: 10px;
}

.forecast-insight:last-child {
  margin-bottom: 0;
}

/* 关联性分析样式 */
.correlation-controls {
  display: flex;
  align-items: center;
  gap: 15px;
}

.correlation-threshold-label {
  font-size: 14px;
  color: #86909c;
  min-width: 60px;
}



.correlation-insights {
  margin-top: 20px;
}

.correlation-insight-card {
  height: 160px;
  padding: 15px;
}

.correlation-strength {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.correlation-strength.strong {
  color: #52c41a;
}

.correlation-strength.moderate {
  color: #faad14;
}

.correlation-strength.weak {
  color: #86909c;
}

.correlation-strength.negative {
  color: #f5222d;
}

.correlation-systems {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-title);
  margin-bottom: 8px;
}

.correlation-description {
  font-size: 12px;
  color: #86909c;
  line-height: 1.4;
  margin-bottom: 8px;
}

.correlation-recommendation {
  font-size: 12px;
  color: var(--primary-color);
  font-weight: 500;
}

/* 策略推荐样式 */
.recommendation-cards {
  margin-top: 14px;
}

.recommendation-card {
  height: 260px;
  padding: 15px;
  display: flex;
  flex-direction: column;
}

.recommendation-header {
  display: flex;
  gap: 12px;
  margin-bottom: 15px;
}

.recommendation-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  flex-shrink: 0;
}

.recommendation-info {
  flex: 1;
  min-width: 0;
}

.recommendation-info h5 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: var(--text-title);
  font-weight: 600;
}

.recommendation-match {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.match-text {
  font-size: 12px;
  color: #86909c;
}

.recommendation-details {
  flex: 1;
  margin-bottom: 15px;
}

.recommendation-description {
  font-size: 14px;
  color: var(--text-content);
  line-height: 1.4;
  margin-bottom: 12px;
}

.recommendation-expected {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.expected-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}

.expected-label {
  color: #86909c;
}

.expected-value {
  font-weight: 600;
  color: var(--text-title);
}

.recommendation-actions {
  display: flex;
  gap: 8px;
  justify-content: space-between;
}

/* 影响分析样式 */
.impact-metrics {
  margin-bottom: 14px;
}

.impact-metric-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
}

.impact-metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.dark-mode .impact-metric-card {
  background: #1e1e1e;
  border-color: #333;
}

.impact-metric-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  flex-shrink: 0;
}

.impact-metric-content {
  flex: 1;
}

.impact-metric-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-title);
  margin-bottom: 4px;
}

.impact-metric-label {
  font-size: 14px;
  color: #86909c;
  margin-bottom: 4px;
}

.impact-metric-change {
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
}

.impact-metric-change.positive {
  color: #52c41a;
}

.impact-metric-change.negative {
  color: #f5222d;
}

.impact-charts {
  margin-bottom: 14px;
}

.impact-chart {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 12px;
  border: 1px solid #e9ecef;
}

.dark-mode .impact-chart {
  background: #1e1e1e;
  border-color: #333;
}

.impact-chart h5 {
  margin: 0 0 15px 0;
  font-size: 14px;
  color: var(--text-title);
  font-weight: 600;
}

.impact-summary-card {
  background: #f0f9ff;
  border-color: #409eff;
}

.dark-mode .impact-summary-card {
  background: #1a2332;
  border-color: #409eff;
}

.impact-summary-card h5 {
  margin: 0 0 15px 0;
  color: var(--primary-color);
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.impact-summary-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.impact-summary-item {
  font-size: 14px;
  color: var(--text-content);
  line-height: 1.5;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin: 0;
}

.impact-summary-item i {
  color: var(--primary-color);
  margin-top: 2px;
  flex-shrink: 0;
}

/* AI分析响应式设计 */
@media (max-width: 768px) {
  .ai-section-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }
  
  .correlation-controls {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .correlation-threshold-label {
    align-self: center;
  }
  
  .recommendation-card {
    height: auto;
    min-height: 280px;
  }
  
  .impact-metric-card {
    flex-direction: column;
    text-align: center;
  }
  
  .impact-charts .el-col {
    margin-bottom: 15px;
  }
}
</style>
