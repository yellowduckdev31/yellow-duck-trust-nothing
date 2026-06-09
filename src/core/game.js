/**
 * game.js
 * 
 * Main Phaser 3 entry point.
 * Initializes the game instance with Arcade Physics and all scenes.
 * 
 * References: PROJECT_CONTEXT.md
 *   Section 35 — Engine: Phaser 3
 *   Section 29 — Physics: Arcade, Gravity 1000
 *   Section 30 — Scene Flow
 *   Section 37 — Performance: 60 FPS target
 *   Section 38 — Orientation: Landscape preferred
 */

import { Diagnostics } from '../utils/Diagnostics.js';

// Initialize Diagnostics
Diagnostics.initialize();

import { GAME_CONFIG, SCENES } from './config.js';

import { BootScene }           from '../scenes/BootScene.js';
import { UsernameScene }       from '../scenes/UsernameScene.js';
import { MainMenuScene }       from '../scenes/MainMenuScene.js';
import { LevelSelectScene }    from '../scenes/LevelSelectScene.js';
import { GameScene }           from '../scenes/GameScene.js';
import { PauseScene }          from '../scenes/PauseScene.js';
import { LevelCompleteOverlay } from '../scenes/LevelCompleteOverlay.js';
import { GameOverScene }       from '../scenes/GameOverScene.js';
import { VictoryScene }        from '../scenes/VictoryScene.js';
import { LeaderboardScene }    from '../scenes/LeaderboardScene.js';
import { UIScene }             from '../scenes/UIScene.js';

const config = {
  type: Phaser.AUTO,
  parent: 'game-container',

  width: 960,
  height: 540,

  backgroundColor: '#0D0D0D',

  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: GAME_CONFIG.PHYSICS.GRAVITY },
      debug: false,
    },
  },

  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },

  render: {
    pixelArt: true,
    antialias: false,
    roundPixels: true,
  },

  fps: {
    target: GAME_CONFIG.PERFORMANCE.TARGET_FPS,
    min: GAME_CONFIG.PERFORMANCE.MIN_FPS,
  },

  scene: [
    BootScene,
    UsernameScene,
    MainMenuScene,
    LevelSelectScene,
    GameScene,
    PauseScene,
    LevelCompleteOverlay,
    GameOverScene,
    VictoryScene,
    LeaderboardScene,
    UIScene,
  ],
};

const game = new Phaser.Game(config);

export default game;
