// サウンドエフェクトシステム
class SoundManager {
    constructor() {
        this.audioContext = null;
        this.isEnabled = false;
        this.init();
    }

    async init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.isEnabled = true;
        } catch (e) {
            console.log('Web Audio API not supported');
        }
    }

    // 基本的な音の生成
    createTone(frequency, duration, type = 'sine', volume = 0.3) {
        if (!this.isEnabled || !this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
        gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    // 複数の音を重ねる
    createChord(frequencies, duration, type = 'sine', volume = 0.2) {
        frequencies.forEach(freq => {
            this.createTone(freq, duration, type, volume);
        });
    }

    // 攻撃音
    playAttackSound() {
        // 斬撃音のイメージ
        this.createTone(800, 0.1, 'sawtooth', 0.4);
        setTimeout(() => {
            this.createTone(600, 0.1, 'square', 0.3);
        }, 50);
    }

    // クリティカル攻撃音
    playCriticalSound() {
        // より派手な音
        this.createChord([800, 1200, 1600], 0.15, 'sawtooth', 0.3);
        setTimeout(() => {
            this.createChord([600, 900, 1200], 0.15, 'square', 0.2);
        }, 75);
    }

    // スキル音
    playSkillSound(skillType) {
        switch (skillType) {
            case 'fire':
                // 炎の音
                this.createTone(300, 0.3, 'sawtooth', 0.3);
                setTimeout(() => {
                    this.createTone(250, 0.2, 'triangle', 0.2);
                }, 100);
                break;
            case 'thunder':
                // 雷の音
                this.createTone(1500, 0.05, 'square', 0.5);
                setTimeout(() => {
                    this.createTone(800, 0.2, 'sawtooth', 0.3);
                }, 50);
                break;
            case 'heal':
                // 回復音
                this.createChord([523, 659, 784], 0.4, 'sine', 0.25); // C-E-G
                break;
            case 'critical':
                // 必殺技音
                this.createChord([400, 800, 1200], 0.2, 'square', 0.4);
                setTimeout(() => {
                    this.createChord([300, 600, 900], 0.3, 'sawtooth', 0.3);
                }, 100);
                break;
        }
    }

    // ダメージ音
    playDamageSound(isCritical = false) {
        if (isCritical) {
            this.createTone(150, 0.2, 'square', 0.4);
        } else {
            this.createTone(200, 0.15, 'triangle', 0.3);
        }
    }

    // ガード音
    playGuardSound() {
        this.createTone(400, 0.2, 'square', 0.3);
        setTimeout(() => {
            this.createTone(350, 0.15, 'sine', 0.2);
        }, 50);
    }

    // 勝利音
    playVictorySound() {
        // ファンファーレ風
        const melody = [523, 659, 784, 1047]; // C-E-G-C
        melody.forEach((freq, index) => {
            setTimeout(() => {
                this.createTone(freq, 0.3, 'sine', 0.3);
            }, index * 150);
        });
    }

    // 敗北音
    playDefeatSound() {
        // 下降音階
        const melody = [523, 466, 415, 349]; // C-A#-G#-F
        melody.forEach((freq, index) => {
            setTimeout(() => {
                this.createTone(freq, 0.4, 'triangle', 0.25);
            }, index * 200);
        });
    }

    // レベルアップ音
    playLevelUpSound() {
        // 上昇音階
        const melody = [262, 330, 392, 523, 659]; // C-E-G-C-E
        melody.forEach((freq, index) => {
            setTimeout(() => {
                this.createTone(freq, 0.25, 'sine', 0.3);
            }, index * 100);
        });
    }

    // アイテム使用音
    playItemSound(itemType) {
        switch (itemType) {
            case 'potion':
                // ゴクゴク音
                this.createTone(400, 0.1, 'sine', 0.2);
                setTimeout(() => {
                    this.createTone(350, 0.1, 'sine', 0.2);
                }, 100);
                setTimeout(() => {
                    this.createTone(400, 0.1, 'sine', 0.2);
                }, 200);
                break;
            case 'mana':
                // キラキラ音
                this.createChord([800, 1000, 1200], 0.3, 'sine', 0.2);
                break;
            case 'bomb':
                // 爆発音
                this.createTone(100, 0.1, 'square', 0.5);
                setTimeout(() => {
                    this.createTone(80, 0.3, 'sawtooth', 0.4);
                }, 50);
                break;
        }
    }

    // UI音
    playUISound(type) {
        switch (type) {
            case 'click':
                this.createTone(800, 0.05, 'sine', 0.15);
                break;
            case 'hover':
                this.createTone(1000, 0.03, 'sine', 0.1);
                break;
            case 'error':
                this.createTone(200, 0.2, 'square', 0.2);
                break;
        }
    }

    // コンボ音
    playComboSound(comboCount) {
        const baseFreq = 400;
        const freq = baseFreq + (comboCount * 50);
        this.createTone(freq, 0.1, 'sine', Math.min(0.4, 0.1 + comboCount * 0.02));
        
        if (comboCount % 5 === 0 && comboCount > 0) {
            // 5の倍数で特別音
            setTimeout(() => {
                this.createChord([freq, freq * 1.25, freq * 1.5], 0.2, 'sine', 0.25);
            }, 100);
        }
    }

    // AudioContextの再開（ユーザー操作後に必要）
    async resumeContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
    }
}

// サウンドマネージャーのインスタンスを作成
const soundManager = new SoundManager();

// 最初のユーザー操作でAudioContextを開始
document.addEventListener('click', () => {
    soundManager.resumeContext();
}, { once: true });

// RPGクラスにサウンド機能を統合
const originalBattleRPG = window.BattleRPG || class {};

class EnhancedBattleRPG extends originalBattleRPG {
    constructor() {
        super();
        this.soundManager = soundManager;
        this.addSoundToActions();
    }

    addSoundToActions() {
        // ボタンにサウンドを追加
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                this.soundManager.playUISound('hover');
            });
            
            btn.addEventListener('click', () => {
                this.soundManager.playUISound('click');
            });
        });

        // スキルオプションにもサウンドを追加
        document.querySelectorAll('.skill-option, .item-option').forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                this.soundManager.playUISound('hover');
            });
            
            btn.addEventListener('click', () => {
                this.soundManager.playUISound('click');
            });
        });
    }

    playerAttack() {
        if (!this.canPlayerAct()) return;

        const damage = this.calculateDamage(this.player.attack, this.enemy.defense);
        const isCritical = Math.random() < 0.15 + (this.player.combo * 0.05);
        const finalDamage = isCritical ? Math.floor(damage * 2) : damage;

        // サウンド再生
        if (isCritical) {
            this.soundManager.playCriticalSound();
        } else {
            this.soundManager.playAttackSound();
        }

        this.player.combo++;
        if (this.player.combo > this.player.maxCombo) {
            this.player.maxCombo = this.player.combo;
        }

        // コンボ音
        this.soundManager.playComboSound(this.player.combo);

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
            this.soundManager.playUISound('error');
            this.logMessage(`❌ MPが足りません！${skill.name}には${skill.cost}MP必要です。`);
            return;
        }

        // スキルサウンド再生
        this.soundManager.playSkillSound(skillName);

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
            const isCritical = Math.random() < 0.3;
            const finalDamage = isCritical ? Math.floor(damage * 1.5) : damage;

            this.player.combo += 2;
            if (this.player.combo > this.player.maxCombo) {
                this.player.maxCombo = this.player.combo;
            }

            // コンボ音
            this.soundManager.playComboSound(this.player.combo);

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
            this.soundManager.playUISound('error');
            this.logMessage(`❌ ${item.name}がありません！`);
            return;
        }

        // アイテムサウンド再生
        this.soundManager.playItemSound(itemName);

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

        // ガードサウンド再生
        this.soundManager.playGuardSound();

        this.player.isGuarding = true;
        this.animateCharacter('player', 'guarding');
        this.logMessage(`🛡️ ${this.player.name}は防御の構えを取った！`);
        
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
                    if (this.player.combo > 0) {
                        this.logMessage(`💔 コンボが途切れた！(最大コンボ: ${this.player.combo})`);
                        this.player.combo = 0;
                    }
                }

                // ダメージサウンド再生
                this.soundManager.playDamageSound(false);

                this.animateCharacter('enemy', 'attacking');
                this.showDamageNumber(damage, 'player', false);
                this.showEffect('💢', 'player');

                this.player.hp = Math.max(0, this.player.hp - damage);
                this.logMessage(`👹 ${this.enemy.name}の攻撃で${damage}ダメージ！`);
            } else {
                const specialDamage = Math.floor(this.enemy.attack * 1.5);
                const damage = this.calculateDamage(specialDamage, this.player.defense);
                
                // 特殊攻撃サウンド
                this.soundManager.playDamageSound(true);

                this.animateCharacter('enemy', 'attacking');
                this.showDamageNumber(damage, 'player', false);
                this.showEffect('🔥', 'player');

                this.player.hp = Math.max(0, this.player.hp - damage);
                this.logMessage(`🔥 ${this.enemy.name}の特殊攻撃で${damage}ダメージ！`);
                
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

    victory() {
        // 勝利サウンド再生
        this.soundManager.playVictorySound();

        this.isBattleActive = false;
        this.gameState.score += this.enemy.gold;
        this.gameState.exp += this.enemy.exp;
        this.gameState.battleCount++;

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
        // レベルアップサウンド再生
        this.soundManager.playLevelUpSound();

        this.player.level++;
        const hpIncrease = Math.floor(20 + Math.random() * 10);
        const mpIncrease = Math.floor(10 + Math.random() * 5);
        const attackIncrease = Math.floor(3 + Math.random() * 3);
        const defenseIncrease = Math.floor(2 + Math.random() * 2);

        this.player.maxHp += hpIncrease;
        this.player.hp = this.player.maxHp;
        this.player.maxMp += mpIncrease;
        this.player.mp = this.player.maxMp;
        this.player.attack += attackIncrease;
        this.player.defense += defenseIncrease;

        this.showEffect('⭐', 'player');
        this.logMessage(`🌟 レベルアップ！HP+${hpIncrease}, MP+${mpIncrease}, 攻撃力+${attackIncrease}, 防御力+${defenseIncrease}`);
    }

    gameOver() {
        // 敗北サウンド再生
        this.soundManager.playDefeatSound();

        this.isBattleActive = false;
        this.showResultScreen(false, false, 0);
        this.logMessage(`💀 ${this.player.name}は倒れた...`);
    }
}

// 元のBattleRPGクラスを置き換え
window.BattleRPG = EnhancedBattleRPG;