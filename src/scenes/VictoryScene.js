/**
 * VictoryScene.js
 * 
 * Victory screen shown when all levels are completed.
 * Responsible for:
 *   - Showing victory message
 *   - Showing final stats (Total Deaths, Final Time, Score, Grade)
 *   - Grade calculation (S, A, B, C, D)
 *   - Next/MainMenu/Leaderboard options
 * 
 * References: PROJECT_CONTEXT.md
 */

import { SCENES, COLORS_HEX } from '../core/config.js';
import { UIHelper } from '../ui/UIHelper.js';

export class VictoryScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.VICTORY });
  }

  create() {
    const { width, height } = this.scale;

    const saveSystem = this.registry.get('saveSystem');
    
    // Fallbacks if directly launched
    this.totalDeaths = saveSystem ? (saveSystem.data.deaths || 0) : 0;
    this.finalTime = saveSystem ? (saveSystem.data.playTime || 0) : 0;
    this.score = -this.totalDeaths;

    // Dark Background Overlay
    this.add.rectangle(0, 0, width, height, 0x000000, 0.8).setOrigin(0);

    // Main Panel
    UIHelper.createPanel(this, width / 2, height / 2, 600, 500);

    // Title (Yellow)
    UIHelper.createText(this, width / 2, height / 2 - 200, 'VICTORY!', 48, COLORS_HEX.YELLOW);
    UIHelper.createText(this, width / 2, height / 2 - 140, 'You trusted nothing, and survived.', 16, COLORS_HEX.WHITE);

    // Calculate Grade
    const grade = this.calculateGrade(this.totalDeaths, this.finalTime);

    // Stats
    const statsText = [
      `Total Deaths: ${this.totalDeaths}`,
      `Total Time: ${this.finalTime.toFixed(2)}s`,
      `Final Score: ${this.score}`,
      ``,
      `GRADE: ${grade}`
    ].join('\n');
    
    const txt = UIHelper.createText(this, width / 2, height / 2 - 20, statsText, 24, COLORS_HEX.WHITE);
    txt.setAlign('center');

    // Buttons
    UIHelper.createButton(this, width / 2 - 150, height / 2 + 150, 'LEADERBOARD', () => this.onLeaderboard(), 250, 50);
    UIHelper.createButton(this, width / 2 + 150, height / 2 + 150, 'MAIN MENU', () => this.onMainMenu(), 250, 50);
  }

  calculateGrade(deaths, time) {
    if (deaths === 0) return 'S';
    if (deaths < 10) return 'A';
    if (deaths < 30) return 'B';
    if (deaths < 100) return 'C';
    return 'D';
  }

  onLeaderboard() {
    this.scene.start(SCENES.LEADERBOARD);
  }

  onMainMenu() {
    this.scene.start(SCENES.MAIN_MENU);
  }
}

