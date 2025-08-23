// 🎉 超爽快エフェクトシステム
class EffectsManager {
    constructor() {
        this.isInitialized = false;
        this.activeEffects = new Set();
        this.init();
    }

    init() {
        // CSS追加でアニメーション定義
        this.addEffectStyles();
        this.isInitialized = true;
        console.log('🎨 爽快エフェクトシステム初期化完了');
    }

    addEffectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* 剣撃エフェクト */
            @keyframes sword-slash {
                0% { transform: scale(0) rotate(-45deg); opacity: 0; }
                20% { transform: scale(1.2) rotate(-30deg); opacity: 1; }
                40% { transform: scale(1.5) rotate(-15deg); opacity: 0.8; }
                60% { transform: scale(1.8) rotate(0deg); opacity: 0.6; }
                100% { transform: scale(2.5) rotate(15deg); opacity: 0; }
            }

            /* 斬撃軌跡 */
            @keyframes slash-trail {
                0% { 
                    width: 0px; height: 2px; 
                    transform: rotate(-45deg);
                    opacity: 1;
                }
                30% { 
                    width: 120px; height: 5px; 
                    transform: rotate(-45deg);
                    opacity: 1;
                }
                70% { 
                    width: 150px; height: 4px; 
                    transform: rotate(-45deg);
                    opacity: 0.6;
                }
                100% { 
                    width: 180px; height: 2px; 
                    transform: rotate(-45deg);
                    opacity: 0;
                }
            }

            /* 爆発エフェクト */
            @keyframes explosion {
                0% { 
                    transform: scale(0); 
                    opacity: 1;
                    filter: hue-rotate(0deg);
                }
                25% { 
                    transform: scale(0.8); 
                    opacity: 1;
                    filter: hue-rotate(90deg);
                }
                50% { 
                    transform: scale(1.5); 
                    opacity: 0.8;
                    filter: hue-rotate(180deg);
                }
                75% { 
                    transform: scale(2.2); 
                    opacity: 0.4;
                    filter: hue-rotate(270deg);
                }
                100% { 
                    transform: scale(3.0); 
                    opacity: 0;
                    filter: hue-rotate(360deg);
                }
            }

            /* 血しぶきエフェクト */
            @keyframes blood-splash {
                0% { 
                    transform: scale(0) rotate(0deg); 
                    opacity: 1;
                }
                30% { 
                    transform: scale(1.2) rotate(180deg); 
                    opacity: 0.9;
                }
                70% { 
                    transform: scale(1.8) rotate(360deg); 
                    opacity: 0.5;
                }
                100% { 
                    transform: scale(2.5) rotate(540deg); 
                    opacity: 0;
                }
            }

            /* 画面振動 */
            @keyframes screen-shake {
                0%, 100% { transform: translate(0px, 0px); }
                10% { transform: translate(-2px, -1px); }
                20% { transform: translate(2px, 1px); }
                30% { transform: translate(-1px, 2px); }
                40% { transform: translate(1px, -2px); }
                50% { transform: translate(-2px, 1px); }
                60% { transform: translate(2px, -1px); }
                70% { transform: translate(-1px, -2px); }
                80% { transform: translate(1px, 2px); }
                90% { transform: translate(-2px, -1px); }
            }

            /* フラッシュエフェクト */
            @keyframes flash-white {
                0% { background: rgba(255,255,255,0); }
                50% { background: rgba(255,255,255,0.3); }
                100% { background: rgba(255,255,255,0); }
            }

            /* パーティクル飛散 */
            @keyframes particles-burst {
                0% { 
                    transform: scale(0) translate(0px, 0px); 
                    opacity: 1; 
                }
                50% { 
                    transform: scale(1) translate(var(--particle-x), var(--particle-y)); 
                    opacity: 0.8; 
                }
                100% { 
                    transform: scale(0.5) translate(calc(var(--particle-x) * 2), calc(var(--particle-y) * 2)); 
                    opacity: 0; 
                }
            }

            .effect-element {
                position: absolute;
                pointer-events: none;
                z-index: 1000;
            }

            .sword-effect {
                font-size: 60px;
                animation: sword-slash 0.6s ease-out forwards;
            }

            .slash-trail {
                background: linear-gradient(45deg, transparent, #ff6b6b, #ffa500, transparent);
                border-radius: 2px;
                animation: slash-trail 0.4s ease-out forwards;
            }

            .explosion-effect {
                font-size: 80px;
                animation: explosion 0.8s ease-out forwards;
            }

            .blood-effect {
                color: #dc2626;
                font-size: 40px;
                animation: blood-splash 0.5s ease-out forwards;
            }

            .screen-shake {
                animation: screen-shake 0.5s ease-in-out;
            }

            .flash-effect {
                position: fixed;
                top: 0; left: 0; right: 0; bottom: 0;
                animation: flash-white 0.2s ease-out;
                pointer-events: none;
                z-index: 9999;
            }

            .particle {
                width: 8px;
                height: 8px;
                background: #ff6b6b;
                border-radius: 50%;
                animation: particles-burst 1.2s ease-out forwards;
            }
        `;
        document.head.appendChild(style);
    }

    // 剣撃エフェクト
    createSwordSlashEffect(targetElement) {
        const rect = targetElement.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // 斬撃軌跡（敵の位置で直接表現）
        const trail = document.createElement('div');
        trail.className = 'effect-element slash-trail';
        trail.style.left = `${centerX - 90}px`; // 中心に配置
        trail.style.top = `${centerY - 2}px`;
        trail.style.transformOrigin = 'left center'; // 基点を左端に設定
        document.body.appendChild(trail);

        // 剣のアイコン効果（同時に表示）
        const sword = document.createElement('div');
        sword.className = 'effect-element sword-effect';
        sword.textContent = '⚔️';
        sword.style.left = `${centerX - 30}px`;
        sword.style.top = `${centerY - 30}px`;
        document.body.appendChild(sword);

        // 血しぶき（少し後で表示）
        setTimeout(() => {
            this.createBloodSplashEffect(targetElement);
        }, 150);

        // クリーンアップ
        setTimeout(() => {
            trail.remove();
            sword.remove();
        }, 600);
    }

    // 爆発エフェクト
    createExplosionEffect(targetElement, intensity = 1) {
        const rect = targetElement.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // 爆発アニメーション
        const explosion = document.createElement('div');
        explosion.className = 'effect-element explosion-effect';
        explosion.textContent = '💥';
        explosion.style.left = `${centerX - 40}px`;
        explosion.style.top = `${centerY - 40}px`;
        explosion.style.fontSize = `${80 * intensity}px`;
        document.body.appendChild(explosion);

        // パーティクル飛散
        this.createParticlesBurst(centerX, centerY, intensity);

        // 画面振動
        this.shakeScreen(intensity);

        // フラッシュ
        this.createFlashEffect();

        // クリーンアップ
        setTimeout(() => explosion.remove(), 800);
    }

    // 血しぶきエフェクト
    createBloodSplashEffect(targetElement) {
        const rect = targetElement.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        for (let i = 0; i < 5; i++) {
            const blood = document.createElement('div');
            blood.className = 'effect-element blood-effect';
            blood.textContent = '🩸';
            blood.style.left = `${centerX - 20 + Math.random() * 40}px`;
            blood.style.top = `${centerY - 20 + Math.random() * 40}px`;
            blood.style.animationDelay = `${Math.random() * 200}ms`;
            document.body.appendChild(blood);

            setTimeout(() => blood.remove(), 500 + Math.random() * 200);
        }
    }

    // パーティクル飛散
    createParticlesBurst(centerX, centerY, intensity = 1) {
        const particleCount = Math.floor(12 * intensity);
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'effect-element particle';
            
            const angle = (360 / particleCount) * i;
            const distance = 50 + Math.random() * 50;
            const x = Math.cos(angle * Math.PI / 180) * distance;
            const y = Math.sin(angle * Math.PI / 180) * distance;
            
            particle.style.setProperty('--particle-x', `${x}px`);
            particle.style.setProperty('--particle-y', `${y}px`);
            particle.style.left = `${centerX}px`;
            particle.style.top = `${centerY}px`;
            
            // ランダムな色
            const colors = ['#ff6b6b', '#ffa500', '#ffff00', '#ff1493', '#00bfff'];
            particle.style.background = colors[Math.floor(Math.random() * colors.length)];
            
            document.body.appendChild(particle);
            
            setTimeout(() => particle.remove(), 1200);
        }
    }

    // 画面振動
    shakeScreen(intensity = 1) {
        const gameContainer = document.getElementById('game-container');
        gameContainer.classList.add('screen-shake');
        gameContainer.style.animationDuration = `${0.5 / intensity}s`;
        
        setTimeout(() => {
            gameContainer.classList.remove('screen-shake');
        }, 500);
    }

    // フラッシュエフェクト
    createFlashEffect() {
        const flash = document.createElement('div');
        flash.className = 'flash-effect';
        document.body.appendChild(flash);
        
        setTimeout(() => flash.remove(), 200);
    }

    // 武器別エフェクト
    createWeaponEffect(weaponType, targetElement, isCritical = false) {
        const intensity = isCritical ? 1.5 : 1.0;
        
        switch(weaponType) {
            case 'sword':
                this.createSwordSlashEffect(targetElement);
                if (isCritical) {
                    setTimeout(() => this.createExplosionEffect(targetElement, 0.8), 300);
                }
                break;
                
            case 'axe':
                this.createExplosionEffect(targetElement, intensity);
                this.createBloodSplashEffect(targetElement);
                break;
                
            case 'club':
                // 連続打撃エフェクト
                for (let i = 0; i < 3; i++) {
                    setTimeout(() => {
                        this.createExplosionEffect(targetElement, 0.6);
                    }, i * 150);
                }
                break;
                
            case 'bow':
                // 矢が飛ぶエフェクト
                this.createArrowEffect(targetElement);
                setTimeout(() => {
                    this.createExplosionEffect(targetElement, 0.7);
                }, 400);
                break;
                
            default:
                this.createExplosionEffect(targetElement, intensity);
        }
    }

    // 矢のエフェクト
    createArrowEffect(targetElement) {
        const playerRect = document.getElementById('player-character').getBoundingClientRect();
        const targetRect = targetElement.getBoundingClientRect();
        
        const arrow = document.createElement('div');
        arrow.textContent = '🏹';
        arrow.style.position = 'absolute';
        arrow.style.fontSize = '30px';
        arrow.style.left = `${playerRect.right}px`;
        arrow.style.top = `${playerRect.top + playerRect.height / 2}px`;
        arrow.style.transition = 'all 0.4s ease-out';
        arrow.style.zIndex = '1000';
        document.body.appendChild(arrow);
        
        // 矢が飛ぶ
        setTimeout(() => {
            arrow.style.left = `${targetRect.left}px`;
            arrow.style.top = `${targetRect.top + targetRect.height / 2}px`;
            arrow.style.transform = 'rotate(45deg) scale(0.5)';
        }, 50);
        
        setTimeout(() => arrow.remove(), 500);
    }

    // スキルエフェクト
    createSkillEffect(skillName, targetElement, isCritical = false) {
        const effects = {
            fire: () => {
                this.createFireEffect(targetElement);
                this.createExplosionEffect(targetElement, 1.2);
            },
            ice: () => {
                this.createIceEffect(targetElement);
                this.shakeScreen(0.5);
            },
            thunder: () => {
                this.createThunderEffect(targetElement);
                this.createFlashEffect();
                this.shakeScreen(1.2);
            },
            heal: () => {
                this.createHealEffect(targetElement);
            }
        };
        
        if (effects[skillName]) {
            effects[skillName]();
        } else {
            this.createExplosionEffect(targetElement, isCritical ? 1.5 : 1.0);
        }
    }

    // 炎エフェクト
    createFireEffect(targetElement) {
        const rect = targetElement.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        for (let i = 0; i < 8; i++) {
            const flame = document.createElement('div');
            flame.textContent = '🔥';
            flame.className = 'effect-element';
            flame.style.left = `${centerX - 15 + Math.random() * 30}px`;
            flame.style.top = `${centerY - 15 + Math.random() * 30}px`;
            flame.style.fontSize = '40px';
            flame.style.animation = `explosion 0.8s ease-out ${Math.random() * 200}ms forwards`;
            document.body.appendChild(flame);

            setTimeout(() => flame.remove(), 1000);
        }
    }

    // 氷エフェクト
    createIceEffect(targetElement) {
        const rect = targetElement.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        for (let i = 0; i < 6; i++) {
            const ice = document.createElement('div');
            ice.textContent = '❄️';
            ice.className = 'effect-element';
            ice.style.left = `${centerX - 20 + Math.random() * 40}px`;
            ice.style.top = `${centerY - 20 + Math.random() * 40}px`;
            ice.style.fontSize = '35px';
            ice.style.animation = `blood-splash 1.0s ease-out ${Math.random() * 300}ms forwards`;
            document.body.appendChild(ice);

            setTimeout(() => ice.remove(), 1300);
        }
    }

    // 雷エフェクト
    createThunderEffect(targetElement) {
        const rect = targetElement.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // 雷撃
        const thunder = document.createElement('div');
        thunder.textContent = '⚡';
        thunder.className = 'effect-element';
        thunder.style.left = `${centerX - 25}px`;
        thunder.style.top = `${centerY - 50}px`;
        thunder.style.fontSize = '70px';
        thunder.style.animation = 'explosion 0.6s ease-out forwards';
        document.body.appendChild(thunder);

        setTimeout(() => thunder.remove(), 600);
    }

    // 回復エフェクト
    createHealEffect(targetElement) {
        const rect = targetElement.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        for (let i = 0; i < 5; i++) {
            const sparkle = document.createElement('div');
            sparkle.textContent = '✨';
            sparkle.className = 'effect-element';
            sparkle.style.left = `${centerX - 15 + Math.random() * 30}px`;
            sparkle.style.top = `${centerY - 30 + Math.random() * 60}px`;
            sparkle.style.fontSize = '30px';
            sparkle.style.animation = `particles-burst 1.5s ease-out ${Math.random() * 500}ms forwards`;
            sparkle.style.setProperty('--particle-x', '0px');
            sparkle.style.setProperty('--particle-y', '-50px');
            document.body.appendChild(sparkle);

            setTimeout(() => sparkle.remove(), 2000);
        }
    }
}

// グローバルインスタンス作成
const effectsManager = new EffectsManager();
window.effectsManager = effectsManager;

console.log('🎨 超爽快エフェクトシステム読み込み完了');