// Epic Battle RPG - 爽快戦闘システム
class BattleRPG {
    constructor() {
        this.gameState = {
            score: 0,
            level: 1,
            exp: 0,
            expToNext: 100,
            battleCount: 0
        };

        this.player = {
            name: "勇者",
            maxHp: 100,
            hp: 100,
            maxMp: 50,
            mp: 50,
            attack: 20,
            defense: 10,
            level: 1,
            isGuarding: false,
            combo: 0,
            maxCombo: 0
        };

        this.enemy = null;
        this.enemyTemplates = [
            { name: "スライム", sprite: "🟢", hp: 60, attack: 15, defense: 5, exp: 25, gold: 50 },
            { name: "ゴブリン", sprite: "👺", hp: 80, attack: 22, defense: 8, exp: 35, gold: 75 },
            { name: "オーク", sprite: "👹", hp: 120, attack: 28, defense: 12, exp: 50, gold: 100 },
            { name: "ドラゴン", sprite: "🐉", hp: 200, attack: 45, defense: 20, exp: 100, gold: 200 },
            { name: "デーモン", sprite: "😈", hp: 300, attack: 60, defense: 25, exp: 150, gold: 300 }
        ];

        this.skills = {
            fire: { name: "ファイア", cost: 10, power: 1.8, effect: "🔥", description: "炎の魔法で敵を焼く" },
            heal: { name: "ヒール", cost: 15, power: 0.8, effect: "💚", description: "HPを回復する" },
            thunder: { name: "サンダー", cost: 20, power: 2.2, effect: "⚡", description: "雷撃で大ダメージ" },
            critical: { name: "クリティカル", cost: 25, power: 3.0, effect: "💥", description: "必殺の一撃" }
        };

        this.items = {
            potion: { name: "ポーション", effect: "heal", power: 30, count: 3 },
            mana: { name: "マナポーション", effect: "mana", power: 20, count: 2 },
            bomb: { name: "爆弾", effect: "damage", power: 50, count: 1 }
        };

        this.currentPanel = null;
        this.isPlayerTurn = true;
        this.isBattleActive = false;
        this.comboTimer = null;

        this.init();
    }

    init() {
        this.bindEvents();
        this.spawnNewEnemy();
        this.updateUI();
        this.logMessage("🎮 Epic Battle RPG へようこそ！爽快な戦闘を楽しもう！");
    }

    bindEvents() {
        // アクションボタン
        document.getElementById('attack-btn').addEventListener('click', () => this.playerAttack());
        document.getElementById('skill-btn').addEventListener('click', () => this.showSkillPanel());
        document.getElementById('guard-btn').addEventListener('click', () => this.playerGuard());
        document.getElementById('item-btn').addEventListener('click', () => this.showItemPanel());

        // スキルパネル
        document.querySelectorAll('.skill-option').forEach(btn => {
            btn.addEventListener('click', (e) => this.useSkill(e.target.dataset.skill));
        });
        document.getElementById('skill-back').addEventListener('click', () => this.hideActionPanel());

        // アイテムパネル
        document.querySelectorAll('.item-option').forEach(btn => {
            btn.addEventListener('click', (e) => this.useItem(e.target.dataset.item));
        });
        document.getElementById('item-back').addEventListener('click', () => this.hideActionPanel());

        // 結果画面
        document.getElementById('next-battle-btn').addEventListener('click', () => this.nextBattle());
        document.getElementById('restart-btn').addEventListener('click', () => this.restart());
    }

    spawnNewEnemy() {
        const template = this.enemyTemplates[Math.min(Math.floor(this.gameState.level / 2), this.enemyTemplates.length - 1)];
        const levelMultiplier = 1 + (this.gameState.level - 1) * 0.2;
        
        this.enemy = {
            name: template.name,
            sprite: template.sprite,
            maxHp: Math.floor(template.hp * levelMultiplier),
            hp: Math.floor(template.hp * levelMultiplier),
            attack: Math.floor(template.attack * levelMultiplier),
            defense: Math.floor(template.defense * levelMultiplier),
            exp: Math.floor(template.exp * levelMultiplier),
            gold: Math.floor(template.gold * levelMultiplier)
        };

        document.getElementById('enemy-name').textContent = this.enemy.name;
        document.querySelector('#enemy-character .character-sprite').textContent = this.enemy.sprite;
        this.isBattleActive = true;
        this.isPlayerTurn = true;
        this.player.isGuarding = false;
        this.player.combo = 0;
    }

    playerAttack() {
        if (!this.canPlayerAct()) return;

        const damage = this.calculateDamage(this.player.attack, this.enemy.defense);
        const isCritical = Math.random() < 0.15 + (this.player.combo * 0.05); // コンボでクリティカル率上昇
        const finalDamage = isCritical ? Math.floor(damage * 2) : damage;

        this.player.combo++;
        if (this.player.combo > this.player.maxCombo) {
            this.player.maxCombo = this.player.combo;
        }

        this.animateCharacter('player', 'attacking');
        this.showDamageNumber(finalDamage, 'enemy', isCritical);
        this.showEffect('⚔️', 'enemy');

        this.enemy.hp = Math.max(0, this.enemy.hp - finalDamage);

        if (isCritical) {
            this.logMessage(`💥 クリティカルヒット！ ${this.player.name}の攻撃で${finalDamage}ダメージ！(コンボ: ${this.player.combo})`);
        } else {
            this.logMessage(`⚔️ ${this.player.name}の攻撃で${finalDamage}ダメージ！(コンボ: ${this.player.combo})`);
        }

        this.updateUI();

        if (this.enemy.hp <= 0) {
            this.victory();
        } else {
            this.nextTurn();
        }
    }

    useSkill(skillName) {
        if (!this.canPlayerAct()) return;
        
        const skill = this.skills[skillName];
        if (this.player.mp < skill.cost) {
            this.logMessage(`❌ MPが足りません！${skill.name}には${skill.cost}MP必要です。`);
            return;
        }

        this.player.mp -= skill.cost;
        this.hideActionPanel();

        if (skillName === 'heal') {
            const healAmount = Math.floor(this.player.maxHp * skill.power * 0.5);
            this.player.hp = Math.min(this.player.maxHp, this.player.hp + healAmount);
            this.showDamageNumber(healAmount, 'player', false, true);
            this.showEffect(skill.effect, 'player');
            this.logMessage(`💚 ${skill.name}でHP ${healAmount}回復！`);
        } else {
            const baseDamage = Math.floor(this.player.attack * skill.power);
            const damage = this.calculateDamage(baseDamage, this.enemy.defense);
            const isCritical = Math.random() < 0.3; // スキルは高いクリティカル率
            const finalDamage = isCritical ? Math.floor(damage * 1.5) : damage;

            this.player.combo += 2; // スキルはコンボが多く増加
            if (this.player.combo > this.player.maxCombo) {
                this.player.maxCombo = this.player.combo;
            }

            this.animateCharacter('player', 'attacking');
            this.showDamageNumber(finalDamage, 'enemy', isCritical);
            this.showEffect(skill.effect, 'enemy');
            
            this.enemy.hp = Math.max(0, this.enemy.hp - finalDamage);

            const critText = isCritical ? " クリティカル！" : "";
            this.logMessage(`✨ ${skill.name}で${finalDamage}ダメージ！${critText}(コンボ: ${this.player.combo})`);
        }

        this.updateUI();

        if (this.enemy.hp <= 0) {
            this.victory();
        } else {
            this.nextTurn();
        }
    }

    useItem(itemName) {
        if (!this.canPlayerAct()) return;

        const item = this.items[itemName];
        if (item.count <= 0) {
            this.logMessage(`❌ ${item.name}がありません！`);
            return;
        }

        item.count--;
        this.hideActionPanel();

        if (item.effect === 'heal') {
            this.player.hp = Math.min(this.player.maxHp, this.player.hp + item.power);
            this.showDamageNumber(item.power, 'player', false, true);
            this.showEffect('💚', 'player');
            this.logMessage(`🧪 ${item.name}でHP ${item.power}回復！`);
        } else if (item.effect === 'mana') {
            this.player.mp = Math.min(this.player.maxMp, this.player.mp + item.power);
            this.showDamageNumber(item.power, 'player', false, true);
            this.showEffect('💙', 'player');
            this.logMessage(`💙 ${item.name}でMP ${item.power}回復！`);
        } else if (item.effect === 'damage') {
            const damage = this.calculateDamage(item.power, this.enemy.defense);
            this.enemy.hp = Math.max(0, this.enemy.hp - damage);
            this.showDamageNumber(damage, 'enemy', false);
            this.showEffect('💣', 'enemy');
            this.logMessage(`💣 ${item.name}で${damage}ダメージ！`);
        }

        this.updateUI();

        if (this.enemy.hp <= 0) {
            this.victory();
        } else {
            this.nextTurn();
        }
    }

    playerGuard() {
        if (!this.canPlayerAct()) return;

        this.player.isGuarding = true;
        this.animateCharacter('player', 'guarding');
        this.logMessage(`🛡️ ${this.player.name}は防御の構えを取った！`);
        
        // MP少し回復
        this.player.mp = Math.min(this.player.maxMp, this.player.mp + 5);
        this.updateUI();
        this.nextTurn();
    }

    enemyTurn() {
        if (!this.isBattleActive) return;

        setTimeout(() => {
            const action = Math.random() < 0.8 ? 'attack' : 'special';
            
            if (action === 'attack') {
                let damage = this.calculateDamage(this.enemy.attack, this.player.defense);
                
                if (this.player.isGuarding) {
                    damage = Math.floor(damage * 0.5);
                    this.logMessage(`🛡️ 防御により${damage}ダメージに軽減！`);
                } else {
                    // コンボリセット
                    if (this.player.combo > 0) {
                        this.logMessage(`💔 コンボが途切れた！(最大コンボ: ${this.player.combo})`);
                        this.player.combo = 0;
                    }
                }

                this.animateCharacter('enemy', 'attacking');
                this.showDamageNumber(damage, 'player', false);
                this.showEffect('💢', 'player');

                this.player.hp = Math.max(0, this.player.hp - damage);
                this.logMessage(`👹 ${this.enemy.name}の攻撃で${damage}ダメージ！`);
            } else {
                // 敵の特殊攻撃
                const specialDamage = Math.floor(this.enemy.attack * 1.5);
                const damage = this.calculateDamage(specialDamage, this.player.defense);
                
                this.animateCharacter('enemy', 'attacking');
                this.showDamageNumber(damage, 'player', false);
                this.showEffect('🔥', 'player');

                this.player.hp = Math.max(0, this.player.hp - damage);
                this.logMessage(`🔥 ${this.enemy.name}の特殊攻撃で${damage}ダメージ！`);
                
                // コンボリセット
                if (this.player.combo > 0) {
                    this.logMessage(`💔 コンボが途切れた！(最大コンボ: ${this.player.combo})`);
                    this.player.combo = 0;
                }
            }

            this.player.isGuarding = false;
            this.updateUI();

            if (this.player.hp <= 0) {
                this.gameOver();
            } else {
                this.isPlayerTurn = true;
                this.enablePlayerActions();
            }
        }, 1500);
    }

    calculateDamage(attack, defense) {
        const baseDamage = attack - defense;
        const variance = Math.random() * 0.4 + 0.8; // 80-120%の変動
        return Math.max(1, Math.floor(baseDamage * variance));
    }

    victory() {
        this.isBattleActive = false;
        this.gameState.score += this.enemy.gold;
        this.gameState.exp += this.enemy.exp;
        this.gameState.battleCount++;

        // レベルアップチェック
        let leveledUp = false;
        while (this.gameState.exp >= this.gameState.expToNext) {
            this.gameState.exp -= this.gameState.expToNext;
            this.gameState.level++;
            this.gameState.expToNext = Math.floor(this.gameState.expToNext * 1.2);
            this.levelUp();
            leveledUp = true;
        }

        const comboBonus = this.player.maxCombo > 5 ? Math.floor(this.enemy.gold * 0.2) : 0;
        if (comboBonus > 0) {
            this.gameState.score += comboBonus;
        }

        this.showResultScreen(true, leveledUp, comboBonus);
        this.logMessage(`🎉 ${this.enemy.name}を倒した！経験値${this.enemy.exp}、ゴールド${this.enemy.gold}を獲得！`);
        
        if (comboBonus > 0) {
            this.logMessage(`🔥 コンボボーナス！追加で${comboBonus}ゴールドを獲得！`);
        }
    }

    levelUp() {
        this.player.level++;
        const hpIncrease = Math.floor(20 + Math.random() * 10);
        const mpIncrease = Math.floor(10 + Math.random() * 5);
        const attackIncrease = Math.floor(3 + Math.random() * 3);
        const defenseIncrease = Math.floor(2 + Math.random() * 2);

        this.player.maxHp += hpIncrease;
        this.player.hp = this.player.maxHp; // 完全回復
        this.player.maxMp += mpIncrease;
        this.player.mp = this.player.maxMp; // 完全回復
        this.player.attack += attackIncrease;
        this.player.defense += defenseIncrease;

        this.showEffect('⭐', 'player');
        this.logMessage(`🌟 レベルアップ！HP+${hpIncrease}, MP+${mpIncrease}, 攻撃力+${attackIncrease}, 防御力+${defenseIncrease}`);
    }

    gameOver() {
        this.isBattleActive = false;
        this.showResultScreen(false, false, 0);
        this.logMessage(`💀 ${this.player.name}は倒れた...`);
    }

    nextBattle() {
        this.hideResultScreen();
        this.spawnNewEnemy();
        this.updateUI();
        
        // アイテム少し回復
        Object.values(this.items).forEach(item => {
            if (Math.random() < 0.3) {
                item.count = Math.min(item.count + 1, 5);
            }
        });
        
        this.logMessage(`⚔️ 次の戦闘開始！${this.enemy.name}が現れた！`);
    }

    restart() {
        this.gameState = { score: 0, level: 1, exp: 0, expToNext: 100, battleCount: 0 };
        this.player = {
            name: "勇者", maxHp: 100, hp: 100, maxMp: 50, mp: 50,
            attack: 20, defense: 10, level: 1, isGuarding: false, combo: 0, maxCombo: 0
        };
        
        // アイテムリセット
        this.items.potion.count = 3;
        this.items.mana.count = 2;
        this.items.bomb.count = 1;

        this.hideResultScreen();
        this.spawnNewEnemy();
        this.updateUI();
        this.clearLog();
        this.logMessage("🎮 ゲームリスタート！新たな冒険の始まりだ！");
    }

    // UI関連メソッド
    canPlayerAct() {
        return this.isBattleActive && this.isPlayerTurn;
    }

    enablePlayerActions() {
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.disabled = false;
        });
    }

    disablePlayerActions() {
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.disabled = true;
        });
    }

    nextTurn() {
        this.isPlayerTurn = false;
        this.disablePlayerActions();
        setTimeout(() => {
            this.enemyTurn();
        }, 800);
    }

    updateUI() {
        // ゲーム状態
        document.getElementById('score').textContent = `Score: ${this.gameState.score}`;
        document.getElementById('level').textContent = `Level: ${this.gameState.level}`;
        document.getElementById('exp').textContent = `EXP: ${this.gameState.exp}/${this.gameState.expToNext}`;

        // プレイヤーHP/MP
        const playerHpPercent = (this.player.hp / this.player.maxHp) * 100;
        const playerMpPercent = (this.player.mp / this.player.maxMp) * 100;
        
        document.getElementById('player-hp-bar').style.width = `${playerHpPercent}%`;
        document.getElementById('player-hp-text').textContent = `${this.player.hp}/${this.player.maxHp}`;
        document.getElementById('player-mp-bar').style.width = `${playerMpPercent}%`;
        document.getElementById('player-mp-text').textContent = `${this.player.mp}/${this.player.maxMp}`;

        // 敵HP
        if (this.enemy) {
            const enemyHpPercent = (this.enemy.hp / this.enemy.maxHp) * 100;
            document.getElementById('enemy-hp-bar').style.width = `${enemyHpPercent}%`;
            document.getElementById('enemy-hp-text').textContent = `${this.enemy.hp}/${this.enemy.maxHp}`;
        }

        // HPバーの色を変更
        const playerHpBar = document.getElementById('player-hp-bar');
        if (playerHpPercent < 25) {
            playerHpBar.style.background = 'linear-gradient(90deg, #e74c3c 0%, #c0392b 100%)';
        } else if (playerHpPercent < 50) {
            playerHpBar.style.background = 'linear-gradient(90deg, #f39c12 0%, #e67e22 100%)';
        } else {
            playerHpBar.style.background = 'linear-gradient(90deg, #27ae60 0%, #229954 100%)';
        }

        // アイテム数更新
        document.querySelector('[data-item="potion"]').textContent = `🧪 ポーション (${this.items.potion.count})`;
        document.querySelector('[data-item="mana"]').textContent = `💙 マナポーション (${this.items.mana.count})`;
        document.querySelector('[data-item="bomb"]').textContent = `💣 爆弾 (${this.items.bomb.count})`;
    }

    showSkillPanel() {
        this.hideActionPanel();
        document.getElementById('skill-panel').classList.remove('hidden');
        this.currentPanel = 'skill';
    }

    showItemPanel() {
        this.hideActionPanel();
        document.getElementById('item-panel').classList.remove('hidden');
        this.currentPanel = 'item';
    }

    hideActionPanel() {
        document.getElementById('skill-panel').classList.add('hidden');
        document.getElementById('item-panel').classList.add('hidden');
        this.currentPanel = null;
    }

    showResultScreen(victory, leveledUp, comboBonus) {
        const screen = document.getElementById('result-screen');
        const title = document.getElementById('result-title');
        const message = document.getElementById('result-message');
        const expSpan = document.getElementById('gained-exp');
        const goldSpan = document.getElementById('gained-gold');

        if (victory) {
            title.textContent = '🎉 勝利！';
            message.textContent = `${this.enemy.name}を見事に倒した！`;
            if (leveledUp) {
                message.textContent += ` レベルアップ！`;
            }
            if (comboBonus > 0) {
                message.textContent += ` 最大コンボ: ${this.player.maxCombo}`;
            }
        } else {
            title.textContent = '💀 敗北...';
            message.textContent = '次はもっと強くなって挑もう！';
        }

        expSpan.textContent = victory ? this.enemy.exp : 0;
        goldSpan.textContent = victory ? (this.enemy.gold + comboBonus) : 0;
        
        screen.classList.remove('hidden');
    }

    hideResultScreen() {
        document.getElementById('result-screen').classList.add('hidden');
    }

    logMessage(message) {
        const logContent = document.getElementById('log-content');
        const p = document.createElement('p');
        p.textContent = message;
        logContent.appendChild(p);
        logContent.scrollTop = logContent.scrollHeight;

        // ログの行数制限
        if (logContent.children.length > 10) {
            logContent.removeChild(logContent.firstChild);
        }
    }

    clearLog() {
        document.getElementById('log-content').innerHTML = '';
    }

    animateCharacter(target, animation) {
        const character = document.getElementById(`${target}-character`);
        character.classList.add(animation);
        setTimeout(() => {
            character.classList.remove(animation);
        }, 600);
    }

    showDamageNumber(damage, target, isCritical = false, isHeal = false) {
        const damageArea = document.getElementById('damage-area');
        const damageDiv = document.createElement('div');
        
        damageDiv.className = `damage-number ${isCritical ? 'critical' : ''} ${isHeal ? 'heal' : ''}`;
        damageDiv.textContent = isHeal ? `+${damage}` : `-${damage}`;
        
        const targetElement = document.getElementById(`${target}-character`);
        const rect = targetElement.getBoundingClientRect();
        
        damageDiv.style.left = `${rect.left + rect.width / 2}px`;
        damageDiv.style.top = `${rect.top}px`;
        
        damageArea.appendChild(damageDiv);
        
        setTimeout(() => {
            damageArea.removeChild(damageDiv);
        }, 1800);
    }

    showEffect(effectChar, target) {
        const effectArea = document.getElementById('effect-area');
        const effectDiv = document.createElement('div');
        
        effectDiv.className = 'effect';
        effectDiv.textContent = effectChar;
        
        const targetElement = document.getElementById(`${target}-character`);
        const rect = targetElement.getBoundingClientRect();
        
        effectDiv.style.left = `${rect.left + rect.width / 2}px`;
        effectDiv.style.top = `${rect.top + rect.height / 2}px`;
        
        effectArea.appendChild(effectDiv);
        
        setTimeout(() => {
            effectArea.removeChild(effectDiv);
        }, 1000);
    }
}

// ゲーム開始
document.addEventListener('DOMContentLoaded', () => {
    new BattleRPG();
});