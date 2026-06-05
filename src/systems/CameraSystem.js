/**
 * CameraSystem.js
 * 
 * Manages camera behavior.
 * 
 * References: PROJECT_CONTEXT.md
 *   Section 28 — Camera: Follow Player, Lerp 0.15, Zoom 1, Screen Shake
 *   Section 31 — Systems: CameraSystem
 */

import { GAME_CONFIG } from '../core/config.js';

export class CameraSystem {
  /**
   * @param {Phaser.Scene} scene - The active scene
   */
  constructor(scene) {
    this.scene = scene;
  }

  /**
   * Setup camera to follow the player.
   * @param {Phaser.Physics.Arcade.Sprite} player
   * @param {object} levelBounds - { width, height }
   */
  setup(player, levelBounds) {
    // TODO: Set camera bounds to level size
    // TODO: Start following player with lerp 0.15
    // TODO: Set zoom to 1
  }

  /**
   * Trigger screen shake (used in death sequence).
   * @param {number} duration - Shake duration in ms
   * @param {number} intensity - Shake intensity
   */
  shake(duration = 100, intensity = 0.01) {
    // TODO: this.scene.cameras.main.shake(duration, intensity)
  }

  /**
   * Flash the camera (used for effects).
   * @param {number} duration
   */
  flash(duration = 200) {
    // TODO: this.scene.cameras.main.flash(duration)
  }

  /**
   * Fade camera (used in death/transition).
   * @param {number} duration
   * @param {Function} onComplete
   */
  fadeOut(duration = 300, onComplete) {
    // TODO: this.scene.cameras.main.fadeOut(duration)
    // TODO: Call onComplete when done
  }

  fadeIn(duration = 300) {
    // TODO: this.scene.cameras.main.fadeIn(duration)
  }
}
