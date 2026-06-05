/**
 * config.js
 * 
 * Game constants and configuration values.
 * Source of truth derived from PROJECT_CONTEXT.md
 * 
 * Do NOT hardcode these values elsewhere.
 */

export const GAME_CONFIG = {
  // Section 01 — Project Overview
  TITLE: 'Yellow Duck: Trust Nothing',

  // Section 29 — Physics
  PHYSICS: {
    GRAVITY: 1000,
    MOVE_SPEED: 220,
    JUMP_FORCE: -450,
  },

  // Section 28 — Camera
  CAMERA: {
    LERP: 0.15,
    ZOOM: 1,
  },

  // Section 23 — Visual Style
  GRID_SIZE: 16,
  CHARACTER_SIZE: { width: 48, height: 64 },

  // Section 09 — Lives System
  STARTING_LIVES: 5,

  // Section 11 — Death System
  DEATH: {
    FREEZE_FRAME_MS: 100,
    RESPAWN_TARGET_MS: 800,
  },

  // Section 15 — Account System
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 16,
  },

  // Section 19 — Level Structure
  LEVELS: {
    TOTAL: 10,
    SECRET: 1,
    TOTAL_WITH_SECRET: 11,
  },

  // Section 37 — Performance Targets
  PERFORMANCE: {
    TARGET_FPS: 60,
    MIN_FPS: 30,
    MAX_LOAD_TIME_MS: 3000,
  },
};

// Section 24 — Color Palette
export const COLORS = {
  YELLOW:      0xFFD43B,
  DARK_YELLOW: 0xE5B800,
  ORANGE:      0xF28C28,
  BLACK_SUIT:  0x1A1A1A,
  WHITE:       0xFFFFFF,
  SPIKE_RED:   0xC62828,
};

// Section 24 — Color Palette (CSS hex strings)
export const COLORS_HEX = {
  YELLOW:      '#FFD43B',
  DARK_YELLOW: '#E5B800',
  ORANGE:      '#F28C28',
  BLACK_SUIT:  '#1A1A1A',
  WHITE:       '#FFFFFF',
  SPIKE_RED:   '#C62828',
};

// Section 30 — Scene Keys
export const SCENES = {
  BOOT:           'BootScene',
  USERNAME:       'UsernameScene',
  MAIN_MENU:      'MainMenuScene',
  LEVEL_SELECT:   'LevelSelectScene',
  GAME:           'GameScene',
  PAUSE:          'PauseScene',
  LEVEL_COMPLETE: 'LevelCompleteOverlay',
  VICTORY:        'VictoryScene',
  LEADERBOARD:    'LeaderboardScene',
  GAME_OVER:      'GameOverScene',
};

// Section 20 — Checkpoint Rules
export const CHECKPOINT_RULES = {
  // Levels 1-3: No checkpoint
  // Levels 4-6: 1 checkpoint
  // Levels 7-10: 2 checkpoints
  // Secret Level: No checkpoint
  getCheckpointCount(level) {
    if (level >= 1 && level <= 3) return 0;
    if (level >= 4 && level <= 6) return 1;
    if (level >= 7 && level <= 10) return 2;
    if (level === 11) return 0; // Secret Level
    return 0;
  },
};

// Section 22 — Secret Areas
export const SECRET_AREA_LEVELS = [3, 6, 8, 10];
