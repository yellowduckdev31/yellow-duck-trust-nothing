/**
 * GameOverScene.js
 * 
 * Game Over screen.
 * Responsible for:
 *   - Showing failure message
 *   - Showing current stats (Level, Deaths, Score)
 *   - Retry button (Restart Level)
 *   - Quit to Main Menu button
 * 
 * References: PROJECT_CONTEXT.md
 *   Section 05 — Game Flow: Game Over → GameScene / Main Menu
 *   Section 30 — Scene Flow: GameOverScene
 */

import { SCENES, COLORS_HEX } from '../core/config.js';
import { UIHelper } from '../ui/UIHelper.js';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.GAME_OVER });
  }

  init(data) {
    this.currentLevel = data.level || 1;
    this.deaths = data.deaths || 0;
    this.score = data.score || 0;
  }

  create() {
    const { width, height } = this.scale;

    // Dark Background Overlay
    this.add.rectangle(0, 0, width, height, 0x000000, 0.8).setOrigin(0);

    // Main Panel
    UIHelper.createPanel(this, width / 2, height / 2, 500, 400);

    // Title (Red to signify Game Over)
    UIHelper.createText(this, width / 2, height / 2 - 140, 'GAME OVER', 40, COLORS_HEX.SPIKE_RED);
    UIHelper.createText(this, width / 2, height / 2 - 90, 'You died too many times.', 16, COLORS_HEX.WHITE);

    // Stats
    const statsText = [
      `Level: ${this.currentLevel}`,
      `Total Deaths: ${this.deaths}`,
      `Score: ${this.score}`
    ].join('\n');
    UIHelper.createText(this, width / 2, height / 2 - 10, statsText, 24, COLORS_HEX.YELLOW);

    // Buttons
    UIHelper.createButton(this, width / 2 - 120, height / 2 + 120, 'RETRY', () => this.onRetry(), 200, 50);
    UIHelper.createButton(this, width / 2 + 120, height / 2 + 120, 'MENU', () => this.onMainMenu(), 200, 50);

    // TODO: Update SaveSystem to record the loss/deaths (Section 14)
  }

  onRetry() {
    // Restart current level
    this.scene.start(SCENES.GAME, { level: this.currentLevel });
  }

  onMainMenu() {
    // Return to main menu
    this.scene.start(SCENES.MAIN_MENU);
  }
}
