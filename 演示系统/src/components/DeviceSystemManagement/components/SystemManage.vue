<template>
  <div class="system-manage">
    <div class="toolbar">
      <el-button type="primary" @click="handleAdd">
        <i class="fa fa-plus"></i> 新增系统
      </el-button>
      <el-button type="success" @click="handleExport">
        <i class="fa fa-download"></i> 导出
      </el-button>
    </div>

    <el-table :data="systemList" stripe style="width: 100%" v-loading="loading">
      <el-table-column prop="systemId" label="系统ID" width="120" />
      <el-table-column prop="systemName" label="系统名称" width="180" />
      <el-table-column prop="systemType" label="系统类型" width="120">
        <template #default="scope">
          <el-tag :type="getTypeTag(scope.row.systemType)">
            {{ scope.row.systemType }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="deviceCount" label="设备数量" width="100" align="center" />
      <el-table-column prop="totalPower" label="总功率(kW)" width="120" align="right" />
      <el-table-column prop="status" label="运行状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === 'running' ? 'success' : 'info'">
            {{ scope.row.status === 'running' ? '运行中' : '停机' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="description" label="系统描述" min-width="200" show-overflow-tooltip />
      <el-table-column prop="createTime" label="创建时间" width="180" />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="scope">
          <el-button size="small" type="primary" @click="handleEdit(scope.row)">
            <i class="fa fa-edit"></i> 编辑
          </el-button>
          <el-button size="small" type="danger" @click="handleDelete(scope.row)">
            <i class="fa fa-trash"></i> 删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="dialogType === 'add' ? '新增系统' : '编辑系统'" width="600px">
      <el-form :model="currentSystem" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="系统ID" v-if="dialogType === 'edit'">
          <el-input v-model="currentSystem.systemId" disabled />
        </el-form-item>
        <el-form-item label="系统名称" prop="systemName">
          <el-input v-model="currentSystem.systemName" placeholder="请输入系统名称" />
        </el-form-item>
        <el-form-item label="系统类型" prop="systemType">
          <el-select v-model="currentSystem.systemType" placeholder="请选择系统类型">
            <el-option label="核心动力系统" value="核心动力系统" />
            <el-option label="环境控制系统" value="环境控制系统" />
            <el-option label="照明系统" value="照明系统" />
            <el-option label="电梯扶梯系统" value="电梯扶梯系统" />
            <el-option label="供水系统" value="供水系统" />
            <el-option label="供电系统" value="供电系统" />
          </el-select>
        </el-form-item>
        <el-form-item label="总功率(kW)" prop="totalPower">
          <el-input-number v-model="currentSystem.totalPower" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="运行状态" prop="status">
          <el-radio-group v-model="currentSystem.status">
            <el-radio label="running">运行中</el-radio>
            <el-radio label="stopped">停机</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="系统描述" prop="description">
          <el-input type="textarea" v-model="currentSystem.description" :rows="3" placeholder="请输入系统描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'SystemManage',
  setup() {
    const loading = ref(false)
    const systemList = ref([])
    const dialogVisible = ref(false)
    const dialogType = ref('add')
    const formRef = ref(null)

    const currentSystem = reactive({
      systemId: '',
      systemName: '',
      systemType: '',
      deviceCount: 0,
      totalPower: 0,
      status: 'running',
      description: '',
      createTime: ''
    })

    const rules = {
      systemName: [{ required: true, message: '请输入系统名称', trigger: 'blur' }],
      systemType: [{ required: true, message: '请选择系统类型', trigger: 'change' }],
      totalPower: [{ required: true, message: '请输入总功率', trigger: 'blur' }]
    }

    const generateId = () => 'SYS' + Date.now().toString(36).toUpperCase()

    const initData = () => {
      loading.value = true
      setTimeout(() => {
        systemList.value = [
          {
            systemId: 'SYS001',
            systemName: '空调制冷系统',
            systemType: '环境控制系统',
            deviceCount: 45,
            totalPower: 1250.5,
            status: 'running',
            description: '车站中央空调制冷设备系统，负责候车大厅及办公区域制冷',
            createTime: '2024-01-15 10:30:00'
          },
          {
            systemId: 'SYS002',
            systemName: '照明系统',
            systemType: '照明系统',
            deviceCount: 320,
            totalPower: 85.6,
            status: 'running',
            description: '车站全部照明设备，包括候车大厅、站台、办公区等',
            createTime: '2024-01-15 10:30:00'
          },
          {
            systemId: 'SYS003',
            systemName: '电梯扶梯系统',
            systemType: '电梯扶梯系统',
            deviceCount: 28,
            totalPower: 680.0,
            status: 'running',
            description: '车站所有电梯和扶梯设备',
            createTime: '2024-01-15 10:30:00'
          },
          {
            systemId: 'SYS004',
            systemName: '给排水系统',
            systemType: '供水系统',
            deviceCount: 15,
            totalPower: 45.2,
            status: 'running',
            description: '车站给水排水设备系统',
            createTime: '2024-01-15 10:30:00'
          },
          {
            systemId: 'SYS005',
            systemName: '供电系统',
            systemType: '供电系统',
            deviceCount: 8,
            totalPower: 0,
            status: 'running',
            description: '车站主供电及配电系统',
            createTime: '2024-01-15 10:30:00'
          }
        ]
        loading.value = false
      }, 500)
    }

    const getTypeTag = (type) => {
      const map = {
        '核心动力系统': 'danger',
        '环境控制系统': 'primary',
        '照明系统': 'success',
        '电梯扶梯系统': 'warning',
        '供水系统': 'info',
        '供电系统': ''
      }
      return map[type] || ''
    }

    const handleAdd = () => {
      dialogType.value = 'add'
      Object.assign(currentSystem, {
        systemId: '',
        systemName: '',
        systemType: '',
        deviceCount: 0,
        totalPower: 0,
        status: 'running',
        description: '',
        createTime: ''
      })
      dialogVisible.value = true
    }

    const handleEdit = (row) => {
      dialogType.value = 'edit'
      Object.assign(currentSystem, row)
      dialogVisible.value = true
    }

    const handleDelete = (row) => {
      ElMessageBox.confirm('确定要删除系统"' + row.systemName + '"吗？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        systemList.value = systemList.value.filter(item => item.systemId !== row.systemId)
        ElMessage.success('删除成功')
      }).catch(() => {
        ElMessage.info('已取消删除')
      })
    }

    const handleSave = async () => {
      try {
        await formRef.value.validate()
        if (dialogType.value === 'add') {
          const newSystem = {
            ...currentSystem,
            systemId: generateId(),
            createTime: new Date().toLocaleString()
          }
          systemList.value.push(newSystem)
          ElMessage.success('添加成功')
        } else {
          const index = systemList.value.findIndex(item => item.systemId === currentSystem.systemId)
          if (index !== -1) {
            systemList.value[index] = { ...currentSystem }
          }
          ElMessage.success('更新成功')
        }
        dialogVisible.value = false
      } catch (error) {
        console.error('验证失败', error)
      }
    }

    const handleExport = () => {
      ElMessage.info('导出功能开发中')
    }

    onMounted(() => {
      initData()
    })

    return {
      loading,
      systemList,
      dialogVisible,
      dialogType,
      formRef,
      currentSystem,
      rules,
      getTypeTag,
      handleAdd,
      handleEdit,
      handleDelete,
      handleSave,
      handleExport
    }
  }
}
</script>

<style scoped>
.system-manage {
  padding: 10px;
}

.toolbar {
  margin-bottom: 15px;
}

.toolbar .el-button {
  margin-right: 10px;
}
</style>
