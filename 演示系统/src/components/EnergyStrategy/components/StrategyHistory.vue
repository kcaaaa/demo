<template>
  <div class="strategy-history-container">
    <el-card shadow="hover" class="history-card">
      <div slot="header" class="card-header">
        <h3 class="card-title">
          <i class="fa fa-history"></i> 策略模拟历史记录
        </h3>
        <div class="header-actions">
          <el-button size="small" @click="handleExportHistory">
            <i class="fa fa-download"></i> 导出
          </el-button>
          <el-button type="danger" size="small" @click="handleClearHistory" :disabled="historyList.length === 0">
            <i class="fa fa-trash"></i> 清空
          </el-button>
        </div>
      </div>
      
      <!-- 筛选区域 -->
      <div class="filter-section">
        <el-row :gutter="15">
          <el-col :xs="24" :sm="12" :md="6">
            <el-date-picker
              v-model="filterDateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              size="small"
              style="width: 100%"
            />
          </el-col>
          <el-col :xs="24" :sm="12" :md="4">
            <el-select v-model="filterStation" placeholder="站点筛选" size="small" clearable style="width: 100%">
              <el-option label="北京南站" value="BJ" />
              <el-option label="上海虹桥站" value="SH" />
              <el-option label="广州南站" value="GZ" />
              <el-option label="深圳北站" value="SZ" />
              <el-option label="杭州东站" value="HZ" />
              <el-option label="成都东站" value="CD" />
            </el-select>
          </el-col>
          <el-col :xs="24" :sm="12" :md="4">
            <el-select v-model="filterStrategy" placeholder="策略类型" size="small" clearable style="width: 100%">
              <el-option label="照明系统" value="lighting" />
              <el-option label="空调系统" value="airConditioning" />
              <el-option label="通风系统" value="ventilation" />
              <el-option label="可再生能源" value="renewableEnergy" />
              <el-option label="智能控制" value="smartControl" />
            </el-select>
          </el-col>
          <el-col :xs="24" :sm="12" :md="4">
            <el-select v-model="filterResult" placeholder="结果状态" size="small" clearable style="width: 100%">
              <el-option label="全部成功" value="success" />
              <el-option label="部分成功" value="partial" />
              <el-option label="失败" value="failed" />
            </el-select>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索策略名称..."
              size="small"
              clearable
            >
              <template #prefix>
                <i class="fa fa-search"></i>
              </template>
            </el-input>
          </el-col>
        </el-row>
      </div>
      
      <!-- 历史记录统计 -->
      <div class="history-stats">
        <el-row :gutter="20">
          <el-col :xs="12" :sm="6">
            <div class="stat-item">
              <div class="stat-value">{{ historyList.length }}</div>
              <div class="stat-label">总记录数</div>
            </div>
          </el-col>
          <el-col :xs="12" :sm="6">
            <div class="stat-item">
              <div class="stat-value">{{ avgSavings.toFixed(1) }}%</div>
              <div class="stat-label">平均节能率</div>
            </div>
          </el-col>
          <el-col :xs="12" :sm="6">
            <div class="stat-item">
              <div class="stat-value">{{ totalSavingsCount }}</div>
              <div class="stat-label">策略组合数</div>
            </div>
          </el-col>
          <el-col :xs="12" :sm="6">
            <div class="stat-item">
              <div class="stat-value">{{ successRate }}%</div>
              <div class="stat-label">成功率</div>
            </div>
          </el-col>
        </el-row>
      </div>
      
      <!-- 历史记录列表 -->
      <div class="history-list">
        <el-table
          :data="filteredHistory"
          stripe
          style="width: 100%"
          row-key="id"
          :default-sort="{ prop: 'simulateTime', order: 'descending' }"
        >
          <el-table-column type="expand">
            <template #default="props">
              <div class="expand-content">
                <el-row :gutter="20">
                  <el-col :xs="24" :md="12">
                    <div class="expand-section">
                      <h4>
                        <i class="fa fa-list-ul"></i> 策略详情
                      </h4>
                      <el-table :data="props.row.strategies" size="mini" border>
                        <el-table-column prop="name" label="策略名称" width="150" />
                        <el-table-column prop="savings" label="节能率" width="100">
                          <template #default="{ row }">
                            <span class="savings-text">{{ row.savings }}%</span>
                          </template>
                        </el-table-column>
                        <el-table-column prop="investment" label="投资(万元)" width="100">
                          <template #default="{ row }">
                            {{ row.investment }}
                          </template>
                        </el-table-column>
                        <el-table-column prop="paybackPeriod" label="回收期(年)" width="100">
                          <template #default="{ row }">
                            {{ row.paybackPeriod }}
                          </template>
                        </el-table-column>
                      </el-table>
                    </div>
                  </el-col>
                  <el-col :xs="24" :md="12">
                    <div class="expand-section">
                      <h4>
                        <i class="fa fa-area-chart"></i> 能耗对比
                      </h4>
                      <div ref="comparisonChart" class="comparison-chart"></div>
                    </div>
                  </el-col>
                </el-row>
                <div class="expand-actions">
                  <el-button size="mini" type="primary" @click="handleRestore(props.row)">
                    <i class="fa fa-rotate-left"></i> 恢复此策略
                  </el-button>
                  <el-button size="mini" @click="handleCompare(props.row)">
                    <i class="fa fa-balance-scale"></i> 对比分析
                  </el-button>
                  <el-button size="mini" @click="handleExport(props.row)">
                    <i class="fa fa-download"></i> 导出报告
                  </el-button>
                </div>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column prop="simulateTime" label="模拟时间" width="180" sortable>
            <template #default="{ row }">
              <i class="fa fa-clock-o"></i> {{ row.simulateTime }}
            </template>
          </el-table-column>
          
          <el-table-column prop="name" label="策略名称" width="200">
            <template #default="{ row }">
              <span class="strategy-name">{{ row.name }}</span>
            </template>
          </el-table-column>
          
          <el-table-column prop="station" label="站点" width="120">
            <template #default="{ row }">
              <el-tag size="mini">{{ getStationName(row.station) }}</el-tag>
            </template>
          </el-table-column>
          
          <el-table-column prop="strategyCount" label="策略数" width="80" align="center" />
          
          <el-table-column prop="totalSavings" label="总节能率" width="100" align="center">
            <template #default="{ row }">
              <el-tag type="success" size="mini">{{ row.totalSavings }}%</el-tag>
            </template>
          </el-table-column>
          
          <el-table-column prop="totalInvestment" label="总投资(万)" width="120" align="right">
            <template #default="{ row }">
              <span class="investment-text">{{ row.totalInvestment.toLocaleString() }}</span>
            </template>
          </el-table-column>
          
          <el-table-column prop="paybackPeriod" label="回收期" width="100" align="center">
            <template #default="{ row }">
              <span :class="['payback-text', { good: row.paybackPeriod <= 3 }]">
                {{ row.paybackPeriod }}年
              </span>
            </template>
          </el-table-column>
          
          <el-table-column prop="status" label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)" size="mini">
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          
          <el-table-column label="操作" width="150" align="center">
            <template #default="{ row }">
              <el-button type="text" size="mini" @click="handleView(row)">
                <i class="fa fa-eye"></i>
              </el-button>
              <el-button type="text" size="mini" @click="handleReuse(row)">
                <i class="fa fa-copy"></i>
              </el-button>
              <el-button type="text" size="mini" danger @click="handleDelete(row)">
                <i class="fa fa-trash"></i>
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      
      <!-- 分页 -->
      <div class="pagination-section">
        <el-pagination
          v-if="filteredHistory.length > pageSize"
          layout="prev, pager, next, jumper, total"
          :total="filteredHistory.length"
          :page-size="pageSize"
          :current-page="currentPage"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
    
    <!-- 对比分析对话框 -->
    <el-dialog
      title="策略对比分析"
      :visible.sync="compareDialogVisible"
      width="80%"
      top="5vh"
    >
      <div v-if="compareRecords.length > 0" class="compare-content">
        <el-row :gutter="20">
          <el-col :xs="24" :md="12">
            <div class="compare-chart-section">
              <h4>
                <i class="fa fa-bar-chart"></i> 节能率对比
              </h4>
              <div ref="compareChart" class="compare-chart"></div>
            </div>
          </el-col>
          <el-col :xs="24" :md="12">
            <div class="compare-chart-section">
              <h4>
                <i class="fa fa-money"></i> 投资回收期对比
              </h4>
              <div ref="paybackChart" class="compare-chart"></div>
            </div>
          </el-col>
        </el-row>
        
        <div class="compare-table-section">
          <h4>
            <i class="fa fa-table"></i> 综合对比
          </h4>
          <el-table :data="compareRecords" border stripe>
            <el-table-column prop="name" label="策略名称" width="150" />
            <el-table-column prop="simulateTime" label="模拟时间" width="180" />
            <el-table-column prop="strategyCount" label="策略数" width="100" align="center" />
            <el-table-column prop="totalSavings" label="总节能率" width="100" align="center">
              <template #default="{ row }">
                <el-tag type="success">{{ row.totalSavings }}%</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="totalInvestment" label="总投资(万)" width="120" align="right">
              <template #default="{ row }">
                {{ row.totalInvestment.toLocaleString() }}
              </template>
            </el-table-column>
            <el-table-column prop="paybackPeriod" label="回收期(年)" width="120" align="center">
              <template #default="{ row }">
                <el-tag :type="row.paybackPeriod <= 3 ? 'success' : 'warning'">
                  {{ row.paybackPeriod }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="expectedRevenue" label="年节省(元)" width="150" align="right">
              <template #default="{ row }">
                {{ row.expectedRevenue.toLocaleString() }}
              </template>
            </el-table-column>
          </el-table>
        </div>
        
        <div class="compare-recommendation">
          <i class="fa fa-star"></i>
          <span>最佳推荐：</span>
          <strong>{{ bestRecommendation.name }}</strong>
          <span>（节能率 {{ bestRecommendation.totalSavings }}%，回收期 {{ bestRecommendation.paybackPeriod }}年）</span>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'StrategyHistory',
  data() {
    return {
      compareChart: null,
      paybackChart: null,
      comparisonChart: null,
      filterDateRange: null,
      filterStation: '',
      filterStrategy: '',
      filterResult: '',
      searchKeyword: '',
      currentPage: 1,
      pageSize: 10,
      compareDialogVisible: false,
      compareRecords: [],
      historyList: [
        {
          id: 'hist-001',
          name: '照明+空调综合优化方案',
          station: 'BJ',
          simulateTime: '2025-01-20 14:30:25',
          strategies: [
            { name: '照明系统优化', savings: 5, investment: 120, paybackPeriod: 2.5 },
            { name: '空调系统改造', savings: 9, investment: 280, paybackPeriod: 3.2 }
          ],
          totalSavings: 14,
          totalInvestment: 400,
          paybackPeriod: 2.9,
          expectedRevenue: 1792000,
          status: 'success'
        },
        {
          id: 'hist-002',
          name: '全系统节能改造方案',
          station: 'SH',
          simulateTime: '2025-01-19 10:15:42',
          strategies: [
            { name: '照明系统优化', savings: 5, investment: 120, paybackPeriod: 2.5 },
            { name: '空调系统改造', savings: 9, investment: 280, paybackPeriod: 3.2 },
            { name: '通风系统优化', savings: 3.5, investment: 90, paybackPeriod: 2.0 },
            { name: '智能控制系统', savings: 5.5, investment: 180, paybackPeriod: 2.0 }
          ],
          totalSavings: 23,
          totalInvestment: 670,
          paybackPeriod: 2.5,
          expectedRevenue: 2944000,
          status: 'success'
        },
        {
          id: 'hist-003',
          name: '光伏+储能方案',
          station: 'GZ',
          simulateTime: '2025-01-18 16:45:33',
          strategies: [
            { name: '光伏发电系统', savings: 12, investment: 850, paybackPeriod: 5.5 },
            { name: '储能系统', savings: 7, investment: 520, paybackPeriod: 4.2 }
          ],
          totalSavings: 19,
          totalInvestment: 1370,
          paybackPeriod: 4.9,
          expectedRevenue: 2432000,
          status: 'partial'
        },
        {
          id: 'hist-004',
          name: '智能控制优先方案',
          station: 'SZ',
          simulateTime: '2025-01-17 09:20:18',
          strategies: [
            { name: '智能控制系统', savings: 5.5, investment: 180, paybackPeriod: 2.0 },
            { name: '照明系统优化', savings: 5, investment: 120, paybackPeriod: 2.5 }
          ],
          totalSavings: 10.5,
          totalInvestment: 300,
          paybackPeriod: 2.3,
          expectedRevenue: 1344000,
          status: 'success'
        },
        {
          id: 'hist-005',
          name: '低成本快速见效方案',
          station: 'HZ',
          simulateTime: '2025-01-16 11:35:55',
          strategies: [
            { name: '通风系统优化', savings: 3.5, investment: 90, paybackPeriod: 2.0 },
            { name: '照明系统优化', savings: 5, investment: 120, paybackPeriod: 2.5 }
          ],
          totalSavings: 8.5,
          totalInvestment: 210,
          paybackPeriod: 2.2,
          expectedRevenue: 1088000,
          status: 'success'
        }
      ]
    }
  },
  computed: {
    filteredHistory() {
      let result = [...this.historyList]
      
      if (this.filterDateRange && this.filterDateRange.length === 2) {
        const start = new Date(this.filterDateRange[0]).getTime()
        const end = new Date(this.filterDateRange[1]).getTime()
        result = result.filter(item => {
          const itemTime = new Date(item.simulateTime).getTime()
          return itemTime >= start && itemTime <= end
        })
      }
      
      if (this.filterStation) {
        result = result.filter(item => item.station === this.filterStation)
      }
      
      if (this.filterStrategy) {
        result = result.filter(item =>
          item.strategies.some(s => s.name.includes(this.filterStrategy) ||
            this.getStrategyType(s.name) === this.filterStrategy)
        )
      }
      
      if (this.filterResult) {
        result = result.filter(item => item.status === this.filterResult)
      }
      
      if (this.searchKeyword) {
        const keyword = this.searchKeyword.toLowerCase()
        result = result.filter(item =>
          item.name.toLowerCase().includes(keyword)
        )
      }
      
      return result
    },
    
    avgSavings() {
      if (this.historyList.length === 0) return 0
      const total = this.historyList.reduce((sum, item) => sum + item.totalSavings, 0)
      return total / this.historyList.length
    },
    
    totalSavingsCount() {
      return this.historyList.reduce((sum, item) => sum + item.strategyCount, 0)
    },
    
    successRate() {
      if (this.historyList.length === 0) return 0
      const success = this.historyList.filter(item => item.status === 'success').length
      return Math.round((success / this.historyList.length) * 100)
    },
    
    bestRecommendation() {
      if (this.compareRecords.length === 0) return {}
      return this.compareRecords.reduce((best, current) => {
        const currentScore = current.totalSavings / current.paybackPeriod
        const bestScore = best.totalSavings / best.paybackPeriod
        return currentScore > bestScore ? current : best
      }, this.compareRecords[0])
    }
  },
  beforeDestroy() {
    this.disposeCharts();
  },
  beforeUnmount() {
    this.disposeCharts();
  },
  methods: {
    getStationName(code) {
      const stations = {
        'BJ': '北京南站',
        'SH': '上海虹桥站',
        'GZ': '广州南站',
        'SZ': '深圳北站',
        'HZ': '杭州东站',
        'CD': '成都东站'
      }
      return stations[code] || code
    },
    
    getStrategyType(name) {
      if (name.includes('照明')) return 'lighting'
      if (name.includes('空调')) return 'airConditioning'
      if (name.includes('通风')) return 'ventilation'
      if (name.includes('光伏') || name.includes('能源')) return 'renewableEnergy'
      if (name.includes('智能') || name.includes('控制')) return 'smartControl'
      return ''
    },
    
    getStatusType(status) {
      const types = {
        'success': 'success',
        'partial': 'warning',
        'failed': 'danger'
      }
      return types[status] || 'info'
    },
    
    getStatusText(status) {
      const texts = {
        'success': '成功',
        'partial': '部分成功',
        'failed': '失败'
      }
      return texts[status] || status
    },
    
    handleView(record) {
      this.$router.push({
        name: 'StrategyDetail',
        params: { id: record.id }
      })
    },
    
    handleRestore(record) {
      this.$emit('restore', record)
    },
    
    handleReuse(record) {
      this.$emit('reuse', record)
    },
    
    handleDelete(record) {
      this.$confirm('确定要删除此历史记录吗？', '确认删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const index = this.historyList.findIndex(item => item.id === record.id)
        if (index > -1) {
          this.historyList.splice(index, 1)
          this.$message.success('历史记录删除成功')
        }
      }).catch(() => {})
    },
    
    handleClearHistory() {
      this.$confirm('确定要清空所有历史记录吗？此操作不可恢复。', '确认清空', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.historyList = []
        this.$message.success('历史记录已清空')
      }).catch(() => {})
    },
    
    handleExport(record) {
      this.$message.info('正在生成报告...')
      setTimeout(() => {
        this.$message.success('报告已导出')
      }, 1500)
    },
    
    handleExportHistory() {
      this.$message.info('正在导出全部历史记录...')
    },
    
    handleCompare(record) {
      this.compareRecords = [record]
      this.compareDialogVisible = true
      this.$nextTick(() => {
        this.initCompareCharts()
      })
    },
    
    initCompareCharts() {
      this.disposeCharts();
      const compareChartEl = this.$refs.compareChart;
      const paybackChartEl = this.$refs.paybackChart;
      
      if (compareChartEl) {
        this.compareChart = echarts.init(compareChartEl);
        this.compareChart.setOption({
          tooltip: { trigger: 'axis' },
          xAxis: {
            type: 'category',
            data: this.compareRecords.map(r => r.name)
          },
          yAxis: { type: 'value', name: '节能率(%)' },
          series: [{
            data: this.compareRecords.map(r => r.totalSavings),
            type: 'bar',
            itemStyle: { color: '#67C23A' }
          }]
        });
      }
      
      if (paybackChartEl) {
        this.paybackChart = echarts.init(paybackChartEl);
        this.paybackChart.setOption({
          tooltip: { trigger: 'axis' },
          xAxis: {
            type: 'category',
            data: this.compareRecords.map(r => r.name)
          },
          yAxis: { type: 'value', name: '回收期(年)' },
          series: [{
            data: this.compareRecords.map(r => r.paybackPeriod),
            type: 'bar',
            itemStyle: { color: '#409EFF' }
          }]
        });
      }
    },
    
    handlePageChange(page) {
      this.currentPage = page
    },
    
    disposeCharts() {
      if (this.compareChart) {
        this.compareChart.dispose();
        this.compareChart = null;
      }
      if (this.paybackChart) {
        this.paybackChart.dispose();
        this.paybackChart = null;
      }
      if (this.comparisonChart) {
        this.comparisonChart.dispose();
        this.comparisonChart = null;
      }
    }
  }
}
</script>

<style scoped>
.strategy-history-container {
  margin-bottom: 20px;
}

.history-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 18px;
  color: #303133;
  margin: 0;
  display: flex;
  align-items: center;
}

.card-title i {
  margin-right: 8px;
  color: #409EFF;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.filter-section {
  background: #F5F7FA;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.history-stats {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.stat-item {
  text-align: center;
  color: #fff;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
}

.stat-label {
  font-size: 12px;
  opacity: 0.8;
  margin-top: 5px;
}

.history-list {
  margin-bottom: 20px;
}

.strategy-name {
  font-weight: 500;
}

.savings-text {
  color: #67C23A;
  font-weight: 600;
}

.investment-text {
  color: #F56C6C;
}

.payback-text {
  color: #E6A23C;
}

.payback-text.good {
  color: #67C23A;
}

.expand-content {
  padding: 20px;
  background: #F5F7FA;
  border-radius: 8px;
}

.expand-section {
  margin-bottom: 20px;
}

.expand-section h4 {
  font-size: 14px;
  color: #303133;
  margin: 0 0 10px 0;
  display: flex;
  align-items: center;
}

.expand-section h4 i {
  margin-right: 8px;
  color: #409EFF;
}

.comparison-chart {
  height: 200px;
}

.expand-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  padding-top: 15px;
  border-top: 1px solid #EBEEF5;
}

.pagination-section {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.compare-content {
  padding: 10px 0;
}

.compare-chart-section {
  margin-bottom: 20px;
}

.compare-chart-section h4 {
  font-size: 14px;
  color: #303133;
  margin: 0 0 10px 0;
  display: flex;
  align-items: center;
}

.compare-chart-section h4 i {
  margin-right: 8px;
  color: #409EFF;
}

.compare-chart {
  height: 250px;
}

.compare-table-section {
  margin-top: 20px;
}

.compare-table-section h4 {
  font-size: 14px;
  color: #303133;
  margin: 0 0 10px 0;
  display: flex;
  align-items: center;
}

.compare-table-section h4 i {
  margin-right: 8px;
  color: #409EFF;
}

.compare-recommendation {
  background: linear-gradient(135deg, #67C23A, #95DE64);
  color: #fff;
  padding: 15px 20px;
  border-radius: 8px;
  margin-top: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.compare-recommendation i {
  font-size: 20px;
}

.compare-recommendation strong {
  font-size: 16px;
}

@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .header-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
