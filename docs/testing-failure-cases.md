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

## 🎮 Case Study #2: Epic Battle RPG - 画面状態復元とテストケース設計の改善

### **発生日時**: 2025-08-21 
### **プロジェクト**: Epic Battle RPG v0.38-v0.41
### **症状**: 1) 街でセーブしても戦闘画面から開始 2) ロード後の操作エラー

---

### 🚨 **実際に発生した問題**

#### **ユーザー報告の内容**
```
「ロードした瞬間に、まず戦闘画面になってるのが多分おかしくて。
相手のヒットポイントがゼロの状態からスタートした。
街でセーブしてるんだから、町からスタートでよくない？」
```

#### **技術的エラー**
```javascript
script.js:562  Uncaught TypeError: Cannot read properties of undefined (reading 'slash')
script.js:562  Uncaught TypeError: Cannot read properties of undefined (reading 'slash')
(繰り返し発生)
```

---

### 🔍 **根本原因の複合的分析**

#### **問題1: 画面状態の保存・復元不備**
```javascript
// 問題のあったコード - セーブ時
const saveData = {
    gameState: this.gameState,
    player: this.player,
    items: this.items,
    enemy: this.enemy,
    // 画面状態が保存されていない！
};
```

```javascript
// 問題のあったコード - ロード時
if (this.enemy) {
    // 敵が存在する場合は常に戦闘画面を表示
    this.isBattleActive = true;
    // 実際に街でセーブしていても戦闘画面になってしまう
}
```

#### **問題2: 敵データの不完全復元**
```javascript
// 敵データ復元時の問題
this.enemy = saveData.enemy;
// ↑ 古いセーブデータにはwoundsプロパティが含まれていない

// その後の処理でエラー発生
const physicalWounds = this.enemy.wounds.slash + ...;  // undefined.slash
```

---

### 🎭 **テスト設計の根本的問題点**

#### **❌ 従来のテストの限界**

```javascript
// 既存テスト - 機能は確認済み
test('💾 Save/Load buttons work', async ({ page }) => {
    await saveBtn.click();
    await loadBtn.click();
    // → セーブ・ロード機能自体は動作している
});
```

**なぜ問題を検出できなかったか:**
1. **表面的な機能確認**: ボタンが押せることは確認済み
2. **画面状態の軽視**: セーブ・ロード後の画面状態は未確認
3. **現実的シナリオ不足**: 実際のユーザー操作フローを模倣していない

#### **❌ 「緑のテスト症候群」**
- ✅ GitHub Actions: 全テスト成功
- ❌ 実際のブラウザ: 複数の重大な問題発生
- **結果**: 「CI/CDは通るが実際は動かない」状況

---

### 🎯 **問題解決のアプローチ改善**

#### **従来の対応パターン（問題あり）**
```
1. コードを修正
2. 「修正完了」と報告
3. テストを実行せずに確信
```

#### **今回採用した改善パターン**
```
1. ユーザー報告の詳細分析
2. 実際のエラーログ確認  
3. 問題を再現する現実的テストケース作成
4. 修正とテストケースの同時実装
5. 実際の動作確認を依頼
```

---

### ✅ **実装した解決策**

#### **1. 画面状態の完全保存・復元**

```javascript
// 修正後のセーブ処理
const saveData = {
    // ... 既存データ
    battleState: {
        isBattleActive: this.isBattleActive,
        isPlayerTurn: this.isPlayerTurn,
        currentScreen: currentScreen  // 現在の画面状態を判定・保存
    }
};
```

```javascript
// 修正後のロード処理
if (saveData.battleState) {
    // 保存された画面状態を復元
    const currentScreen = saveData.battleState.currentScreen || 'town';
    
    switch (currentScreen) {
        case 'town':
            this.showTownScreen();
            break;
        // ... 他の画面も適切に復元
    }
} else {
    // 旧バージョンセーブデータは街画面から開始
    this.showTownScreen();
}
```

#### **2. 防御的プログラミングの強化**

```javascript
// 修正後の安全な敵データ復元
if (this.enemy) {
    // 敵のwoundsプロパティを安全に初期化
    if (!this.enemy.wounds) {
        this.enemy.wounds = {
            slash: 0, blunt: 0, pierce: 0,
            fire: 0, lightning: 0, holy: 0, ice: 0
        };
        console.warn('Enemy wounds were missing, initialized to defaults');
    }
}
```

#### **3. 現実的テストケースの追加**

```javascript
test('🏘️ Town Save-Load Screen State Preservation', async ({ page }) => {
    // 実際の問題を模倣
    await page.locator('#town-btn').click();        // 街に移動
    await page.locator('#town-save-btn').click();   // 街でセーブ
    await page.locator('#load-btn').click();        // ロード
    
    // 街画面から開始されることを確認
    await expect(townScreen).not.toHaveClass(/hidden/);
});

test('🎯 Realistic Battle Scenario', async ({ page }) => {
    // 複合的な状態遷移テスト
    // 戦闘→街→武器変更→戦闘→セーブ→ロード→攻撃
    // より現実的なユーザー操作フローを模倣
});
```

---

### 📊 **改善効果の測定**

#### **修正前の状況**
- ✅ **GitHub Actions**: 全テスト成功
- ❌ **実際の動作**: 複数の重大な問題
- ❌ **ユーザー体験**: フラストレーション発生

#### **修正後の期待効果**
- ✅ **GitHub Actions**: より現実的な問題も検出
- ✅ **実際の動作**: 期待通りの動作
- ✅ **ユーザー体験**: スムーズなゲーム体験

---

### 🎓 **この事例から学べる重要な教訓**

#### **テスト設計での学び**
1. **機能単体テストの限界**: ボタンが押せる ≠ 期待通りに動作する
2. **現実的シナリオの重要性**: 実際のユーザー操作フローの模倣が必須
3. **状態の複雑性**: 複数の状態変更を経た後の動作確認が重要

#### **問題解決アプローチの学び**
1. **ユーザー報告の重視**: 技術者の想定と実際の使用に乖離がある
2. **エラーログの詳細確認**: 具体的なエラーメッセージからの問題特定
3. **修正と検証の同時実行**: テストケース改善と機能修正を並行実施

#### **品質保証での学び**
1. **CI/CDの過信は危険**: 自動テストの成功 ≠ 品質保証
2. **複合的問題の検出**: 単体では動くが組み合わせで失敗する問題
3. **継続的改善**: 問題発生時のテスト手法自体の見直し

---

### 🔄 **予防策と今後の対応**

#### **テスト手法の改善**
- [x] 現実的テストケース設計手法の文書化
- [x] 新機能追加時のテストケース判定基準作成
- [ ] テストカバレッジの可視化
- [ ] 定期的な実ブラウザテスト自動化

#### **開発プロセスの改善**
- [x] ユーザー報告に基づく問題分析強化
- [x] 防御的プログラミングの標準化
- [ ] コードレビュー時のテスト観点チェック
- [ ] 段階的な品質確認プロセス導入

---

## 💡 **類似事例を防ぐためのチェックリスト**

### **⚠️ 危険度: 極高**
- [ ] 画面状態 + データ保存 + 複数画面遷移
- [ ] CI/CDは成功するが実際の動作に問題がある
- [ ] ユーザー報告と技術的確認に乖離がある

### **⚠️ 危険度: 高**
- [ ] 既存のテストでは表面的な動作のみ確認
- [ ] セーブデータのバージョン間互換性問題
- [ ] 複合的な状態遷移での動作未確認

### **✅ 必須対応**
- [ ] 現実的なユーザー操作フローでのテスト作成
- [ ] エラー監視の包括的実装
- [ ] 段階的な動作確認（修正→テスト→実確認）

---

*この事例は Epic Battle RPG v0.38-v0.41 の実際の改善プロセスから学んだものです。*
*「CI/CDは通るが実際は動かない」問題への対策として、チーム内での共有と学習に活用してください。*

---

*この事例は Epic Battle RPG v0.32-v0.35 の実際の失敗から学んだものです。*
*同様の問題を未然に防ぐため、チーム内での共有と学習に活用してください。*