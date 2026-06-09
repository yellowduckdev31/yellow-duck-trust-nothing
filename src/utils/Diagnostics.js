/**
 * Diagnostics.js
 * 
 * Provides real-time runtime diagnostics instrumentation:
 *   - Performance logging (FPS, Frame Delta stats, JS Heap size)
 *   - Gameplay event logging (movement state transitions, death, respawn, animation plays)
 *   - Error capture (window errors, promise rejections, scene lifecycle errors, animation failures)
 *
 * All hooks are non-invasive monkeypatches — no gameplay mechanics are modified.
 */

export class Diagnostics {
  static isInitialized = false;

  // Frame delta accumulator for 1s metric windows
  static _frameDeltas = [];
  static _frameCount = 0;
  static _lastFrameCount = 0;

  static initialize() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // ─── 1. Global Error Capture ───────────────────────────────────────

    window.addEventListener('error', (event) => {
      this.error(`Uncaught error: ${event.message}`, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error ? event.error.stack : null
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.error(`Unhandled Promise Rejection: ${event.reason}`);
    });

    // ─── 2. Phaser Game Step Hook ──────────────────────────────────────
    // Intercept the Phaser.Game constructor so we can attach to the
    // game loop's POST_STEP event for per-frame delta tracking.

    this._hookPhaserGame();

    // ─── 3. Scene Lifecycle Error Capture ──────────────────────────────
    // Wrap SceneManager.bootScene so every scene's init/preload/create/update
    // methods are wrapped in try-catch automatically.

    this._hookSceneManager();

    // ─── 4. Animation Play Interception ────────────────────────────────
    // Intercept AnimationState.prototype.play to log every animation play
    // event and catch missing-key errors globally.

    this._hookAnimationPlay();

    // ─── 5. Metrics Reporting Loop (every 1s) ──────────────────────────

    setInterval(() => {
      this._reportMetrics();
    }, 1000);

    this.event('Diagnostics Instrumentation Layer initialized');
  }

  // ═══════════════════════════════════════════════════════════════════════
  // Phaser.Game step hook
  // ═══════════════════════════════════════════════════════════════════════

  static _hookPhaserGame() {
    const diag = this;

    // Wait for the Phaser global to exist (loaded via CDN script tag)
    const tryHook = () => {
      if (typeof Phaser === 'undefined') {
        // Phaser not loaded yet — retry on next tick
        setTimeout(tryHook, 50);
        return;
      }

      // Wrap the Game constructor to attach our step listener
      const OriginalGame = Phaser.Game;

      Phaser.Game = function (...args) {
        const game = new OriginalGame(...args);

        // Attach to POST_STEP — fires after all scene updates each frame
        game.events.on('poststep', (_time, delta) => {
          diag._frameDeltas.push(delta);
          diag._frameCount++;
        });

        // Also listen for loader errors on every scene that boots
        game.events.on('step', () => {
          // Capture a reference to the game for metrics reporting
          diag._gameRef = game;
        });

        diag._gameRef = game;
        diag.event('Phaser Game instance captured by Diagnostics');

        return game;
      };

      // Copy static properties / prototype so instanceof still works
      Object.setPrototypeOf(Phaser.Game, OriginalGame);
      Phaser.Game.prototype = OriginalGame.prototype;
    };

    tryHook();
  }

  // ═══════════════════════════════════════════════════════════════════════
  // SceneManager.bootScene — scene lifecycle error wrapping
  // ═══════════════════════════════════════════════════════════════════════

  static _hookSceneManager() {
    const diag = this;

    const tryHook = () => {
      if (typeof Phaser === 'undefined' || !Phaser.Scenes || !Phaser.Scenes.SceneManager) {
        setTimeout(tryHook, 50);
        return;
      }

      const origBoot = Phaser.Scenes.SceneManager.prototype.bootScene;

      Phaser.Scenes.SceneManager.prototype.bootScene = function (scene) {
        // Wrap lifecycle methods in error-capturing proxies
        const methodsToWrap = ['init', 'preload', 'create', 'update'];

        for (const method of methodsToWrap) {
          if (typeof scene[method] === 'function' && !scene[method].__diagWrapped) {
            const original = scene[method];
            const sceneKey = scene.sys ? scene.sys.settings.key : 'unknown';

            scene[method] = function (...args) {
              try {
                return original.apply(this, args);
              } catch (err) {
                diag.error(`Scene "${sceneKey}" threw in ${method}()`, {
                  scene: sceneKey,
                  method,
                  message: err.message,
                  stack: err.stack
                });
                // Re-throw so Phaser's own handling isn't silently swallowed
                throw err;
              }
            };

            scene[method].__diagWrapped = true;
          }
        }

        // Hook into loader error events for this scene
        if (scene.load && typeof scene.load.on === 'function') {
          scene.load.on('loaderror', (file) => {
            diag.error(`Asset load failed`, {
              scene: scene.sys ? scene.sys.settings.key : 'unknown',
              fileKey: file.key,
              fileType: file.type,
              url: file.url
            });
          });
        }

        // Call original bootScene
        return origBoot.call(this, scene);
      };
    };

    tryHook();
  }

  // ═══════════════════════════════════════════════════════════════════════
  // AnimationState.prototype.play — animation event & error logging
  // ═══════════════════════════════════════════════════════════════════════

  static _hookAnimationPlay() {
    const diag = this;

    const tryHook = () => {
      if (typeof Phaser === 'undefined') {
        setTimeout(tryHook, 50);
        return;
      }

      // Phaser 3.50+ uses Phaser.Animations.AnimationState
      // Earlier versions use Phaser.GameObjects.Components.Animation
      const AnimState =
        (Phaser.Animations && Phaser.Animations.AnimationState) ||
        (Phaser.GameObjects && Phaser.GameObjects.Components && Phaser.GameObjects.Components.Animation);

      if (!AnimState || !AnimState.prototype || !AnimState.prototype.play) {
        diag.error('Could not locate Phaser AnimationState prototype to hook');
        return;
      }

      const origPlay = AnimState.prototype.play;

      AnimState.prototype.play = function (key, ignoreIfPlaying, startFrame) {
        const animKey = (typeof key === 'string') ? key : (key && key.key ? key.key : String(key));

        try {
          const result = origPlay.call(this, key, ignoreIfPlaying, startFrame);

          // Only log when the animation actually changes (avoid spam)
          const currentKey = this.getName ? this.getName() : (this.currentAnim ? this.currentAnim.key : null);
          if (currentKey === animKey) {
            diag.event('Animation played', { key: animKey });
          }

          return result;
        } catch (err) {
          diag.error(`Animation play failed for key "${animKey}"`, {
            key: animKey,
            message: err.message,
            stack: err.stack
          });
          throw err;
        }
      };
    };

    tryHook();
  }

  // ═══════════════════════════════════════════════════════════════════════
  // Metrics reporter — runs every 1s
  // ═══════════════════════════════════════════════════════════════════════

  static _reportMetrics() {
    const game = this._gameRef;
    if (!game || !game.loop) return;

    const actualFps = Math.round(game.loop.actualFps || 0);
    const currentFrame = game.loop.frame || 0;
    const framesElapsed = this._frameCount - this._lastFrameCount;
    this._lastFrameCount = this._frameCount;

    // Delta statistics from accumulated frame deltas
    let deltaAvg = 0;
    let deltaMin = 0;
    let deltaMax = 0;

    if (this._frameDeltas.length > 0) {
      const deltas = this._frameDeltas;
      const sum = deltas.reduce((a, b) => a + b, 0);
      deltaAvg = (sum / deltas.length).toFixed(2);
      deltaMin = Math.min(...deltas).toFixed(2);
      deltaMax = Math.max(...deltas).toFixed(2);
    }

    // Clear accumulator for next window
    this._frameDeltas = [];

    // Memory snapshot (Chrome-only)
    const memory = (window.performance && window.performance.memory)
      ? `${Math.round(window.performance.memory.usedJSHeapSize / 1024 / 1024)} MB`
      : 'N/A';

    this.metric(
      `FPS: ${actualFps} | Frames: ${currentFrame} (+${framesElapsed}) | ` +
      `Delta Avg: ${deltaAvg}ms Min: ${deltaMin}ms Max: ${deltaMax}ms | ` +
      `Heap: ${memory}`
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // Structured log API
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Log a structured metric.
   * Format: [METRIC] [Timestamp] Message | Data
   */
  static metric(message, data = null) {
    this.log('METRIC', message, data);
  }

  /**
   * Log a structured event.
   * Format: [EVENT] [Timestamp] Message | Data
   */
  static event(message, data = null) {
    this.log('EVENT', message, data);
  }

  /**
   * Log a structured error.
   * Format: [ERROR] [Timestamp] Message | Data
   */
  static error(message, data = null) {
    this.log('ERROR', message, data);
  }

  /**
   * Private structured logger.
   */
  static log(category, message, data = null) {
    const timestamp = new Date().toISOString();
    const dataStr = data ? ` | Data: ${JSON.stringify(data)}` : '';
    console.log(`[${category}] [${timestamp}] ${message}${dataStr}`);
  }
}
