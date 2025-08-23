// 🎵 超シンプル版サウンドシステム - エラー原因を排除
console.log('🎵 シンプルサウンドシステム開始...');

class SimpleSoundManager {
    constructor() {
        console.log('🎵 SimpleSoundManager コンストラクタ開始');
        this.audioContext = null;
        this.isReady = false;
        console.log('🎵 SimpleSoundManager コンストラクタ完了');
    }

    async init() {
        console.log('🎵 init() 開始');
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.isReady = true;
            console.log('🎵 AudioContext作成成功:', this.audioContext.state);
        } catch (e) {
            console.error('❌ AudioContext作成失敗:', e);
            this.isReady = false;
        }
    }

    async playSound(freq = 440, duration = 0.3) {
        console.log('🎵 playSound呼び出し:', { freq, duration, isReady: this.isReady });
        
        if (!this.isReady) {
            console.log('🎵 未初期化のため初期化実行...');
            await this.init();
        }
        
        if (!this.audioContext) {
            console.error('❌ AudioContextがありません');
            return;
        }

        if (this.audioContext.state === 'suspended') {
            console.log('🎵 AudioContext再開中...');
            await this.audioContext.resume();
        }

        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + duration);

            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + duration);

            console.log('✅ 音声再生実行完了');
        } catch (error) {
            console.error('❌ 音声再生エラー:', error);
        }
    }
}

// インスタンス作成（エラーハンドリング付き）
let simpleSoundManager = null;
try {
    console.log('🎵 SimpleSoundManager インスタンス作成開始...');
    simpleSoundManager = new SimpleSoundManager();
    console.log('✅ SimpleSoundManager インスタンス作成成功');
} catch (error) {
    console.error('❌ SimpleSoundManager インスタンス作成失敗:', error);
}

// グローバル公開（エラーハンドリング付き）
try {
    if (simpleSoundManager) {
        window.simpleSoundManager = simpleSoundManager;
        console.log('✅ window.simpleSoundManager 設定完了');
    }
} catch (error) {
    console.error('❌ グローバル設定失敗:', error);
}

// 初期化イベント（シンプル版）
document.addEventListener('click', async () => {
    if (window.simpleSoundManager && !window.simpleSoundManager.isReady) {
        console.log('🎵 ユーザークリック - 初期化開始');
        await window.simpleSoundManager.init();
        // テスト音再生
        setTimeout(() => {
            window.simpleSoundManager.playSound(523, 0.2); // C5音
        }, 100);
    }
}, { once: true });

console.log('🎵 シンプルサウンドシステム読み込み完了');