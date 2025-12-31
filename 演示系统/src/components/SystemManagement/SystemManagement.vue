<template>
  <div class="system-management-container">
    <el-card shadow="hover" class="system-card">
      <template #header>
        <div class="card-header">
          <h2>系统管理</h2>
          <div class="header-actions">
            <el-radio-group v-model="currentMode" size="small" @change="handleModeChange">
              <el-radio-button label="single">单站模式</el-radio-button>
              <el-radio-button label="multi">多站模式</el-radio-button>
            </el-radio-group>
          </div>
        </div>
      </template>

      <el-tabs v-model="activeTab" class="system-tabs">
        <!-- 系统概览 -->
        <el-tab-pane label="系统概览" name="overview">
          <div class="system-overview">
            <el-row :gutter="20">
              <el-col :xs="24" :sm="12" :lg="6">
                <el-card class="overview-card">
                  <div class="card-content">
                    <div class="card-icon system-icon">
                      <i class="fas fa-server"></i>
                    </div>
                    <div class="card-info">
                      <div class="card-title">系统版本</div>
                      <div class="card-value">v1.0.0</div>
                    </div>
                  </div>
                </el-card>
              </el-col>
              <el-col :xs="24" :sm="12" :lg="6">
                <el-card class="overview-card">
                  <div class="card-content">
                    <div class="card-icon performance-icon">
                      <i class="fas fa-chart-line"></i>
                    </div>
                    <div class="card-info">
                      <div class="card-title">CPU使用率</div>
                      <div class="card-value">{{ cpuUsage }}%</div>
                    </div>
                  </div>
                </el-card>
              </el-col>
              <el-col :xs="24" :sm="12" :lg="6">
                <el-card class="overview-card">
                  <div class="card-content">
                    <div class="card-icon memory-icon">
                      <i class="fas fa-memory"></i>
                    </div>
                    <div class="card-info">
                      <div class="card-title">内存使用率</div>
                      <div class="card-value">{{ memoryUsage }}%</div>
                    </div>
                  </div>
                </el-card>
              </el-col>
              <el-col :xs="24" :sm="12" :lg="6">
                <el-card class="overview-card">
                  <div class="card-content">
                    <div class="card-icon storage-icon">
                      <i class="fas fa-hdd"></i>
                    </div>
                    <div class="card-info">
                      <div class="card-title">磁盘使用率</div>
                      <div class="card-value">{{ diskUsage }}%</div>
                    </div>
                  </div>
                </el-card>
              </el-col>
            </el-row>
          </div>

          <div class="system-status">
            <el-row :gutter="20">
              <el-col :xs="24" :lg="12">
                <el-card class="chart-card">
                  <template #header>
                    <div class="card-title">CPU使用趋势</div>
                  </template>
                  <div ref="cpuChart" class="chart-container"></div>
                </el-card>
              </el-col>
              <el-col :xs="24" :lg="12">
                <el-card class="chart-card">
                  <template #header>
                    <div class="card-title">内存使用趋势</div>
                  </template>
                  <div ref="memoryChart" class="chart-container"></div>
                </el-card>
              </el-col>
            </el-row>
          </div>
        </el-tab-pane>

        <!-- 用户管理 -->
        <el-tab-pane label="用户管理" name="users">
          <div class="user-management">
            <div class="table-header">
              <div class="search-filters">
                <el-input v-model="userSearch" placeholder="搜索用户名" size="small" style="width: 200px" />
                <el-select v-model="userRoleFilter" placeholder="角色筛选" size="small" style="width: 150px; margin-left: 10px">
                  <el-option label="全部" value="" />
                  <el-option label="管理员" value="admin" />
                  <el-option label="普通用户" value="user" />
                </el-select>
              </div>
              <el-button type="primary" size="small" @click="handleAddUser">
                <i class="fas fa-user-plus"></i> 新增用户
              </el-button>
            </div>
            <el-table :data="filteredUsers" stripe style="width: 100%">
              <el-table-column prop="id" label="用户ID" width="80" />
              <el-table-column prop="username" label="用户名" width="120" />
              <el-table-column prop="nickname" label="昵称" width="120" />
              <el-table-column prop="role" label="角色" width="120">
                <template #default="scope">
                  <el-tag :type="scope.row.role === 'admin' ? 'danger' : 'success'">
                    {{ scope.row.role === 'admin' ? '管理员' : '普通用户' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="email" label="邮箱" width="180" />
              <el-table-column prop="status" label="状态" width="100">
                <template #default="scope">
                  <el-switch v-model="scope.row.status" @change="handleStatusChange(scope.row)" />
                </template>
              </el-table-column>
              <el-table-column prop="lastLogin" label="最后登录" width="180" />
              <el-table-column label="操作" width="200" fixed="right">
                <template #default="scope">
                  <el-button size="small" @click="handleEditUser(scope.row)">
                    <i class="fas fa-edit"></i> 编辑
                  </el-button>
                  <el-button size="small" type="danger" @click="handleDeleteUser(scope.row)">
                    <i class="fas fa-trash"></i> 删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <!-- 角色管理 -->
        <el-tab-pane label="角色管理" name="roles">
          <div class="role-management">
            <div class="table-header">
              <div class="search-filters">
                <el-input v-model="roleSearch" placeholder="搜索角色名称" size="small" style="width: 200px" />
              </div>
              <el-button type="primary" size="small" @click="handleAddRole">
                <i class="fas fa-user-tag"></i> 新增角色
              </el-button>
            </div>
            <el-table :data="filteredRoles" stripe style="width: 100%">
              <el-table-column prop="id" label="角色ID" width="80" />
              <el-table-column prop="roleName" label="角色名称" width="150" />
              <el-table-column prop="roleKey" label="角色标识" width="150" />
              <el-table-column prop="description" label="描述" />
              <el-table-column prop="status" label="状态" width="100">
                <template #default="scope">
                  <el-tag :type="scope.row.status ? 'success' : 'danger'">
                    {{ scope.row.status ? '启用' : '禁用' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="createTime" label="创建时间" width="180" />
              <el-table-column label="操作" width="250" fixed="right">
                <template #default="scope">
                  <el-button size="small" @click="handleEditRole(scope.row)">
                    <i class="fas fa-edit"></i> 编辑
                  </el-button>
                  <el-button size="small" type="warning" @click="handlePermissionRole(scope.row)">
                    <i class="fas fa-key"></i> 权限
                  </el-button>
                  <el-button size="small" type="danger" @click="handleDeleteRole(scope.row)">
                    <i class="fas fa-trash"></i> 删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <!-- 权限矩阵 -->
        <el-tab-pane label="权限矩阵" name="permissionMatrix">
          <div class="permission-matrix">
            <div class="matrix-header">
              <h3>角色权限矩阵</h3>
              <p class="matrix-description">以矩阵形式展示角色和权限的对应关系，直观了解权限分配情况</p>
            </div>
            <el-table :data="permissionMatrixData" border style="width: 100%">
              <el-table-column prop="permission" label="权限项" min-width="200" />
              <el-table-column v-for="role in roles" :key="role.id" :prop="role.roleKey" :label="role.roleName" width="120" align="center">
                <template #default="scope">
                  <el-checkbox 
                    :model-value="scope.row[role.roleKey]" 
                    disabled 
                    v-if="scope.row[role.roleKey] !== null"
                  />
                  <span v-else class="not-applicable">-</span>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <!-- 菜单管理 -->
        <el-tab-pane label="菜单管理" name="menus">
          <div class="menu-management">
            <div class="table-header">
              <div class="search-filters">
                <el-input v-model="menuSearch" placeholder="搜索菜单名称" size="small" style="width: 200px" />
              </div>
              <el-button type="primary" size="small" @click="handleAddMenu">
                <i class="fas fa-list"></i> 新增菜单
              </el-button>
            </div>
            <el-table :data="filteredMenus" stripe style="width: 100%">
              <el-table-column prop="id" label="菜单ID" width="80" />
              <el-table-column prop="menuName" label="菜单名称" width="150" />
              <el-table-column prop="menuPath" label="菜单路径" width="200" />
              <el-table-column prop="icon" label="图标" width="100" align="center">
                <template #default="scope">
                  <i :class="['fas', scope.row.icon]" style="font-size: 16px; color: #409EFF"></i>
                </template>
              </el-table-column>
              <el-table-column prop="sort" label="排序" width="80" align="center" />
              <el-table-column prop="parentId" label="父菜单" width="100">
                <template #default="scope">
                  {{ getParentMenuName(scope.row.parentId) }}
                </template>
              </el-table-column>
              <el-table-column prop="status" label="状态" width="100">
                <template #default="scope">
                  <el-tag :type="scope.row.status ? 'success' : 'danger'">
                    {{ scope.row.status ? '启用' : '禁用' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="200" fixed="right">
                <template #default="scope">
                  <el-button size="small" @click="handleEditMenu(scope.row)">
                    <i class="fas fa-edit"></i> 编辑
                  </el-button>
                  <el-button size="small" type="danger" @click="handleDeleteMenu(scope.row)">
                    <i class="fas fa-trash"></i> 删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <!-- 系统设置 -->
        <el-tab-pane label="系统设置" name="settings">
          <div class="system-settings">
            <el-form :model="systemSettings" label-width="140px">
              <el-row :gutter="20">
                <el-col :xs="24" :sm="12">
                  <el-card class="settings-section">
                    <template #header>
                      <div class="settings-title">基本设置</div>
                    </template>
                    <el-form-item label="系统名称">
                      <el-input v-model="systemSettings.systemName" />
                    </el-form-item>
                    <el-form-item label="数据刷新间隔">
                      <el-select v-model="systemSettings.refreshInterval" style="width: 100%">
                        <el-option label="1分钟" value="1" />
                        <el-option label="5分钟" value="5" />
                        <el-option label="10分钟" value="10" />
                        <el-option label="30分钟" value="30" />
                      </el-select>
                    </el-form-item>
                    <el-form-item label="预警阈值">
                      <el-input-number v-model="systemSettings.warningThreshold" :min="1" :max="100" style="width: 100%" />
                      <span class="form-hint">超过此阈值将触发预警提醒</span>
                    </el-form-item>
                  </el-card>
                </el-col>
                <el-col :xs="24" :sm="12">
                  <el-card class="settings-section">
                    <template #header>
                      <div class="settings-title">备份设置</div>
                    </template>
                    <el-form-item label="自动备份">
                      <el-switch v-model="systemSettings.autoBackup" />
                    </el-form-item>
                    <el-form-item label="备份频率">
                      <el-select v-model="systemSettings.backupFrequency" style="width: 100%" :disabled="!systemSettings.autoBackup">
                        <el-option label="每日" value="daily" />
                        <el-option label="每周" value="weekly" />
                        <el-option label="每月" value="monthly" />
                      </el-select>
                    </el-form-item>
                    <el-form-item label="保留天数">
                      <el-input-number v-model="systemSettings.backupRetention" :min="1" :max="365" style="width: 100%" />
                    </el-form-item>
                  </el-card>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :xs="24" :sm="12">
                  <el-card class="settings-section">
                    <template #header>
                      <div class="settings-title">界面设置</div>
                    </template>
                    <el-form-item label="主题设置">
                      <el-select v-model="systemSettings.theme" style="width: 100%">
                        <el-option label="明亮" value="light" />
                        <el-option label="暗黑" value="dark" />
                      </el-select>
                    </el-form-item>
                    <el-form-item label="语言">
                      <el-select v-model="systemSettings.language" style="width: 100%">
                        <el-option label="中文" value="zh-CN" />
                        <el-option label="English" value="en-US" />
                      </el-select>
                    </el-form-item>
                    <el-form-item label="每页显示条数">
                      <el-select v-model="systemSettings.pageSize" style="width: 100%">
                        <el-option label="10条" :value="10" />
                        <el-option label="20条" :value="20" />
                        <el-option label="50条" :value="50" />
                        <el-option label="100条" :value="100" />
                      </el-select>
                    </el-form-item>
                  </el-card>
                </el-col>
                <el-col :xs="24" :sm="12">
                  <el-card class="settings-section">
                    <template #header>
                      <div class="settings-title">安全设置</div>
                    </template>
                    <el-form-item label="密码最小长度">
                      <el-input-number v-model="systemSettings.minPasswordLength" :min="6" :max="20" style="width: 100%" />
                    </el-form-item>
                    <el-form-item label="登录失败锁定">
                      <el-switch v-model="systemSettings.lockOnFail" />
                    </el-form-item>
                    <el-form-item label="会话超时">
                      <el-select v-model="systemSettings.sessionTimeout" style="width: 100%">
                        <el-option label="30分钟" value="30" />
                        <el-option label="1小时" value="60" />
                        <el-option label="2小时" value="120" />
                        <el-option label="8小时" value="480" />
                      </el-select>
                    </el-form-item>
                  </el-card>
                </el-col>
              </el-row>
              <el-form-item>
                <el-button type="primary" @click="handleSaveSettings">
                  <i class="fas fa-save"></i> 保存设置
                </el-button>
                <el-button @click="handleResetSettings">
                  <i class="fas fa-undo"></i> 重置
                </el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>

        <!-- 操作日志 -->
        <el-tab-pane label="操作日志" name="operationLogs">
          <div class="operation-logs">
            <div class="table-header">
              <div class="search-filters">
                <el-select v-model="logType" placeholder="日志类型" size="small" style="width: 150px; margin-right: 10px">
                  <el-option label="所有" value="all" />
                  <el-option label="登录" value="login" />
                  <el-option label="操作" value="operation" />
                  <el-option label="错误" value="error" />
                  <el-option label="安全" value="security" />
                </el-select>
                <el-input v-model="logKeyword" placeholder="搜索操作内容或操作人" size="small" style="width: 250px" />
                <el-date-picker
                  v-model="logDateRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  size="small"
                  style="width: 280px; margin-left: 10px"
                />
              </div>
              <div class="action-buttons">
                <el-button type="primary" size="small" @click="handleExportLogs">
                  <i class="fas fa-file-export"></i> 导出日志
                </el-button>
                <el-button type="warning" size="small" @click="handleClearLogs">
                  <i class="fas fa-trash"></i> 清理旧日志
                </el-button>
              </div>
            </div>
            <el-table :data="filteredLogs" stripe style="width: 100%" height="400">
              <el-table-column prop="time" label="时间" width="180" />
              <el-table-column prop="user" label="操作人" width="120" />
              <el-table-column prop="ip" label="IP地址" width="140" />
              <el-table-column prop="type" label="类型" width="100">
                <template #default="scope">
                  <el-tag :type="getLogTypeColor(scope.row.type)">
                    {{ getLogTypeLabel(scope.row.type) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="module" label="模块" width="120" />
              <el-table-column prop="content" label="操作内容" />
              <el-table-column prop="status" label="结果" width="100" align="center">
                <template #default="scope">
                  <el-tag :type="scope.row.status === 'success' ? 'success' : 'danger'" size="small">
                    {{ scope.row.status === 'success' ? '成功' : '失败' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="详情" width="80" align="center">
                <template #default="scope">
                  <el-button size="small" text type="primary" @click="handleViewLogDetail(scope.row)">
                    <i class="fas fa-eye"></i>
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
            <div class="log-stats">
              <span>共 {{ logs.length }} 条日志</span>
              <span class="log-warning" v-if="logs.length >= 1000">警告：日志数量已超过1000条，建议清理</span>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 用户新增/编辑弹窗 -->
    <el-dialog :title="userDialogTitle" v-model="userDialogVisible" width="500px">
      <el-form :model="currentUser" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="currentUser.username" :disabled="isEditUser" />
        </el-form-item>
        <el-form-item label="密码" v-if="!isEditUser">
          <el-input v-model="currentUser.password" type="password" show-password />
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="currentUser.nickname" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="currentUser.email" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="currentUser.role" style="width: 100%">
            <el-option label="管理员" value="admin" />
            <el-option label="普通用户" value="user" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="currentUser.status" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="userDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveUser">保存</el-button>
      </template>
    </el-dialog>

    <!-- 角色新增/编辑弹窗 -->
    <el-dialog :title="roleDialogTitle" v-model="roleDialogVisible" width="500px">
      <el-form :model="currentRole" label-width="100px">
        <el-form-item label="角色名称">
          <el-input v-model="currentRole.roleName" />
        </el-form-item>
        <el-form-item label="角色标识">
          <el-input v-model="currentRole.roleKey" :disabled="isEditRole" />
          <div class="form-hint">字母开头，包含字母、数字和下划线</div>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="currentRole.description" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="currentRole.status" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="roleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveRole">保存</el-button>
      </template>
    </el-dialog>

    <!-- 权限配置弹窗 -->
    <el-dialog title="权限配置" v-model="permissionDialogVisible" width="600px">
      <div class="permission-config">
        <div class="permission-role-info">
          <strong>角色：</strong>{{ currentRoleForPermission?.roleName }}
        </div>
        <el-tree
          ref="permissionTree"
          :data="permissions"
          :props="{ label: 'permissionName', children: 'children' }"
          show-checkbox
          node-key="id"
          :default-checked-keys="currentRolePermissions"
          :default-expand-all="true"
          @check="handlePermissionCheck"
        />
      </div>
      <template #footer>
        <el-button @click="permissionDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveRolePermissions">保存权限</el-button>
      </template>
    </el-dialog>

    <!-- 菜单新增/编辑弹窗 -->
    <el-dialog :title="menuDialogTitle" v-model="menuDialogVisible" width="500px">
      <el-form :model="currentMenu" label-width="100px">
        <el-form-item label="菜单名称">
          <el-input v-model="currentMenu.menuName" />
        </el-form-item>
        <el-form-item label="菜单路径">
          <el-input v-model="currentMenu.menuPath" placeholder="/path/to/page" />
        </el-form-item>
        <el-form-item label="菜单图标">
          <el-select v-model="currentMenu.icon" style="width: 100%" filterable>
            <el-option v-for="icon in iconOptions" :key="icon" :value="icon">
              <i :class="['fas', icon]" style="margin-right: 8px"></i>{{ icon }}
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="currentMenu.sort" :min="1" :max="9999" style="width: 100%" />
        </el-form-item>
        <el-form-item label="父菜单">
          <el-select v-model="currentMenu.parentId" style="width: 100%" placeholder="顶级菜单">
            <el-option label="顶级菜单" :value="0" />
            <el-option v-for="menu in topLevelMenus" :key="menu.id" :label="menu.menuName" :value="menu.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="currentMenu.status" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="menuDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveMenu">保存</el-button>
      </template>
    </el-dialog>

    <!-- 日志详情弹窗 -->
    <el-dialog title="日志详情" v-model="logDetailVisible" width="600px">
      <el-descriptions :column="1" border v-if="currentLog">
        <el-descriptions-item label="时间">{{ currentLog.time }}</el-descriptions-item>
        <el-descriptions-item label="操作人">{{ currentLog.user }}</el-descriptions-item>
        <el-descriptions-item label="IP地址">{{ currentLog.ip }}</el-descriptions-item>
        <el-descriptions-item label="类型">
          <el-tag :type="getLogTypeColor(currentLog.type)">{{ getLogTypeLabel(currentLog.type) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="模块">{{ currentLog.module }}</el-descriptions-item>
        <el-descriptions-item label="结果">
          <el-tag :type="currentLog.status === 'success' ? 'success' : 'danger'">
            {{ currentLog.status === 'success' ? '成功' : '失败' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="操作内容">{{ currentLog.content }}</el-descriptions-item>
        <el-descriptions-item label="User Agent" v-if="currentLog.userAgent">
          <span class="user-agent">{{ currentLog.userAgent }}</span>
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="logDetailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import * as echarts from 'echarts'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'SystemManagement',
  setup() {
    // ==================== 图表实例 ====================
    const cpuChart = ref(null)
    const memoryChart = ref(null)
    let cpuChartInstance = null
    let memoryChartInstance = null
    let statusUpdateTimer = null

    // ==================== 模式切换 ====================
    const currentMode = ref('single')
    const handleModeChange = (mode) => {
      ElMessage.info(`已切换至${mode === 'single' ? '单站' : '多站'}模式`)
      localStorage.setItem('systemMode', mode)
    }

    // ==================== 活动标签页 ====================
    const activeTab = ref('overview')

    // ==================== 系统资源数据 ====================
    const cpuUsage = ref(45)
    const memoryUsage = ref(52)
    const diskUsage = ref(38)

    // ==================== 用户管理 ====================
    const userSearch = ref('')
    const userRoleFilter = ref('')
    const userDialogVisible = ref(false)
    const userDialogTitle = ref('新增用户')
    const editingUser = ref(null)

    const users = reactive([
      { id: 1, username: 'admin', nickname: '管理员', role: 'admin', email: 'admin@hsSaving.com', status: true, lastLogin: '2023-12-01 14:30:00', createTime: '2023-01-01 00:00:00' },
      { id: 2, username: 'user1', nickname: '操作员', role: 'user', email: 'user1@hsSaving.com', status: true, lastLogin: '2023-12-01 10:20:00', createTime: '2023-03-15 08:30:00' },
      { id: 3, username: 'user2', nickname: '查看员', role: 'user', email: 'user2@hsSaving.com', status: false, lastLogin: '2023-11-28 09:15:00', createTime: '2023-04-20 14:20:00' },
      { id: 4, username: 'user3', nickname: '运维人员', role: 'user', email: 'user3@hsSaving.com', status: true, lastLogin: '2023-11-30 16:45:00', createTime: '2023-05-10 10:15:00' },
      { id: 5, username: 'user4', nickname: '审计员', role: 'user', email: 'user4@hsSaving.com', status: true, lastLogin: '2023-12-01 11:05:00', createTime: '2023-06-05 16:40:00' }
    ])

    const filteredUsers = computed(() => {
      return users.filter(user => {
        const searchMatch = !userSearch.value || 
          user.username.includes(userSearch.value) || 
          user.nickname.includes(userSearch.value)
        const roleMatch = !userRoleFilter.value || user.role === userRoleFilter.value
        return searchMatch && roleMatch
      })
    })

    const newUserForm = reactive({
      username: '',
      nickname: '',
      role: 'user',
      email: '',
      password: ''
    })

    const handleAddUser = () => {
      editingUser.value = null
      Object.assign(newUserForm, { username: '', nickname: '', role: 'user', email: '', password: '' })
      userDialogTitle.value = '新增用户'
      userDialogVisible.value = true
    }

    const handleEditUser = (user) => {
      editingUser.value = user
      Object.assign(newUserForm, {
        username: user.username,
        nickname: user.nickname,
        role: user.role,
        email: user.email,
        password: ''
      })
      userDialogTitle.value = '编辑用户'
      userDialogVisible.value = true
    }

    const handleDeleteUser = (user) => {
      ElMessageBox.confirm(`确认删除用户"${user.nickname}"吗？`, '删除确认', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const index = users.findIndex(u => u.id === user.id)
        if (index > -1) {
          users.splice(index, 1)
          ElMessage.success('删除成功')
        }
      }).catch(() => {})
    }

    const handleSaveUser = () => {
      if (!newUserForm.username || !newUserForm.nickname) {
        ElMessage.warning('请填写用户名和昵称')
        return
      }
      if (editingUser.value) {
        Object.assign(editingUser.value, {
          username: newUserForm.username,
          nickname: newUserForm.nickname,
          role: newUserForm.role,
          email: newUserForm.email
        })
        ElMessage.success('用户更新成功')
      } else {
        const newId = Math.max(...users.map(u => u.id)) + 1
        users.push({
          id: newId,
          username: newUserForm.username,
          nickname: newUserForm.nickname,
          role: newUserForm.role,
          email: newUserForm.email,
          status: true,
          lastLogin: '-',
          createTime: new Date().toLocaleString()
        })
        ElMessage.success('用户创建成功')
      }
      userDialogVisible.value = false
    }

    const handleStatusChange = (user) => {
      ElMessage.success(`用户"${user.nickname}"已${user.status ? '启用' : '禁用'}`)
    }

    // ==================== 角色管理 ====================
    const roleSearch = ref('')
    const roleDialogVisible = ref(false)
    const roleDialogTitle = ref('新增角色')
    const permissionDialogVisible = ref(false)
    const editingRole = ref(null)
    const selectedPermissions = ref([])

    const roles = reactive([
      { id: 1, roleName: '超级管理员', roleKey: 'super_admin', description: '拥有系统所有权限', status: true, createTime: '2023-01-01 00:00:00' },
      { id: 2, roleName: '管理员', roleKey: 'admin', description: '拥有系统管理权限', status: true, createTime: '2023-01-15 10:30:00' },
      { id: 3, roleName: '操作员', roleKey: 'operator', description: '可进行日常操作和监控', status: true, createTime: '2023-02-20 14:15:00' },
      { id: 4, roleName: '查看员', roleKey: 'viewer', description: '仅可查看数据', status: true, createTime: '2023-03-10 09:45:00' },
      { id: 5, roleName: '审计员', roleKey: 'auditor', description: '负责系统审计和日志查看', status: false, createTime: '2023-04-05 16:20:00' }
    ])

    const allPermissions = reactive([
      { id: 1, name: '系统管理', key: 'system', children: [
        { id: 101, name: '用户管理', key: 'system:user' },
        { id: 102, name: '角色管理', key: 'system:role' },
        { id: 103, name: '菜单管理', key: 'system:menu' },
        { id: 104, name: '系统设置', key: 'system:settings' },
        { id: 105, name: '操作日志', key: 'system:logs' }
      ]},
      { id: 2, name: '能耗分析', key: 'analysis', children: [
        { id: 201, name: '单站分析', key: 'analysis:single' },
        { id: 202, name: '多站对比', key: 'analysis:multi' },
        { id: 203, name: '趋势预测', key: 'analysis:forecast' }
      ]},
      { id: 3, name: '报表管理', key: 'report', children: [
        { id: 301, name: '能耗报表', key: 'report:energy' },
        { id: 302, name: '成本报表', key: 'report:cost' },
        { id: 303, name: '导出报表', key: 'report:export' }
      ]},
      { id: 4, name: '设备管理', key: 'device', children: [
        { id: 401, name: '设备列表', key: 'device:list' },
        { id: 402, name: '设备监控', key: 'device:monitor' },
        { id: 403, name: '设备控制', key: 'device:control' }
      ]}
    ])

    const rolePermissions = reactive({
      super_admin: [101, 102, 103, 104, 105, 201, 202, 203, 301, 302, 303, 401, 402, 403],
      admin: [102, 103, 104, 105, 201, 202, 203, 301, 302, 303, 401, 402],
      operator: [201, 202, 203, 301, 302, 401, 402],
      viewer: [201, 202, 301, 302],
      auditor: [105]
    })

    const filteredRoles = computed(() => {
      return roles.filter(role => {
        return !roleSearch.value || role.roleName.includes(roleSearch.value) || role.roleKey.includes(roleSearch.value)
      })
    })

    const newRoleForm = reactive({
      roleName: '',
      roleKey: '',
      description: ''
    })

    const handleAddRole = () => {
      editingRole.value = null
      Object.assign(newRoleForm, { roleName: '', roleKey: '', description: '' })
      roleDialogTitle.value = '新增角色'
      roleDialogVisible.value = true
    }

    const handleEditRole = (role) => {
      editingRole.value = role
      Object.assign(newRoleForm, {
        roleName: role.roleName,
        roleKey: role.roleKey,
        description: role.description
      })
      roleDialogTitle.value = '编辑角色'
      roleDialogVisible.value = true
    }

    const handleDeleteRole = (role) => {
      if (role.roleKey === 'super_admin') {
        ElMessage.warning('超级管理员角色不能删除')
        return
      }
      ElMessageBox.confirm(`确认删除角色"${role.roleName}"吗？`, '删除确认', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const index = roles.findIndex(r => r.id === role.id)
        if (index > -1) {
          roles.splice(index, 1)
          delete rolePermissions[role.roleKey]
          ElMessage.success('删除成功')
        }
      }).catch(() => {})
    }

    const handleSaveRole = () => {
      if (!newRoleForm.roleName || !newRoleForm.roleKey) {
        ElMessage.warning('请填写角色名称和角色标识')
        return
      }
      const keyPattern = /^[a-z_]+$/
      if (!keyPattern.test(newRoleForm.roleKey)) {
        ElMessage.warning('角色标识只能包含小写字母和下划线')
        return
      }
      if (editingRole.value) {
        const oldKey = editingRole.value.roleKey
        Object.assign(editingRole.value, {
          roleName: newRoleForm.roleName,
          roleKey: newRoleForm.roleKey,
          description: newRoleForm.description
        })
        if (oldKey !== newRoleForm.roleKey) {
          rolePermissions[newRoleForm.roleKey] = [...rolePermissions[oldKey]]
          delete rolePermissions[oldKey]
        }
        ElMessage.success('角色更新成功')
      } else {
        if (roles.some(r => r.roleKey === newRoleForm.roleKey)) {
          ElMessage.warning('角色标识已存在')
          return
        }
        const newId = Math.max(...roles.map(r => r.id)) + 1
        roles.push({
          id: newId,
          roleName: newRoleForm.roleName,
          roleKey: newRoleForm.roleKey,
          description: newRoleForm.description,
          status: true,
          createTime: new Date().toLocaleString()
        })
        rolePermissions[newRoleForm.roleKey] = []
        ElMessage.success('角色创建成功')
      }
      roleDialogVisible.value = false
    }

    const handlePermissionRole = (role) => {
      editingRole.value = role
      selectedPermissions.value = [...(rolePermissions[role.roleKey] || [])]
      permissionDialogVisible.value = true
    }

    const handleSavePermissions = () => {
      rolePermissions[editingRole.value.roleKey] = [...selectedPermissions.value]
      ElMessage.success('权限配置已保存')
      permissionDialogVisible.value = false
    }

    const handlePermissionChange = (permissionId, checked) => {
      if (checked) {
        if (!selectedPermissions.value.includes(permissionId)) {
          selectedPermissions.value.push(permissionId)
        }
      } else {
        const index = selectedPermissions.value.indexOf(permissionId)
        if (index > -1) {
          selectedPermissions.value.splice(index, 1)
        }
      }
    }

    const isPermissionChecked = (permissionId) => {
      return selectedPermissions.value.includes(permissionId)
    }

    // ==================== 权限矩阵 ====================
    const permissionMatrixData = computed(() => {
      return [
        { permission: '系统管理 - 用户管理', super_admin: true, admin: null, operator: false, viewer: false, auditor: false },
        { permission: '系统管理 - 角色管理', super_admin: true, admin: true, operator: false, viewer: false, auditor: false },
        { permission: '系统管理 - 菜单管理', super_admin: true, admin: true, operator: false, viewer: false, auditor: false },
        { permission: '系统管理 - 系统设置', super_admin: true, admin: true, operator: false, viewer: false, auditor: false },
        { permission: '系统管理 - 操作日志', super_admin: true, admin: true, operator: false, viewer: false, auditor: true },
        { permission: '能耗分析 - 单站分析', super_admin: true, admin: true, operator: true, viewer: true, auditor: false },
        { permission: '能耗分析 - 多站对比', super_admin: true, admin: true, operator: true, viewer: true, auditor: false },
        { permission: '能耗分析 - 趋势预测', super_admin: true, admin: true, operator: true, viewer: false, auditor: false },
        { permission: '报表管理 - 能耗报表', super_admin: true, admin: true, operator: true, viewer: true, auditor: false },
        { permission: '报表管理 - 成本报表', super_admin: true, admin: true, operator: true, viewer: true, auditor: false },
        { permission: '报表管理 - 导出报表', super_admin: true, admin: true, operator: true, viewer: false, auditor: false },
        { permission: '设备管理 - 设备列表', super_admin: true, admin: true, operator: true, viewer: false, auditor: false },
        { permission: '设备管理 - 设备监控', super_admin: true, admin: true, operator: true, viewer: false, auditor: false },
        { permission: '设备管理 - 设备控制', super_admin: true, admin: true, operator: false, viewer: false, auditor: false }
      ]
    })

    // ==================== 菜单管理 ====================
    const menuSearch = ref('')
    const menuDialogVisible = ref(false)
    const menuDialogTitle = ref('新增菜单')
    const editingMenu = ref(null)

    const menus = reactive([
      { id: 1, menuName: '首页', menuPath: '/dashboard', icon: 'fa-home', sort: 1, parentId: 0, status: true },
      { id: 2, menuName: '能耗分析', menuPath: '/analysis', icon: 'fa-chart-line', sort: 2, parentId: 0, status: true },
      { id: 3, menuName: '单站分析', menuPath: '/analysis/single', icon: 'fa-building', sort: 1, parentId: 2, status: true },
      { id: 4, menuName: '多站对比', menuPath: '/analysis/multi', icon: 'fa-balance-scale', sort: 2, parentId: 2, status: true },
      { id: 5, menuName: '报表管理', menuPath: '/reports', icon: 'fa-file-alt', sort: 3, parentId: 0, status: true },
      { id: 6, menuName: '能耗报表', menuPath: '/reports/energy', icon: 'fa-bolt', sort: 1, parentId: 5, status: true },
      { id: 7, menuName: '设备管理', menuPath: '/devices', icon: 'fa-server', sort: 4, parentId: 0, status: true },
      { id: 8, menuName: '设备列表', menuPath: '/devices/list', icon: 'fa-list', sort: 1, parentId: 7, status: true },
      { id: 9, menuName: '系统管理', menuPath: '/system', icon: 'fa-cogs', sort: 5, parentId: 0, status: true },
      { id: 10, menuName: '操作日志', menuPath: '/system/logs', icon: 'fa-history', sort: 5, parentId: 9, status: true }
    ])

    const filteredMenus = computed(() => {
      return menus.filter(menu => {
        return !menuSearch.value || menu.menuName.includes(menuSearch.value)
      })
    })

    const getParentMenuName = (parentId) => {
      if (parentId === 0) return '根菜单'
      const parent = menus.find(m => m.id === parentId)
      return parent ? parent.menuName : '-'
    }

    const newMenuForm = reactive({
      menuName: '',
      menuPath: '',
      icon: 'fa-circle',
      sort: 1,
      parentId: 0,
      status: true
    })

    const iconOptions = [
      'fa-home', 'fa-cog', 'fa-user', 'fa-users', 'fa-chart-line', 'fa-chart-bar',
      'fa-file-alt', 'fa-file-excel', 'fa-download', 'fa-upload', 'fa-search',
      'fa-plus', 'fa-edit', 'fa-trash', 'fa-eye', 'fa-lock', 'fa-unlock',
      'fa-server', 'fa-database', 'fa-desktop', 'fa-laptop', 'fa-mobile',
      'fa-building', 'fa-industry', 'fa-bolt', 'fa-fire', 'fa-tint',
      'fa-sun', 'fa-moon', 'fa-cloud', 'fa-envelope', 'fa-bell'
    ]

    const handleAddMenu = () => {
      editingMenu.value = null
      Object.assign(newMenuForm, { menuName: '', menuPath: '', icon: 'fa-circle', sort: 1, parentId: 0, status: true })
      menuDialogTitle.value = '新增菜单'
      menuDialogVisible.value = true
    }

    const handleEditMenu = (menu) => {
      editingMenu.value = menu
      Object.assign(newMenuForm, {
        menuName: menu.menuName,
        menuPath: menu.menuPath,
        icon: menu.icon,
        sort: menu.sort,
        parentId: menu.parentId,
        status: menu.status
      })
      menuDialogTitle.value = '编辑菜单'
      menuDialogVisible.value = true
    }

    const handleDeleteMenu = (menu) => {
      const hasChildren = menus.some(m => m.parentId === menu.id)
      if (hasChildren) {
        ElMessage.warning('该菜单存在子菜单，请先删除子菜单')
        return
      }
      ElMessageBox.confirm(`确认删除菜单"${menu.menuName}"吗？`, '删除确认', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const index = menus.findIndex(m => m.id === menu.id)
        if (index > -1) {
          menus.splice(index, 1)
          ElMessage.success('删除成功')
        }
      }).catch(() => {})
    }

    const handleSaveMenu = () => {
      if (!newMenuForm.menuName || !newMenuForm.menuPath) {
        ElMessage.warning('请填写菜单名称和路径')
        return
      }
      if (editingMenu.value) {
        Object.assign(editingMenu.value, {
          menuName: newMenuForm.menuName,
          menuPath: newMenuForm.menuPath,
          icon: newMenuForm.icon,
          sort: newMenuForm.sort,
          parentId: newMenuForm.parentId,
          status: newMenuForm.status
        })
        ElMessage.success('菜单更新成功')
      } else {
        const newId = Math.max(...menus.map(m => m.id)) + 1
        menus.push({
          id: newId,
          menuName: newMenuForm.menuName,
          menuPath: newMenuForm.menuPath,
          icon: newMenuForm.icon,
          sort: newMenuForm.sort,
          parentId: newMenuForm.parentId,
          status: newMenuForm.status
        })
        ElMessage.success('菜单创建成功')
      }
      menuDialogVisible.value = false
    }

    // ==================== 系统设置 ====================
    const systemSettings = reactive({
      systemName: '高铁站节能降耗管理系统',
      refreshInterval: '5',
      warningThreshold: 80,
      autoBackup: true,
      backupFrequency: 'daily',
      backupRetention: 30,
      theme: 'light',
      language: 'zh-CN',
      pageSize: 20,
      minPasswordLength: 8,
      lockOnFail: true,
      sessionTimeout: '60'
    })

    const originalSettings = JSON.parse(JSON.stringify(systemSettings))

    const handleSaveSettings = () => {
      Object.assign(originalSettings, JSON.parse(JSON.stringify(systemSettings)))
      localStorage.setItem('systemSettings', JSON.stringify(systemSettings))
      ElMessage.success('系统设置已保存')
    }

    const handleResetSettings = () => {
      Object.assign(systemSettings, originalSettings)
      ElMessage.info('系统设置已重置')
    }

    // ==================== 操作日志 ====================
    const logType = ref('all')
    const logKeyword = ref('')
    const logDateRange = ref(null)
    const logDetailVisible = ref(false)
    const selectedLog = ref(null)

    const logs = reactive([
      { id: 1, time: '2023-12-01 14:30:00', user: 'admin', type: 'login', module: '认证模块', content: '管理员登录系统', ip: '192.168.1.100', status: 'success' },
      { id: 2, time: '2023-12-01 14:25:00', user: 'user1', type: 'operation', module: '能耗分析', content: '查看单站能耗分析数据', ip: '192.168.1.101', status: 'success' },
      { id: 3, time: '2023-12-01 14:20:00', user: 'admin', type: 'error', module: '数据同步', content: '设备数据同步失败: 设备ID-003连接超时', ip: '192.168.1.100', status: 'failed' },
      { id: 4, time: '2023-12-01 14:15:00', user: 'user2', type: 'operation', module: '报表管理', content: '导出能耗报表: 2023年11月', ip: '192.168.1.102', status: 'success' },
      { id: 5, time: '2023-12-01 14:10:00', user: 'admin', type: 'operation', module: '系统设置', content: '修改系统参数: 数据刷新间隔已调整为5分钟', ip: '192.168.1.100', status: 'success' },
      { id: 6, time: '2023-12-01 14:05:00', user: 'user3', type: 'login', module: '认证模块', content: '用户登录系统', ip: '192.168.1.103', status: 'success' },
      { id: 7, time: '2023-12-01 14:00:00', user: 'user1', type: 'operation', module: '能耗分析', content: '设置能耗阈值: 预警阈值已调整为85%', ip: '192.168.1.101', status: 'success' },
      { id: 8, time: '2023-12-01 13:55:00', user: 'admin', type: 'operation', module: '用户管理', content: '新增用户: testuser (测试人员)', ip: '192.168.1.100', status: 'success' },
      { id: 9, time: '2023-12-01 13:50:00', user: 'user4', type: 'error', module: '权限管理', content: '尝试访问系统设置模块: 权限不足', ip: '192.168.1.104', status: 'failed' },
      { id: 10, time: '2023-12-01 13:45:00', user: 'admin', type: 'security', module: '系统安全', content: '检测到异常登录尝试: IP 192.168.1.200', ip: '192.168.1.100', status: 'warning' },
      { id: 11, time: '2023-12-01 13:40:00', user: 'admin', type: 'operation', module: '操作日志', content: '清理30天前的操作日志', ip: '192.168.1.100', status: 'success' },
      { id: 12, time: '2023-12-01 13:35:00', user: 'user1', type: 'operation', module: '设备管理', content: '重启设备: 空调机组-01', ip: '192.168.1.101', status: 'success' }
    ])

    const filteredLogs = computed(() => {
      return logs.filter(log => {
        const typeMatch = logType.value === 'all' || log.type === logType.value
        const keywordMatch = !logKeyword.value || 
          log.content.includes(logKeyword.value) || 
          log.user.includes(logKeyword.value) ||
          log.module.includes(logKeyword.value)
        let dateMatch = true
        if (logDateRange.value && logDateRange.value.length === 2) {
          const logDate = new Date(log.time)
          dateMatch = logDate >= logDateRange.value[0] && logDate <= logDateRange.value[1]
        }
        return typeMatch && keywordMatch && dateMatch
      })
    })

    const getLogTypeColor = (type) => {
      const colors = { login: 'success', operation: 'primary', error: 'danger', security: 'warning' }
      return colors[type] || 'info'
    }

    const getLogTypeLabel = (type) => {
      const labels = { login: '登录', operation: '操作', error: '错误', security: '安全' }
      return labels[type] || type
    }

    const handleViewLogDetail = (log) => {
      selectedLog.value = log
      logDetailVisible.value = true
    }

    const handleExportLogs = () => {
      const csvContent = [
        ['时间', '操作人', '类型', '模块', '操作内容', 'IP地址', '状态'],
        ...filteredLogs.value.map(log => [
          log.time, log.user, getLogTypeLabel(log.type), log.module, log.content, log.ip, log.status
        ])
      ].map(row => row.join(',')).join('\n')
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `操作日志_${new Date().toLocaleDateString()}.csv`
      link.click()
      ElMessage.success('日志导出成功')
    }

    const handleClearLogs = () => {
      ElMessageBox.confirm('确认清理30天前的日志吗？此操作不可撤销。', '清理确认', {
        confirmButtonText: '确认清理',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        const originalCount = logs.length
        const filteredLogs = logs.filter(log => new Date(log.time) >= thirtyDaysAgo)
        logs.splice(0, logs.length, ...filteredLogs)
        ElMessage.success(`已清理 ${originalCount - filteredLogs.length} 条日志记录`)
      }).catch(() => {})
    }

    // ==================== 图表初始化 ====================
    const initCpuChart = () => {
      if (cpuChartInstance) {
        cpuChartInstance.dispose()
      }
      cpuChartInstance = echarts.init(cpuChart.value)
      const option = {
        tooltip: { trigger: 'axis' },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00']
        },
        yAxis: {
          type: 'value',
          axisLabel: { formatter: '{value}%' },
          max: 100
        },
        series: [{
          name: 'CPU使用率',
          type: 'line',
          data: [32, 28, 35, 45, 55, 48, 38, 35],
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(64, 158, 255, 0.5)' },
              { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
            ])
          },
          lineStyle: { color: '#409EFF' },
          itemStyle: { color: '#409EFF' }
        }]
      }
      cpuChartInstance.setOption(option)
    }

    const initMemoryChart = () => {
      if (memoryChartInstance) {
        memoryChartInstance.dispose()
      }
      memoryChartInstance = echarts.init(memoryChart.value)
      const option = {
        tooltip: { trigger: 'axis' },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00']
        },
        yAxis: {
          type: 'value',
          axisLabel: { formatter: '{value}%' },
          max: 100
        },
        series: [{
          name: '内存使用率',
          type: 'line',
          data: [42, 38, 45, 52, 58, 55, 48, 45],
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(233, 30, 99, 0.5)' },
              { offset: 1, color: 'rgba(233, 30, 99, 0.1)' }
            ])
          },
          lineStyle: { color: '#E91E63' },
          itemStyle: { color: '#E91E63' }
        }]
      }
      memoryChartInstance.setOption(option)
    }

    const updateSystemStatus = () => {
      cpuUsage.value = Math.floor(Math.random() * 30) + 30
      memoryUsage.value = Math.floor(Math.random() * 20) + 40
      diskUsage.value = Math.floor(Math.random() * 10) + 35
    }

    const handleResize = () => {
      if (cpuChartInstance) cpuChartInstance.resize()
      if (memoryChartInstance) memoryChartInstance.resize()
    }

    // ==================== 生命周期 ====================
    onMounted(() => {
      const savedMode = localStorage.getItem('systemMode')
      if (savedMode) currentMode.value = savedMode
      
      const savedSettings = localStorage.getItem('systemSettings')
      if (savedSettings) {
        Object.assign(systemSettings, JSON.parse(savedSettings))
        Object.assign(originalSettings, JSON.parse(savedSettings))
      }
      
      initCpuChart()
      initMemoryChart()
      updateSystemStatus()
      statusUpdateTimer = setInterval(updateSystemStatus, 5000)
      window.addEventListener('resize', handleResize)
    })

    onUnmounted(() => {
      if (cpuChartInstance) cpuChartInstance.dispose()
      if (memoryChartInstance) memoryChartInstance.dispose()
      if (statusUpdateTimer) clearInterval(statusUpdateTimer)
      window.removeEventListener('resize', handleResize)
    })

    // ==================== 返回值 ====================
    return {
      // 图表
      cpuChart, memoryChart, cpuUsage, memoryUsage, diskUsage,
      // 模式切换
      currentMode, handleModeChange,
      // 标签页
      activeTab,
      // 用户管理
      userSearch, userRoleFilter, users, filteredUsers, userDialogVisible, userDialogTitle, newUserForm,
      handleAddUser, handleEditUser, handleDeleteUser, handleStatusChange, handleSaveUser,
      // 角色管理
      roleSearch, roles, filteredRoles, roleDialogVisible, roleDialogTitle, permissionDialogVisible,
      allPermissions, editingRole, selectedPermissions, newRoleForm,
      handleAddRole, handleEditRole, handleDeleteRole, handleSaveRole, handlePermissionRole, handleSavePermissions,
      handlePermissionChange, isPermissionChecked,
      // 权限矩阵
      permissionMatrixData,
      // 菜单管理
      menuSearch, menus, filteredMenus, menuDialogVisible, menuDialogTitle, newMenuForm, iconOptions,
      getParentMenuName, handleAddMenu, handleEditMenu, handleDeleteMenu, handleSaveMenu,
      // 系统设置
      systemSettings, handleSaveSettings, handleResetSettings,
      // 操作日志
      logType, logKeyword, logDateRange, logs, filteredLogs, logDetailVisible, selectedLog,
      getLogTypeColor, getLogTypeLabel, handleViewLogDetail, handleExportLogs, handleClearLogs
    }
  }
}
</script>

<style scoped>
.system-management-container {
  padding: 20px;
}

.system-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.card-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

/* 系统概览 */
.system-overview {
  margin-bottom: 20px;
}

.overview-card {
  height: 120px;
  border-radius: 8px;
  transition: all 0.3s;
}

.overview-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.card-content {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.card-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-right: 20px;
}

.system-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.performance-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.memory-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.storage-icon {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  color: white;
}

.card-info {
  flex: 1;
}

.card-value {
  font-size: 24px;
  font-weight: 700;
  color: #303133;
  margin-top: 5px;
}

/* 系统状态图表 */
.system-status {
  margin-bottom: 20px;
}

.chart-card {
  height: 300px;
}

.chart-container {
  width: 100%;
  height: calc(100% - 40px);
}

/* 用户管理 */
.user-management {
  margin-bottom: 20px;
}

.user-card {
  margin-bottom: 20px;
}

/* 系统设置 */
.system-settings {
  margin-bottom: 20px;
}

.settings-card {
  margin-bottom: 20px;
}

/* 系统日志 */
.system-logs {
  margin-bottom: 20px;
}

.logs-card {
  margin-bottom: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .system-management-container {
    padding: 10px;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .card-header h2,
  .card-header h3 {
    margin-bottom: 10px;
  }
  
  .card-content {
    flex-direction: column;
    text-align: center;
  }
  
  .card-icon {
    margin-right: 0;
    margin-bottom: 10px;
  }
}
</style>