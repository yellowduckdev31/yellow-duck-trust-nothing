/**
 * MainMenuScene.js
 * 
 * Main menu screen.
 * The primary navigation hub.
 * Responsible for:
 *   - Displaying game title
 *   - Play button (Level Select)
 *   - Leaderboard button
 *   - Settings button
 * 
 * References: PROJECT_CONTEXT.md
 */

import { SCENES, COLORS_HEX } from '../core/config.js';
import { UIHelper } from '../ui/UIHelper.js';

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.MAIN_MENU });
  }

  create() {
    const { width, height } = this.scale;

    // Verify Auth / Username status before allowing play
    const saveSystem = this.registry.get('saveSystem');
    if (!saveSystem || !saveSystem.data.username) {
      console.warn("No username found! Redirecting to Username scene.");
      this.scene.start(SCENES.USERNAME);
      return;
    }

    // Dark Background
    this.add.rectangle(0, 0, width, height, 0x111111).setOrigin(0);

    // Title text
    UIHelper.createText(this, width / 2, height / 2 - 150, 'YELLOW DUCK:', 48, COLORS_HEX.YELLOW);
    UIHelper.createText(this, width / 2, height / 2 - 100, 'TRUST NOTHING', 48, COLORS_HEX.WHITE);

    // Welcome user
    UIHelper.createText(this, width / 2, height / 2 - 40, `Welcome, ${saveSystem.data.username}!`, 20, '#AAAAAA');

    // Main Buttons
    UIHelper.createButton(this, width / 2, height / 2 + 40, 'PLAY GAME', () => this.onPlay(), 250, 60);
    UIHelper.createButton(this, width / 2, height / 2 + 120, 'LEADERBOARD', () => this.onLeaderboard(), 250, 60);
    UIHelper.createButton(this, width / 2, height / 2 + 200, 'SETTINGS', () => this.onSettings(), 250, 60);

    // Footer
    UIHelper.createText(this, width / 2, height - 30, '© 2026 Antigravity - A Troll Platformer', 16, '#666666');
  }

  // --- Actions ---

  onPlay() {
    // Navigate to Game Scene directly as requested
    this.scene.start(SCENES.GAME, { level: 1 });
  }

  onLeaderboard() {
    // Navigate to Leaderboard
    this.scene.start(SCENES.LEADERBOARD);
  }

  onSettings() {
    // Troll popup for settings
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const bg = this.add.rectangle(width/2, height/2, 400, 200, 0x000000, 0.9).setStrokeStyle(2, 0xFF0000);
    const txt = UIHelper.createText(this, width/2, height/2 - 20, "Settings are for the weak.\nDeal with it.", 24, COLORS_HEX.SPIKE_RED).setAlign('center');
    const closeBtn = UIHelper.createButton(this, width/2, height/2 + 50, 'OKAY', () => {
      bg.destroy();
      txt.destroy();
      closeBtn.destroy();
    }, 100, 40);
  }

  onAchievements() {
    // Achievements view handled outside or via simple popup
  }
}

