# 中国高铁站节能降耗演示系统

## 项目概述

本项目是基于Vue 3 + Element Plus框架开发的中国高铁站节能降耗演示系统，旨在展示高铁站能源管理、监测和分析的完整解决方案。系统采用现代化的前端技术栈，提供直观的数据可视化界面和丰富的交互功能。

## 技术架构

- **前端框架**: Vue 3 + Vite
- **UI组件库**: Element Plus
- **图表库**: ECharts
- **图标库**: FontAwesome
- **状态管理**: Vue 3 Composition API
- **路由管理**: Vue Router 4

## 功能模块

### 1. 能源监测模块
- 实时能耗数据监测
- 能耗趋势分析
- 能耗对比分析
- 多维度能耗报表

### 2. 设备管理模块
- 设备状态监测
- 设备运行参数设置
- 设备维护管理
- 设备故障诊断

### 3. 预警管理模块
- 能耗异常预警
- 设备运行异常预警
- 预警通知管理
- 预警趋势分析

### 4. 分析报表模块
- 能耗分析报表
- 设备运行报表
- 维护记录报表
- 自定义报表生成

### 5. 设备管理模块

本模块包含7个子功能，实现对高铁站设备的全面管理：

#### 5.1 系统能耗分析 (SystemEnergyAnalysis)
**功能描述**: 对高铁站各系统的能耗数据进行深度分析，包括能耗趋势、同比环比对比、能耗排名等。

**核心功能**:
- 能耗趋势折线图
- 能耗同比/环比对比
- 系统能耗排名
- 能耗异常检测

**组件路径**: `src/components/DeviceSystemManagement/components/SystemEnergyAnalysis.vue`

#### 5.2 系统关联分析 (SystemCorrelationAnalysis)
**功能描述**: 分析不同系统之间的能耗关联性，识别能耗影响因素，优化系统运行策略。

**核心功能**:
- 关联性热力图
- 多变量分析
- 影响因素识别
- 优化建议生成

**组件路径**: `src/components/DeviceSystemManagement/components/SystemCorrelationAnalysis.vue`

#### 5.3 设备分类管理 (DeviceCategoryManage)
**功能描述**: 对高铁站各类设备进行分类管理，支持设备树形结构展示、设备信息维护等功能。

**核心功能**:
- 设备分类树
- 设备信息CRUD
- 批量导入导出
- 分类统计报表

**组件路径**: `src/components/DeviceSystemManagement/components/DeviceCategoryManage.vue`

#### 5.4 设备维护记录 (DeviceMaintenanceRecord)
**功能描述**: 记录和管理设备维护保养信息，支持维护计划制定、执行记录跟踪等功能。

**核心功能**:
- 维护记录列表
- 维护计划管理
- 维护提醒设置
- 维护统计分析

**组件路径**: `src/components/DeviceSystemManagement/components/DeviceMaintenanceRecord.vue`

#### 5.5 设备能耗预测 (DeviceEnergyForecast)
**功能描述**: 基于历史数据和机器学习算法，预测设备未来能耗趋势，辅助能源规划。

**核心功能**:
- 能耗预测图表
- 多算法对比
- 预测误差分析
- 预测报告导出

**组件路径**: `src/components/DeviceSystemManagement/components/DeviceEnergyForecast.vue`

#### 5.6 设备异常预警 (DeviceEarlyWarning)
**功能描述**: 实时监测设备运行状态，及时发现异常情况并发出预警，支持多级预警机制。

**核心功能**:
- 实时状态监测
- 多级预警设置
- 预警通知推送
- 预警历史记录

**组件路径**: `src/components/DeviceSystemManagement/components/DeviceEarlyWarning.vue`

#### 5.7 设备报表生成 (DeviceReportGenerate)
**功能描述**: 生成各类设备相关报表，支持自定义报表模板、数据导出等功能。

**核心功能**:
- 报表模板管理
- 自定义报表生成
- 多种导出格式
- 报表历史管理

**组件路径**: `src/components/DeviceSystemManagement/components/DeviceReportGenerate.vue`

### 6. 系统管理模块

#### 6.1 系统管理 (SystemManagement)
**功能描述**: 提供系统基础信息维护功能，包括系统配置、参数设置、用户权限管理等。

**核心功能**:
- 系统信息展示与编辑
- 参数配置管理
- 权限分配与控制
- 系统日志查看

**组件路径**: `src/components/SystemManagement/SystemManagement.vue`

## 模块结构

```
src/components/DeviceSystemManagement/
├── DeviceSystemManagement.vue     # 主容器组件（整合所有7个功能）
├── components/
│   ├── SystemEnergyAnalysis.vue   # 系统能耗分析
│   ├── SystemCorrelationAnalysis.vue # 系统关联分析
│   ├── DeviceCategoryManage.vue   # 设备分类管理
│   ├── DeviceMaintenanceRecord.vue # 设备维护记录
│   ├── DeviceEnergyForecast.vue   # 设备能耗预测
│   ├── DeviceEarlyWarning.vue     # 设备异常预警
│   └── DeviceReportGenerate.vue   # 设备报表生成
└── index.js                       # 组件导出配置
```

## 快速开始

### 环境要求

- Node.js 16.0+
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

## 使用说明

1. 访问系统首页，浏览各功能模块概览
2. 点击侧边栏"设备管理"菜单进入设备管理模块，通过顶部Tab切换不同的功能页面
3. 点击侧边栏"系统管理"菜单进入系统管理模块
4. 各功能页面支持筛选、搜索、导出等操作

## 注意事项

1. 本系统为演示系统，部分数据为模拟数据
2. 实际使用时需要对接真实的后端接口
3. 系统支持响应式布局，建议在1920x1080分辨率下使用

## 更新日志

### 2024-12-26
- 新增设备管理模块（整合7个核心功能：系统能耗分析、系统关联分析、设备分类管理、设备维护记录、设备能耗预测、设备异常预警、设备报表生成）
- 优化路由配置和导航菜单
- 完善组件间数据交互机制
- 保留系统管理独立模块（系统配置、参数设置、权限管理、日志查看）

## 许可证

MIT License
