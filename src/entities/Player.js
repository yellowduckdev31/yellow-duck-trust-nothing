/**
 * Player.js
 * 
 * Player entity definition — Yellow Duck.
 * 
 * References: PROJECT_CONTEXT.md
 *   Section 06 — Player Character
 *   Section 08 — Player Stats
 *   Section 23 — Visual Style: Character Size 48x64 px
 */

import { GAME_CONFIG } from '../core/config.js';

export class Player {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x - Spawn X
   * @param {number} y - Spawn Y
   */
  constructor(scene, x, y) {
    this.scene = scene;
    this.sprite = null;

    // Player Stats (Section 08)
    this.lives = GAME_CONFIG.STARTING_LIVES;
    this.score = 0;
    this.deaths = 0;
    this.isAlive = true;
    
    this.create(x, y);
  }

  /**
   * Create the player sprite and physics body.
   */
  create(x, y) {
    // 'YD_Idle' is a spritesheet loaded in BootScene; start on frame 0
    this.sprite = this.scene.physics.add.sprite(x, y, 'YD_Idle', 0);
    
    // Set size 48x64 (Section 23)
    this.sprite.setDisplaySize(GAME_CONFIG.CHARACTER_SIZE.width, GAME_CONFIG.CHARACTER_SIZE.height);
    // Adjust physics body size (can be tweaked for better platforming feel)
    this.sprite.setSize(GAME_CONFIG.CHARACTER_SIZE.width, GAME_CONFIG.CHARACTER_SIZE.height);
    
    // Enable arcade physics properties
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setMaxVelocity(GAME_CONFIG.PHYSICS.MOVE_SPEED, 1500);
    this.sprite.setDragX(GAME_CONFIG.PHYSICS.DRAG);
    
    // Animations will be created globally in BootScene typically, 
    // but the sprite will play them here.
  }

  /**
   * Get the underlying Phaser sprite.
   * @returns {Phaser.Physics.Arcade.Sprite}
   */
  getSprite() {
    return this.sprite;
  }

  /**
   * Lose a life.
   * @returns {number} remaining lives
   */
  loseLife() {
    if (this.lives > 0) {
      this.lives--;
    }
    return this.lives;
  }

  destroy() {
    if (this.sprite) {
      this.sprite.destroy();
    }
  }
}

