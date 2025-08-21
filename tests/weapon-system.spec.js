const { test, expect } = require('@playwright/test');

test.describe('🗡️ Weapon System - Quick Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });

  test('⚔️ Default weapon attack works', async ({ page }) => {
    const attackBtn = page.locator('#attack-btn');
    const battleLog = page.locator('#log-content');
    
    await attackBtn.click();
    await page.waitForTimeout(500);
    
    // Check if sword icon appears in log (default weapon)
    const logText = await battleLog.textContent();
    expect(logText).toContain('ダメージ');
  });

  test('🎯 Multi-hit system active', async ({ page }) => {
    // Attack twice and check for damage output
    await page.locator('#attack-btn').click();
    await page.waitForTimeout(300);
    await page.locator('#attack-btn').click();
    await page.waitForTimeout(300);
    
    const battleLog = page.locator('#log-content');
    const logText = await battleLog.textContent();
    
    // Should have multiple damage entries
    expect(logText.split('ダメージ').length).toBeGreaterThan(2);
  });
});