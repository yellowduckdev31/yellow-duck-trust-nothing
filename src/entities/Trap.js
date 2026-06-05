/**
 * Trap.js
 * 
 * Base trap entity.
 * 
 * References: PROJECT_CONTEXT.md
 *   Section 11 — Death System: trap types
 *   Section 21 — Level Design Rules: every trap must be avoidable
 *   Section 33 — Asset Naming: TRAP_[Name].png
 */

export class Trap {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {string} type - Trap type key
   * @param {object} config - Trap-specific config from level JSON
   */
  constructor(scene, x, y, type, config) {
    this.scene = scene;
    this.type = type;
    this.config = config;
    this.sprite = null;
    this.isActive = true;
  }

  /**
   * Create the trap sprite and physics body.
   */
  create() {
    // TODO: Create sprite based on type
    // TODO: Set physics body (static or dynamic)
    // TODO: Configure trap behavior based on type
  }

  /**
   * Update trap behavior per frame.
   * @param {number} time
   * @param {number} delta
   */
  update(time, delta) {
    // TODO: Override per trap type (moving, timed, etc.)
  }

  destroy() {
    // TODO: Cleanup
  }
}
