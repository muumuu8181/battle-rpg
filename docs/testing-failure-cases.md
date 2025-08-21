# 🚨 テスト失敗事例集 - 学習用ケーススタディ

## 📖 このドキュメントについて

実際の開発で発生したテストの見落とし・失敗事例を記録し、同じミスを防ぐための学習材料として活用する。

---

## 🎮 Case Study #1: Epic Battle RPG - 武器システムの見落とし

### **発生日時**: 2025-08-21
### **プロジェクト**: Epic Battle RPG v0.32-v0.35
### **症状**: 攻撃ボタンが反応しない（JavaScript エラー）

---

### 🚨 **実際に発生したエラー**

```javascript
script.js:176 Uncaught TypeError: Cannot read properties of undefined (reading 'attackMultiplier')
script.js:176 Uncaught TypeError: Cannot read properties of undefined (reading 'attackMultiplier')
script.js:176 Uncaught TypeError: Cannot read properties of undefined (reading 'attackMultiplier')
```

### 🔍 **根本原因の分析**

#### **コード上の問題**
```javascript
// 問題のあったコード (script.js:176)
const weapon = this.weapons[this.player.currentWeapon];
const weaponAttack = Math.floor(this.player.attack * weapon.attackMultiplier); // ← weapon が undefined
```

#### **なぜ undefined になったのか**
1. **loadGame()** でプレイヤーオブジェクトを完全置換
2. **currentWeapon** プロパティが正しく復元されない
3. **this.weapons[undefined]** → undefined → **attackMultiplier** 参照エラー

```javascript
// 問題のあった loadGame() 処理
this.player = saveData.player; // ← 完全置換で微妙な差異が発生
```

---

### 🎭 **テスト設計の問題点**

#### **❌ 不十分だったテスト**
```javascript
// 実際に書いていたテスト
test('⚔️ Attack button works', async ({ page }) => {
    await page.locator('#attack-btn').click();
    await expect(battleLog).toContainText('ダメージ'); // ← 表面的な確認のみ
});
```

#### **❌ 欠けていた観点**
1. **状態遷移テスト不足**
   - 初期攻撃: ✅ 成功
   - セーブ→ロード→攻撃: ❌ **未テスト** ← ここでエラー発生

2. **エラー検出メカニズム不足**
   - `console.error` 監視: ✅ あった
   - `pageerror` 監視: ❌ **なかった** ← TypeError を見逃し

3. **統合テスト不足**
   - 単体機能: ✅ 動作確認済み
   - 機能間連携: ❌ **セーブ・ロード・攻撃の連携未確認**

---

### 🎯 **見落としパターンの分類**

#### **テストピラミッドでの位置づけ**
- **単体テスト**: ✅ 各機能は個別に動作
- **統合テスト**: ❌ **機能間の状態遷移で破綻**
- **E2Eテスト**: 部分的（Happy Path のみ）

#### **3拍子揃った要注意機能だった**
1. **状態を持つ**: currentWeapon というプロパティ
2. **データ保存**: セーブ・ロード機能
3. **他機能連携**: 戦闘システムとの統合

→ **要注意機能なのに、対応する包括テストがなかった**

---

### ✅ **修正後の適切なテスト**

#### **状態遷移テストの追加**
```javascript
test('🔧 Save-Load-Attack Integration', async ({ page }) => {
    // 初期攻撃（成功確認）
    await page.locator('#attack-btn').click();
    await page.waitForTimeout(500);
    
    // セーブ・ロード
    await page.locator('#save-btn').click();
    await page.waitForTimeout(500);
    await page.locator('#load-btn').click(); 
    await page.waitForTimeout(500);
    
    // ロード後の攻撃（ここでエラーが発生していた）
    await page.locator('#attack-btn').click();
    await page.waitForTimeout(1000);
    
    const battleLog = page.locator('#log-content');
    await expect(battleLog).toContainText('ダメージ');
});
```

#### **エラー検出の強化**
```javascript
test('🚨 JavaScript Error Detection', async ({ page }) => {
    const consoleErrors = [];
    const pageErrors = [];
    
    // 両方のエラーを監視
    page.on('console', msg => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', error => {
        pageErrors.push(error.message); // ← これが欠けていた
    });
    
    // セーブ・ロード・攻撃の連続実行
    await page.locator('#attack-btn').click();
    await page.locator('#save-btn').click();
    await page.locator('#load-btn').click();
    await page.locator('#attack-btn').click(); // エラー発生ポイント
    
    // 特定エラーの検出
    const criticalErrors = [...consoleErrors, ...pageErrors].filter(err => 
        err.includes('attackMultiplier') // 具体的なエラー監視
    );
    
    expect(criticalErrors.length).toBe(0);
});
```

#### **防御的プログラミングの追加**
```javascript
// 修正後のコード
const weapon = this.weapons[this.player.currentWeapon];
if (!weapon) {
    console.error('Weapon not found:', this.player.currentWeapon);
    this.player.currentWeapon = 'sword'; // デフォルトにリセット
    return;
}
const weaponAttack = Math.floor(this.player.attack * weapon.attackMultiplier);
```

---

### 📊 **CI/CDパイプラインでの検出状況**

#### **GitHub Actions の結果**
- **v0.33以前**: ✅ テスト成功（誤った成功）
- **実際のブラウザ**: ❌ 攻撃ボタン無反応
- **v0.35以降**: ✅ 真の成功（エラー修正済み）

#### **なぜ CI/CD で検出できなかったか**
1. **テストカバレッジの盲点**: セーブ・ロード後の動作未検証
2. **エラー検出の不備**: pageerror 監視なし
3. **統合テストの不足**: 機能間連携の境界部分

---

### 🎓 **この事例から学べること**

#### **テスト設計時の注意点**
1. **状態を持つ機能は状態遷移テスト必須**
2. **データ永続化機能は保存→読込→使用のフルフロー必須**  
3. **エラー検出は複数の監視手法を組み合わせる**

#### **機能実装時の注意点**
1. **loadGame() でのオブジェクト置換は危険**（マージ推奨）
2. **undefined チェックによる防御的プログラミング必須**
3. **複雑な機能ほど統合テストを手厚くする**

#### **CI/CD運用時の注意点**
1. **グリーンテスト症候群に注意**（テスト通過≠品質保証）
2. **実ブラウザでの手動確認も定期実施**
3. **エラー監視の網羅性を定期見直し**

---

### 🔄 **改善アクション**

#### **即座に実施した対策**
- [x] 防御的プログラミング追加
- [x] loadGame() 安全化（オブジェクトマージ）
- [x] エラー検出強化（pageerror 追加）
- [x] 状態遷移テスト追加

#### **今後の予防策**
- [ ] テストレビュープロセス導入
- [ ] 「3拍子機能」自動検出ツール開発
- [ ] テストカバレッジ可視化
- [ ] 定期的な実ブラウザテスト自動化

---

## 💡 **類似事例を防ぐためのクイックチェック**

新機能実装時に以下を確認：

### **⚠️ 危険度: 高**
- [ ] 状態を持つ + データ保存 + 他機能連携
- [ ] オブジェクトの完全置換処理あり
- [ ] undefined の可能性がある変数参照

### **⚠️ 危険度: 中**  
- [ ] 非同期処理との組み合わせ
- [ ] ユーザー操作の順序依存
- [ ] ブラウザ固有APIの使用

### **✅ 必須テスト**
- [ ] 初期状態 + 変更後状態の両方
- [ ] 正常系 + エラー系の両方  
- [ ] 単体動作 + 統合動作の両方

---

*この事例は Epic Battle RPG v0.32-v0.35 の実際の失敗から学んだものです。*
*同様の問題を未然に防ぐため、チーム内での共有と学習に活用してください。*