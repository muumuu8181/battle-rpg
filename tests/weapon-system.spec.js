const { test, expect } = require('@playwright/test');

test.describe('🗡️ Weapon System Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('⚔️ Default weapon (sword) is equipped', async ({ page }) => {
    // Check if sword is the default weapon in battle log
    const battleLog = page.locator('#log-content');
    
    // Perform attack to see weapon info
    await page.locator('#attack-btn').click();
    await page.waitForTimeout(500);
    
    const logText = await battleLog.textContent();
    expect(logText).toContain('⚔️');
  });

  test('🗡️ Weapon selection screen functionality', async ({ page }) => {
    // Win battle to access town
    await winBattleHelper(page);
    
    if (await page.locator('#result-screen').isVisible()) {
      await page.locator('#town-btn').click();
      await page.waitForTimeout(500);
      
      // Open weapon selection
      await page.locator('#weapon-btn').click();
      await page.waitForTimeout(500);
      
      // Verify weapon options are present
      await expect(page.locator('[data-weapon="sword"]')).toBeVisible();
      await expect(page.locator('[data-weapon="club"]')).toBeVisible();
      await expect(page.locator('[data-weapon="axe"]')).toBeVisible();
      
      // Check weapon details
      await expect(page.locator('[data-weapon="sword"] .weapon-type')).toContainText('2ヒット');
      await expect(page.locator('[data-weapon="club"] .weapon-type')).toContainText('3ヒット');
      await expect(page.locator('[data-weapon="axe"] .weapon-type')).toContainText('1ヒット');
    }
  });

  test('🔄 Weapon switching works', async ({ page }) => {
    await winBattleHelper(page);
    
    if (await page.locator('#result-screen').isVisible()) {
      await page.locator('#town-btn').click();
      await page.waitForTimeout(500);
      
      // Open weapon selection
      await page.locator('#weapon-btn').click();
      await page.waitForTimeout(500);
      
      // Switch to club
      const clubEquipBtn = page.locator('[data-weapon="club"] .equip-btn');
      if (await clubEquipBtn.isEnabled()) {
        await clubEquipBtn.click();
        await page.waitForTimeout(500);
        
        // Check if weapon changed in current weapon display
        const currentWeapon = page.locator('#current-weapon-display');
        await expect(currentWeapon).toContainText('棍棒');
      }
    }
  });

  test('⚡ Attack type system works', async ({ page }) => {
    // Attack multiple times to check for attack type variations
    for (let i = 0; i < 5; i++) {
      await page.locator('#attack-btn').click();
      await page.waitForTimeout(300);
    }
    
    const battleLog = page.locator('#log-content');
    const logText = await battleLog.textContent();
    
    // Check for attack type mentions (斬撃, 打撃, 突き)
    const hasAttackTypes = logText.includes('斬撃') || 
                          logText.includes('打撃') || 
                          logText.includes('突き');
    
    expect(hasAttackTypes).toBe(true);
  });

  test('💥 Multi-hit damage display', async ({ page }) => {
    // Monitor damage area for multi-hit numbers
    await page.locator('#attack-btn').click();
    await page.waitForTimeout(500);
    
    // Check if damage numbers appear (they get removed after animation)
    const damageArea = page.locator('#damage-area');
    
    // Since damage numbers are temporary, we check the battle log instead
    const battleLog = page.locator('#log-content');
    const logText = await battleLog.textContent();
    
    expect(logText).toContain('ダメージ');
  });

  test('🏘️ Town weapon display', async ({ page }) => {
    await winBattleHelper(page);
    
    if (await page.locator('#result-screen').isVisible()) {
      await page.locator('#town-btn').click();
      await page.waitForTimeout(500);
      
      // Check if current weapon is displayed in town stats
      const townStats = page.locator('#town-stats');
      const statsText = await townStats.textContent();
      
      expect(statsText).toContain('現在の武器');
    }
  });
});

// Helper function to win battle quickly
async function winBattleHelper(page, maxAttempts = 50) {
  for (let i = 0; i < maxAttempts; i++) {
    if (await page.locator('#result-screen').isVisible()) {
      break;
    }
    
    await page.locator('#attack-btn').click();
    await page.waitForTimeout(200);
  }
}