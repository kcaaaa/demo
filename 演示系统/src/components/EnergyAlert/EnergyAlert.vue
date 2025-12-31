<template>
  <div class="energy-alert-container">
    <!-- 页面标题 -->
    <el-card shadow="hover" class="page-header">
      <h1 class="page-title">
        <i class="fa fa-exclamation-triangle"></i> 能耗分析预警
      </h1>
      <p class="page-subtitle">实时监控能耗数据，智能检测异常并发出预警</p>
    </el-card>

    <!-- 预警概览 -->
    <el-row :gutter="20" class="metrics-row">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="metric-card total-alerts">
          <div class="metric-content">
            <div class="metric-header">
              <h3 class="metric-title">总预警数</h3>
              <i class="fa fa-bell metric-icon"></i>
            </div>
            <div class="metric-value">{{ totalAlerts }}</div>
            <div class="metric-trend">
              <span class="trend-label">今日新增</span>
              <span class="trend-value positive">{{ newAlertsToday }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="metric-card high-alerts">
          <div class="metric-content">
            <div class="metric-header">
              <h3 class="metric-title">高危预警</h3>
              <i class="fa fa-exclamation-circle metric-icon"></i>
            </div>
            <div class="metric-value">{{ highLevelAlerts }}</div>
            <div class="metric-trend">
              <span class="trend-label">处理中</span>
              <span class="trend-value negative">{{ processingHighAlerts }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="metric-card medium-alerts">
          <div class="metric-content">
            <div class="metric-header">
              <h3 class="metric-title">中危预警</h3>
              <i class="fa fa-warning metric-icon"></i>
            </div>
            <div class="metric-value">{{ mediumLevelAlerts }}</div>
            <div class="metric-trend">
              <span class="trend-label">处理中</span>
              <span class="trend-value negative">{{ processingMediumAlerts }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="metric-card low-alerts">
          <div class="metric-content">
            <div class="metric-header">
              <h3 class="metric-title">低危预警</h3>
              <i class="fa fa-info-circle metric-icon"></i>
            </div>
            <div class="metric-value">{{ lowLevelAlerts }}</div>
            <div class="metric-trend">
              <span class="trend-label">处理中</span>
              <span class="trend-value negative">{{ processingLowAlerts }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 预警分布 -->
    <el-row :gutter="20">
      <el-col :xs="24" :md="12">
        <el-card shadow="hover" class="chart-card">
          <div slot="header" class="card-header">
            <h3 class="card-title">
              <i class="fa fa-pie-chart"></i> 预警等级分布
            </h3>
          </div>
          <div class="chart-container">
            <div ref="alertLevelChart" class="chart"></div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :md="12">
        <el-card shadow="hover" class="chart-card">
          <div slot="header" class="card-header">
            <h3 class="card-title">
              <i class="fa fa-bar-chart"></i> 预警类型分布
            </h3>
          </div>
          <div class="chart-container">
            <div ref="alertTypeChart" class="chart"></div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 预警监控 -->
    <el-row :gutter="20">
      <el-col :xs="24">
        <el-card shadow="hover" class="chart-card">
          <div slot="header" class="card-header">
            <h3 class="card-title">
              <i class="fa fa-line-chart"></i> 预警趋势监控
            </h3>
            <el-select v-model="alertTrendTimeRange" placeholder="选择时间范围" size="small">
              <el-option label="今日" value="today" />
              <el-option label="近7天" value="7days" />
              <el-option label="近30天" value="30days" />
            </el-select>
          </div>
          <div class="chart-container">
            <div ref="alertTrendChart" class="chart"></div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 预警列表 -->
    <el-row :gutter="20">
      <el-col :xs="24">
        <el-card shadow="hover" class="alert-list-card">
          <div slot="header" class="card-header">
            <h3 class="card-title">
              <i class="fa fa-list"></i> 预警记录
            </h3>
            <div class="card-actions">
              <el-select v-model="alertStatusFilter" placeholder="筛选状态" size="small">
                <el-option label="全部" value="all" />
                <el-option label="未处理" value="unprocessed" />
                <el-option label="处理中" value="processing" />
                <el-option label="已解决" value="resolved" />
                <el-option label="已忽略" value="ignored" />
              </el-select>
              <el-select v-model="alertLevelFilter" placeholder="筛选等级" size="small">
                <el-option label="全部" value="all" />
                <el-option label="高危" value="high" />
                <el-option label="中危" value="medium" />
                <el-option label="低危" value="low" />
              </el-select>
              <el-button type="primary" size="small" @click="handleRefreshAlerts">
                <i class="fa fa-refresh"></i> 刷新
              </el-button>
            </div>
          </div>
          <el-table
            :data="filteredAlerts"
            stripe
            border
            style="width: 100%"
            v-loading="loading"
          >
            <el-table-column type="index" label="序号" width="60" />
            <el-table-column prop="time" label="预警时间" width="180" />
            <el-table-column prop="station" label="站点" width="120" />
            <el-table-column prop="type" label="预警类型" width="120">
              <template #default="scope">
                <el-tag :type="getAlertTypeTagType(scope.row.type)">
                  {{ scope.row.type }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="level" label="预警等级" width="100">
              <template #default="scope">
                <el-tag :type="getAlertLevelTagType(scope.row.level)">
                  {{ scope.row.level }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="content" label="预警内容" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="getAlertStatusTagType(scope.row.status)">
                  {{ scope.row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="handler" label="处理人" width="100" />
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="scope">
                <el-button type="primary" size="small" @click="handleViewDetail(scope.row)">
                  <i class="fa fa-eye"></i> 查看
                </el-button>
                <el-button 
                  :type="scope.row.status === 'unprocessed' ? 'success' : 'info'" 
                  size="small" 
                  @click="handleProcessAlert(scope.row)"
                >
                  <i class="fa fa-check"></i> {{ scope.row.status === 'unprocessed' ? '处理' : '详情' }}
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="pagination-container">
            <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="currentPage"
              :page-sizes="[10, 20, 50, 100]"
              :page-size="pageSize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="filteredAlerts.length"
            />
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'EnergyAlert',
  data() {
    return {
      // 预警统计数据
      totalAlerts: 128,
      newAlertsToday: 15,
      highLevelAlerts: 23,
      mediumLevelAlerts: 45,
      lowLevelAlerts: 60,
      processingHighAlerts: 8,
      processingMediumAlerts: 15,
      processingLowAlerts: 20,
      
      // 图表数据
      alertTrendTimeRange: '7days',
      
      // 预警列表数据
      alerts: [],
      alertStatusFilter: 'all',
      alertLevelFilter: 'all',
      
      // 分页数据
      currentPage: 1,
      pageSize: 10,
      loading: false,
      
      // 图表实例
      alertLevelChart: null,
      alertTypeChart: null,
      alertTrendChart: null
    }
  },
  computed: {
    filteredAlerts() {
      let result = this.alerts
      
      // 按状态筛选
      if (this.alertStatusFilter !== 'all') {
        result = result.filter(alert => alert.status === this.alertStatusFilter)
      }
      
      // 按等级筛选
      if (this.alertLevelFilter !== 'all') {
        result = result.filter(alert => alert.level === this.alertLevelFilter)
      }
      
      return result
    }
  },
  mounted() {
    this.initCharts()
    this.loadAlerts()
  },
  beforeUnmount() {
    // 移除resize事件监听
    window.removeEventListener('resize', this.handleWindowResize)
    // 销毁图表实例
    if (this.alertLevelChart) {
      this.alertLevelChart.dispose()
      this.alertLevelChart = null
    }
    if (this.alertTypeChart) {
      this.alertTypeChart.dispose()
      this.alertTypeChart = null
    }
    if (this.alertTrendChart) {
      this.alertTrendChart.dispose()
      this.alertTrendChart = null
    }
  },
  methods: {
    // 初始化图表
    initCharts() {
      this.initAlertLevelChart()
      this.initAlertTypeChart()
      this.initAlertTrendChart()
      
      // 监听窗口大小变化
      window.addEventListener('resize', this.handleWindowResize)
    },
    
    // 初始化预警等级分布饼图
    initAlertLevelChart() {
      this.alertLevelChart = echarts.init(this.$refs.alertLevelChart)
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 10,
          top: 'center'
        },
        series: [
          {
            name: '预警等级',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
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
                fontSize: '18',
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: [
              { value: this.highLevelAlerts, name: '高危', itemStyle: { color: '#F56C6C' } },
              { value: this.mediumLevelAlerts, name: '中危', itemStyle: { color: '#E6A23C' } },
              { value: this.lowLevelAlerts, name: '低危', itemStyle: { color: '#67C23A' } }
            ]
          }
        ]
      }
      this.alertLevelChart.setOption(option)
    },
    
    // 初始化预警类型分布柱状图
    initAlertTypeChart() {
      this.alertTypeChart = echarts.init(this.$refs.alertTypeChart)
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'value',
          name: '预警数量'
        },
        yAxis: {
          type: 'category',
          data: ['能耗突增', '能耗突降', '异常持续', '超阈值', '设备故障', '其他']
        },
        series: [
          {
            name: '预警数量',
            type: 'bar',
            data: [35, 28, 22, 18, 15, 10],
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                { offset: 0, color: '#409EFF' },
                { offset: 1, color: '#67C23A' }
              ])
            },
            label: {
              show: true,
              position: 'right'
            }
          }
        ]
      }
      this.alertTypeChart.setOption(option)
    },
    
    // 初始化预警趋势图
    initAlertTrendChart() {
      this.alertTrendChart = echarts.init(this.$refs.alertTrendChart)
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#6a7985'
            }
          }
        },
        legend: {
          data: ['高危预警', '中危预警', '低危预警'],
          top: 10
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: ['1日', '2日', '3日', '4日', '5日', '6日', '7日']
        },
        yAxis: {
          type: 'value',
          name: '预警数量'
        },
        series: [
          {
            name: '高危预警',
            type: 'line',
            stack: 'Total',
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(245,108,108,0.35)' },
                { offset: 1, color: 'rgba(245,108,108,0.05)' }
              ])
            },
            emphasis: {
              focus: 'series'
            },
            data: [5, 3, 4, 6, 2, 5, 3],
            itemStyle: {
              color: '#F56C6C'
            }
          },
          {
            name: '中危预警',
            type: 'line',
            stack: 'Total',
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(230,162,60,0.35)' },
                { offset: 1, color: 'rgba(230,162,60,0.05)' }
              ])
            },
            emphasis: {
              focus: 'series'
            },
            data: [8, 10, 7, 9, 11, 8, 12],
            itemStyle: {
              color: '#E6A23C'
            }
          },
          {
            name: '低危预警',
            type: 'line',
            stack: 'Total',
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(103,194,58,0.35)' },
                { offset: 1, color: 'rgba(103,194,58,0.05)' }
              ])
            },
            emphasis: {
              focus: 'series'
            },
            data: [12, 15, 10, 13, 16, 14, 18],
            itemStyle: {
              color: '#67C23A'
            }
          }
        ]
      }
      this.alertTrendChart.setOption(option)
    },
    
    // 加载预警数据
    loadAlerts() {
      this.loading = true
      // 模拟加载数据
      setTimeout(() => {
        this.alerts = [
          {
            id: 1,
            time: '2024-01-15 14:30:00',
            station: '北京南站',
            type: '能耗突增',
            level: 'high',
            content: '候车大厅空调系统能耗突增30%',
            status: 'unprocessed',
            handler: '',
            details: '2024-01-15 14:25:00开始，候车大厅空调系统能耗从正常的1200kWh/h突增至1560kWh/h，增幅达30%'
          },
          {
            id: 2,
            time: '2024-01-15 13:45:00',
            station: '上海虹桥站',
            type: '超阈值',
            level: 'medium',
            content: '照明系统能耗超阈值15%',
            status: 'processing',
            handler: '张三',
            details: '照明系统能耗连续2小时超过阈值15%，当前值为850kWh/h，阈值为740kWh/h'
          },
          {
            id: 3,
            time: '2024-01-15 12:20:00',
            station: '广州南站',
            type: '设备故障',
            level: 'high',
            content: '通风设备能耗异常',
            status: 'resolved',
            handler: '李四',
            details: '通风设备#3出现故障，能耗异常波动，已修复'
          },
          {
            id: 4,
            time: '2024-01-15 11:10:00',
            station: '深圳北站',
            type: '能耗突降',
            level: 'low',
            content: '办公区能耗异常下降',
            status: 'ignored',
            handler: '王五',
            details: '办公区能耗从500kWh/h下降至350kWh/h，经核实为正常下班导致'
          },
          {
            id: 5,
            time: '2024-01-15 10:05:00',
            station: '杭州东站',
            type: '异常持续',
            level: 'medium',
            content: '电梯系统能耗异常持续',
            status: 'unprocessed',
            handler: '',
            details: '电梯系统能耗异常已持续超过4小时，当前值为280kWh/h，正常值为180kWh/h'
          }
        ]
        this.loading = false
      }, 1000)
    },
    
    // 获取预警类型标签类型
    getAlertTypeTagType(type) {
      const typeMap = {
        '能耗突增': 'danger',
        '能耗突降': 'warning',
        '异常持续': 'info',
        '超阈值': 'success',
        '设备故障': 'danger',
        '其他': 'info'
      }
      return typeMap[type] || 'info'
    },
    
    // 获取预警等级标签类型
    getAlertLevelTagType(level) {
      const levelMap = {
        'high': 'danger',
        'medium': 'warning',
        'low': 'success'
      }
      return levelMap[level] || 'info'
    },
    
    // 获取预警状态标签类型
    getAlertStatusTagType(status) {
      const statusMap = {
        'unprocessed': 'danger',
        'processing': 'warning',
        'resolved': 'success',
        'ignored': 'info'
      }
      return statusMap[status] || 'info'
    },
    
    // 查看预警详情
    handleViewDetail(alert) {
      this.$alert(alert.details, '预警详情', {
        confirmButtonText: '确定',
        dangerouslyUseHTMLString: true
      })
    },
    
    // 处理预警
    handleProcessAlert(alert) {
      if (alert.status === 'unprocessed') {
        this.$confirm('确定要处理此预警吗？', '处理预警', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          alert.status = 'processing'
          alert.handler = '当前用户'
          this.$message({
            type: 'success',
            message: '预警已标记为处理中'
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消处理'
          })
        })
      } else {
        this.handleViewDetail(alert)
      }
    },
    
    // 刷新预警列表
    handleRefreshAlerts() {
      this.loadAlerts()
    },
    
    // 分页处理
    handleSizeChange(val) {
      this.pageSize = val
    },
    
    handleCurrentChange(val) {
      this.currentPage = val
    },
    
    // 窗口大小变化处理
    handleWindowResize() {
      if (this.alertLevelChart) {
        this.alertLevelChart.resize()
      }
      if (this.alertTypeChart) {
        this.alertTypeChart.resize()
      }
      if (this.alertTrendChart) {
        this.alertTrendChart.resize()
      }
    }
  }
}
</script>

<style scoped>
.energy-alert-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 20px;
}

.page-title {
  margin: 0 0 10px 0;
  font-size: 28px;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 10px;
}

.page-subtitle {
  margin: 0;
  font-size: 16px;
  color: #606266;
}

.metrics-row {
  margin-bottom: 20px;
}

.metric-card {
  height: 100%;
  transition: all 0.3s;
  border: none;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.05);
}

.metric-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.1);
}

.metric-content {
  padding: 20px;
}

.metric-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.metric-title {
  margin: 0;
  font-size: 16px;
  color: #606266;
  font-weight: normal;
}

.metric-icon {
  font-size: 24px;
  color: #409EFF;
}

.metric-value {
  font-size: 36px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 10px;
}

.metric-trend {
  display: flex;
  align-items: center;
  gap: 10px;
}

.trend-label {
  font-size: 14px;
  color: #909399;
}

.trend-value {
  font-size: 16px;
  font-weight: 600;
}

.trend-value.positive {
  color: #67C23A;
}

.trend-value.negative {
  color: #F56C6C;
}

.total-alerts {
  background: linear-gradient(135deg, #e6f7ff, #ffffff);
}

.high-alerts {
  background: linear-gradient(135deg, #fff1f0, #ffffff);
}

.medium-alerts {
  background: linear-gradient(135deg, #fff7e6, #ffffff);
}

.low-alerts {
  background: linear-gradient(135deg, #f6ffed, #ffffff);
}

.chart-card,
.alert-list-card {
  margin-bottom: 20px;
  border: none;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px;
}

.chart-container {
  height: 340px;
}

.chart {
  width: 100%;
  height: 100%;
}

.card-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.pagination-container {
  margin-top: 15px;
  display: flex;
  justify-content: flex-end;
}
</style>