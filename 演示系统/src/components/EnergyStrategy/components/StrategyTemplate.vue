<template>
  <div class="strategy-template-container">
    <el-card shadow="hover" class="template-card">
      <div slot="header" class="card-header">
        <h3 class="card-title">
          <i class="fa fa-folder-open"></i> 策略模板管理
        </h3>
        <div class="header-actions">
          <el-button type="primary" size="small" @click="handleCreateTemplate">
            <i class="fa fa-plus"></i> 创建模板
          </el-button>
          <el-button size="small" @click="handleImportTemplate">
            <i class="fa fa-upload"></i> 导入
          </el-button>
        </div>
      </div>
      
      <!-- 模板分类导航 -->
      <div class="template-categories">
        <el-radio-group v-model="activeCategory" size="small">
          <el-radio-button label="all">全部模板</el-radio-button>
          <el-radio-button label="lighting">照明系统</el-radio-button>
          <el-radio-button label="airConditioning">空调系统</el-radio-button>
          <el-radio-button label="ventilation">通风系统</el-radio-button>
          <el-radio-button label="renewableEnergy">可再生能源</el-radio-button>
          <el-radio-button label="smartControl">智能控制</el-radio-button>
        </el-radio-group>
      </div>
      
      <!-- 模板搜索 -->
      <div class="template-search">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索模板名称..."
          size="small"
          clearable
        >
          <template #prefix>
            <i class="fa fa-search"></i>
          </template>
        </el-input>
      </div>
      
      <!-- 模板列表 -->
      <div class="template-list">
        <el-row :gutter="20">
          <el-col
            v-for="template in filteredTemplates"
            :key="template.id"
            :xs="24"
            :sm="12"
            :md="8"
            :lg="6"
          >
            <div class="template-item" @click="handleSelectTemplate(template)">
              <div class="template-icon" :style="{ backgroundColor: template.color }">
                <i :class="['fa', template.icon]"></i>
              </div>
              <div class="template-info">
                <h4 class="template-name">{{ template.name }}</h4>
                <p class="template-desc">{{ template.description }}</p>
                <div class="template-meta">
                  <el-tag size="mini" :type="template.type === 'system' ? 'info' : 'success'">
                    {{ template.type === 'system' ? '系统预设' : '自定义' }}
                  </el-tag>
                  <span class="template-savings">
                    <i class="fa fa-leaf"></i> 预计节能{{ template.expectedSavings }}%
                  </span>
                </div>
              </div>
              <div class="template-actions">
                <el-button
                  type="text"
                  size="mini"
                  @click.stop="handleApplyTemplate(template)"
                >
                  <i class="fa fa-check"></i> 应用
                </el-button>
                <el-button
                  v-if="template.type === 'custom'"
                  type="text"
                  size="mini"
                  @click.stop="handleEditTemplate(template)"
                >
                  <i class="fa fa-edit"></i>
                </el-button>
                <el-button
                  v-if="template.type === 'custom'"
                  type="text"
                  size="mini"
                  danger
                  @click.stop="handleDeleteTemplate(template)"
                >
                  <i class="fa fa-trash"></i>
                </el-button>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-card>
    
    <!-- 模板详情/编辑对话框 -->
    <el-dialog
      :title="dialogType === 'create' ? '创建策略模板' : dialogType === 'edit' ? '编辑策略模板' : '模板详情'"
      :visible.sync="templateDialogVisible"
      width="70%"
      top="5vh"
    >
      <div class="template-form">
        <el-form :model="currentTemplate" label-position="left" label-width="120px">
          <el-row :gutter="20">
            <el-col :xs="24" :md="12">
              <el-form-item label="模板名称">
                <el-input v-model="currentTemplate.name" placeholder="请输入模板名称" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="12">
              <el-form-item label="模板分类">
                <el-select v-model="currentTemplate.category" placeholder="选择分类" style="width: 100%">
                  <el-option label="照明系统" value="lighting" />
                  <el-option label="空调系统" value="airConditioning" />
                  <el-option label="通风系统" value="ventilation" />
                  <el-option label="可再生能源" value="renewableEnergy" />
                  <el-option label="智能控制" value="smartControl" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-form-item label="模板描述">
            <el-input
              v-model="currentTemplate.description"
              type="textarea"
              :rows="3"
              placeholder="请输入模板描述"
            />
          </el-form-item>
          
          <!-- 策略参数配置 -->
          <div class="params-section">
            <h4 class="section-title">
              <i class="fa fa-cogs"></i> 策略参数配置
            </h4>
            
            <template v-if="currentTemplate.category === 'lighting'">
              <el-row :gutter="20">
                <el-col :xs="24" :md="8">
                  <el-form-item label="照明类型">
                    <el-select v-model="currentTemplate.params.lightingType" style="width: 100%">
                      <el-option label="LED替换" value="ledReplacement" />
                      <el-option label="感应控制" value="sensorControl" />
                      <el-option label="定时控制" value="timedControl" />
                      <el-option label="自然光调节" value="daylightControl" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :md="8">
                  <el-form-item label="感应灵敏度">
                    <el-slider
                      v-model="currentTemplate.params.sensitivity"
                      :min="1"
                      :max="100"
                      :format-tooltip="val => val + '%'"
                    />
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :md="8">
                  <el-form-item label="延迟关闭时间">
                    <el-input-number
                      v-model="currentTemplate.params.delayTime"
                      :min="0"
                      :max="30"
                      :step="1"
                    /> 分钟
                  </el-form-item>
                </el-col>
              </el-row>
            </template>
            
            <template v-if="currentTemplate.category === 'airConditioning'">
              <el-row :gutter="20">
                <el-col :xs="24" :md="6">
                  <el-form-item label="目标温度">
                    <el-input-number
                      v-model="currentTemplate.params.targetTemp"
                      :min="18"
                      :max="28"
                      :step="0.5"
                    /> °C
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :md="6">
                  <el-form-item label="温度浮动">
                    <el-input-number
                      v-model="currentTemplate.params.tempRange"
                      :min="0.5"
                      :max="3"
                      :step="0.5"
                    /> °C
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :md="6">
                  <el-form-item label="运行模式">
                    <el-select v-model="currentTemplate.params.mode" style="width: 100%">
                      <el-option label="制冷" value="cooling" />
                      <el-option label="制热" value="heating" />
                      <el-option label="自动" value="auto" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :md="6">
                  <el-form-item label="夜间模式">
                    <el-switch v-model="currentTemplate.params.nightMode" />
                  </el-form-item>
                </el-col>
              </el-row>
            </template>
            
            <template v-if="currentTemplate.category === 'ventilation'">
              <el-row :gutter="20">
                <el-col :xs="24" :md="8">
                  <el-form-item label="CO₂阈值">
                    <el-input-number
                      v-model="currentTemplate.params.co2Threshold"
                      :min="400"
                      :max="2000"
                      :step="50"
                    /> ppm
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :md="8">
                  <el-form-item label="最小风量">
                    <el-input-number
                      v-model="currentTemplate.params.minAirflow"
                      :min="10"
                      :max="100"
                      :step="5"
                    /> %
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :md="8">
                  <el-form-item label="时段控制">
                    <el-select v-model="currentTemplate.params.timeControl" multiple style="width: 100%">
                      <el-option label="早高峰(6-9)" value="morning" />
                      <el-option label="午间(11-13)" value="noon" />
                      <el-option label="晚高峰(17-20)" value="evening" />
                      <el-option label="夜间(22-6)" value="night" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
            </template>
            
            <template v-if="currentTemplate.category === 'renewableEnergy'">
              <el-row :gutter="20">
                <el-col :xs="24" :md="8">
                  <el-form-item label="光伏装机容量">
                    <el-input-number
                      v-model="currentTemplate.params.solarCapacity"
                      :min="0"
                      :max="10000"
                      :step="100"
                    /> kW
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :md="8">
                  <el-form-item label="储能容量">
                    <el-input-number
                      v-model="currentTemplate.params.storageCapacity"
                      :min="0"
                      :max="5000"
                      :step="50"
                    /> kWh
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :md="8">
                  <el-form-item label="自发自用率">
                    <el-slider
                      v-model="currentTemplate.params.selfUseRate"
                      :min="0"
                      :max="100"
                      :format-tooltip="val => val + '%'"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
            </template>
            
            <template v-if="currentTemplate.category === 'smartControl'">
              <el-row :gutter="20">
                <el-col :xs="24" :md="6">
                  <el-form-item label="AI优化">
                    <el-switch v-model="currentTemplate.params.aiOptimization" />
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :md="6">
                  <el-form-item label="负荷预测">
                    <el-switch v-model="currentTemplate.params.loadForecast" />
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :md="6">
                  <el-form-item label="需求响应">
                    <el-switch v-model="currentTemplate.params.demandResponse" />
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :md="6">
                  <el-form-item label="实时监控">
                    <el-switch v-model="currentTemplate.params.realtimeMonitor" />
                  </el-form-item>
                </el-col>
              </el-row>
            </template>
          </div>
          
          <!-- 预期效果 -->
          <div class="effects-section">
            <h4 class="section-title">
              <i class="fa fa-line-chart"></i> 预期效果
            </h4>
            <el-row :gutter="20">
              <el-col :xs="24" :md="8">
                <el-form-item label="预计节能率">
                  <el-input-number
                    v-model="currentTemplate.expectedSavings"
                    :min="0"
                    :max="50"
                    :precision="1"
                    :step="0.5"
                  /> %
                </el-form-item>
              </el-col>
              <el-col :xs="24" :md="8">
                <el-form-item label="预计投资">
                  <el-input-number
                    v-model="currentTemplate.expectedInvestment"
                    :min="0"
                    :max="10000000"
                    :step="10000"
                    :formatter="value => value.toLocaleString()"
                  /> 元
                </el-form-item>
              </el-col>
              <el-col :xs="24" :md="8">
                <el-form-item label="预计回收期">
                  <el-input-number
                    v-model="currentTemplate.expectedPaybackPeriod"
                    :min="0"
                    :max="10"
                    :precision="1"
                    :step="0.1"
                  /> 年
                </el-form-item>
              </el-col>
            </el-row>
          </div>
        </el-form>
      </div>
      
      <div slot="footer" class="dialog-footer">
        <el-button @click="templateDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveTemplate">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'StrategyTemplate',
  data() {
    return {
      activeCategory: 'all',
      searchKeyword: '',
      templateDialogVisible: false,
      dialogType: 'create',
      currentTemplate: this.getEmptyTemplate(),
      templates: [
        {
          id: 'sys-001',
          name: 'LED照明替换方案',
          description: '全面更换为高效率LED灯具，配合智能调光系统',
          category: 'lighting',
          type: 'system',
          icon: 'fa-lightbulb-o',
          color: '#F7C94B',
          expectedSavings: 5,
          params: {
            lightingType: 'ledReplacement',
            sensitivity: 80,
            delayTime: 5
          },
          expectedInvestment: 1200000,
          expectedPaybackPeriod: 2.5
        },
        {
          id: 'sys-002',
          name: '空调变频控制策略',
          description: '采用变频技术，根据负荷自动调节空调运行频率',
          category: 'airConditioning',
          type: 'system',
          icon: 'fa-snowflake-o',
          color: '#409EFF',
          expectedSavings: 9,
          params: {
            targetTemp: 24,
            tempRange: 1.5,
            mode: 'auto',
            nightMode: true
          },
          expectedInvestment: 2800000,
          expectedPaybackPeriod: 3.2
        },
        {
          id: 'sys-003',
          name: '智能通风控制',
          description: '基于CO₂浓度和人员密度智能调节通风系统',
          category: 'ventilation',
          type: 'system',
          icon: 'fa-wind',
          color: '#67C23A',
          expectedSavings: 3.5,
          params: {
            co2Threshold: 800,
            minAirflow: 30,
            timeControl: ['morning', 'evening']
          },
          expectedInvestment: 900000,
          expectedPaybackPeriod: 2.0
        },
        {
          id: 'sys-004',
          name: '光伏发电系统',
          description: '在站房屋顶安装太阳能光伏发电系统',
          category: 'renewableEnergy',
          type: 'system',
          icon: 'fa-sun-o',
          color: '#E6A23C',
          expectedSavings: 12,
          params: {
            solarCapacity: 5000,
            storageCapacity: 2000,
            selfUseRate: 80
          },
          expectedInvestment: 8500000,
          expectedPaybackPeriod: 5.5
        },
        {
          id: 'sys-005',
          name: '综合能源管理',
          description: 'AI驱动的综合能源优化调度系统',
          category: 'smartControl',
          type: 'system',
          icon: 'fa-cogs',
          color: '#909399',
          expectedSavings: 5.5,
          params: {
            aiOptimization: true,
            loadForecast: true,
            demandResponse: true,
            realtimeMonitor: true
          },
          expectedInvestment: 1800000,
          expectedPaybackPeriod: 2.0
        },
        {
          id: 'sys-006',
          name: '夜间照明优化',
          description: '针对夜间低客流时段的照明节能控制',
          category: 'lighting',
          type: 'system',
          icon: 'fa-moon-o',
          color: '#722ED1',
          expectedSavings: 2,
          params: {
            lightingType: 'timedControl',
            sensitivity: 50,
            delayTime: 10
          },
          expectedInvestment: 300000,
          expectedPaybackPeriod: 1.5
        },
        {
          id: 'sys-007',
          name: '高峰时段空调策略',
          description: '针对早晚高峰的空调负荷管理策略',
          category: 'airConditioning',
          type: 'system',
          icon: 'fa-clock-o',
          color: '#F5222D',
          expectedSavings: 4,
          params: {
            targetTemp: 25,
            tempRange: 2,
            mode: 'cooling',
            nightMode: false
          },
          expectedInvestment: 800000,
          expectedPaybackPeriod: 2.2
        },
        {
          id: 'custom-001',
          name: '候车厅智能照明',
          description: '针对候车厅的自然光感应+定时控制方案',
          category: 'lighting',
          type: 'custom',
          icon: 'fa-building',
          color: '#13C2C2',
          expectedSavings: 4.5,
          params: {
            lightingType: 'daylightControl',
            sensitivity: 75,
            delayTime: 3
          },
          expectedInvestment: 450000,
          expectedPaybackPeriod: 1.8,
          createTime: '2025-01-15'
        }
      ]
    }
  },
  computed: {
    filteredTemplates() {
      let result = this.templates
      
      if (this.activeCategory !== 'all') {
        result = result.filter(t => t.category === this.activeCategory)
      }
      
      if (this.searchKeyword) {
        const keyword = this.searchKeyword.toLowerCase()
        result = result.filter(t => 
          t.name.toLowerCase().includes(keyword) ||
          t.description.toLowerCase().includes(keyword)
        )
      }
      
      return result
    }
  },
  methods: {
    getEmptyTemplate() {
      return {
        id: '',
        name: '',
        description: '',
        category: 'lighting',
        type: 'custom',
        icon: 'fa-file-text-o',
        color: '#409EFF',
        expectedSavings: 0,
        params: {
          lightingType: 'ledReplacement',
          sensitivity: 80,
          delayTime: 5,
          targetTemp: 24,
          tempRange: 1.5,
          mode: 'auto',
          nightMode: false,
          co2Threshold: 800,
          minAirflow: 30,
          timeControl: [],
          solarCapacity: 1000,
          storageCapacity: 500,
          selfUseRate: 70,
          aiOptimization: true,
          loadForecast: true,
          demandResponse: false,
          realtimeMonitor: true
        },
        expectedInvestment: 0,
        expectedPaybackPeriod: 0
      }
    },
    
    handleCreateTemplate() {
      this.dialogType = 'create'
      this.currentTemplate = this.getEmptyTemplate()
      this.templateDialogVisible = true
    },
    
    handleEditTemplate(template) {
      this.dialogType = 'edit'
      this.currentTemplate = JSON.parse(JSON.stringify(template))
      this.templateDialogVisible = true
    },
    
    handleSelectTemplate(template) {
      this.$emit('select', template)
    },
    
    handleApplyTemplate(template) {
      this.$emit('apply', template)
    },
    
    handleDeleteTemplate(template) {
      this.$confirm('确定要删除该模板吗？', '确认删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const index = this.templates.findIndex(t => t.id === template.id)
        if (index > -1) {
          this.templates.splice(index, 1)
          this.$message.success('模板删除成功')
        }
      }).catch(() => {})
    },
    
    handleImportTemplate() {
      this.$message.info('模板导入功能开发中...')
    },
    
    handleSaveTemplate() {
      if (!this.currentTemplate.name) {
        this.$message.warning('请输入模板名称')
        return
      }
      
      if (this.dialogType === 'create') {
        this.currentTemplate.id = 'custom-' + Date.now()
        this.currentTemplate.createTime = new Date().toISOString().split('T')[0]
        this.templates.push({ ...this.currentTemplate })
        this.$message.success('模板创建成功')
      } else {
        const index = this.templates.findIndex(t => t.id === this.currentTemplate.id)
        if (index > -1) {
          this.templates.splice(index, 1, { ...this.currentTemplate })
          this.$message.success('模板更新成功')
        }
      }
      
      this.templateDialogVisible = false
    }
  }
}
</script>

<style scoped>
.strategy-template-container {
  margin-bottom: 20px;
}

.template-card {
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

.template-categories {
  margin-bottom: 15px;
  overflow-x: auto;
}

.template-search {
  margin-bottom: 15px;
  max-width: 300px;
}

.template-list {
  min-height: 200px;
}

.template-item {
  background: #fff;
  border: 1px solid #EBEEF5;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.template-item:hover {
  border-color: #409EFF;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.template-icon {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
}

.template-icon i {
  font-size: 24px;
  color: #fff;
}

.template-info {
  margin-bottom: 10px;
}

.template-name {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin: 0 0 5px 0;
}

.template-desc {
  font-size: 12px;
  color: #909399;
  margin: 0 0 10px 0;
  line-height: 1.4;
  height: 36px;
  overflow: hidden;
}

.template-meta {
  display: flex;
  align-items: center;
  gap: 10px;
}

.template-savings {
  font-size: 12px;
  color: #67C23A;
}

.template-actions {
  position: absolute;
  top: 10px;
  right: 10px;
  display: none;
  gap: 5px;
}

.template-item:hover .template-actions {
  display: flex;
}

.template-form {
  padding: 10px 0;
}

.section-title {
  font-size: 16px;
  color: #303133;
  margin: 0 0 15px 0;
  padding-bottom: 10px;
  border-bottom: 1px solid #EBEEF5;
  display: flex;
  align-items: center;
}

.section-title i {
  margin-right: 8px;
  color: #409EFF;
}

.params-section,
.effects-section {
  margin-top: 20px;
  padding: 15px;
  background: #F5F7FA;
  border-radius: 8px;
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
