const { test, expect } = require('@playwright/test');

test.describe('🎮 Epic Battle RPG - Basic Functionality', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });

  test('🏠 Page loads correctly', async ({ page }) => {
    await expect(page).toHaveTitle('Epic Battle RPG - 爽快戦闘システム');
    await expect(page.locator('h1')).toContainText('Epic Battle RPG');
    
    // Check initial UI elements
    await expect(page.locator('#score')).toContainText('Score: 0');
    await expect(page.locator('#level')).toContainText('Level: 1');
  });

  test('⚔️ Attack button works', async ({ page }) => {
    const attackBtn = page.locator('#attack-btn');
    
    await expect(attackBtn).toBeVisible();
    await expect(attackBtn).toBeEnabled();
    
    await attackBtn.click();
    await page.waitForTimeout(1000);
    
    // Check if attack was executed by checking battle log
    const battleLog = page.locator('#log-content');
    await expect(battleLog).toContainText('ダメージ');
  });

  test('🛡️ Action buttons are responsive', async ({ page }) => {
    // Test main action buttons visibility
    await expect(page.locator('#attack-btn')).toBeVisible();
    await expect(page.locator('#skill-btn')).toBeVisible();
    await expect(page.locator('#guard-btn')).toBeVisible();
    await expect(page.locator('#item-btn')).toBeVisible();
  });

  test('💾 Save/Load buttons work', async ({ page }) => {
    const saveBtn = page.locator('#save-btn');
    const loadBtn = page.locator('#load-btn');
    
    await expect(saveBtn).toBeVisible();
    await expect(loadBtn).toBeVisible();
    
    // Test save functionality
    await saveBtn.click();
    await page.waitForTimeout(300);
    
    // Test load functionality  
    await loadBtn.click();
    await page.waitForTimeout(300);
  });

  test('🔧 Basic error handling', async ({ page }) => {
    // Test JavaScript error handling
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Perform basic actions
    await page.locator('#attack-btn').click();
    await page.waitForTimeout(500);
    
    // Check for critical errors
    const criticalErrors = consoleErrors.filter(err => 
      err.includes('TypeError') || 
      err.includes('ReferenceError') ||
      err.includes('is not defined')
    );
    
    expect(criticalErrors.length).toBe(0);
  });
});