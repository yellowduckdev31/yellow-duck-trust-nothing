/**
 * GameScene.js
 * 
 * Core gameplay scene.
 * Responsible for:
 *   - Loading level data from JSON
 *   - Creating the player
 *   - Setting up platforms, traps, checkpoints, goal
 *   - Managing player input
 *   - Death/respawn cycle
 *   - Checkpoint activation
 *   - Level completion detection
 *   - HUD display
 * 
 * References: PROJECT_CONTEXT.md
 */

import { SCENES, GAME_CONFIG, COLORS_HEX } from '../core/config.js';
import { UIHelper } from '../ui/UIHelper.js';
import { LevelLoader } from '../utils/LevelLoader.js';

import { PlayerSystem } from '../systems/PlayerSystem.js';
import { TrapSystem } from '../systems/TrapSystem.js';
import { DeathSystem } from '../systems/DeathSystem.js';
import { InputSystem } from '../systems/InputSystem.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.GAME });
  }

  init(data) {
    this.currentLevel = data.level || 1;
    this.saveSystem = this.registry.get('saveSystem');
    
    // Level specific transient stats
    this.stats = {
      lives: this.saveSystem ? this.saveSystem.data.lives : GAME_CONFIG.STARTING_LIVES,
      score: 0,
      deaths: 0,
      time: 0, // In seconds
      usedCheckpoints: 0,
      triggerFakeExit: false,
      triggerFakeFloor: false
    };

    this.isLevelComplete = false;
    this.isPaused = false;
    this.currentCheckpoint = null;
  }

  create() {
    // 1. Load Data & Environment
    const levelData = this.cache.json.get(`level_${this.currentLevel}`);
    if (!levelData) {
      console.error(`Level data for level_${this.currentLevel} not found in cache!`);
      this.scene.start(SCENES.MAIN_MENU);
      return;
    }

    const levelLoader = new LevelLoader(this);
    this.levelEnvironment = levelLoader.loadLevel(levelData);

    // 2. Instantiate Systems
    this.playerSystem = new PlayerSystem(this);
    this.trapSystem = new TrapSystem(this);
    this.deathSystem = new DeathSystem(this);
    this.inputSystem = new InputSystem(this);

    // 3. Setup Player
    this.currentCheckpoint = { x: this.levelEnvironment.spawn.x, y: this.levelEnvironment.spawn.y };
    this.playerSystem.createPlayer(this.currentCheckpoint.x, this.currentCheckpoint.y);
    const playerSprite = this.playerSystem.getPlayer().getSprite();

    // 4. Setup Traps & Environment
    this.trapSystem.createTraps(this.levelEnvironment.trapsData);
    
    // Physics Layers
    this.physics.add.collider(playerSprite, this.levelEnvironment.solidGroup);
    this.physics.add.collider(playerSprite, this.trapSystem.getSolidGroup());

    // Death Collisions
    this.physics.add.overlap(playerSprite, this.trapSystem.getLethalGroup(), (p, t) => {
      if (t.getData('type') === 'TRAP_FakeFloor') this.stats.triggerFakeFloor = true;
      if (t.getData('type') === 'TRAP_FakeExit') this.stats.triggerFakeExit = true;
      this.onPlayerDeath('trap');
    });

    // Checkpoint Overlap
    this.physics.add.overlap(playerSprite, this.levelEnvironment.checkpointGroup, (p, flag) => {
      if (!flag.getData('activated')) {
        flag.setData('activated', true);
        flag.setTint(0x00FF00); // Visual indicator
        this.currentCheckpoint = { x: flag.x, y: flag.y };
        this.stats.usedCheckpoints++;
        // Play SFX_Checkpoint
      }
    });

    // Goal Door Overlap
    this.physics.add.overlap(playerSprite, this.levelEnvironment.goalDoor, () => {
      this.onLevelComplete();
    });

    // 5. Setup Camera
    this.cameras.main.setBounds(0, 0, this.levelEnvironment.width, this.levelEnvironment.height);
    this.physics.world.setBounds(0, 0, this.levelEnvironment.width, this.levelEnvironment.height + 200);
    this.cameras.main.startFollow(playerSprite, true, GAME_CONFIG.CAMERA.LERP, GAME_CONFIG.CAMERA.LERP);

    // 6. Setup HUD
    this.createHUD();

    // 7. Inputs & Events
    this.input.keyboard.on('keydown-ESC', () => this.onPause());
    this.events.on('resume', () => this.onResume());
    this.events.on('shutdown', this.onShutdown, this);

    // Setup input system after creation
    this.inputSystem.setup(() => this.onPause());

    // Play BGM
    // this.sound.play('BGM_Gameplay', { loop: true });
  }

  update(time, delta) {
    if (this.isLevelComplete || this.isPaused) return;

    // Timer
    this.stats.time += delta / 1000;
    this.updateHUD();

    const player = this.playerSystem.getPlayer();
    if (!player || !player.isAlive) return;

    const inputState = this.inputSystem.getInput();
    this.playerSystem.update(inputState);
    this.trapSystem.update(time, delta);

    // Check bounds (Fall death)
    const sprite = player.getSprite();
    if (sprite.y > this.physics.world.bounds.bottom - 50) {
      this.onPlayerDeath('fall');
    }
  }

  createHUD() {
    const { width } = this.scale;

    this.add.rectangle(0, 0, width, 40, 0x000000, 0.7)
      .setOrigin(0).setScrollFactor(0).setDepth(2000);

    this.hudLivesText = UIHelper.createText(this, 20, 20, `LIVES: ${this.stats.lives}`, 20, COLORS_HEX.WHITE)
      .setOrigin(0, 0.5).setScrollFactor(0).setDepth(2001);

    this.hudScoreText = UIHelper.createText(this, 180, 20, `LEVEL: ${this.currentLevel}`, 20, COLORS_HEX.YELLOW)
      .setOrigin(0, 0.5).setScrollFactor(0).setDepth(2001);
      
    this.hudDeathsText = UIHelper.createText(this, 350, 20, `DEATHS: ${this.stats.deaths}`, 20, COLORS_HEX.SPIKE_RED)
      .setOrigin(0, 0.5).setScrollFactor(0).setDepth(2001);

    this.hudTimeText = UIHelper.createText(this, width - 20, 20, `TIME: 0:00`, 20, COLORS_HEX.WHITE)
      .setOrigin(1, 0.5).setScrollFactor(0).setDepth(2001);
  }

  updateHUD() {
    if (!this.hudTimeText) return;
    this.hudLivesText.setText(`LIVES: ${this.stats.lives}`);
    this.hudDeathsText.setText(`DEATHS: ${this.stats.deaths}`);
    
    const minutes = Math.floor(this.stats.time / 60);
    const seconds = Math.floor(this.stats.time % 60);
    this.hudTimeText.setText(`TIME: ${minutes}:${seconds.toString().padStart(2, '0')}`);
  }

  onPlayerDeath(deathType) {
    const player = this.playerSystem.getPlayer();
    if (!player || !player.isAlive) return;

    this.stats.deaths++;
    this.stats.lives = this.playerSystem.die();
    this.updateHUD();

    if (this.stats.lives <= 0) {
      this.onGameOver();
      return;
    }

    this.deathSystem.execute(deathType, player.getSprite(), () => {
      this.playerSystem.respawn(this.currentCheckpoint.x, this.currentCheckpoint.y);
      this.trapSystem.reset(); // Reset traps to initial state
    });
  }

  onLevelComplete() {
    if (this.isLevelComplete) return;
    this.isLevelComplete = true;
    
    const playerSprite = this.playerSystem.getPlayer().getSprite();
    playerSprite.setVelocity(0, 0);
    playerSprite.body.allowGravity = false;

    // Launch overlay
    this.scene.pause();
    this.scene.launch(SCENES.LEVEL_COMPLETE, {
      level: this.currentLevel,
      score: this.stats.score,
      time: this.stats.time,
      deaths: this.stats.deaths,
      usedCheckpoints: this.stats.usedCheckpoints,
      triggerFakeExit: this.stats.triggerFakeExit,
      triggerFakeFloor: this.stats.triggerFakeFloor
    });
  }

  onGameOver() {
    this.isLevelComplete = true;
    // Launch game over overlay
    this.scene.pause();
    this.scene.launch(SCENES.GAME_OVER, {
      level: this.currentLevel,
      deaths: this.stats.deaths,
      score: this.stats.score
    });
  }

  onPause() {
    this.isPaused = true;
    this.scene.pause();
    this.scene.launch(SCENES.PAUSE, { level: this.currentLevel });
  }

  onResume() {
    this.isPaused = false;
    this.inputSystem.resetInputs(); // Prevent key sticking after pause
  }

  onShutdown() {
    // Cleanup to prevent memory leaks
    if (this.playerSystem) this.playerSystem.destroy();
    if (this.trapSystem) this.trapSystem.destroy();
    if (this.inputSystem) this.inputSystem.destroy();
    if (this.deathSystem) this.deathSystem.destroy();
  }
}


