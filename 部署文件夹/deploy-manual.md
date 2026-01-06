# GitHub Pages 手动部署指南

## 部署地址
https://kcaaaa.github.io/demo/

## 账号信息
- 邮箱: 2473994475@qq.com
- 密码: Kc111111.

## 快速部署 (推荐)

### 方式一: 使用部署脚本 (Linux/Mac)

```bash
# 1. 给脚本添加执行权限
chmod +x 部署文件夹/deploy.sh

# 2. 运行部署脚本
./部署文件夹/deploy.sh
```

### 方式二: 使用 GitHub Actions (自动部署)

1. **启用 GitHub Actions**
   - 进入仓库 Settings -> Actions -> General
   - 启用 "Allow all actions and reusable workflows"

2. **配置 Pages 设置**
   - 进入仓库 Settings -> Pages
   - Source 选择: "Deploy from a branch"
   - Branch 选择: "gh-pages" / "(root)"
   - 点击 Save

3. **触发自动部署**
   - 推送代码到 main 或 master 分支
   - 或在 Actions 页面手动触发 workflow

## 手动部署步骤 (Windows)

### 1. 构建项目

```powershell
# 进入 app 目录
cd app

# 安装依赖
npm install

# 构建项目
npm run build
```

### 2. 初始化 Git 仓库

```powershell
# 进入构建输出目录
cd dist

# 初始化 git
git init

# 配置 git 用户信息
git config user.name "Your Name"
git config user.email "2473994475@qq.com"
```

### 3. 提交并推送

```powershell
# 添加所有文件
git add -A

# 提交
git commit -m "Deploy to GitHub Pages"

# 添加远程仓库
git remote add origin https://github.com/kcaaaa/demo.git

# 强制推送到 gh-pages 分支
git push -f origin main:gh-pages
```

### 4. 配置 GitHub Pages

1. 登录 GitHub: https://github.com/login
2. 进入仓库: https://github.com/kcaaaa/demo
3. 点击 Settings
4. 在左侧菜单找到 Pages
5. 在 Source 下选择:
   - Branch: gh-pages
   - Folder: / (root)
6. 点击 Save

### 5. 等待部署完成

- GitHub Pages 会自动部署，通常需要 1-5 分钟
- 部署完成后访问: https://kcaaaa.github.io/demo/

## 故障排查

### 问题1: 页面显示 404

**解决方案:**
1. 检查 `app/vite.config.ts` 中的 `base` 配置是否为 `/demo/`
2. 确认 GitHub Pages 设置中的分支为 `gh-pages`
3. 检查 `app/dist` 目录下是否有 `404.html` 文件
4. 等待几分钟让 GitHub Pages 刷新

### 问题2: 路由跳转后刷新页面 404

**解决方案:**
已在 `app/public` 目录创建 `404.html` 文件，会自动重定向到 `index.html`

### 问题3: CSS/JS 资源加载失败

**解决方案:**
1. 确认 `vite.config.ts` 的 `base` 设置正确
2. 清除浏览器缓存
3. 检查浏览器控制台的网络请求路径

### 问题4: Git 推送失败

**解决方案:**
```powershell
# 配置 Git 凭据
git config --global credential.helper store

# 或使用 Personal Access Token
# 1. GitHub -> Settings -> Developer settings -> Personal access tokens
# 2. 生成新 token (repo 权限)
# 3. 推送时使用 token 作为密码
```

## 更新部署

每次修改代码后，重新执行部署步骤即可更新线上版本。

## 验证部署

部署成功后访问以下页面验证:
- 首页: https://kcaaaa.github.io/demo/
- 登录页: https://kcaaaa.github.io/demo/login
- 入口页: https://kcaaaa.github.io/demo/station-select

## 注意事项

1. **确保仓库为公开(Public)**，私有仓库需要 GitHub Pro 才能使用 Pages
2. **base 路径**: 项目配置的 base 路径为 `/demo/`，与仓库名一致
3. **分支保护**: 不要直接推送到 gh-pages 分支，使用部署脚本或 Actions
4. **构建产物**: 不要将 `dist` 目录提交到主分支
5. **环境变量**: 生产环境的 API 地址等配置需要在构建前配置好

## 相关资源

- GitHub Pages 文档: https://docs.github.com/en/pages
- Vite 部署指南: https://vitejs.dev/guide/static-deploy.html
- GitHub Actions 文档: https://docs.github.com/en/actions

---

**最后更新**: 2025-01-06

