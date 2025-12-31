<template>
  <div class="strategy-export-share-container">
    <el-card shadow="hover" class="export-card">
      <div slot="header" class="card-header">
        <h3 class="card-title">
          <i class="fa fa-share-alt"></i> 策略导出与分享
        </h3>
        <div class="header-actions">
          <el-button size="small" @click="handleImport">
            <i class="fa fa-import"></i> 导入策略
          </el-button>
          <el-button type="primary" size="small" @click="handleBatchExport">
            <i class="fa fa-file-zip-o"></i> 批量导出
          </el-button>
        </div>
      </div>

      <div class="export-content">
        <el-row :gutter="20">
          <el-col :xs="24" :lg="8">
            <el-card shadow="hover" class="export-type-card">
              <div class="card-icon pdf">
                <i class="fa fa-file-pdf-o"></i>
              </div>
              <h4>导出为PDF</h4>
              <p>生成包含策略详情的PDF报告</p>
              <el-button type="primary" size="small" @click="handleExportPDF">
                <i class="fa fa-download"></i> 导出PDF
              </el-button>
            </el-card>
          </el-col>
          <el-col :xs="24" :lg="8">
            <el-card shadow="hover" class="export-type-card">
              <div class="card-icon excel">
                <i class="fa fa-file-excel-o"></i>
              </div>
              <h4>导出为Excel</h4>
              <p>生成包含数据的Excel表格</p>
              <el-button type="success" size="small" @click="handleExportExcel">
                <i class="fa fa-download"></i> 导出Excel
              </el-button>
            </el-card>
          </el-col>
          <el-col :xs="24" :lg="8">
            <el-card shadow="hover" class="export-type-card">
              <div class="card-icon json">
                <i class="fa fa-code"></i>
              </div>
              <h4>导出为JSON</h4>
              <p>导出结构化JSON数据</p>
              <el-button type="warning" size="small" @click="handleExportJSON">
                <i class="fa fa-download"></i> 导出JSON
              </el-button>
            </el-card>
          </el-col>
        </el-row>

        <el-card shadow="hover" class="share-card">
          <div slot="header" class="card-header">
            <span><i class="fa fa-share-alt"></i> 分享策略</span>
          </div>
          <div class="share-content">
            <el-form label-width="100px" class="share-form">
              <el-form-item label="选择策略">
                <el-select v-model="selectedStrategy" placeholder="请选择要分享的策略" style="width: 100%;">
                  <el-option
                    v-for="item in strategyList"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id">
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="分享方式">
                <div class="share-options">
                  <div class="share-option" @click="handleShareByLink" :class="{ active: shareMethod === 'link' }">
                    <i class="fa fa-link"></i>
                    <span>生成链接</span>
                  </div>
                  <div class="share-option" @click="handleShareByEmail" :class="{ active: shareMethod === 'email' }">
                    <i class="fa fa-envelope"></i>
                    <span>邮件分享</span>
                  </div>
                  <div class="share-option" @click="handleShareByQRCode" :class="{ active: shareMethod === 'qrcode' }">
                    <i class="fa fa-qrcode"></i>
                    <span>二维码</span>
                  </div>
                  <div class="share-option" @click="handleShareByExport" :class="{ active: shareMethod === 'export' }">
                    <i class="fa fa-file-export"></i>
                    <span>导出分享</span>
                  </div>
                </div>
              </el-form-item>
              <el-form-item v-if="shareMethod === 'link'" label="分享链接">
                <el-input v-model="shareLink" readonly>
                  <template slot="append">
                    <el-button @click="handleCopyLink">
                      <i class="fa fa-copy"></i> 复制
                    </el-button>
                  </template>
                </el-input>
                <div class="link-options">
                  <el-checkbox v-model="linkConfig.expiration">设置有效期</el-checkbox>
                  <el-checkbox v-model="linkConfig.password">设置密码</el-checkbox>
                  <el-checkbox v-model="linkConfig.permission">限制下载权限</el-checkbox>
                </div>
                <div v-if="linkConfig.expiration" class="expiration-config">
                  <el-select v-model="linkConfig.expirationDays" placeholder="选择有效期" style="width: 200px;">
                    <el-option label="7天" :value="7"></el-option>
                    <el-option label="30天" :value="30"></el-option>
                    <el-option label="90天" :value="90"></el-option>
                    <el-option label="永久" :value="0"></el-option>
                  </el-select>
                </div>
              </el-form-item>
              <el-form-item v-if="shareMethod === 'email'" label="收件人">
                <el-input v-model="emailConfig.recipients" placeholder="请输入收件人邮箱，多个用逗号分隔"></el-input>
              </el-form-item>
              <el-form-item v-if="shareMethod === 'email'" label="邮件主题">
                <el-input v-model="emailConfig.subject" placeholder="请输入邮件主题"></el-input>
              </el-form-item>
              <el-form-item v-if="shareMethod === 'email'" label="邮件内容">
                <el-input type="textarea" v-model="emailConfig.content" :rows="4" placeholder="请输入邮件内容"></el-input>
              </el-form-item>
              <el-form-item v-if="shareMethod === 'email'" label="附件格式">
                <el-radio-group v-model="emailConfig.attachmentFormat">
                  <el-radio label="pdf">PDF</el-radio>
                  <el-radio label="excel">Excel</el-radio>
                  <el-radio label="json">JSON</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item v-if="shareMethod === 'qrcode'" label="二维码设置">
                <div class="qrcode-settings">
                  <div class="qrcode-preview">
                    <div ref="qrcodeRef" class="qrcode-display"></div>
                  </div>
                  <div class="qrcode-options">
                    <el-form-item label="尺寸">
                      <el-slider v-model="qrcodeConfig.size" :min="100" :max="300" :step="10"></el-slider>
                    </el-form-item>
                    <el-form-item label="容错级别">
                      <el-select v-model="qrcodeConfig.errorLevel" style="width: 100%;">
                        <el-option label="L (7%)" value="L"></el-option>
                        <el-option label="M (15%)" value="M"></el-option>
                        <el-option label="Q (25%)" value="Q"></el-option>
                        <el-option label="H (30%)" value="H"></el-option>
                      </el-select>
                    </el-form-item>
                    <el-button type="primary" size="small" @click="handleDownloadQRCode">
                      <i class="fa fa-download"></i> 下载二维码
                    </el-button>
                  </div>
                </div>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleConfirmShare" :loading="sharing">
                  <i class="fa fa-share-alt"></i> {{ shareMethod === 'link' ? '生成分享链接' : shareMethod === 'email' ? '发送邮件' : '生成分享内容' }}
                </el-button>
                <el-button @click="handleReset">重置</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-card>

        <el-card shadow="hover" class="history-card">
          <div slot="header" class="card-header">
            <span><i class="fa fa-history"></i> 分享历史</span>
          </div>
          <div class="history-content">
            <el-table :data="shareHistory" stripe style="width: 100%">
              <el-table-column prop="time" label="分享时间" width="180"></el-table-column>
              <el-table-column prop="strategy" label="策略名称" width="200"></el-table-column>
              <el-table-column prop="method" label="分享方式" width="100">
                <template slot-scope="scope">
                  <el-tag :type="getMethodType(scope.row.method)" size="small">
                    <i :class="getMethodIcon(scope.row.method)"></i> {{ getMethodText(scope.row.method) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="target" label="分享目标">
                <template slot-scope="scope">
                  <span v-if="scope.row.method === 'link'">{{ scope.row.target }}</span>
                  <span v-else-if="scope.row.method === 'email'">{{ scope.row.recipients }}</span>
                  <span v-else-if="scope.row.method === 'qrcode'">二维码{{ scope.row.count }}次</span>
                  <span v-else>{{ scope.row.target }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="expiration" label="有效期" width="120">
                <template slot-scope="scope">
                  <span :class="isExpired(scope.row.expiration) ? 'expired' : ''">
                    {{ scope.row.expiration || '永久' }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column prop="clicks" label="访问次数" width="100"></el-table-column>
              <el-table-column label="操作" width="150">
                <template slot-scope="scope">
                  <el-button type="text" size="small" @click="handleRevisitShare(scope.row)">
                    <i class="fa fa-refresh"></i> 重新分享
                  </el-button>
                  <el-button type="text" size="small" @click="handleRevokeShare(scope.row)" :disabled="isExpired(scope.row.expiration)">
                    <i class="fa fa-times"></i> 撤销
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>

        <el-card shadow="hover" class="import-card">
          <div slot="header" class="card-header">
            <span><i class="fa fa-download"></i> 导入策略</span>
          </div>
          <div class="import-content">
            <el-upload
              class="import-uploader"
              drag
              action="#"
              :auto-upload="false"
              :on-change="handleImportChange"
              :on-remove="handleImportRemove"
              accept=".json,.excel,.xlsx,.csv"
              multiple>
              <i class="fa fa-cloud-upload upload-icon"></i>
              <div class="upload-text">
                <span>将文件拖到此处，或<em>点击上传</em></span>
              </div>
              <div class="upload-hint">
                支持 JSON、Excel、CSV 格式，单个文件不超过10MB
              </div>
            </el-upload>
            <div v-if="importFiles.length > 0" class="import-files">
              <h4>待导入文件：</h4>
              <el-table :data="importFiles" style="width: 100%">
                <el-table-column prop="name" label="文件名"></el-table-column>
                <el-table-column prop="size" label="大小" width="120">
                  <template slot-scope="scope">
                    {{ formatFileSize(scope.row.size) }}
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="100">
                  <template slot-scope="scope">
                    <el-button type="text" size="small" @click="handleRemoveImportFile(scope.$index)">
                      <i class="fa fa-times"></i> 移除
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
              <div class="import-actions">
                <el-button type="primary" @click="handleConfirmImport" :loading="importing">
                  <i class="fa fa-check"></i> 开始导入
                </el-button>
                <el-button @click="handleClearImportFiles">
                  <i class="fa fa-trash"></i> 清空
                </el-button>
              </div>
            </div>
          </div>
        </el-card>

        <el-card shadow="hover" class="template-card">
          <div slot="header" class="card-header">
            <span><i class="fa fa-cube"></i> 策略模板库</span>
          </div>
          <div class="template-content">
            <div class="template-filters">
              <el-input
                v-model="templateSearch"
                placeholder="搜索模板"
                size="small"
                style="width: 200px;">
                <template slot="prefix">
                  <i class="fa fa-search"></i>
                </template>
              </el-input>
              <el-select v-model="templateCategory" placeholder="分类筛选" size="small" style="width: 150px;">
                <el-option label="全部" value="all"></el-option>
                <el-option label="照明策略" value="lighting"></el-option>
                <el-option label="空调策略" value="hvac"></el-option>
                <el-option label="通风策略" value="ventilation"></el-option>
                <el-option label="综合策略" value="comprehensive"></el-option>
              </el-select>
            </div>
            <div class="template-list">
              <el-row :gutter="20">
                <el-col :xs="24" :sm="12" :lg="8" :xl="6" v-for="template in filteredTemplates" :key="template.id">
                  <div class="template-item">
                    <div class="template-icon" :style="{ background: template.color }">
                      <i :class="['fa', template.icon]"></i>
                    </div>
                    <div class="template-info">
                      <h5>{{ template.name }}</h5>
                      <p>{{ template.description }}</p>
                      <div class="template-meta">
                        <span><i class="fa fa-download"></i> {{ template.downloads }}</span>
                        <span><i class="fa fa-star"></i> {{ template.rating }}</span>
                      </div>
                    </div>
                    <div class="template-actions">
                      <el-button size="small" type="primary" @click="handleUseTemplate(template)">
                        <i class="fa fa-check"></i> 使用
                      </el-button>
                      <el-button size="small" @click="handleExportTemplate(template)">
                        <i class="fa fa-download"></i> 导出
                      </el-button>
                    </div>
                  </div>
                </el-col>
              </el-row>
            </div>
          </div>
        </el-card>
      </div>
    </el-card>

    <el-dialog title="策略详情预览" :visible.sync="previewVisible" width="70%">
      <div class="preview-content">
        <div ref="previewContent" class="preview-details">
          <h3>{{ currentPreviewStrategy.name }}</h3>
          <div class="preview-section">
            <h4>策略描述</h4>
            <p>{{ currentPreviewStrategy.description }}</p>
          </div>
          <div class="preview-section">
            <h4>策略参数</h4>
            <el-table :data="currentPreviewStrategy.parameters" stripe style="width: 100%">
              <el-table-column prop="name" label="参数名称"></el-table-column>
              <el-table-column prop="value" label="参数值"></el-table-column>
              <el-table-column prop="unit" label="单位"></el-table-column>
            </el-table>
          </div>
          <div class="preview-section">
            <h4>预期效果</h4>
            <el-row :gutter="20">
              <el-col :span="8">
                <div class="effect-item">
                  <span class="effect-label">节能率</span>
                  <span class="effect-value">{{ currentPreviewStrategy.effect.energySavings }}%</span>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="effect-item">
                  <span class="effect-label">节约成本</span>
                  <span class="effect-value">¥{{ currentPreviewStrategy.effect.costSavings }}</span>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="effect-item">
                  <span class="effect-label">投资回报</span>
                  <span class="effect-value">{{ currentPreviewStrategy.effect.paybackPeriod }}个月</span>
                </div>
              </el-col>
            </el-row>
          </div>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="previewVisible = false">关闭</el-button>
        <el-button type="primary" @click="handleExportPDF">
          <i class="fa fa-file-pdf-o"></i> 导出PDF
        </el-button>
      </span>
    </el-dialog>

    <el-dialog title="分享设置" :visible.sync="shareSettingsVisible" width="50%">
      <div class="share-settings-content">
        <el-form label-width="100px">
          <el-form-item label="分享范围">
            <el-radio-group v-model="shareSettings.scope">
              <el-radio label="public">公开分享</el-radio>
              <el-radio label="organization">组织内分享</el-radio>
              <el-radio label="private">私密分享</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="权限设置">
            <el-checkbox-group v-model="shareSettings.permissions">
              <el-checkbox label="view">允许查看</el-checkbox>
              <el-checkbox label="copy">允许复制</el-checkbox>
              <el-checkbox label="download">允许下载</el-checkbox>
              <el-checkbox label="modify">允许修改</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
          <el-form-item label="访问密码">
            <el-input v-model="shareSettings.password" placeholder="留空则不设置密码" show-password></el-input>
          </el-form-item>
          <el-form-item label="访问记录">
            <el-switch v-model="shareSettings.trackVisits" active-text="记录访问日志"></el-switch>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="shareSettingsVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveShareSettings">保存设置</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import QRCode from 'qrcode'

export default {
  name: 'StrategyExportShare',
  data() {
    return {
      selectedStrategy: 'strategy_001',
      shareMethod: 'link',
      sharing: false,
      importing: false,
      previewVisible: false,
      shareSettingsVisible: false,
      shareLink: 'https://energy.example.com/share/abc123xyz',
      linkConfig: {
        expiration: false,
        password: false,
        permission: false,
        expirationDays: 30
      },
      emailConfig: {
        recipients: '',
        subject: '',
        content: '',
        attachmentFormat: 'pdf'
      },
      qrcodeConfig: {
        size: 200,
        errorLevel: 'M'
      },
      importFiles: [],
      templateSearch: '',
      templateCategory: 'all',
      shareSettings: {
        scope: 'organization',
        permissions: ['view', 'copy'],
        password: '',
        trackVisits: true
      },
      currentPreviewStrategy: {},
      strategyList: [
        { id: 'strategy_001', name: '候车大厅智能照明策略' },
        { id: 'strategy_002', name: '站台空调智能调节策略' },
        { id: 'strategy_003', name: '电梯运行优化策略' },
        { id: 'strategy_004', name: '站房通风系统优化策略' },
        { id: 'strategy_005', name: '照明与空调联动策略' }
      ],
      shareHistory: [
        {
          time: '2024-01-15 10:30:25',
          strategy: '候车大厅智能照明策略',
          method: 'link',
          target: 'https://energy.example.com/share/abc123xyz',
          expiration: '2024-02-15',
          clicks: 156
        },
        {
          time: '2024-01-14 15:22:18',
          strategy: '站台空调智能调节策略',
          method: 'email',
          recipients: 'manager@station.com',
          expiration: null,
          clicks: 0
        },
        {
          time: '2024-01-13 09:15:42',
          strategy: '电梯运行优化策略',
          method: 'qrcode',
          count: 45,
          expiration: '2024-02-13',
          clicks: 45
        }
      ],
      templateList: [
        {
          id: 'tpl_001',
          name: '智能照明控制',
          description: '基于人流和自然光的智能照明调节策略',
          icon: 'fa-lightbulb-o',
          color: '#67C23A',
          category: 'lighting',
          downloads: 1256,
          rating: 4.8,
          parameters: [
            { name: '光照阈值', value: 300, unit: 'lux' },
            { name: '人体感应延迟', value: 30, unit: '秒' },
            { name: '亮度调节范围', value: '20-100', unit: '%' }
          ],
          effect: { energySavings: 18.5, costSavings: 156000, paybackPeriod: 14 }
        },
        {
          id: 'tpl_002',
          name: '空调温度优化',
          description: '根据室内外温差和人流密度自动调节空调温度',
          icon: 'fa-snowflake-o',
          color: '#409EFF',
          category: 'hvac',
          downloads: 986,
          rating: 4.6,
          parameters: [
            { name: '目标温度', value: 24, unit: '°C' },
            { name: '温度波动范围', value: ±2, unit: '°C' },
            { name: '新风比例', value: 30, unit: '%' }
          ],
          effect: { energySavings: 15.2, costSavings: 128000, paybackPeriod: 18 }
        },
        {
          id: 'tpl_003',
          name: '通风系统优化',
          description: '智能控制通风系统运行时间和风速',
          icon: 'fa-wind',
          color: '#E6A23C',
          category: 'ventilation',
          downloads: 654,
          rating: 4.5,
          parameters: [
            { name: 'CO₂浓度阈值', value: 1000, unit: 'ppm' },
            { name: '最小换气次数', value: 6, unit: '次/小时' },
            { name: '智能启停时段', value: '6:00-23:00', unit: '' }
          ],
          effect: { energySavings: 10.5, costSavings: 72000, paybackPeriod: 22 }
        },
        {
          id: 'tpl_004',
          name: '电梯群控优化',
          description: '根据客流模式优化电梯调度和运行策略',
          icon: 'fa-building',
          color: '#909399',
          category: 'comprehensive',
          downloads: 432,
          rating: 4.7,
          parameters: [
            { name: '等待时间阈值', value: 60, unit: '秒' },
            { name: '峰谷调节系数', value: 1.2, unit: '' },
            { name: '电梯联动数量', value: 6, unit: '台' }
          ],
          effect: { energySavings: 12.8, costSavings: 85000, paybackPeriod: 12 }
        },
        {
          id: 'tpl_005',
          name: '照明空调联动',
          description: '综合考虑照明和空调需求的智能联动控制',
          icon: 'fa-connectdevelop',
          color: '#F56C6C',
          category: 'comprehensive',
          downloads: 521,
          rating: 4.9,
          parameters: [
            { name: '联动控制模式', value: '智能联动', unit: '' },
            { name: '节能模式优先级', value: '高', unit: '' },
            { name: '用户舒适度权重', value: 0.7, unit: '' }
          ],
          effect: { energySavings: 22.0, costSavings: 185000, paybackPeriod: 16 }
        }
      ]
    }
  },
  computed: {
    filteredTemplates() {
      return this.templateList.filter(template => {
        const matchSearch = template.name.includes(this.templateSearch) ||
                          template.description.includes(this.templateSearch)
        const matchCategory = this.templateCategory === 'all' || template.category === this.templateCategory
        return matchSearch && matchCategory
      })
    }
  },
  mounted() {
    this.initQRCode()
  },
  methods: {
    initQRCode() {
      this.$nextTick(() => {
        this.renderQRCode()
      })
    },
    renderQRCode() {
      const qrcodeDom = this.$refs.qrcodeRef
      if (!qrcodeDom) return
      QRCode.toCanvas(qrcodeDom, this.shareLink, {
        width: this.qrcodeConfig.size,
        margin: 2,
        errorCorrectionLevel: this.qrcodeConfig.errorLevel
      }, (error) => {
        if (error) console.error(error)
      })
    },
    getMethodType(method) {
      const types = {
        link: 'primary',
        email: 'success',
        qrcode: 'warning',
        export: 'info'
      }
      return types[method] || 'info'
    },
    getMethodIcon(method) {
      const icons = {
        link: 'fa fa-link',
        email: 'fa fa-envelope',
        qrcode: 'fa fa-qrcode',
        export: 'fa fa-file-export'
      }
      return icons[method] || 'fa fa-share-alt'
    },
    getMethodText(method) {
      const texts = {
        link: '链接',
        email: '邮件',
        qrcode: '二维码',
        export: '导出'
      }
      return texts[method] || '分享'
    },
    isExpired(expiration) {
      if (!expiration) return false
      return new Date(expiration) < new Date()
    },
    formatFileSize(size) {
      if (size < 1024) return size + ' B'
      if (size < 1024 * 1024) return (size / 1024).toFixed(2) + ' KB'
      return (size / (1024 * 1024)).toFixed(2) + ' MB'
    },
    handleShareByLink() {
      this.shareMethod = 'link'
    },
    handleShareByEmail() {
      this.shareMethod = 'email'
    },
    handleShareByQRCode() {
      this.shareMethod = 'qrcode'
      this.$nextTick(() => {
        this.renderQRCode()
      })
    },
    handleShareByExport() {
      this.shareMethod = 'export'
    },
    handleCopyLink() {
      navigator.clipboard.writeText(this.shareLink)
      this.$message.success('链接已复制到剪贴板')
    },
    handleDownloadQRCode() {
      const canvas = this.$refs.qrcodeRef
      if (canvas) {
        const url = canvas.toDataURL('image/png')
        const link = document.createElement('a')
        link.download = 'strategy-share-qrcode.png'
        link.href = url
        link.click()
        this.$message.success('二维码下载成功')
      }
    },
    handleConfirmShare() {
      this.sharing = true
      setTimeout(() => {
        this.sharing = false
        if (this.shareMethod === 'link') {
          this.$message.success('分享链接已生成')
        } else if (this.shareMethod === 'email') {
          this.$message.success('邮件已发送')
        } else if (this.shareMethod === 'qrcode') {
          this.$message.success('二维码已生成')
        } else {
          this.$message.success('分享内容已准备就绪')
        }
      }, 1500)
    },
    handleReset() {
      this.shareMethod = 'link'
      this.linkConfig = {
        expiration: false,
        password: false,
        permission: false,
        expirationDays: 30
      }
      this.emailConfig = {
        recipients: '',
        subject: '',
        content: '',
        attachmentFormat: 'pdf'
      }
      this.shareLink = 'https://energy.example.com/share/abc123xyz'
      this.$message.info('已重置分享设置')
    },
    handleRevisitShare(row) {
      this.selectedStrategy = row.strategyId || 'strategy_001'
      this.handleShareByLink()
      this.$message.info('已重新生成分享链接')
    },
    handleRevokeShare(row) {
      this.$confirm('确定要撤销该分享吗？撤销后链接将立即失效。', '确认撤销', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const index = this.shareHistory.findIndex(item => item === row)
        if (index > -1) {
          this.shareHistory.splice(index, 1)
        }
        this.$message.success('分享已撤销')
      }).catch(() => {})
    },
    handleExportPDF() {
      this.$message.info('正在生成PDF报告...')
      setTimeout(() => {
        this.$message.success('PDF报告已生成')
      }, 2000)
    },
    handleExportExcel() {
      this.$message.info('正在生成Excel表格...')
      setTimeout(() => {
        this.$message.success('Excel表格已生成')
      }, 2000)
    },
    handleExportJSON() {
      const strategy = this.strategyList.find(s => s.id === this.selectedStrategy)
      const data = JSON.stringify(strategy, null, 2)
      const blob = new Blob([data], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.download = `strategy-${this.selectedStrategy}.json`
      link.href = url
      link.click()
      URL.revokeObjectURL(url)
      this.$message.success('JSON文件已导出')
    },
    handleBatchExport() {
      this.$message.info('正在准备批量导出...')
      setTimeout(() => {
        this.$message.success('批量导出完成')
      }, 3000)
    },
    handleImport() {
      this.$message.info('请选择要导入的文件')
    },
    handleImportChange(file) {
      this.importFiles.push(file)
    },
    handleImportRemove(file) {
      const index = this.importFiles.findIndex(f => f.uid === file.uid)
      if (index > -1) {
        this.importFiles.splice(index, 1)
      }
    },
    handleRemoveImportFile(index) {
      this.importFiles.splice(index, 1)
    },
    handleClearImportFiles() {
      this.importFiles = []
      this.$message.info('已清空待导入文件')
    },
    handleConfirmImport() {
      if (this.importFiles.length === 0) {
        this.$message.warning('请先选择要导入的文件')
        return
      }
      this.importing = true
      setTimeout(() => {
        this.importing = false
        this.importFiles = []
        this.$message.success('策略导入成功')
      }, 2000)
    },
    handleUseTemplate(template) {
      this.currentPreviewStrategy = template
      this.previewVisible = true
    },
    handleExportTemplate(template) {
      const data = JSON.stringify(template, null, 2)
      const blob = new Blob([data], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.download = `template-${template.id}.json`
      link.href = url
      link.click()
      URL.revokeObjectURL(url)
      this.$message.success('模板已导出')
    },
    handleSaveShareSettings() {
      this.shareSettingsVisible = false
      this.$message.success('分享设置已保存')
    }
  }
}
</script>

<style scoped>
.strategy-export-share-container {
  padding: 20px;
  background-color: #f5f7fa;
}

.export-card {
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

.export-content {
  padding: 10px;
}

.export-type-card {
  text-align: center;
  margin-bottom: 20px;
}

.card-icon {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 15px;
  font-size: 32px;
  color: #fff;
}

.card-icon.pdf {
  background: linear-gradient(135deg, #F56C6C 0%, #f89898 100%);
}

.card-icon.excel {
  background: linear-gradient(135deg, #67C23A 0%, #85ce61 100%);
}

.card-icon.json {
  background: linear-gradient(135deg, #E6A23C 0%, #f3c36b 100%);
}

.export-type-card h4 {
  margin: 0 0 8px;
  color: #303133;
}

.export-type-card p {
  margin: 0 0 15px;
  color: #909399;
  font-size: 14px;
}

.share-card,
.history-card,
.import-card,
.template-card {
  margin-top: 20px;
}

.share-content {
  padding: 10px;
}

.share-form {
  max-width: 700px;
}

.share-options {
  display: flex;
  gap: 15px;
}

.share-option {
  flex: 1;
  padding: 20px;
  border: 2px solid #ebeef5;
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.share-option:hover {
  border-color: #409EFF;
  background-color: #ecf5ff;
}

.share-option.active {
  border-color: #409EFF;
  background-color: #ecf5ff;
}

.share-option i {
  display: block;
  font-size: 28px;
  color: #409EFF;
  margin-bottom: 8px;
}

.share-option span {
  font-size: 14px;
  color: #606266;
}

.link-options {
  margin-top: 10px;
  display: flex;
  gap: 20px;
}

.expiration-config {
  margin-top: 10px;
}

.qrcode-settings {
  display: flex;
  gap: 30px;
  align-items: flex-start;
}

.qrcode-preview {
  padding: 20px;
  background-color: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
}

.qrcode-display {
  width: 200px;
  height: 200px;
}

.qrcode-options {
  flex: 1;
}

.qrcode-options .el-form-item {
  margin-bottom: 15px;
}

.history-content {
  padding: 10px;
}

.expired {
  color: #F56C6C;
}

.import-content {
  padding: 10px;
}

.import-uploader {
  width: 100%;
}

.import-uploader .el-upload {
  width: 100%;
}

.import-uploader .el-upload-dragger {
  width: 100%;
}

.upload-icon {
  font-size: 48px;
  color: #C0C4CC;
  margin-bottom: 15px;
}

.upload-text {
  color: #606266;
}

.upload-text em {
  color: #409EFF;
  font-style: normal;
}

.upload-hint {
  font-size: 12px;
  color: #909399;
  margin-top: 10px;
}

.import-files {
  margin-top: 20px;
}

.import-files h4 {
  margin: 0 0 15px;
  color: #303133;
}

.import-actions {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}

.template-content {
  padding: 10px;
}

.template-filters {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.template-list {
  padding: 10px;
}

.template-item {
  background-color: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  transition: all 0.3s;
}

.template-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.template-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
  font-size: 24px;
  color: #fff;
}

.template-info h5 {
  margin: 0 0 8px;
  font-size: 16px;
  color: #303133;
}

.template-info p {
  margin: 0 0 10px;
  font-size: 14px;
  color: #909399;
  line-height: 1.4;
}

.template-meta {
  display: flex;
  gap: 15px;
  font-size: 13px;
  color: #909399;
}

.template-meta i {
  margin-right: 4px;
}

.template-actions {
  margin-top: 15px;
  display: flex;
  gap: 10px;
}

.preview-content {
  padding: 20px;
}

.preview-details h3 {
  margin: 0 0 20px;
  color: #303133;
  text-align: center;
}

.preview-section {
  margin-bottom: 25px;
}

.preview-section h4 {
  margin: 0 0 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
  color: #409EFF;
}

.preview-section p {
  color: #606266;
  line-height: 1.6;
}

.effect-item {
  text-align: center;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.effect-label {
  display: block;
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.effect-value {
  font-size: 24px;
  font-weight: 700;
  color: #67C23A;
}

.share-settings-content {
  padding: 20px;
}

@media (max-width: 768px) {
  .strategy-export-share-container {
    padding: 10px;
  }

  .share-options {
    flex-wrap: wrap;
  }

  .share-option {
    flex: 1 1 40%;
  }

  .qrcode-settings {
    flex-direction: column;
    align-items: center;
  }

  .template-filters {
    flex-direction: column;
  }
}
</style>
