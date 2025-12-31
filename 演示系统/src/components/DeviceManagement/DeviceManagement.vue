<template>
  <div class="device-management-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2>设备与系统管理</h2>
      <div class="header-buttons">
        <el-button type="primary" @click="handleAddDevice">
          <i class="fa fa-plus"></i> 添加设备
        </el-button>
        <el-button type="success" @click="handleBatchOperation('start')">
          <i class="fa fa-play"></i> 批量启动
        </el-button>
        <el-button type="warning" @click="handleBatchOperation('stop')">
          <i class="fa fa-stop"></i> 批量停止
        </el-button>
      </div>
    </div>

    <!-- 设备状态概览 -->
    <div class="status-overview">
      <el-card shadow="hover" class="status-card">
        <div class="status-item">
          <div class="status-count">{{ deviceStats.total }}</div>
          <div class="status-label">设备总数</div>
        </div>
      </el-card>
      <el-card shadow="hover" class="status-card">
        <div class="status-item online">
          <div class="status-count">{{ deviceStats.online }}</div>
          <div class="status-label">在线设备</div>
        </div>
      </el-card>
      <el-card shadow="hover" class="status-card">
        <div class="status-item warning">
          <div class="status-count">{{ deviceStats.warning }}</div>
          <div class="status-label">警告设备</div>
        </div>
      </el-card>
      <el-card shadow="hover" class="status-card">
        <div class="status-item offline">
          <div class="status-count">{{ deviceStats.offline }}</div>
          <div class="status-label">离线设备</div>
        </div>
      </el-card>
    </div>

    <!-- 设备状态分布图 -->
    <el-card class="chart-card">
      <template #header>
        <div class="card-header">
          <span>设备状态分布</span>
        </div>
      </template>
      <div id="deviceStatusChart" class="chart"></div>
    </el-card>

    <!-- 设备管理表格 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>设备列表</span>
          <div class="table-controls">
            <el-select v-model="searchParams.station" placeholder="选择站点" class="control-item">
              <el-option label="所有站点" value=""></el-option>
              <el-option label="北京南站" value="BJ"></el-option>
              <el-option label="上海虹桥站" value="SH"></el-option>
              <el-option label="广州南站" value="GZ"></el-option>
              <el-option label="深圳北站" value="SZ"></el-option>
              <el-option label="杭州东站" value="HZ"></el-option>
            </el-select>
            <el-select v-model="searchParams.status" placeholder="设备状态" class="control-item">
              <el-option label="所有状态" value=""></el-option>
              <el-option label="在线" value="online"></el-option>
              <el-option label="离线" value="offline"></el-option>
              <el-option label="警告" value="warning"></el-option>
            </el-select>
            <el-input
              v-model="searchParams.keyword"
              placeholder="搜索设备名称或ID"
              clearable
              class="control-item"
              @input="handleSearch"
            >
              <template #prefix>
                <i class="fa fa-search"></i>
              </template>
            </el-input>
          </div>
        </div>
      </template>
      
      <div class="table-content">
        <el-table
          v-loading="tableLoading"
          :data="filteredDevices"
          style="width: 100%"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="id" label="设备ID" width="120" sortable />
          <el-table-column prop="name" label="设备名称" width="200" />
          <el-table-column prop="stationName" label="所属站点" width="150" />
          <el-table-column prop="typeName" label="设备类型" width="120" />
          <el-table-column prop="status" label="设备状态" width="100">
            <template #default="scope">
              <el-tag
                :type="scope.row.status === 'online' ? 'success' : scope.row.status === 'warning' ? 'warning' : 'danger'"
              >
                {{ scope.row.status === 'online' ? '在线' : scope.row.status === 'warning' ? '警告' : '离线' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="energyConsumption" label="实时能耗(kWh)" width="150" sortable>
            <template #default="scope">
              {{ scope.row.energyConsumption.toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column prop="temperature" label="设备温度(℃)" width="120">
            <template #default="scope">
              <span :class="{ 'temp-warning': scope.row.temperature > 70 }">
                {{ scope.row.temperature }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="lastOnline" label="最后在线" width="180">
            <template #default="scope">
              {{ formatDate(scope.row.lastOnline) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="scope">
              <el-button size="small" type="primary" @click="handleViewDetail(scope.row)">
                <i class="fa fa-eye"></i> 查看
              </el-button>
              <el-button size="small" type="success" @click="handleControlDevice(scope.row, 'restart')">
                <i class="fa fa-refresh"></i> 重启
              </el-button>
              <el-button size="small" type="danger" @click="handleDeleteDevice(scope.row.id)">
                <i class="fa fa-trash"></i> 删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination">
          <el-pagination
            v-model:current-page="pagination.currentPage"
            v-model:page-size="pagination.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="filteredDevices.length"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </el-card>

    <!-- 设备详情弹窗 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="设备详情"
      width="70%"
      :before-close="handleDetailDialogClose"
    >
      <div class="device-detail" v-if="selectedDevice">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-card shadow="hover">
              <template #header>
                <div class="card-header">
                  <span>基本信息</span>
                </div>
              </template>
              <div class="detail-info">
                <div class="info-item">
                  <span class="info-label">设备ID:</span>
                  <span class="info-value">{{ selectedDevice.id }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">设备名称:</span>
                  <span class="info-value">{{ selectedDevice.name }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">所属站点:</span>
                  <span class="info-value">{{ selectedDevice.stationName }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">设备类型:</span>
                  <span class="info-value">{{ selectedDevice.typeName }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">设备状态:</span>
                  <el-tag
                    :type="selectedDevice.status === 'online' ? 'success' : selectedDevice.status === 'warning' ? 'warning' : 'danger'"
                  >
                    {{ selectedDevice.status === 'online' ? '在线' : selectedDevice.status === 'warning' ? '警告' : '离线' }}
                  </el-tag>
                </div>
                <div class="info-item">
                  <span class="info-label">安装时间:</span>
                  <span class="info-value">{{ formatDate(selectedDevice.installationDate) }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">制造商:</span>
                  <span class="info-value">{{ selectedDevice.manufacturer }}</span>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card shadow="hover">
              <template #header>
                <div class="card-header">
                  <span>运行参数</span>
                </div>
              </template>
              <div class="detail-info">
                <div class="info-item">
                  <span class="info-label">实时能耗:</span>
                  <span class="info-value">{{ selectedDevice.energyConsumption.toFixed(2) }} kWh</span>
                </div>
                <div class="info-item">
                  <span class="info-label">设备温度:</span>
                  <span class="info-value" :class="{ 'temp-warning': selectedDevice.temperature > 70 }">
                    {{ selectedDevice.temperature }}℃
                  </span>
                </div>
                <div class="info-item">
                  <span class="info-label">运行时间:</span>
                  <span class="info-value">{{ selectedDevice.operatingHours }} 小时</span>
                </div>
                <div class="info-item">
                  <span class="info-label">维护周期:</span>
                  <span class="info-value">{{ selectedDevice.maintenanceCycle }} 天</span>
                </div>
                <div class="info-item">
                  <span class="info-label">上次维护:</span>
                  <span class="info-value">{{ formatDate(selectedDevice.lastMaintenance) }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">下次维护:</span>
                  <span class="info-value">{{ formatDate(selectedDevice.nextMaintenance) }}</span>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
        
        <!-- 能耗趋势图 -->
        <el-card shadow="hover" class="mt-20">
          <template #header>
            <div class="card-header">
              <span>能耗趋势</span>
            </div>
          </template>
          <div id="energyTrendChart" class="chart"></div>
        </el-card>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'DeviceManagement',
  data() {
    return {
      // 表格加载状态
      tableLoading: false,
      // 设备数据
      devices: [],
      // 过滤后的设备数据
      filteredDevices: [],
      // 搜索参数
      searchParams: {
        station: '',
        status: '',
        keyword: ''
      },
      // 分页参数
      pagination: {
        currentPage: 1,
        pageSize: 10
      },
      // 选中的设备
      selectedDevices: [],
      // 设备统计
      deviceStats: {
        total: 0,
        online: 0,
        warning: 0,
        offline: 0
      },
      // 设备详情弹窗
      detailDialogVisible: false,
      selectedDevice: null,
      // 图表实例
      deviceStatusChart: null,
      energyTrendChart: null,
      resizeHandler: null
    }
  },
  mounted() {
    this.initData()
    this.$nextTick(() => {
      this.initDeviceStatusChart()
    })
  },
  beforeUnmount() {
    // 移除resize事件监听
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler)
      this.resizeHandler = null
    }
    // 销毁图表实例
    if (this.deviceStatusChart) {
      this.deviceStatusChart.dispose()
    }
    if (this.energyTrendChart) {
      this.energyTrendChart.dispose()
    }
  },
  methods: {
    // 窗口大小变化处理
    handleResize() {
      if (this.deviceStatusChart) {
        this.deviceStatusChart.resize()
      }
      if (this.energyTrendChart) {
        this.energyTrendChart.resize()
      }
    },
    // 初始化数据
    initData() {
      this.tableLoading = true
      
      // 模拟设备数据
      setTimeout(() => {
        this.devices = this.generateMockDevices()
        this.filteredDevices = [...this.devices]
        this.updateDeviceStats()
        this.tableLoading = false
      }, 1000)
    },
    
    // 生成模拟设备数据
    generateMockDevices() {
      const stations = [
        { id: 'BJ', name: '北京南站' },
        { id: 'SH', name: '上海虹桥站' },
        { id: 'GZ', name: '广州南站' },
        { id: 'SZ', name: '深圳北站' },
        { id: 'HZ', name: '杭州东站' }
      ]
      
      const deviceTypes = [
        { id: 'HVAC', name: '空调系统' },
        { id: 'LIGHTING', name: '照明系统' },
        { id: 'ESCALATOR', name: '扶梯系统' },
        { id: 'ELEVATOR', name: '电梯系统' },
        { id: 'POWER', name: '供电系统' },
        { id: 'WATER', name: '供水系统' }
      ]
      
      const statuses = ['online', 'warning', 'offline']
      const devices = []
      
      for (let i = 1; i <= 100; i++) {
        const station = stations[Math.floor(Math.random() * stations.length)]
        const deviceType = deviceTypes[Math.floor(Math.random() * deviceTypes.length)]
        const status = statuses[Math.floor(Math.random() * statuses.length)]
        
        devices.push({
          id: `DEV${String(i).padStart(4, '0')}`,
          name: `${deviceType.name}${i}`,
          stationId: station.id,
          stationName: station.name,
          typeId: deviceType.id,
          typeName: deviceType.name,
          status: status,
          energyConsumption: Math.random() * 10 + 2,
          temperature: Math.random() * 50 + 40,
          installationDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
          manufacturer: ['西门子', '施耐德', '三菱', 'ABB', '华为'][Math.floor(Math.random() * 5)],
          operatingHours: Math.floor(Math.random() * 10000) + 1000,
          maintenanceCycle: 90,
          lastMaintenance: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
          nextMaintenance: new Date(Date.now() + (90 - Math.random() * 90) * 24 * 60 * 60 * 1000),
          lastOnline: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000)
        })
      }
      
      return devices
    },
    
    // 更新设备统计
    updateDeviceStats() {
      this.deviceStats.total = this.filteredDevices.length
      this.deviceStats.online = this.filteredDevices.filter(device => device.status === 'online').length
      this.deviceStats.warning = this.filteredDevices.filter(device => device.status === 'warning').length
      this.deviceStats.offline = this.filteredDevices.filter(device => device.status === 'offline').length
      
      // 更新图表
      this.updateDeviceStatusChart()
    },
    
    // 初始化设备状态分布图
    initDeviceStatusChart() {
      const chartDom = document.getElementById('deviceStatusChart')
      if (!chartDom) return
      
      this.deviceStatusChart = echarts.init(chartDom)
      this.updateDeviceStatusChart()
      
      // 监听窗口大小变化
      this.resizeHandler = this.handleResize
      window.addEventListener('resize', this.resizeHandler)
    },
    
    // 更新设备状态分布图
    updateDeviceStatusChart() {
      if (!this.deviceStatusChart) return
      
      const option = {
        title: {
          text: '设备状态分布',
          left: 'center'
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          data: ['在线', '警告', '离线']
        },
        series: [
          {
            name: '设备状态',
            type: 'pie',
            radius: '50%',
            center: ['50%', '60%'],
            data: [
              { value: this.deviceStats.online, name: '在线', itemStyle: { color: '#67C23A' } },
              { value: this.deviceStats.warning, name: '警告', itemStyle: { color: '#E6A23C' } },
              { value: this.deviceStats.offline, name: '离线', itemStyle: { color: '#F56C6C' } }
            ],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      }
      
      this.deviceStatusChart.setOption(option)
    },
    
    // 搜索设备
    handleSearch() {
      this.filteredDevices = this.devices.filter(device => {
        const matchesStation = !this.searchParams.station || device.stationId === this.searchParams.station
        const matchesStatus = !this.searchParams.status || device.status === this.searchParams.status
        const matchesKeyword = !this.searchParams.keyword || 
          device.name.includes(this.searchParams.keyword) || 
          device.id.includes(this.searchParams.keyword)
        
        return matchesStation && matchesStatus && matchesKeyword
      })
      
      this.updateDeviceStats()
    },
    
    // 选择设备
    handleSelectionChange(selection) {
      this.selectedDevices = selection
    },
    
    // 添加设备
    handleAddDevice() {
      this.$message.info('添加设备功能待实现')
    },
    
    // 批量操作
    handleBatchOperation(type) {
      if (this.selectedDevices.length === 0) {
        this.$message.warning('请先选择设备')
        return
      }
      
      const operationName = type === 'start' ? '启动' : '停止'
      this.$confirm(`确定要批量${operationName}选中的${this.selectedDevices.length}台设备吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$message.success(`已批量${operationName}${this.selectedDevices.length}台设备`)
      }).catch(() => {
        this.$message.info('已取消操作')
      })
    },
    
    // 查看设备详情
    handleViewDetail(device) {
      this.selectedDevice = device
      this.detailDialogVisible = true
      
      this.$nextTick(() => {
        this.initEnergyTrendChart()
      })
    },
    
    // 控制设备
    handleControlDevice(device, action) {
      const actionName = action === 'restart' ? '重启' : '控制'
      this.$confirm(`确定要${actionName}设备 ${device.name} 吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$message.success(`已${actionName}设备 ${device.name}`)
      }).catch(() => {
        this.$message.info('已取消操作')
      })
    },
    
    // 删除设备
    handleDeleteDevice(deviceId) {
      this.$confirm('确定要删除该设备吗？此操作不可恢复', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'danger'
      }).then(() => {
        this.devices = this.devices.filter(device => device.id !== deviceId)
        this.handleSearch()
        this.$message.success('设备删除成功')
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },
    
    // 初始化能耗趋势图
    initEnergyTrendChart() {
      const chartDom = document.getElementById('energyTrendChart')
      if (!chartDom || !this.selectedDevice) return
      
      if (this.energyTrendChart) {
        this.energyTrendChart.dispose()
      }
      
      this.energyTrendChart = echarts.init(chartDom)
      
      // 生成模拟能耗趋势数据
      const dates = []
      const energyData = []
      const today = new Date()
      
      for (let i = 30; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        dates.push(`${date.getMonth() + 1}/${date.getDate()}`)
        energyData.push((Math.random() * 8 + 2).toFixed(2))
      }
      
      const option = {
        title: {
          text: '最近30天能耗趋势',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          formatter: '{b}: {c} kWh'
        },
        xAxis: {
          type: 'category',
          data: dates,
          axisLabel: {
            rotate: 45
          }
        },
        yAxis: {
          type: 'value',
          name: '能耗(kWh)'
        },
        series: [
          {
            data: energyData,
            type: 'line',
            smooth: true,
            itemStyle: {
              color: '#409EFF'
            },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  {
                    offset: 0,
                    color: 'rgba(64, 158, 255, 0.3)'
                  },
                  {
                    offset: 1,
                    color: 'rgba(64, 158, 255, 0.1)'
                  }
                ]
              }
            }
          }
        ]
      }
      
      this.energyTrendChart.setOption(option)
      
      // 监听窗口大小变化
      window.addEventListener('resize', () => {
        this.energyTrendChart.resize()
      })
    },
    
    // 关闭详情弹窗
    handleDetailDialogClose() {
      if (this.energyTrendChart) {
        this.energyTrendChart.dispose()
        this.energyTrendChart = null
      }
    },
    
    // 格式化日期
    formatDate(date) {
      if (!date) return ''
      
      const d = new Date(date)
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      const hours = String(d.getHours()).padStart(2, '0')
      const minutes = String(d.getMinutes()).padStart(2, '0')
      const seconds = String(d.getSeconds()).padStart(2, '0')
      
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    },
    
    // 分页大小变化
    handleSizeChange(size) {
      this.pagination.pageSize = size
    },
    
    // 当前页变化
    handleCurrentChange(current) {
      this.pagination.currentPage = current
    }
  }
}
</script>

<style scoped>
.device-management-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  color: #303133;
}

.header-buttons {
  display: flex;
  gap: 10px;
}

.status-overview {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.status-card {
  flex: 1;
  min-width: 200px;
}

.status-item {
  text-align: center;
}

.status-count {
  font-size: 36px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.status-label {
  font-size: 14px;
  color: #606266;
}

.status-item.online .status-count {
  color: #67C23A;
}

.status-item.warning .status-count {
  color: #E6A23C;
}

.status-item.offline .status-count {
  color: #F56C6C;
}

.chart-card {
  margin-bottom: 20px;
}

.chart {
  width: 100%;
  height: 400px;
}

.table-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-controls {
  display: flex;
  gap: 10px;
  align-items: center;
}

.control-item {
  width: 180px;
}

.table-content {
  margin-top: 20px;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.device-detail {
  padding: 10px;
}

.detail-info {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.info-item {
  display: flex;
  align-items: center;
}

.info-label {
  width: 120px;
  font-weight: bold;
  color: #606266;
}

.info-value {
  color: #303133;
}

.temp-warning {
  color: #F56C6C;
  font-weight: bold;
}

.mt-20 {
  margin-top: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .device-management-container {
    padding: 10px;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .header-buttons {
    flex-wrap: wrap;
  }
  
  .status-overview {
    flex-direction: column;
  }
  
  .table-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .control-item {
    width: 100%;
  }
}
</style>