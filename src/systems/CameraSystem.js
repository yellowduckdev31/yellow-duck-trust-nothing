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
    if (levelBounds) {
      this.scene.cameras.main.setBounds(0, 0, levelBounds.width, levelBounds.height);
    }
    this.scene.cameras.main.startFollow(player, true, GAME_CONFIG.CAMERA.LERP, GAME_CONFIG.CAMERA.LERP);
    this.scene.cameras.main.setZoom(GAME_CONFIG.CAMERA.ZOOM);
  }

  /**
   * Trigger screen shake (used in death sequence).
   * @param {number} duration - Shake duration in ms
   * @param {number} intensity - Shake intensity
   */
  shake(duration = 100, intensity = 0.01) {
    this.scene.cameras.main.shake(duration, intensity);
  }

  /**
   * Flash the camera (used for effects).
   * @param {number} duration
   */
  flash(duration = 200) {
    this.scene.cameras.main.flash(duration);
  }

  /**
   * Fade camera (used in death/transition).
   * @param {number} duration
   * @param {Function} onComplete
   */
  fadeOut(duration = 300, onComplete) {
    this.scene.cameras.main.fadeOut(duration);
    this.scene.cameras.main.once('camerafadeoutcomplete', () => {
      if (onComplete) onComplete();
    });
  }

  fadeIn(duration = 300) {
    this.scene.cameras.main.fadeIn(duration);
  }
}
