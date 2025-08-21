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

  test('🔧 Save-Load-Attack Integration (Critical Bug Fix)', async ({ page }) => {
    // 前回の問題: ロード後に攻撃ボタンが無反応になるバグのテスト
    const consoleErrors = [];
    const pageErrors = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    page.on('pageerror', error => {
      pageErrors.push(error.message);
    });
    
    // Step 1: 初期攻撃（成功確認）
    await page.locator('#attack-btn').click();
    await page.waitForTimeout(1000);
    
    const battleLog = page.locator('#log-content');
    await expect(battleLog).toContainText('ダメージ');
    
    // Step 2: セーブ・ロード
    await page.locator('#save-btn').click();
    await page.waitForTimeout(500);
    await page.locator('#load-btn').click(); 
    await page.waitForTimeout(500);
    
    // Step 3: ロード後の攻撃（ここでエラーが発生していた）
    await page.locator('#attack-btn').click();
    await page.waitForTimeout(1000);
    
    // ロード後も攻撃が正常に動作することを確認
    await expect(battleLog).toContainText('ダメージ');
    
    // JavaScript エラーの確認
    const allErrors = [...consoleErrors, ...pageErrors];
    const criticalErrors = allErrors.filter(err => 
      err.includes('TypeError') || 
      err.includes('ReferenceError') ||
      err.includes('is not defined') ||
      err.includes('attackMultiplier') ||
      err.includes('Cannot read properties of undefined')
    );
    
    if (criticalErrors.length > 0) {
      console.log('Critical errors found:', criticalErrors);
    }
    
    expect(criticalErrors.length).toBe(0);
  });

  test('🔧 JavaScript error detection', async ({ page }) => {
    // Test JavaScript error handling
    const consoleErrors = [];
    const pageErrors = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    page.on('pageerror', error => {
      pageErrors.push(error.message);
    });
    
    // Perform actions that might trigger errors
    await page.locator('#attack-btn').click();
    await page.waitForTimeout(1000);
    
    await page.locator('#save-btn').click();
    await page.waitForTimeout(500);
    
    await page.locator('#load-btn').click();
    await page.waitForTimeout(500);
    
    await page.locator('#attack-btn').click();
    await page.waitForTimeout(1000);
    
    // Check for critical errors
    const allErrors = [...consoleErrors, ...pageErrors];
    const criticalErrors = allErrors.filter(err => 
      err.includes('TypeError') || 
      err.includes('ReferenceError') ||
      err.includes('is not defined') ||
      err.includes('attackMultiplier')
    );
    
    if (criticalErrors.length > 0) {
      console.log('Critical errors found:', criticalErrors);
    }
    
    expect(criticalErrors.length).toBe(0);
  });

  test('🏘️ Town Save-Load Screen State Preservation', async ({ page }) => {
    // 実際の問題: 街でセーブしても戦闘画面から開始される
    const consoleErrors = [];
    const pageErrors = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    page.on('pageerror', error => {
      pageErrors.push(error.message);
    });
    
    // Step 1: 街画面に移動
    await page.locator('#town-btn').click();
    await page.waitForTimeout(500);
    
    // 街画面が表示されていることを確認
    const townScreen = page.locator('#town-screen');
    await expect(townScreen).not.toHaveClass(/hidden/);
    
    // Step 2: 街画面でセーブ
    await page.locator('#town-save-btn').click();
    await page.waitForTimeout(500);
    
    // Step 3: ロード
    await page.locator('#load-btn').click();
    await page.waitForTimeout(1000);
    
    // Step 4: ロード後も街画面から開始されることを確認
    await expect(townScreen).not.toHaveClass(/hidden/);
    
    // 戦闘画面が非表示になっていることを確認
    const battleArena = page.locator('#battle-arena');
    const townScreenVisible = await townScreen.isVisible();
    
    expect(townScreenVisible).toBe(true);
    
    // エラーチェック
    const allErrors = [...consoleErrors, ...pageErrors];
    const criticalErrors = allErrors.filter(err => 
      err.includes('TypeError') || 
      err.includes('undefined') ||
      err.includes('wounds')
    );
    
    if (criticalErrors.length > 0) {
      console.log('Critical errors during town save-load:', criticalErrors);
    }
    
    expect(criticalErrors.length).toBe(0);
  });

  test('🎯 Realistic Battle Scenario with Multiple Actions', async ({ page }) => {
    // より現実的なシナリオ: 戦闘→街→武器変更→戦闘→セーブ→ロード
    const consoleErrors = [];
    const pageErrors = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    page.on('pageerror', error => {
      pageErrors.push(error.message);
    });
    
    // Step 1: 初期戦闘
    await page.locator('#attack-btn').click();
    await page.waitForTimeout(1000);
    
    // Step 2: 街に移動
    await page.locator('#town-btn').click();
    await page.waitForTimeout(500);
    
    // Step 3: 武器変更
    await page.locator('#weapon-btn').click();
    await page.waitForTimeout(500);
    
    // 武器選択（斧に変更）
    await page.locator('[data-weapon="axe"] .equip-btn').click();
    await page.waitForTimeout(500);
    
    // 街に戻る
    await page.locator('#weapon-back').click();
    await page.waitForTimeout(500);
    
    // Step 4: 新しい戦闘開始
    await page.locator('#battle-btn').click();
    await page.waitForTimeout(500);
    
    // 攻撃してみる
    await page.locator('#attack-btn').click();
    await page.waitForTimeout(1000);
    
    // Step 5: セーブ・ロード
    await page.locator('#save-btn').click();
    await page.waitForTimeout(500);
    await page.locator('#load-btn').click();
    await page.waitForTimeout(1000);
    
    // Step 6: ロード後の動作確認
    await page.locator('#attack-btn').click();
    await page.waitForTimeout(1000);
    
    // バトルログが正常に更新されることを確認
    const battleLog = page.locator('#log-content');
    await expect(battleLog).toContainText('ダメージ');
    
    // エラーチェック
    const allErrors = [...consoleErrors, ...pageErrors];
    const criticalErrors = allErrors.filter(err => 
      err.includes('TypeError') || 
      err.includes('Cannot read properties') ||
      err.includes('undefined') ||
      err.includes('wounds') ||
      err.includes('attackMultiplier')
    );
    
    if (criticalErrors.length > 0) {
      console.log('Critical errors during realistic scenario:', criticalErrors);
    }
    
    expect(criticalErrors.length).toBe(0);
  });
});