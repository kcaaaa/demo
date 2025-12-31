<template>
  <div class="strategy-implementation-plan-container">
    <el-card shadow="hover" class="plan-card">
      <div slot="header" class="card-header">
        <h3 class="card-title">
          <i class="fa fa-calendar-check-o"></i> 策略实施计划
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
          <el-button size="small" @click="handleNewPlan">
            <i class="fa fa-plus"></i> 新建计划
          </el-button>
          <el-button type="primary" size="small" @click="handleExportPlan">
            <i class="fa fa-file-pdf-o"></i> 导出计划
          </el-button>
        </div>
      </div>

      <div class="plan-overview">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :lg="6">
            <el-card shadow="hover" class="kpi-card">
              <div class="kpi-content">
                <div class="kpi-icon primary">
                  <i class="fa fa-flag"></i>
                </div>
                <div class="kpi-info">
                  <div class="kpi-value">{{ planOverview.milestones }}</div>
                  <div class="kpi-label">里程碑</div>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :xs="24" :sm="12" :lg="6">
            <el-card shadow="hover" class="kpi-card">
              <div class="kpi-content">
                <div class="kpi-icon success">
                  <i class="fa fa-users"></i>
                </div>
                <div class="kpi-info">
                  <div class="kpi-value">{{ planOverview.resources }}</div>
                  <div class="kpi-label">资源需求</div>
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
                  <div class="kpi-value">{{ planOverview.risks }}</div>
                  <div class="kpi-label">风险项</div>
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
                  <div class="kpi-value">{{ planOverview.duration }}</div>
                  <div class="kpi-label">预计工期</div>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <div class="plan-tabs">
        <el-tabs v-model="activeTab" type="card">
          <el-tab-pane label="实施阶段" name="phases">
            <div class="phases-panel">
              <el-timeline>
                <el-timeline-item
                  v-for="(phase, index) in implementationPhases"
                  :key="index"
                  :timestamp="phase.period"
                  :type="phase.status === 'completed' ? 'success' : phase.status === 'in-progress' ? 'primary' : 'info'"
                  :hollow="phase.status === 'pending'"
                  placement="top">
                  <el-card shadow="hover" class="phase-card">
                    <div class="phase-header">
                      <div class="phase-info">
                        <h4 class="phase-name">{{ phase.name }}</h4>
                        <el-tag :type="getPhaseStatusType(phase.status)" size="small">{{ getPhaseStatusText(phase.status) }}</el-tag>
                      </div>
                      <div class="phase-progress" v-if="phase.status !== 'pending'">
                        <span class="progress-label">进度：{{ phase.progress }}%</span>
                        <el-progress :percentage="phase.progress" :status="phase.progress === 100 ? 'success' : ''" :show-text="false" style="width: 120px;"></el-progress>
                      </div>
                    </div>
                    <div class="phase-content">
                      <p class="phase-description">{{ phase.description }}</p>
                      <div class="phase-tasks">
                        <h5><i class="fa fa-tasks"></i> 任务清单</h5>
                        <el-collapse accordion>
                          <el-collapse-item :title="'任务详情 (' + phase.tasks.length + '项)'">
                            <el-table :data="phase.tasks" size="small" stripe>
                              <el-table-column prop="name" label="任务名称" width="180"></el-table-column>
                              <el-table-column prop="owner" label="负责人" width="100"></el-table-column>
                              <el-table-column prop="duration" label="预计时长" width="100">
                                <template slot-scope="scope">
                                  <span>{{ scope.row.duration }}天</span>
                                </template>
                              </el-table-column>
                              <el-table-column prop="status" label="状态" width="100">
                                <template slot-scope="scope">
                                  <el-tag :type="getTaskStatusType(scope.row.status)" size="mini">{{ scope.row.status }}</el-tag>
                                </template>
                              </el-table-column>
                              <el-table-column prop="progress" label="进度">
                                <template slot-scope="scope">
                                  <el-progress :percentage="scope.row.progress" :show-text="false" size="mini"></el-progress>
                                </template>
                              </el-table-column>
                            </el-table>
                          </el-collapse-item>
                        </el-collapse>
                      </div>
                      <div class="phase-deliverables">
                        <h5><i class="fa fa-file-o"></i> 交付物</h5>
                        <el-tag
                          v-for="deliverable in phase.deliverables"
                          :key="deliverable"
                          type="info"
                          size="small"
                          class="deliverable-tag">
                          {{ deliverable }}
                        </el-tag>
                      </div>
                    </div>
                  </el-card>
                </el-timeline-item>
              </el-timeline>
            </div>
          </el-tab-pane>

          <el-tab-pane label="资源需求" name="resources">
            <div class="resources-panel">
              <el-row :gutter="20">
                <el-col :xs="24" :lg="8">
                  <el-card shadow="hover" class="resource-card">
                    <div slot="header" class="card-header">
                      <span><i class="fa fa-users"></i> 人员需求</span>
                    </div>
                    <div class="resource-content">
                      <div class="resource-item" v-for="(person, index) in personnelResources" :key="index">
                        <div class="resource-info">
                          <span class="resource-name">{{ person.role }}</span>
                          <span class="resource-count">{{ person.count }}人</span>
                        </div>
                        <el-progress :percentage="person.allocation" :show-text="false"></el-progress>
                        <div class="resource-detail">{{ person.responsibility }}</div>
                      </div>
                    </div>
                  </el-card>
                </el-col>
                <el-col :xs="24" :lg="8">
                  <el-card shadow="hover" class="resource-card">
                    <div slot="header" class="card-header">
                      <span><i class="fa fa-cogs"></i> 设备需求</span>
                    </div>
                    <div class="resource-content">
                      <div class="resource-item" v-for="(equipment, index) in equipmentResources" :key="index">
                        <div class="resource-info">
                          <span class="resource-name">{{ equipment.name }}</span>
                          <span class="resource-count">{{ equipment.quantity }}{{ equipment.unit }}</span>
                        </div>
                        <el-progress :percentage="equipment.availability" :status="equipment.availability >= 100 ? 'success' : equipment.availability >= 80 ? '' : 'exception'" :show-text="false"></el-progress>
                        <div class="resource-detail">{{ equipment.specification }}</div>
                      </div>
                    </div>
                  </el-card>
                </el-col>
                <el-col :xs="24" :lg="8">
                  <el-card shadow="hover" class="resource-card">
                    <div slot="header" class="card-header">
                      <span><i class="fa fa-money"></i> 预算分配</span>
                    </div>
                    <div ref="budgetChartRef" class="budget-chart"></div>
                    <div class="budget-summary">
                      <div class="budget-item">
                        <span class="budget-label">总预算</span>
                        <span class="budget-value">¥{{ formatNumber(budget.total) }}</span>
                      </div>
                      <div class="budget-item">
                        <span class="budget-label">已使用</span>
                        <span class="budget-value used">¥{{ formatNumber(budget.used) }}</span>
                      </div>
                      <div class="budget-item">
                        <span class="budget-label">剩余</span>
                        <span class="budget-value remaining">¥{{ formatNumber(budget.remaining) }}</span>
                      </div>
                    </div>
                  </el-card>
                </el-col>
              </el-row>
            </div>
          </el-tab-pane>

          <el-tab-pane label="时间表" name="timeline">
            <div class="timeline-panel">
              <div ref="ganttChartRef" class="gantt-chart"></div>
              <div class="timeline-legend">
                <span class="legend-item"><span class="legend-color completed"></span>已完成</span>
                <span class="legend-item"><span class="legend-color in-progress"></span>进行中</span>
                <span class="legend-item"><span class="legend-color pending"></span>待开始</span>
                <span class="legend-item"><span class="legend-color milestone"></span>里程碑</span>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="风险评估" name="risks">
            <div class="risks-panel">
              <el-card shadow="hover" class="risk-matrix-card">
                <div slot="header" class="card-header">
                  <span><i class="fa fa-th"></i> 风险矩阵</span>
                </div>
                <div ref="riskMatrixRef" class="risk-matrix"></div>
              </el-card>

              <el-card shadow="hover" class="risk-list-card">
                <div slot="header" class="card-header">
                  <span><i class="fa fa-list"></i> 风险清单</span>
                  <el-button type="primary" size="small" @click="handleAddRisk">
                    <i class="fa fa-plus"></i> 添加风险
                  </el-button>
                </div>
                <el-table :data="riskList" stripe style="width: 100%">
                  <el-table-column type="index" label="序号" width="60"></el-table-column>
                  <el-table-column prop="name" label="风险名称" width="180"></el-table-column>
                  <el-table-column prop="category" label="类别" width="120">
                    <template slot-scope="scope">
                      <el-tag size="small">{{ scope.row.category }}</el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="probability" label="发生概率" width="100">
                    <template slot-scope="scope">
                      <el-rate v-model="scope.row.probability" disabled :colors="['#99A9BF', '#F7BA2A', '#FF9900']"></el-rate>
                    </template>
                  </el-table-column>
                  <el-table-column prop="impact" label="影响程度" width="100">
                    <template slot-scope="scope">
                      <el-rate v-model="scope.row.impact" disabled :colors="['#99A9BF', '#F7BA2A', '#FF9900']"></el-rate>
                    </template>
                  </el-table-column>
                  <el-table-column prop="level" label="风险等级" width="100">
                    <template slot-scope="scope">
                      <el-tag :type="getRiskLevelType(scope.row.level)" size="small">{{ scope.row.level }}</el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="countermeasure" label="应对措施"></el-table-column>
                  <el-table-column prop="status" label="状态" width="100">
                    <template slot-scope="scope">
                      <el-tag :type="scope.row.status === 'handled' ? 'success' : 'warning'" size="small">
                        {{ scope.row.status === 'handled' ? '已应对' : '监控中' }}
                      </el-tag>
                    </template>
                  </el-table-column>
                </el-table>
              </el-card>
            </div>
          </el-tab-pane>

          <el-tab-pane label="进度跟踪" name="progress">
            <div class="progress-panel">
              <div class="progress-overview">
                <el-row :gutter="20">
                  <el-col :xs="24" :md="12">
                    <el-card shadow="hover">
                      <div slot="header" class="card-header">
                        <span><i class="fa fa-chart-pie"></i> 整体进度</span>
                      </div>
                      <div class="overall-progress">
                        <div class="progress-circle">
                          <el-progress type="circle" :percentage="overallProgress" :stroke-width="10" :width="150"></el-progress>
                        </div>
                        <div class="progress-details">
                          <div class="detail-item">
                            <span class="detail-label">已完成阶段</span>
                            <span class="detail-value">{{ completedPhases }}/{{ implementationPhases.length }}</span>
                          </div>
                          <div class="detail-item">
                            <span class="detail-label">完成任务</span>
                            <span class="detail-value">{{ completedTasks }}/{{ totalTasks }}</span>
                          </div>
                          <div class="detail-item">
                            <span class="detail-label">剩余工期</span>
                            <span class="detail-value">{{ remainingDays }}天</span>
                          </div>
                        </div>
                      </div>
                    </el-card>
                  </el-col>
                  <el-col :xs="24" :md="12">
                    <el-card shadow="hover">
                      <div slot="header" class="card-header">
                        <span><i class="fa fa-bar-chart"></i> 进度趋势</span>
                      </div>
                      <div ref="progressTrendRef" class="progress-trend-chart"></div>
                    </el-card>
                  </el-col>
                </el-row>
              </div>

              <el-card shadow="hover" class="milestone-card">
                <div slot="header" class="card-header">
                  <span><i class="fa fa-flag"></i> 里程碑管理</span>
                  <el-button type="primary" size="small" @click="handleAddMilestone">
                    <i class="fa fa-plus"></i> 添加里程碑
                  </el-button>
                </div>
                <el-table :data="milestones" stripe style="width: 100%">
                  <el-table-column type="index" label="序号" width="60"></el-table-column>
                  <el-table-column prop="name" label="里程碑名称" width="200"></el-table-column>
                  <el-table-column prop="date" label="计划日期" width="150">
                    <template slot-scope="scope">
                      {{ formatDate(scope.row.date) }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="status" label="状态" width="120">
                    <template slot-scope="scope">
                      <el-tag :type="getMilestoneStatusType(scope.row.status)" size="small">{{ getMilestoneStatusText(scope.row.status) }}</el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="description" label="说明"></el-table-column>
                  <el-table-column prop="actions" label="操作" width="150">
                    <template slot-scope="scope">
                      <el-button type="text" size="small" @click="handleEditMilestone(scope.row)">编辑</el-button>
                      <el-button type="text" size="small" @click="handleCompleteMilestone(scope.row)" :disabled="scope.row.status === 'completed'">完成</el-button>
                      <el-button type="text" size="small" @click="handleDeleteMilestone(scope.row)" class="danger-text">删除</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </el-card>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-card>

    <el-dialog title="添加风险" :visible.sync="riskDialogVisible" width="600px">
      <el-form :model="riskForm" label-width="100px">
        <el-form-item label="风险名称">
          <el-input v-model="riskForm.name" placeholder="请输入风险名称"></el-input>
        </el-form-item>
        <el-form-item label="风险类别">
          <el-select v-model="riskForm.category" placeholder="请选择风险类别">
            <el-option label="技术风险" value="technical"></el-option>
            <el-option label="资源风险" value="resource"></el-option>
            <el-option label="进度风险" value="schedule"></el-option>
            <el-option label="外部风险" value="external"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="发生概率">
          <el-rate v-model="riskForm.probability" :colors="['#99A9BF', '#F7BA2A', '#FF9900']"></el-rate>
        </el-form-item>
        <el-form-item label="影响程度">
          <el-rate v-model="riskForm.impact" :colors="['#99A9BF', '#F7BA2A', '#FF9900']"></el-rate>
        </el-form-item>
        <el-form-item label="应对措施">
          <el-input type="textarea" v-model="riskForm.countermeasure" rows="3" placeholder="请输入应对措施"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="riskDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveRisk">确定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="添加里程碑" :visible.sync="milestoneDialogVisible" width="500px">
      <el-form :model="milestoneForm" label-width="100px">
        <el-form-item label="里程碑名称">
          <el-input v-model="milestoneForm.name" placeholder="请输入里程碑名称"></el-input>
        </el-form-item>
        <el-form-item label="计划日期">
          <el-date-picker v-model="milestoneForm.date" type="date" placeholder="选择日期" style="width: 100%;"></el-date-picker>
        </el-form-item>
        <el-form-item label="说明">
          <el-input type="textarea" v-model="milestoneForm.description" rows="3" placeholder="请输入说明"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="milestoneDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveMilestone">确定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="新建实施计划" :visible.sync="newPlanDialogVisible" width="700px">
      <el-form :model="newPlanForm" label-width="120px">
        <el-form-item label="策略选择">
          <el-select v-model="newPlanForm.strategyId" placeholder="请选择策略" style="width: 100%;">
            <el-option
              v-for="strategy in strategyList"
              :key="strategy.id"
              :label="strategy.name"
              :value="strategy.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="计划名称">
          <el-input v-model="newPlanForm.name" placeholder="请输入计划名称"></el-input>
        </el-form-item>
        <el-form-item label="开始日期">
          <el-date-picker v-model="newPlanForm.startDate" type="date" placeholder="选择开始日期" style="width: 100%;"></el-date-picker>
        </el-form-item>
        <el-form-item label="计划工期">
          <el-input-number v-model="newPlanForm.duration" :min="1" :max="365" placeholder="请输入天数"></el-input-number>
          <span class="unit-label">天</span>
        </el-form-item>
        <el-form-item label="备注">
          <el-input type="textarea" v-model="newPlanForm.remark" rows="3" placeholder="请输入备注"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="newPlanDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCreatePlan">创建计划</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'StrategyImplementationPlan',
  data() {
    return {
      activeTab: 'phases',
      selectedStrategy: 'strategy_001',
      planOverview: {
        milestones: 8,
        resources: 12,
        risks: 5,
        duration: '45天'
      },
      strategyList: [
        { id: 'strategy_001', name: '候车大厅智能照明策略' },
        { id: 'strategy_002', name: '站台空调智能调节策略' },
        { id: 'strategy_003', name: '电梯运行优化策略' },
        { id: 'strategy_004', name: '站房通风系统优化策略' },
        { id: 'strategy_005', name: '照明与空调联动策略' }
      ],
      implementationPhases: [
        {
          name: '准备阶段',
          period: '第1-7天',
          status: 'completed',
          progress: 100,
          description: '完成项目启动、资源调配、技术准备等工作',
          tasks: [
            { name: '项目启动会议', owner: '项目经理', duration: 1, status: '已完成', progress: 100 },
            { name: '技术方案评审', owner: '技术负责人', duration: 2, status: '已完成', progress: 100 },
            { name: '资源调配确认', owner: '资源经理', duration: 2, status: '已完成', progress: 100 },
            { name: '设备采购招标', owner: '采购专员', duration: 3, status: '已完成', progress: 100 }
          ],
          deliverables: ['项目章程', '技术方案', '资源计划', '采购清单']
        },
        {
          name: '实施阶段',
          period: '第8-35天',
          status: 'in-progress',
          progress: 65,
          description: '完成设备安装、系统调试、集成测试等工作',
          tasks: [
            { name: '硬件设备安装', owner: '安装工程师', duration: 10, status: '进行中', progress: 80 },
            { name: '软件系统部署', owner: '开发工程师', duration: 7, status: '已完成', progress: 100 },
            { name: '系统联调测试', owner: '测试工程师', duration: 5, status: '进行中', progress: 60 },
            { name: '数据迁移导入', owner: '数据工程师', duration: 3, status: '已完成', progress: 100 },
            { name: '用户培训', owner: '培训讲师', duration: 3, status: '待开始', progress: 0 }
          ],
          deliverables: ['安装验收报告', '测试报告', '培训材料', '操作手册']
        },
        {
          name: '验收阶段',
          period: '第36-45天',
          status: 'pending',
          progress: 0,
          description: '完成系统验收、性能优化、正式上线等工作',
          tasks: [
            { name: '系统验收测试', owner: '测试工程师', duration: 3, status: '待开始', progress: 0 },
            { name: '性能优化调整', owner: '优化工程师', duration: 4, status: '待开始', progress: 0 },
            { name: '正式上线切换', owner: '运维工程师', duration: 2, status: '待开始', progress: 0 },
            { name: '运维交接', owner: '运维主管', duration: 2, status: '待开始', progress: 0 }
          ],
          deliverables: ['验收报告', '优化方案', '运维手册', '项目总结']
        }
      ],
      personnelResources: [
        { role: '项目经理', count: 1, allocation: 100, responsibility: '项目整体管理与协调' },
        { role: '技术负责人', count: 1, allocation: 100, responsibility: '技术方案设计与指导' },
        { role: '开发工程师', count: 3, allocation: 80, responsibility: '系统开发与部署' },
        { role: '测试工程师', count: 2, allocation: 60, responsibility: '系统测试与验收' },
        { role: '实施工程师', count: 4, allocation: 90, responsibility: '现场设备安装与调试' },
        { role: '培训讲师', count: 1, allocation: 30, responsibility: '用户培训与指导' }
      ],
      equipmentResources: [
        { name: '智能传感器', quantity: 150, unit: '个', availability: 100, specification: '温湿度、光照、人体感应三合一' },
        { name: '智能控制器', quantity: 45, unit: '台', availability: 100, specification: '支持DALI、0-10V调光协议' },
        { name: '数据采集器', quantity: 8, unit: '台', availability: 100, specification: '支持Modbus、OPC协议' },
        { name: '边缘计算网关', quantity: 3, unit: '台', availability: 80, specification: '本地数据处理与决策' },
        { name: '服务器', quantity: 2, unit: '台', availability: 100, specification: '双路至强，64GB内存' }
      ],
      budget: {
        total: 580000,
        used: 326000,
        remaining: 254000,
        categories: [
          { name: '设备采购', value: 280000, color: '#409EFF' },
          { name: '软件开发', value: 120000, color: '#67C23A' },
          { name: '实施服务', value: 80000, color: '#E6A23C' },
          { name: '培训费用', value: 30000, color: '#909399' },
          { name: '预留资金', value: 70000, color: '#F56C6C' }
        ]
      },
      riskList: [
        { name: '设备供应延迟', category: '资源风险', probability: 3, impact: 4, level: '高', countermeasure: '提前下单、备选供应商', status: 'handled' },
        { name: '技术方案变更', category: '技术风险', probability: 2, impact: 3, level: '中', countermeasure: '预留技术调整窗口', status: 'monitoring' },
        { name: '人员变动', category: '资源风险', probability: 2, impact: 2, level: '低', countermeasure: '完善文档、知识转移', status: 'handled' },
        { name: '工期紧张', category: '进度风险', probability: 3, impact: 3, level: '中', countermeasure: '并行作业、加班赶工', status: 'monitoring' },
        { name: '系统集成困难', category: '技术风险', probability: 2, impact: 4, level: '中', countermeasure: '提前联调、厂商支持', status: 'monitoring' }
      ],
      milestones: [
        { name: '项目启动', date: new Date('2025-01-06'), status: 'completed', description: '完成项目启动会议和团队组建' },
        { name: '技术方案确定', date: new Date('2025-01-13'), status: 'completed', description: '完成技术方案评审和确认' },
        { name: '设备到货', date: new Date('2025-01-20'), status: 'completed', description: '主要设备到货验收' },
        { name: '硬件安装完成', date: new Date('2025-02-03'), status: 'in-progress', description: '完成所有硬件设备的安装' },
        { name: '系统联调完成', date: new Date('2025-02-17'), status: 'pending', description: '完成系统联调测试' },
        { name: '用户培训完成', date: new Date('2025-02-24'), status: 'pending', description: '完成所有用户的培训' },
        { name: '系统验收', date: new Date('2025-03-03'), status: 'pending', description: '完成系统验收测试' },
        { name: '正式上线', date: new Date('2025-03-10'), status: 'pending', description: '系统正式上线运行' }
      ],
      riskDialogVisible: false,
      riskForm: {
        name: '',
        category: '',
        probability: 0,
        impact: 0,
        countermeasure: ''
      },
      milestoneDialogVisible: false,
      milestoneForm: {
        name: '',
        date: '',
        description: ''
      },
      newPlanDialogVisible: false,
      newPlanForm: {
        strategyId: '',
        name: '',
        startDate: '',
        duration: 30,
        remark: ''
      },
      budgetChart: null,
      ganttChart: null,
      riskMatrixChart: null,
      progressTrendChart: null,
      chartsInitialized: false
    }
  },
  computed: {
    completedPhases() {
      return this.implementationPhases.filter(phase => phase.status === 'completed').length
    },
    completedTasks() {
      return this.implementationPhases.reduce((sum, phase) => {
        return sum + phase.tasks.filter(task => task.status === '已完成').length
      }, 0)
    },
    totalTasks() {
      return this.implementationPhases.reduce((sum, phase) => {
        return sum + phase.tasks.length
      }, 0)
    },
    remainingDays() {
      return 45 - Math.floor((new Date() - new Date('2025-01-06')) / (1000 * 60 * 60 * 24))
    },
    overallProgress() {
      const totalPhases = this.implementationPhases.length
      const phaseProgress = this.implementationPhases.reduce((sum, phase) => sum + phase.progress, 0)
      return Math.round(phaseProgress / totalPhases)
    }
  },
  mounted() {
    this.initCharts()
  },
  beforeUnmount() {
    this.disposeCharts()
  },
  beforeDestroy() {
    this.disposeCharts()
  },
  methods: {
    disposeCharts() {
      if (this.budgetChart) {
        this.budgetChart.dispose()
        this.budgetChart = null
      }
      if (this.ganttChart) {
        this.ganttChart.dispose()
        this.ganttChart = null
      }
      if (this.riskMatrixChart) {
        this.riskMatrixChart.dispose()
        this.riskMatrixChart = null
      }
      if (this.progressTrendChart) {
        this.progressTrendChart.dispose()
        this.progressTrendChart = null
      }
      this.chartsInitialized = false
    },
    initCharts() {
      if (this.chartsInitialized) {
        this.disposeCharts()
      }
      this.$nextTick(() => {
        this.initBudgetChart()
        this.initGanttChart()
        this.initRiskMatrix()
        this.initProgressTrendChart()
        this.chartsInitialized = true
      })
    },
    initBudgetChart() {
      const chartDom = this.$refs.budgetChartRef
      if (!chartDom) return
      this.disposeCharts()
      this.budgetChart = echarts.init(chartDom)
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{b}: ¥{c} ({d}%)'
        },
        series: [{
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 14,
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: this.budget.categories
        }]
      }
      this.budgetChart.setOption(option)
    },
    initGanttChart() {
      const chartDom = this.$refs.ganttChartRef
      if (!chartDom) return
      this.disposeCharts()
      this.ganttChart = echarts.init(chartDom)
      
      const categories = ['准备阶段', '实施阶段', '验收阶段']
      const data = [
        { name: '准备阶段', start: 0, duration: 7, status: 'completed' },
        { name: '实施阶段-硬件安装', start: 7, duration: 10, status: 'in-progress' },
        { name: '实施阶段-软件部署', start: 7, duration: 7, status: 'completed' },
        { name: '实施阶段-联调测试', start: 14, duration: 5, status: 'in-progress' },
        { name: '实施阶段-数据迁移', start: 17, duration: 3, status: 'completed' },
        { name: '实施阶段-用户培训', start: 25, duration: 3, status: 'pending' },
        { name: '验收阶段-系统验收', start: 35, duration: 3, status: 'pending' },
        { name: '验收阶段-性能优化', start: 38, duration: 4, status: 'pending' },
        { name: '验收阶段-正式上线', start: 42, duration: 2, status: 'pending' }
      ]
      
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          formatter: params => {
            const item = params[0]
            return `${item.name}<br/>时间: 第${item.value[1]}天 - 第${item.value[1] + item.value[2]}天`
          }
        },
        grid: {
          left: '120px',
          right: '40px',
          top: '40px',
          bottom: '40px'
        },
        xAxis: {
          type: 'value',
          min: 0,
          max: 45,
          interval: 5,
          axisLabel: {
            formatter: value => `第${value}天`
          }
        },
        yAxis: {
          type: 'category',
          data: categories,
          inverse: true
        },
        series: [{
          type: 'custom',
          renderItem: (params, api) => {
            const categoryIndex = api.value(0)
            const start = api.coord([api.value(1), categoryIndex])
            const end = api.coord([api.value(1) + api.value(2), categoryIndex])
            const height = api.size([0, 1])[1] * 0.6
            
            const statusColors = {
              'completed': '#67C23A',
              'in-progress': '#409EFF',
              'pending': '#C0C4CC'
            }
            
            return {
              type: 'rect',
              shape: {
                x: start[0],
                y: start[1] - height / 2,
                width: end[0] - start[0],
                height: height,
                r: 4
              },
              style: {
                fill: statusColors[api.value(3)] || '#409EFF'
              }
            }
          },
          encode: {
            x: [1, 2],
            y: 0
          },
          data: data.map(item => [categories.indexOf(item.name.split('-')[0]), item.start, item.duration, item.status])
        }]
      }
      this.ganttChart.setOption(option)
    },
    initRiskMatrix() {
      const chartDom = this.$refs.riskMatrixRef
      if (!chartDom) return
      this.disposeCharts()
      this.riskMatrixChart = echarts.init(chartDom)
      
      const riskData = [
        { name: '设备供应延迟', probability: 3, impact: 4 },
        { name: '技术方案变更', probability: 2, impact: 3 },
        { name: '人员变动', probability: 2, impact: 2 },
        { name: '工期紧张', probability: 3, impact: 3 },
        { name: '系统集成困难', probability: 2, impact: 4 }
      ]
      
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: params => {
            if (params.data[2]) {
              return `${params.data[2]}<br/>概率: ${params.data[0]}<br/>影响: ${params.data[1]}`
            }
            return ''
          }
        },
        grid: {
          left: '60px',
          right: '40px',
          top: '40px',
          bottom: '60px'
        },
        xAxis: {
          type: 'value',
          min: 0,
          max: 5,
          interval: 1,
          name: '发生概率',
          nameLocation: 'middle',
          nameGap: 35
        },
        yAxis: {
          type: 'value',
          min: 0,
          max: 5,
          interval: 1,
          name: '影响程度',
          nameLocation: 'middle',
          nameGap: 45
        },
        series: [{
          type: 'scatter',
          symbolSize: 20,
          data: riskData.map(item => [item.probability, item.impact, item.name]),
          itemStyle: {
            color: params => {
              const score = params.data[0] * params.data[1]
              if (score >= 12) return '#F56C6C'
              if (score >= 8) return '#E6A23C'
              return '#67C23A'
            }
          },
          label: {
            show: true,
            formatter: params => params.data[2],
            position: 'right',
            fontSize: 12
          }
        }]
      }
      this.riskMatrixChart.setOption(option)
    },
    initProgressTrendChart() {
      const chartDom = this.$refs.progressTrendRef
      if (!chartDom) return
      this.disposeCharts()
      this.progressTrendChart = echarts.init(chartDom)
      
      const dates = []
      const progress = []
      for (let i = 1; i <= 15; i++) {
        dates.push(`1月${i}日`)
        progress.push(Math.round((i / 15) * 75 + Math.random() * 10))
      }
      
      const option = {
        tooltip: {
          trigger: 'axis'
        },
        grid: {
          left: '50px',
          right: '20px',
          top: '20px',
          bottom: '40px'
        },
        xAxis: {
          type: 'category',
          data: dates
        },
        yAxis: {
          type: 'value',
          min: 0,
          max: 100,
          axisLabel: {
            formatter: '{value}%'
          }
        },
        series: [{
          data: progress,
          type: 'line',
          smooth: true,
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [{
                offset: 0, color: 'rgba(64, 158, 255, 0.3)'
              }, {
                offset: 1, color: 'rgba(64, 158, 255, 0.05)'
              }]
            }
          },
          lineStyle: {
            color: '#409EFF'
          },
          itemStyle: {
            color: '#409EFF'
          }
        }]
      }
      this.progressTrendChart.setOption(option)
    },
    getPhaseStatusType(status) {
      const types = {
        'completed': 'success',
        'in-progress': 'primary',
        'pending': 'info'
      }
      return types[status] || 'info'
    },
    getPhaseStatusText(status) {
      const texts = {
        'completed': '已完成',
        'in-progress': '进行中',
        'pending': '待开始'
      }
      return texts[status] || '未知'
    },
    getTaskStatusType(status) {
      const types = {
        '已完成': 'success',
        '进行中': 'primary',
        '待开始': 'info'
      }
      return types[status] || 'info'
    },
    getRiskLevelType(level) {
      const types = {
        '高': 'danger',
        '中': 'warning',
        '低': 'info'
      }
      return types[level] || 'info'
    },
    getMilestoneStatusType(status) {
      const types = {
        'completed': 'success',
        'in-progress': 'warning',
        'pending': 'info'
      }
      return types[status] || 'info'
    },
    getMilestoneStatusText(status) {
      const texts = {
        'completed': '已完成',
        'in-progress': '进行中',
        'pending': '待开始'
      }
      return texts[status] || '未知'
    },
    formatNumber(num) {
      return num.toLocaleString()
    },
    formatDate(date) {
      if (!date) return ''
      return new Date(date).toLocaleDateString('zh-CN')
    },
    handleAddRisk() {
      this.riskForm = {
        name: '',
        category: '',
        probability: 0,
        impact: 0,
        countermeasure: ''
      }
      this.riskDialogVisible = true
    },
    handleSaveRisk() {
      if (!this.riskForm.name || !this.riskForm.category) {
        this.$message.warning('请填写完整信息')
        return
      }
      const level = this.riskForm.probability * this.riskForm.impact
      this.riskList.push({
        name: this.riskForm.name,
        category: this.riskForm.category === 'technical' ? '技术风险' : this.riskForm.category === 'resource' ? '资源风险' : this.riskForm.category === 'schedule' ? '进度风险' : '外部风险',
        probability: this.riskForm.probability,
        impact: this.riskForm.impact,
        level: level >= 12 ? '高' : level >= 8 ? '中' : '低',
        countermeasure: this.riskForm.countermeasure,
        status: 'monitoring'
      })
      this.riskDialogVisible = false
      this.$message.success('风险添加成功')
    },
    handleAddMilestone() {
      this.milestoneForm = {
        name: '',
        date: '',
        description: ''
      }
      this.milestoneDialogVisible = true
    },
    handleEditMilestone(row) {
      this.milestoneForm = { ...row }
      this.milestoneDialogVisible = true
    },
    handleSaveMilestone() {
      if (!this.milestoneForm.name || !this.milestoneForm.date) {
        this.$message.warning('请填写完整信息')
        return
      }
      const index = this.milestones.findIndex(m => m.name === this.milestoneForm.name)
      if (index >= 0) {
        this.milestones[index] = { ...this.milestoneForm }
      } else {
        this.milestones.push({
          ...this.milestoneForm,
          status: 'pending'
        })
      }
      this.milestoneDialogVisible = false
      this.$message.success('里程碑保存成功')
    },
    handleCompleteMilestone(row) {
      row.status = 'completed'
      this.$message.success('里程碑已完成')
    },
    handleDeleteMilestone(row) {
      this.$confirm('确定要删除该里程碑吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const index = this.milestones.indexOf(row)
        if (index >= 0) {
          this.milestones.splice(index, 1)
        }
        this.$message.success('删除成功')
      })
    },
    handleNewPlan() {
      this.newPlanForm = {
        strategyId: '',
        name: '',
        startDate: '',
        duration: 30,
        remark: ''
      }
      this.newPlanDialogVisible = true
    },
    handleCreatePlan() {
      if (!this.newPlanForm.strategyId || !this.newPlanForm.name) {
        this.$message.warning('请填写完整信息')
        return
      }
      this.newPlanDialogVisible = false
      this.$message.success('实施计划创建成功')
    },
    handleExportPlan() {
      this.$message.info('正在导出实施计划...')
      setTimeout(() => {
        this.$message.success('实施计划导出成功')
      }, 1500)
    },
    handleRefresh() {
      this.$message.info('正在刷新数据...')
      setTimeout(() => {
        this.$message.success('数据已刷新')
      }, 1000)
    }
  }
}
</script>

<style scoped>
.strategy-implementation-plan-container {
  padding: 20px;
  background-color: #f5f7fa;
}

.plan-card {
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
}

.plan-overview {
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

.plan-tabs {
  margin-top: 20px;
}

.phases-panel {
  padding: 10px;
}

.phase-card {
  margin-bottom: 10px;
}

.phase-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.phase-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.phase-name {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.phase-progress {
  display: flex;
  align-items: center;
  gap: 10px;
}

.progress-label {
  font-size: 14px;
  color: #606266;
}

.phase-content {
  padding: 10px 0;
}

.phase-description {
  color: #606266;
  margin-bottom: 15px;
  line-height: 1.6;
}

.phase-tasks h5,
.phase-deliverables h5 {
  margin: 15px 0 10px;
  font-size: 14px;
  color: #303133;
}

.phase-tasks h5 i,
.phase-deliverables h5 i {
  margin-right: 6px;
  color: #409EFF;
}

.deliverable-tag {
  margin-right: 8px;
  margin-bottom: 8px;
}

.resources-panel {
  padding: 10px;
}

.resource-card {
  margin-bottom: 20px;
}

.resource-content {
  padding: 10px;
}

.resource-item {
  margin-bottom: 20px;
}

.resource-item:last-child {
  margin-bottom: 0;
}

.resource-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.resource-name {
  font-weight: 600;
  color: #303133;
}

.resource-count {
  color: #409EFF;
  font-weight: 600;
}

.resource-detail {
  font-size: 12px;
  color: #909399;
  margin-top: 6px;
}

.budget-chart {
  height: 200px;
}

.budget-summary {
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 8px;
  margin-top: 15px;
}

.budget-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #ebeef5;
}

.budget-item:last-child {
  border-bottom: none;
}

.budget-label {
  color: #606266;
}

.budget-value {
  font-weight: 600;
  color: #303133;
}

.budget-value.used {
  color: #E6A23C;
}

.budget-value.remaining {
  color: #67C23A;
}

.timeline-panel {
  padding: 10px;
}

.gantt-chart {
  height: 400px;
}

.timeline-legend {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 15px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #606266;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
}

.legend-color.completed {
  background-color: #67C23A;
}

.legend-color.in-progress {
  background-color: #409EFF;
}

.legend-color.pending {
  background-color: #C0C4CC;
}

.legend-color.milestone {
  background-color: #F56C6C;
}

.risks-panel {
  padding: 10px;
}

.risk-matrix-card,
.risk-list-card {
  margin-bottom: 20px;
}

.risk-matrix {
  height: 350px;
}

.danger-text {
  color: #F56C6C;
}

.progress-panel {
  padding: 10px;
}

.progress-overview {
  margin-bottom: 20px;
}

.overall-progress {
  display: flex;
  align-items: center;
  padding: 20px;
}

.progress-circle {
  margin-right: 30px;
}

.progress-details {
  flex: 1;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #ebeef5;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  color: #606266;
}

.detail-value {
  font-weight: 600;
  color: #303133;
}

.progress-trend-chart {
  height: 250px;
}

.milestone-card {
  margin-top: 20px;
}

.unit-label {
  margin-left: 10px;
  color: #606266;
}

@media (max-width: 768px) {
  .strategy-implementation-plan-container {
    padding: 10px;
  }

  .header-actions {
    flex-wrap: wrap;
    gap: 8px;
  }

  .overall-progress {
    flex-direction: column;
    text-align: center;
  }

  .progress-circle {
    margin-right: 0;
    margin-bottom: 20px;
  }

  .progress-details {
    text-align: left;
  }
}
</style>
