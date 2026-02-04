#!/bin/bash

# GitHub Actions 验证脚本
# 用于验证 GitHub Actions 配置是否正确

echo "🔍 GitHub Actions 配置验证"
echo "================================"
echo ""

# 检查工作流文件是否存在
echo "📁 检查工作流文件..."
if [ -f ".github/workflows/ci.yml" ]; then
    echo "✅ CI 工作流文件存在"
else
    echo "❌ CI 工作流文件不存在"
fi

if [ -f ".github/workflows/release.yml" ]; then
    echo "✅ Release 工作流文件存在"
else
    echo "❌ Release 工作流文件不存在"
fi

echo ""

# 检查 package.json 脚本
echo "📦 检查 package.json 脚本..."
if grep -q '"release:patch"' package.json; then
    echo "✅ release:patch 脚本存在"
else
    echo "❌ release:patch 脚本不存在"
fi

if grep -q '"release:minor"' package.json; then
    echo "✅ release:minor 脚本存在"
else
    echo "❌ release:minor 脚本不存在"
fi

if grep -q '"release:major"' package.json; then
    echo "✅ release:major 脚本存在"
else
    echo "❌ release:major 脚本不存在"
fi

echo ""

# 检查文档
echo "📚 检查文档..."
if [ -f "DEPLOYMENT.md" ]; then
    echo "✅ DEPLOYMENT.md 文档存在"
else
    echo "❌ DEPLOYMENT.md 文档不存在"
fi

if grep -q "Deployment" README.md; then
    echo "✅ README.md 包含部署说明"
else
    echo "❌ README.md 缺少部署说明"
fi

echo ""

# 检查 Git 配置
echo "🔧 检查 Git 配置..."
if git rev-parse --git-dir > /dev/null 2>&1; then
    echo "✅ Git 仓库已初始化"
    echo "   当前分支: $(git branch --show-current)"
else
    echo "❌ Git 仓库未初始化"
fi

echo ""

# 检查远程仓库
echo "🌐 检查远程仓库..."
if git remote get-url origin > /dev/null 2>&1; then
    echo "✅ 远程仓库已配置"
    echo "   远程 URL: $(git remote get-url origin)"
else
    echo "⚠️  远程仓库未配置"
    echo "   请运行: git remote add origin <your-repo-url>"
fi

echo ""

# 检查 package.json 配置
echo "📋 检查 package.json..."
if grep -q '"repository"' package.json; then
    echo "✅ repository 字段已配置"
else
    echo "⚠️  repository 字段未配置"
fi

if grep -q '"homepage"' package.json; then
    echo "✅ homepage 字段已配置"
else
    echo "⚠️  homepage 字段未配置"
fi

if grep -q '"bugs"' package.json; then
    echo "✅ bugs 字段已配置"
else
    echo "⚠️  bugs 字段未配置"
fi

echo ""
echo "================================"
echo "✨ 验证完成！"
echo ""
echo "📝 下一步："
echo "   1. 在 GitHub 上配置 NPM_TOKEN secret"
echo "   2. 推送代码到 GitHub"
echo "   3. 运行: npm run release:patch"
echo ""
echo "📖 详细说明请查看 DEPLOYMENT.md"
