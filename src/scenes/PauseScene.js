/**
 * PauseScene.js
 * 
 * Pause overlay scene (launched on top of GameScene).
 * Responsible for:
 *   - Displaying pause panel
 *   - Resume button
 *   - Restart Level button
 *   - Main Menu button
 *   - Settings button
 *   - Saving game on pause (Section 14)
 * 
 * References: PROJECT_CONTEXT.md
 *   Section 07 — Controls: ESC to pause
 *   Section 14 — Save System: Save on Pause
 *   Section 26 — UI Style
 */

import { SCENES, COLORS_HEX } from '../core/config.js';
import { UIHelper } from '../ui/UIHelper.js';

export class PauseScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.PAUSE });
  }

  init(data) {
    this.currentLevel = data.level || 1;
  }

  create() {
    const { width, height } = this.scale;

    // Semi-transparent dark overlay
    this.add.rectangle(0, 0, width, height, 0x000000, 0.7).setOrigin(0);

    // Pause Panel
    UIHelper.createPanel(this, width / 2, height / 2, 400, 400);

    // Title
    UIHelper.createText(this, width / 2, height / 2 - 150, 'PAUSED', 32, COLORS_HEX.WHITE);

    // Buttons
    UIHelper.createButton(this, width / 2, height / 2 - 60, 'RESUME', () => this.onResume(), 250, 50);
    UIHelper.createButton(this, width / 2, height / 2 + 10, 'RESTART', () => this.onRestart(), 250, 50);
    UIHelper.createButton(this, width / 2, height / 2 + 80, 'SETTINGS', () => this.onSettings(), 250, 50);
    UIHelper.createButton(this, width / 2, height / 2 + 150, 'MAIN MENU', () => this.onMainMenu(), 250, 50);

    const saveSystem = this.registry.get('saveSystem');
    if (saveSystem) {
      saveSystem.save();
    }
  }

  onResume() {
    this.scene.resume(SCENES.GAME);
    this.scene.stop();
  }

  onRestart() {
    this.scene.stop();
    this.scene.stop(SCENES.GAME);
    this.scene.start(SCENES.GAME, { level: this.currentLevel });
  }

  onMainMenu() {
    this.scene.stop(SCENES.GAME);
    this.scene.start(SCENES.MAIN_MENU);
  }

  onSettings() {
    // TODO: Open settings sub-panel
  }
}

