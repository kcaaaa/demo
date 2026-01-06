# GitHub Pages 部署记录

## 项目信息

- **项目名称**: 中国高铁站节能降耗演示系统
- **仓库地址**: https://github.com/kcaaaa/demo
- **线上地址**: https://kcaaaa.github.io/demo/
- **账号邮箱**: 2473994475@qq.com
- **部署分支**: gh-pages

## 部署配置

### Vite 配置
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  base: '/demo/',  // 与仓库名一致
})
```

### 路由配置
```typescript
// router.tsx
export const router = createBrowserRouter([
  // 路由配置
], {
  basename: '/demo',  // 与 base 配置一致
})
```

## 部署方式

### 方式一: GitHub Actions 自动部署 (推荐)

**工作流文件**: `.github/workflows/deploy.yml`

**触发条件**:
- 推送到 main 或 master 分支
- 手动触发 (workflow_dispatch)

**部署步骤**:
1. 检出代码
2. 安装 Node.js 18
3. 安装依赖 (`npm ci`)
4. 构建项目 (`npm run build`)
5. 部署到 gh-pages 分支

**优点**:
- 自动化，无需手动操作
- 稳定可靠
- 有部署记录和日志

### 方式二: 手动部署脚本

**脚本文件**: `部署文件夹/deploy.sh`

**使用方法**:
```bash
chmod +x 部署文件夹/deploy.sh
./部署文件夹/deploy.sh
```

**适用场景**:
- 本地快速部署
- 紧急修复上线
- 测试部署流程

### 方式三: 完全手动部署

详见 `部署文件夹/deploy-manual.md`

## 部署历史

| 日期 | 版本 | 部署方式 | 更新内容 | 部署人员 | 状态 |
|------|------|---------|---------|---------|------|
| 2025-01-06 | v1.0 | 初始部署 | 完整系统初次上线，包含入口页功能 | 系统管理员 | ✅ 待部署 |

## 部署检查清单

### 部署前检查
- [ ] 代码已提交到主分支
- [ ] 所有测试通过
- [ ] 构建无错误 (`npm run build`)
- [ ] Linter 检查通过 (`npm run lint`)
- [ ] 本地预览正常 (`npm run preview`)
- [ ] 环境变量已配置
- [ ] base 路径配置正确

### 部署后验证
- [ ] 首页可正常访问
- [ ] 登录功能正常
- [ ] 入口页地图显示正常
- [ ] 所有路由可正常跳转
- [ ] 资源文件加载正常 (CSS/JS/图片)
- [ ] 移动端响应式正常
- [ ] 刷新页面不出现 404

## 常见问题及解决方案

### Q1: 部署后页面显示空白
**原因**: base 路径配置错误
**解决**: 检查 `vite.config.ts` 和 `router.tsx` 的路径配置

### Q2: 刷新页面后 404
**原因**: SPA 路由问题
**解决**: 已添加 `404.html` 自动重定向

### Q3: 地图无法显示
**原因**: Leaflet CSS 未加载或网络问题
**解决**: 检查 CDN 资源或使用本地 CSS

### Q4: 构建失败
**原因**: 依赖版本冲突或代码错误
**解决**: 检查 TypeScript 错误和依赖版本

### Q5: Git 推送被拒绝
**原因**: 权限不足或凭据过期
**解决**: 更新 Git 凭据或使用 Personal Access Token

## 回滚方案

### 方法一: 使用 Git 回滚
```bash
# 1. 查看 gh-pages 分支历史
git log gh-pages

# 2. 回滚到指定提交
git reset --hard <commit-id>

# 3. 强制推送
git push -f origin gh-pages
```

### 方法二: 重新部署旧版本
```bash
# 1. 切换到旧版本标签
git checkout <tag-name>

# 2. 重新执行部署
./部署文件夹/deploy.sh
```

## 性能优化

### 已实施的优化
- [x] 代码分割 (Code Splitting)
- [x] Tree Shaking
- [x] 资源压缩
- [x] CDN 加速 (Leaflet)
- [x] 响应式图片

### 待优化项
- [ ] Service Worker (PWA)
- [ ] 图片懒加载
- [ ] 路由懒加载
- [ ] Gzip 压缩
- [ ] 缓存策略优化

## 监控和分析

### 访问统计
- Google Analytics (待配置)
- GitHub Insights

### 错误监控
- 浏览器控制台
- Sentry (可选)

## 维护计划

### 日常维护
- 每周检查 GitHub Actions 状态
- 每月检查依赖更新
- 定期备份配置文件

### 版本更新
- 小版本更新: 直接部署
- 大版本更新: 先在测试环境验证

## 相关文档

- [部署手册](./deploy-manual.md)
- [部署脚本](./deploy.sh)
- [GitHub Actions 配置](../.github/workflows/deploy.yml)

## 技术支持

如遇到部署问题,请联系:
- 技术负责人: 产品技术团队
- 邮箱: 2473994475@qq.com

---

**文档版本**: v1.0  
**创建时间**: 2025-01-06  
**最后更新**: 2025-01-06

