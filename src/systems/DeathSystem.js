/**
 * DeathSystem.js
 * 
 * Manages the death sequence and respawn.
 * 
 * References: PROJECT_CONTEXT.md
 *   Section 11 — Death System
 *   Section 12 — Funny Death Messages (100 minimum)
 *   Section 31 — Systems: DeathSystem
 */

import { GAME_CONFIG, COLORS_HEX } from '../core/config.js';
import { UIHelper } from '../ui/UIHelper.js';
import { DEATH_MESSAGES } from '../data/DeathMessages.js';

export class DeathSystem {
  /**
   * @param {Phaser.Scene} scene - The active scene
   */
  constructor(scene) {
    this.scene = scene;
    
    this.deathMessages = DEATH_MESSAGES;
    this.isDead = false;

    // UI Element for death message
    this.messageText = UIHelper.createText(
      this.scene, 
      this.scene.scale.width / 2, 
      this.scene.scale.height / 2 - 50, 
      '', 
      32, 
      COLORS_HEX.SPIKE_RED
    )
    .setScrollFactor(0)
    .setDepth(3000)
    .setOrigin(0.5)
    .setVisible(false);

    // Dark overlay for emphasis
    this.overlay = this.scene.add.rectangle(
      0, 0, this.scene.scale.width, this.scene.scale.height, 0x000000, 0.5
    )
    .setOrigin(0)
    .setScrollFactor(0)
    .setDepth(2999)
    .setVisible(false);
  }

  /**
   * Execute the death sequence (Section 11).
   * 
   * Timeline (Target: 800ms total):
   *   0ms: Freeze physics, emit particles, screen shake, show message.
   *   200ms: Unfreeze (optional, but keep player static), begin fade to black.
   *   450ms: Screen is black. Call onComplete (Respawns player, resets state).
   *   450ms-800ms: Fade in. Hide message.
   * 
   * @param {string} deathType - 'spike' | 'fall' | 'trap' | 'fakeExit'
   * @param {Function} onComplete - Callback after respawn
   */
  execute(deathType, playerSprite, onComplete) {
    if (this.isDead) return;
    this.isDead = true;

    // 1. Freeze Frame
    this.scene.physics.world.isPaused = true;

    // 2. Screen Shake (Intensity 0.02, Duration 200ms)
    this.scene.cameras.main.shake(200, 0.02);

    // 3. Particle Effect
    if (playerSprite) {
      // Simple burst of red/yellow boxes representing feathers/blood
      const emitter = this.scene.add.particles(playerSprite.x, playerSprite.y, 'UI_HeartFull', {
        speed: { min: 100, max: 300 },
        angle: { min: 0, max: 360 },
        scale: { start: 0.5, end: 0 },
        blendMode: 'ADD',
        lifespan: 500,
        gravityY: 500,
        quantity: 15
      });
      // Destroy emitter after it finishes
      this.scene.time.delayedCall(500, () => {
        emitter.destroy();
      });
    }

    // 4. Funny Death Message
    this.overlay.setVisible(true);
    this.messageText.setText(this.getDeathMessage());
    this.messageText.setVisible(true);

    // 5 & 6. Fade and Respawn Sequence
    this.scene.time.delayedCall(200, () => {
      // Fade out camera over 250ms
      this.scene.cameras.main.fadeOut(250, 0, 0, 0);

      this.scene.time.delayedCall(250, () => {
        // Now at 450ms total. Screen is black.
        // Execute the respawn logic (reset positions, camera, etc.)
        if (onComplete) onComplete();
        
        // Unpause physics
        this.scene.physics.world.isPaused = false;
        
        // Hide UI
        this.overlay.setVisible(false);
        this.messageText.setVisible(false);
        
        // Fade in camera over 350ms (Total: 450 + 350 = 800ms)
        this.scene.cameras.main.fadeIn(350, 0, 0, 0);
        
        this.scene.time.delayedCall(350, () => {
          this.isDead = false;
        });
      });
    });
  }

  /**
   * Get a random funny death message (Section 12).
   * @returns {string}
   */
  getDeathMessage() {
    const idx = Phaser.Math.Between(0, this.deathMessages.length - 1);
    return this.deathMessages[idx];
  }

  destroy() {
    if (this.messageText) this.messageText.destroy();
    if (this.overlay) this.overlay.destroy();
    this.deathMessages = [];
  }
}

