// サウンドエフェクトシステム（強化版）
class SoundManager {
    constructor() {
        this.audioContext = null;
        this.isEnabled = false;
        this.isUserInteracted = false;
        this.debugMode = true;
        this.init();
    }

    async init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.isEnabled = true;
            if (this.debugMode) {
                console.log('🎵 AudioContext 作成成功', {
                    state: this.audioContext.state,
                    sampleRate: this.audioContext.sampleRate
                });
            }
        } catch (e) {
            console.error('❌ Web Audio API not supported:', e);
            this.isEnabled = false;
        }
    }

    // 基本的な音の生成（強化版）
    createTone(frequency, duration, type = 'sine', volume = 0.3) {
        if (!this.isEnabled || !this.audioContext) {
            if (this.debugMode) console.warn('🔇 AudioContext無効', { enabled: this.isEnabled, context: !!this.audioContext });
            return;
        }

        // AudioContext が suspended の場合の処理
        if (this.audioContext.state === 'suspended') {
            if (this.debugMode) console.warn('⏸️ AudioContext suspended - ユーザー操作が必要です');
            this.resumeContext().then(() => {
                // 再帰的に再実行
                this.createTone(frequency, duration, type, volume);
            });
            return;
        }

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
            
            if (this.debugMode) {
                console.log('🎵 音声再生', { frequency, duration, type, volume, contextState: this.audioContext.state });
            }
        } catch (error) {
            console.error('❌ 音声再生エラー:', error);
        }
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
            case 'ice':
                // 氷の音
                this.createChord([800, 600, 400], 0.4, 'sine', 0.25);
                setTimeout(() => {
                    this.createTone(200, 0.3, 'triangle', 0.2);
                }, 150);
                break;
            case 'heal':
                // 回復音
                this.createChord([523, 659, 784], 0.4, 'sine', 0.25); // C-E-G
                break;
            case 'shield':
                // シールド音
                this.createTone(400, 0.3, 'square', 0.3);
                setTimeout(() => {
                    this.createChord([350, 450, 550], 0.2, 'sine', 0.2);
                }, 100);
                break;
            case 'drain':
                // ドレイン音
                this.createTone(150, 0.4, 'sawtooth', 0.3);
                setTimeout(() => {
                    this.createTone(300, 0.2, 'sine', 0.25);
                }, 200);
                break;
            case 'bless':
                // ブレス音
                this.createChord([523, 659, 784, 1047], 0.5, 'sine', 0.2);
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

    // AudioContextの再開（ユーザー操作後に必要）（強化版）
    async resumeContext() {
        if (!this.audioContext) {
            if (this.debugMode) console.warn('🔇 AudioContext が存在しません - 再初期化を試行');
            await this.init();
            return;
        }
        
        if (this.audioContext.state === 'suspended') {
            try {
                await this.audioContext.resume();
                this.isUserInteracted = true;
                if (this.debugMode) {
                    console.log('🎵 AudioContext 再開成功', { 
                        state: this.audioContext.state,
                        userInteracted: this.isUserInteracted 
                    });
                }
            } catch (error) {
                console.error('❌ AudioContext 再開失敗:', error);
            }
        } else {
            if (this.debugMode) {
                console.log('🎵 AudioContext 状態', { state: this.audioContext.state });
            }
        }
    }
}

// サウンドマネージャーのインスタンスを作成（グローバル公開）
const soundManager = new SoundManager();
window.soundManager = soundManager; // グローバル公開

// 最初のユーザー操作でAudioContextを開始（強化版）
let audioInitialized = false;
let initAttempts = 0;
const maxInitAttempts = 5;

const initializeAudio = async (eventType) => {
    initAttempts++;
    if (soundManager.debugMode) {
        console.log(`🎵 初期化試行 #${initAttempts} (${eventType})`);
    }
    
    if (!audioInitialized && initAttempts <= maxInitAttempts) {
        try {
            await soundManager.resumeContext();
            audioInitialized = true;
            console.log('🎵 AudioContext 初期化完了 via', eventType);
            
            // テスト音を再生
            setTimeout(() => {
                soundManager.createTone(440, 0.1, 'sine', 0.1);
            }, 100);
            
        } catch (error) {
            console.error('❌ AudioContext 初期化失敗 via', eventType, error);
        }
    }
};

// より多くのイベントで初期化を試行
const events = ['click', 'keydown', 'keyup', 'mousedown', 'mouseup', 'touchstart', 'touchend'];
events.forEach(eventType => {
    document.addEventListener(eventType, () => initializeAudio(eventType), { once: false });
});

// ゲーム固有のボタンクリックでも初期化を試行
setTimeout(() => {
    const gameButtons = ['attack-btn', 'skill-btn', 'guard-btn', 'item-btn'];
    gameButtons.forEach(buttonId => {
        const button = document.getElementById(buttonId);
        if (button) {
            button.addEventListener('click', () => initializeAudio(`${buttonId}-click`), { once: false });
        }
    });
}, 1000);

// サウンドシステムを利用可能にするためのユーティリティ
// (ゲームクラスは script.js で定義)
console.log('🎵 サウンドシステム読み込み完了');