#!/bin/bash

# GitHub Pages 部署脚本

echo "========================================="
echo "  高铁站节能降耗演示系统 - 部署脚本"
echo "========================================="
echo ""

# 配置变量
REPO_URL="https://github.com/kcaaaa/demo.git"
BRANCH="gh-pages"
BUILD_DIR="app/dist"

# 检查是否在项目根目录
if [ ! -d "app" ]; then
    echo "❌ 错误: 请在项目根目录运行此脚本"
    exit 1
fi

echo "📦 1. 安装依赖..."
cd app
npm install

echo ""
echo "🔨 2. 构建项目..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ 构建失败，部署中止"
    exit 1
fi

echo ""
echo "✅ 构建完成"

# 回到项目根目录
cd ..

echo ""
echo "📤 3. 准备部署到 GitHub Pages..."

# 进入构建输出目录
cd $BUILD_DIR

# 初始化 git
git init
git config user.name "GitHub Actions Bot"
git config user.email "actions@github.com"

# 添加所有文件
git add -A

# 提交
git commit -m "Deploy to GitHub Pages - $(date +'%Y-%m-%d %H:%M:%S')"

# 强制推送到 gh-pages 分支
echo ""
echo "🚀 4. 推送到 GitHub Pages..."
echo "📍 仓库地址: $REPO_URL"
echo "🌿 目标分支: $BRANCH"

git push -f $REPO_URL main:$BRANCH

if [ $? -eq 0 ]; then
    echo ""
    echo "========================================="
    echo "✅ 部署成功!"
    echo "========================================="
    echo ""
    echo "🌐 访问地址: https://kcaaaa.github.io/demo/"
    echo ""
    echo "⏰ GitHub Pages 可能需要几分钟时间更新"
    echo "📝 如果无法访问，请检查:"
    echo "   1. 仓库设置 -> Pages -> Source 是否设置为 gh-pages 分支"
    echo "   2. 仓库是否为公开(Public)"
    echo ""
else
    echo ""
    echo "❌ 部署失败"
    echo "请检查网络连接和 Git 凭据"
    exit 1
fi

# 清理
cd ../../..
rm -rf $BUILD_DIR/.git

echo ""
echo "========================================="
echo "  部署流程完成"
echo "========================================="

