<template>
  <div class="device-early-warning">
    <div class="toolbar">
      <el-button type="danger" @click="handleAcknowledgeAll">
        <i class="fa fa-check-square"></i> 一键已读
      </el-button>
      <el-button type="warning" @click="handleExport">
        <i class="fa fa-download"></i> 导出报告
      </el-button>
      <el-button type="info" @click="handleSettings">
        <i class="fa fa-cog"></i> 预警设置
      </el-button>
      <div class="toolbar-right">
        <el-select v-model="warningLevel" placeholder="预警级别" clearable style="width: 120px;">
          <el-option label="全部" value="" />
          <el-option label="严重" value="critical" />
          <el-option label="警告" value="warning" />
          <el-option label="提示" value="info" />
        </el-select>
        <el-select v-model="warningStatus" placeholder="状态" clearable style="width: 120px; margin-left: 10px;">
          <el-option label="全部" value="" />
          <el-option label="未处理" value="pending" />
          <el-option label="处理中" value="processing" />
          <el-option label="已处理" value="processed" />
        </el-select>
        <el-input
          v-model="searchKeyword"
          placeholder="搜索设备/位置..."
          prefix-icon="el-icon-search"
          clearable
          style="width: 200px; margin-left: 10px;"
        />
      </div>
    </div>

    <div class="stats-section">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card critical">
            <div class="stat-content">
              <div class="stat-icon">
                <i class="fa fa-exclamation-triangle"></i>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.criticalCount }}</div>
                <div class="stat-label">严重预警</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card warning">
            <div class="stat-content">
              <div class="stat-icon">
                <i class="fa fa-exclamation-circle"></i>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.warningCount }}</div>
                <div class="stat-label">警告预警</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card info">
            <div class="stat-content">
              <div class="stat-icon">
                <i class="fa fa-info-circle"></i>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.infoCount }}</div>
                <div class="stat-label">提示预警</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card pending">
            <div class="stat-content">
              <div class="stat-icon">
                <i class="fa fa-clock-o"></i>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.pendingCount }}</div>
                <div class="stat-label">待处理</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <div class="main-content">
      <el-row :gutter="20">
        <el-col :span="14">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>实时预警列表</span>
                <div class="header-actions">
                  <el-radio-group v-model="viewMode" size="small">
                    <el-radio-button label="list">
                      <i class="fa fa-list"></i>
                    </el-radio-button>
                    <el-radio-button label="card">
                      <i class="fa fa-th-large"></i>
                    </el-radio-button>
                  </el-radio-group>
                </div>
              </div>
            </template>

            <div v-if="viewMode === 'list'" class="warning-list" v-loading="loading">
              <el-table :data="filteredWarnings" stripe row-key="id" @row-click="handleRowClick">
                <el-table-column prop="level" label="级别" width="80" align="center">
                  <template #default="scope">
                    <el-tag :type="getLevelType(scope.row.level)" size="small" effect="dark">
                      {{ getLevelName(scope.row.level) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="deviceName" label="设备名称" min-width="150" />
                <el-table-column prop="location" label="位置" width="180" />
                <el-table-column prop="warningType" label="预警类型" width="120" />
                <el-table-column prop="description" label="预警内容" min-width="200" show-overflow-tooltip />
                <el-table-column prop="value" label="当前值" width="100" align="right">
                  <template #default="scope">
                    <span :class="getValueClass(scope.row)">
                      {{ scope.row.value.toFixed(2) }} {{ scope.row.unit }}
                    </span>
                  </template>
                </el-table-column>
                <el-table-column prop="threshold" label="阈值" width="100" align="right">
                  <template #default="scope">
                    {{ scope.row.threshold }} {{ scope.row.unit }}
                  </template>
                </el-table-column>
                <el-table-column prop="createTime" label="发生时间" width="160">
                  <template #default="scope">
                    {{ formatTime(scope.row.createTime) }}
                  </template>
                </el-table-column>
                <el-table-column prop="status" label="状态" width="100" align="center">
                  <template #default="scope">
                    <el-tag :type="getStatusType(scope.row.status)" size="small">
                      {{ getStatusName(scope.row.status) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="150" align="center" fixed="right">
                  <template #default="scope">
                    <el-button v-if="scope.row.status === 'pending'" type="primary" size="mini" text @click.stop="handleProcess(scope.row)">
                      <i class="fa fa-play"></i> 处理
                    </el-button>
                    <el-button type="success" size="mini" text @click.stop="handleAcknowledge(scope.row)">
                      <i class="fa fa-check"></i> 已读
                    </el-button>
                    <el-button type="info" size="mini" text @click.stop="handleViewDetail(scope.row)">
                      <i class="fa fa-eye"></i> 详情
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
              <div class="pagination-section">
                <el-pagination
                  v-model:current-page="currentPage"
                  v-model:page-size="pageSize"
                  :page-sizes="[10, 20, 50, 100]"
                  :total="totalWarnings"
                  layout="total, sizes, prev, pager, next, jumper"
                  @size-change="handlePageSizeChange"
                  @current-change="handlePageChange"
                />
              </div>
            </div>

            <div v-else class="warning-cards" v-loading="loading">
              <el-row :gutter="16">
                <el-col :span="8" v-for="warning in filteredWarnings" :key="warning.id">
                  <div class="warning-card" :class="warning.level" @click="handleViewDetail(warning)">
                    <div class="card-header">
                      <el-tag :type="getLevelType(warning.level)" size="small" effect="dark">
                        {{ getLevelName(warning.level) }}
                      </el-tag>
                      <span class="card-time">{{ formatTime(warning.createTime) }}</span>
                    </div>
                    <div class="card-body">
                      <h4>{{ warning.deviceName }}</h4>
                      <p class="location"><i class="fa fa-map-marker"></i> {{ warning.location }}</p>
                      <p class="warning-type"><i class="fa fa-bell"></i> {{ warning.warningType }}</p>
                      <p class="description">{{ warning.description }}</p>
                      <div class="value-info">
                        <span class="current-value">
                          当前: <b>{{ warning.value.toFixed(2) }}</b> {{ warning.unit }}
                        </span>
                        <span class="threshold">
                          阈值: {{ warning.threshold }} {{ warning.unit }}
                        </span>
                      </div>
                    </div>
                    <div class="card-footer">
                      <el-tag :type="getStatusType(warning.status)" size="small">
                        {{ getStatusName(warning.status) }}
                      </el-tag>
                      <div class="card-actions">
                        <el-button v-if="warning.status === 'pending'" size="mini" type="primary" text @click.stop="handleProcess(warning)">
                          处理
                        </el-button>
                        <el-button size="mini" text @click.stop="handleAcknowledge(warning)">
                          已读
                        </el-button>
                      </div>
                    </div>
                  </div>
                </el-col>
              </el-row>
            </div>
          </el-card>
        </el-col>

        <el-col :span="10">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>预警趋势分析</span>
                <div class="header-actions">
                  <el-radio-group v-model="trendPeriod" size="small">
                    <el-radio-button label="day">日</el-radio-button>
                    <el-radio-button label="week">周</el-radio-button>
                    <el-radio-button label="month">月</el-radio-button>
                  </el-radio-group>
                </div>
              </div>
            </template>
            <div ref="trendChartRef" class="trend-chart"></div>
          </el-card>

          <el-card shadow="hover" class="device-status-card">
            <template #header>
              <div class="card-header">
                <span>设备健康状态</span>
              </div>
            </template>
            <div ref="healthChartRef" class="health-chart"></div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <div class="rules-section">
      <el-card shadow="hover">
        <template #header>
          <div class="card-header">
            <span>预警规则配置</span>
            <el-button type="primary" size="small" @click="handleAddRule">
              <i class="fa fa-plus"></i> 新增规则
            </el-button>
          </div>
        </template>
        <el-table :data="warningRules" stripe v-loading="loading">
          <el-table-column prop="ruleName" label="规则名称" min-width="150" />
          <el-table-column prop="deviceType" label="设备类型" width="120" align="center" />
          <el-table-column prop="metric" label="监控指标" width="120" />
          <el-table-column prop="condition" label="预警条件" width="200">
            <template #default="scope">
              {{ scope.row.metric }} {{ scope.row.operator }} {{ scope.row.threshold }} {{ scope.row.unit }}
            </template>
          </el-table-column>
          <el-table-column prop="level" label="预警级别" width="100" align="center">
            <template #default="scope">
              <el-tag :type="getLevelType(scope.row.level)" size="small">
                {{ getLevelName(scope.row.level) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="enabled" label="状态" width="100" align="center">
            <template #default="scope">
              <el-switch v-model="scope.row.enabled" @change="handleRuleStatusChange(scope.row)" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" align="center">
            <template #default="scope">
              <el-button type="primary" size="mini" text @click="handleEditRule(scope.row)">
                <i class="fa fa-edit"></i> 编辑
              </el-button>
              <el-button type="danger" size="mini" text @click="handleDeleteRule(scope.row)">
                <i class="fa fa-trash"></i> 删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <el-dialog v-model="showDetailDialog" title="预警详情" width="600px" center>
      <div class="detail-content" v-if="currentWarning">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="预警编号">{{ currentWarning.id }}</el-descriptions-item>
          <el-descriptions-item label="预警级别">
            <el-tag :type="getLevelType(currentWarning.level)" effect="dark">
              {{ getLevelName(currentWarning.level) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="设备名称">{{ currentWarning.deviceName }}</el-descriptions-item>
          <el-descriptions-item label="设备编号">{{ currentWarning.deviceId }}</el-descriptions-item>
          <el-descriptions-item label="位置">{{ currentWarning.location }}</el-descriptions-item>
          <el-descriptions-item label="预警类型">{{ currentWarning.warningType }}</el-descriptions-item>
          <el-descriptions-item label="当前值" :span="2">
            <span :class="getValueClass(currentWarning)">
              {{ currentWarning.value.toFixed(2) }} {{ currentWarning.unit }}
            </span>
            <span class="threshold-info"> (阈值: {{ currentWarning.threshold }} {{ currentWarning.unit }})</span>
          </el-descriptions-item>
          <el-descriptions-item label="预警内容" :span="2">{{ currentWarning.description }}</el-descriptions-item>
          <el-descriptions-item label="发生时间">{{ formatTime(currentWarning.createTime) }}</el-descriptions-item>
          <el-descriptions-item label="持续时间">{{ getDuration(currentWarning.createTime) }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(currentWarning.status)">
              {{ getStatusName(currentWarning.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="处理人" v-if="currentWarning.handler">
            {{ currentWarning.handler }}
          </el-descriptions-item>
          <el-descriptions-item label="处理时间" v-if="currentWarning.processTime">
            {{ currentWarning.processTime }}
          </el-descriptions-item>
        </el-descriptions>

        <div class="history-chart">
          <h4>历史趋势</h4>
          <div ref="historyChartRef" class="history-trend-chart"></div>
        </div>

        <div class="process-section" v-if="currentWarning.status === 'pending'">
          <h4>处理操作</h4>
          <el-form :model="processForm" label-width="80px">
            <el-form-item label="处理方式">
              <el-select v-model="processForm.method" placeholder="选择处理方式" style="width: 100%;">
                <el-option label="现场检查" value="inspection" />
                <el-option label="远程复位" value="reset" />
                <el-option label="自动修复" value="auto_fix" />
                <el-option label="通知维护" value="maintenance" />
              </el-select>
            </el-form-item>
            <el-form-item label="备注">
              <el-input v-model="processForm.remark" type="textarea" :rows="3" placeholder="请输入处理备注" />
            </el-form-item>
          </el-form>
        </div>
      </div>
      <template #footer>
        <el-button @click="showDetailDialog = false">关闭</el-button>
        <el-button v-if="currentWarning?.status === 'pending'" type="primary" @click="handleSubmitProcess">
          提交处理
        </el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showSettingsDialog" title="预警设置" width="700px" center>
      <el-form :model="settingsForm" label-width="120px">
        <el-divider content-position="left">通知设置</el-divider>
        <el-form-item label="邮件通知">
          <el-switch v-model="settingsForm.emailEnabled" />
          <span class="form-tip">开启后预警将通过邮件发送通知</span>
        </el-form-item>
        <el-form-item label="短信通知">
          <el-switch v-model="settingsForm.smsEnabled" />
          <span class="form-tip">开启后预警将通过短信发送通知</span>
        </el-form-item>
        <el-form-item label="App推送">
          <el-switch v-model="settingsForm.appEnabled" />
          <span class="form-tip">开启后预警将通过App推送通知</span>
        </el-form-item>
        <el-form-item label="告警音">
          <el-switch v-model="settingsForm.soundEnabled" />
          <span class="form-tip">开启后预警将播放提示音</span>
        </el-form-item>
        <el-divider content-position="left">高级设置</el-divider>
        <el-form-item label="预警间隔">
          <el-select v-model="settingsForm.interval" style="width: 200px;">
            <el-option label="5分钟" :value="5" />
            <el-option label="10分钟" :value="10" />
            <el-option label="15分钟" :value="15" />
            <el-option label="30分钟" :value="30" />
          </el-select>
        </el-form-item>
        <el-form-item label="自动恢复">
          <el-switch v-model="settingsForm.autoRecover" />
          <span class="form-tip">设备恢复正常后自动标记为已处理</span>
        </el-form-item>
        <el-form-item label="数据保留天数">
          <el-input-number v-model="settingsForm.retentionDays" :min="7" :max="365" />
          <span class="form-tip">预警记录保留天数</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showSettingsDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSaveSettings">保存设置</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showRuleDialog" :title="isEditRule ? '编辑规则' : '新增规则'" width="500px" center>
      <el-form :model="ruleForm" :rules="ruleFormRules" ref="ruleFormRef" label-width="100px">
        <el-form-item label="规则名称" prop="ruleName">
          <el-input v-model="ruleForm.ruleName" placeholder="请输入规则名称" />
        </el-form-item>
        <el-form-item label="设备类型" prop="deviceType">
          <el-select v-model="ruleForm.deviceType" placeholder="选择设备类型" style="width: 100%;">
            <el-option label="空调机组" value="ac" />
            <el-option label="变压器" value="transformer" />
            <el-option label="照明设备" value="lighting" />
            <el-option label="电梯" value="elevator" />
            <el-option label="给排水" value="water" />
          </el-select>
        </el-form-item>
        <el-form-item label="监控指标" prop="metric">
          <el-input v-model="ruleForm.metric" placeholder="如：温度、电流、电压" />
        </el-form-item>
        <el-form-item label="预警条件" required>
          <el-col :span="7">
            <el-form-item prop="operator">
              <el-select v-model="ruleForm.operator" placeholder="比较符">
                <el-option label="大于" value=">" />
                <el-option label="小于" value="<" />
                <el-option label="等于" value="=" />
                <el-option label="区间" value="between" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="10" style="margin-left: 10px;">
            <el-form-item prop="threshold">
              <el-input-number v-model="ruleForm.threshold" :precision="2" :step="0.1" />
            </el-form-item>
          </el-col>
          <el-col :span="5" style="margin-left: 10px;">
            <el-form-item prop="unit">
              <el-input v-model="ruleForm.unit" placeholder="单位" />
            </el-form-item>
          </el-col>
        </el-form-item>
        <el-form-item label="预警级别" prop="level">
          <el-select v-model="ruleForm.level" placeholder="选择预警级别" style="width: 100%;">
            <el-option label="严重" value="critical" />
            <el-option label="警告" value="warning" />
            <el-option label="提示" value="info" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showRuleDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitRule">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'

export default {
  name: 'DeviceEarlyWarning',
  setup() {
    const loading = ref(false)
    const showDetailDialog = ref(false)
    const showSettingsDialog = ref(false)
    const showRuleDialog = ref(false)
    const isEditRule = ref(false)
    const viewMode = ref('list')
    const trendPeriod = ref('day')
    const warningLevel = ref('')
    const warningStatus = ref('')
    const searchKeyword = ref('')
    const currentPage = ref(1)
    const pageSize = ref(10)
    const totalWarnings = ref(0)
    const currentWarning = ref(null)

    const trendChartRef = ref(null)
    const healthChartRef = ref(null)
    const historyChartRef = ref(null)

    let trendChart = null
    let healthChart = null
    let historyChart = null

    const stats = ref({
      criticalCount: 3,
      warningCount: 8,
      infoCount: 15,
      pendingCount: 12
    })

    const warnings = ref([
      { id: 'W001', deviceId: 'DEV001', deviceName: '1号空调机组', location: '候车大厅一层A区', warningType: '温度过高', description: '回风温度超过设定阈值', value: 28.5, threshold: 26, unit: '°C', level: 'critical', status: 'pending', createTime: new Date(Date.now() - 1000 * 60 * 30) },
      { id: 'W002', deviceId: 'DEV003', deviceName: '主变压器', location: '配电室一层', warningType: '负载过高', description: '变压器负载率超过80%', value: 85.6, threshold: 80, unit: '%', level: 'critical', status: 'processing', createTime: new Date(Date.now() - 1000 * 60 * 45), handler: '张工' },
      { id: 'W003', deviceId: 'DEV005', deviceName: '3号电梯', location: '候车大厅二层B区', warningType: '运行异常', description: '电梯运行抖动异常', value: 2.5, threshold: 2, unit: 'mm/s', level: 'warning', status: 'pending', createTime: new Date(Date.now() - 1000 * 60 * 60) },
      { id: 'W004', deviceId: 'DEV002', deviceName: '2号空调机组', location: '候车大厅一层B区', warningType: '能耗异常', description: '单位制冷量能耗偏高', value: 1.45, threshold: 1.3, unit: 'kWh/㎡', level: 'warning', status: 'pending', createTime: new Date(Date.now() - 1000 * 60 * 90) },
      { id: 'W005', deviceId: 'DEV006', deviceName: '冷却水泵', location: '制冷机房', warningType: '压力异常', description: '冷却水泵出口压力偏低', value: 0.35, threshold: 0.4, unit: 'MPa', level: 'warning', status: 'processed', createTime: new Date(Date.now() - 1000 * 60 * 120), handler: '李工', processTime: new Date(Date.now() - 1000 * 60 * 30).toLocaleString() },
      { id: 'W006', deviceId: 'DEV004', deviceName: '照明配电柜', location: '候车大厅一层', warningType: '电压波动', description: '电压波动超过正常范围', value: 238, threshold: 235, unit: 'V', level: 'info', status: 'pending', createTime: new Date(Date.now() - 1000 * 60 * 180) },
      { id: 'W007', deviceId: 'DEV008', deviceName: '排风机组', location: '地下停车场', warningType: 'CO浓度偏高', description: '停车场CO浓度略高', value: 15, threshold: 20, unit: 'ppm', level: 'info', status: 'pending', createTime: new Date(Date.now() - 1000 * 60 * 200) }
    ])

    const warningRules = ref([
      { id: 'R001', ruleName: '空调温度过高预警', deviceType: 'ac', metric: '回风温度', operator: '>', threshold: 26, unit: '°C', level: 'critical', enabled: true },
      { id: 'R002', ruleName: '变压器负载预警', deviceType: 'transformer', metric: '负载率', operator: '>', threshold: 80, unit: '%', level: 'critical', enabled: true },
      { id: 'R003', ruleName: '电梯振动预警', deviceType: 'elevator', metric: '振动值', operator: '>', threshold: 2, unit: 'mm/s', level: 'warning', enabled: true },
      { id: 'R004', ruleName: '空调能耗异常预警', deviceType: 'ac', metric: '单位能耗', operator: '>', threshold: 1.3, unit: 'kWh/㎡', level: 'warning', enabled: true },
      { id: 'R005', ruleName: '电压波动预警', deviceType: 'lighting', metric: '电压', operator: '>', threshold: 235, unit: 'V', level: 'info', enabled: true }
    ])

    const settingsForm = reactive({
      emailEnabled: true,
      smsEnabled: true,
      appEnabled: true,
      soundEnabled: false,
      interval: 10,
      autoRecover: false,
      retentionDays: 30
    })

    const ruleForm = reactive({
      ruleName: '',
      deviceType: '',
      metric: '',
      operator: '>',
      threshold: 0,
      unit: '',
      level: 'warning'
    })

    const ruleFormRules = {
      ruleName: [{ required: true, message: '请输入规则名称', trigger: 'blur' }],
      deviceType: [{ required: true, message: '请选择设备类型', trigger: 'change' }],
      metric: [{ required: true, message: '请输入监控指标', trigger: 'blur' }],
      threshold: [{ required: true, message: '请输入阈值', trigger: 'blur' }],
      level: [{ required: true, message: '请选择预警级别', trigger: 'change' }]
    }

    const processForm = reactive({
      method: '',
      remark: ''
    })

    const filteredWarnings = computed(() => {
      return warnings.value.filter(w => {
        const matchLevel = !warningLevel.value || w.level === warningLevel.value
        const matchStatus = !warningStatus.value || w.status === warningStatus.value
        const matchKeyword = !searchKeyword.value || 
          w.deviceName.includes(searchKeyword.value) || 
          w.location.includes(searchKeyword.value)
        return matchLevel && matchStatus && matchKeyword
      })
    })

    const initCharts = () => {
      if (trendChartRef.value) {
        trendChart = echarts.init(trendChartRef.value)
        updateTrendChart()
      }
      if (healthChartRef.value) {
        healthChart = echarts.init(healthChartRef.value)
        updateHealthChart()
      }
      window.addEventListener('resize', handleResize)
    }

    const updateTrendChart = () => {
      if (!trendChart) return
      const option = {
        tooltip: { trigger: 'axis' },
        legend: { data: ['严重', '警告', '提示'], bottom: 0 },
        grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
        xAxis: {
          type: 'category',
          data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00']
        },
        yAxis: { type: 'value' },
        series: [
          { name: '严重', type: 'bar', data: [1, 0, 2, 1, 3, 2, 1], itemStyle: { color: '#F56C6C' } },
          { name: '警告', type: 'bar', data: [3, 2, 5, 4, 6, 5, 3], itemStyle: { color: '#E6A23C' } },
          { name: '提示', type: 'bar', data: [5, 4, 8, 6, 10, 7, 5], itemStyle: { color: '#409EFF' } }
        ]
      }
      trendChart.setOption(option)
    }

    const updateHealthChart = () => {
      if (!healthChart) return
      const option = {
        tooltip: { trigger: 'item', formatter: '{b}: {c}台' },
        series: [
          {
            name: '设备健康状态',
            type: 'pie',
            radius: ['45%', '70%'],
            data: [
              { value: 45, name: '健康', itemStyle: { color: '#67C23A' } },
              { value: 8, name: '警告', itemStyle: { color: '#E6A23C' } },
              { value: 2, name: '故障', itemStyle: { color: '#F56C6C' } }
            ],
            label: { formatter: '{b}\n{d}%' }
          }
        ]
      }
      healthChart.setOption(option)
    }

    const handleResize = () => {
      trendChart?.resize()
      healthChart?.resize()
      historyChart?.resize()
    }

    const getLevelType = (level) => {
      const types = { critical: 'danger', warning: 'warning', info: 'info' }
      return types[level] || 'info'
    }

    const getLevelName = (level) => {
      const names = { critical: '严重', warning: '警告', info: '提示' }
      return names[level] || level
    }

    const getStatusType = (status) => {
      const types = { pending: 'info', processing: 'warning', processed: 'success' }
      return types[status] || 'info'
    }

    const getStatusName = (status) => {
      const names = { pending: '待处理', processing: '处理中', processed: '已处理' }
      return names[status] || status
    }

    const getValueClass = (warning) => {
      if (warning.operator === '>') {
        return warning.value > warning.threshold ? 'value-warning' : 'value-normal'
      }
      return warning.value < warning.threshold ? 'value-warning' : 'value-normal'
    }

    const formatTime = (time) => {
      return new Date(time).toLocaleString()
    }

    const getDuration = (createTime) => {
      const diff = Date.now() - new Date(createTime).getTime()
      const minutes = Math.floor(diff / 60000)
      if (minutes < 60) return `${minutes}分钟`
      const hours = Math.floor(minutes / 60)
      if (hours < 24) return `${hours}小时`
      return `${Math.floor(hours / 24)}天${hours % 24}小时`
    }

    const handleRowClick = (row) => {
      handleViewDetail(row)
    }

    const handleProcess = (warning) => {
      currentWarning.value = warning
      processForm.method = ''
      processForm.remark = ''
      showDetailDialog.value = true
      nextTick(() => {
        if (historyChartRef.value) {
          historyChart = echarts.init(historyChartRef.value)
          historyChart.setOption({
            tooltip: { trigger: 'axis' },
            xAxis: { type: 'category', data: ['10min前', '5min前', '当前'] },
            yAxis: { type: 'value' },
            series: [{
              type: 'line',
              data: [warning.value * 0.9, warning.value * 0.95, warning.value],
              smooth: true,
              lineStyle: { color: '#F56C6C' },
              itemStyle: { color: '#F56C6C' }
            }]
          })
        }
      })
    }

    const handleSubmitProcess = () => {
      const warning = warnings.value.find(w => w.id === currentWarning.value.id)
      if (warning) {
        warning.status = 'processing'
        warning.handler = '当前用户'
        warning.processTime = new Date().toLocaleString()
      }
      showDetailDialog.value = false
      updateStats()
    }

    const handleAcknowledge = (warning) => {
      warning.status = 'processed'
      updateStats()
    }

    const handleAcknowledgeAll = () => {
      warnings.value.forEach(w => {
        if (w.status === 'pending') w.status = 'processed'
      })
      updateStats()
    }

    const handleViewDetail = (warning) => {
      currentWarning.value = warning
      showDetailDialog.value = true
      nextTick(() => {
        if (historyChartRef.value) {
          historyChart = echarts.init(historyChartRef.value)
          historyChart.setOption({
            tooltip: { trigger: 'axis' },
            xAxis: { type: 'category', data: ['10min前', '5min前', '当前'] },
            yAxis: { type: 'value' },
            series: [{
              type: 'line',
              data: [warning.value * 0.9, warning.value * 0.95, warning.value],
              smooth: true,
              lineStyle: { color: '#409EFF' },
              itemStyle: { color: '#409EFF' }
            }]
          })
        }
      })
    }

    const handleExport = () => {}

    const handleSettings = () => {
      showSettingsDialog.value = true
    }

    const handleSaveSettings = () => {
      showSettingsDialog.value = false
    }

    const handleAddRule = () => {
      isEditRule.value = false
      ruleForm.ruleName = ''
      ruleForm.deviceType = ''
      ruleForm.metric = ''
      ruleForm.operator = '>'
      ruleForm.threshold = 0
      ruleForm.unit = ''
      ruleForm.level = 'warning'
      showRuleDialog.value = true
    }

    const handleEditRule = (rule) => {
      isEditRule.value = true
      Object.assign(ruleForm, rule)
      showRuleDialog.value = true
    }

    const handleDeleteRule = (rule) => {
      const index = warningRules.value.findIndex(r => r.id === rule.id)
      if (index > -1) warningRules.value.splice(index, 1)
    }

    const handleRuleStatusChange = (rule) => {}

    const handleSubmitRule = () => {
      if (isEditRule.value) {
        const rule = warningRules.value.find(r => r.id === ruleForm.id)
        if (rule) Object.assign(rule, ruleForm)
      } else {
        warningRules.value.push({
          id: `R${Date.now()}`,
          ...ruleForm,
          enabled: true
        })
      }
      showRuleDialog.value = false
    }

    const handlePageSizeChange = () => {}
    const handlePageChange = () => {}

    const updateStats = () => {
      stats.value.criticalCount = warnings.value.filter(w => w.level === 'critical' && w.status !== 'processed').length
      stats.value.warningCount = warnings.value.filter(w => w.level === 'warning' && w.status !== 'processed').length
      stats.value.infoCount = warnings.value.filter(w => w.level === 'info' && w.status !== 'processed').length
      stats.value.pendingCount = warnings.value.filter(w => w.status === 'pending').length
    }

    onMounted(() => {
      totalWarnings.value = warnings.value.length
      nextTick(() => {
        initCharts()
      })
    })

    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
      trendChart?.dispose()
      healthChart?.dispose()
      historyChart?.dispose()
    })

    watch(trendPeriod, () => {
      updateTrendChart()
    })

    return {
      loading,
      showDetailDialog,
      showSettingsDialog,
      showRuleDialog,
      isEditRule,
      viewMode,
      trendPeriod,
      warningLevel,
      warningStatus,
      searchKeyword,
      currentPage,
      pageSize,
      totalWarnings,
      currentWarning,
      stats,
      filteredWarnings,
      warningRules,
      settingsForm,
      ruleForm,
      ruleFormRules,
      processForm,
      trendChartRef,
      healthChartRef,
      historyChartRef,
      handleProcess,
      handleSubmitProcess,
      handleAcknowledge,
      handleAcknowledgeAll,
      handleViewDetail,
      handleExport,
      handleSettings,
      handleSaveSettings,
      handleAddRule,
      handleEditRule,
      handleDeleteRule,
      handleRuleStatusChange,
      handleSubmitRule,
      handlePageSizeChange,
      handlePageChange,
      getLevelType,
      getLevelName,
      getStatusType,
      getStatusName,
      getValueClass,
      formatTime,
      getDuration
    }
  }
}
</script>

<style scoped>
.device-early-warning {
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

.stat-card {
  border-radius: 8px;
}

.stat-card.critical {
  border-left: 4px solid #F56C6C;
}

.stat-card.warning {
  border-left: 4px solid #E6A23C;
}

.stat-card.info {
  border-left: 4px solid #409EFF;
}

.stat-card.pending {
  border-left: 4px solid #909399;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #fff;
}

.stat-card.critical .stat-icon {
  background: linear-gradient(135deg, #F56C6C 0%, #f89898 100%);
}

.stat-card.warning .stat-icon {
  background: linear-gradient(135deg, #E6A23C 0%, #f0c78a 100%);
}

.stat-card.info .stat-icon {
  background: linear-gradient(135deg, #409EFF 0%, #79bbff 100%);
}

.stat-card.pending .stat-icon {
  background: linear-gradient(135deg, #909399 0%, #b4b4b8 100%);
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1D2129;
}

.stat-label {
  font-size: 14px;
  color: #86909C;
}

.main-content {
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

.warning-list .pagination-section {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.value-warning {
  color: #F56C6C;
  font-weight: 600;
}

.value-normal {
  color: #67C23A;
}

.warning-cards {
  max-height: 500px;
  overflow-y: auto;
}

.warning-card {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 4px solid transparent;
}

.warning-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.warning-card.critical {
  border-left-color: #F56C6C;
  background: linear-gradient(135deg, #fff 0%, #fef0f0 100%);
}

.warning-card.warning {
  border-left-color: #E6A23C;
  background: linear-gradient(135deg, #fff 0%, #fdf6ec 100%);
}

.warning-card.info {
  border-left-color: #409EFF;
  background: linear-gradient(135deg, #fff 0%, #ecf5ff 100%);
}

.warning-card .card-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.card-time {
  font-size: 12px;
  color: #86909C;
}

.warning-card .card-body h4 {
  font-size: 16px;
  font-weight: 600;
  color: #1D2129;
  margin-bottom: 8px;
}

.warning-card .location,
.warning-card .warning-type {
  font-size: 13px;
  color: #86909C;
  margin-bottom: 4px;
}

.warning-card .location i,
.warning-card .warning-type i {
  margin-right: 6px;
}

.warning-card .description {
  font-size: 13px;
  color: #4E5969;
  margin: 8px 0;
  line-height: 1.5;
}

.value-info {
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #E6E6E6;
}

.current-value {
  font-size: 14px;
  color: #F56C6C;
}

.current-value b {
  font-size: 18px;
}

.threshold {
  font-size: 12px;
  color: #86909C;
}

.warning-card .card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #E6E6E6;
}

.card-actions {
  display: flex;
  gap: 8px;
}

.trend-chart,
.health-chart {
  height: 280px;
}

.rules-section {
  margin-bottom: 20px;
}

.detail-content {
  padding: 10px 0;
}

.threshold-info {
  font-size: 12px;
  color: #86909C;
  margin-left: 8px;
}

.history-chart {
  margin-top: 20px;
}

.history-chart h4 {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
}

.history-trend-chart {
  height: 200px;
}

.process-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #E6E6E6;
}

.process-section h4 {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
}

.form-tip {
  font-size: 12px;
  color: #86909C;
  margin-left: 12px;
}

.device-status-card {
  margin-top: 20px;
}
</style>
