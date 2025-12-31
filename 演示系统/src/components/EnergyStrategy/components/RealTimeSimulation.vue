<template>
  <div class="real-time-simulation-container">
    <el-card shadow="hover" class="simulation-card">
      <div slot="header" class="card-header">
        <h3 class="card-title">
          <i class="fa fa-clock-o"></i> 实时模拟
        </h3>
        <div class="header-actions">
          <el-button-group>
            <el-button
              :type="simulationStatus === 'running' ? 'danger' : 'primary'"
              size="small"
              @click="toggleSimulation"
              :loading="simulationLoading"
            >
              <i :class="[simulationStatus === 'running' ? 'fa fa-pause' : 'fa fa-play']"></i>
              {{ simulationStatus === 'running' ? '暂停' : simulationStatus === 'paused' ? '继续' : '开始模拟' }}
            </el-button>
            <el-button size="small" @click="handleReset" :disabled="simulationStatus === 'idle'">
              <i class="fa fa-refresh"></i> 重置
            </el-button>
          </el-button-group>
          <el-button size="small" @click="handleExportData" :disabled="simulationData.length === 0">
            <i class="fa fa-download"></i> 导出数据
          </el-button>
          <el-button size="small" @click="handleSaveSnapshot">
            <i class="fa fa-camera"></i> 保存快照
          </el-button>
        </div>
      </div>

      <!-- 模拟控制面板 -->
      <div class="control-panel">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="6">
            <div class="control-item">
              <div class="control-label">模拟速度</div>
              <el-slider
                v-model="simulationSpeed"
                :min="1"
                :max="10"
                :marks="speedMarks"
                :disabled="simulationStatus === 'idle'"
                @change="handleSpeedChange"
              ></el-slider>
              <div class="control-value">{{ simulationSpeed }}x</div>
            </div>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6">
            <div class="control-item">
              <div class="control-label">时间跨度</div>
              <el-select
                v-model="timeRange"
                placeholder="选择时间跨度"
                style="width: 100%"
                :disabled="simulationStatus !== 'idle'"
                @change="handleTimeRangeChange"
              >
                <el-option label="1小时" value="1h" />
                <el-option label="6小时" value="6h" />
                <el-option label="12小时" value="12h" />
                <el-option label="24小时" value="24h" />
                <el-option label="7天" value="7d" />
                <el-option label="30天" value="30d" />
              </el-select>
            </div>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6">
            <div class="control-item">
              <div class="control-label">当前时间</div>
              <div class="time-display">
                <span class="time-value">{{ currentSimulatedTime }}</span>
                <span class="time-label">{{ simulationDate }}</span>
              </div>
            </div>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6">
            <div class="control-item">
              <div class="control-label">模拟进度</div>
              <el-progress
                :percentage="simulationProgress"
                :status="simulationProgress === 100 ? 'success' : ''"
                :stroke-width="20"
              ></el-progress>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 模拟状态概览 -->
      <div class="status-overview">
        <el-row :gutter="20">
          <el-col :xs="12" :sm="8" :md="4">
            <div class="status-card">
              <div class="status-icon running">
                <i class="fa fa-bolt"></i>
              </div>
              <div class="status-info">
                <div class="status-value">{{ currentPower.toFixed(1) }}</div>
                <div class="status-label">当前功率(kW)</div>
              </div>
            </div>
          </el-col>
          <el-col :xs="12" :sm="8" :md="4">
            <div class="status-card">
              <div class="status-icon energy">
                <i class="fa fa-flash"></i>
              </div>
              <div class="status-info">
                <div class="status-value">{{ totalConsumption.toFixed(2) }}</div>
                <div class="status-label">总能耗(MWh)</div>
              </div>
            </div>
          </el-col>
          <el-col :xs="12" :sm="8" :md="4">
            <div class="status-card">
              <div class="status-icon savings">
                <i class="fa fa-pie-chart"></i>
              </div>
              <div class="status-info">
                <div class="status-value">{{ currentSavingsRate.toFixed(1) }}%</div>
                <div class="status-label">节能率</div>
              </div>
            </div>
          </el-col>
          <el-col :xs="12" :sm="8" :md="4">
            <div class="status-card">
              <div class="status-icon cost">
                <i class="fa fa-rmb"></i>
              </div>
              <div class="status-info">
                <div class="status-value">¥{{ currentCostSavings.toLocaleString() }}</div>
                <div class="status-label">节约成本(元)</div>
              </div>
            </div>
          </el-col>
          <el-col :xs="12" :sm="8" :md="4">
            <div class="status-card">
              <div class="status-icon efficiency">
                <i class="fa fa-tachometer"></i>
              </div>
              <div class="status-info">
                <div class="status-value">{{ systemEfficiency.toFixed(1) }}%</div>
                <div class="status-label">系统效率</div>
              </div>
            </div>
          </el-col>
          <el-col :xs="12" :sm="8" :md="4">
            <div class="status-card">
              <div class="status-icon alerts">
                <i class="fa fa-exclamation-triangle"></i>
              </div>
              <div class="status-info">
                <div class="status-value">{{ alertCount }}</div>
                <div class="status-label">告警数量</div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 实时图表区域 -->
      <div class="chart-section">
        <el-row :gutter="20">
          <el-col :xs="24" :lg="16">
            <el-card shadow="hover" class="chart-card">
              <div slot="header" class="card-header">
                <span>能耗实时趋势</span>
                <div class="chart-actions">
                  <el-radio-group v-model="chartViewMode" size="mini">
                    <el-radio-button label="all">全部</el-radio-button>
                    <el-radio-button label="day">日</el-radio-button>
                    <el-radio-button label="week">周</el-radio-button>
                  </el-radio-group>
                </div>
              </div>
              <div class="chart-container">
                <div ref="mainChart" class="chart"></div>
              </div>
              <div class="chart-legend">
                <div class="legend-item">
                  <span class="legend-color baseline"></span>
                  <span>基准能耗</span>
                </div>
                <div class="legend-item">
                  <span class="legend-color actual"></span>
                  <span>实际能耗</span>
                </div>
                <div class="legend-item">
                  <span class="legend-color predicted"></span>
                  <span>预测能耗</span>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :xs="24" :lg="8">
            <el-card shadow="hover" class="chart-card">
              <div slot="header" class="card-header">
                <span>设备能耗占比</span>
              </div>
              <div class="chart-container">
                <div ref="pieChart" class="chart"></div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <!-- 分项能耗分析 -->
      <div class="energy-breakdown">
        <el-card shadow="hover">
          <div slot="header" class="card-header">
            <span>分项能耗分析</span>
          </div>
          <el-table :data="energyBreakdownData" stripe size="small">
            <el-table-column prop="name" label="能耗分类"></el-table-column>
          <el-table-column prop="currentPower" label="当前功率(kW)">
            <template #default="{ row }">
              {{ row.currentPower.toFixed(1) }}
            </template>
          </el-table-column>
          <el-table-column prop="totalConsumption" label="累计能耗(MWh)">
            <template #default="{ row }">
              {{ row.totalConsumption.toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column prop="percentage" label="占比">
            <template #default="{ row }">
              <el-progress :percentage="row.percentage" :stroke-width="18"></el-progress>
            </template>
          </el-table-column>
          <el-table-column prop="savings" label="节能效果">
            <template #default="{ row }">
              <span :class="row.savings > 0 ? 'text-success' : 'text-danger'">
                {{ row.savings > 0 ? '+' : '' }}{{ row.savings.toFixed(1) }}%
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="trend" label="趋势">
            <template #default="{ row }">
              <i :class="getTrendIcon(row.trend)" :style="{ color: getTrendColor(row.trend) }"></i>
            </template>
          </el-table-column>
          </el-table>
        </el-card>
      </div>

      <!-- 模拟数据列表 -->
      <div class="data-table">
        <el-card shadow="hover">
          <div slot="header" class="card-header">
            <span>模拟数据记录</span>
            <div class="header-actions">
              <el-button size="mini" @click="handleClearData" :disabled="simulationData.length === 0">
                清空
              </el-button>
            </div>
          </div>
          <el-table
            :data="simulationData"
            stripe
            size="small"
            max-height="300"
            :default-sort="{ prop: 'timestamp', order: 'descending' }"
          >
            <el-table-column prop="timestamp" label="时间" width="180" sortable>
              <template #default="{ row }">
                {{ formatTimestamp(row.timestamp) }}
              </template>
            </el-table-column>
            <el-table-column prop="power" label="功率(kW)" width="120">
              <template #default="{ row }">
                {{ row.power.toFixed(1) }}
              </template>
            </el-table-column>
            <el-table-column prop="consumption" label="累计能耗(MWh)" width="140">
              <template #default="{ row }">
                {{ row.consumption.toFixed(2) }}
              </template>
            </el-table-column>
            <el-table-column prop="baseline" label="基准能耗(MWh)" width="140">
              <template #default="{ row }">
                {{ row.baseline.toFixed(2) }}
              </template>
            </el-table-column>
            <el-table-column prop="savingsRate" label="节能率" width="100">
              <template #default="{ row }">
                <span :class="row.savingsRate >= 0 ? 'text-success' : 'text-danger'">
                  {{ row.savingsRate >= 0 ? '+' : '' }}{{ row.savingsRate.toFixed(1) }}%
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="costSavings" label="节约成本(元)" width="130">
              <template #default="{ row }">
                ¥{{ row.costSavings.toLocaleString() }}
              </template>
            </el-table-column>
            <el-table-column prop="efficiency" label="系统效率" width="100">
              <template #default="{ row }">
                {{ row.efficiency.toFixed(1) }}%
              </template>
            </el-table-column>
            <el-table-column prop="notes" label="备注" min-width="150">
              <template #default="{ row }">
                <span v-if="row.notes" class="notes-text">{{ row.notes }}</span>
                <span v-else class="notes-placeholder">-</span>
              </template>
            </el-table-column>
          </el-table>
          <div class="pagination-wrapper">
            <el-pagination
              :current-page="dataPage"
              :page-sizes="[10, 20, 50, 100]"
              :page-size="dataPageSize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="simulationData.length"
              @size-change="handleDataPageSizeChange"
              @current-change="handleDataPageChange"
            ></el-pagination>
          </div>
        </el-card>
      </div>

      <!-- 告警信息 -->
      <div v-if="alerts.length > 0" class="alerts-section">
        <el-card shadow="hover">
          <div slot="header" class="card-header">
            <span>
              <i class="fa fa-bell"></i> 实时告警
            </span>
            <el-button size="mini" type="text" @click="handleClearAlerts">清除全部</el-button>
          </div>
          <div class="alerts-list">
            <transition-group name="alert-list" tag="div">
              <div
                v-for="alert in alerts"
                :key="alert.id"
                class="alert-item"
                :class="'alert-' + alert.level"
              >
                <div class="alert-icon">
                  <i :class="getAlertIcon(alert.level)"></i>
                </div>
                <div class="alert-content">
                  <div class="alert-title">{{ alert.title }}</div>
                  <div class="alert-message">{{ alert.message }}</div>
                  <div class="alert-time">{{ alert.time }}</div>
                </div>
                <div class="alert-actions">
                  <el-button size="mini" type="text" @click="handleDismissAlert(alert.id)">
                    忽略
                  </el-button>
                  <el-button size="mini" type="text" @click="handleHandleAlert(alert)">
                    处理
                  </el-button>
                </div>
              </div>
            </transition-group>
          </div>
        </el-card>
      </div>

      <!-- 快照记录 -->
      <div v-if="snapshots.length > 0" class="snapshots-section">
        <el-card shadow="hover">
          <div slot="header" class="card-header">
            <span>
              <i class="fa fa-camera"></i> 快照记录
            </span>
          </div>
          <div class="snapshots-list">
            <div
              v-for="(snapshot, index) in snapshots"
              :key="index"
              class="snapshot-item"
              @click="handleLoadSnapshot(snapshot)"
            >
              <div class="snapshot-time">{{ snapshot.time }}</div>
              <div class="snapshot-stats">
                <span>功率: {{ snapshot.power.toFixed(1) }}kW</span>
                <span>能耗: {{ snapshot.consumption.toFixed(2) }}MWh</span>
                <span>节能率: {{ snapshot.savingsRate.toFixed(1) }}%</span>
              </div>
              <div class="snapshot-actions">
                <el-button size="mini" type="text" @click.stop="handleDeleteSnapshot(index)">
                  <i class="fa fa-trash"></i>
                </el-button>
              </div>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 参数调整面板 -->
      <div class="params-adjustment">
        <el-card shadow="hover">
          <div slot="header" class="card-header">
            <span>
              <i class="fa fa-sliders"></i> 实时参数调整
            </span>
            <el-button size="mini" type="text" @click="showParamsPanel = !showParamsPanel">
              {{ showParamsPanel ? '收起' : '展开' }}
            </el-button>
          </div>
          <div v-if="showParamsPanel" class="params-content">
            <el-row :gutter="20">
              <el-col :xs="24" :sm="12" :md="8" :lg="6">
                <div class="param-item">
                  <label>照明功率系数</label>
                  <el-slider
                    v-model="adjustableParams.lightingFactor"
                    :min="0.5"
                    :max="1.5"
                    :step="0.05"
                    :disabled="simulationStatus === 'idle'"
                    @change="handleParamChange('lightingFactor')"
                  ></el-slider>
                  <div class="param-value">{{ adjustableParams.lightingFactor.toFixed(2) }}</div>
                </div>
              </el-col>
              <el-col :xs="24" :sm="12" :md="8" :lg="6">
                <div class="param-item">
                  <label>空调设定温度</label>
                  <el-slider
                    v-model="adjustableParams.hvacTemp"
                    :min="22"
                    :max="28"
                    :step="0.5"
                    :disabled="simulationStatus === 'idle'"
                    @change="handleParamChange('hvacTemp')"
                  ></el-slider>
                  <div class="param-value">{{ adjustableParams.hvacTemp }}°C</div>
                </div>
              </el-col>
              <el-col :xs="24" :sm="12" :md="8" :lg="6">
                <div class="param-item">
                  <label>设备启停策略</label>
                  <el-select
                    v-model="adjustableParams.deviceStrategy"
                    placeholder="选择策略"
                    style="width: 100%"
                    :disabled="simulationStatus === 'idle'"
                    @change="handleParamChange('deviceStrategy')"
                  >
                    <el-option label="激进" value="aggressive" />
                    <el-option label="标准" value="standard" />
                    <el-option label="保守" value="conservative" />
                  </el-select>
                </div>
              </el-col>
              <el-col :xs="24" :sm="12" :md="8" :lg="6">
                <div class="param-item">
                  <label>峰谷电价模式</label>
                  <el-switch
                    v-model="adjustableParams.peakValleyEnabled"
                    active-text="启用"
                    inactive-text="禁用"
                    :disabled="simulationStatus === 'idle'"
                    @change="handleParamChange('peakValleyEnabled')"
                  ></el-switch>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-card>
      </div>
    </el-card>

    <!-- 参数调整确认对话框 -->
    <el-dialog
      title="参数调整确认"
      :visible.sync="paramConfirmDialogVisible"
      width="400px"
    >
      <div class="param-confirm-content">
        <p>确定要调整以下参数吗？</p>
        <div class="param-diff">
          <div class="diff-item">
            <span class="diff-label">参数:</span>
            <span class="diff-value">{{ pendingParamChange.name }}</span>
          </div>
          <div class="diff-item">
            <span class="diff-label">原值:</span>
            <span class="diff-value old">{{ pendingParamChange.oldValue }}</span>
          </div>
          <div class="diff-item">
            <span class="diff-label">新值:</span>
            <span class="diff-value new">{{ pendingParamChange.newValue }}</span>
          </div>
        </div>
        <p class="confirm-note">此调整将影响后续模拟结果。</p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="paramConfirmDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmParamChange">确认</el-button>
      </span>
    </el-dialog>

    <!-- 告警处理对话框 -->
    <el-dialog
      title="告警处理"
      :visible.sync="alertHandleDialogVisible"
      width="500px"
    >
      <div class="alert-handle-content">
        <div class="alert-info">
          <div class="alert-title">{{ selectedAlert?.title }}</div>
          <div class="alert-message">{{ selectedAlert?.message }}</div>
        </div>
        <el-form :model="alertHandleForm" label-position="top">
          <el-form-item label="处理方式">
            <el-select v-model="alertHandleForm.action" placeholder="选择处理方式" style="width: 100%">
              <el-option label="调整参数" value="adjust" />
              <el-option label="启动备用方案" value="backup" />
              <el-option label="人工干预" value="manual" />
              <el-option label="记录并忽略" value="ignore" />
            </el-select>
          </el-form-item>
          <el-form-item label="处理说明">
            <el-input
              v-model="alertHandleForm.note"
              type="textarea"
              :rows="3"
              placeholder="输入处理说明"
            ></el-input>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="alertHandleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAlertHandle">提交</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import * as echarts from 'echarts';
import { saveAs } from 'file-saver';
import { format, addHours, addDays } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export default {
  name: 'RealTimeSimulation',
  components: {},
  props: {},
  data() {
    return {
      mainChart: null,
      pieChart: null,
      resizeHandler: null,
      simulationStatus: 'idle',
      simulationLoading: false,
      simulationSpeed: 1,
      simulationProgress: 0,
      timeRange: '24h',
      currentPower: 0,
      totalConsumption: 0,
      currentSavingsRate: 0,
      currentCostSavings: 0,
      systemEfficiency: 0,
      alertCount: 0,
      chartViewMode: 'all',
      simulationData: [],
      alerts: [],
      snapshots: [],
      showParamsPanel: false,
      dataPage: 1,
      dataPageSize: 20,
      paramConfirmDialogVisible: false,
      pendingParamChange: {},
      alertHandleDialogVisible: false,
      selectedAlert: null,
      alertHandleForm: {
        action: '',
        note: ''
      },
      speedMarks: {
        1: '1x',
        3: '3x',
        5: '5x',
        7: '7x',
        10: '10x'
      },
      adjustableParams: {
        lightingFactor: 1.0,
        hvacTemp: 26,
        deviceStrategy: 'standard',
        peakValleyEnabled: false
      },
      energyBreakdownData: [
        { name: '照明系统', currentPower: 45, totalConsumption: 120, percentage: 15, savings: 12.5, trend: 'down' },
        { name: '空调系统', currentPower: 180, totalConsumption: 480, percentage: 55, savings: 8.2, trend: 'stable' },
        { name: '电梯系统', currentPower: 35, totalConsumption: 95, percentage: 12, savings: 5.8, trend: 'up' },
        { name: '信息系统', currentPower: 25, totalConsumption: 65, percentage: 8, savings: 15.3, trend: 'down' },
        { name: '其他设备', currentPower: 40, totalConsumption: 110, percentage: 10, savings: 3.2, trend: 'stable' }
      ],
      simulationInterval: null,
      startTimestamp: null,
      endTimestamp: null,
      basePower: 320
    };
  },
  computed: {
    currentSimulatedTime() {
      if (!this.startTimestamp) return '00:00:00';
      const elapsed = Date.now() - this.startTimestamp;
      const simulatedElapsed = elapsed * this.simulationSpeed;
      const date = new Date(this.startTimestamp.getTime() + simulatedElapsed);
      return format(date, 'HH:mm:ss', { locale: zhCN });
    },

    simulationDate() {
      if (!this.startTimestamp) return '';
      const date = new Date(this.startTimestamp);
      return format(date, 'yyyy年MM月dd日', { locale: zhCN });
    },

    filteredData() {
      const start = (this.dataPage - 1) * this.dataPageSize;
      const end = start + this.dataPageSize;
      return this.simulationData.slice(start, end);
    }
  },
  watch: {
    simulationStatus(newVal) {
      if (newVal === 'running') {
        this.startSimulation();
      } else {
        this.stopSimulation();
      }
    },
    chartViewMode() {
      this.renderCharts();
    }
  },
  mounted() {
    this.loadSavedData();
    this.seedInitialData();
    this.renderCharts();
  },
  beforeDestroy() {
    this.stopSimulation();
    this.disposeCharts();
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
      this.resizeHandler = null;
    }
  },

  beforeUnmount() {
    this.stopSimulation();
    this.disposeCharts();
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
      this.resizeHandler = null;
    }
  },
  methods: {
    loadSavedData() {
      const savedSnapshots = localStorage.getItem('simulationSnapshots');
      if (savedSnapshots) {
        this.snapshots = JSON.parse(savedSnapshots);
      }
    },

    // 预置一批基础模拟数据，避免初始空白
    seedInitialData() {
      if (this.simulationData.length > 0) return;

      const now = new Date();
      this.startTimestamp = new Date(now.getTime() - 12 * 60 * 60 * 1000);
      this.calculateEndTimestamp();

      let consumption = 0;
      const seeded = [];
      for (let i = 0; i < 96; i++) {
        const ts = new Date(this.startTimestamp.getTime() + i * 15 * 60 * 1000);
        const baseLoad = this.getBaseLoad(ts.getHours());
        const power = baseLoad * (0.9 + Math.random() * 0.15);
        consumption += (power / 1000) * 0.25; // 15分钟功率换算为MWh
        const baseline = consumption * 1.12;
        const savingsRate = ((baseline - consumption) / baseline) * 100;
        const costSavings = savingsRate * consumption * 800;
        seeded.push({
          timestamp: ts,
          power,
          consumption,
          baseline,
          savingsRate,
          costSavings,
          efficiency: 82 + Math.random() * 6,
          notes: i % 12 === 0 ? '历史样本数据' : ''
        });
      }

      this.simulationData = seeded;
      const lastPoint = seeded[seeded.length - 1];
      this.currentPower = lastPoint.power;
      this.totalConsumption = lastPoint.consumption;
      this.currentSavingsRate = lastPoint.savingsRate;
      this.currentCostSavings = lastPoint.costSavings;
      this.systemEfficiency = lastPoint.efficiency;
      this.simulationProgress = 35;
      this.updateEnergyBreakdown();
    },

    saveSnapshots() {
      localStorage.setItem('simulationSnapshots', JSON.stringify(this.snapshots));
    },

    toggleSimulation() {
      if (this.simulationStatus === 'idle') {
        this.startSimulation();
      } else if (this.simulationStatus === 'running') {
        this.simulationStatus = 'paused';
      } else {
        this.simulationStatus = 'running';
      }
    },

    startSimulation() {
      if (!this.startTimestamp) {
        this.startTimestamp = new Date();
        this.calculateEndTimestamp();
      }

      this.simulationInterval = setInterval(() => {
        this.updateSimulation();
      }, 1000 / this.simulationSpeed);
    },

    stopSimulation() {
      if (this.simulationInterval) {
        clearInterval(this.simulationInterval);
        this.simulationInterval = null;
      }
    },

    calculateEndTimestamp() {
      const hours = {
        '1h': 1,
        '6h': 6,
        '12h': 12,
        '24h': 24,
        '7d': 168,
        '30d': 720
      };
      const hoursToAdd = hours[this.timeRange] || 24;
      this.endTimestamp = addHours(this.startTimestamp, hoursToAdd);
    },

    updateSimulation() {
      const now = Date.now();
      if (this.startTimestamp && now >= this.endTimestamp.getTime()) {
        this.simulationStatus = 'completed';
        this.stopSimulation();
        this.simulationProgress = 100;
        this.$message.success('模拟完成');
        return;
      }

      const elapsed = (now - this.startTimestamp.getTime()) * this.simulationSpeed;
      const progress = Math.min(100, (elapsed / (this.endTimestamp.getTime() - this.startTimestamp.getTime())) * 100);
      this.simulationProgress = Math.round(progress);

      const hourOfDay = new Date(this.startTimestamp.getTime() + elapsed).getHours();
      const baseLoad = this.getBaseLoad(hourOfDay);
      const adjustmentFactor = this.adjustableParams.lightingFactor;

      this.currentPower = baseLoad * adjustmentFactor * (0.9 + Math.random() * 0.2);
      this.totalConsumption += (this.currentPower / 3600) * (1 / this.simulationSpeed);
      const baselineConsumption = this.totalConsumption * 1.12;
      this.currentSavingsRate = ((baselineConsumption - this.totalConsumption) / baselineConsumption * 100);
      this.currentCostSavings = this.currentSavingsRate * this.totalConsumption * 800;
      this.systemEfficiency = 85 + Math.random() * 10;

      const dataPoint = {
        timestamp: new Date(this.startTimestamp.getTime() + elapsed),
        power: this.currentPower,
        consumption: this.totalConsumption,
        baseline: baselineConsumption,
        savingsRate: this.currentSavingsRate,
        costSavings: this.currentCostSavings,
        efficiency: this.systemEfficiency,
        notes: ''
      };
      this.simulationData.push(dataPoint);

      if (this.simulationData.length > 1000) {
        this.simulationData.shift();
      }

      this.updateEnergyBreakdown();
      this.checkAlerts();
      this.renderCharts();
    },

    getBaseLoad(hour) {
      const loadProfile = {
        0: 180, 1: 160, 2: 150, 3: 150, 4: 160, 5: 180,
        6: 250, 7: 320, 8: 380, 9: 350, 10: 320, 11: 340,
        12: 360, 13: 350, 14: 340, 15: 350, 16: 380, 17: 400,
        18: 420, 19: 380, 20: 340, 21: 300, 22: 250, 23: 220
      };
      return loadProfile[hour] || 200;
    },

    updateEnergyBreakdown() {
      const lightingRatio = 0.15 * this.adjustableParams.lightingFactor;
      const hvacRatio = 0.55 * (1 - (28 - this.adjustableParams.hvacTemp) * 0.02);
      const elevatorRatio = 0.12;
      const infoRatio = 0.08;
      const otherRatio = 0.1;

      this.energyBreakdownData = [
        { name: '照明系统', currentPower: this.currentPower * lightingRatio, totalConsumption: this.totalConsumption * lightingRatio, percentage: Math.round(lightingRatio * 100), savings: 12.5 + Math.random() * 2, trend: 'down' },
        { name: '空调系统', currentPower: this.currentPower * Math.max(0.3, hvacRatio), totalConsumption: this.totalConsumption * Math.max(0.3, hvacRatio), percentage: Math.round(Math.max(0.3, hvacRatio) * 100), savings: 8.2 + Math.random() * 3, trend: 'stable' },
        { name: '电梯系统', currentPower: this.currentPower * elevatorRatio, totalConsumption: this.totalConsumption * elevatorRatio, percentage: 12, savings: 5.8 + Math.random() * 2, trend: 'up' },
        { name: '信息系统', currentPower: this.currentPower * infoRatio, totalConsumption: this.totalConsumption * infoRatio, percentage: 8, savings: 15.3 + Math.random() * 3, trend: 'down' },
        { name: '其他设备', currentPower: this.currentPower * otherRatio, totalConsumption: this.totalConsumption * otherRatio, percentage: 10, savings: 3.2 + Math.random() * 2, trend: 'stable' }
      ];
    },

    checkAlerts() {
      if (this.currentPower > 400 && Math.random() > 0.95) {
        this.addAlert('warning', '功率过高', `当前功率 ${this.currentPower.toFixed(1)}kW 超过阈值`);
      }
      if (this.currentSavingsRate < -5 && Math.random() > 0.95) {
        this.addAlert('danger', '节能率异常', `节能率降至 ${this.currentSavingsRate.toFixed(1)}%，请检查策略`);
      }
      if (this.systemEfficiency < 80 && Math.random() > 0.95) {
        this.addAlert('warning', '系统效率低', `系统效率降至 ${this.systemEfficiency.toFixed(1)}%`);
      }
    },

    addAlert(level, title, message) {
      const alert = {
        id: Date.now() + Math.random(),
        level,
        title,
        message,
        time: format(new Date(), 'HH:mm:ss', { locale: zhCN }),
        handled: false
      };
      this.alerts.unshift(alert);
      this.alertCount = this.alerts.filter(a => !a.handled).length;

      if (this.alerts.length > 10) {
        this.alerts.pop();
      }
    },

    getAlertIcon(level) {
      const icons = {
        info: 'fa fa-info-circle',
        warning: 'fa fa-exclamation-triangle',
        danger: 'fa fa-times-circle'
      };
      return icons[level] || icons.info;
    },

    handleDismissAlert(id) {
      this.alerts = this.alerts.filter(a => a.id !== id);
      this.alertCount = this.alerts.length;
    },

    handleClearAlerts() {
      this.alerts = [];
      this.alertCount = 0;
    },

    handleHandleAlert(alert) {
      this.selectedAlert = alert;
      this.alertHandleForm = { action: '', note: '' };
      this.alertHandleDialogVisible = true;
    },

    submitAlertHandle() {
      if (this.alertHandleForm.action) {
        if (this.selectedAlert) {
          this.alerts = this.alerts.filter(a => a.id !== this.selectedAlert.id);
        }
        this.alertCount = this.alerts.length;
        this.$message.success('告警已处理');
      }
      this.alertHandleDialogVisible = false;
    },

    handleReset() {
      this.stopSimulation();
      this.simulationStatus = 'idle';
      this.simulationProgress = 0;
      this.startTimestamp = null;
      this.endTimestamp = null;
      this.currentPower = 0;
      this.totalConsumption = 0;
      this.currentSavingsRate = 0;
      this.currentCostSavings = 0;
      this.systemEfficiency = 0;
      this.simulationData = [];
      this.alertCount = 0;
      this.alerts = [];
      this.renderCharts();
      this.$message.info('模拟已重置');
    },

    handleSpeedChange(value) {
      if (this.simulationStatus === 'running') {
        this.stopSimulation();
        this.simulationInterval = setInterval(() => {
          this.updateSimulation();
        }, 1000 / value);
      }
    },

    handleTimeRangeChange(value) {
      this.timeRange = value;
      if (this.simulationStatus === 'idle') {
        this.calculateEndTimestamp();
      }
    },

    handleParamChange(paramName) {
      this.pendingParamChange = {
        name: paramName,
        oldValue: this.adjustableParams[paramName],
        newValue: this.adjustableParams[paramName]
      };
      this.paramConfirmDialogVisible = true;
    },

    confirmParamChange() {
      this.paramConfirmDialogVisible = false;
      this.$message.success('参数已更新');
      this.addDataNote(`参数调整: ${this.pendingParamChange.name}`);
    },

    addDataNote(note) {
      if (this.simulationData.length > 0) {
        this.simulationData[this.simulationData.length - 1].notes = note;
      }
    },

    handleExportData() {
      const exportData = {
        exportTime: format(new Date(), 'yyyy-MM-dd HH:mm:ss', { locale: zhCN }),
        timeRange: this.timeRange,
        summary: {
          totalConsumption: this.totalConsumption.toFixed(2),
          averagePower: (this.totalConsumption * 3600 / (this.simulationData.length || 1)).toFixed(1),
          savingsRate: this.currentSavingsRate.toFixed(1),
          costSavings: this.currentCostSavings.toFixed(0)
        },
        data: this.simulationData.map(d => ({
          timestamp: this.formatTimestamp(d.timestamp),
          power: d.power.toFixed(1),
          consumption: d.consumption.toFixed(2),
          baseline: d.baseline.toFixed(2),
          savingsRate: d.savingsRate.toFixed(1),
          costSavings: d.costSavings.toFixed(0),
          efficiency: d.efficiency.toFixed(1)
        }))
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      saveAs(blob, `simulation_data_${format(new Date(), 'yyyyMMdd_HHmmss', { locale: zhCN })}.json`);
      this.$message.success('数据已导出');
    },

    handleSaveSnapshot() {
      const snapshot = {
        time: this.simulationDate + ' ' + this.currentSimulatedTime,
        power: this.currentPower,
        consumption: this.totalConsumption,
        savingsRate: this.currentSavingsRate,
        costSavings: this.currentCostSavings,
        efficiency: this.systemEfficiency,
        params: { ...this.adjustableParams }
      };
      this.snapshots.unshift(snapshot);
      if (this.snapshots.length > 10) {
        this.snapshots.pop();
      }
      this.saveSnapshots();
      this.$message.success('快照已保存');
    },

    handleLoadSnapshot(snapshot) {
      this.adjustableParams = { ...snapshot.params };
      this.$message.success('已加载快照参数');
    },

    handleDeleteSnapshot(index) {
      this.snapshots.splice(index, 1);
      this.saveSnapshots();
    },

    handleClearData() {
      this.simulationData = [];
      this.renderCharts();
      this.$message.info('数据已清空');
    },

    handleDataPageSizeChange(size) {
      this.dataPageSize = size;
      this.dataPage = 1;
    },

    handleDataPageChange(page) {
      this.dataPage = page;
    },

    formatTimestamp(timestamp) {
      if (timestamp instanceof Date) {
        return format(timestamp, 'yyyy-MM-dd HH:mm:ss', { locale: zhCN });
      }
      return timestamp;
    },

    getTrendIcon(trend) {
      const icons = { up: 'fa fa-arrow-up', down: 'fa fa-arrow-down', stable: 'fa fa-minus' };
      return icons[trend] || icons.stable;
    },

    getTrendColor(trend) {
      const colors = { up: '#F56C6C', down: '#67C23A', stable: '#909399' };
      return colors[trend] || colors.stable;
    },

    renderCharts() {
      if (!this.$refs.mainChart || !this.$refs.pieChart) return;

      this.disposeCharts();
      this.mainChart = echarts.init(this.$refs.mainChart);
      const recentData = this.simulationData.slice(-200);

      this.mainChart.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'cross' }
        },
        legend: {
          data: ['基准能耗', '实际能耗', '预测能耗'],
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
          data: recentData.map(d => this.formatTimestamp(d.timestamp).substring(11, 19))
        },
        yAxis: [
          {
            type: 'value',
            name: '功率(kW)',
            axisLabel: { formatter: '{value}' }
          },
          {
            type: 'value',
            name: '能耗(MWh)',
            axisLabel: { formatter: '{value}' },
            splitLine: { show: false }
          }
        ],
        series: [
          {
            name: '基准能耗',
            type: 'line',
            data: recentData.map(d => d.baseline),
            smooth: true,
            lineStyle: { color: '#909399', width: 2, type: 'dashed' },
            itemStyle: { color: '#909399' },
            areaStyle: { opacity: 0 }
          },
          {
            name: '实际能耗',
            type: 'line',
            data: recentData.map(d => d.consumption),
            smooth: true,
            lineStyle: { color: '#409EFF', width: 2 },
            itemStyle: { color: '#409EFF' },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
                { offset: 1, color: 'rgba(64, 158, 255, 0.05)' }
              ])
            }
          },
          {
            name: '预测能耗',
            type: 'line',
            data: recentData.map((d, i) => {
              if (i < recentData.length - 10) return null;
              return d.consumption * (1 + (Math.random() - 0.5) * 0.02);
            }),
            smooth: true,
            lineStyle: { color: '#67C23A', width: 2, type: 'dotted' },
            itemStyle: { color: '#67C23A' }
          }
        ]
      });

      this.pieChart = echarts.init(this.$refs.pieChart);
      this.pieChart.setOption({
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} ({d}%)'
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
          label: { show: false },
          emphasis: {
            label: {
              show: true,
              fontSize: 14,
              fontWeight: 'bold'
            }
          },
          data: this.energyBreakdownData.map(item => ({
            value: item.currentPower.toFixed(1),
            name: item.name,
            itemStyle: {
              color: this.getCategoryColor(item.name)
            }
          }))
        }]
      });

      this.resizeHandler = () => {
        if (this.mainChart) this.mainChart.resize();
        if (this.pieChart) this.pieChart.resize();
      };
      window.addEventListener('resize', this.resizeHandler);
    },

    getCategoryColor(name) {
      const colors = {
        '照明系统': '#409EFF',
        '空调系统': '#67C23A',
        '电梯系统': '#E6A23C',
        '信息系统': '#909399',
        '其他设备': '#F56C6C'
      };
      return colors[name] || '#409EFF';
    },

    disposeCharts() {
      if (this.mainChart) {
        this.mainChart.dispose();
        this.mainChart = null;
      }
      if (this.pieChart) {
        this.pieChart.dispose();
        this.pieChart = null;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.real-time-simulation-container {
  padding: 0;
}

.simulation-card {
  margin-bottom: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .card-title {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #303133;

      i {
        margin-right: 8px;
        color: #409EFF;
      }
    }

    .header-actions {
      display: flex;
      gap: 10px;
    }
  }
}

.control-panel {
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
  margin-bottom: 20px;

  .control-item {
    .control-label {
      font-size: 12px;
      color: #606266;
      margin-bottom: 8px;
    }

    .control-value {
      text-align: center;
      font-size: 14px;
      font-weight: bold;
      color: #409EFF;
      margin-top: 5px;
    }

    .time-display {
      text-align: center;

      .time-value {
        display: block;
        font-size: 20px;
        font-weight: bold;
        color: #303133;
        font-family: monospace;
      }

      .time-label {
        font-size: 12px;
        color: #909399;
      }
    }
  }
}

.status-overview {
  margin-bottom: 20px;

  .status-card {
    display: flex;
    align-items: center;
    padding: 15px;
    background: white;
    border: 1px solid #ebeef5;
    border-radius: 8px;
    margin-bottom: 15px;
    transition: all 0.3s;

    &:hover {
      border-color: #409EFF;
      box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
    }

    .status-icon {
      width: 48px;
      height: 48px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 15px;
      font-size: 20px;
      color: white;

      &.running { background: linear-gradient(135deg, #409EFF, #67C23A); }
      &.energy { background: linear-gradient(135deg, #E6A23C, #F56C6C); }
      &.savings { background: linear-gradient(135deg, #67C23A, #409EFF); }
      &.cost { background: linear-gradient(135deg, #909399, #606266); }
      &.efficiency { background: linear-gradient(135deg, #722ED1, #409EFF); }
      &.alerts { background: linear-gradient(135deg, #F56C6C, #E6A23C); }
    }

    .status-info {
      flex: 1;

      .status-value {
        font-size: 20px;
        font-weight: bold;
        color: #303133;
      }

      .status-label {
        font-size: 12px;
        color: #909399;
      }
    }
  }
}

.chart-section {
  margin-bottom: 20px;

  .chart-card {
    margin-bottom: 20px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 14px;
      font-weight: 600;
    }

    .chart-container {
      height: 350px;

      .chart {
        width: 100%;
        height: 100%;
      }
    }

    .chart-legend {
      display: flex;
      justify-content: center;
      gap: 30px;
      margin-top: 15px;
      padding-top: 15px;
      border-top: 1px solid #ebeef5;

      .legend-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 12px;
        color: #606266;

        .legend-color {
          width: 20px;
          height: 3px;
          border-radius: 2px;

          &.baseline { background: #909399; }
          &.actual { background: #409EFF; }
          &.predicted { background: #67C23A; }
        }
      }
    }
  }
}

.energy-breakdown {
  margin-bottom: 20px;

  .text-success {
    color: #67C23A;
  }

  .text-danger {
    color: #F56C6C;
  }
}

.data-table {
  margin-bottom: 20px;

  .pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    margin-top: 15px;
  }

  .notes-text {
    color: #606266;
    font-size: 12px;
  }

  .notes-placeholder {
    color: #c0c4cc;
  }
}

.alerts-section {
  margin-bottom: 20px;

  .alerts-list {
    max-height: 300px;
    overflow-y: auto;

    .alert-item {
      display: flex;
      align-items: flex-start;
      padding: 12px;
      border-radius: 6px;
      margin-bottom: 10px;
      transition: all 0.3s;

      &.alert-info {
        background: #ecf5ff;
        border: 1px solid #b3d8ff;
      }

      &.alert-warning {
        background: #fdf6ec;
        border: 1px solid #faecd8;
      }

      &.alert-danger {
        background: #fef0f0;
        border: 1px solid #fde2e2;
      }

      .alert-icon {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 12px;
        font-size: 16px;
      }

      .alert-info & .alert-icon {
        background: #409EFF;
        color: white;
      }

      .alert-warning & .alert-icon {
        background: #E6A23C;
        color: white;
      }

      .alert-danger & .alert-icon {
        background: #F56C6C;
        color: white;
      }

      .alert-content {
        flex: 1;

        .alert-title {
          font-weight: 600;
          color: #303133;
          margin-bottom: 5px;
        }

        .alert-message {
          font-size: 13px;
          color: #606266;
          margin-bottom: 5px;
        }

        .alert-time {
          font-size: 11px;
          color: #909399;
        }
      }

      .alert-actions {
        display: flex;
        flex-direction: column;
        gap: 5px;
      }
    }
  }
}

.snapshots-section {
  margin-bottom: 20px;

  .snapshots-list {
    .snapshot-item {
      display: flex;
      align-items: center;
      padding: 12px;
      border: 1px solid #ebeef5;
      border-radius: 6px;
      margin-bottom: 10px;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        border-color: #409EFF;
        background: #f5f7fa;
      }

      .snapshot-time {
        width: 150px;
        font-size: 13px;
        color: #606266;
      }

      .snapshot-stats {
        flex: 1;
        display: flex;
        gap: 20px;
        font-size: 12px;
        color: #909399;
      }

      .snapshot-actions {
        opacity: 0;
        transition: opacity 0.2s;
      }

      &:hover .snapshot-actions {
        opacity: 1;
      }
    }
  }
}

.params-adjustment {
  .params-content {
    padding: 20px 0;

    .param-item {
      padding: 15px;
      background: #fafafa;
      border-radius: 8px;

      label {
        display: block;
        font-size: 12px;
        color: #606266;
        margin-bottom: 10px;
      }

      .param-value {
        text-align: center;
        font-size: 14px;
        font-weight: bold;
        color: #409EFF;
        margin-top: 10px;
      }
    }
  }
}

.param-confirm-content {
  .param-diff {
    background: #f5f7fa;
    padding: 15px;
    border-radius: 6px;
    margin: 15px 0;

    .diff-item {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px dashed #ebeef5;

      &:last-child {
        border-bottom: none;
      }

      .diff-label {
        color: #909399;
      }

      .diff-value {
        font-weight: 500;
        color: #303133;

        &.old {
          text-decoration: line-through;
          color: #F56C6C;
        }

        &.new {
          color: #67C23A;
        }
      }
    }
  }

  .confirm-note {
    font-size: 12px;
    color: #909399;
  }
}

.alert-handle-content {
  .alert-info {
    background: #fdf6ec;
    padding: 15px;
    border-radius: 6px;
    margin-bottom: 20px;

    .alert-title {
      font-weight: 600;
      color: #E6A23C;
      margin-bottom: 8px;
    }

    .alert-message {
      color: #606266;
    }
  }
}

.alert-list-enter-active,
.alert-list-leave-active {
  transition: all 0.3s ease;
}

.alert-list-enter-from,
.alert-list-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

@media (max-width: 768px) {
  .control-panel {
    .el-row {
      margin: 0 !important;
    }
  }

  .status-overview {
    .el-row {
      margin: 0 !important;
    }
  }

  .chart-section {
    .el-row {
      margin: 0 !important;
    }
  }

  .status-card {
    padding: 10px !important;

    .status-icon {
      width: 40px !important;
      height: 40px !important;
      font-size: 16px !important;
    }

    .status-value {
      font-size: 16px !important;
    }
  }

  .alerts-section {
    .alert-item {
      flex-direction: column;

      .alert-icon {
        margin-bottom: 10px;
      }
    }
  }
}
</style>
