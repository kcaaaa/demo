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
        <el-radio-button label="single">单站看板</el-radio-button>
        <el-radio-button label="multi">多站仪表盘</el-radio-button>
      </el-radio-group>
      <el-select v-if="currentView === 'single'" v-model="selectedStation" size="small" style="margin-left: 10px;">
        <el-option v-for="station in stations" :key="station.id" :label="station.name" :value="station.id" />
      </el-select>
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
                  <el-radio-button label="hour">小时</el-radio-button>
                  <el-radio-button label="day">日</el-radio-button>
                  <el-radio-button label="week">周</el-radio-button>
                  <el-radio-button label="month">月</el-radio-button>
                  <el-radio-button label="year">年</el-radio-button>
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
                  <el-button size="small" type="primary" text @click="viewAreaRankingDetail">
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
                    <el-button size="small" type="primary" text @click="viewAllAlerts">
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
                      <el-button type="primary" size="small" text @click="handleAlert(scope.row)">
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
                <el-button type="primary" size="small" text @click="viewStationDetail(scope.row)">
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
import { ElMessage } from 'element-plus'

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
        if (compareElement && !multiStationCompareChart) {
          multiStationCompareChart = echarts.init(compareElement)
        }

        const mapElement = document.getElementById('stationMapChart')
        if (mapElement && !stationMapChart) {
          stationMapChart = echarts.init(mapElement)
        }

        if (multiStationCompareChart) renderMultiStationCompareChart()
        if (stationMapChart) renderStationMapChart()
      })
    }

    const stations = ref([
      { id: 'station1', name: '北京南站', type: 'large' },
      { id: 'station2', name: '上海虹桥站', type: 'large' },
      { id: 'station3', name: '广州南站', type: 'large' },
      { id: 'station4', name: '杭州东站', type: 'medium' },
      { id: 'station5', name: '南京南站', type: 'medium' }
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
        alertCount: 10
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
        change: 3.2
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
          label: { show: true, formatter: '{b}\n{c} kWh' },
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

    const getThresholdLabel = (key) => {
      const labels = { totalEnergy: '总能耗', totalCost: '总费用', efficiencyIndex: '能效指标', alertCount: '预警数量' }
      return labels[key] || key
    }

    const getThresholdUnit = (key) => {
      const units = { totalEnergy: 'kWh', totalCost: '¥', efficiencyIndex: 'kgce/人', alertCount: '个' }
      return units[key] || ''
    }

    watch(compareMetric, () => {
      renderMultiStationCompareChart()
    })

    onMounted(() => {
      const savedDarkMode = localStorage.getItem('darkMode') === 'true'
      isDarkMode.value = savedDarkMode
      document.body.classList.toggle('dark-mode', savedDarkMode)
      nextTick(() => {
        initCharts()
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
      savePersonalizeConfig,
      saveThresholdConfig,
      getThresholdLabel,
      getThresholdUnit
    }
  }
}
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 20px;
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

.dark-mode .indicator-card {
  background: #16213e;
  border-color: #0f3460;
  color: #e0e0e0;
}

.dark-mode .ranking-item,
.dark-mode .stat-card {
  background: #16213e;
  border-color: #0f3460;
  color: #e0e0e0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.header-left h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #1d2129;
}

.dark-mode .header-left h2 {
  color: #e0e0e0;
}

.header-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.advanced-filter {
  margin-bottom: 20px;
}

.filter-card {
  border-radius: 8px;
}

.filter-content {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: center;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-item label {
  font-size: 14px;
  color: #4e5969;
  white-space: nowrap;
}

.view-switcher {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
}

.core-indicators {
  margin-bottom: 20px;
}

.indicator-card {
  border-radius: 8px;
  margin-bottom: 20px;
  transition: all 0.3s;
}

.indicator-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.indicator-content {
  display: flex;
  align-items: center;
  gap: 15px;
}

.indicator-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 24px;
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
  font-weight: 600;
  color: #1d2129;
}

.dark-mode .indicator-value {
  color: #e0e0e0;
}

.indicator-value .unit {
  font-size: 14px;
  font-weight: normal;
  color: #86909c;
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
  color: #f56c6c;
}

.indicator-change .decrease {
  color: #67c23a;
}

.change-text {
  font-size: 12px;
  color: #86909c;
  margin-left: 8px;
}

.energy-trend {
  margin-bottom: 20px;
}

.energy-structure {
  margin-bottom: 20px;
}

.analysis-section {
  margin-bottom: 20px;
}

.bottom-section {
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
  border-radius: 6px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.ranking-item:hover {
  background: #f5f7fa;
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
  font-size: 14px;
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
  color: #1d2129;
}

.dark-mode .ranking-name {
  color: #e0e0e0;
}

.ranking-value {
  font-size: 14px;
  color: #1d2129;
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
  margin-top: 20px;
}

.multi-station-header {
  margin-bottom: 20px;
}

.stat-card {
  border-radius: 8px;
  margin-bottom: 20px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 24px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #1d2129;
}

.dark-mode .stat-value {
  color: #e0e0e0;
}

.stat-label {
  font-size: 14px;
  color: #86909c;
}

.multi-station-charts {
  margin-bottom: 20px;
}

.multi-station-table {
  margin-bottom: 20px;
}

.alert-detail {
  padding: 10px 0;
}

.personalize-form,
.threshold-form {
  padding: 10px 0;
}

:deep(.el-card__header) {
  padding: 15px 20px;
  border-bottom: 1px solid #ebeef5;
}

.dark-mode :deep(.el-card__header) {
  border-bottom-color: #0f3460;
}

:deep(.el-dialog__header) {
  padding: 20px;
  border-bottom: 1px solid #ebeef5;
}

.dark-mode :deep(.el-dialog__header) {
  border-bottom-color: #0f3460;
}

:deep(.el-descriptions__label) {
  width: 120px;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
    justify-content: flex-start;
  }

  .filter-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .filter-item {
    width: 100%;
  }

  .indicator-content {
    flex-direction: column;
    text-align: center;
  }

  .chart-container {
    height: 280px;
  }
}
</style>
