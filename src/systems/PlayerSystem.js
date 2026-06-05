/**
 * PlayerSystem.js
 * 
 * Manages player movement, state, and physics.
 * 
 * References: PROJECT_CONTEXT.md
 *   Section 06 — Player Character
 *   Section 29 — Physics: Speed 220, Jump -450
 *   Section 31 — Systems: PlayerSystem
 */

import { GAME_CONFIG } from '../core/config.js';
import { Player } from '../entities/Player.js';

export class PlayerSystem {
  /**
   * @param {Phaser.Scene} scene - The active scene
   */
  constructor(scene) {
    this.scene = scene;
    this.player = null;
  }

  /**
   * Create the player entity and sprite at the given spawn point.
   * @param {number} x
   * @param {number} y
   */
  createPlayer(x, y) {
    this.player = new Player(this.scene, x, y);
  }

  /**
   * Get the player entity.
   * @returns {Player}
   */
  getPlayer() {
    return this.player;
  }

  /**
   * Update player movement based on input.
   * @param {object} input - Input state from InputSystem
   */
  update(input) {
    if (!this.player || !this.player.isAlive) return;
    
    const sprite = this.player.getSprite();
    const isGrounded = sprite.body.blocked.down || sprite.body.touching.down;

    // Horizontal Movement
    if (input.left) {
      sprite.setAccelerationX(-GAME_CONFIG.PHYSICS.ACCELERATION);
      sprite.setFlipX(true);
      // if (isGrounded) sprite.anims.play('walk', true);
    } else if (input.right) {
      sprite.setAccelerationX(GAME_CONFIG.PHYSICS.ACCELERATION);
      sprite.setFlipX(false);
      // if (isGrounded) sprite.anims.play('walk', true);
    } else {
      sprite.setAccelerationX(0);
      // if (isGrounded) sprite.anims.play('idle', true);
    }

    // Jumping
    if (input.jump && isGrounded) {
      sprite.setVelocityY(GAME_CONFIG.PHYSICS.JUMP_FORCE);
    }

    // Mid-air animations
    if (!isGrounded) {
      if (sprite.body.velocity.y < 0) {
        // sprite.anims.play('jump', true);
      } else {
        // sprite.anims.play('fall', true);
      }
    }
  }

  /**
   * Handle player death logic.
   * @returns {number} Remaining lives
   */
  die() {
    if (!this.player || !this.player.isAlive) return this.player ? this.player.lives : 0;

    this.player.isAlive = false;
    this.player.deaths++;
    const remainingLives = this.player.loseLife();

    const sprite = this.player.getSprite();
    sprite.setVelocity(0, 0);
    sprite.body.allowGravity = false; // Stop falling during death sequence
    // sprite.anims.play('death', true);

    return remainingLives;
  }

  /**
   * Respawn player at position.
   * @param {number} x
   * @param {number} y
   */
  respawn(x, y) {
    if (!this.player) return;

    this.player.isAlive = true;

    const sprite = this.player.getSprite();
    sprite.setPosition(x, y);
    sprite.setVelocity(0, 0);
    sprite.body.allowGravity = true;
    sprite.setAlpha(1); // Reset alpha in case of fade effects
    // sprite.anims.play('idle', true);

    // Optional: Add brief invincibility/flicker effect here
  }

  destroy() {
    if (this.player) {
      this.player.destroy();
      this.player = null;
    }
  }
}

