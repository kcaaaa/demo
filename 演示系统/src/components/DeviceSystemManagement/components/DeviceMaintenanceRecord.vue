<template>
  <div class="device-maintenance-record">
    <div class="toolbar">
      <el-button type="primary" @click="handleAddRecord">
        <i class="fa fa-plus"></i> 新增记录
      </el-button>
      <el-button type="warning" @click="handleBatchScheduling">
        <i class="fa fa-calendar"></i> 批量排程
      </el-button>
      <el-button type="info" @click="handleExport">
        <i class="fa fa-download"></i> 导出
      </el-button>
      <div class="toolbar-right">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索设备/单号..."
          prefix-icon="el-icon-search"
          clearable
          style="width: 250px;"
          @keyup.enter="handleSearch"
        />
        <el-select v-model="filterStatus" placeholder="状态筛选" clearable style="width: 140px; margin-left: 10px;">
          <el-option label="待处理" value="pending" />
          <el-option label="进行中" value="in_progress" />
          <el-option label="已完成" value="completed" />
          <el-option label="已取消" value="cancelled" />
        </el-select>
        <el-select v-model="filterType" placeholder="类型筛选" clearable style="width: 140px; margin-left: 10px;">
          <el-option label="例行保养" value="routine" />
          <el-option label="故障维修" value="repair" />
          <el-option label="紧急抢修" value="emergency" />
          <el-option label="预防性维护" value="preventive" />
        </el-select>
      </div>
    </div>

    <div class="stats-cards">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-content">
              <div class="stat-icon" style="background: linear-gradient(135deg, #409EFF 0%, #66b1ff 100%);">
                <i class="fa fa-clipboard"></i>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.totalRecords }}</div>
                <div class="stat-label">总维护记录</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-content">
              <div class="stat-icon" style="background: linear-gradient(135deg, #faad14 0%, #ffc53d 100%);">
                <i class="fa fa-clock-o"></i>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.pendingCount }}</div>
                <div class="stat-label">待处理</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-content">
              <div class="stat-icon" style="background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);">
                <i class="fa fa-check-circle"></i>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.completedThisMonth }}</div>
                <div class="stat-label">本月完成</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-content">
              <div class="stat-icon" style="background: linear-gradient(135deg, #f56c6c 0%, #f89898 100%);">
                <i class="fa fa-exclamation-triangle"></i>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.avgResponseTime }}h</div>
                <div class="stat-label">平均响应时间</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <div class="table-section">
      <el-card shadow="hover">
        <template #header>
          <div class="card-header">
            <span>维护记录列表</span>
            <div class="header-actions">
              <el-radio-group v-model="viewMode" size="small">
                <el-radio-button label="table">
                  <i class="fa fa-list"></i>
                </el-radio-button>
                <el-radio-button label="timeline">
                  <i class="fa fa-clock-o"></i>
                </el-radio-button>
              </el-radio-group>
            </div>
          </div>
        </template>

        <el-table
          v-if="viewMode === 'table'"
          :data="maintenanceRecords"
          stripe
          v-loading="loading"
          row-key="id"
          @row-click="handleRowClick"
        >
          <el-table-column prop="recordNo" label="维护单号" width="150" />
          <el-table-column prop="deviceName" label="设备名称" min-width="180" />
          <el-table-column prop="deviceId" label="设备编号" width="130" />
          <el-table-column prop="maintenanceType" label="维护类型" width="120" align="center">
            <template #default="scope">
              <el-tag :type="getTypeTag(scope.row.maintenanceType)" size="small">
                {{ getTypeName(scope.row.maintenanceType) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="priority" label="优先级" width="100" align="center">
            <template #default="scope">
              <el-tag :type="getPriorityTag(scope.row.priority)" size="small">
                {{ getPriorityName(scope.row.priority) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="technician" label="维护人员" width="100" />
          <el-table-column prop="scheduledDate" label="计划日期" width="120" />
          <el-table-column prop="completedDate" label="完成日期" width="120">
            <template #default="scope">
              {{ scope.row.completedDate || '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100" align="center">
            <template #default="scope">
              <el-tag :type="getStatusTag(scope.row.status)">
                {{ getStatusName(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="cost" label="维护费用" width="120" align="right">
            <template #default="scope">
              <span>¥{{ (scope.row.cost || 0).toFixed(2) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" fixed="right" align="center">
            <template #default="scope">
              <el-button size="small" type="primary" text @click.stop="handleViewDetail(scope.row)">
                <i class="fa fa-eye"></i>
              </el-button>
              <el-button
                v-if="scope.row.status === 'pending'"
                size="small"
                type="success"
                text
                @click.stop="handleStartWork(scope.row)"
              >
                <i class="fa fa-play"></i>
              </el-button>
              <el-button
                v-if="scope.row.status === 'in_progress'"
                size="small"
                type="warning"
                text
                @click.stop="handleCompleteWork(scope.row)"
              >
                <i class="fa fa-check"></i>
              </el-button>
              <el-button size="small" type="info" text @click.stop="handleEditRecord(scope.row)">
                <i class="fa fa-edit"></i>
              </el-button>
              <el-button
                v-if="scope.row.status !== 'completed' && scope.row.status !== 'cancelled'"
                size="small"
                type="danger"
                text
                @click.stop="handleCancelRecord(scope.row)"
              >
                <i class="fa fa-times"></i>
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <div v-else class="timeline-view">
          <el-timeline>
            <el-timeline-item
              v-for="record in maintenanceRecords"
              :key="record.id"
              :timestamp="record.scheduledDate"
              :type="getTimelineType(record.status)"
              :hollow="record.status === 'completed'"
            >
              <div class="timeline-content" @click="handleViewDetail(record)">
                <div class="timeline-header">
                  <span class="record-no">{{ record.recordNo }}</span>
                  <el-tag :type="getTypeTag(record.maintenanceType)" size="small">
                    {{ getTypeName(record.maintenanceType) }}
                  </el-tag>
                </div>
                <div class="timeline-body">
                  <div class="device-info">
                    <i class="fa fa-cog"></i>
                    <span>{{ record.deviceName }}</span>
                    <span class="device-id">({{ record.deviceId }})</span>
                  </div>
                  <div class="maintenance-info">
                    <span><i class="fa fa-user"></i> {{ record.technician }}</span>
                    <span><i class="fa fa-money"></i> ¥{{ (record.cost || 0).toFixed(2) }}</span>
                  </div>
                </div>
                <div class="timeline-footer">
                  <el-tag :type="getStatusTag(record.status)" size="small">
                    {{ getStatusName(record.status) }}
                  </el-tag>
                </div>
              </div>
            </el-timeline-item>
          </el-timeline>
        </div>

        <div class="pagination-section">
          <el-pagination
            v-model:current-page="pagination.currentPage"
            v-model:page-size="pagination.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="pagination.total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>
    </div>

    <el-dialog
      v-model="detailDialogVisible"
      title="维护记录详情"
      width="800px"
      :close-on-click-modal="false"
    >
      <div v-if="currentRecord" class="detail-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="维护单号">
            <strong>{{ currentRecord.recordNo }}</strong>
          </el-descriptions-item>
          <el-descriptions-item label="设备名称">{{ currentRecord.deviceName }}</el-descriptions-item>
          <el-descriptions-item label="设备编号">{{ currentRecord.deviceId }}</el-descriptions-item>
          <el-descriptions-item label="维护类型">
            <el-tag :type="getTypeTag(currentRecord.maintenanceType)">
              {{ getTypeName(currentRecord.maintenanceType) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="优先级">
            <el-tag :type="getPriorityTag(currentRecord.priority)">
              {{ getPriorityName(currentRecord.priority) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusTag(currentRecord.status)">
              {{ getStatusName(currentRecord.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="维护人员">{{ currentRecord.technician }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ currentRecord.phone }}</el-descriptions-item>
          <el-descriptions-item label="计划日期">{{ currentRecord.scheduledDate }}</el-descriptions-item>
          <el-descriptions-item label="完成日期">{{ currentRecord.completedDate || '未完成' }}</el-descriptions-item>
          <el-descriptions-item label="维护费用">¥{{ (currentRecord.cost || 0).toFixed(2) }}</el-descriptions-item>
          <el-descriptions-item label="耗时">{{ currentRecord.duration || '-' }}小时</el-descriptions-item>
          <el-descriptions-item label="问题描述" :span="2">
            {{ currentRecord.description || '暂无描述' }}
          </el-descriptions-item>
          <el-descriptions-item label="维护内容" :span="2">
            {{ currentRecord.content || '暂无记录' }}
          </el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">
            {{ currentRecord.remark || '暂无备注' }}
          </el-descriptions-item>
        </el-descriptions>

        <div class="maintenance-images" v-if="currentRecord.images && currentRecord.images.length > 0">
          <h4>现场照片</h4>
          <div class="image-list">
            <el-image
              v-for="(img, index) in currentRecord.images"
              :key="index"
              :src="img"
              :preview-src-list="currentRecord.images"
              fit="cover"
              class="maintenance-image"
            />
          </div>
        </div>

        <div class="operation-log" v-if="currentRecord.operationLog && currentRecord.operationLog.length > 0">
          <h4>操作日志</h4>
          <el-timeline>
            <el-timeline-item
              v-for="(log, index) in currentRecord.operationLog"
              :key="index"
              :timestamp="log.time"
              placement="top"
            >
              {{ log.action }}
            </el-timeline-item>
          </el-timeline>
        </div>
      </div>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="handleEditRecord(currentRecord)">编辑</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="recordDialogVisible"
      :title="dialogType === 'add' ? '新增维护记录' : '编辑维护记录'"
      width="700px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="recordForm"
        :rules="formRules"
        label-width="100px"
        class="maintenance-form"
      >
        <el-divider content-position="left">基本信息</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="设备" prop="deviceId">
              <el-select v-model="recordForm.deviceId" placeholder="请选择设备" filterable @change="handleDeviceChange">
                <el-option
                  v-for="device in deviceList"
                  :key="device.id"
                  :label="`${device.name} (${device.id})`"
                  :value="device.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="维护类型" prop="maintenanceType">
              <el-select v-model="recordForm.maintenanceType" placeholder="请选择维护类型">
                <el-option label="例行保养" value="routine" />
                <el-option label="故障维修" value="repair" />
                <el-option label="紧急抢修" value="emergency" />
                <el-option label="预防性维护" value="preventive" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="优先级" prop="priority">
              <el-select v-model="recordForm.priority" placeholder="请选择优先级">
                <el-option label="紧急" value="urgent" />
                <el-option label="高" value="high" />
                <el-option label="中" value="medium" />
                <el-option label="低" value="low" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="计划日期" prop="scheduledDate">
              <el-date-picker
                v-model="recordForm.scheduledDate"
                type="date"
                placeholder="选择计划日期"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">人员信息</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="维护人员" prop="technician">
              <el-input v-model="recordForm.technician" placeholder="请输入维护人员" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="phone">
              <el-input v-model="recordForm.phone" placeholder="请输入联系电话" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">维护内容</el-divider>
        <el-form-item label="问题描述" prop="description">
          <el-input
            v-model="recordForm.description"
            type="textarea"
            :rows="3"
            placeholder="请描述设备问题或维护需求"
          />
        </el-form-item>
        <el-form-item label="维护内容" prop="content">
          <el-input
            v-model="recordForm.content"
            type="textarea"
            :rows="3"
            placeholder="请输入具体维护内容"
          />
        </el-form-item>
        <el-form-item label="预估费用">
          <el-input-number v-model="recordForm.cost" :min="0" :precision="2" controls-position="right" />
          <span class="unit">元</span>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="recordForm.remark"
            type="textarea"
            :rows="2"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="recordDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveRecord" :loading="saveLoading">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'DeviceMaintenanceRecord',
  setup() {
    const loading = ref(false)
    const saveLoading = ref(false)
    const viewMode = ref('table')
    const searchKeyword = ref('')
    const filterStatus = ref('')
    const filterType = ref('')
    const detailDialogVisible = ref(false)
    const recordDialogVisible = ref(false)
    const dialogType = ref('add')
    const currentRecord = ref(null)
    const formRef = ref(null)

    const stats = reactive({
      totalRecords: 186,
      pendingCount: 12,
      completedThisMonth: 45,
      avgResponseTime: 2.5
    })

    const pagination = reactive({
      currentPage: 1,
      pageSize: 10,
      total: 0
    })

    const maintenanceRecords = ref([])
    const deviceList = ref([])

    const recordForm = reactive({
      id: '',
      recordNo: '',
      deviceId: '',
      deviceName: '',
      maintenanceType: 'routine',
      priority: 'medium',
      scheduledDate: '',
      completedDate: '',
      technician: '',
      phone: '',
      description: '',
      content: '',
      cost: 0,
      duration: 0,
      status: 'pending',
      remark: '',
      images: [],
      operationLog: []
    })

    const formRules = {
      deviceId: [{ required: true, message: '请选择设备', trigger: 'change' }],
      maintenanceType: [{ required: true, message: '请选择维护类型', trigger: 'change' }],
      priority: [{ required: true, message: '请选择优先级', trigger: 'change' }],
      scheduledDate: [{ required: true, message: '请选择计划日期', trigger: 'change' }],
      technician: [{ required: true, message: '请输入维护人员', trigger: 'blur' }]
    }

    const generateMockData = () => {
      const types = ['routine', 'repair', 'emergency', 'preventive']
      const priorities = ['urgent', 'high', 'medium', 'low']
      const statuses = ['pending', 'in_progress', 'completed', 'cancelled']
      const technicians = ['张工', '李工', '王工', '赵工', '刘工']
      const devices = [
        { id: 'DEV-LIGHT-001', name: '候车大厅主照明-A1' },
        { id: 'DEV-AIRCON-001', name: '中央空调机组-1号' },
        { id: 'DEV-VENT-001', name: '新风机组-东侧' },
        { id: 'DEV-ELEV-001', name: '1号客梯' },
        { id: 'DEV-PUMP-001', name: '生活水泵-1号' },
        { id: 'DEV-CAM-001', name: '出入口监控摄像头-1' },
        { id: 'DEV-TRANS-001', name: '配电柜-主配电室' },
        { id: 'DEV-FAN-001', name: '排烟风机-地下停车场' }
      ]

      const records = []
      const typeNames = {
        routine: '例行保养',
        repair: '故障维修',
        emergency: '紧急抢修',
        preventive: '预防性维护'
      }
      const priorityNames = {
        urgent: '紧急',
        high: '高',
        medium: '中',
        low: '低'
      }
      const statusNames = {
        pending: '待处理',
        in_progress: '进行中',
        completed: '已完成',
        cancelled: '已取消'
      }

      for (let i = 0; i < 50; i++) {
        const device = devices[Math.floor(Math.random() * devices.length)]
        const type = types[Math.floor(Math.random() * types.length)]
        const priority = priorities[Math.floor(Math.random() * priorities.length)]
        const status = statuses[Math.floor(Math.random() * statuses.length)]
        const scheduledDate = new Date()
        scheduledDate.setDate(scheduledDate.getDate() - Math.floor(Math.random() * 30))

        records.push({
          id: `MNT-${String(i + 1).padStart(4, '0')}`,
          recordNo: `MNT2024${String(i + 1).padStart(5, '0')}`,
          deviceId: device.id,
          deviceName: device.name,
          maintenanceType: type,
          priority: priority,
          scheduledDate: scheduledDate.toISOString().split('T')[0],
          completedDate: status === 'completed' ? new Date(scheduledDate.getTime() + 86400000 * Math.floor(Math.random() * 3 + 1)).toISOString().split('T')[0] : '',
          technician: technicians[Math.floor(Math.random() * technicians.length)],
          phone: `138****${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
          description: `${typeNames[type]} - 定期检查和维护`,
          content: `完成${typeNames[type]}各项检查，项目包括：设备运行状态检查、参数校准、清洁保养等`,
          cost: Math.floor(Math.random() * 5000 + 500),
          duration: Math.floor(Math.random() * 8 + 1),
          status: status,
          remark: status === 'cancelled' ? '因设备暂无故障，已取消本次维护' : '',
          images: [],
          operationLog: [
            { time: `${scheduledDate.toISOString().split('T')[0]} 09:00`, action: '创建维护工单' },
            { time: `${scheduledDate.toISOString().split('T')[0]} 10:30`, action: '分配维护人员' },
            { time: status === 'completed' || status === 'in_progress' ? `${scheduledDate.toISOString().split('T')[0]} 14:00` : '', action: status === 'in_progress' ? '开始维护工作' : status === 'completed' ? '开始维护工作' : '' },
            { time: status === 'completed' ? `${scheduledDate.toISOString().split('T')[0]} 17:00` : '', action: status === 'completed' ? '完成维护工作' : '' }
          ].filter(log => log.time && log.action)
        })
      }

      return records
    }

    const initDeviceList = () => {
      deviceList.value = [
        { id: 'DEV-LIGHT-001', name: '候车大厅主照明-A1', system: '照明系统' },
        { id: 'DEV-LIGHT-002', name: '候车大厅主照明-A2', system: '照明系统' },
        { id: 'DEV-AIRCON-001', name: '中央空调机组-1号', system: '空调系统' },
        { id: 'DEV-AIRCON-002', name: '中央空调机组-2号', system: '空调系统' },
        { id: 'DEV-VENT-001', name: '新风机组-东侧', system: '通风系统' },
        { id: 'DEV-VENT-002', name: '新风机组-西侧', system: '通风系统' },
        { id: 'DEV-ELEV-001', name: '1号客梯', system: '电梯系统' },
        { id: 'DEV-ELEV-002', name: '2号客梯', system: '电梯系统' },
        { id: 'DEV-PUMP-001', name: '生活水泵-1号', system: '给排水系统' },
        { id: 'DEV-PUMP-002', name: '生活水泵-2号', system: '给排水系统' }
      ]
    }

    const loadData = () => {
      loading.value = true
      setTimeout(() => {
        maintenanceRecords.value = generateMockData()
        pagination.total = maintenanceRecords.value.length
        loading.value = false
      }, 500)
    }

    const handleAddRecord = () => {
      dialogType.value = 'add'
      Object.assign(recordForm, {
        id: '',
        recordNo: `MNT2024${String(maintenanceRecords.value.length + 1).padStart(5, '0')}`,
        deviceId: '',
        deviceName: '',
        maintenanceType: 'routine',
        priority: 'medium',
        scheduledDate: new Date().toISOString().split('T')[0],
        completedDate: '',
        technician: '',
        phone: '',
        description: '',
        content: '',
        cost: 0,
        duration: 0,
        status: 'pending',
        remark: '',
        images: [],
        operationLog: []
      })
      recordDialogVisible.value = true
    }

    const handleEditRecord = (record) => {
      dialogType.value = 'edit'
      Object.assign(recordForm, { ...record })
      detailDialogVisible.value = false
      recordDialogVisible.value = true
    }

    const handleSaveRecord = async () => {
      try {
        await formRef.value.validate()
        saveLoading.value = true
        setTimeout(() => {
          saveLoading.value = false
          recordDialogVisible.value = false
          loadData()
          ElMessage.success(dialogType.value === 'add' ? '新增成功' : '保存成功')
        }, 500)
      } catch (error) {
        console.error('Validation failed:', error)
      }
    }

    const handleViewDetail = (record) => {
      currentRecord.value = record
      detailDialogVisible.value = true
    }

    const handleRowClick = (row) => {
      handleViewDetail(row)
    }

    const handleStartWork = (record) => {
      ElMessageBox.confirm(
        `确定要开始维护工作：${record.recordNo} 吗？`,
        '开始维护',
        { type: 'info' }
      ).then(() => {
        record.status = 'in_progress'
        ElMessage.success('已开始维护工作')
      }).catch(() => {})
    }

    const handleCompleteWork = (record) => {
      ElMessageBox.confirm(
        `确定要完成维护工作：${record.recordNo} 吗？`,
        '完成维护',
        { type: 'success' }
      ).then(() => {
        record.status = 'completed'
        record.completedDate = new Date().toISOString().split('T')[0]
        ElMessage.success('维护工作已完成')
      }).catch(() => {})
    }

    const handleCancelRecord = (record) => {
      ElMessageBox.confirm(
        `确定要取消维护记录：${record.recordNo} 吗？`,
        '取消确认',
        { type: 'warning' }
      ).then(() => {
        record.status = 'cancelled'
        ElMessage.success('已取消维护记录')
      }).catch(() => {})
    }

    const handleDeviceChange = (deviceId) => {
      const device = deviceList.value.find(d => d.id === deviceId)
      if (device) {
        recordForm.deviceName = device.name
      }
    }

    const handleBatchScheduling = () => {
      ElMessage.info('打开批量排程对话框')
    }

    const handleExport = () => {
      ElMessage.info('导出维护记录')
    }

    const handleSearch = () => {
      loadData()
    }

    const handleSizeChange = () => {
      loadData()
    }

    const handleCurrentChange = () => {
      loadData()
    }

    const getTypeTag = (type) => {
      const tags = {
        routine: '',
        repair: 'warning',
        emergency: 'danger',
        preventive: 'success'
      }
      return tags[type] || ''
    }

    const getTypeName = (type) => {
      const names = {
        routine: '例行保养',
        repair: '故障维修',
        emergency: '紧急抢修',
        preventive: '预防性维护'
      }
      return names[type] || type
    }

    const getPriorityTag = (priority) => {
      const tags = {
        urgent: 'danger',
        high: 'warning',
        medium: '',
        low: 'info'
      }
      return tags[priority] || ''
    }

    const getPriorityName = (priority) => {
      const names = {
        urgent: '紧急',
        high: '高',
        medium: '中',
        low: '低'
      }
      return names[priority] || priority
    }

    const getStatusTag = (status) => {
      const tags = {
        pending: 'warning',
        in_progress: 'info',
        completed: 'success',
        cancelled: 'danger'
      }
      return tags[status] || ''
    }

    const getStatusName = (status) => {
      const names = {
        pending: '待处理',
        in_progress: '进行中',
        completed: '已完成',
        cancelled: '已取消'
      }
      return names[status] || status
    }

    const getTimelineType = (status) => {
      const types = {
        pending: 'warning',
        in_progress: 'primary',
        completed: 'success',
        cancelled: 'danger'
      }
      return types[status] || 'info'
    }

    watch([searchKeyword, filterStatus, filterType], () => {
      loadData()
    })

    onMounted(() => {
      initDeviceList()
      loadData()
    })

    return {
      loading,
      saveLoading,
      viewMode,
      searchKeyword,
      filterStatus,
      filterType,
      stats,
      pagination,
      maintenanceRecords,
      deviceList,
      detailDialogVisible,
      recordDialogVisible,
      dialogType,
      currentRecord,
      recordForm,
      formRules,
      formRef,
      handleAddRecord,
      handleEditRecord,
      handleSaveRecord,
      handleViewDetail,
      handleRowClick,
      handleStartWork,
      handleCompleteWork,
      handleCancelRecord,
      handleDeviceChange,
      handleBatchScheduling,
      handleExport,
      handleSearch,
      handleSizeChange,
      handleCurrentChange,
      getTypeTag,
      getTypeName,
      getPriorityTag,
      getPriorityName,
      getStatusTag,
      getStatusName,
      getTimelineType
    }
  }
}
</script>

<style scoped>
.device-maintenance-record {
  padding: 0;
}

.toolbar {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
}

.toolbar-right {
  display: flex;
  margin-left: auto;
}

.stats-cards {
  margin-bottom: 20px;
}

.stat-card {
  border-radius: 8px;
}

.stat-content {
  display: flex;
  align-items: center;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
}

.stat-icon i {
  font-size: 24px;
  color: #fff;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.pagination-section {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.timeline-view {
  max-height: 500px;
  overflow-y: auto;
  padding: 20px;
}

.timeline-content {
  cursor: pointer;
  padding: 12px;
  border-radius: 8px;
  transition: background 0.2s;
}

.timeline-content:hover {
  background: #f5f7fa;
}

.timeline-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.record-no {
  font-weight: 500;
  color: #409EFF;
}

.timeline-body {
  margin-bottom: 8px;
}

.device-info {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}

.device-id {
  color: #909399;
  font-size: 12px;
}

.maintenance-info {
  display: flex;
  gap: 16px;
  color: #606266;
  font-size: 13px;
}

.maintenance-info i {
  margin-right: 4px;
  color: #909399;
}

.timeline-footer {
  margin-top: 8px;
}

.detail-content {
  max-height: 500px;
  overflow-y: auto;
}

.detail-content h4 {
  margin: 20px 0 12px 0;
  color: #303133;
}

.maintenance-images .image-list {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.maintenance-image {
  width: 100px;
  height: 100px;
  border-radius: 8px;
  cursor: pointer;
}

.operation-log {
  margin-top: 20px;
}

.maintenance-form .unit {
  margin-left: 8px;
  color: #909399;
}
</style>
