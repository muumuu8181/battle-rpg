// 🎵 RPG用サウンドシステム（修正版）
console.log('🎵 RPG用サウンドシステム読み込み開始...');

class SoundManager {
    constructor() {
        console.log('🎵 SoundManager コンストラクタ開始');
        this.audioContext = null;
        this.isEnabled = false;
        this.isUserInteracted = false;
        console.log('🎵 SoundManager コンストラクタ完了');
    }

    async init() {
        console.log('🎵 SoundManager init() 開始');
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.isEnabled = true;
            console.log('🎵 AudioContext作成成功:', this.audioContext.state);
        } catch (e) {
            console.error('❌ AudioContext作成失敗:', e);
            this.isEnabled = false;
        }
    }

    async ensureReady() {
        if (!this.isEnabled) {
            await this.init();
        }
        
        if (this.audioContext && this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
            this.isUserInteracted = true;
        }
    }

    async createTone(frequency, duration, type = 'sine', volume = 0.3) {
        await this.ensureReady();
        
        if (!this.isEnabled || !this.audioContext) {
            console.warn('🔇 AudioContext無効');
            return;
        }

        try {
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

        } catch (error) {
            console.error('❌ 音声再生エラー:', error);
        }
    }

    createChord(frequencies, duration, type = 'sine', volume = 0.2) {
        frequencies.forEach(freq => {
            this.createTone(freq, duration, type, volume);
        });
    }

    // 攻撃音
    playAttackSound() {
        this.createTone(800, 0.1, 'sawtooth', 0.4);
        setTimeout(() => {
            this.createTone(600, 0.1, 'square', 0.3);
        }, 50);
    }

    // 弓攻撃音
    playBowSound() {
        // 弦を引く音
        this.createTone(200, 0.05, 'sawtooth', 0.3);
        setTimeout(() => {
            // 矢の飛ぶ音
            this.createTone(800, 0.3, 'sine', 0.2);
            // 風切り音
            setTimeout(() => {
                this.createTone(1200, 0.1, 'triangle', 0.15);
            }, 100);
        }, 60);
    }

    // クリティカル攻撃音
    playCriticalSound() {
        this.createChord([800, 1200, 1600], 0.15, 'sawtooth', 0.3);
        setTimeout(() => {
            this.createChord([600, 900, 1200], 0.15, 'square', 0.2);
        }, 75);
    }

    // スキル音
    playSkillSound(skillType) {
        switch (skillType) {
            case 'fire':
                this.createTone(300, 0.3, 'sawtooth', 0.3);
                setTimeout(() => {
                    this.createTone(250, 0.2, 'triangle', 0.2);
                }, 100);
                break;
            case 'thunder':
                this.createTone(1500, 0.05, 'square', 0.5);
                setTimeout(() => {
                    this.createTone(800, 0.2, 'sawtooth', 0.3);
                }, 50);
                break;
            case 'ice':
                this.createChord([800, 600, 400], 0.4, 'sine', 0.25);
                setTimeout(() => {
                    this.createTone(200, 0.3, 'triangle', 0.2);
                }, 150);
                break;
            case 'heal':
                this.createChord([523, 659, 784], 0.4, 'sine', 0.25); // C-E-G
                break;
            case 'shield':
                this.createTone(400, 0.3, 'square', 0.3);
                setTimeout(() => {
                    this.createChord([350, 450, 550], 0.2, 'sine', 0.2);
                }, 100);
                break;
            case 'drain':
                this.createTone(150, 0.4, 'sawtooth', 0.3);
                setTimeout(() => {
                    this.createTone(300, 0.2, 'sine', 0.25);
                }, 200);
                break;
            case 'bless':
                this.createChord([523, 659, 784, 1047], 0.5, 'sine', 0.2);
                break;
            case 'critical':
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
        const melody = [523, 659, 784, 1047]; // C-E-G-C
        melody.forEach((freq, index) => {
            setTimeout(() => {
                this.createTone(freq, 0.3, 'sine', 0.3);
            }, index * 150);
        });
    }

    // 敗北音
    playDefeatSound() {
        const melody = [523, 466, 415, 349]; // C-A#-G#-F
        melody.forEach((freq, index) => {
            setTimeout(() => {
                this.createTone(freq, 0.4, 'triangle', 0.25);
            }, index * 200);
        });
    }

    // レベルアップ音
    playLevelUpSound() {
        const melody = [262, 330, 392, 523, 659]; // C-E-G-C-E
        melody.forEach((freq, index) => {
            setTimeout(() => {
                this.createTone(freq, 0.25, 'sine', 0.3);
            }, index * 100);
        });
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
            setTimeout(() => {
                this.createChord([freq, freq * 1.25, freq * 1.5], 0.2, 'sine', 0.25);
            }, 100);
        }
    }

    // アイテム使用音
    playItemSound(itemType) {
        switch (itemType) {
            case 'potion':
                this.createTone(400, 0.1, 'sine', 0.2);
                setTimeout(() => {
                    this.createTone(350, 0.1, 'sine', 0.2);
                }, 100);
                setTimeout(() => {
                    this.createTone(400, 0.1, 'sine', 0.2);
                }, 200);
                break;
            case 'mana':
                this.createChord([800, 1000, 1200], 0.3, 'sine', 0.2);
                break;
            case 'bomb':
                this.createTone(100, 0.1, 'square', 0.5);
                setTimeout(() => {
                    this.createTone(80, 0.3, 'sawtooth', 0.4);
                }, 50);
                break;
        }
    }
}

// インスタンス作成（エラーハンドリング付き）
let soundManager = null;
try {
    console.log('🎵 SoundManager インスタンス作成開始...');
    soundManager = new SoundManager();
    window.soundManager = soundManager;
    console.log('✅ window.soundManager 設定完了');
} catch (error) {
    console.error('❌ SoundManager インスタンス作成失敗:', error);
}

// ユーザー操作での初期化（シンプル版）
document.addEventListener('click', async () => {
    if (window.soundManager && !window.soundManager.isUserInteracted) {
        console.log('🎵 ユーザークリック - 初期化開始');
        await window.soundManager.ensureReady();
        console.log('✅ サウンドシステム初期化完了');
    }
}, { once: false });

console.log('🎵 RPG用サウンドシステム読み込み完了');