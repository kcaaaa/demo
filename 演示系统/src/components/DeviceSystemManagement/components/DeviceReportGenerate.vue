<template>
  <div class="device-report-generate">
    <div class="toolbar">
      <el-button type="primary" @click="handleNewReport">
        <i class="fa fa-plus"></i> 新建报表
      </el-button>
      <el-button type="success" @click="handleAutoGenerate">
        <i class="fa fa-clock-o"></i> 自动生成
      </el-button>
      <el-button type="info" @click="handleTemplateManage">
        <i class="fa fa-cogs"></i> 模板管理
      </el-button>
      <div class="toolbar-right">
        <el-select v-model="reportType" placeholder="报表类型" clearable style="width: 150px;">
          <el-option label="能耗报表" value="energy" />
          <el-option label="设备运行报表" value="operation" />
          <el-option label="维护报表" value="maintenance" />
          <el-option label="预警报表" value="warning" />
          <el-option label="综合报表" value="comprehensive" />
        </el-select>
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="width: 250px; margin-left: 10px;"
        />
        <el-button type="primary" @click="handleGenerate" style="margin-left: 10px;">
          <i class="fa fa-bar-chart"></i> 生成报表
        </el-button>
      </div>
    </div>

    <div class="stats-section">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-content">
              <div class="stat-icon">
                <i class="fa fa-file-text-o"></i>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.totalReports }}</div>
                <div class="stat-label">报表总数</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card primary">
            <div class="stat-content">
              <div class="stat-icon">
                <i class="fa fa-bar-chart"></i>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.monthlyReports }}</div>
                <div class="stat-label">本月生成</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card success">
            <div class="stat-content">
              <div class="stat-icon">
                <i class="fa fa-download"></i>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.downloadCount }}</div>
                <div class="stat-label">下载次数</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card warning">
            <div class="stat-content">
              <div class="stat-icon">
                <i class="fa fa-clock-o"></i>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.scheduledReports }}</div>
                <div class="stat-label">定时任务</div>
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
                <span>报表列表</span>
                <div class="header-actions">
                  <el-input
                    v-model="searchKeyword"
                    placeholder="搜索报表名称..."
                    prefix-icon="el-icon-search"
                    clearable
                    style="width: 200px;"
                  />
                </div>
              </div>
            </template>

            <div class="report-list" v-loading="loading">
              <el-table :data="filteredReports" stripe row-key="id" @row-click="handleRowClick">
                <el-table-column prop="name" label="报表名称" min-width="200">
                  <template #default="scope">
                    <div class="report-name">
                      <i :class="getReportIcon(scope.row.type)"></i>
                      <span>{{ scope.row.name }}</span>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column prop="type" label="类型" width="120" align="center">
                  <template #default="scope">
                    <el-tag :type="getTypeTag(scope.row.type)" size="small">
                      {{ getTypeName(scope.row.type) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="dateRange" label="数据周期" width="200">
                  <template #default="scope">
                    {{ scope.row.startDate }} ~ {{ scope.row.endDate }}
                  </template>
                </el-table-column>
                <el-table-column prop="createTime" label="生成时间" width="160">
                  <template #default="scope">
                    {{ formatTime(scope.row.createTime) }}
                  </template>
                </el-table-column>
                <el-table-column prop="size" label="文件大小" width="100" align="right">
                  <template #default="scope">
                    {{ formatFileSize(scope.row.size) }}
                  </template>
                </el-table-column>
                <el-table-column prop="status" label="状态" width="100" align="center">
                  <template #default="scope">
                    <el-tag :type="getStatusType(scope.row.status)" size="small">
                      {{ getStatusName(scope.row.status) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="200" align="center" fixed="right">
                  <template #default="scope">
                    <el-button type="primary" size="mini" text @click.stop="handlePreview(scope.row)">
                      <i class="fa fa-eye"></i> 预览
                    </el-button>
                    <el-button type="success" size="mini" text @click.stop="handleDownload(scope.row)">
                      <i class="fa fa-download"></i> 下载
                    </el-button>
                    <el-button type="danger" size="mini" text @click.stop="handleDelete(scope.row)">
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
                  :total="total"
                  layout="total, sizes, prev, pager, next, jumper"
                  @size-change="handleSizeChange"
                  @current-change="handlePageChange"
                />
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="10">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>报表生成统计</span>
              </div>
            </template>
            <div ref="typeChartRef" class="type-chart"></div>
          </el-card>

          <el-card shadow="hover" class="template-card">
            <template #header>
              <div class="card-header">
                <span>常用模板</span>
                <el-button type="text" size="small" @click="handleTemplateManage">
                  <i class="fa fa-cog"></i> 管理
                </el-button>
              </div>
            </template>
            <div class="template-list">
              <div
                v-for="template in templates"
                :key="template.id"
                class="template-item"
                @click="handleUseTemplate(template)"
              >
                <div class="template-icon">
                  <i :class="template.icon"></i>
                </div>
                <div class="template-info">
                  <div class="template-name">{{ template.name }}</div>
                  <div class="template-desc">{{ template.description }}</div>
                </div>
                <div class="template-action">
                  <el-button type="primary" size="mini" circle>
                    <i class="fa fa-arrow-right"></i>
                  </el-button>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <el-dialog
      v-model="newReportDialogVisible"
      title="新建报表"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form :model="newReportForm" label-width="100px" :rules="reportRules" ref="reportFormRef">
        <el-form-item label="报表名称" prop="name">
          <el-input v-model="newReportForm.name" placeholder="请输入报表名称" />
        </el-form-item>
        <el-form-item label="报表类型" prop="type">
          <el-select v-model="newReportForm.type" placeholder="请选择报表类型" style="width: 100%;">
            <el-option label="能耗报表" value="energy" />
            <el-option label="设备运行报表" value="operation" />
            <el-option label="维护报表" value="maintenance" />
            <el-option label="预警报表" value="warning" />
            <el-option label="综合报表" value="comprehensive" />
          </el-select>
        </el-form-item>
        <el-form-item label="数据周期" prop="dateRange">
          <el-date-picker
            v-model="newReportForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="选择设备" prop="devices">
          <el-select v-model="newReportForm.devices" multiple placeholder="请选择设备" style="width: 100%;">
            <el-option v-for="device in deviceList" :key="device.id" :label="device.name" :value="device.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="输出格式">
          <el-checkbox-group v-model="newReportForm.formats">
            <el-checkbox label="pdf">PDF</el-checkbox>
            <el-checkbox label="excel">Excel</el-checkbox>
            <el-checkbox label="word">Word</el-checkbox>
            <el-checkbox label="html">HTML</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="报表模板">
          <el-select v-model="newReportForm.template" placeholder="选择报表模板" style="width: 100%;">
            <el-option label="默认模板" value="default" />
            <el-option label="详细报告" value="detailed" />
            <el-option label="简洁报告" value="simple" />
            <el-option label="自定义模板" value="custom" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="newReportForm.remark" type="textarea" :rows="3" placeholder="请输入备注信息" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="newReportDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCreateReport" :loading="generating">
          {{ generating ? '生成中...' : '生成报表' }}
        </el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="previewDialogVisible"
      title="报表预览"
      width="900px"
      top="5vh"
    >
      <div class="preview-header">
        <div class="preview-title">{{ currentReport?.name }}</div>
        <div class="preview-meta">
          <span>报表类型：{{ getTypeName(currentReport?.type) }}</span>
          <span>数据周期：{{ currentReport?.startDate }} ~ {{ currentReport?.endDate }}</span>
          <span>生成时间：{{ formatTime(currentReport?.createTime) }}</span>
        </div>
      </div>
      <div class="preview-content" v-if="currentReport">
        <div class="preview-section">
          <h4>报表摘要</h4>
          <div class="summary-grid">
            <div class="summary-item">
              <span class="summary-label">设备总数</span>
              <span class="summary-value">{{ currentReport.summary?.totalDevices || 0 }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">总能耗</span>
              <span class="summary-value">{{ currentReport.summary?.totalEnergy || 0 }} kWh</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">预警次数</span>
              <span class="summary-value">{{ currentReport.summary?.warningCount || 0 }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">维护次数</span>
              <span class="summary-value">{{ currentReport.summary?.maintenanceCount || 0 }}</span>
            </div>
          </div>
        </div>
        <div class="preview-section">
          <h4>能耗趋势</h4>
          <div ref="previewChartRef" class="preview-chart"></div>
        </div>
        <div class="preview-section">
          <h4>设备状态分布</h4>
          <div ref="previewPieRef" class="preview-pie"></div>
        </div>
      </div>
      <template #footer>
        <el-button @click="previewDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="handleDownload(currentReport)">
          <i class="fa fa-download"></i> 下载报表
        </el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="templateDialogVisible"
      title="模板管理"
      width="800px"
    >
      <div class="template-manage-header">
        <el-button type="primary" @click="handleNewTemplate">
          <i class="fa fa-plus"></i> 新建模板
        </el-button>
      </div>
      <el-table :data="allTemplates" stripe row-key="id">
        <el-table-column prop="name" label="模板名称" min-width="150" />
        <el-table-column prop="type" label="适用类型" width="120" align="center">
          <template #default="scope">
            <el-tag size="small">{{ getTypeName(scope.row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="200" />
        <el-table-column prop="useCount" label="使用次数" width="100" align="center" />
        <el-table-column prop="createTime" label="创建时间" width="160">
          <template #default="scope">
            {{ formatTime(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center">
          <template #default="scope">
            <el-button type="primary" size="mini" text @click="handleEditTemplate(scope.row)">
              <i class="fa fa-edit"></i> 编辑
            </el-button>
            <el-button type="danger" size="mini" text @click="handleDeleteTemplate(scope.row)">
              <i class="fa fa-trash"></i> 删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="templateDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as echarts from 'echarts'

export default {
  name: 'DeviceReportGenerate',
  setup() {
    const loading = ref(false)
    const generating = ref(false)
    const searchKeyword = ref('')
    const reportType = ref('')
    const dateRange = ref([])
    const currentPage = ref(1)
    const pageSize = ref(10)
    const total = ref(0)
    const newReportDialogVisible = ref(false)
    const previewDialogVisible = ref(false)
    const templateDialogVisible = ref(false)
    const currentReport = ref(null)
    const reportFormRef = ref(null)

    const typeChartRef = ref(null)
    const previewChartRef = ref(null)
    const previewPieRef = ref(null)

    const charts = new Map()

    const disposeAllCharts = () => {
      charts.forEach((chart) => {
        if (chart && !chart.isDisposed()) {
          chart.dispose()
        }
      })
      charts.clear()
    }

    onUnmounted(() => {
      disposeAllCharts()
    })

    const stats = ref({
      totalReports: 156,
      monthlyReports: 23,
      downloadCount: 482,
      scheduledReports: 12
    })

    const newReportForm = ref({
      name: '',
      type: '',
      dateRange: [],
      devices: [],
      formats: ['pdf', 'excel'],
      template: 'default',
      remark: ''
    })

    const reportRules = {
      name: [{ required: true, message: '请输入报表名称', trigger: 'blur' }],
      type: [{ required: true, message: '请选择报表类型', trigger: 'change' }],
      dateRange: [{ required: true, message: '请选择数据周期', trigger: 'change' }]
    }

    const deviceList = ref([
      { id: '1', name: '1号主变压器' },
      { id: '2', name: '2号主变压器' },
      { id: '3', name: '3号主变压器' },
      { id: '4', name: '冷水机组A' },
      { id: '5', name: '冷水机组B' },
      { id: '6', name: '空调箱AHU-1' },
      { id: '7', name: '空调箱AHU-2' },
      { id: '8', name: '排风机组' },
      { id: '9', name: '给水泵' },
      { id: '10', name: '排水泵' }
    ])

    const reports = ref([
      {
        id: '1',
        name: '2024年12月能耗分析报表',
        type: 'energy',
        startDate: '2024-12-01',
        endDate: '2024-12-31',
        createTime: new Date('2024-12-25T10:30:00'),
        size: 2560000,
        status: 'completed',
        summary: {
          totalDevices: 156,
          totalEnergy: 1250000,
          warningCount: 23,
          maintenanceCount: 45
        }
      },
      {
        id: '2',
        name: '设备运行状态周报',
        type: 'operation',
        startDate: '2024-12-16',
        endDate: '2024-12-22',
        createTime: new Date('2024-12-22T18:00:00'),
        size: 1024000,
        status: 'completed',
        summary: {
          totalDevices: 156,
          totalEnergy: 320000,
          warningCount: 5,
          maintenanceCount: 12
        }
      },
      {
        id: '3',
        name: '月度维护记录汇总',
        type: 'maintenance',
        startDate: '2024-12-01',
        endDate: '2024-12-31',
        createTime: new Date('2024-12-25T14:00:00'),
        size: 512000,
        status: 'completed',
        summary: {
          totalDevices: 156,
          totalEnergy: 0,
          warningCount: 0,
          maintenanceCount: 45
        }
      },
      {
        id: '4',
        name: '预警事件统计报表',
        type: 'warning',
        startDate: '2024-12-01',
        endDate: '2024-12-31',
        createTime: new Date('2024-12-25T16:00:00'),
        size: 768000,
        status: 'completed',
        summary: {
          totalDevices: 156,
          totalEnergy: 0,
          warningCount: 156,
          maintenanceCount: 0
        }
      },
      {
        id: '5',
        name: '综合能耗分析报告',
        type: 'comprehensive',
        startDate: '2024-11-01',
        endDate: '2024-11-30',
        createTime: new Date('2024-12-01T09:00:00'),
        size: 5120000,
        status: 'completed',
        summary: {
          totalDevices: 156,
          totalEnergy: 1380000,
          warningCount: 45,
          maintenanceCount: 52
        }
      }
    ])

    const templates = ref([
      {
        id: '1',
        name: '月度能耗分析',
        icon: 'fa fa-bar-chart text-primary',
        description: '包含能耗趋势、设备对比、异常分析',
        type: 'energy'
      },
      {
        id: '2',
        name: '设备运行报告',
        icon: 'fa fa-cogs text-success',
        description: '设备状态、运行时长、故障统计',
        type: 'operation'
      },
      {
        id: '3',
        name: '维护记录汇总',
        icon: 'fa fa-wrench text-warning',
        description: '维护计划、完成情况、成本统计',
        type: 'maintenance'
      },
      {
        id: '4',
        name: '预警统计报告',
        icon: 'fa fa-exclamation-triangle text-danger',
        description: '预警分布、处理情况、趋势分析',
        type: 'warning'
      }
    ])

    const allTemplates = ref([
      { id: '1', name: '月度能耗分析', type: 'energy', description: '包含能耗趋势、设备对比、异常分析', useCount: 45, createTime: new Date('2024-01-15') },
      { id: '2', name: '设备运行报告', type: 'operation', description: '设备状态、运行时长、故障统计', useCount: 32, createTime: new Date('2024-02-20') },
      { id: '3', name: '维护记录汇总', type: 'maintenance', description: '维护计划、完成情况、成本统计', useCount: 28, createTime: new Date('2024-03-10') },
      { id: '4', name: '预警统计报告', type: 'warning', description: '预警分布、处理情况、趋势分析', useCount: 36, createTime: new Date('2024-04-05') },
      { id: '5', name: '综合分析报告', type: 'comprehensive', description: '多维度综合分析报告', useCount: 22, createTime: new Date('2024-05-18') }
    ])

    const filteredReports = computed(() => {
      let result = reports.value
      if (searchKeyword.value) {
        const keyword = searchKeyword.value.toLowerCase()
        result = result.filter(r => r.name.toLowerCase().includes(keyword))
      }
      if (reportType.value) {
        result = result.filter(r => r.type === reportType.value)
      }
      total.value = result.length
      const start = (currentPage.value - 1) * pageSize.value
      return result.slice(start, start + pageSize.value)
    })

    const hasReportData = computed(() => reports.value.length > 0)

    const handleNewReport = () => {
      newReportForm.value = {
        name: '',
        type: '',
        dateRange: [],
        devices: [],
        formats: ['pdf', 'excel'],
        template: 'default',
        remark: ''
      }
      newReportDialogVisible.value = true
    }

    const handleAutoGenerate = () => {
      ElMessage.info('定时任务管理功能开发中')
    }

    const handleTemplateManage = () => {
      templateDialogVisible.value = true
    }

    const handleGenerate = () => {
      if (!reportType.value) {
        ElMessage.warning('请选择报表类型')
        return
      }
      if (!dateRange.value || dateRange.value.length !== 2) {
        ElMessage.warning('请选择数据周期')
        return
      }
      loading.value = true
      setTimeout(() => {
        loading.value = false
        ElMessage.success('报表生成成功')
      }, 2000)
    }

    const handleCreateReport = async () => {
      if (!reportFormRef.value) return
      try {
        await reportFormRef.value.validate()
        generating.value = true
        await new Promise(resolve => setTimeout(resolve, 2000))
        const newReport = {
          id: Date.now().toString(),
          name: newReportForm.value.name,
          type: newReportForm.value.type,
          startDate: newReportForm.value.dateRange[0].toLocaleDateString(),
          endDate: newReportForm.value.dateRange[1].toLocaleDateString(),
          createTime: new Date(),
          size: Math.floor(Math.random() * 3000000) + 500000,
          status: 'completed',
          summary: {
            totalDevices: 156,
            totalEnergy: Math.floor(Math.random() * 500000) + 100000,
            warningCount: Math.floor(Math.random() * 50) + 10,
            maintenanceCount: Math.floor(Math.random() * 30) + 5
          }
        }
        reports.value.unshift(newReport)
        stats.value.totalReports++
        stats.value.monthlyReports++
        newReportDialogVisible.value = false
        ElMessage.success('报表生成成功')
      } catch (error) {
        ElMessage.error('请完善表单信息')
      } finally {
        generating.value = false
      }
    }

    const handlePreview = (report) => {
      currentReport.value = report
      previewDialogVisible.value = true
      nextTick(() => {
        initPreviewCharts()
      })
    }

    const handleDownload = (report) => {
      ElMessage.success(`正在下载报表：${report.name}`)
      stats.value.downloadCount++
    }

    const handleDelete = (report) => {
      ElMessageBox.confirm(`确定要删除报表"${report.name}"吗？`, '确认删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const index = reports.value.findIndex(r => r.id === report.id)
        if (index !== -1) {
          reports.value.splice(index, 1)
          stats.value.totalReports--
          ElMessage.success('删除成功')
        }
      }).catch(() => {})
    }

    const handleRowClick = (row) => {
      handlePreview(row)
    }

    const handleSizeChange = (val) => {
      pageSize.value = val
      currentPage.value = 1
    }

    const handlePageChange = (val) => {
      currentPage.value = val
    }

    const handleUseTemplate = (template) => {
      newReportForm.value.type = template.type
      newReportForm.value.template = template.id
      handleNewReport()
    }

    const handleNewTemplate = () => {
      ElMessage.info('模板创建功能开发中')
    }

    const handleEditTemplate = (template) => {
      ElMessage.info(`编辑模板：${template.name}`)
    }

    const handleDeleteTemplate = (template) => {
      ElMessageBox.confirm(`确定要删除模板"${template.name}"吗？`, '确认删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const index = allTemplates.value.findIndex(t => t.id === template.id)
        if (index !== -1) {
          allTemplates.value.splice(index, 1)
          ElMessage.success('删除成功')
        }
      }).catch(() => {})
    }

    const initTypeChart = () => {
      if (!typeChartRef.value) return
      if (charts.has('typeChart')) {
        charts.get('typeChart').dispose()
        charts.delete('typeChart')
      }
      const chart = echarts.init(typeChartRef.value)
      charts.set('typeChart', chart)
      const typeCount = {
        energy: reports.value.filter(r => r.type === 'energy').length,
        operation: reports.value.filter(r => r.type === 'operation').length,
        maintenance: reports.value.filter(r => r.type === 'maintenance').length,
        warning: reports.value.filter(r => r.type === 'warning').length,
        comprehensive: reports.value.filter(r => r.type === 'comprehensive').length
      }
      const option = {
        tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
        legend: {
          orient: 'vertical',
          right: 10,
          top: 'center'
        },
        color: ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399'],
        series: [{
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['35%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 2 },
          label: { show: false },
          emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold' } },
          data: [
            { value: typeCount.energy, name: '能耗报表' },
            { value: typeCount.operation, name: '运行报表' },
            { value: typeCount.maintenance, name: '维护报表' },
            { value: typeCount.warning, name: '预警报表' },
            { value: typeCount.comprehensive, name: '综合报表' }
          ]
        }]
      }
      chart.setOption(option)
    }

    const initPreviewCharts = () => {
      if (previewChartRef.value && currentReport.value) {
        if (charts.has('previewChart')) {
          charts.get('previewChart').dispose()
          charts.delete('previewChart')
        }
        const chart = echarts.init(previewChartRef.value)
        charts.set('previewChart', chart)
        const days = []
        const energyData = []
        for (let i = 1; i <= 30; i++) {
          days.push(`${i}日`)
          energyData.push(Math.floor(Math.random() * 50000) + 30000)
        }
        const option = {
          tooltip: { trigger: 'axis' },
          legend: { data: ['实际能耗', '预测能耗'] },
          grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
          xAxis: { type: 'category', data: days },
          yAxis: { type: 'value', name: 'kWh' },
          series: [
            {
              name: '实际能耗',
              type: 'line',
              smooth: true,
              data: energyData,
              itemStyle: { color: '#409EFF' },
              areaStyle: { color: 'rgba(64, 158, 255, 0.1)' }
            },
            {
              name: '预测能耗',
              type: 'line',
              smooth: true,
              data: energyData.map(v => v * (0.95 + Math.random() * 0.1)),
              itemStyle: { color: '#67C23A' },
              lineStyle: { type: 'dashed' }
            }
          ]
        }
        chart.setOption(option)
      }

      if (previewPieRef.value && currentReport.value) {
        if (charts.has('previewPie')) {
          charts.get('previewPie').dispose()
          charts.delete('previewPie')
        }
        const chart = echarts.init(previewPieRef.value)
        charts.set('previewPie', chart)
        const option = {
          tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
          legend: { orient: 'vertical', right: 10, top: 'center' },
          color: ['#67C23A', '#409EFF', '#E6A23C', '#F56C6C'],
          series: [{
            type: 'pie',
            radius: ['30%', '60%'],
            center: ['35%', '50%'],
            data: [
              { value: 120, name: '正常运行' },
              { value: 25, name: '维护中' },
              { value: 8, name: '异常' },
              { value: 3, name: '离线' }
            ],
            emphasis: {
              itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' }
            }
          }]
        }
        chart.setOption(option)
      }
    }

    const getReportIcon = (type) => {
      const icons = {
        energy: 'fa fa-bar-chart text-primary',
        operation: 'fa fa-cogs text-success',
        maintenance: 'fa fa-wrench text-warning',
        warning: 'fa fa-exclamation-triangle text-danger',
        comprehensive: 'fa fa-file-text-o text-info'
      }
      return icons[type] || 'fa fa-file-o'
    }

    const getTypeTag = (type) => {
      const tags = {
        energy: 'primary',
        operation: 'success',
        maintenance: 'warning',
        warning: 'danger',
        comprehensive: 'info'
      }
      return tags[type] || 'info'
    }

    const getTypeName = (type) => {
      const names = {
        energy: '能耗报表',
        operation: '运行报表',
        maintenance: '维护报表',
        warning: '预警报表',
        comprehensive: '综合报表'
      }
      return names[type] || type
    }

    const getStatusType = (status) => {
      const types = {
        completed: 'success',
        pending: 'warning',
        failed: 'danger'
      }
      return types[status] || 'info'
    }

    const getStatusName = (status) => {
      const names = {
        completed: '已完成',
        pending: '生成中',
        failed: '失败'
      }
      return names[status] || status
    }

    const formatTime = (time) => {
      if (!time) return '-'
      const date = new Date(time)
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
    }

    const formatFileSize = (bytes) => {
      if (bytes < 1024) return bytes + ' B'
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    }

    onMounted(() => {
      nextTick(() => {
        initTypeChart()
      })
    })

    return {
      loading,
      generating,
      searchKeyword,
      reportType,
      dateRange,
      currentPage,
      pageSize,
      total,
      stats,
      newReportForm,
      reportRules,
      deviceList,
      reports,
      templates,
      allTemplates,
      filteredReports,
      hasReportData,
      newReportDialogVisible,
      previewDialogVisible,
      templateDialogVisible,
      currentReport,
      reportFormRef,
      typeChartRef,
      previewChartRef,
      previewPieRef,
      handleNewReport,
      handleAutoGenerate,
      handleTemplateManage,
      handleGenerate,
      handleCreateReport,
      handlePreview,
      handleDownload,
      handleDelete,
      handleRowClick,
      handleSizeChange,
      handlePageChange,
      handleUseTemplate,
      handleNewTemplate,
      handleEditTemplate,
      handleDeleteTemplate,
      getReportIcon,
      getTypeTag,
      getTypeName,
      getStatusType,
      getStatusName,
      formatTime,
      formatFileSize
    }
  }
}
</script>

<style scoped>
.device-report-generate {
  padding: 20px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
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
  transition: transform 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-card.primary {
  border-top: 3px solid #409EFF;
}

.stat-card.success {
  border-top: 3px solid #67C23A;
}

.stat-card.warning {
  border-top: 3px solid #E6A23C;
}

.stat-content {
  display: flex;
  align-items: center;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
}

.stat-icon i {
  font-size: 28px;
  color: white;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 5px;
}

.main-content {
  margin-top: 20px;
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

.report-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.report-name i {
  font-size: 18px;
}

.text-primary { color: #409EFF; }
.text-success { color: #67C23A; }
.text-warning { color: #E6A23C; }
.text-danger { color: #F56C6C; }
.text-info { color: #909399; }

.pagination-section {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.type-chart {
  height: 300px;
}

.template-card {
  margin-top: 20px;
}

.template-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.template-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.template-item:hover {
  background: #e8f4fd;
  transform: translateX(5px);
}

.template-icon {
  width: 45px;
  height: 45px;
  border-radius: 10px;
  background: #409EFF;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}

.template-icon i {
  font-size: 20px;
  color: white;
}

.template-info {
  flex: 1;
}

.template-name {
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.template-desc {
  font-size: 12px;
  color: #909399;
}

.template-action {
  opacity: 0;
  transition: opacity 0.3s;
}

.template-item:hover .template-action {
  opacity: 1;
}

.template-manage-header {
  margin-bottom: 15px;
}

.preview-header {
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 15px;
  margin-bottom: 20px;
}

.preview-title {
  font-size: 20px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 10px;
}

.preview-meta {
  display: flex;
  gap: 20px;
  font-size: 14px;
  color: #909399;
}

.preview-content {
  max-height: 60vh;
  overflow-y: auto;
}

.preview-section {
  margin-bottom: 25px;
}

.preview-section h4 {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 15px;
  padding-left: 10px;
  border-left: 3px solid #409EFF;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
}

.summary-item {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  text-align: center;
}

.summary-label {
  display: block;
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.summary-value {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
}

.preview-chart {
  height: 300px;
}

.preview-pie {
  height: 280px;
}
</style>
