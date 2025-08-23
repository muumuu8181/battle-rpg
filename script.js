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
            // 物理・魔法独立ステータス
            physicalAttack: 15,
            magicalAttack: 10,
            physicalLevel: 1,
            magicalLevel: 1,
            physicalExp: 0,
            magicalExp: 0,
            physicalExpToNext: 30,
            magicalExpToNext: 25,
            defense: 10,
            level: 1,
            isGuarding: false,
            combo: 0,
            maxCombo: 0,
            currentWeapon: 'sword' // 初期武器は剣
        };

        this.enemy = null;
        this.enemyTemplates = [
            { 
                name: "スライム", sprite: "🟢", hp: 60, attack: 15, defense: 5, exp: 15, gold: 50,
                weaknesses: {
                    attackTypes: ["slash"], // 斬撃に弱い
                    elements: [] // 属性弱点なし
                }
            },
            { 
                name: "ゴブリン", sprite: "👺", hp: 80, attack: 22, defense: 8, exp: 20, gold: 75,
                weaknesses: {
                    attackTypes: ["blunt"], // 打撃に弱い
                    elements: ["fire"] // 炎に弱い
                }
            },
            { 
                name: "オーク", sprite: "👹", hp: 120, attack: 28, defense: 12, exp: 30, gold: 100,
                weaknesses: {
                    attackTypes: ["pierce"], // 突きに弱い
                    elements: ["lightning"] // 雷に弱い
                }
            },
            { 
                name: "ドラゴン", sprite: "🐉", hp: 200, attack: 45, defense: 20, exp: 50, gold: 200,
                weaknesses: {
                    attackTypes: ["blunt", "pierce"], // 打撃・突きに弱い
                    elements: [] // 属性耐性あり
                }
            },
            { 
                name: "デーモン", sprite: "😈", hp: 300, attack: 60, defense: 25, exp: 75, gold: 300,
                weaknesses: {
                    attackTypes: ["slash"], // 斬撃に弱い
                    elements: ["holy"] // 聖に弱い
                }
            }
        ];

        // 武器システム
        this.weapons = {
            sword: { 
                name: "剣", 
                icon: "⚔️", 
                hitCount: 2,
                types: ["slash", "pierce"], // 斬撃+突き
                attackMultiplier: 1.0,
                description: "バランスの取れた武器",
                owned: true
            },
            club: { 
                name: "棍棒", 
                icon: "🏏", 
                hitCount: 3,
                types: ["blunt"], // 打撃
                attackMultiplier: 0.9,
                description: "連続攻撃が得意",
                owned: true
            },
            axe: { 
                name: "斧", 
                icon: "🪓", 
                hitCount: 1,
                types: ["blunt", "slash"], // 打撃+斬撃
                attackMultiplier: 1.4,
                description: "一撃が重い",
                owned: true
            },
            bow: {
                name: "弓",
                icon: "🏹",
                hitCount: 1,
                types: ["pierce", "ranged"], // 突き+遠距離
                attackMultiplier: 1.1,
                description: "遠距離から狙撃",
                owned: true
            },
            steel_sword: {
                name: "鋼の剣",
                icon: "⚔️",
                hitCount: 2,
                types: ["slash", "pierce"],
                attackMultiplier: 1.2,
                description: "より鋭い斬れ味",
                owned: false,
                price: 200
            },
            iron_club: {
                name: "鉄の棍棒",
                icon: "🏏",
                hitCount: 4,
                types: ["blunt"],
                attackMultiplier: 1.1,
                description: "連撃の嵐",
                owned: false,
                price: 180
            },
            battle_axe: {
                name: "戦斧",
                icon: "🪓",
                hitCount: 1,
                types: ["blunt", "slash"],
                attackMultiplier: 1.8,
                description: "破壊的な一撃",
                owned: false,
                price: 300
            },
            holy_sword: {
                name: "聖剣",
                icon: "✨",
                hitCount: 2,
                types: ["slash", "holy"],
                attackMultiplier: 1.4,
                description: "邪悪を滅する光",
                owned: false,
                price: 500
            },
            longbow: {
                name: "ロングボウ",
                icon: "🏹",
                hitCount: 1,
                types: ["pierce", "ranged"],
                attackMultiplier: 1.3,
                description: "長距離狙撃弓",
                owned: false,
                price: 250
            },
            crossbow: {
                name: "クロスボウ",
                icon: "🏹",
                hitCount: 1,
                types: ["pierce", "ranged"],
                attackMultiplier: 1.6,
                description: "高威力の機械弓",
                owned: false,
                price: 400
            }
        };

        // 攻撃タイプ情報
        this.attackTypes = {
            slash: { name: "斬撃", icon: "🗡️", color: "#e74c3c" },
            blunt: { name: "打撃", icon: "🔨", color: "#f39c12" },
            pierce: { name: "突き", icon: "🗡️", color: "#9b59b6" },
            holy: { name: "聖", icon: "✨", color: "#f1c40f" },
            ranged: { name: "遠距離", icon: "🎯", color: "#27ae60" }
        };

        this.skills = {
            fire: { name: "ファイア", cost: 10, power: 1.8, effect: "🔥", description: "炎の魔法で敵を焼く", element: "fire", icon: "🔥", type: "magic" },
            heal: { name: "ヒール", cost: 15, power: 0.8, effect: "💚", description: "HPを回復する", element: "holy", icon: "✨", type: "magic" },
            thunder: { name: "サンダー", cost: 20, power: 2.2, effect: "⚡", description: "雷撃で大ダメージ", element: "lightning", icon: "⚡", type: "magic" },
            critical: { name: "クリティカル", cost: 25, power: 3.0, effect: "💥", description: "必殺の一撃", element: "physical", icon: "💥", type: "physical" },
            ice: { name: "アイス", cost: 12, power: 1.6, effect: "❄️", description: "氷の魔法で敵を凍らせる", element: "ice", icon: "❄️", type: "magic" },
            shield: { name: "シールド", cost: 8, power: 0.5, effect: "🛡️", description: "防御力を一時的に上げる", element: "defensive", icon: "🛡️", type: "magic" },
            drain: { name: "ドレイン", cost: 18, power: 1.4, effect: "🧛", description: "敵のHPを吸収する", element: "dark", icon: "🌙", type: "magic" },
            bless: { name: "ブレス", cost: 22, power: 2.0, effect: "🙏", description: "聖なる力で敵を清める", element: "holy", icon: "✨", type: "magic" },
            
            // 連携スキル（物理+魔法）
            flame_slash: { name: "火炎斬り", cost: 15, physicalPower: 1.2, magicalPower: 1.5, effect: "🔥⚔️", description: "炎を纏った斬撃", element: "fire", icon: "🔥⚔️", type: "combo", requiredPhysicalLevel: 2, requiredMagicalLevel: 2 },
            ice_arrow: { name: "氷矢", cost: 18, physicalPower: 1.1, magicalPower: 1.8, effect: "❄️🏹", description: "氷の魔力を込めた矢", element: "ice", icon: "❄️🏹", type: "combo", requiredPhysicalLevel: 3, requiredMagicalLevel: 2, requiredWeaponType: "ranged" },
            thunder_strike: { name: "雷鳴撃", cost: 22, physicalPower: 1.5, magicalPower: 2.0, effect: "⚡💥", description: "雷を纏った強打", element: "lightning", icon: "⚡💥", type: "combo", requiredPhysicalLevel: 3, requiredMagicalLevel: 3 },
            holy_blade: { name: "聖剣術", cost: 25, physicalPower: 1.3, magicalPower: 2.2, effect: "✨⚔️", description: "聖なる力の剣技", element: "holy", icon: "✨⚔️", type: "combo", requiredPhysicalLevel: 4, requiredMagicalLevel: 3 }
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
        
        // サウンドマネージャーを初期化
        this.soundManager = window.soundManager || null;
        if (this.soundManager) {
            console.log('🎵 サウンドシステム有効');
        } else {
            console.warn('⚠️ サウンドシステムが読み込まれていません');
        }

        this.init();
    }

    init() {
        this.bindEvents();
        this.spawnNewEnemy();
        this.updateUI();
        this.logMessage("🎮 Epic Battle RPG へようこそ！爽快な戦闘を楽しもう！");
    }

    bindEvents() {
        // ESCキーでパネルを閉じる
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.currentPanel) {
                console.log('🔑 ESCキーでパネルを閉じる');
                this.hideActionPanel();
            }
        });
        
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
        document.getElementById('weapon-shop-btn').addEventListener('click', () => this.showWeaponShop());
        document.getElementById('rest-btn').addEventListener('click', () => this.restAtInn());
        document.getElementById('battle-btn').addEventListener('click', () => this.startBattleFromTown());
        document.getElementById('weapon-btn').addEventListener('click', () => this.showWeaponSelect());
        document.getElementById('town-save-btn').addEventListener('click', () => this.saveGame());
        document.getElementById('shop-back').addEventListener('click', () => this.backToTown());
        document.getElementById('weapon-back').addEventListener('click', () => this.backToTown());
        document.getElementById('weapon-shop-back').addEventListener('click', () => this.backToTown());

        // ショップアイテム購入
        document.querySelectorAll('.buy-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.buyItem(e.target.dataset.item, parseInt(e.target.dataset.price)));
        });

        // 武器購入
        document.querySelectorAll('.buy-weapon-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.buyWeapon(e.target.dataset.weapon, parseInt(e.target.dataset.price)));
        });

        // 武器装備
        document.querySelectorAll('.equip-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const weaponOption = e.target.closest('.weapon-option');
                this.equipWeapon(weaponOption.dataset.weapon);
            });
        });

        // ヘルプ機能
        document.getElementById('help-btn').addEventListener('click', () => this.showHelp());
        document.getElementById('help-back').addEventListener('click', () => this.hideHelp());
    }

    spawnNewEnemy() {
        // レベルに応じた敵の候補をランダム選択（改善版）
        // 最低2種類の敵が選択可能になるよう調整
        const baseEnemyCount = Math.min(2 + Math.floor(this.gameState.level / 3), this.enemyTemplates.length);
        const availableEnemies = this.enemyTemplates.slice(0, baseEnemyCount);
        const template = availableEnemies[Math.floor(Math.random() * availableEnemies.length)];
        
        console.log(`🎲 敵選択: レベル${this.gameState.level} → 候補${availableEnemies.length}体 → ${template.name}`);
        const levelMultiplier = 1 + (this.gameState.level - 1) * 0.2;
        
        this.enemy = {
            name: template.name,
            sprite: template.sprite,
            maxHp: Math.floor(template.hp * levelMultiplier),
            hp: Math.floor(template.hp * levelMultiplier),
            attack: Math.floor(template.attack * levelMultiplier),
            basePhysicalDefense: Math.floor(template.defense * levelMultiplier),
            baseMagicalDefense: Math.floor(template.defense * levelMultiplier * 0.8),
            currentPhysicalDefense: Math.floor(template.defense * levelMultiplier),
            currentMagicalDefense: Math.floor(template.defense * levelMultiplier * 0.8),
            exp: Math.floor(template.exp * levelMultiplier),
            gold: Math.floor(template.gold * levelMultiplier),
            weaknesses: template.weaknesses,
            wounds: {
                // 攻撃タイプ別傷口レベル
                slash: 0,
                blunt: 0, 
                pierce: 0,
                // 属性別傷口レベル
                fire: 0,
                lightning: 0,
                holy: 0,
                ice: 0
            }
        };

        document.getElementById('enemy-name').textContent = this.enemy.name;
        document.querySelector('#enemy-character .character-sprite').textContent = this.enemy.sprite;
        this.isBattleActive = true;
        this.isPlayerTurn = true;
        this.player.isGuarding = false;
        this.player.combo = 0;
        
        // 傷口インジケーターを初期化
        this.updateWoundIndicators();
        
        // プレイヤーアクションを確実に有効化（敗北後の操作不能問題を防止）
        setTimeout(() => {
            this.enablePlayerActions();
            console.log('🔓 プレイヤーアクション有効化完了');
        }, 50);
    }

    playerAttack() {
        if (!this.canPlayerAct()) return;

        const weapon = this.weapons[this.player.currentWeapon];
        if (!weapon || typeof weapon.attackMultiplier !== 'number' || !Array.isArray(weapon.types)) {
            console.error('Invalid weapon data:', {
                currentWeapon: this.player.currentWeapon,
                weapon: weapon,
                weaponsKeys: Object.keys(this.weapons)
            });
            this.player.currentWeapon = 'sword';
            this.logMessage('⚠️ 武器データが不正のため、剣に変更しました。');
            // 再帰的に安全な武器で実行
            return this.playerAttack();
        }
        
        const weaponAttack = Math.floor(this.player.physicalAttack * weapon.attackMultiplier);
        
        // 傷口システムによる防御力減少を適用（弱点攻撃の場合）
        const appliedWounds = this.applyWoundSystem(weapon.types, null);
        
        // 現在の防御力でダメージ計算（傷口効果込み）
        const baseDamage = this.calculatePhysicalDamage(weaponAttack);
        
        // 弱点システム: 固定1.5倍ダメージ + 傷口追加ダメージ
        const weaknessMultiplier = this.calculateWeaknessMultiplier(weapon.types, null);
        let damage = Math.round(baseDamage * weaknessMultiplier);
        
        // 傷口による追加ダメージボーナス（弱点攻撃時のみ）
        if (weaknessMultiplier > 1.0) {
            const woundBonus = this.calculateWoundDamageBonus(weapon.types);
            damage += woundBonus;
        }
        
        const isCritical = Math.random() < 0.15 + (this.player.combo * 0.05); // コンボでクリティカル率上昇
        const finalDamage = isCritical ? Math.floor(damage * 2) : damage;
        
        // サウンド再生
        if (this.soundManager) {
            if (isCritical) {
                this.soundManager.playCriticalSound();
            } else {
                // 弓系武器は専用サウンド
                if (weapon.types.includes('ranged')) {
                    this.soundManager.playBowSound();
                } else {
                    this.soundManager.playAttackSound();
                }
            }
            // コンボ音
            this.soundManager.playComboSound(this.player.combo + 1);
        }

        this.player.combo++;
        if (this.player.combo > this.player.maxCombo) {
            this.player.maxCombo = this.player.combo;
        }

        this.animateCharacter('player', 'attacking');
        
        // 連続ヒット表示
        this.showMultiHitDamage(finalDamage, 'enemy', isCritical);
        this.showEffect('⚔️', 'enemy');

        this.enemy.hp = Math.max(0, this.enemy.hp - finalDamage);

        const attackTypeText = weapon.types.map(type => this.attackTypes[type].name).join('・');
        const woundText = appliedWounds.length > 0 ? `🩸(${appliedWounds.join('・')})` : '';
        const defenseInfo = this.enemy ? `[防御:${this.enemy.currentPhysicalDefense}]` : '';
        const weaknessText = this.getWeaknessText(weapon.types, null);
        
        if (isCritical) {
            this.logMessage(`💥 クリティカルヒット！ ${weapon.icon}${weapon.name}(${attackTypeText})${weaknessText}で${finalDamage}ダメージ！${woundText}${defenseInfo}`);
        } else {
            this.logMessage(`${weapon.icon} ${weapon.name}(${attackTypeText})${weaknessText}で${finalDamage}ダメージ！${woundText}${defenseInfo}`);
        }

        // 物理経験値獲得
        this.gainPhysicalExp(1);
        
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

        // スキルサウンド再生
        if (this.soundManager) {
            this.soundManager.playSkillSound(skillName);
        }
        
        if (skillName === 'heal') {
            const healAmount = Math.floor(this.player.maxHp * skill.power * 0.5);
            this.player.hp = Math.min(this.player.maxHp, this.player.hp + healAmount);
            this.showDamageNumber(healAmount, 'player', false, true);
            this.showEffect(skill.effect, 'player');
            this.logMessage(`💚 ${skill.name}でHP ${healAmount}回復！`);
            
            // 魔法経験値獲得
            this.gainMagicalExp(3);
        } else if (skill.type === 'combo') {
            // 連携スキル処理
            const physicalDamage = Math.floor(this.player.physicalAttack * skill.physicalPower);
            const magicalDamage = Math.floor(this.player.magicalAttack * skill.magicalPower);
            const totalDamage = physicalDamage + magicalDamage;
            
            // 傷口システム適用
            const appliedWounds = this.applyWoundSystem(null, skill.element);
            const finalDamage = this.calculateMagicalDamage(totalDamage);
            
            this.player.combo += 3; // 連携スキルはコンボ大幅増加
            if (this.player.combo > this.player.maxCombo) {
                this.player.maxCombo = this.player.combo;
            }

            this.animateCharacter('player', 'attacking');
            this.showDamageNumber(finalDamage, 'enemy', false);
            this.showEffect(skill.effect, 'enemy');
            
            this.enemy.hp = Math.max(0, this.enemy.hp - finalDamage);

            const woundText = appliedWounds.length > 0 ? `🩸(${appliedWounds.join('・')})` : '';
            this.logMessage(`💫 ${skill.name}で${finalDamage}ダメージ！(物理:${physicalDamage} + 魔法:${magicalDamage})${woundText}(コンボ: ${this.player.combo})`);
            
            // 両方の経験値獲得
            this.gainPhysicalExp(2);
            this.gainMagicalExp(2);
        } else {
            const baseDamage = Math.floor(this.player.magicalAttack * (skill.power || 1.0));
            
            // 傷口システムによる防御力減少を適用（属性弱点の場合）
            const appliedWounds = this.applyWoundSystem(null, skill.element);
            
            // 魔法ダメージ計算（傷口効果込み）
            const damage = this.calculateMagicalDamage(baseDamage);
            
            // 属性弱点攻撃の場合は傷口システムで処理、初回のみボーナス
            let weaknessDamage = damage;
            if (appliedWounds.length > 0) {
                // 属性弱点攻撃で新たに傷をつけた場合、初回ボーナス
                const isFirstElementHit = appliedWounds.some(wound => {
                    const elementType = wound.includes('炎') ? 'fire' : 
                                       wound.includes('雷') ? 'lightning' : 
                                       wound.includes('聖') ? 'holy' : 
                                       wound.includes('氷') ? 'ice' : null;
                    return elementType && this.enemy.wounds[elementType] === 1;
                });
                
                if (isFirstElementHit) {
                    weaknessDamage = Math.floor(damage * 1.4); // 初回属性弱点攻撃ボーナス
                }
            }
            
            const isCritical = Math.random() < 0.3; // スキルは高いクリティカル率
            const finalDamage = isCritical ? Math.floor(weaknessDamage * 1.5) : weaknessDamage;

            this.player.combo += 2; // スキルはコンボが多く増加
            if (this.player.combo > this.player.maxCombo) {
                this.player.maxCombo = this.player.combo;
            }

            this.animateCharacter('player', 'attacking');
            this.showDamageNumber(finalDamage, 'enemy', isCritical);
            this.showEffect(skill.effect, 'enemy');
            
            this.enemy.hp = Math.max(0, this.enemy.hp - finalDamage);

            const critText = isCritical ? " クリティカル！" : "";
            const woundText = appliedWounds.length > 0 ? `🩸(${appliedWounds.join('・')})` : '';
            const defenseInfo = this.enemy ? `魔防:${this.enemy.currentMagicalDefense}` : '';
            this.logMessage(`✨ ${skill.name}で${finalDamage}ダメージ！${woundText}${defenseInfo}${critText}(コンボ: ${this.player.combo})`);
            
            // 魔法経験値獲得
            this.gainMagicalExp(1);
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
            // 爆弾は物理ダメージとして扱う
            const damage = this.calculatePhysicalDamage(item.power);
            this.enemy.hp = Math.max(0, this.enemy.hp - damage);
            this.showDamageNumber(damage, 'enemy', false);
            this.showEffect('💣', 'enemy');
            this.logMessage(`💣 ${item.name}で${damage}ダメージ！`);
            
            // サウンド再生
            if (this.soundManager) {
                this.soundManager.playItemSound('bomb');
            }
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

        // ガードサウンド再生
        if (this.soundManager) {
            this.soundManager.playGuardSound();
        }
        
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

        setTimeout(() => { // 1500ms → 375ms（4倍速）
            const action = Math.random() < 0.8 ? 'attack' : 'special';
            
            if (action === 'attack') {
                // 遠隔攻撃による回避判定
                const currentWeapon = this.weapons[this.player.currentWeapon];
                const isRangedWeapon = currentWeapon && currentWeapon.types.includes('ranged');
                const dodgeChance = isRangedWeapon ? 0.3 : 0.05; // 弓は30%、その他は5%
                
                if (Math.random() < dodgeChance) {
                    this.showEffect('💨', 'player');
                    this.logMessage(`💨 ${isRangedWeapon ? '遠距離攻撃で' : '素早く'}${this.enemy.name}の攻撃を回避！`);
                    // サウンド再生
                    if (this.soundManager) {
                        this.soundManager.playUISound('hover'); // 回避音
                    }
                } else {
                    let damage = this.calculateDamage(this.enemy.attack, this.player.defense);
                    
                    if (this.player.isGuarding) {
                        damage = Math.floor(damage * 0.5);
                        this.logMessage(`🛡️ 防御により${damage}ダメージに軽減！`);
                        // サウンド再生
                        if (this.soundManager) {
                            this.soundManager.playGuardSound();
                        }
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
                    
                    // サウンド再生
                    if (this.soundManager) {
                        this.soundManager.playDamageSound(false);
                    }
                }
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
        }, 375); // 1500ms → 375ms（4倍速）
    }

    // 物理経験値獲得
    gainPhysicalExp(amount) {
        this.player.physicalExp += amount;
        
        if (this.player.physicalExp >= this.player.physicalExpToNext) {
            this.player.physicalLevel++;
            this.player.physicalAttack += 3;
            this.player.physicalExp -= this.player.physicalExpToNext;
            this.player.physicalExpToNext = Math.floor(this.player.physicalExpToNext * 1.2);
            
            this.logMessage(`⚡ 物理レベルアップ！ Lv.${this.player.physicalLevel} (攻撃力+3)`);
            if (this.soundManager) {
                this.soundManager.playLevelUpSound();
            }
        }
    }

    // 魔法経験値獲得
    gainMagicalExp(amount) {
        this.player.magicalExp += amount;
        
        if (this.player.magicalExp >= this.player.magicalExpToNext) {
            this.player.magicalLevel++;
            this.player.magicalAttack += 2;
            this.player.maxMp += 5;
            this.player.mp += 5;
            this.player.magicalExp -= this.player.magicalExpToNext;
            this.player.magicalExpToNext = Math.floor(this.player.magicalExpToNext * 1.15);
            
            this.logMessage(`🔮 魔法レベルアップ！ Lv.${this.player.magicalLevel} (魔攻+2, MP+5)`);
            if (this.soundManager) {
                this.soundManager.playLevelUpSound();
            }
        }
    }

    calculateDamage(attack, defense) {
        const baseDamage = attack - defense;
        const variance = Math.random() * 0.05 + 0.975; // 97.5-102.5%のより安定した変動
        return Math.max(1, Math.round(baseDamage * variance));
    }

    // 物理・魔法別ダメージ計算
    calculatePhysicalDamage(attack) {
        return this.calculateDamage(attack, this.enemy.currentPhysicalDefense);
    }

    calculateMagicalDamage(attack) {
        return this.calculateDamage(attack, this.enemy.currentMagicalDefense);
    }

    // 傷口システム - 弱点攻撃による防御力減少
    applyWoundSystem(attackTypes, element) {
        if (!this.enemy || !this.enemy.weaknesses) return [];
        
        let appliedWounds = [];
        
        // 攻撃タイプ弱点チェック
        if (attackTypes) {
            for (const attackType of attackTypes) {
                if (this.enemy.weaknesses.attackTypes.includes(attackType)) {
                    this.enemy.wounds[attackType]++;
                    appliedWounds.push(`${this.attackTypes[attackType].name}傷`);
                    console.log(`Applied ${attackType} wound, total: ${this.enemy.wounds[attackType]}`);
                }
            }
        }
        
        // 属性弱点チェック
        if (element && this.enemy.weaknesses.elements.includes(element)) {
            this.enemy.wounds[element]++;
            const elementNames = {
                fire: "炎", lightning: "雷", holy: "聖", ice: "氷"
            };
            appliedWounds.push(`${elementNames[element] || element}傷`);
            console.log(`Applied ${element} elemental wound, total: ${this.enemy.wounds[element]}`);
        }
        
        // 防御力を再計算（累積効果）
        this.recalculateDefense();
        
        // 視覚的インジケーター更新
        this.updateWoundIndicators();
        
        return appliedWounds;
    }
    
    // 防御力再計算（傷口による累積減少）
    recalculateDefense() {
        if (!this.enemy) return;
        
        // 敵のwoundsプロパティを安全確保
        if (!this.enemy.wounds) {
            console.warn('recalculateDefense: enemy.wounds is undefined, initializing...');
            this.enemy.wounds = {
                slash: 0, blunt: 0, pierce: 0,
                fire: 0, lightning: 0, holy: 0, ice: 0
            };
        }
        
        // 物理系傷口の累積効果（傷1つにつき防御力10%減少、最大60%減少）
        const physicalWounds = (this.enemy.wounds.slash || 0) + (this.enemy.wounds.blunt || 0) + (this.enemy.wounds.pierce || 0);
        const physicalReduction = Math.min(physicalWounds * 0.10, 0.60);
        
        // 魔法系傷口の累積効果（傷1つにつき防御力10%減少、最大60%減少）
        const magicalWounds = (this.enemy.wounds.fire || 0) + (this.enemy.wounds.lightning || 0) + (this.enemy.wounds.holy || 0) + (this.enemy.wounds.ice || 0);
        const magicalReduction = Math.min(magicalWounds * 0.10, 0.60);
        
        // 防御力減少を適用（傷が多いほど防御力が下がる）
        this.enemy.currentPhysicalDefense = Math.floor(this.enemy.basePhysicalDefense * (1 - physicalReduction));
        this.enemy.currentMagicalDefense = Math.floor(this.enemy.baseMagicalDefense * (1 - magicalReduction));
        
        // 最低防御力を確保（最低1は保持）
        this.enemy.currentPhysicalDefense = Math.max(1, this.enemy.currentPhysicalDefense);
        this.enemy.currentMagicalDefense = Math.max(1, this.enemy.currentMagicalDefense);
        
        // デバッグ情報をログに出力
        console.log(`Defense recalculated: Physical wounds: ${physicalWounds}, reduction: ${physicalReduction * 100}%, defense: ${this.enemy.basePhysicalDefense} → ${this.enemy.currentPhysicalDefense}`);
    }
    
    // 傷口インジケーター更新
    updateWoundIndicators() {
        if (!this.enemy) return;
        
        // 敵のwoundsプロパティを安全確保
        if (!this.enemy.wounds) {
            console.warn('updateWoundIndicators: enemy.wounds is undefined, initializing...');
            this.enemy.wounds = {
                slash: 0, blunt: 0, pierce: 0,
                fire: 0, lightning: 0, holy: 0, ice: 0
            };
        }
        
        // 傷口タイプの配列定義
        const woundTypes = ['slash', 'blunt', 'pierce', 'fire', 'lightning', 'holy', 'ice'];
        
        woundTypes.forEach(woundType => {
            const woundCount = this.enemy.wounds[woundType] || 0;
            const indicator = document.getElementById(`${woundType}-wounds`);
            
            if (indicator) {
                // 傷がある場合はアクティブ化
                if (woundCount > 0) {
                    indicator.classList.add('active');
                    
                    // 複数回の傷がある場合は数を表示
                    if (woundCount > 1) {
                        indicator.classList.add('multiple');
                        indicator.setAttribute('data-count', woundCount);
                    } else {
                        indicator.classList.remove('multiple');
                        indicator.removeAttribute('data-count');
                    }
                } else {
                    indicator.classList.remove('active', 'multiple');
                    indicator.removeAttribute('data-count');
                }
            }
        });
    }
    
    // 弱点を考慮したダメージ計算（固定1.5倍）
    calculateWeaknessMultiplier(attackTypes, element) {
        let multiplier = 1.0;
        
        if (!this.enemy || !this.enemy.weaknesses) return multiplier;
        
        // 攻撃タイプ弱点チェック
        if (attackTypes) {
            for (const attackType of attackTypes) {
                if (this.enemy.weaknesses.attackTypes.includes(attackType)) {
                    multiplier *= 1.5; // 弱点倍率固定
                }
            }
        }
        
        // 属性弱点チェック
        if (element && this.enemy.weaknesses.elements.includes(element)) {
            multiplier *= 1.5; // 弱点倍率固定
        }
        
        return multiplier;
    }

    // 傷口による追加ダメージボーナス計算
    calculateWoundDamageBonus(attackTypes) {
        if (!this.enemy || !this.enemy.wounds || !attackTypes) return 0;
        
        let woundBonus = 0;
        
        // 攻撃タイプごとの傷口数をチェック
        for (const attackType of attackTypes) {
            const woundCount = this.enemy.wounds[attackType] || 0;
            // 傷口1つにつき3ダメージのボーナス（最大4傷口まで）
            woundBonus += Math.min(woundCount, 4) * 3;
        }
        
        return woundBonus;
    }

    // 弱点情報テキスト生成
    getWeaknessText(attackTypes, element) {
        const weaknesses = [];
        
        if (!this.enemy || !this.enemy.weaknesses) return '';
        
        if (attackTypes) {
            for (const attackType of attackTypes) {
                if (this.enemy.weaknesses.attackTypes.includes(attackType)) {
                    weaknesses.push(`${this.attackTypes[attackType].name}弱点`);
                }
            }
        }
        
        if (element && this.enemy.weaknesses.elements.includes(element)) {
            const elementNames = {
                fire: "炎", lightning: "雷", holy: "聖", ice: "氷"
            };
            weaknesses.push(`${elementNames[element] || element}弱点`);
        }
        
        return weaknesses.length > 0 ? `🎯(${weaknesses.join('・')})` : '';
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
        console.log('💀 ゲームオーバー処理開始');
        this.isBattleActive = false;
        console.log('🔒 戦闘状態無効化: isBattleActive =', this.isBattleActive);
        this.disablePlayerActions();
        console.log('🔒 プレイヤーアクション無効化実行');
        
        // 敗北時の状態をリセット
        this.isPlayerTurn = true;
        this.player.isGuarding = false;
        console.log('🔄 プレイヤー状態リセット完了');
        
        this.showResultScreen(false, false, 0);
        this.logMessage(`💀 ${this.player.name}は倒れた...`);
        console.log('💀 ゲームオーバー処理完了');
    }

    nextBattle() {
        console.log('⚔️ 次戦闘処理開始');
        this.hideResultScreen();
        console.log('📄 結果画面非表示完了');
        
        // 敗北後の確実な状態リセット
        this.isPlayerTurn = true;
        this.player.isGuarding = false;
        this.player.combo = 0;
        console.log('🔄 戦闘状態完全リセット完了');
        
        this.spawnNewEnemy();
        console.log('👹 新敵生成完了:', this.enemy.name);
        this.updateUI();
        
        // アイテム少し回復
        Object.values(this.items).forEach(item => {
            if (Math.random() < 0.3) {
                item.count = Math.min(item.count + 1, 5);
            }
        });
        
        // 確実にボタンを有効化
        setTimeout(() => {
            this.enablePlayerActions();
            console.log('🔓 次戦闘でのボタン有効化完了');
        }, 100);
        
        this.logMessage(`⚔️ 次の戦闘開始！${this.enemy.name}が現れた！`);
        console.log('⚔️ 次戦闘処理完了');
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
        console.log('🔓 プレイヤーアクション有効化開始');
        const actionBtns = document.querySelectorAll('.action-btn');
        console.log('🎮 対象ボタン数:', actionBtns.length);
        actionBtns.forEach(btn => {
            btn.disabled = false;
        });
        console.log('🔓 プレイヤーアクション有効化完了');
    }

    disablePlayerActions() {
        console.log('🔒 プレイヤーアクション無効化開始');
        const actionBtns = document.querySelectorAll('.action-btn');
        console.log('🎮 対象ボタン数:', actionBtns.length);
        actionBtns.forEach(btn => {
            btn.disabled = true;
        });
        console.log('🔒 プレイヤーアクション無効化完了');
    }

    nextTurn() {
        this.isPlayerTurn = false;
        this.disablePlayerActions();
        setTimeout(() => {
            this.enemyTurn();
        }, 200); // 400ms → 200ms（半分に短縮）
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
        this.updateSkillPanelUI();
        document.getElementById('skill-panel').classList.remove('hidden');
        this.currentPanel = 'skill';
        
        // 戸るボタンのイベントリスナーを確実に再設定
        const backBtn = document.getElementById('skill-back');
        if (backBtn) {
            // 既存のリスナーをクリアして再設定
            backBtn.replaceWith(backBtn.cloneNode(true));
            document.getElementById('skill-back').addEventListener('click', () => {
                console.log('🔙 スキルパネルを閉じる');
                this.hideActionPanel();
            });
        }
        console.log('🎮 スキルパネルを表示');
    }
    
    // スキルパネルUI更新(ドラゴンクエスト風)
    updateSkillPanelUI() {
        const skillGrid = document.querySelector('#skill-panel .skill-grid');
        const mpDisplay = document.getElementById('skill-mp-display');
        
        // MP表示更新
        if (mpDisplay) {
            mpDisplay.textContent = `${this.player.mp}/${this.player.maxMp}`;
        }
        
        skillGrid.innerHTML = '';
        
        // 利用可能なスキルを取得
        const availableSkills = this.getAvailableSkills();
        
        availableSkills.forEach(([skillKey, skill]) => {
            const skillBtn = document.createElement('button');
            skillBtn.className = 'skill-option vertical';
            skillBtn.dataset.skill = skillKey;
            
            // MP不足の場合は無効化
            const canUse = this.player.mp >= skill.cost;
            if (!canUse) {
                skillBtn.classList.add('disabled');
                skillBtn.disabled = true;
            }
            
            // 属性アイコン付き表示
            skillBtn.innerHTML = `
                <div class="skill-info">
                    <span class="skill-icon">${skill.icon}</span>
                    <span class="skill-name">${skill.name}</span>
                    <span class="skill-cost">MP:${skill.cost}</span>
                </div>
                <div class="skill-desc">${skill.description}</div>
            `;
            
            skillBtn.addEventListener('click', () => {
                if (canUse) this.useSkill(skillKey);
            });
            
            skillGrid.appendChild(skillBtn);
        });
    }
    
    // レベルに応じて利用可能なスキルを取得
    getAvailableSkills() {
        const playerLevel = this.gameState.level;
        const allSkills = Object.entries(this.skills);
        const currentWeapon = this.weapons[this.player.currentWeapon];
        
        // レベルと条件に応じてスキルを解放
        return allSkills.filter(([skillKey, skill]) => {
            // 連携スキルの条件チェック
            if (skill.type === 'combo') {
                // レベル条件チェック
                if (skill.requiredPhysicalLevel && this.player.physicalLevel < skill.requiredPhysicalLevel) {
                    return false;
                }
                if (skill.requiredMagicalLevel && this.player.magicalLevel < skill.requiredMagicalLevel) {
                    return false;
                }
                // 武器タイプ条件チェック（氷矢は弓必須）
                if (skill.requiredWeaponType) {
                    return currentWeapon && currentWeapon.types.includes(skill.requiredWeaponType);
                }
                return true;
            }
            
            // 基本スキルの条件
            switch(skillKey) {
                case 'fire':
                case 'heal':
                    return true;
                case 'thunder':
                case 'critical':
                    return playerLevel >= 2;
                case 'ice':
                case 'shield':
                    return playerLevel >= 3;
                case 'drain':
                    return playerLevel >= 4;
                case 'bless':
                    return playerLevel >= 5;
                default:
                    return true;
            }
        });
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
        const battleLog = document.getElementById('battle-log'); // 親コンテナ
        const p = document.createElement('p');
        p.textContent = message;
        logContent.appendChild(p);
        
        // 自動スクロール（確実版）
        setTimeout(() => {
            battleLog.scrollTop = battleLog.scrollHeight;
        }, 50);

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
        }, 300);
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
        }, 900);
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
            }, index * 60); // 武器に応じて間隔調整（半分に短縮）
        });
        
        // 合計ダメージ表示
        setTimeout(() => {
            this.createTotalDamageNumber(totalDamage, rect, isCritical, currentWeapon);
        }, hitCount * 60 + 150);
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
            // 現在の画面状態を判定
            let currentScreen = 'battle';
            if (!document.getElementById('town-screen').classList.contains('hidden')) {
                currentScreen = 'town';
            } else if (!document.getElementById('shop-screen').classList.contains('hidden')) {
                currentScreen = 'shop';
            } else if (!document.getElementById('weapon-screen').classList.contains('hidden')) {
                currentScreen = 'weapon';
            } else if (!document.getElementById('weapon-shop-screen').classList.contains('hidden')) {
                currentScreen = 'weapon-shop';
            } else if (!document.getElementById('help-screen').classList.contains('hidden')) {
                currentScreen = 'help';
            }

            const saveData = {
                gameState: this.gameState,
                player: this.player,
                items: this.items,
                weapons: this.weapons, // 武器の所有状態を保存
                enemy: this.enemy,
                battleState: {
                    isBattleActive: this.isBattleActive,
                    isPlayerTurn: this.isPlayerTurn,
                    currentScreen: currentScreen
                },
                saveTime: new Date().toISOString(),
                version: "0.51"
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
            this.player = { ...this.player, ...saveData.player };
            this.items = saveData.items;
            this.enemy = saveData.enemy;
            
            // 武器データの復元（v0.38以降）
            if (saveData.weapons) {
                // 武器の所有状態を安全に復元
                Object.keys(this.weapons).forEach(weaponKey => {
                    if (saveData.weapons[weaponKey] && saveData.weapons[weaponKey].owned !== undefined) {
                        this.weapons[weaponKey].owned = saveData.weapons[weaponKey].owned;
                    }
                });
            }
            
            // currentWeaponの安全確認と修正
            if (!this.player.currentWeapon || !this.weapons[this.player.currentWeapon] || !this.weapons[this.player.currentWeapon].owned) {
                console.warn('Invalid currentWeapon, resetting to sword:', this.player.currentWeapon);
                this.player.currentWeapon = 'sword';
                this.logMessage('⚠️ 無効な武器のため、剣に変更しました。');
            }

            // 敵が存在する場合の処理
            if (this.enemy) {
                // 敵のwoundsプロパティを安全に初期化（セーブデータに含まれていない場合）
                if (!this.enemy.wounds) {
                    this.enemy.wounds = {
                        slash: 0, blunt: 0, pierce: 0,
                        fire: 0, lightning: 0, holy: 0, ice: 0
                    };
                    console.warn('Enemy wounds were missing, initialized to defaults');
                }
                
                // 防御力のベース値も確保
                if (!this.enemy.basePhysicalDefense) {
                    this.enemy.basePhysicalDefense = this.enemy.defense || 5;
                    this.enemy.baseMagicalDefense = this.enemy.defense || 5;
                    this.enemy.currentPhysicalDefense = this.enemy.basePhysicalDefense;
                    this.enemy.currentMagicalDefense = this.enemy.baseMagicalDefense;
                    console.warn('Enemy defense values were missing, initialized from base defense');
                }
                
                document.getElementById('enemy-name').textContent = this.enemy.name;
                document.querySelector('#enemy-character .character-sprite').textContent = this.enemy.sprite;
                this.isBattleActive = true;
                
                // 傷口インジケーターを更新
                this.updateWoundIndicators();
            } else {
                this.spawnNewEnemy();
            }

            // 戦闘状態の復元
            if (saveData.battleState) {
                this.isBattleActive = saveData.battleState.isBattleActive || false;
                this.isPlayerTurn = saveData.battleState.isPlayerTurn || true;
                
                // 画面状態の復元
                const currentScreen = saveData.battleState.currentScreen || 'town';
                console.log('Restoring screen state:', currentScreen);
                
                // すべての画面を隠す
                this.hideAllScreens();
                
                // 保存された画面を表示
                switch (currentScreen) {
                    case 'town':
                        this.showTownScreen();
                        break;
                    case 'shop':
                        this.showShopScreen();
                        break;
                    case 'weapon':
                        this.showWeaponScreen();
                        break;
                    case 'weapon-shop':
                        this.showWeaponShopScreen();
                        break;
                    case 'help':
                        this.showHelp();
                        break;
                    case 'battle':
                    default:
                        // 戦闘画面（デフォルト状態）
                        this.isBattleActive = true;
                        break;
                }
            } else {
                // 旧バージョンのセーブデータの場合は街画面から開始
                console.log('Old save data detected, starting from town');
                this.hideAllScreens();
                this.showTownScreen();
                this.isBattleActive = false;
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

    // 全画面を非表示にする共通メソッド
    hideAllScreens() {
        document.getElementById('town-screen').classList.add('hidden');
        document.getElementById('shop-screen').classList.add('hidden');
        document.getElementById('weapon-screen').classList.add('hidden');
        document.getElementById('weapon-shop-screen').classList.add('hidden');
        document.getElementById('help-screen').classList.add('hidden');
        document.getElementById('result-screen').classList.add('hidden');
        this.hideActionPanel(); // アクションパネルも非表示
    }

    // 個別の画面表示メソッド（統一化）
    showTownScreen() {
        this.hideAllScreens();
        this.updateTownUI();
        document.getElementById('town-screen').classList.remove('hidden');
    }

    showShopScreen() {
        this.hideAllScreens();
        this.updateShopUI();
        document.getElementById('shop-screen').classList.remove('hidden');
    }

    showWeaponScreen() {
        this.hideAllScreens();
        this.updateWeaponUI();
        document.getElementById('weapon-screen').classList.remove('hidden');
    }

    showWeaponShopScreen() {
        this.hideAllScreens();
        this.updateWeaponShopUI();
        document.getElementById('weapon-shop-screen').classList.remove('hidden');
    }

    // 街機能
    showTown() {
        this.hideResultScreen();
        this.showTownScreen();
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
        this.showShopScreen();
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

    // 各画面から街に戻る（統一化）
    backToTown() {
        this.showTownScreen();
        this.logMessage('🏘️ 街に戻りました。');
    }

    // 武器選択画面表示
    showWeaponSelect() {
        this.showWeaponScreen();
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
            const weapon = this.weapons[weaponKey];
            const equipBtn = option.querySelector('.equip-btn');
            
            // 所有していない武器は非表示
            if (!weapon || !weapon.owned) {
                option.style.display = 'none';
                return;
            }
            
            option.style.display = 'flex';
            
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

    // ヘルプ画面表示
    showHelp() {
        this.hideAllScreens();
        document.getElementById('help-screen').classList.remove('hidden');
        this.logMessage('❓ システムガイドを表示しました。');
    }

    // ヘルプ画面非表示
    hideHelp() {
        document.getElementById('help-screen').classList.add('hidden');
        this.showTown();
        this.logMessage('🏘️ 街に戻りました。');
    }

    // 武器屋システム
    showWeaponShop() {
        this.showWeaponShopScreen();
        this.logMessage('🗡️ 武器屋にようこそ！強力な武器を取り揃えております！');
    }

    hideWeaponShop() {
        document.getElementById('weapon-shop-screen').classList.add('hidden');
    }

    hideHelpScreen() {
        document.getElementById('help-screen').classList.add('hidden');
    }

    updateWeaponShopUI() {
        // 現在の所持金
        document.getElementById('weapon-shop-current-gold').textContent = this.gameState.score;
        
        // 購入ボタンの状態更新
        document.querySelectorAll('.buy-weapon-btn').forEach(btn => {
            const price = parseInt(btn.dataset.price);
            const weaponKey = btn.dataset.weapon;
            const weapon = this.weapons[weaponKey];
            
            // すでに所有している場合は「所有済み」表示
            if (weapon && weapon.owned) {
                btn.textContent = '所有済み';
                btn.disabled = true;
            } else if (this.gameState.score < price) {
                btn.disabled = true;
            } else {
                btn.disabled = false;
            }
        });

        // 所有武器リスト更新
        this.updateWeaponInventoryList();
    }

    updateWeaponInventoryList() {
        const inventoryList = document.getElementById('weapon-inventory-list');
        inventoryList.innerHTML = '';
        
        const ownedWeapons = Object.entries(this.weapons).filter(([key, weapon]) => weapon.owned);
        
        if (ownedWeapons.length === 0) {
            inventoryList.innerHTML = '<p>武器を所有していません</p>';
            return;
        }
        
        ownedWeapons.forEach(([key, weapon]) => {
            const weaponDiv = document.createElement('div');
            weaponDiv.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; margin-bottom: 0.5rem; background: rgba(255,255,255,0.1); border-radius: 5px;';
            
            const equipped = (key === this.player.currentWeapon) ? ' (装備中)' : '';
            const attackTypes = weapon.types.map(type => this.attackTypes[type].name).join('・');
            
            weaponDiv.innerHTML = `
                <span>${weapon.icon} ${weapon.name}${equipped}</span>
                <span style="font-size: 0.8rem; opacity: 0.8;">${attackTypes} | ${weapon.hitCount}ヒット</span>
            `;
            inventoryList.appendChild(weaponDiv);
        });
    }

    buyWeapon(weaponKey, price) {
        const weapon = this.weapons[weaponKey];
        
        if (!weapon) {
            this.showTemporaryMessage('武器が見つかりません', 'error');
            return;
        }
        
        if (weapon.owned) {
            this.showTemporaryMessage('すでに所有しています', 'info');
            return;
        }
        
        if (this.gameState.score < price) {
            this.showTemporaryMessage('お金が足りません！', 'error');
            return;
        }

        // 購入処理
        this.gameState.score -= price;
        weapon.owned = true;
        
        this.logMessage(`🗡️ ${weapon.icon}${weapon.name}を購入しました！(-${price}G)`);
        this.showTemporaryMessage(`${weapon.name}購入！`, 'success');
        
        this.updateWeaponShopUI();
        this.updateUI();
    }
}

// ゲーム開始
document.addEventListener('DOMContentLoaded', () => {
    new BattleRPG();
});