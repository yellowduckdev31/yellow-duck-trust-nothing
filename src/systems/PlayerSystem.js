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
import { Diagnostics } from '../utils/Diagnostics.js';

export class PlayerSystem {
  /**
   * @param {Phaser.Scene} scene - The active scene
   */
  constructor(scene) {
    this.scene = scene;
    this.player = null;
    this.lastMoveState = 'idle';
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

  playAnimationSafe(sprite, animKey, ignoreIfPlaying = true) {
    if (!sprite || !sprite.anims) return;
    
    // Check if the animation exists globally in the scene's anims manager
    if (this.scene.anims.exists(animKey)) {
      sprite.anims.play(animKey, ignoreIfPlaying);
    } else {
      console.warn(`Animation '${animKey}' does not exist. Falling back.`);
      // Fallback to idle if possible, otherwise stop anims
      if (animKey !== 'idle' && this.scene.anims.exists('idle')) {
        sprite.anims.play('idle', ignoreIfPlaying);
      } else {
        sprite.anims.stop();
      }
    }
  }

  /**
   * Update player movement based on input.
   * @param {object} input - Input state from InputSystem
   */
  update(input) {
    if (!this.player || !this.player.isAlive) return;
    
    console.log('Player update running');

    const sprite = this.player.getSprite();

    // Clamp player X position to prevent moving backward beyond starting area
    if (this.startX !== undefined && sprite.x < this.startX) {
      sprite.x = this.startX;
      if (sprite.body.velocity.x < 0) {
        sprite.body.setVelocityX(0);
        sprite.body.setAccelerationX(0);
      }
    }

    const isGrounded = sprite.body.blocked.down || sprite.body.touching.down;

    // Track logical movement state transitions to avoid spamming every frame
    let state = 'idle';
    if (input.left) {
      state = 'walk_left';
    } else if (input.right) {
      state = 'walk_right';
    }
    if (!isGrounded) {
      state = sprite.body.velocity.y < 0 ? 'jump' : 'fall';
    }

    if (state !== this.lastMoveState) {
      Diagnostics.event('Player movement state changed', {
        from: this.lastMoveState,
        to: state,
        x: Math.round(sprite.x),
        y: Math.round(sprite.y),
        velocityX: Math.round(sprite.body.velocity.x),
        velocityY: Math.round(sprite.body.velocity.y)
      });
      this.lastMoveState = state;
    }

    // Horizontal Movement
    if (input.left) {
      sprite.setAccelerationX(-GAME_CONFIG.PHYSICS.ACCELERATION);
      sprite.setFlipX(true);
      if (isGrounded) this.playAnimationSafe(sprite, 'walk');
    } else if (input.right) {
      sprite.setAccelerationX(GAME_CONFIG.PHYSICS.ACCELERATION);
      sprite.setFlipX(false);
      if (isGrounded) this.playAnimationSafe(sprite, 'walk');
    } else {
      sprite.setAccelerationX(0);
      if (isGrounded) this.playAnimationSafe(sprite, 'idle');
    }

    // Jumping
    if (input.jump && isGrounded) {
      sprite.setVelocityY(GAME_CONFIG.PHYSICS.JUMP_FORCE);
    }

    // Mid-air animations
    if (!isGrounded) {
      if (sprite.body.velocity.y < 0) {
        this.playAnimationSafe(sprite, 'jump');
      } else {
        this.playAnimationSafe(sprite, 'fall');
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
    Diagnostics.event('Player death event triggered', {
      deaths: this.player.deaths,
      livesRemaining: remainingLives,
      x: Math.round(sprite.x),
      y: Math.round(sprite.y)
    });
    sprite.setVelocity(0, 0);
    sprite.body.allowGravity = false; // Stop falling during death sequence
    this.playAnimationSafe(sprite, 'death');

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

    Diagnostics.event('Player respawn event triggered', { x, y });

    const sprite = this.player.getSprite();
    sprite.body.reset(x, y); // Safely reset physics body, position, velocity, and acceleration
    sprite.body.allowGravity = true;
    sprite.setAlpha(1); // Reset alpha in case of fade effects
    this.playAnimationSafe(sprite, 'idle');
    this.lastMoveState = 'idle'; // Reset tracking state on respawn
  }

  destroy() {
    if (this.player) {
      this.player.destroy();
      this.player = null;
    }
  }
}

