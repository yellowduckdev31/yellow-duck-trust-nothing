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

export class DeathSystem {
  /**
   * @param {Phaser.Scene} scene - The active scene
   */
  constructor(scene) {
    this.scene = scene;
    
    this.deathMessages = this.generateDeathMessages();
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

  /**
   * Generates at least 100 unique dry, sarcastic death messages.
   * @private
   */
  generateDeathMessages() {
    return [
      "The floor lied.", "Trust issues unlocked.", "Professional duck mistake.",
      "Gravity says hello.", "Nice plan.", "You trusted that?", "Oof.",
      "Skill issue.", "Calculated. Badly.", "Duck soup.", "Roasted duck.",
      "A swing and a miss.", "That was embarrassing.", "Did you even look?",
      "Not your best moment.", "RIP.", "Try jumping next time.", "So close. Not.",
      "Hook, line, and sinker.", "Bait taken.", "You fell for it.", "Classic.",
      "Do better.", "I expected nothing and I'm still disappointed.", "Ouch.",
      "That's gonna leave a mark.", "Quacktastic failure.", "Fowl play.", 
      "Just walk it off.", "Are you even trying?", "Was that on purpose?",
      "Speedrun to the grave.", "Another one bites the dust.", "Look before you leap.",
      "Spikes: 1, Duck: 0.", "Gravity always wins.", "You've been played.",
      "Bamboozled.", "Absolutely trolled.", "Never trust a quiet floor.",
      "It looked so safe...", "You should have known.", "Why did you do that?",
      "That jump was a choice.", "A bad choice.", "Gotcha.", "Surprise!",
      "Not the exit.", "Wrong way.", "Down you go.", "Mind the gap.",
      "Plop.", "Splat.", "Crushed dreams.", "Game Over... for now.",
      "You died. Again.", "Is this your first time?", "My grandmother plays better.",
      "Just give up.", "Take a break.", "Deep breaths.", "It's just a game.",
      "Don't throw your keyboard.", "I saw that.", "We all saw that.",
      "Whoops.", "Yikes.", "Tragic.", "Simply tragic.", "Duck down.",
      "Medic!", "Respawn in 3... 2... kidding.", "Insta-death.", "You stepped on a Lego.",
      "Critical failure.", "Fatality.", "Wasted.", "You tried.", "Did you though?",
      "No refunds.", "Should have saved.", "Checkpoints are for the weak.",
      "You are the weak.", "Trust nothing. Literally.", "What did you expect?",
      "It's a trap!", "Obviously a trap.", "You fell for the oldest trick.",
      "A tragedy in one act.", "Cue the sad violin.", "Better luck next life.",
      "Oopsie daisy.", "Farewell.", "Goodbye cruel world.", "Quack.", "Sad quack.",
      "Delete your save file.", "Uninstalling in 3... 2...", "You can't be serious.",
      "I'm not mad, just disappointed.", "Please try harder.", "10/10 execution. 0/10 survival."
    ];
  }

  destroy() {
    if (this.messageText) this.messageText.destroy();
    if (this.overlay) this.overlay.destroy();
    this.deathMessages = [];
  }
}

