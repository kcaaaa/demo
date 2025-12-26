<template>
  <div class="strategy-impact-analysis-container">
    <el-card shadow="hover" class="analysis-card">
      <div slot="header" class="card-header">
        <h3 class="card-title">
          <i class="fa fa-search"></i> 策略影响范围分析
        </h3>
        <div class="header-actions">
          <el-button size="small" @click="handleReset">
            <i class="fa fa-refresh"></i> 重置筛选
          </el-button>
          <el-button type="primary" size="small" @click="handleAnalyze" :loading="analyzing">
            <i class="fa fa-bar-chart"></i> 开始分析
          </el-button>
        </div>
      </div>

      <div class="analysis-settings">
        <el-row :gutter="20">
          <el-col :xs="24" :lg="16">
            <el-card shadow="hover" class="settings-card">
              <div slot="header" class="card-header">
                <span><i class="fa fa-filter"></i> 分析条件设置</span>
              </div>
              <el-form :model="analysisForm" label-width="100px" size="small">
                <el-row :gutter="20">
                  <el-col :xs="24" :sm="12" :md="8">
                    <el-form-item label="车站">
                      <el-select v-model="analysisForm.station" placeholder="请选择车站" clearable style="width: 100%;">
                        <el-option v-for="item in stationOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="12" :md="8">
                    <el-form-item label="策略类型">
                      <el-select v-model="analysisForm.strategyType" placeholder="请选择策略类型" clearable style="width: 100%;">
                        <el-option label="照明系统" value="lighting"></el-option>
                        <el-option label="空调系统" value="airConditioning"></el-option>
                        <el-option label="智能控制" value="smartControl"></el-option>
                        <el-option label="综合节能" value="comprehensive"></el-option>
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="12" :md="8">
                    <el-form-item label="分析维度">
                      <el-select v-model="analysisForm.analysisDimension" placeholder="请选择分析维度" style="width: 100%;">
                        <el-option label="区域维度" value="area"></el-option>
                        <el-option label="设备维度" value="equipment"></el-option>
                        <el-option label="系统维度" value="system"></el-option>
                        <el-option label="全维度" value="all"></el-option>
                      </el-select>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :xs="24" :sm="12" :md="8">
                    <el-form-item label="时间范围">
                      <el-date-picker v-model="analysisForm.timeRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" style="width: 100%;"></el-date-picker>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="12" :md="8">
                    <el-form-item label="策略名称">
                      <el-input v-model="analysisForm.strategyName" placeholder="请输入策略名称" clearable></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="12" :md="8">
                    <el-form-item label="影响程度">
                      <el-select v-model="analysisForm.impactLevel" placeholder="请选择影响程度" clearable style="width: 100%;">
                        <el-option label="高影响" value="high"></el-option>
                        <el-option label="中影响" value="medium"></el-option>
                        <el-option label="低影响" value="low"></el-option>
                      </el-select>
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-form>
            </el-card>
          </el-col>
          <el-col :xs="24" :lg="8">
            <el-card shadow="hover" class="quick-stats-card">
              <div slot="header" class="card-header">
                <span><i class="fa fa-tachometer"></i> 快速统计</span>
              </div>
              <div class="stats-grid">
                <div class="stat-item">
                  <div class="stat-value">{{ impactStats.affectedAreas }}</div>
                  <div class="stat-label">影响区域数</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">{{ impactStats.affectedEquipment }}</div>
                  <div class="stat-label">影响设备数</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">{{ impactStats.avgImpactScore }}</div>
                  <div class="stat-label">平均影响度</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">{{ impactStats.totalSavings }}%</div>
                  <div class="stat-label">预期节能率</div>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <div v-if="analysisResult" class="analysis-results">
        <el-row :gutter="20">
          <el-col :xs="24" :lg="12">
            <el-card shadow="hover" class="chart-card">
              <div slot="header" class="card-header">
                <span><i class="fa fa-pie-chart"></i> 区域影响分布</span>
              </div>
              <div ref="areaChartRef" class="chart-container"></div>
            </el-card>
          </el-col>
          <el-col :xs="24" :lg="12">
            <el-card shadow="hover" class="chart-card">
              <div slot="header" class="card-header">
                <span><i class="fa fa-bar-chart"></i> 设备影响排名</span>
              </div>
              <div ref="equipmentChartRef" class="chart-container"></div>
            </el-card>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :xs="24" :lg="16">
            <el-card shadow="hover" class="table-card">
              <div slot="header" class="card-header">
                <span><i class="fa fa-list"></i> 详细影响数据</span>
                <div class="header-actions">
                  <el-button size="mini" @click="handleExportData">
                    <i class="fa fa-download"></i> 导出数据
                  </el-button>
                </div>
              </div>
              <el-table :data="impactDetails" stripe style="width: 100%;" max-height="400">
                <el-table-column prop="area" label="影响区域" width="120"></el-table-column>
                <el-table-column prop="equipment" label="影响设备" width="150"></el-table-column>
                <el-table-column prop="system" label="所属系统" width="120"></el-table-column>
                <el-table-column prop="impactScore" label="影响度" width="100">
                  <template slot-scope="scope">
                    <el-tag :type="getImpactTagType(scope.row.impactScore)" size="small">
                      {{ scope.row.impactScore }}%
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="energySavings" label="节能效果" width="100">
                  <template slot-scope="scope">
                    <span class="savings-text">-{{ scope.row.energySavings }}%</span>
                  </template>
                </el-table-column>
                <el-table-column prop="costInvestment" label="投资成本" width="100">
                  <template slot-scope="scope">¥{{ scope.row.costInvestment.toLocaleString() }}</template>
                </el-table-column>
                <el-table-column prop="roi" label="投资回报" width="100">
                  <template slot-scope="scope">
                    <span class="roi-text">{{ scope.row.roi }}个月</span>
                  </template>
                </el-table-column>
                <el-table-column prop="status" label="状态" width="100">
                  <template slot-scope="scope">
                    <el-tag :type="scope.row.status === 'active' ? 'success' : 'info'" size="small">
                      {{ scope.row.status === 'active' ? '已生效' : '待生效' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="120" fixed="right">
                  <template slot-scope="scope">
                    <el-button type="text" size="mini" @click="handleViewDetail(scope.row)">
                      <i class="fa fa-eye"></i> 查看
                    </el-button>
                    <el-button type="text" size="mini" @click="handleAdjust(scope.row)">
                      <i class="fa fa-cog"></i> 调整
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </el-col>
          <el-col :xs="24" :lg="8">
            <el-card shadow="hover" class="heatmap-card">
              <div slot="header" class="card-header">
                <span><i class="fa fa-th"></i> 影响热力图</span>
              </div>
              <div ref="heatmapRef" class="chart-container"></div>
            </el-card>
          </el-col>
        </el-row>

        <el-card shadow="hover" class="summary-card">
          <div slot="header" class="card-header">
            <span><i class="fa fa-file-text-o"></i> 影响分析总结</span>
          </div>
          <div class="summary-content">
            <el-row :gutter="20">
              <el-col :xs="24" :md="8">
                <div class="summary-item">
                  <div class="summary-icon positive">
                    <i class="fa fa-arrow-up"></i>
                  </div>
                  <div class="summary-text">
                    <div class="summary-value">+{{ analysisResult.positiveImpacts }}</div>
                    <div class="summary-label">正向影响项</div>
                  </div>
                </div>
              </el-col>
              <el-col :xs="24" :md="8">
                <div class="summary-item">
                  <div class="summary-icon neutral">
                    <i class="fa fa-minus"></i>
                  </div>
                  <div class="summary-text">
                    <div class="summary-value">{{ analysisResult.neutralImpacts }}</div>
                    <div class="summary-label">中性影响项</div>
                  </div>
                </div>
              </el-col>
              <el-col :xs="24" :md="8">
                <div class="summary-item">
                  <div class="summary-icon warning">
                    <i class="fa fa-exclamation-triangle"></i>
                  </div>
                  <div class="summary-text">
                    <div class="summary-value">{{ analysisResult.riskItems }}</div>
                    <div class="summary-label">风险预警项</div>
                  </div>
                </div>
              </el-col>
            </el-row>
            <el-divider></el-divider>
            <div class="recommendation-section">
              <h4><i class="fa fa-lightbulb-o"></i> 优化建议</h4>
              <ul class="recommendation-list">
                <li v-for="(rec, index) in analysisResult.recommendations" :key="index">
                  <span class="rec-icon" :class="rec.type">
                    <i :class="[rec.type === 'success' ? 'fa fa-check-circle' : rec.type === 'warning' ? 'fa fa-exclamation-circle' : 'fa fa-info-circle']"></i>
                  </span>
                  <span class="rec-text">{{ rec.text }}</span>
                </li>
              </ul>
            </div>
          </div>
        </el-card>
      </div>

      <div v-else class="empty-state">
        <div class="empty-icon">
          <i class="fa fa-search"></i>
        </div>
        <div class="empty-text">
          <h4>设置分析条件，开始策略影响分析</h4>
          <p>选择车站、策略类型和分析维度后，点击"开始分析"按钮</p>
        </div>
      </div>
    </el-card>

    <el-dialog title="影响详情" :visible.sync="detailDialogVisible" width="600px">
      <div v-if="selectedDetail" class="detail-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="影响区域">{{ selectedDetail.area }}</el-descriptions-item>
          <el-descriptions-item label="影响设备">{{ selectedDetail.equipment }}</el-descriptions-item>
          <el-descriptions-item label="所属系统">{{ selectedDetail.system }}</el-descriptions-item>
          <el-descriptions-item label="影响度">{{ selectedDetail.impactScore }}%</el-descriptions-item>
          <el-descriptions-item label="节能效果">-{{ selectedDetail.energySavings }}%</el-descriptions-item>
          <el-descriptions-item label="投资成本">¥{{ selectedDetail.costInvestment.toLocaleString() }}</el-descriptions-item>
          <el-descriptions-item label="投资回报">{{ selectedDetail.roi }}个月</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="selectedDetail.status === 'active' ? 'success' : 'info'" size="small">
              {{ selectedDetail.status === 'active' ? '已生效' : '待生效' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="影响描述" :span="2">{{ selectedDetail.description }}</el-descriptions-item>
          <el-descriptions-item label="优化建议" :span="2">{{ selectedDetail.optimizationSuggestion }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="handleAdjust(selectedDetail)">调整参数</el-button>
      </span>
    </el-dialog>

    <el-dialog title="参数调整" :visible.sync="adjustDialogVisible" width="500px">
      <div v-if="selectedDetail">
        <el-form :model="adjustForm" label-width="100px" size="small">
          <el-form-item label="影响区域">
            <el-input :value="selectedDetail.area" disabled></el-input>
          </el-form-item>
          <el-form-item label="影响设备">
            <el-input :value="selectedDetail.equipment" disabled></el-input>
          </el-form-item>
          <el-form-item label="影响度调整">
            <el-slider v-model="adjustForm.impactScore" :min="0" :max="100" show-input></el-slider>
          </el-form-item>
          <el-form-item label="调整原因">
            <el-input type="textarea" v-model="adjustForm.reason" rows="3" placeholder="请输入调整原因"></el-input>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="adjustDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveAdjust">保存调整</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'StrategyImpactAnalysis',
  data() {
    return {
      analyzing: false,
      analysisForm: {
        station: '',
        strategyType: '',
        analysisDimension: 'all',
        timeRange: [],
        strategyName: '',
        impactLevel: ''
      },
      stationOptions: [
        { label: '北京南站', value: 'BJ' },
        { label: '上海虹桥站', value: 'SH' },
        { label: '广州南站', value: 'GZ' },
        { label: '深圳北站', value: 'SZ' },
        { label: '杭州东站', value: 'HZ' },
        { label: '成都东站', value: 'CD' }
      ],
      impactStats: {
        affectedAreas: 12,
        affectedEquipment: 48,
        avgImpactScore: 72,
        totalSavings: 15.8
      },
      analysisResult: null,
      impactDetails: [],
      detailDialogVisible: false,
      adjustDialogVisible: false,
      selectedDetail: null,
      adjustForm: {
        impactScore: 50,
        reason: ''
      },
      areaChart: null,
      equipmentChart: null,
      heatmapChart: null
    }
  },
  mounted() {
    this.initCharts()
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
      if (this.areaChart) {
        this.areaChart.resize()
      }
      if (this.equipmentChart) {
        this.equipmentChart.resize()
      }
      if (this.heatmapChart) {
        this.heatmapChart.resize()
      }
    },
    disposeCharts() {
      if (this.areaChart) {
        this.areaChart.dispose()
        this.areaChart = null
      }
      if (this.equipmentChart) {
        this.equipmentChart.dispose()
        this.equipmentChart = null
      }
      if (this.heatmapChart) {
        this.heatmapChart.dispose()
        this.heatmapChart = null
      }
    },
    initCharts() {
      this.$nextTick(() => {
        this.initAreaChart()
        this.initEquipmentChart()
        this.initHeatmapChart()
      })
    },
    initAreaChart() {
      if (this.$refs.areaChartRef) {
        this.areaChart = echarts.init(this.$refs.areaChartRef)
        const option = {
          tooltip: {
            trigger: 'item',
            formatter: '{b}: {c} ({d}%)'
          },
          legend: {
            orient: 'vertical',
            right: 10,
            top: 'center'
          },
          series: [{
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 8,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 16,
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: [
              { value: 35, name: '候车大厅', itemStyle: { color: '#409EFF' } },
              { value: 25, name: '站台区域', itemStyle: { color: '#722ED1' } },
              { value: 20, name: '办公区域', itemStyle: { color: '#52C41A' } },
              { value: 12, name: '商业区', itemStyle: { color: '#FAAD14' } },
              { value: 8, name: '地下停车场', itemStyle: { color: '#F5222D' } }
            ]
          }]
        }
        this.areaChart.setOption(option)
      }
    },
    initEquipmentChart() {
      if (this.$refs.equipmentChartRef) {
        this.equipmentChart = echarts.init(this.$refs.equipmentChartRef)
        const option = {
          tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' }
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          xAxis: {
            type: 'value',
            max: 100
          },
          yAxis: {
            type: 'category',
            data: ['智能照明', '空调机组', '电梯系统', '扶梯系统', '新风系统', '给排水']
          },
          series: [{
            type: 'bar',
            data: [85, 78, 72, 68, 65, 58],
            itemStyle: {
              color: function(params) {
                const colors = ['#409EFF', '#722ED1', '#52C41A', '#FAAD14', '#F5222D', '#13C2C2']
                return colors[params.dataIndex % colors.length]
              },
              borderRadius: [0, 4, 4, 0]
            },
            barWidth: '60%'
          }]
        }
        this.equipmentChart.setOption(option)
      }
    },
    initHeatmapChart() {
      if (this.$refs.heatmapRef) {
        this.heatmapChart = echarts.init(this.$refs.heatmapRef)
        const hours = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00']
        const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
        const data = []
        for (let i = 0; i < 7; i++) {
          for (let j = 0; j < 6; j++) {
            data.push([i, j, Math.floor(Math.random() * 100)])
          }
        }
        const option = {
          tooltip: {
            position: 'top'
          },
          grid: {
            height: '70%',
            top: '10%'
          },
          xAxis: {
            type: 'category',
            data: hours,
            splitArea: { show: true }
          },
          yAxis: {
            type: 'category',
            data: days,
            splitArea: { show: true }
          },
          visualMap: {
            min: 0,
            max: 100,
            calculable: true,
            orient: 'horizontal',
            left: 'center',
            bottom: '0%',
            inRange: {
              color: ['#F5F7FA', '#409EFF']
            }
          },
          series: [{
            type: 'heatmap',
            data: data,
            label: { show: true },
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }]
        }
        this.heatmapChart.setOption(option)
      }
    },
    handleReset() {
      this.analysisForm = {
        station: '',
        strategyType: '',
        analysisDimension: 'all',
        timeRange: [],
        strategyName: '',
        impactLevel: ''
      }
      this.analysisResult = null
      this.$message.success('筛选条件已重置')
    },
    handleAnalyze() {
      this.analyzing = true
      setTimeout(() => {
        this.analysisResult = {
          positiveImpacts: 28,
          neutralImpacts: 15,
          riskItems: 5,
          recommendations: [
            { type: 'success', text: '候车大厅照明策略影响效果显著，建议推广至其他车站' },
            { type: 'warning', text: '空调系统在高负荷时段影响度较高，建议优化控制策略' },
            { type: 'info', text: '地下停车场设备影响度较低，可考虑调整策略优先级' }
          ]
        }
        this.impactDetails = this.generateImpactDetails()
        this.updateCharts()
        this.analyzing = false
        this.$message.success('分析完成！')
      }, 1500)
    },
    generateImpactDetails() {
      const areas = ['候车大厅', '站台区域', '办公区域', '商业区', '地下停车场', '地铁换乘']
      const equipment = ['LED照明灯具', '空调机组', '电梯电机', '扶梯电机', '新风机组', '水泵']
      const systems = ['照明系统', '空调系统', '运输系统', '通风系统', '给排水系统']
      const details = []
      for (let i = 0; i < 24; i++) {
        const area = areas[i % areas.length]
        const eq = equipment[i % equipment.length]
        const sys = systems[i % systems.length]
        const impactScore = Math.floor(Math.random() * 50) + 50
        details.push({
          id: i + 1,
          area: area,
          equipment: eq,
          system: sys,
          impactScore: impactScore,
          energySavings: (Math.random() * 20 + 5).toFixed(1),
          costInvestment: Math.floor(Math.random() * 50000) + 10000,
          roi: Math.floor(Math.random() * 12) + 3,
          status: impactScore > 70 ? 'active' : 'pending',
          description: `${area}${eq}受策略影响，影响度${impactScore}%，预计节能${(Math.random() * 20 + 5).toFixed(1)}%`,
          optimizationSuggestion: impactScore > 80 ? '建议适当降低影响度，避免过度调节影响用户体验' : '建议优化参数配置，提高节能效果'
        })
      }
      return details
    },
    updateCharts() {
      if (this.areaChart) {
        this.areaChart.setOption({
          series: [{
            data: [
              { value: 35, name: '候车大厅', itemStyle: { color: '#409EFF' } },
              { value: 25, name: '站台区域', itemStyle: { color: '#722ED1' } },
              { value: 20, name: '办公区域', itemStyle: { color: '#52C41A' } },
              { value: 12, name: '商业区', itemStyle: { color: '#FAAD14' } },
              { value: 8, name: '地下停车场', itemStyle: { color: '#F5222D' } }
            ]
          }]
        })
      }
      if (this.equipmentChart) {
        this.equipmentChart.setOption({
          series: [{
            data: [85, 78, 72, 68, 65, 58]
          }]
        })
      }
    },
    handleExportData() {
      this.$message.success('数据导出中...')
      setTimeout(() => {
        this.$message.success('数据已导出！')
      }, 1000)
    },
    handleViewDetail(row) {
      this.selectedDetail = row
      this.detailDialogVisible = true
    },
    handleAdjust(row) {
      this.selectedDetail = row
      this.adjustForm = {
        impactScore: row.impactScore,
        reason: ''
      }
      this.adjustDialogVisible = true
    },
    handleSaveAdjust() {
      this.$message.success('参数调整已保存！')
      this.adjustDialogVisible = false
    },
    getImpactTagType(score) {
      if (score >= 80) return 'danger'
      if (score >= 60) return 'warning'
      return 'success'
    }
  }
}
</script>

<style scoped>
.energy-strategy-container,
.strategy-impact-analysis-container {
  padding: 0;
}

.analysis-card {
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
  color: #1D2129;
}

.card-title i {
  margin-right: 8px;
  color: #409EFF;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.analysis-settings {
  margin-bottom: 20px;
}

.settings-card,
.quick-stats-card {
  height: 100%;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.stat-item {
  text-align: center;
  padding: 15px;
  background: linear-gradient(135deg, #F5F7FA 0%, #E6F7FF 100%);
  border-radius: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #409EFF;
  line-height: 1.2;
}

.stat-label {
  font-size: 12px;
  color: #86909C;
  margin-top: 5px;
}

.chart-card,
.table-card,
.heatmap-card,
.summary-card {
  margin-bottom: 20px;
}

.chart-container {
  height: 300px;
  width: 100%;
}

.savings-text {
  color: #52C41A;
  font-weight: 600;
}

.roi-text {
  color: #FAAD14;
  font-weight: 600;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: #F5F7FA;
  border-radius: 8px;
}

.empty-icon {
  font-size: 64px;
  color: #C9CDD4;
  margin-bottom: 20px;
}

.empty-text h4 {
  margin: 0 0 10px;
  color: #1D2129;
}

.empty-text p {
  margin: 0;
  color: #86909C;
}

.summary-content {
  padding: 10px 0;
}

.summary-item {
  display: flex;
  align-items: center;
  padding: 15px;
  background: #F5F7FA;
  border-radius: 8px;
}

.summary-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  font-size: 20px;
  color: #fff;
}

.summary-icon.positive {
  background: linear-gradient(135deg, #52C41A 0%, #73D13D 100%);
}

.summary-icon.neutral {
  background: linear-gradient(135deg, #409EFF 0%, #69C0FF 100%);
}

.summary-icon.warning {
  background: linear-gradient(135deg, #FAAD14 0%, #FFC53D 100%);
}

.summary-value {
  font-size: 24px;
  font-weight: 700;
  color: #1D2129;
}

.summary-label {
  font-size: 12px;
  color: #86909C;
}

.recommendation-section {
  margin-top: 20px;
}

.recommendation-section h4 {
  margin: 0 0 15px;
  color: #1D2129;
}

.recommendation-section h4 i {
  margin-right: 8px;
  color: #FAAD14;
}

.recommendation-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.recommendation-list li {
  display: flex;
  align-items: flex-start;
  padding: 10px 0;
  border-bottom: 1px solid #F5F7FA;
}

.recommendation-list li:last-child {
  border-bottom: none;
}

.rec-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  font-size: 12px;
  flex-shrink: 0;
}

.rec-icon.success {
  background: #F6FFED;
  color: #52C41A;
}

.rec-icon.warning {
  background: #FFFBE6;
  color: #FAAD14;
}

.rec-icon.info {
  background: #E6F7FF;
  color: #409EFF;
}

.rec-text {
  color: #4E5969;
  line-height: 1.5;
}

.detail-content {
  padding: 10px 0;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .summary-item {
    margin-bottom: 10px;
  }
}
</style>
