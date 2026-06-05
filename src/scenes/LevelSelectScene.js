/**
 * LevelSelectScene.js
 * 
 * Level selection screen.
 * Responsible for:
 *   - Displaying level grid (10 levels + 1 secret)
 *   - Showing locked/unlocked state per level
 *   - Displaying best time per level
 *   - Transitioning to GameScene with selected level
 *   - Back button to MainMenuScene
 * 
 * References: PROJECT_CONTEXT.md
 */

import { SCENES, GAME_CONFIG, COLORS_HEX } from '../core/config.js';
import { UIHelper } from '../ui/UIHelper.js';

export class LevelSelectScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.LEVEL_SELECT });
  }

  create() {
    const { width, height } = this.scale;
    
    // Dark Background
    this.add.rectangle(0, 0, width, height, 0x111111).setOrigin(0);

    // Title
    UIHelper.createText(this, width / 2, 50, 'SELECT LEVEL', 40, COLORS_HEX.YELLOW);

    this.saveSystem = this.registry.get('saveSystem');
    const unlockedLevel = this.saveSystem ? this.saveSystem.data.currentLevel : 1;
    const bestTimes = this.saveSystem ? this.saveSystem.data.bestTimes : {};

    // Grid Layout (5 columns, 2 rows for 1-10)
    const cols = 5;
    const btnWidth = 100;
    const btnHeight = 100;
    const spacingX = 140;
    const spacingY = 140;
    
    const startX = (width - ((cols - 1) * spacingX)) / 2;
    const startY = height / 2 - 50;

    for (let i = 1; i <= 10; i++) {
      const row = Math.floor((i - 1) / cols);
      const col = (i - 1) % cols;
      
      const x = startX + (col * spacingX);
      const y = startY + (row * spacingY);
      
      const isUnlocked = i <= unlockedLevel;
      const time = bestTimes[i];
      
      this.createLevelButton(x, y, i, isUnlocked, time);
    }

    // Secret Level 11 (Centered at bottom)
    if (unlockedLevel >= 11) {
      this.createLevelButton(width / 2, height - 100, 11, true, bestTimes[11], true);
    }

    // Back button
    UIHelper.createButton(this, 80, 50, '< BACK', () => this.onBack(), 100, 40);
  }

  createLevelButton(x, y, level, isUnlocked, bestTime, isSecret = false) {
    const color = isUnlocked ? (isSecret ? 0xC62828 : 0x333333) : 0x111111;
    const stroke = isUnlocked ? (isSecret ? 0xFF0000 : 0xFFD43B) : 0x555555;
    
    const bg = this.add.rectangle(x, y, 100, 100, color).setStrokeStyle(2, stroke);
    
    if (isUnlocked) {
      bg.setInteractive({ useHandCursor: true });
      bg.on('pointerdown', () => this.onSelectLevel(level));
      
      // Level Number
      UIHelper.createText(this, x, y - 10, isSecret ? '???' : `${level}`, 32, COLORS_HEX.WHITE);
      
      // Best Time
      if (bestTime) {
        UIHelper.createText(this, x, y + 30, `${bestTime.toFixed(2)}s`, 14, COLORS_HEX.YELLOW);
      }
    } else {
      // Locked Icon / Text
      UIHelper.createText(this, x, y, 'LOCKED', 16, '#555555');
    }
  }

  onSelectLevel(levelNumber) {
    this.scene.start(SCENES.GAME, { level: levelNumber });
  }

  onBack() {
    this.scene.start(SCENES.MAIN_MENU);
  }
}

