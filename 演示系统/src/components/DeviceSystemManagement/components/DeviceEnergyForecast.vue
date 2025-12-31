<template>
  <div class="device-energy-forecast">
    <div class="toolbar">
      <el-button type="primary" @click="handleNewForecast">
        <i class="fa fa-plus"></i> 新建预测
      </el-button>
      <el-button type="success" @click="handleTrainModel">
        <i class="fa fa-cogs"></i> 训练模型
      </el-button>
      <el-button type="info" @click="handleExport">
        <i class="fa fa-download"></i> 导出报告
      </el-button>
      <div class="toolbar-right">
        <el-select v-model="selectedDevice" placeholder="选择设备" clearable style="width: 200px;">
          <el-option v-for="device in deviceList" :key="device.id" :label="device.name" :value="device.id" />
        </el-select>
        <el-select v-model="selectedModel" placeholder="预测模型" style="width: 150px; margin-left: 10px;">
          <el-option label="LSTM" value="lstm" />
          <el-option label="Prophet" value="prophet" />
          <el-option label="ARIMA" value="arima" />
          <el-option label="XGBoost" value="xgboost" />
        </el-select>
      </div>
    </div>

    <div class="stats-section" v-if="forecastMetrics">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card shadow="hover" class="metric-card">
            <div class="metric-content">
              <div class="metric-header">
                <span class="metric-label">预测能耗</span>
                <el-tooltip content="未来24小时预测总能耗" placement="top">
                  <i class="fa fa-info-circle"></i>
                </el-tooltip>
              </div>
              <div class="metric-value">{{ forecastMetrics.predictedConsumption.toFixed(2) }}</div>
              <div class="metric-unit">kWh</div>
              <div class="metric-trend" :class="forecastMetrics.trend > 0 ? 'up' : 'down'">
                <i :class="[forecastMetrics.trend > 0 ? 'fa fa-arrow-up' : 'fa fa-arrow-down']"></i>
                <span>{{ Math.abs(forecastMetrics.trend).toFixed(1) }}% 较昨日</span>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="metric-card">
            <div class="metric-content">
              <div class="metric-header">
                <span class="metric-label">预测精度</span>
                <el-tooltip content="模型预测准确度 (MAPE)" placement="top">
                  <i class="fa fa-info-circle"></i>
                </el-tooltip>
              </div>
              <div class="metric-value">{{ (forecastMetrics.accuracy * 100).toFixed(1) }}</div>
              <div class="metric-unit">%</div>
              <div class="metric-status" :class="getAccuracyStatus(forecastMetrics.accuracy)">
                {{ getAccuracyLabel(forecastMetrics.accuracy) }}
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="metric-card">
            <div class="metric-content">
              <div class="metric-header">
                <span class="metric-label">峰谷预测</span>
                <el-tooltip content="预测用电高峰与低谷时段" placement="top">
                  <i class="fa fa-info-circle"></i>
                </el-tooltip>
              </div>
              <div class="metric-value">{{ forecastMetrics.peakHour }}:00</div>
              <div class="metric-unit">高峰时段</div>
              <div class="metric-sub">
                <span>低谷: {{ forecastMetrics.valleyHour }}:00</span>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="metric-card">
            <div class="metric-content">
              <div class="metric-header">
                <span class="metric-label">模型状态</span>
                <el-tooltip content="当前预测模型训练状态" placement="top">
                  <i class="fa fa-info-circle"></i>
                </el-tooltip>
              </div>
              <div class="model-status">
                <el-tag :type="modelStatusType" size="small">{{ modelStatusText }}</el-tag>
              </div>
              <div class="model-info">
                <span>样本数: {{ forecastMetrics.sampleCount }}</span>
              </div>
              <div class="model-actions">
                <el-button size="mini" type="primary" text @click="handleRetrain">重新训练</el-button>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <div class="chart-section" v-if="hasForecastData">
      <el-row :gutter="20">
        <el-col :span="16">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>能耗预测曲线</span>
                <div class="header-actions">
                  <el-radio-group v-model="chartView" size="small">
                    <el-radio-button label="day">日预测</el-radio-button>
                    <el-radio-button label="week">周预测</el-radio-button>
                    <el-radio-button label="month">月预测</el-radio-button>
                  </el-radio-group>
                  <el-button size="small" type="text" @click="handleZoomReset">
                    <i class="fa fa-refresh"></i> 重置
                  </el-button>
                </div>
              </div>
            </template>
            <div ref="forecastChartRef" class="forecast-chart"></div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>预测详情</span>
              </div>
            </template>
            <div class="forecast-detail" v-loading="loading">
              <div class="detail-section">
                <h4>未来24小时预测</h4>
                <div class="detail-grid">
                  <div class="detail-item">
                    <span class="label">预测时间</span>
                    <span class="value">{{ forecastDetail.timeRange }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">预测能耗</span>
                    <span class="value highlight">{{ forecastDetail.predictedValue.toFixed(2) }} kWh</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">置信区间</span>
                    <span class="value">{{ forecastDetail.confidenceLower.toFixed(2) }} - {{ forecastDetail.confidenceUpper.toFixed(2) }} kWh</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">预测误差</span>
                    <span class="value" :class="getErrorClass(forecastDetail.error)">
                      ±{{ forecastDetail.error.toFixed(2) }}%
                    </span>
                  </div>
                </div>
              </div>

              <div class="detail-section">
                <h4>分时段预测</h4>
                <div class="hourly-forecast">
                  <div v-for="(item, index) in forecastDetail.hourlyData" :key="index" class="hourly-item">
                    <span class="hour">{{ item.hour }}:00</span>
                    <div class="hourly-bar">
                      <div class="bar-fill" :style="{ width: item.percent + '%' }"></div>
                    </div>
                    <span class="hourly-value">{{ item.value.toFixed(1) }} kWh</span>
                  </div>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <div class="history-section">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>历史预测对比</span>
                <div class="header-actions">
                  <el-select v-model="comparisonPeriod" size="small" style="width: 120px;">
                    <el-option label="近7天" value="7" />
                    <el-option label="近30天" value="30" />
                    <el-option label="近90天" value="90" />
                  </el-select>
                </div>
              </div>
            </template>
            <div ref="comparisonChartRef" class="comparison-chart"></div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>预测误差分布</span>
              </div>
            </template>
            <div ref="errorDistChartRef" class="error-dist-chart"></div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <div class="records-section">
      <el-card shadow="hover">
        <template #header>
          <div class="card-header">
            <span>预测记录</span>
            <div class="header-actions">
              <el-input
                v-model="searchKeyword"
                placeholder="搜索..."
                prefix-icon="el-icon-search"
                size="small"
                style="width: 200px;"
                clearable
              />
            </div>
          </div>
        </template>
        <el-table :data="forecastRecords" stripe v-loading="loading" row-key="id">
          <el-table-column prop="id" label="预测编号" width="120" />
          <el-table-column prop="deviceName" label="设备名称" min-width="150" />
          <el-table-column prop="model" label="预测模型" width="100" align="center">
            <template #default="scope">
              <el-tag size="small">{{ getModelName(scope.row.model) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="forecastPeriod" label="预测周期" width="150" />
          <el-table-column prop="predictedValue" label="预测值" width="120" align="right">
            <template #default="scope">
              {{ scope.row.predictedValue.toFixed(2) }} kWh
            </template>
          </el-table-column>
          <el-table-column prop="accuracy" label="准确率" width="100" align="center">
            <template #default="scope">
              <el-tag :type="getAccuracyTagType(scope.row.accuracy)" size="small">
                {{ (scope.row.accuracy * 100).toFixed(1) }}%
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="预测时间" width="160" />
          <el-table-column prop="status" label="状态" width="100" align="center">
            <template #default="scope">
              <el-tag :type="scope.row.status === 'completed' ? 'success' : 'info'" size="small">
                {{ scope.row.status === 'completed' ? '完成' : '进行中' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" align="center" fixed="right">
            <template #default="scope">
              <el-button type="primary" size="mini" text @click="handleViewDetail(scope.row)">
                <i class="fa fa-eye"></i> 查看
              </el-button>
              <el-button type="danger" size="mini" text @click="handleDeleteRecord(scope.row)">
                <i class="fa fa-trash"></i> 删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="pagination-section">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="totalRecords"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handlePageSizeChange"
            @current-change="handlePageChange"
          />
        </div>
      </el-card>
    </div>

    <el-dialog v-model="showForecastDialog" title="新建能耗预测" width="600px" center>
      <el-form :model="forecastForm" :rules="formRules" ref="forecastFormRef" label-width="100px">
        <el-form-item label="选择设备" prop="deviceId">
          <el-select v-model="forecastForm.deviceId" placeholder="请选择设备" style="width: 100%;">
            <el-option v-for="device in deviceList" :key="device.id" :label="device.name" :value="device.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="预测模型" prop="model">
          <el-select v-model="forecastForm.model" placeholder="选择预测模型" style="width: 100%;">
            <el-option label="LSTM (长短期记忆网络)" value="lstm" />
            <el-option label="Prophet (Facebook时序预测)" value="prophet" />
            <el-option label="ARIMA (自回归移动平均)" value="arima" />
            <el-option label="XGBoost (梯度提升树)" value="xgboost" />
          </el-select>
        </el-form-item>
        <el-form-item label="预测周期" prop="period">
          <el-select v-model="forecastForm.period" placeholder="选择预测周期" style="width: 100%;">
            <el-option label="未来24小时" value="24h" />
            <el-option label="未来7天" value="7d" />
            <el-option label="未来30天" value="30d" />
          </el-select>
        </el-form-item>
        <el-form-item label="历史数据" prop="historyDays">
          <el-select v-model="forecastForm.historyDays" placeholder="选择历史数据范围" style="width: 100%;">
            <el-option label="最近30天" :value="30" />
            <el-option label="最近60天" :value="60" />
            <el-option label="最近90天" :value="90" />
            <el-option label="最近180天" :value="180" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="forecastForm.remark" type="textarea" :rows="3" placeholder="请输入备注信息" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showForecastDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitForecast" :loading="submitLoading">
          开始预测
        </el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showDetailDialog" title="预测详情" width="700px" center>
      <div class="detail-dialog-content" v-if="currentRecord">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="预测编号">{{ currentRecord.id }}</el-descriptions-item>
          <el-descriptions-item label="设备名称">{{ currentRecord.deviceName }}</el-descriptions-item>
          <el-descriptions-item label="预测模型">{{ getModelName(currentRecord.model) }}</el-descriptions-item>
          <el-descriptions-item label="预测周期">{{ currentRecord.forecastPeriod }}</el-descriptions-item>
          <el-descriptions-item label="预测能耗">{{ currentRecord.predictedValue.toFixed(2) }} kWh</el-descriptions-item>
          <el-descriptions-item label="预测精度">{{ (currentRecord.accuracy * 100).toFixed(1) }}%</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ currentRecord.createTime }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="currentRecord.status === 'completed' ? 'success' : 'info'" size="small">
              {{ currentRecord.status === 'completed' ? '完成' : '进行中' }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>

        <div class="detail-chart">
          <div ref="detailChartRef" class="detail-forecast-chart"></div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'

export default {
  name: 'DeviceEnergyForecast',
  setup() {
    const loading = ref(false)
    const submitLoading = ref(false)
    const showForecastDialog = ref(false)
    const showDetailDialog = ref(false)
    const chartView = ref('day')
    const comparisonPeriod = ref('7')
    const selectedDevice = ref('')
    const selectedModel = ref('lstm')
    const searchKeyword = ref('')
    const currentPage = ref(1)
    const pageSize = ref(10)
    const totalRecords = ref(0)
    const currentRecord = ref(null)

    const forecastChartRef = ref(null)
    const comparisonChartRef = ref(null)
    const errorDistChartRef = ref(null)
    const detailChartRef = ref(null)

    let forecastChart = null
    let comparisonChart = null
    let errorDistChart = null
    let detailChart = null

    const forecastMetrics = ref({
      predictedConsumption: 2456.78,
      trend: -5.2,
      accuracy: 0.94,
      peakHour: 14,
      valleyHour: 3,
      sampleCount: 3650
    })

    const hasForecastData = ref(true)
    const modelStatusType = ref('success')
    const modelStatusText = ref('已训练')

    const forecastDetail = ref({
      timeRange: '2024-01-15 00:00 - 2024-01-16 00:00',
      predictedValue: 2456.78,
      confidenceLower: 2312.45,
      confidenceUpper: 2601.12,
      error: 3.2,
      hourlyData: [
        { hour: 0, value: 85.2, percent: 34 },
        { hour: 1, value: 72.5, percent: 29 },
        { hour: 2, value: 68.3, percent: 27 },
        { hour: 3, value: 65.8, percent: 26 },
        { hour: 4, value: 68.2, percent: 27 },
        { hour: 5, value: 75.6, percent: 30 },
        { hour: 6, value: 95.8, percent: 38 },
        { hour: 7, value: 125.4, percent: 50 },
        { hour: 8, value: 145.6, percent: 58 },
        { hour: 9, value: 152.3, percent: 61 },
        { hour: 10, value: 158.7, percent: 63 },
        { hour: 11, value: 165.2, percent: 66 },
        { hour: 12, value: 168.5, percent: 67 },
        { hour: 13, value: 172.3, percent: 69 },
        { hour: 14, value: 178.6, percent: 71 },
        { hour: 15, value: 175.4, percent: 70 },
        { hour: 16, value: 168.2, percent: 67 },
        { hour: 17, value: 155.8, percent: 62 },
        { hour: 18, value: 142.5, percent: 57 },
        { hour: 19, value: 135.6, percent: 54 },
        { hour: 20, value: 128.4, percent: 51 },
        { hour: 21, value: 115.6, percent: 46 },
        { hour: 22, value: 98.5, percent: 39 },
        { hour: 23, value: 85.4, percent: 34 }
      ]
    })

    const deviceList = ref([
      { id: 'DEV001', name: '1号空调机组' },
      { id: 'DEV002', name: '2号空调机组' },
      { id: 'DEV003', name: '主变压器' },
      { id: 'DEV004', name: '照明配电柜' },
      { id: 'DEV005', name: '电梯系统' }
    ])

    const forecastForm = reactive({
      deviceId: '',
      model: 'lstm',
      period: '24h',
      historyDays: 90,
      remark: ''
    })

    const formRules = {
      deviceId: [{ required: true, message: '请选择设备', trigger: 'change' }],
      model: [{ required: true, message: '请选择预测模型', trigger: 'change' }],
      period: [{ required: true, message: '请选择预测周期', trigger: 'change' }],
      historyDays: [{ required: true, message: '请选择历史数据范围', trigger: 'change' }]
    }

    const forecastRecords = ref([
      { id: 'F20240115001', deviceName: '1号空调机组', model: 'lstm', forecastPeriod: '24h', predictedValue: 1256.78, accuracy: 0.95, createTime: '2024-01-15 08:00:00', status: 'completed' },
      { id: 'F20240114002', deviceName: '2号空调机组', model: 'prophet', forecastPeriod: '24h', predictedValue: 986.45, accuracy: 0.92, createTime: '2024-01-14 08:00:00', status: 'completed' },
      { id: 'F20240114003', deviceName: '主变压器', model: 'arima', forecastPeriod: '7d', predictedValue: 28564.12, accuracy: 0.89, createTime: '2024-01-14 00:00:00', status: 'completed' },
      { id: 'F20240113004', deviceName: '照明配电柜', model: 'xgboost', forecastPeriod: '24h', predictedValue: 456.78, accuracy: 0.94, createTime: '2024-01-13 08:00:00', status: 'completed' },
      { id: 'F20240113005', deviceName: '电梯系统', model: 'lstm', forecastPeriod: '7d', predictedValue: 1856.34, accuracy: 0.91, createTime: '2024-01-13 00:00:00', status: 'completed' }
    ])

    const initCharts = () => {
      if (forecastChartRef.value) {
        forecastChart = echarts.init(forecastChartRef.value)
        updateForecastChart()
      }
      if (comparisonChartRef.value) {
        comparisonChart = echarts.init(comparisonChartRef.value)
        updateComparisonChart()
      }
      if (errorDistChartRef.value) {
        errorDistChart = echarts.init(errorDistChartRef.value)
        updateErrorDistChart()
      }
      window.addEventListener('resize', handleResize)
    }

    const updateForecastChart = () => {
      if (!forecastChart) return
      const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`)
      const actualData = [85, 72, 68, 66, 68, 76, 96, 125, 145, 152, 158, 165, 168, 172, 178, 175, 168, 155, 142, 135, 128, 115, 98, 85]
      const forecastData = [88, 75, 70, 68, 70, 78, 98, 128, 148, 155, 160, 168, 170, 175, 180, 178, 170, 158, 145, 138, 130, 118, 100, 88]
      const upperBound = forecastData.map(v => v * 1.05)
      const lowerBound = forecastData.map(v => v * 0.95)

      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'cross' }
        },
        legend: {
          data: ['实际能耗', '预测能耗', '置信区间'],
          bottom: 10
        },
        grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: hours
        },
        yAxis: {
          type: 'value',
          name: 'kWh',
          axisLabel: { formatter: '{value}' }
        },
        series: [
          {
            name: '实际能耗',
            type: 'line',
            data: actualData,
            smooth: true,
            lineStyle: { width: 2, color: '#409EFF' },
            itemStyle: { color: '#409EFF' }
          },
          {
            name: '预测能耗',
            type: 'line',
            data: forecastData,
            smooth: true,
            lineStyle: { width: 2, color: '#67C23A' },
            itemStyle: { color: '#67C23A' },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(103, 194, 58, 0.3)' },
                { offset: 1, color: 'rgba(103, 194, 58, 0.05)' }
              ])
            }
          },
          {
            name: '置信区间',
            type: 'line',
            data: upperBound,
            lineStyle: { width: 0, opacity: 0 },
            stack: 'confidence',
            symbol: 'none'
          },
          {
            name: '置信区间',
            type: 'line',
            data: lowerBound,
            lineStyle: { width: 0, opacity: 0 },
            stack: 'confidence',
            symbol: 'none',
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(103, 194, 58, 0.1)' },
                { offset: 1, color: 'rgba(103, 194, 58, 0.02)' }
              ])
            }
          }
        ]
      }
      forecastChart.setOption(option)
    }

    const updateComparisonChart = () => {
      if (!comparisonChart) return
      const option = {
        tooltip: { trigger: 'axis' },
        legend: { data: ['实际值', '预测值'], bottom: 10 },
        grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
        xAxis: {
          type: 'category',
          data: ['01-09', '01-10', '01-11', '01-12', '01-13', '01-14', '01-15']
        },
        yAxis: { type: 'value', name: 'kWh' },
        series: [
          {
            name: '实际值',
            type: 'bar',
            data: [2350, 2420, 2380, 2510, 2456, 2490, 2456],
            itemStyle: { color: '#409EFF' }
          },
          {
            name: '预测值',
            type: 'line',
            data: [2320, 2450, 2400, 2480, 2500, 2520, 2480],
            smooth: true,
            lineStyle: { width: 2, color: '#67C23A' },
            itemStyle: { color: '#67C23A' }
          }
        ]
      }
      comparisonChart.setOption(option)
    }

    const updateErrorDistChart = () => {
      if (!errorDistChart) return
      const option = {
        tooltip: { trigger: 'item', formatter: '{b}: {c}次 ({d}%)' },
        legend: { bottom: 10 },
        series: [
          {
            name: '误差分布',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 2 },
            label: { show: false },
            emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold' } },
            data: [
              { value: 65, name: '±2%以内', itemStyle: { color: '#67C23A' } },
              { value: 25, name: '±2%~±5%', itemStyle: { color: '#E6A23C' } },
              { value: 8, name: '±5%~±10%', itemStyle: { color: '#F56C6C' } },
              { value: 2, name: '±10%以上', itemStyle: { color: '#909399' } }
            ]
          }
        ]
      }
      errorDistChart.setOption(option)
    }

    const handleResize = () => {
      forecastChart?.resize()
      comparisonChart?.resize()
      errorDistChart?.resize()
      detailChart?.resize()
    }

    const handleNewForecast = () => {
      forecastForm.deviceId = ''
      forecastForm.model = 'lstm'
      forecastForm.period = '24h'
      forecastForm.historyDays = 90
      forecastForm.remark = ''
      showForecastDialog.value = true
    }

    const handleSubmitForecast = async () => {
      submitLoading.value = true
      setTimeout(() => {
        submitLoading.value = false
        showForecastDialog.value = false
        forecastRecords.value.unshift({
          id: `F${new Date().getTime().toString().slice(-10)}`,
          deviceName: deviceList.value.find(d => d.id === forecastForm.deviceId)?.name || '未知设备',
          model: forecastForm.model,
          forecastPeriod: forecastForm.period === '24h' ? '24小时' : forecastForm.period === '7d' ? '7天' : '30天',
          predictedValue: Math.random() * 2000 + 500,
          accuracy: 0.85 + Math.random() * 0.1,
          createTime: new Date().toLocaleString(),
          status: 'completed'
        })
        totalRecords.value++
      }, 1500)
    }

    const handleTrainModel = () => {
      loading.value = true
      modelStatusType.value = 'warning'
      modelStatusText.value = '训练中...'
      setTimeout(() => {
        loading.value = false
        modelStatusType.value = 'success'
        modelStatusText.value = '已训练'
        forecastMetrics.value.accuracy = 0.92 + Math.random() * 0.05
      }, 3000)
    }

    const handleRetrain = () => {
      handleTrainModel()
    }

    const handleExport = () => {}

    const handleViewDetail = (record) => {
      currentRecord.value = record
      showDetailDialog.value = true
      nextTick(() => {
        if (detailChartRef.value) {
          detailChart = echarts.init(detailChartRef.value)
          const option = {
            tooltip: { trigger: 'axis' },
            xAxis: { type: 'category', data: Array.from({ length: 24 }, (_, i) => `${i}:00`) },
            yAxis: { type: 'value', name: 'kWh' },
            series: [{
              type: 'line',
              data: Array.from({ length: 24 }, () => Math.random() * 100 + 50),
              smooth: true,
              lineStyle: { color: '#409EFF' },
              itemStyle: { color: '#409EFF' }
            }]
          }
          detailChart.setOption(option)
        }
      })
    }

    const handleDeleteRecord = (record) => {
      const index = forecastRecords.value.findIndex(r => r.id === record.id)
      if (index > -1) {
        forecastRecords.value.splice(index, 1)
        totalRecords.value--
      }
    }

    const handleZoomReset = () => {
      updateForecastChart()
    }

    const handlePageSizeChange = () => {}
    const handlePageChange = () => {}

    const getModelName = (model) => {
      const names = { lstm: 'LSTM', prophet: 'Prophet', arima: 'ARIMA', xgboost: 'XGBoost' }
      return names[model] || model
    }

    const getAccuracyStatus = (accuracy) => {
      if (accuracy >= 0.95) return 'excellent'
      if (accuracy >= 0.9) return 'good'
      return 'warning'
    }

    const getAccuracyLabel = (accuracy) => {
      if (accuracy >= 0.95) return '优秀'
      if (accuracy >= 0.9) return '良好'
      return '一般'
    }

    const getAccuracyTagType = (accuracy) => {
      if (accuracy >= 0.95) return 'success'
      if (accuracy >= 0.9) return 'warning'
      return 'danger'
    }

    const getErrorClass = (error) => {
      if (error <= 2) return 'excellent'
      if (error <= 5) return 'good'
      return 'warning'
    }

    onMounted(() => {
      nextTick(() => {
        initCharts()
      })
    })

    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
      forecastChart?.dispose()
      comparisonChart?.dispose()
      errorDistChart?.dispose()
      detailChart?.dispose()
    })

    watch(chartView, () => {
      updateForecastChart()
    })

    watch(comparisonPeriod, () => {
      updateComparisonChart()
    })

    return {
      loading,
      submitLoading,
      showForecastDialog,
      showDetailDialog,
      chartView,
      comparisonPeriod,
      selectedDevice,
      selectedModel,
      searchKeyword,
      currentPage,
      pageSize,
      totalRecords,
      forecastMetrics,
      hasForecastData,
      modelStatusType,
      modelStatusText,
      forecastDetail,
      deviceList,
      forecastForm,
      formRules,
      forecastRecords,
      forecastChartRef,
      comparisonChartRef,
      errorDistChartRef,
      detailChartRef,
      currentRecord,
      handleNewForecast,
      handleSubmitForecast,
      handleTrainModel,
      handleRetrain,
      handleExport,
      handleViewDetail,
      handleDeleteRecord,
      handleZoomReset,
      handlePageSizeChange,
      handlePageChange,
      getModelName,
      getAccuracyStatus,
      getAccuracyLabel,
      getAccuracyTagType,
      getErrorClass
    }
  }
}
</script>

<style scoped>
.device-energy-forecast {
  padding: 0;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.toolbar-right {
  display: flex;
  align-items: center;
}

.stats-section {
  margin-bottom: 20px;
}

.metric-card {
  border-radius: 8px;
}

.metric-content {
  padding: 10px 0;
}

.metric-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.metric-label {
  font-size: 14px;
  color: #86909C;
}

.metric-header i {
  color: #C9CDD4;
  cursor: pointer;
}

.metric-value {
  font-size: 28px;
  font-weight: 700;
  color: #1D2129;
  line-height: 1.2;
}

.metric-unit {
  font-size: 14px;
  color: #86909C;
  margin-bottom: 8px;
}

.metric-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
}

.metric-trend.up {
  color: #F56C6C;
}

.metric-trend.down {
  color: #67C23A;
}

.metric-status {
  font-size: 13px;
  padding: 4px 0;
}

.metric-status.excellent {
  color: #67C23A;
}

.metric-status.good {
  color: #E6A23C;
}

.metric-status.warning {
  color: #F56C6C;
}

.metric-sub {
  font-size: 12px;
  color: #86909C;
}

.model-status {
  margin-bottom: 8px;
}

.model-info {
  font-size: 12px;
  color: #86909C;
  margin-bottom: 8px;
}

.model-actions {
  display: flex;
  justify-content: flex-end;
}

.chart-section,
.history-section {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.forecast-chart,
.comparison-chart,
.error-dist-chart {
  height: 350px;
}

.forecast-detail {
  max-height: 450px;
  overflow-y: auto;
}

.detail-section {
  margin-bottom: 20px;
}

.detail-section h4 {
  font-size: 14px;
  font-weight: 600;
  color: #1D2129;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #E6E6E6;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-item .label {
  font-size: 12px;
  color: #86909C;
}

.detail-item .value {
  font-size: 14px;
  color: #1D2129;
  font-weight: 500;
}

.detail-item .value.highlight {
  color: #409EFF;
  font-size: 16px;
}

.detail-item .value.excellent {
  color: #67C23A;
}

.detail-item .value.good {
  color: #E6A23C;
}

.detail-item .value.warning {
  color: #F56C6C;
}

.hourly-forecast {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.hourly-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.hour {
  width: 45px;
  font-size: 12px;
  color: #86909C;
}

.hourly-bar {
  flex: 1;
  height: 16px;
  background: #F5F7FA;
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #409EFF 0%, #67C23A 100%);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.hourly-value {
  width: 80px;
  font-size: 12px;
  color: #1D2129;
  text-align: right;
}

.records-section .pagination-section {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.detail-dialog-content {
  padding: 10px 0;
}

.detail-chart {
  margin-top: 20px;
}

.detail-forecast-chart {
  height: 300px;
}
</style>
