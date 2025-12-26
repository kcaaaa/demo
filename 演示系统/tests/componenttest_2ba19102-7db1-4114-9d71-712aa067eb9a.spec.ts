
import { test } from '@playwright/test';
import { expect } from '@playwright/test';

test('ComponentTest_2025-12-23', async ({ page, context }) => {
  
    // Navigate to URL
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });

    // Take screenshot
    await page.screenshot({ path: 'home_page.png', { fullPage: true } });

    // Click element
    await page.click('//span[contains(text(),'单站能耗分析')]');

    // Click element
    await page.click('//li[@class='el-menu-item'][contains(.,'单站能耗分析')]');

    // Take screenshot
    await page.screenshot({ path: 'station_analysis_page.png', { fullPage: true } });

    // Click element
    await page.click('//li[@class='el-menu-item'][contains(.,'能耗分析预警')]');

    // Take screenshot
    await page.screenshot({ path: 'energy_alert_page.png', { fullPage: true } });

    // Click element
    await page.click('//li[@class='el-menu-item'][contains(.,'多站能耗对比')]');

    // Click element
    await page.click('//li[@class='el-menu-item']//i[@class='fa fa-line-chart']/following-sibling::span');

    // Navigate to URL
    await page.goto('http://localhost:5173/multi-station-compare', { waitUntil: 'networkidle' });

    // Take screenshot
    await page.screenshot({ path: 'multi_station_compare_page.png', { fullPage: true } });

    // Navigate to URL
    await page.goto('http://localhost:5173/energy-strategy', { waitUntil: 'networkidle' });

    // Take screenshot
    await page.screenshot({ path: 'energy_strategy_page.png', { fullPage: true } });

    // Navigate to URL
    await page.goto('http://localhost:5173/device-management', { waitUntil: 'networkidle' });

    // Take screenshot
    await page.screenshot({ path: 'device_management_page.png', { fullPage: true } });

    // Navigate to URL
    await page.goto('http://localhost:5173/system-management', { waitUntil: 'networkidle' });

    // Take screenshot
    await page.screenshot({ path: 'system_management_page.png', { fullPage: true } });
});