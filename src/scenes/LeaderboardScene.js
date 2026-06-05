/**
 * LeaderboardScene.js
 * 
 * Global leaderboard screen.
 * Responsible for:
 *   - Fetching top scores/times from Firebase (LeaderboardSystem)
 *   - Displaying leaderboard UI (tabs for best time, least deaths)
 *   - Showing current user's rank
 *   - Back button to MainMenu
 * 
 * References: PROJECT_CONTEXT.md
 */

import { SCENES, COLORS_HEX } from '../core/config.js';
import { UIHelper } from '../ui/UIHelper.js';

export class LeaderboardScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.LEADERBOARD });
    this.rows = [];
  }

  create() {
    const { width, height } = this.scale;

    this.leaderboardSystem = this.registry.get('leaderboardSystem');
    this.saveSystem = this.registry.get('saveSystem');

    // Dark Background Panel
    UIHelper.createPanel(this, width / 2, height / 2, 600, 500);

    // Title
    UIHelper.createText(this, width / 2, 50, 'GLOBAL LEADERBOARD', 32, COLORS_HEX.YELLOW);

    // Table Header
    UIHelper.createText(this, width / 2 - 200, 120, 'RANK', 20, COLORS_HEX.WHITE);
    UIHelper.createText(this, width / 2, 120, 'USERNAME', 20, COLORS_HEX.WHITE);
    UIHelper.createText(this, width / 2 + 200, 120, 'DEATHS', 20, COLORS_HEX.WHITE); // Score is based on deaths

    // Loading Text
    this.loadingText = UIHelper.createText(this, width / 2, height / 2, 'Loading...', 24, COLORS_HEX.WHITE);

    // Back Button
    UIHelper.createButton(this, width / 2, height - 50, 'BACK TO MENU', () => this.onBack(), 250, 50);

    // Initial fetch
    this.fetchLeaderboard();
  }

  async fetchLeaderboard() {
    if (!this.leaderboardSystem) {
      this.loadingText.setText('Leaderboard System Offline');
      return;
    }

    this.loadingText.setVisible(true);
    
    // Clear old rows
    this.rows.forEach(r => r.destroy());
    this.rows = [];

    try {
      const scores = await this.leaderboardSystem.getTopScores(7); // Show top 7
      this.loadingText.setVisible(false);

      const { width, height } = this.scale;
      const startY = 170;

      scores.forEach((entry, i) => {
        const yPos = startY + (i * 40);
        
        const rankColor = i === 0 ? COLORS_HEX.YELLOW : COLORS_HEX.WHITE;
        
        const rTxt = UIHelper.createText(this, width / 2 - 200, yPos, `#${i + 1}`, 18, rankColor);
        const uTxt = UIHelper.createText(this, width / 2, yPos, entry.username, 18, COLORS_HEX.WHITE);
        const sTxt = UIHelper.createText(this, width / 2 + 200, yPos, `${entry.deaths}`, 18, COLORS_HEX.SPIKE_RED);
        
        this.rows.push(rTxt, uTxt, sTxt);
      });

      // Show Player Rank
      if (this.saveSystem && this.saveSystem.data.username) {
        const myRank = await this.leaderboardSystem.getPlayerRank(this.saveSystem.data.username);
        if (myRank) {
          const myRankTxt = UIHelper.createText(this, width / 2, height - 120, `Your Rank: #${myRank}`, 20, COLORS_HEX.YELLOW);
          this.rows.push(myRankTxt);
        }
      }

    } catch (e) {
      console.error(e);
      this.loadingText.setText('Failed to load leaderboard.');
    }
  }

  onBack() {
    this.scene.start(SCENES.MAIN_MENU);
  }
}

