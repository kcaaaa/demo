<template>
  <div class="device-category-manage">
    <div class="toolbar">
      <el-button type="primary" @click="handleAddCategory">
        <i class="fa fa-plus"></i> 新增分类
      </el-button>
      <el-button type="success" @click="handleExpandAll">
        <i class="fa fa-expand"></i> 展开全部
      </el-button>
      <el-button type="info" @click="handleCollapseAll">
        <i class="fa fa-compress"></i> 折叠全部
      </el-button>
      <el-button type="warning" @click="handleExport">
        <i class="fa fa-download"></i> 导出
      </el-button>
    </div>

    <div class="category-content">
      <el-row :gutter="20">
        <el-col :span="10">
          <el-card shadow="hover" class="category-tree-card">
            <template #header>
              <div class="card-header">
                <span>设备分类树</span>
                <span class="category-count">共 {{ categoryList.length }} 个分类</span>
              </div>
            </template>
            <el-tree
              ref="treeRef"
              :data="categoryList"
              :props="treeProps"
              node-key="id"
              :default-expanded-keys="expandedKeys"
              :expand-on-click-node="false"
              highlight-current
              @node-click="handleNodeClick"
            >
              <template #default="{ node, data }">
                <div class="tree-node">
                  <div class="node-icon" :style="{ background: data.color }">
                    <i :class="data.icon"></i>
                  </div>
                  <span class="node-label">{{ data.name }}</span>
                  <span class="node-badge">
                    <el-tag size="small" :type="data.deviceCount > 0 ? '' : 'info'">
                      {{ data.deviceCount }} 设备
                    </el-tag>
                  </span>
                  <span class="node-actions">
                    <el-button size="small" type="primary" text @click.stop="handleEditCategory(data)">
                      <i class="fa fa-edit"></i>
                    </el-button>
                    <el-button size="small" type="danger" text @click.stop="handleDeleteCategory(data)">
                      <i class="fa fa-trash"></i>
                    </el-button>
                  </span>
                </div>
              </template>
            </el-tree>
          </el-card>
        </el-col>

        <el-col :span="14">
          <el-card shadow="hover" v-loading="loading">
            <template #header>
              <div class="card-header">
                <span>{{ selectedCategory ? selectedCategory.name : '分类详情' }}</span>
                <div class="header-actions" v-if="selectedCategory">
                  <el-button size="small" type="primary" @click="handleAddChild">
                    <i class="fa fa-plus"></i> 添加子分类
                  </el-button>
                  <el-button size="small" @click="handleAddDevice">
                    <i class="fa fa-cog"></i> 管理设备
                  </el-button>
                </div>
              </div>
            </template>

            <div v-if="selectedCategory" class="category-detail">
              <div class="detail-header">
                <div class="detail-icon" :style="{ background: selectedCategory.color }">
                  <i :class="selectedCategory.icon"></i>
                </div>
                <div class="detail-info">
                  <h3>{{ selectedCategory.name }}</h3>
                  <p>{{ selectedCategory.description || '暂无描述' }}</p>
                </div>
              </div>

              <el-divider />

              <div class="detail-stats">
                <el-row :gutter="20">
                  <el-col :span="8">
                    <div class="stat-item">
                      <div class="stat-value">{{ selectedCategory.deviceCount }}</div>
                      <div class="stat-label">设备数量</div>
                    </div>
                  </el-col>
                  <el-col :span="8">
                    <div class="stat-item">
                      <div class="stat-value">{{ selectedCategory.totalConsumption.toFixed(1) }}</div>
                      <div class="stat-label">月能耗(kWh)</div>
                    </div>
                  </el-col>
                  <el-col :span="8">
                    <div class="stat-item">
                      <div class="stat-value">{{ selectedCategory.childCount }}</div>
                      <div class="stat-label">子分类数</div>
                    </div>
                  </el-col>
                </el-row>
              </div>

              <el-divider />

              <div class="detail-info-grid">
                <div class="info-row">
                  <span class="info-label">分类编码:</span>
                  <span class="info-value">{{ selectedCategory.code }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">分类类型:</span>
                  <el-tag :type="getTypeTag(selectedCategory.type)">{{ getTypeName(selectedCategory.type) }}</el-tag>
                </div>
                <div class="info-row">
                  <span class="info-label">所属系统:</span>
                  <span class="info-value">{{ selectedCategory.systemName || '通用' }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">创建时间:</span>
                  <span class="info-value">{{ selectedCategory.createTime }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">状态:</span>
                  <el-tag :type="selectedCategory.status === 'active' ? 'success' : 'danger'">
                    {{ selectedCategory.status === 'active' ? '启用' : '停用' }}
                  </el-tag>
                </div>
              </div>

              <div class="detail-chart" v-if="selectedCategory.deviceCount > 0">
                <h4>能耗分布</h4>
                <div ref="categoryChartRef" class="mini-chart"></div>
              </div>
            </div>

            <div v-else class="empty-detail">
              <i class="fa fa-sitemap"></i>
              <p>请选择一个分类查看详情</p>
            </div>
          </el-card>

          <el-card shadow="hover" style="margin-top: 20px;" v-if="selectedCategory">
            <template #header>
              <span>该分类下的设备</span>
            </template>
            <el-table :data="categoryDevices" stripe max-height="300">
              <el-table-column prop="deviceId" label="设备ID" width="120" />
              <el-table-column prop="deviceName" label="设备名称" min-width="150" />
              <el-table-column prop="model" label="设备型号" width="150" />
              <el-table-column prop="location" label="安装位置" width="150" />
              <el-table-column prop="status" label="状态" width="100" align="center">
                <template #default="scope">
                  <el-tag :type="getStatusType(scope.row.status)" size="small">
                    {{ getStatusName(scope.row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增分类' : '编辑分类'"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="categoryForm"
        :rules="formRules"
        label-width="100px"
        class="category-form"
      >
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="categoryForm.name" placeholder="请输入分类名称" maxlength="50" show-word-limit />
        </el-form-item>
        <el-form-item label="分类编码" prop="code">
          <el-input v-model="categoryForm.code" placeholder="请输入分类编码" :disabled="dialogType === 'edit'" />
        </el-form-item>
        <el-form-item label="上级分类" prop="parentId">
          <el-cascader
            v-model="categoryForm.parentId"
            :options="cascaderOptions"
            :props="{ checkStrictly: true, value: 'id', label: 'name', emitPath: false }"
            placeholder="请选择上级分类（留空为顶级分类）"
            clearable
          />
        </el-form-item>
        <el-form-item label="分类类型" prop="type">
          <el-select v-model="categoryForm.type" placeholder="请选择分类类型">
            <el-option label="设备分类" value="equipment" />
            <el-option label="系统分类" value="system" />
            <el-option label="区域分类" value="area" />
            <el-option label="功能分类" value="function" />
          </el-select>
        </el-form-item>
        <el-form-item label="分类图标" prop="icon">
          <div class="icon-selector">
            <el-input v-model="categoryForm.icon" placeholder="点击选择图标" readonly @click="showIconPicker = true">
              <template #append>
                <i :class="[categoryForm.icon || 'fa fa-bookmark']"></i>
              </template>
            </el-input>
          </div>
        </el-form-item>
        <el-form-item label="图标颜色" prop="color">
          <el-color-picker v-model="categoryForm.color" :predefine="predefineColors" />
        </el-form-item>
        <el-form-item label="所属系统" prop="systemId">
          <el-select v-model="categoryForm.systemId" placeholder="请选择所属系统">
            <el-option label="通用" value="" />
            <el-option v-for="sys in systemList" :key="sys.id" :label="sys.name" :value="sys.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="categoryForm.sort" :min="0" :max="999" controls-position="right" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="categoryForm.status">
            <el-radio label="active">启用</el-radio>
            <el-radio label="inactive">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="categoryForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入分类描述"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveCategory" :loading="saveLoading">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showIconPicker" title="选择图标" width="600px">
      <div class="icon-picker">
        <div
          v-for="icon in iconList"
          :key="icon"
          class="icon-item"
          :class="{ selected: categoryForm.icon === icon }"
          @click="selectIcon(icon)"
        >
          <i :class="icon"></i>
        </div>
      </div>
      <template #footer>
        <el-button @click="showIconPicker = false">取消</el-button>
        <el-button type="primary" @click="confirmIcon">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, onUnmounted, onBeforeUnmount, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as echarts from 'echarts'

export default {
  name: 'DeviceCategoryManage',
  setup() {
    const loading = ref(false)
    const saveLoading = ref(false)
    const dialogVisible = ref(false)
    const dialogType = ref('add')
    const showIconPicker = ref(false)
    const treeRef = ref(null)
    const formRef = ref(null)
    const selectedCategory = ref(null)
    const expandedKeys = ref(['CAT001', 'CAT002', 'CAT003'])
    const categoryChartRef = ref(null)
    let categoryChart = null

    const disposeChart = () => {
      if (categoryChart) {
        categoryChart.dispose()
        categoryChart = null
      }
    }

    onBeforeUnmount(() => {
      disposeChart()
    })

    onUnmounted(() => {
      disposeChart()
    })

    const treeProps = {
      children: 'children',
      label: 'name'
    }

    const systemList = ref([
      { id: 'SYS001', name: '照明系统' },
      { id: 'SYS002', name: '空调系统' },
      { id: 'SYS003', name: '通风系统' },
      { id: 'SYS004', name: '给排水系统' },
      { id: 'SYS005', name: '电梯系统' },
      { id: 'SYS006', name: '安防系统' }
    ])

    const categoryList = ref([])
    const categoryDevices = ref([])

    const categoryForm = reactive({
      id: '',
      name: '',
      code: '',
      parentId: '',
      type: 'equipment',
      icon: 'fa fa-cube',
      color: '#409EFF',
      systemId: '',
      sort: 0,
      status: 'active',
      description: ''
    })

    const formRules = {
      name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
      code: [{ required: true, message: '请输入分类编码', trigger: 'blur' }],
      type: [{ required: true, message: '请选择分类类型', trigger: 'change' }]
    }

    const predefineColors = [
      '#409EFF',
      '#67C23A',
      '#E6A23C',
      '#F56C6C',
      '#909399',
      '#722ED1',
      '#13C2C2',
      '#FA8C16'
    ]

    const iconList = [
      'fa fa-cube',
      'fa fa-cogs',
      'fa fa-lightbulb-o',
      'fa fa-snowflake-o',
      'fa fa-bolt',
      'fa fa-tachometer',
      'fa fa-wifi',
      'fa fa-camera',
      'fa fa-lock',
      'fa fa-building',
      'fa fa-home',
      'fa fa-industry',
      'fa fa-plug',
      'fa fa-server',
      'fa fa-hdd-o',
      'fa fa-print',
      'fa fa-desktop',
      'fa fa-laptop',
      'fa fa-mobile',
      'fa fa-tablet',
      'fa fa-codepen',
      'fa fa-code',
      'fa fa-database',
      'fa fa-delicious',
      'fa fa-envelope',
      'fa fa-flag',
      'fa fa-gear',
      'fa fa-glass',
      'fa fa-graduation-cap',
      'fa fa-heart',
      'fa fa-key',
      'fa fa-leaf',
      'fa fa-paper-plane',
      'fa fa-star'
    ]

    const cascaderOptions = computed(() => {
      return categoryList.value.map(cat => ({
        ...cat,
        disabled: cat.id === categoryForm.id
      }))
    })

    const generateMockData = () => {
      const categories = [
        {
          id: 'CAT001',
          code: 'LIGHTING',
          name: '照明设备',
          type: 'equipment',
          icon: 'fa fa-lightbulb-o',
          color: '#F56C6C',
          deviceCount: 156,
          totalConsumption: 12580.5,
          childCount: 3,
          systemName: '照明系统',
          status: 'active',
          createTime: '2023-01-15',
          description: '车站所有照明设备分类',
          children: [
            {
              id: 'CAT00101',
              code: 'LIGHTING_MAIN',
              name: '主照明',
              type: 'function',
              icon: 'fa fa-lightbulb-o',
              color: '#F56C6C',
              deviceCount: 89,
              totalConsumption: 8560.2,
              childCount: 0,
              systemName: '照明系统',
              status: 'active',
              createTime: '2023-01-15',
              description: '候车大厅主照明设备'
            },
            {
              id: 'CAT00102',
              code: 'LIGHTING_AUX',
              name: '辅助照明',
              type: 'function',
              icon: 'fa fa-lightbulb-o',
              color: '#F89898',
              deviceCount: 45,
              totalConsumption: 2856.3,
              childCount: 0,
              systemName: '照明系统',
              status: 'active',
              createTime: '2023-01-15',
              description: '走廊、卫生间等辅助照明'
            },
            {
              id: 'CAT00103',
              code: 'LIGHTING_EMERGENCY',
              name: '应急照明',
              type: 'function',
              icon: 'fa fa-exclamation-triangle',
              color: '#FAAD14',
              deviceCount: 22,
              totalConsumption: 1164.0,
              childCount: 0,
              systemName: '照明系统',
              status: 'active',
              createTime: '2023-01-15',
              description: '应急疏散指示照明'
            }
          ]
        },
        {
          id: 'CAT002',
          code: 'HVAC',
          name: '暖通设备',
          type: 'equipment',
          icon: 'fa fa-snowflake-o',
          color: '#409EFF',
          deviceCount: 48,
          totalConsumption: 89560.8,
          childCount: 2,
          systemName: '空调系统',
          status: 'active',
          createTime: '2023-01-10',
          description: '空调、通风相关设备',
          children: [
            {
              id: 'CAT00201',
              code: 'HVAC_AIRCON',
              name: '空调机组',
              type: 'function',
              icon: 'fa fa-snowflake-o',
              color: '#409EFF',
              deviceCount: 32,
              totalConsumption: 68250.5,
              childCount: 0,
              systemName: '空调系统',
              status: 'active',
              createTime: '2023-01-10',
              description: '中央空调机组设备'
            },
            {
              id: 'CAT00202',
              code: 'HVAC_VENT',
              name: '通风设备',
              type: 'function',
              icon: 'fa fa-wind',
              color: '#73D13D',
              deviceCount: 16,
              totalConsumption: 21310.3,
              childCount: 0,
              systemName: '通风系统',
              status: 'active',
              createTime: '2023-01-10',
              description: '风机、风阀等通风设备'
            }
          ]
        },
        {
          id: 'CAT003',
          code: 'ELEVATOR',
          name: '电梯设备',
          type: 'equipment',
          icon: 'fa fa-sort-amount-asc',
          color: '#722ED1',
          deviceCount: 24,
          totalConsumption: 45230.0,
          childCount: 2,
          systemName: '电梯系统',
          status: 'active',
          createTime: '2023-01-12',
          description: '电梯、扶梯设备',
          children: [
            {
              id: 'CAT00301',
              code: 'ELEVATOR_PASSENGER',
              name: '客梯',
              type: 'function',
              icon: 'fa fa-long-arrow-up',
              color: '#722ED1',
              deviceCount: 12,
              totalConsumption: 25680.5,
              childCount: 0,
              systemName: '电梯系统',
              status: 'active',
              createTime: '2023-01-12',
              description: '客运电梯设备'
            },
            {
              id: 'CAT00302',
              code: 'ELEVATOR_ESCALATOR',
              name: '扶梯',
              type: 'function',
              icon: 'fa fa-arrows-v',
              color: '#9254DE',
              deviceCount: 12,
              totalConsumption: 19549.5,
              childCount: 0,
              systemName: '电梯系统',
              status: 'active',
              createTime: '2023-01-12',
              description: '自动扶梯设备'
            }
          ]
        },
        {
          id: 'CAT004',
          code: 'SECURITY',
          name: '安防设备',
          type: 'equipment',
          icon: 'fa fa-shield',
          color: '#52C41A',
          deviceCount: 86,
          totalConsumption: 8560.2,
          childCount: 0,
          systemName: '安防系统',
          status: 'active',
          createTime: '2023-01-18',
          description: '监控、门禁等安防设备'
        },
        {
          id: 'CAT005',
          code: 'POWER',
          name: '供配电设备',
          type: 'equipment',
          icon: 'fa fa-bolt',
          color: '#FAAD14',
          deviceCount: 35,
          totalConsumption: 125680.0,
          childCount: 0,
          systemName: '给排水系统',
          status: 'active',
          createTime: '2023-01-08',
          description: '配电柜、变压器等设备'
        },
        {
          id: 'CAT006',
          code: 'WATER',
          name: '给排水设备',
          type: 'equipment',
          icon: 'fa fa-tint',
          color: '#13C2C2',
          deviceCount: 28,
          totalConsumption: 15680.5,
          childCount: 0,
          systemName: '给排水系统',
          status: 'active',
          createTime: '2023-01-20',
          description: '水泵、水箱等给排水设备'
        }
      ]
      return categories
    }

    const generateMockDevices = (categoryId) => {
      const devices = []
      const prefix = categoryId.substring(0, 4)
      for (let i = 0; i < 5; i++) {
        devices.push({
          deviceId: `${prefix}-${String(i + 1).padStart(3, '0')}`,
          deviceName: `${selectedCategory.value?.name || '设备'}-${i + 1}号`,
          model: `MODEL-${Math.floor(Math.random() * 1000)}`,
          location: `车站${Math.floor(Math.random() * 5) + 1}层`,
          status: ['running', 'idle', 'maintenance', 'fault'][Math.floor(Math.random() * 4)]
        })
      }
      return devices
    }

    const initCategoryChart = () => {
      if (categoryChartRef.value) {
        categoryChart = echarts.init(categoryChartRef.value)
        updateCategoryChart()
      }
    }

    const updateCategoryChart = () => {
      if (!selectedCategory.value) return

      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} kWh ({d}%)'
        },
        series: [{
          type: 'pie',
          radius: ['45%', '70%'],
          center: ['50%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 6,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: { show: false },
          emphasis: {
            label: {
              show: true,
              fontSize: 14,
              fontWeight: 'bold'
            }
          },
          data: [
            { value: Math.random() * 5000 + 1000, name: '已使用' },
            { value: Math.random() * 2000 + 500, name: '剩余容量' }
          ]
        }]
      }

      categoryChart.setOption(option)
    }

    const handleAddCategory = () => {
      dialogType.value = 'add'
      Object.assign(categoryForm, {
        id: '',
        name: '',
        code: '',
        parentId: '',
        type: 'equipment',
        icon: 'fa fa-cube',
        color: '#409EFF',
        systemId: '',
        sort: categoryList.value.length,
        status: 'active',
        description: ''
      })
      dialogVisible.value = true
    }

    const handleEditCategory = (data) => {
      dialogType.value = 'edit'
      Object.assign(categoryForm, {
        ...data,
        parentId: data.parentId || ''
      })
      dialogVisible.value = true
    }

    const handleDeleteCategory = (data) => {
      ElMessageBox.confirm(
        `确定要删除分类"${data.name}"吗？${
          data.deviceCount > 0 ? `该分类下有 ${data.deviceCount} 个设备，删除后设备将归入默认分类。` : ''
        }`,
        '删除确认',
        { type: 'warning' }
      ).then(() => {
        ElMessage.success('删除成功')
      }).catch(() => {})
    }

    const handleSaveCategory = async () => {
      try {
        await formRef.value.validate()
        saveLoading.value = true
        setTimeout(() => {
          saveLoading.value = false
          dialogVisible.value = false
          ElMessage.success(dialogType.value === 'add' ? '新增成功' : '保存成功')
        }, 500)
      } catch (error) {
        console.error('Validation failed:', error)
      }
    }

    const handleNodeClick = (data) => {
      selectedCategory.value = data
      categoryDevices.value = generateMockDevices(data.id)
      nextTick(() => {
        initCategoryChart()
      })
    }

    const handleAddChild = () => {
      if (!selectedCategory.value) return
      dialogType.value = 'add'
      Object.assign(categoryForm, {
        id: '',
        name: '',
        code: `${selectedCategory.value.code}_CHILD`,
        parentId: selectedCategory.value.id,
        type: 'function',
        icon: 'fa fa-circle-o',
        color: selectedCategory.value.color,
        systemId: selectedCategory.value.systemId,
        sort: selectedCategory.value.children?.length || 0,
        status: 'active',
        description: ''
      })
      dialogVisible.value = true
    }

    const handleAddDevice = () => {
      if (!selectedCategory.value) return
      ElMessage.info(`进入设备管理页面，分类：${selectedCategory.value.name}`)
    }

    const handleExpandAll = () => {
      expandedKeys.value = categoryList.value.map(cat => cat.id)
    }

    const handleCollapseAll = () => {
      expandedKeys.value = []
    }

    const handleExport = () => {
      ElMessage.info('导出分类数据')
    }

    const selectIcon = (icon) => {
      categoryForm.icon = icon
    }

    const confirmIcon = () => {
      showIconPicker.value = false
    }

    const getTypeTag = (type) => {
      const types = {
        equipment: '',
        system: 'success',
        area: 'warning',
        function: 'info'
      }
      return types[type] || ''
    }

    const getTypeName = (type) => {
      const types = {
        equipment: '设备分类',
        system: '系统分类',
        area: '区域分类',
        function: '功能分类'
      }
      return types[type] || type
    }

    const getStatusType = (status) => {
      const types = {
        running: 'success',
        idle: 'info',
        maintenance: 'warning',
        fault: 'danger'
      }
      return types[status] || ''
    }

    const getStatusName = (status) => {
      const names = {
        running: '运行中',
        idle: '空闲',
        maintenance: '维护中',
        fault: '故障'
      }
      return names[status] || status
    }

    onMounted(() => {
      categoryList.value = generateMockData()
      if (categoryList.value.length > 0) {
        selectedCategory.value = categoryList.value[0]
        categoryDevices.value = generateMockDevices(categoryList.value[0].id)
        nextTick(() => {
          initCategoryChart()
        })
      }
    })

    return {
      loading,
      saveLoading,
      dialogVisible,
      dialogType,
      showIconPicker,
      treeRef,
      formRef,
      selectedCategory,
      expandedKeys,
      treeProps,
      categoryList,
      categoryDevices,
      categoryForm,
      formRules,
      predefineColors,
      iconList,
      cascaderOptions,
      systemList,
      categoryChartRef,
      handleAddCategory,
      handleEditCategory,
      handleDeleteCategory,
      handleSaveCategory,
      handleNodeClick,
      handleAddChild,
      handleAddDevice,
      handleExpandAll,
      handleCollapseAll,
      handleExport,
      selectIcon,
      confirmIcon,
      getTypeTag,
      getTypeName,
      getStatusType,
      getStatusName
    }
  }
}
</script>

<style scoped>
.device-category-manage {
  padding: 0;
}

.toolbar {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.category-content .el-row {
  margin-bottom: 20px;
}

.category-tree-card {
  height: calc(100vh - 280px);
  overflow-y: auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.category-count {
  font-size: 12px;
  color: #909399;
}

.tree-node {
  display: flex;
  align-items: center;
  flex: 1;
  padding-right: 8px;
}

.node-icon {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
}

.node-icon i {
  font-size: 14px;
  color: #fff;
}

.node-label {
  flex: 1;
  font-size: 14px;
}

.node-badge {
  margin: 0 8px;
}

.node-actions {
  display: none;
  margin-left: 8px;
}

.tree-node:hover .node-actions {
  display: flex;
  gap: 4px;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.detail-header {
  display: flex;
  align-items: center;
}

.detail-icon {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
}

.detail-icon i {
  font-size: 28px;
  color: #fff;
}

.detail-info h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  color: #303133;
}

.detail-info p {
  margin: 0;
  color: #909399;
}

.detail-stats {
  padding: 20px 0;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.stat-label {
  font-size: 13px;
  color: #909399;
  margin-top: 4px;
}

.detail-info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.info-row {
  display: flex;
  align-items: center;
}

.info-label {
  width: 90px;
  color: #909399;
  flex-shrink: 0;
}

.info-value {
  color: #303133;
}

.detail-chart {
  margin-top: 20px;
}

.detail-chart h4 {
  margin: 0 0 16px 0;
  font-size: 14px;
  color: #606266;
}

.mini-chart {
  height: 200px;
}

.empty-detail {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: #909399;
}

.empty-detail i {
  font-size: 48px;
  margin-bottom: 16px;
}

.icon-picker {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 12px;
  max-height: 300px;
  overflow-y: auto;
}

.icon-item {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 2px solid #e4e7ed;
  transition: all 0.2s;
}

.icon-item:hover {
  border-color: #409EFF;
  background: #ecf5ff;
}

.icon-item.selected {
  border-color: #409EFF;
  background: #409EFF;
}

.icon-item.selected i {
  color: #fff;
}

.icon-item i {
  font-size: 20px;
  color: #606266;
}
</style>
