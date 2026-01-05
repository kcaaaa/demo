/**
 * 基础功能测试
 * 测试登录、导航、核心功能流程
 */

import { test, expect } from '@playwright/test'

// 测试配置
const BASE_URL = 'http://localhost:5173'
const TEST_USER = {
  username: 'admin',
  password: 'admin123',
}

test.describe('基础功能测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL)
  })

  test('登录功能 - 成功登录', async ({ page }) => {
    // 填写用户名
    await page.fill('input[placeholder*="用户名"]', TEST_USER.username)
    
    // 填写密码
    await page.fill('input[type="password"]', TEST_USER.password)
    
    // 点击登录按钮
    await page.click('button[type="submit"]')
    
    // 等待跳转到首页
    await page.waitForURL('**/dashboard', { timeout: 5000 })
    
    // 验证首页元素存在
    await expect(page.locator('text=首页')).toBeVisible()
    await expect(page.locator('text=能源监控平台')).toBeVisible()
  })

  test('登录功能 - 错误提示', async ({ page }) => {
    // 填写错误的用户名密码
    await page.fill('input[placeholder*="用户名"]', 'wronguser')
    await page.fill('input[type="password"]', 'wrongpass')
    
    // 点击登录
    await page.click('button[type="submit"]')
    
    // 验证错误提示
    await expect(page.locator('.ant-message-error, .ant-notification-notice-error')).toBeVisible({ timeout: 3000 })
  })

  test('菜单导航 - 各模块可访问', async ({ page }) => {
    // 先登录
    await page.fill('input[placeholder*="用户名"]', TEST_USER.username)
    await page.fill('input[type="password"]', TEST_USER.password)
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard', { timeout: 5000 })

    // 测试各个菜单项
    const menuItems = [
      { text: '单站能耗分析', url: '**/analysis/single' },
      { text: '能耗占比分析', url: '**/analysis/ratio' },
      { text: '能耗分析预警', url: '**/alerts' },
      { text: '多站能耗对比', url: '**/compare' },
      { text: '节能策略模拟', url: '**/strategy' },
      { text: '设备管理', url: '**/device' },
    ]

    for (const item of menuItems) {
      // 点击菜单项
      await page.click(`text=${item.text}`)
      
      // 等待页面加载
      await page.waitForLoadState('networkidle', { timeout: 5000 })
      
      // 验证 URL 包含预期路径
      await expect(page).toHaveURL(new RegExp(item.url.replace('**/', '').replace('/', '\\/')))
      
      // 验证页面标题存在
      await expect(page.locator(`text=${item.text}`)).toBeVisible()
    }
  })

  test('首页功能 - 筛选与导出', async ({ page }) => {
    // 登录
    await page.fill('input[placeholder*="用户名"]', TEST_USER.username)
    await page.fill('input[type="password"]', TEST_USER.password)
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard', { timeout: 5000 })

    // 测试筛选功能
    // 选择车站类型
    await page.click('.ant-segmented-item:has-text("中型站")')
    await page.waitForTimeout(500)

    // 选择能耗等级
    await page.click('.ant-segmented-item:has-text("二级")')
    await page.waitForTimeout(500)

    // 点击应用筛选
    await page.click('button:has-text("应用筛选")')
    
    // 等待成功提示
    await expect(page.locator('.ant-message-success')).toBeVisible({ timeout: 3000 })

    // 测试刷新数据
    await page.click('button:has-text("刷新数据")')
    await expect(page.locator('.ant-message-success')).toBeVisible({ timeout: 3000 })

    // 测试导出功能
    const downloadPromise = page.waitForEvent('download')
    await page.click('button:has-text("导出数据")')
    const download = await downloadPromise
    
    // 验证下载的文件名包含 csv
    expect(download.suggestedFilename()).toContain('.csv')
  })

  test('单站分析 - 查询与异常处理', async ({ page }) => {
    // 登录并导航到单站分析
    await page.fill('input[placeholder*="用户名"]', TEST_USER.username)
    await page.fill('input[type="password"]', TEST_USER.password)
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard', { timeout: 5000 })
    
    await page.click('text=单站能耗分析')
    await page.waitForLoadState('networkidle', { timeout: 5000 })

    // 选择车站
    await page.click('.ant-select:has-text("北京站")')
    await page.click('.ant-select-item:has-text("上海站")')
    await page.waitForTimeout(300)

    // 选择粒度
    await page.click('.ant-radio-button-wrapper:has-text("周")')
    await page.waitForTimeout(300)

    // 点击查询
    await page.click('button:has-text("查询")')
    await expect(page.locator('.ant-message-success')).toBeVisible({ timeout: 3000 })

    // 测试异常记录详情
    const detailButtons = page.locator('button:has-text("详情")')
    if (await detailButtons.count() > 0) {
      await detailButtons.first().click()
      
      // 验证详情弹窗打开
      await expect(page.locator('.ant-modal:has-text("异常详情")')).toBeVisible()
      
      // 关闭弹窗
      await page.click('.ant-modal button:has-text("关闭")')
    }

    // 测试导出
    const downloadPromise = page.waitForEvent('download')
    await page.click('button:has-text("导出CSV")')
    await downloadPromise
  })

  test('预警中心 - 批量操作', async ({ page }) => {
    // 登录并导航到预警中心
    await page.fill('input[placeholder*="用户名"]', TEST_USER.username)
    await page.fill('input[type="password"]', TEST_USER.password)
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard', { timeout: 5000 })
    
    await page.click('text=能耗分析预警')
    await page.waitForLoadState('networkidle', { timeout: 5000 })

    // 筛选未处理的预警
    await page.click('.ant-select:has-text("全部")').first()
    await page.click('.ant-select-item:has-text("未处理")')
    await page.click('button:has-text("查询")')
    await page.waitForTimeout(500)

    // 选择第一条记录（如果有）
    const checkboxes = page.locator('.ant-checkbox-input').filter({ hasNotText: '全选' })
    if (await checkboxes.count() > 0) {
      await checkboxes.first().check()
      await page.waitForTimeout(300)

      // 点击批量标记处理
      if (await page.locator('button:has-text("批量标记处理")').isVisible()) {
        await page.click('button:has-text("批量标记处理")')
        await expect(page.locator('.ant-message-success')).toBeVisible({ timeout: 3000 })
      }
    }
  })

  test('系统管理 - 用户列表访问', async ({ page }) => {
    // 以管理员身份登录
    await page.fill('input[placeholder*="用户名"]', TEST_USER.username)
    await page.fill('input[type="password"]', TEST_USER.password)
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard', { timeout: 5000 })
    
    // 导航到系统管理
    await page.click('text=系统管理')
    await page.waitForTimeout(500)
    
    await page.click('text=用户管理')
    await page.waitForLoadState('networkidle', { timeout: 5000 })

    // 验证用户列表显示
    await expect(page.locator('.ant-table')).toBeVisible()
    await expect(page.locator('text=用户名')).toBeVisible()
    await expect(page.locator('text=角色')).toBeVisible()
  })

  test('系统管理 - 角色管理', async ({ page }) => {
    // 登录
    await page.fill('input[placeholder*="用户名"]', TEST_USER.username)
    await page.fill('input[type="password"]', TEST_USER.password)
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard', { timeout: 5000 })
    
    // 导航到角色管理
    await page.click('text=系统管理')
    await page.waitForTimeout(500)
    await page.click('text=角色管理')
    await page.waitForLoadState('networkidle', { timeout: 5000 })

    // 验证角色列表显示
    await expect(page.locator('.ant-table')).toBeVisible()
    await expect(page.locator('text=角色名称')).toBeVisible()
  })

  test('退出登录', async ({ page }) => {
    // 登录
    await page.fill('input[placeholder*="用户名"]', TEST_USER.username)
    await page.fill('input[type="password"]', TEST_USER.password)
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard', { timeout: 5000 })

    // 点击用户头像/名称区域
    await page.click('.ant-dropdown-trigger, [class*="user"]').catch(() => {
      // 如果找不到标准的用户菜单，尝试查找退出按钮
    })
    
    await page.waitForTimeout(300)

    // 点击退出登录
    const logoutButton = page.locator('text=退出登录, text=退出, text=Logout').first()
    if (await logoutButton.isVisible({ timeout: 1000 }).catch(() => false)) {
      await logoutButton.click()
      
      // 验证返回登录页
      await page.waitForURL('**/login', { timeout: 5000 })
      await expect(page.locator('input[placeholder*="用户名"]')).toBeVisible()
    }
  })
})

