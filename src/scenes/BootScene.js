/**
 * BootScene.js
 * 
 * First scene in the game flow.
 * Responsible for:
 *   - Loading all game assets (sprites, audio, UI, level JSON)
 *   - Displaying a loading bar
 *   - Initializing core systems
 *   - Transitioning to UsernameScene
 * 
 * References: PROJECT_CONTEXT.md
 */

import { SCENES } from '../core/config.js';
import { FirebaseService } from '../services/FirebaseService.js';
import { SaveSystem } from '../systems/SaveSystem.js';
import { LeaderboardSystem } from '../systems/LeaderboardSystem.js';
import { AchievementSystem } from '../systems/AchievementSystem.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.BOOT });
  }

  preload() {
    // Basic loading bar
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

    const loadingText = this.make.text({
      x: width / 2,
      y: height / 2 - 50,
      text: 'Loading...',
      style: { font: '20px monospace', fill: '#ffffff' }
    }).setOrigin(0.5, 0.5);

    this.load.on('progress', (value) => {
      progressBar.clear();
      progressBar.fillStyle(0xFFD43B, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
    });
    
    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
    });

    // 1. Generate Placeholder Textures programmatically so the game doesn't crash without real PNGs
    this.generatePlaceholderTextures();

    // 2. Load Level JSONs from the 'levels/' directory we created earlier
    for (let i = 1; i <= 10; i++) {
      const numStr = i < 10 ? `0${i}` : `${i}`;
      this.load.json(`level_${i}`, `levels/level_${numStr}.json`);
    }
    this.load.json('level_11', 'levels/level_secret_11.json');
    
    // We would load real assets here:
    // this.load.image('GroundTile', 'assets/GroundTile.png'); 
    // etc.
  }

  async create() {
    console.log("Booting game and initializing systems...");

    // 1. Initialize Firebase
    const firebaseService = new FirebaseService();
    // Use dummy config for local testing, or real config if available
    await firebaseService.initialize({
      apiKey: "dummy-key-for-local-dev",
      authDomain: "dummy.firebaseapp.com",
      projectId: "yellow-duck-trust-nothing"
    }).catch(e => console.warn("Firebase Init Failed (likely due to dummy config), continuing in offline mode.", e));

    // 2. Initialize other systems
    const saveSystem = new SaveSystem(firebaseService);
    const leaderboardSystem = new LeaderboardSystem(firebaseService);
    const achievementSystem = new AchievementSystem();

    // 3. Store globally in Phaser Registry
    this.registry.set('firebaseService', firebaseService);
    this.registry.set('saveSystem', saveSystem);
    this.registry.set('leaderboardSystem', leaderboardSystem);
    this.registry.set('achievementSystem', achievementSystem);

    // 4. Transition to UsernameScene
    this.scene.start(SCENES.USERNAME);
  }

  generatePlaceholderTextures() {
    // Generates basic colored squares to act as textures if PNGs are missing
    const makeTex = (key, color, w, h) => {
      const g = this.add.graphics();
      g.fillStyle(color, 1);
      g.fillRect(0, 0, w, h);
      g.lineStyle(2, 0x000000, 1);
      g.strokeRect(0, 0, w, h);
      g.generateTexture(key, w, h);
      g.destroy();
    };

    makeTex('Duck_Idle', 0xFFD43B, 48, 64);
    makeTex('GroundTile', 0x4CAF50, 64, 64);
    makeTex('GoalDoor', 0x795548, 64, 128);
    makeTex('CheckpointFlag', 0x8BC34A, 64, 128);
    makeTex('TRAP_StaticSpike', 0xC62828, 64, 64);
    makeTex('TRAP_MovingSpike', 0xB71C1C, 64, 64);
    makeTex('TRAP_HiddenSpike', 0xD32F2F, 64, 64);
    makeTex('TRAP_FakeFloor', 0x388E3C, 64, 64);
    makeTex('TRAP_MovingPlatform', 0x607D8B, 128, 64);
    makeTex('UI_HeartFull', 0xF44336, 32, 32);
    makeTex('UI_HeartEmpty', 0x9E9E9E, 32, 32);
  }
}
