// Epic Battle RPG - 爽快戦闘システム
class BattleRPG {
    constructor() {
        this.gameState = {
            score: 0,
            level: 1,
            exp: 0,
            expToNext: 50, // レベルアップしやすくした
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
            maxCombo: 0,
            currentWeapon: 'sword' // 初期武器は剣
        };

        this.enemy = null;
        this.enemyTemplates = [
            { name: "スライム", sprite: "🟢", hp: 60, attack: 15, defense: 5, exp: 15, gold: 50 },
            { name: "ゴブリン", sprite: "👺", hp: 80, attack: 22, defense: 8, exp: 20, gold: 75 },
            { name: "オーク", sprite: "👹", hp: 120, attack: 28, defense: 12, exp: 30, gold: 100 },
            { name: "ドラゴン", sprite: "🐉", hp: 200, attack: 45, defense: 20, exp: 50, gold: 200 },
            { name: "デーモン", sprite: "😈", hp: 300, attack: 60, defense: 25, exp: 75, gold: 300 }
        ];

        // 武器システム
        this.weapons = {
            sword: { 
                name: "剣", 
                icon: "⚔️", 
                hitCount: 2,
                types: ["slash", "pierce"], // 斬撃+突き
                attackMultiplier: 1.0,
                description: "バランスの取れた武器"
            },
            club: { 
                name: "棍棒", 
                icon: "🏏", 
                hitCount: 3,
                types: ["blunt"], // 打撃
                attackMultiplier: 0.9,
                description: "連続攻撃が得意"
            },
            axe: { 
                name: "斧", 
                icon: "🪓", 
                hitCount: 1,
                types: ["blunt", "slash"], // 打撃+斬撃
                attackMultiplier: 1.4,
                description: "一撃が重い"
            }
        };

        // 攻撃タイプ情報
        this.attackTypes = {
            slash: { name: "斬撃", icon: "🗡️", color: "#e74c3c" },
            blunt: { name: "打撃", icon: "🔨", color: "#f39c12" },
            pierce: { name: "突き", icon: "🗡️", color: "#9b59b6" }
        };

        this.skills = {
            fire: { name: "ファイア", cost: 10, power: 1.8, effect: "🔥", description: "炎の魔法で敵を焼く", element: "fire" },
            heal: { name: "ヒール", cost: 15, power: 0.8, effect: "💚", description: "HPを回復する", element: "holy" },
            thunder: { name: "サンダー", cost: 20, power: 2.2, effect: "⚡", description: "雷撃で大ダメージ", element: "lightning" },
            critical: { name: "クリティカル", cost: 25, power: 3.0, effect: "💥", description: "必殺の一撃", element: "physical" }
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
        document.getElementById('town-btn').addEventListener('click', () => this.showTown());

        // セーブ・ロード機能
        document.getElementById('save-btn').addEventListener('click', () => this.saveGame());
        document.getElementById('load-btn').addEventListener('click', () => this.loadGame());

        // 街・ショップ・武器機能
        document.getElementById('shop-btn').addEventListener('click', () => this.showShop());
        document.getElementById('rest-btn').addEventListener('click', () => this.restAtInn());
        document.getElementById('battle-btn').addEventListener('click', () => this.startBattleFromTown());
        document.getElementById('weapon-btn').addEventListener('click', () => this.showWeaponSelect());
        document.getElementById('town-save-btn').addEventListener('click', () => this.saveGame());
        document.getElementById('shop-back').addEventListener('click', () => this.backToTown());
        document.getElementById('weapon-back').addEventListener('click', () => this.backToTown());

        // ショップアイテム購入
        document.querySelectorAll('.buy-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.buyItem(e.target.dataset.item, parseInt(e.target.dataset.price)));
        });

        // 武器装備
        document.querySelectorAll('.equip-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const weaponOption = e.target.closest('.weapon-option');
                this.equipWeapon(weaponOption.dataset.weapon);
            });
        });
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

        const weapon = this.weapons[this.player.currentWeapon];
        const weaponAttack = Math.floor(this.player.attack * weapon.attackMultiplier);
        const damage = this.calculateDamage(weaponAttack, this.enemy.defense);
        const isCritical = Math.random() < 0.15 + (this.player.combo * 0.05); // コンボでクリティカル率上昇
        const finalDamage = isCritical ? Math.floor(damage * 2) : damage;

        this.player.combo++;
        if (this.player.combo > this.player.maxCombo) {
            this.player.maxCombo = this.player.combo;
        }

        this.animateCharacter('player', 'attacking');
        
        // 連続ヒット表示
        this.showMultiHitDamage(finalDamage, 'enemy', isCritical);
        this.showEffect('⚔️', 'enemy');

        this.enemy.hp = Math.max(0, this.enemy.hp - finalDamage);

        const weapon = this.weapons[this.player.currentWeapon];
        const attackTypeText = weapon.types.map(type => this.attackTypes[type].name).join('・');
        
        if (isCritical) {
            this.logMessage(`💥 クリティカルヒット！ ${weapon.icon}${weapon.name}(${attackTypeText})で${finalDamage}ダメージ！(コンボ: ${this.player.combo})`);
        } else {
            this.logMessage(`${weapon.icon} ${weapon.name}(${attackTypeText})で${finalDamage}ダメージ！(コンボ: ${this.player.combo})`);
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
            this.gameState.expToNext = Math.floor(this.gameState.expToNext * 1.1); // 成長率も緩やかに
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
        this.gameState = { score: 0, level: 1, exp: 0, expToNext: 50, battleCount: 0 };
        this.player = {
            name: "勇者", maxHp: 100, hp: 100, maxMp: 50, mp: 50,
            attack: 20, defense: 10, level: 1, isGuarding: false, combo: 0, maxCombo: 0, currentWeapon: 'sword'
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
        
        // 自動スクロール（重要！）
        setTimeout(() => {
            logContent.scrollTop = logContent.scrollHeight;
        }, 10);

        // ログの行数制限
        if (logContent.children.length > 15) { // 増やしてメッセージを多く表示
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

    // 連続ヒット表示システム（武器別）
    showMultiHitDamage(totalDamage, target, isCritical = false) {
        const currentWeapon = this.weapons[this.player.currentWeapon];
        const hitCount = currentWeapon.hitCount;
        const damages = this.splitDamage(totalDamage, hitCount);
        
        const targetElement = document.getElementById(`${target}-character`);
        const rect = targetElement.getBoundingClientRect();
        
        damages.forEach((damage, index) => {
            setTimeout(() => {
                this.createMultiHitNumber(damage, rect, index, hitCount, isCritical, currentWeapon);
            }, index * 120); // 武器に応じて間隔調整
        });
        
        // 合計ダメージ表示
        setTimeout(() => {
            this.createTotalDamageNumber(totalDamage, rect, isCritical, currentWeapon);
        }, hitCount * 120 + 300);
    }

    // ダメージを複数ヒットに分割
    splitDamage(totalDamage, hitCount) {
        const baseDamage = Math.floor(totalDamage / hitCount);
        const remainder = totalDamage % hitCount;
        const damages = [];
        
        for (let i = 0; i < hitCount; i++) {
            let damage = baseDamage;
            if (i < remainder) damage++; // 余りを前のヒットに配分
            
            // 少し変動を加える
            const variation = Math.floor(Math.random() * 3) - 1; // -1, 0, +1
            damage = Math.max(1, damage + variation);
            damages.push(damage);
        }
        
        return damages;
    }

    // 個別ヒット数値表示（武器情報付き）
    createMultiHitNumber(damage, targetRect, index, totalHits, isCritical, weapon) {
        const damageArea = document.getElementById('damage-area');
        const hitDiv = document.createElement('div');
        
        // 攻撃タイプに応じた色設定
        const attackType = weapon.types[index % weapon.types.length];
        const typeInfo = this.attackTypes[attackType];
        
        hitDiv.className = `multi-hit-number ${isCritical ? 'critical' : ''} ${attackType}`;
        hitDiv.textContent = `-${damage}`;
        hitDiv.style.color = typeInfo.color;
        
        // 位置をずらして表示
        const offsetX = (index - totalHits / 2) * 40 + (Math.random() - 0.5) * 20;
        const offsetY = Math.random() * 30 - 15;
        
        hitDiv.style.left = `${targetRect.left + targetRect.width / 2 + offsetX}px`;
        hitDiv.style.top = `${targetRect.top + offsetY}px`;
        hitDiv.style.fontSize = weapon.hitCount === 1 ? '2rem' : '1.5rem'; // 斧は大きく表示
        hitDiv.style.animation = 'multiHitFloat 1.2s ease-out forwards';
        
        damageArea.appendChild(hitDiv);
        
        setTimeout(() => {
            if (damageArea.contains(hitDiv)) {
                damageArea.removeChild(hitDiv);
            }
        }, 1200);
    }

    // 合計ダメージ表示（武器情報付き）
    createTotalDamageNumber(totalDamage, targetRect, isCritical, weapon) {
        const damageArea = document.getElementById('damage-area');
        const totalDiv = document.createElement('div');
        
        // 武器アイコン付き
        totalDiv.className = `total-damage-number ${isCritical ? 'critical' : ''}`;
        totalDiv.textContent = `${weapon.icon} ${totalDamage}`;
        
        totalDiv.style.left = `${targetRect.left + targetRect.width / 2}px`;
        totalDiv.style.top = `${targetRect.top - 20}px`;
        totalDiv.style.fontSize = '2rem';
        totalDiv.style.fontWeight = 'bold';
        totalDiv.style.animation = 'totalDamageShow 2s ease-out forwards';
        
        damageArea.appendChild(totalDiv);
        
        setTimeout(() => {
            if (damageArea.contains(totalDiv)) {
                damageArea.removeChild(totalDiv);
            }
        }, 2000);
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

    // セーブ機能
    saveGame() {
        try {
            const saveData = {
                gameState: this.gameState,
                player: this.player,
                items: this.items,
                enemy: this.enemy,
                saveTime: new Date().toISOString(),
                version: "0.32"
            };

            localStorage.setItem('epicBattleRPG_save', JSON.stringify(saveData));
            
            this.logMessage('💾 ゲームをセーブしました！');
            this.showTemporaryMessage('セーブ完了！', 'success');
        } catch (error) {
            this.logMessage('❌ セーブに失敗しました。');
            this.showTemporaryMessage('セーブ失敗...', 'error');
        }
    }

    // ロード機能
    loadGame() {
        try {
            const savedData = localStorage.getItem('epicBattleRPG_save');
            if (!savedData) {
                this.logMessage('❌ セーブデータが見つかりません。');
                this.showTemporaryMessage('セーブデータなし', 'error');
                return;
            }

            const saveData = JSON.parse(savedData);
            
            // データ復元
            this.gameState = saveData.gameState;
            this.player = saveData.player;
            this.items = saveData.items;
            this.enemy = saveData.enemy;

            // 敵が存在する場合の処理
            if (this.enemy) {
                document.getElementById('enemy-name').textContent = this.enemy.name;
                document.querySelector('#enemy-character .character-sprite').textContent = this.enemy.sprite;
                this.isBattleActive = true;
            } else {
                this.spawnNewEnemy();
            }

            this.updateUI();
            this.clearLog();
            
            const saveTime = new Date(saveData.saveTime).toLocaleString();
            this.logMessage(`📂 ゲームをロードしました！(${saveTime})`);
            this.showTemporaryMessage('ロード完了！', 'success');
            
        } catch (error) {
            this.logMessage('❌ ロードに失敗しました。');
            this.showTemporaryMessage('ロード失敗...', 'error');
        }
    }

    // 一時的なメッセージ表示
    showTemporaryMessage(message, type = 'info') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `temp-message ${type}`;
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 2rem;
            border-radius: 10px;
            color: white;
            font-weight: bold;
            z-index: 10000;
            animation: fadeInOut 3s ease-in-out forwards;
            ${type === 'success' ? 'background: linear-gradient(135deg, #27ae60, #229954);' : 
              type === 'error' ? 'background: linear-gradient(135deg, #e74c3c, #c0392b);' : 
              'background: linear-gradient(135deg, #3498db, #2980b9);'}
        `;

        document.body.appendChild(messageDiv);

        setTimeout(() => {
            document.body.removeChild(messageDiv);
        }, 3000);

        // CSS アニメーションを動的に追加
        if (!document.getElementById('temp-message-styles')) {
            const style = document.createElement('style');
            style.id = 'temp-message-styles';
            style.textContent = `
                @keyframes fadeInOut {
                    0% { opacity: 0; transform: translateX(100px); }
                    20%, 80% { opacity: 1; transform: translateX(0); }
                    100% { opacity: 0; transform: translateX(100px); }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // 街機能
    showTown() {
        this.hideResultScreen();
        this.updateTownUI();
        document.getElementById('town-screen').classList.remove('hidden');
        this.logMessage('🏘️ 冒険者の街に到着しました。');
    }

    hideTown() {
        document.getElementById('town-screen').classList.add('hidden');
    }

    updateTownUI() {
        document.getElementById('town-gold').textContent = this.gameState.score;
        document.getElementById('town-level').textContent = this.gameState.level;
        document.getElementById('town-exp').textContent = this.gameState.exp;
        document.getElementById('town-exp-next').textContent = this.gameState.expToNext;
        
        // 現在の武器表示を更新
        const currentWeapon = this.weapons[this.player.currentWeapon];
        const townStatsEl = document.getElementById('town-stats');
        const weaponInfoEl = townStatsEl.querySelector('.weapon-info');
        
        if (weaponInfoEl) {
            weaponInfoEl.remove();
        }
        
        const weaponInfo = document.createElement('p');
        weaponInfo.className = 'weapon-info';
        weaponInfo.innerHTML = `🗡️ 現在の武器: ${currentWeapon.icon} ${currentWeapon.name}`;
        townStatsEl.appendChild(weaponInfo);
    }

    // ショップ機能
    showShop() {
        this.hideTown();
        this.updateShopUI();
        document.getElementById('shop-screen').classList.remove('hidden');
        this.logMessage('🏪 アイテムショップへようこそ！');
    }

    hideShop() {
        document.getElementById('shop-screen').classList.add('hidden');
    }

    updateShopUI() {
        // 現在の所持金
        document.getElementById('shop-current-gold').textContent = this.gameState.score;
        
        // インベントリ表示
        document.getElementById('inv-potion').textContent = this.items.potion.count;
        document.getElementById('inv-mana').textContent = this.items.mana.count;
        document.getElementById('inv-bomb').textContent = this.items.bomb.count;

        // 購入ボタンの状態更新
        document.querySelectorAll('.buy-btn').forEach(btn => {
            const price = parseInt(btn.dataset.price);
            btn.disabled = this.gameState.score < price;
        });
    }

    buyItem(itemName, price) {
        if (this.gameState.score < price) {
            this.showTemporaryMessage('お金が足りません！', 'error');
            return;
        }

        this.gameState.score -= price;
        this.items[itemName].count++;

        const itemNames = {
            potion: 'ポーション',
            mana: 'マナポーション',
            bomb: '爆弾'
        };

        this.logMessage(`🛒 ${itemNames[itemName]}を購入しました！(-${price}G)`);
        this.showTemporaryMessage(`${itemNames[itemName]}購入！`, 'success');
        this.updateShopUI();
        this.updateUI();
    }

    // 宿屋での休息
    restAtInn() {
        const cost = 20;
        
        // 現在のステータス表示
        const hpStatus = `HP: ${this.player.hp}/${this.player.maxHp}`;
        const mpStatus = `MP: ${this.player.mp}/${this.player.maxMp}`;
        const currentStatus = `${hpStatus}, ${mpStatus}`;
        
        if (this.gameState.score < cost) {
            this.showTemporaryMessage('宿代が足りません！', 'error');
            this.logMessage(`❌ 宿代${cost}Gが必要です。(現在: ${currentStatus})`);
            return;
        }

        if (this.player.hp === this.player.maxHp && this.player.mp === this.player.maxMp) {
            this.showTemporaryMessage('すでに完全回復しています', 'info');
            this.logMessage(`ℹ️ すでに完全回復状態です。(${currentStatus})`);
            return;
        }

        // 回復前の状態をログに記録
        this.logMessage(`🛏️ 宿屋利用前: ${currentStatus}`);
        
        this.gameState.score -= cost;
        this.player.hp = this.player.maxHp;
        this.player.mp = this.player.maxMp;
        
        this.logMessage(`🛏️ 宿屋で休息しました。HP・MP完全回復！(-${cost}G)`);
        this.showTemporaryMessage('完全回復！', 'success');
        this.updateTownUI();
        this.updateUI();
    }

    // 街から戦闘開始
    startBattleFromTown() {
        this.hideTown();
        this.spawnNewEnemy();
        this.updateUI();
        this.logMessage('⚔️ 冒険に出発！新たな敵との遭遇...');
    }

    // ショップから街に戻る（重要：画面を正しく切り替え）
    backToTown() {
        this.hideShop();
        this.hideWeaponSelect();
        this.showTown();
    }

    // 武器選択画面表示
    showWeaponSelect() {
        this.hideTown();
        this.updateWeaponUI();
        document.getElementById('weapon-screen').classList.remove('hidden');
        this.logMessage('🗡️ 武器変更画面を開きました');
    }

    hideWeaponSelect() {
        document.getElementById('weapon-screen').classList.add('hidden');
    }

    // 現在の武器UI更新
    updateWeaponUI() {
        const currentWeapon = this.weapons[this.player.currentWeapon];
        const currentWeaponDisplay = document.getElementById('current-weapon-display');
        
        const attackTypeText = currentWeapon.types.map(type => this.attackTypes[type].name).join('・');
        
        currentWeaponDisplay.innerHTML = `
            <span style="font-size: 2rem;">${currentWeapon.icon}</span>
            <div>
                <strong>${currentWeapon.name}</strong><br>
                <span style="color: #f39c12;">${attackTypeText} | ${currentWeapon.hitCount}ヒット</span><br>
                <span style="opacity: 0.8;">${currentWeapon.description}</span>
            </div>
        `;

        // 武器オプションの現在装備状態更新
        document.querySelectorAll('.weapon-option').forEach(option => {
            const weaponKey = option.dataset.weapon;
            const equipBtn = option.querySelector('.equip-btn');
            
            if (weaponKey === this.player.currentWeapon) {
                option.classList.add('current');
                equipBtn.textContent = '装備中';
                equipBtn.disabled = true;
            } else {
                option.classList.remove('current');
                equipBtn.textContent = '装備';
                equipBtn.disabled = false;
            }
        });
    }

    // 武器装備
    equipWeapon(weaponKey) {
        if (weaponKey === this.player.currentWeapon) {
            this.showTemporaryMessage('すでに装備しています', 'info');
            return;
        }

        const oldWeapon = this.weapons[this.player.currentWeapon];
        const newWeapon = this.weapons[weaponKey];
        
        this.player.currentWeapon = weaponKey;
        
        this.logMessage(`🗡️ 武器を変更: ${oldWeapon.icon}${oldWeapon.name} → ${newWeapon.icon}${newWeapon.name}`);
        this.showTemporaryMessage(`${newWeapon.icon}${newWeapon.name}を装備！`, 'success');
        
        this.updateWeaponUI();
        this.updateUI(); // プレイヤースプライト更新
    }
}

// ゲーム開始
document.addEventListener('DOMContentLoaded', () => {
    new BattleRPG();
});