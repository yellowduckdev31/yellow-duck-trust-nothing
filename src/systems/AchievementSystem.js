/**
 * AchievementSystem.js
 * 
 * Manages achievement tracking and unlocking.
 * 
 * References: PROJECT_CONTEXT.md
 *   Section 18 — Achievements (minimum 25)
 *   Section 31 — Systems: AchievementSystem
 */

import { UIHelper } from '../ui/UIHelper.js';
import { COLORS_HEX } from '../core/config.js';

export const ACHIEVEMENTS = {
  // --- DEATHS (5) ---
  FIRST_BLOOD: { id: 'FIRST_BLOOD', name: 'First Blood', desc: 'Die for the first time. Welcome to the game.' },
  PRACTICE_MAKES_PERFECT: { id: 'PRACTICE_MAKES_PERFECT', name: 'Practice Makes Perfect', desc: 'Die 10 times.' },
  GLUTTON: { id: 'GLUTTON', name: 'Glutton for Punishment', desc: 'Die 50 times.' },
  HUNDRED_CLUB: { id: 'HUNDRED_CLUB', name: 'The 100 Club', desc: 'Die 100 times. We admire your persistence.' },
  GRAVITY_TESTER: { id: 'GRAVITY_TESTER', name: 'Gravity Tester', desc: 'Die 500 times. Are you doing this on purpose?' },

  // --- LEVELS (5) ---
  FIRST_STEPS: { id: 'FIRST_STEPS', name: 'First Steps', desc: 'Complete Level 1.' },
  GETTING_THE_HANG: { id: 'GETTING_THE_HANG', name: 'Getting The Hang Of It', desc: 'Complete Level 5.' },
  HALFWAY_THERE: { id: 'HALFWAY_THERE', name: 'Halfway There', desc: 'Reach Level 10.' },
  SECRET_FINDER: { id: 'SECRET_FINDER', name: 'What Is This Place?', desc: 'Discover the Secret Level 11.' },
  FLAWLESS: { id: 'FLAWLESS', name: 'Flawless Victory', desc: 'Complete any level with 0 deaths.' },

  // --- SECRETS & TROLLS (5) ---
  NOSY_DUCK: { id: 'NOSY_DUCK', name: 'Nosy Duck', desc: 'Find 1 secret area.' },
  SHERLOCK_DUCK: { id: 'SHERLOCK_DUCK', name: 'Sherlock Duck', desc: 'Find 3 secret areas.' },
  MASTER_EXPLORER: { id: 'MASTER_EXPLORER', name: 'Master Explorer', desc: 'Find all 4 secret areas in the game.' },
  TRUST_NOTHING: { id: 'TRUST_NOTHING', name: 'Trust Nothing', desc: 'Get killed by a fake exit.' },
  WHOOPS: { id: 'WHOOPS', name: 'Whoops...', desc: 'Fall through a fake floor.' },

  // --- BEST TIMES (5) ---
  SPEED_DEMON: { id: 'SPEED_DEMON', name: 'Speed Demon', desc: 'Beat any level under 10 seconds.' },
  SONIC_DUCK: { id: 'SONIC_DUCK', name: 'Sonic Duck', desc: 'Beat any level under 5 seconds.' },
  SLOW_STEADY: { id: 'SLOW_STEADY', name: 'Slow and Steady', desc: 'Spend more than 5 minutes on a single level.' },
  SPEEDRUNNER_INITIATE: { id: 'SPEEDRUNNER_INITIATE', name: 'Speedrunner Initiate', desc: 'Beat the game (1-10) in under 30 minutes total time.' },
  SPEEDRUNNER_MASTER: { id: 'SPEEDRUNNER_MASTER', name: 'Speedrunner Master', desc: 'Beat the game (1-10) in under 15 minutes total time.' },

  // --- COMPLETION & MISC (5) ---
  THE_END: { id: 'THE_END', name: 'The End?', desc: 'Beat Level 10.' },
  NIGHTMARE_BEATEN: { id: 'NIGHTMARE_BEATEN', name: 'Nightmare Conquered', desc: 'Beat Level 11 (Nightmare Duck).' },
  DETERMINATION: { id: 'DETERMINATION', name: 'Determination', desc: 'Die 20 times on a single level and then beat it.' },
  NO_CHECKPOINTS: { id: 'NO_CHECKPOINTS', name: 'I Dont Need Help', desc: 'Beat a checkpoint-enabled level without touching any checkpoints.' },
  PLATINUM_DUCK: { id: 'PLATINUM_DUCK', name: 'Platinum Duck', desc: 'Unlock all 24 other achievements.' }
};

export class AchievementSystem {
  constructor() {
    /** @type {Set<string>} Unlocked achievement IDs */
    this.unlocked = new Set();
  }

  /**
   * Check and unlock achievements based on current game state.
   * @param {Phaser.Scene} scene - Active scene for toasts
   * @param {object} saveData - Current save data state from SaveSystem
   * @param {object} levelStats - Temporary stats for the current level (time, deaths)
   */
  check(scene, saveData, levelStats = {}) {
    const totalDeaths = saveData.deaths || 0;
    const completedLevels = saveData.completedLevels || [];
    const secretsFound = saveData.secretsFound || 0;
    
    // --- Evaluate Deaths ---
    if (totalDeaths >= 1) this.unlock(scene, ACHIEVEMENTS.FIRST_BLOOD);
    if (totalDeaths >= 10) this.unlock(scene, ACHIEVEMENTS.PRACTICE_MAKES_PERFECT);
    if (totalDeaths >= 50) this.unlock(scene, ACHIEVEMENTS.GLUTTON);
    if (totalDeaths >= 100) this.unlock(scene, ACHIEVEMENTS.HUNDRED_CLUB);
    if (totalDeaths >= 500) this.unlock(scene, ACHIEVEMENTS.GRAVITY_TESTER);

    // --- Evaluate Levels ---
    if (completedLevels.includes(1)) this.unlock(scene, ACHIEVEMENTS.FIRST_STEPS);
    if (completedLevels.includes(5)) this.unlock(scene, ACHIEVEMENTS.GETTING_THE_HANG);
    if (completedLevels.includes(10)) this.unlock(scene, ACHIEVEMENTS.THE_END);
    if (completedLevels.includes(11)) this.unlock(scene, ACHIEVEMENTS.NIGHTMARE_BEATEN);
    
    // Discovered Level 11 via beating 10 (or unlocking it secretly)
    if (saveData.unlockedLevels >= 11) this.unlock(scene, ACHIEVEMENTS.SECRET_FINDER);

    // --- Evaluate Secrets ---
    if (secretsFound >= 1) this.unlock(scene, ACHIEVEMENTS.NOSY_DUCK);
    if (secretsFound >= 3) this.unlock(scene, ACHIEVEMENTS.SHERLOCK_DUCK);
    if (secretsFound >= 4) this.unlock(scene, ACHIEVEMENTS.MASTER_EXPLORER);

    // --- Evaluate Specific Level Completion Triggers (Called on level beat) ---
    if (levelStats.justCompleted) {
      if (levelStats.deaths === 0) this.unlock(scene, ACHIEVEMENTS.FLAWLESS);
      if (levelStats.time < 10) this.unlock(scene, ACHIEVEMENTS.SPEED_DEMON);
      if (levelStats.time < 5) this.unlock(scene, ACHIEVEMENTS.SONIC_DUCK);
      if (levelStats.time > 300) this.unlock(scene, ACHIEVEMENTS.SLOW_STEADY);
      if (levelStats.deaths >= 20) this.unlock(scene, ACHIEVEMENTS.DETERMINATION);
      if (levelStats.usedCheckpoints === 0 && levelStats.levelNumber >= 4) {
        this.unlock(scene, ACHIEVEMENTS.NO_CHECKPOINTS);
      }
    }

    // --- Specific Triggers (Called dynamically during gameplay) ---
    if (levelStats.triggerFakeExit) this.unlock(scene, ACHIEVEMENTS.TRUST_NOTHING);
    if (levelStats.triggerFakeFloor) this.unlock(scene, ACHIEVEMENTS.WHOOPS);

    // --- Speedrunner Evaluation ---
    if (completedLevels.length >= 10) {
      // Sum all best times for levels 1-10
      let totalTime = 0;
      for (let i = 1; i <= 10; i++) {
        totalTime += saveData.levelTimes[i] || 9999;
      }
      if (totalTime < 30 * 60) this.unlock(scene, ACHIEVEMENTS.SPEEDRUNNER_INITIATE);
      if (totalTime < 15 * 60) this.unlock(scene, ACHIEVEMENTS.SPEEDRUNNER_MASTER);
    }

    // --- Platinum Evaluation ---
    if (this.unlocked.size === 24 && !this.unlocked.has(ACHIEVEMENTS.PLATINUM_DUCK.id)) {
      this.unlock(scene, ACHIEVEMENTS.PLATINUM_DUCK);
    }
  }

  /**
   * Unlock a specific achievement.
   * @param {Phaser.Scene} scene - Active scene to show UI toast
   * @param {object} achievementDef - The achievement object from ACHIEVEMENTS constant
   */
  unlock(scene, achievementDef) {
    if (!achievementDef || this.isUnlocked(achievementDef.id)) return;

    this.unlocked.add(achievementDef.id);

    // Play SFX if scene provided
    if (scene && scene.sound) {
      // scene.sound.play('SFX_Achievement'); // Ensure this is loaded in BootScene
    }

    console.log(`Achievement Unlocked: ${achievementDef.name} - ${achievementDef.desc}`);

    // Show UI Toast if scene exists
    if (scene) {
      this.showToast(scene, achievementDef);
    }
    
    // Note: Persisting to SaveSystem should happen at the GameScene/Level level after this check.
  }

  /**
   * Shows an animated Toast UI in the scene.
   * @param {Phaser.Scene} scene 
   * @param {object} ach 
   */
  showToast(scene, ach) {
    // Basic toast animation sliding down from top right
    const width = 300;
    const height = 80;
    const padding = 20;
    const startX = scene.scale.width + width;
    const targetX = scene.scale.width - width / 2 - padding;
    const targetY = padding + height / 2;

    const bg = scene.add.rectangle(startX, targetY, width, height, 0x111111, 0.9)
      .setStrokeStyle(2, COLORS_HEX.DUCK_YELLOW)
      .setScrollFactor(0)
      .setDepth(5000);
      
    const titleText = UIHelper.createText(scene, startX, targetY - 15, `Achievement Unlocked!`, 16, COLORS_HEX.DUCK_YELLOW)
      .setScrollFactor(0).setDepth(5001).setOrigin(0.5);
      
    const nameText = UIHelper.createText(scene, startX, targetY + 10, ach.name, 20, 0xFFFFFF)
      .setScrollFactor(0).setDepth(5001).setOrigin(0.5);

    // Tween in
    scene.tweens.add({
      targets: [bg, titleText, nameText],
      x: targetX,
      duration: 500,
      ease: 'Back.easeOut',
      onComplete: () => {
        // Wait 3 seconds, then tween out
        scene.time.delayedCall(3000, () => {
          scene.tweens.add({
            targets: [bg, titleText, nameText],
            x: startX,
            duration: 500,
            ease: 'Power2',
            onComplete: () => {
              bg.destroy();
              titleText.destroy();
              nameText.destroy();
            }
          });
        });
      }
    });
  }

  /**
   * Check if an achievement is unlocked.
   * @param {string} id
   * @returns {boolean}
   */
  isUnlocked(id) {
    return this.unlocked.has(id);
  }

  /**
   * Get all unlocked achievements.
   * @returns {Array<string>}
   */
  getUnlocked() {
    return Array.from(this.unlocked);
  }

  /**
   * Load unlocked achievements from save data.
   * @param {Array<string>} achievements
   */
  loadFromSave(achievements) {
    if (Array.isArray(achievements)) {
      this.unlocked = new Set(achievements);
    }
  }
}
