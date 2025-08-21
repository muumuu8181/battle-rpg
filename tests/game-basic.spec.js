const { test, expect } = require('@playwright/test');

test.describe('🎮 Epic Battle RPG - Basic Functionality', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
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
    const battleLog = page.locator('#log-content');
    
    await expect(attackBtn).toBeVisible();
    await expect(attackBtn).toBeEnabled();
    
    await attackBtn.click();
    
    // Check if attack was executed
    await expect(battleLog.locator('p').last()).toContainText('ダメージ');
  });

  test('🛡️ Other action buttons are responsive', async ({ page }) => {
    // Test all main action buttons
    const buttons = [
      '#skill-btn',
      '#guard-btn', 
      '#item-btn'
    ];
    
    for (const btnSelector of buttons) {
      const btn = page.locator(btnSelector);
      await expect(btn).toBeVisible();
      await expect(btn).toBeEnabled();
    }
  });

  test('💾 Save/Load buttons work', async ({ page }) => {
    const saveBtn = page.locator('#save-btn');
    const loadBtn = page.locator('#load-btn');
    
    await expect(saveBtn).toBeVisible();
    await expect(loadBtn).toBeVisible();
    
    // Test save functionality
    await saveBtn.click();
    await page.waitForTimeout(500);
    
    // Test load functionality  
    await loadBtn.click();
    await page.waitForTimeout(500);
  });

  test('🗡️ Weapon system integration', async ({ page }) => {
    // Win battle to access town
    let battleWon = false;
    for (let i = 0; i < 50 && !battleWon; i++) {
      await page.locator('#attack-btn').click();
      await page.waitForTimeout(200);
      
      if (await page.locator('#result-screen').isVisible()) {
        battleWon = true;
      }
    }
    
    if (battleWon) {
      await page.locator('#town-btn').click();
      await page.waitForTimeout(500);
      
      // Check weapon button in town
      const weaponBtn = page.locator('#weapon-btn');
      await expect(weaponBtn).toBeVisible();
      
      await weaponBtn.click();
      await page.waitForTimeout(500);
      
      // Check weapon selection screen
      await expect(page.locator('#weapon-screen')).toBeVisible();
      await expect(page.locator('.weapon-option').first()).toBeVisible();
    }
  });

  test('🏪 Shop functionality', async ({ page }) => {
    // Win battle to access town
    let battleWon = false;
    for (let i = 0; i < 50 && !battleWon; i++) {
      await page.locator('#attack-btn').click();
      await page.waitForTimeout(200);
      
      if (await page.locator('#result-screen').isVisible()) {
        battleWon = true;
        break;
      }
    }
    
    if (battleWon) {
      await page.locator('#town-btn').click();
      await page.waitForTimeout(500);
      
      // Check shop access
      const shopBtn = page.locator('#shop-btn');
      await expect(shopBtn).toBeVisible();
      
      await shopBtn.click();
      await page.waitForTimeout(500);
      
      // Verify shop screen
      await expect(page.locator('#shop-screen')).toBeVisible();
      await expect(page.locator('.buy-btn').first()).toBeVisible();
    }
  });

  test('📱 Mobile responsiveness', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await expect(page.locator('#game-container')).toBeVisible();
    await expect(page.locator('#attack-btn')).toBeVisible();
    await expect(page.locator('#battle-arena')).toBeVisible();
  });

  test('🎯 Game flow integrity', async ({ page }) => {
    // Test complete game flow
    const initialScore = await page.locator('#score').textContent();
    
    // Attack enemy
    await page.locator('#attack-btn').click();
    await page.waitForTimeout(500);
    
    // Check if combat system responds
    const battleLog = page.locator('#log-content p').last();
    const logText = await battleLog.textContent();
    
    expect(logText).toMatch(/(ダメージ|攻撃|クリティカル)/);
  });

  test('🔧 Error handling', async ({ page }) => {
    // Test JavaScript error handling
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Perform various actions
    await page.locator('#attack-btn').click();
    await page.locator('#skill-btn').click();
    await page.locator('#skill-back').click();
    
    await page.waitForTimeout(1000);
    
    // Check for critical errors
    const criticalErrors = consoleErrors.filter(err => 
      err.includes('TypeError') || 
      err.includes('ReferenceError') ||
      err.includes('is not defined')
    );
    
    expect(criticalErrors.length).toBe(0);
  });
});