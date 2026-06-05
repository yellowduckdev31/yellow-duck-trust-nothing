/**
 * LevelCompleteOverlay.js
 * 
 * Overlay scene shown when a level is completed.
 * Responsible for:
 *   - Displaying completion stats (score, time, deaths)
 *   - Best time comparison (Section 13)
 *   - NEW RECORD indicator
 *   - Next Level button
 *   - Replay button
 *   - Level Select button
 * 
 * References: PROJECT_CONTEXT.md
 */

import { SCENES, COLORS_HEX } from '../core/config.js';
import { UIHelper } from '../ui/UIHelper.js';

export class LevelCompleteOverlay extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.LEVEL_COMPLETE });
  }

  init(data) {
    this.completedLevel = data.level || 1;
    this.score = data.score || 0;
    this.completionTime = data.time || 0;
    this.deaths = data.deaths || 0;
    
    // Additional tracking for achievements
    this.usedCheckpoints = data.usedCheckpoints || 0;
    this.triggerFakeExit = data.triggerFakeExit || false;
    this.triggerFakeFloor = data.triggerFakeFloor || false;
  }

  create() {
    const { width, height } = this.scale;

    // Semi-transparent overlay
    this.add.rectangle(0, 0, width, height, 0x000000, 0.8).setOrigin(0);

    // Systems
    const saveSystem = this.registry.get('saveSystem');
    const leaderboardSystem = this.registry.get('leaderboardSystem');
    const achievementSystem = this.registry.get('achievementSystem');

    let isNewRecord = false;
    let bestTime = this.completionTime;

    // Save Progress
    if (saveSystem) {
      const prevBest = saveSystem.data.bestTimes[this.completedLevel];
      if (!prevBest || this.completionTime < prevBest) {
        saveSystem.data.bestTimes[this.completedLevel] = this.completionTime;
        isNewRecord = true;
      }
      bestTime = saveSystem.data.bestTimes[this.completedLevel];

      // Unlock next level
      const nextLevel = this.completedLevel + 1;
      if (nextLevel > saveSystem.data.currentLevel) {
        saveSystem.data.currentLevel = nextLevel;
        if (!saveSystem.data.completedLevels) saveSystem.data.completedLevels = [];
        if (!saveSystem.data.completedLevels.includes(this.completedLevel)) {
          saveSystem.data.completedLevels.push(this.completedLevel);
        }
      }

      // Add to overall deaths/playTime
      saveSystem.data.deaths = (saveSystem.data.deaths || 0) + this.deaths;
      saveSystem.data.playTime = (saveSystem.data.playTime || 0) + this.completionTime;

      saveSystem.save(); // Sync to Firebase

      // Leaderboard
      if (leaderboardSystem) {
        leaderboardSystem.submitScore({
          username: saveSystem.data.username,
          score: -saveSystem.data.deaths, // Least deaths is better, so negative
          deaths: saveSystem.data.deaths,
          completedLevels: saveSystem.data.completedLevels.length,
          bestTime: saveSystem.data.playTime,
          uid: saveSystem.data.uid
        });
      }

      // Achievements
      if (achievementSystem) {
        achievementSystem.check(this, saveSystem.data, {
          justCompleted: true,
          levelNumber: this.completedLevel,
          time: this.completionTime,
          deaths: this.deaths,
          usedCheckpoints: this.usedCheckpoints,
          triggerFakeExit: this.triggerFakeExit,
          triggerFakeFloor: this.triggerFakeFloor
        });
      }
    }

    // Panel
    UIHelper.createPanel(this, width / 2, height / 2, 400, 350);

    // Title
    UIHelper.createText(this, width / 2, height / 2 - 140, 'LEVEL COMPLETE!', 32, COLORS_HEX.YELLOW);

    // Stats
    const statsY = height / 2 - 80;
    UIHelper.createText(this, width / 2, statsY, `Time: ${this.completionTime.toFixed(2)}s`, 20, COLORS_HEX.WHITE);
    UIHelper.createText(this, width / 2, statsY + 30, `Deaths: ${this.deaths}`, 20, COLORS_HEX.SPIKE_RED);
    UIHelper.createText(this, width / 2, statsY + 60, `Best: ${bestTime.toFixed(2)}s`, 20, COLORS_HEX.YELLOW);

    if (isNewRecord) {
      const recordText = UIHelper.createText(this, width / 2 + 100, statsY, 'NEW RECORD!', 16, COLORS_HEX.YELLOW);
      this.tweens.add({ targets: recordText, scale: 1.1, yoyo: true, repeat: -1, duration: 400 });
    }

    // Buttons
    UIHelper.createButton(this, width / 2, height / 2 + 20, 'NEXT LEVEL', () => this.onNextLevel(), 200, 40);
    UIHelper.createButton(this, width / 2, height / 2 + 70, 'REPLAY', () => this.onReplay(), 200, 40);
    UIHelper.createButton(this, width / 2, height / 2 + 120, 'LEVEL SELECT', () => this.onLevelSelect(), 200, 40);
  }

  onNextLevel() {
    const nextLevel = this.completedLevel + 1;
    this.scene.stop(SCENES.GAME);
    this.scene.stop();

    if (nextLevel > 10 && this.completedLevel !== 11) {
      this.scene.start(SCENES.VICTORY);
    } else {
      this.scene.start(SCENES.GAME, { level: nextLevel });
    }
  }

  onReplay() {
    this.scene.stop();
    this.scene.stop(SCENES.GAME);
    this.scene.start(SCENES.GAME, { level: this.completedLevel });
  }

  onLevelSelect() {
    this.scene.stop(SCENES.GAME);
    this.scene.stop();
    this.scene.start(SCENES.LEVEL_SELECT);
  }
}

