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
import { firebaseConfig } from '../../firebase/firebase-config.js';
import { SaveSystem } from '../systems/SaveSystem.js';
import { LeaderboardSystem } from '../systems/LeaderboardSystem.js';
import { AchievementSystem } from '../systems/AchievementSystem.js';
import { Diagnostics } from '../utils/Diagnostics.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.BOOT });
  }

  preload() {
    // Set base URL from Vite to support GitHub Pages subfolder hosting
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL) {
      this.load.setBaseURL(import.meta.env.BASE_URL);
    }

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

    // 2. Load character sprite sheets (48x64 per frame)
    this.load.spritesheet('YD_Idle',  'assets/character/YD_Idle_Sheet.png',  { frameWidth: 48, frameHeight: 64 });
    this.load.spritesheet('YD_Walk',  'assets/character/YD_Walk_Sheet.png',  { frameWidth: 48, frameHeight: 64 });
    this.load.spritesheet('YD_Jump',  'assets/character/YD_Jump_Sheet.png',  { frameWidth: 48, frameHeight: 64 });
    this.load.spritesheet('YD_Fall',  'assets/character/YD_Fall_Sheet.png',  { frameWidth: 48, frameHeight: 64 });
    this.load.spritesheet('YD_Death', 'assets/character/YD_Death_Sheet.png', { frameWidth: 48, frameHeight: 64 });
    // Portrait and Menu are single images
    this.load.image('YD_Portrait', 'assets/character/YD_Portrait.png');
    this.load.image('YD_Menu',     'assets/character/YD_Menu.png');

    // 3. Load real trap PNG assets (present on disk)
    this.load.image('TRAP_StaticSpike',    'assets/traps/TRAP_StaticSpike.png');
    this.load.image('TRAP_MovingSpike',    'assets/traps/TRAP_MovingSpike.png');
    this.load.image('TRAP_HiddenSpike',    'assets/traps/TRAP_HiddenSpike.png');
    this.load.image('TRAP_FakeFloor',      'assets/traps/TRAP_FakeFloor.png');
    this.load.image('TRAP_FallingPlatform','assets/traps/TRAP_FallingPlatform.png');
    this.load.image('TRAP_MovingPlatform', 'assets/traps/TRAP_MovingPlatform.png');
    this.load.image('TRAP_FakeExit',       'assets/traps/TRAP_FakeExit.png');

    // 4. Load real environment PNG assets (present on disk)
    this.load.image('GroundTile', 'assets/environment/GroundTile.png');
    this.load.image('WallTile',   'assets/environment/WallTile.png');

    // 5. Load Level JSONs
    for (let i = 1; i <= 10; i++) {
      const numStr = i < 10 ? `0${i}` : `${i}`;
      this.load.json(`level_${i}`, `levels/level_${numStr}.json`);
    }
    this.load.json('level_11', 'levels/level_secret_11.json');
  }


  async create() {
    console.log("Booting game and initializing systems...");

    // Generate fallback graphics for any missing assets
    this.generateMissingFallbacks();

    // 1. Define character animations from loaded sprite sheets
    this.createAnimations();

    // 2. Initialize Firebase
    const firebaseService = new FirebaseService();
    // Use real config from firebase-config.js
    await firebaseService.initialize(firebaseConfig).catch(e => console.warn("Firebase Init Failed, continuing in offline mode.", e));

    // 3. Initialize other systems
    const saveSystem = new SaveSystem(firebaseService);
    const savedUsername = saveSystem.getUsername();
    if (savedUsername) {
      try {
        await saveSystem.loadSave(savedUsername);
        console.log(`Successfully auto-loaded saved progress for ${savedUsername}`);
      } catch (e) {
        console.warn("Failed to load save from Firebase during boot:", e);
      }
    }
    const leaderboardSystem = new LeaderboardSystem(firebaseService);
    const achievementSystem = new AchievementSystem();

    // 4. Store globally in Phaser Registry
    this.registry.set('firebaseService', firebaseService);
    this.registry.set('saveSystem', saveSystem);
    this.registry.set('leaderboardSystem', leaderboardSystem);
    this.registry.set('achievementSystem', achievementSystem);

    // 5. Transition to UsernameScene
    this.scene.start(SCENES.USERNAME);
  }

  createAnimationSafe(key, textureKey, start, end, frameRate, repeat) {
    if (this.anims.exists(key)) return;

    const texture = this.textures.get(textureKey);
    if (!texture || texture.key === '__MISSING') {
      Diagnostics.error(`Texture ${textureKey} not found, skipping animation ${key}`);
      console.warn(`Texture ${textureKey} not found, skipping animation ${key}`);
      return;
    }

    // Safety check frame count for valid animation generation
    let frames;
    if (texture.frameTotal > end) {
      frames = this.anims.generateFrameNumbers(textureKey, { start, end });
    } else {
      Diagnostics.error(`Texture ${textureKey} has only ${texture.frameTotal} frames. Cannot create multi-frame animation ${key}. Using frame 0.`);
      console.warn(`Texture ${textureKey} has only ${texture.frameTotal} frames. Cannot create multi-frame animation ${key}. Using frame 0.`);
      frames = [{ key: textureKey, frame: 0 }];
    }

    this.anims.create({
      key,
      frames,
      frameRate,
      repeat
    });
  }

  createAnimations() {
    this.createAnimationSafe('idle',  'YD_Idle',  0, 3, 6, -1);
    this.createAnimationSafe('walk',  'YD_Walk',  0, 7, 12, -1);
    this.createAnimationSafe('jump',  'YD_Jump',  0, 1, 8, 0);
    this.createAnimationSafe('fall',  'YD_Fall',  0, 1, 6, -1);
    this.createAnimationSafe('death', 'YD_Death', 0, 3, 8, 0);

    console.log('Character animations registered: idle, walk, jump, fall, death');
  }

  generateMissingFallbacks() {
    const makeTex = (key, color, w, h) => {
      if (this.textures.exists(key)) return;

      Diagnostics.error(`Asset '${key}' missing. Generating fallback placeholder.`);
      console.warn(`Asset '${key}' missing. Generating fallback placeholder.`);
      const g = this.add.graphics();
      g.fillStyle(color, 1);
      g.fillRect(0, 0, w, h);
      g.lineStyle(2, 0x000000, 1);
      g.strokeRect(0, 0, w, h);
      g.generateTexture(key, w, h);
      g.destroy();
    };

    // Safe fallbacks matching all used asset keys in the game
    makeTex('YD_Idle', 0xFFD43B, 48, 64);
    makeTex('YD_Walk', 0xFFD43B, 48, 64);
    makeTex('YD_Jump', 0xFFD43B, 48, 64);
    makeTex('YD_Fall', 0xFFD43B, 48, 64);
    makeTex('YD_Death', 0xFFD43B, 48, 64);
    makeTex('YD_Portrait', 0xFFD43B, 128, 128);
    makeTex('YD_Menu', 0xFFD43B, 256, 256);

    makeTex('GroundTile', 0x4CAF50, 64, 64);
    makeTex('WallTile', 0x555555, 64, 64);
    makeTex('GoalDoor', 0x795548, 64, 128);
    makeTex('CheckpointFlag', 0x8BC34A, 64, 128);

    makeTex('TRAP_StaticSpike', 0xC62828, 64, 64);
    makeTex('TRAP_MovingSpike', 0xB71C1C, 64, 64);
    makeTex('TRAP_HiddenSpike', 0xD32F2F, 64, 64);
    makeTex('TRAP_FakeFloor', 0x388E3C, 64, 64);
    makeTex('TRAP_FallingPlatform', 0x8D6E63, 128, 32);
    makeTex('TRAP_MovingPlatform', 0x607D8B, 128, 32);
    makeTex('TRAP_FakeExit', 0x4E342E, 64, 128);

    makeTex('UI_HeartFull', 0xF44336, 32, 32);
    makeTex('UI_HeartEmpty', 0x9E9E9E, 32, 32);
  }
}
