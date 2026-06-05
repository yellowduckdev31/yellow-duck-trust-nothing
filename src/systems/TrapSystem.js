/**
 * TrapSystem.js
 * 
 * Manages trap creation, behavior, and collision.
 * 
 * References: PROJECT_CONTEXT.md
 *   Section 11 — Death System (trap types)
 *   Section 21 — Level Design Rules
 *   Section 31 — Systems: TrapSystem
 *   Section 34 — Trap Assets
 */

export class TrapSystem {
  /**
   * @param {Phaser.Scene} scene - The active scene
   */
  constructor(scene) {
    this.scene = scene;
    
    // Physics groups
    this.lethalGroup = this.scene.physics.add.group({ allowGravity: false });
    this.solidGroup = this.scene.physics.add.group({ allowGravity: false, immovable: true });
    
    // Active traps that require frame-by-frame updates
    this.updatableTraps = [];
    
    // Track player for distance checks (like HiddenSpike)
    this.playerSprite = null;
  }

  /**
   * Create traps from level JSON data.
   * @param {Array} trapData - Array of trap definitions from level JSON
   */
  createTraps(trapData) {
    if (!trapData || !Array.isArray(trapData)) return;

    trapData.forEach(data => {
      switch (data.type) {
        case 'StaticSpike':
          this.createStaticSpike(data);
          break;
        case 'MovingSpike':
          this.createMovingSpike(data);
          break;
        case 'HiddenSpike':
          this.createHiddenSpike(data);
          break;
        case 'FakeFloor':
          this.createFakeFloor(data);
          break;
        case 'MovingPlatform':
          this.createMovingPlatform(data);
          break;
        case 'FakeExit':
          this.createFakeExit(data);
          break;
        
        // --- Extra traps used in levels ---
        case 'FakeSpike':
          // Looks like a spike but doesn't kill (not added to lethalGroup)
          this.scene.add.sprite(data.x, data.y, 'TRAP_StaticSpike');
          break;
        case 'InvisiblePlatform':
          this.createInvisiblePlatform(data);
          break;
        case 'FallingPlatformUp':
          this.createFallingPlatformUp(data);
          break;
        case 'SecretArea':
          this.createSecretArea(data);
          break;
        default:
          console.warn('Unknown trap type:', data.type);
      }
    });
  }

  // --- Specific Trap Creators ---

  createStaticSpike(data) {
    const spike = this.lethalGroup.create(data.x, data.y, 'TRAP_StaticSpike');
    spike.setData('deathType', 'spike');
  }

  createMovingSpike(data) {
    const spike = this.lethalGroup.create(data.x, data.y, 'TRAP_MovingSpike');
    spike.setData('deathType', 'spike');
    
    const dx = data.dx || 0;
    const dy = data.dy || 0;
    const speed = data.speed || 100;

    // Use Phaser tweens for simple back and forth
    this.scene.tweens.add({
      targets: spike,
      x: spike.x + dx,
      y: spike.y + dy,
      duration: (Math.max(Math.abs(dx), Math.abs(dy)) / speed) * 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Linear'
    });
  }

  createHiddenSpike(data) {
    // Hidden until player gets close
    const spike = this.lethalGroup.create(data.x, data.y + 32, 'TRAP_HiddenSpike');
    spike.setData('deathType', 'spike');
    spike.setVisible(false);
    
    // Custom update logic for this trap
    this.updatableTraps.push({
      sprite: spike,
      triggered: false,
      update: (trap, playerSprite) => {
        if (!trap.triggered && playerSprite) {
          const dist = Phaser.Math.Distance.Between(trap.sprite.x, trap.sprite.y, playerSprite.x, playerSprite.y);
          if (dist < 100) {
            trap.triggered = true;
            trap.sprite.setVisible(true);
            // Pop up
            this.scene.tweens.add({
              targets: trap.sprite,
              y: trap.sprite.y - 32,
              duration: 100,
              ease: 'Back.easeOut'
            });
          }
        }
      }
    });
  }

  createFakeFloor(data) {
    const floor = this.solidGroup.create(data.x, data.y, 'TRAP_FakeFloor');
    floor.setDisplaySize(data.width || 64, data.height || 64);
    floor.refreshBody();

    // The GameScene will handle the collision callback to trigger the fall
    floor.setData('isFakeFloor', true);
    floor.setData('triggered', false);
    // Store original position for reset() to restore after respawn
    floor.setData('originX', data.x);
    floor.setData('originY', data.y);
  }


  triggerFakeFloor(floorSprite) {
    if (floorSprite.getData('triggered')) return;
    floorSprite.setData('triggered', true);
    
    // Slight shake then fall
    this.scene.time.delayedCall(150, () => {
      floorSprite.body.allowGravity = true;
      floorSprite.body.immovable = false;
      // Give it some gravity to fall off-screen
      floorSprite.body.setGravityY(1000);
      
      // Stop it from colliding with player anymore
      floorSprite.body.checkCollision.none = true;
    });
  }

  createMovingPlatform(data) {
    const platform = this.solidGroup.create(data.x, data.y, 'TRAP_MovingPlatform');
    platform.setDisplaySize(data.width || 64, data.height || 64);
    platform.refreshBody();
    
    const dx = data.dx || 0;
    const dy = data.dy || 0;
    const speed = data.speed || 100;

    // Use physics velocity instead of tween so it carries the player properly
    platform.setVelocity(
      (dx > 0 ? speed : (dx < 0 ? -speed : 0)),
      (dy > 0 ? speed : (dy < 0 ? -speed : 0))
    );

    const startX = data.x;
    const startY = data.y;
    const endX = startX + dx;
    const endY = startY + dy;

    this.updatableTraps.push({
      sprite: platform,
      update: (trap) => {
        const p = trap.sprite;
        if (dx !== 0) {
          if (dx > 0 && p.x >= endX) p.setVelocityX(-speed);
          if (dx > 0 && p.x <= startX) p.setVelocityX(speed);
          if (dx < 0 && p.x <= endX) p.setVelocityX(speed);
          if (dx < 0 && p.x >= startX) p.setVelocityX(-speed);
        }
        if (dy !== 0) {
          if (dy > 0 && p.y >= endY) p.setVelocityY(-speed);
          if (dy > 0 && p.y <= startY) p.setVelocityY(speed);
          if (dy < 0 && p.y <= endY) p.setVelocityY(speed);
          if (dy < 0 && p.y >= startY) p.setVelocityY(-speed);
        }
      }
    });
  }

  createFakeExit(data) {
    // Looks like an exit, but is a lethal trap
    const exit = this.lethalGroup.create(data.x, data.y, 'GoalDoor');
    exit.setData('deathType', 'fakeExit');
  }
  
  createInvisiblePlatform(data) {
    const plat = this.solidGroup.create(data.x, data.y, 'GroundTile');
    plat.setDisplaySize(data.width || 64, data.height || 64);
    plat.refreshBody();
    plat.setAlpha(0);
    plat.setData('isInvisiblePlatform', true);
  }
  
  createFallingPlatformUp(data) {
    const plat = this.solidGroup.create(data.x, data.y, 'GroundTile');
    plat.setDisplaySize(data.width || 64, data.height || 64);
    plat.refreshBody();
    plat.setData('isFallingUp', true);
    plat.setData('triggered', false);
  }
  
  triggerFallingPlatformUp(platSprite) {
    if (platSprite.getData('triggered')) return;
    platSprite.setData('triggered', true);
    
    this.scene.time.delayedCall(100, () => {
      platSprite.body.allowGravity = false;
      platSprite.body.immovable = false;
      platSprite.body.setVelocityY(-500); // Shoot upwards
    });
  }
  
  createSecretArea(data) {
    // Hidden trigger zone for secrets
    const secret = this.scene.physics.add.sprite(data.x, data.y, null);
    secret.setDisplaySize(data.width || 100, data.height || 100);
    secret.setVisible(false);
    secret.body.allowGravity = false;
    secret.body.isSensor = true;
    
    // Can be used later by AchievementSystem
    secret.setData('isSecretArea', true);
    
    // Add to a custom group if we had one, but we'll just add it to a generic array for now
    if (!this.secretAreas) this.secretAreas = this.scene.physics.add.group();
    this.secretAreas.add(secret);
  }

  /**
   * Update trap behaviors (moving, timing, hidden reveals).
   * @param {number} time
   * @param {number} delta
   */
  update(time, delta) {
    this.updatableTraps.forEach(trap => {
      trap.update(trap, this.playerSprite);
    });
  }

  /**
   * Setup collision between player and traps.
   * @param {Phaser.Physics.Arcade.Sprite} player
   * @param {Function} onLethalHit - Callback when player hits a lethal trap
   */
  setupCollision(player, onLethalHit) {
    this.playerSprite = player;

    // 1. Lethal Traps (Spikes, Fake Exits)
    this.scene.physics.add.overlap(player, this.lethalGroup, (p, trap) => {
      const deathType = trap.getData('deathType') || 'trap';
      onLethalHit(deathType);
    });

    // 2. Solid Traps (Moving Platforms, Fake Floors)
    this.scene.physics.add.collider(player, this.solidGroup, (p, solidTrap) => {
      // Trigger fake floor if player lands on it
      if (solidTrap.getData('isFakeFloor') && p.body.touching.down && solidTrap.body.touching.up) {
        this.triggerFakeFloor(solidTrap);
      }
      
      // Reveal invisible platform when touched
      if (solidTrap.getData('isInvisiblePlatform')) {
        solidTrap.setAlpha(1);
      }
      
      // Trigger falling platform up
      if (solidTrap.getData('isFallingUp') && p.body.touching.down && solidTrap.body.touching.up) {
        this.triggerFallingPlatformUp(solidTrap);
      }
    });
    
    // 3. Secret Areas
    if (this.secretAreas) {
      this.scene.physics.add.overlap(player, this.secretAreas, (p, secretZone) => {
        if (!secretZone.getData('found')) {
          secretZone.setData('found', true);
          console.log('Secret Area Found!');
          // Here we would call AchievementSystem.unlock('FIND_SECRET_AREA')
        }
      });
    }
  }

  /**
   * Get the physics group containing solid (blocking) traps.
   * Used by GameScene to register platform colliders.
   * @returns {Phaser.Physics.Arcade.Group}
   */
  getSolidGroup() {
    return this.solidGroup;
  }

  /**
   * Get the physics group containing lethal traps.
   * Used by GameScene to register death overlap.
   * @returns {Phaser.Physics.Arcade.Group}
   */
  getLethalGroup() {
    return this.lethalGroup;
  }

  /**
   * Reset all stateful traps to their initial state.
   * Called by GameScene after a player respawn so the level
   * remains fair (hidden spikes re-hide, fake floors re-solidify).
   */
  reset() {
    // 1. Re-hide and un-trigger HiddenSpike updatable traps
    this.updatableTraps.forEach(trap => {
      if (trap.sprite && trap.sprite.getData('deathType') === 'spike') {
        // Only reset traps that have a triggered flag (HiddenSpikes)
        if ('triggered' in trap) {
          trap.triggered = false;
          trap.sprite.setVisible(false);
          // Move the spike back below the floor so it pops up again on approach
          trap.sprite.y = trap.sprite.y + 32;
        }
      }
    });

    // 2. Reset Fake Floors — restore body so player can stand on them again
    if (this.solidGroup) {
      this.solidGroup.getChildren().forEach(child => {
        if (child.getData('isFakeFloor') && child.getData('triggered')) {
          child.setData('triggered', false);
          // Re-enable gravity-resistance and collision
          child.body.allowGravity = false;
          child.body.immovable = true;
          child.body.checkCollision.none = false;
          // Restore to original Y position stored on creation
          if (child.getData('originY') !== undefined) {
            child.setPosition(child.getData('originX'), child.getData('originY'));
          }
          child.body.reset(child.x, child.y);
        }
      });
    }
  }

  destroy() {
    this.updatableTraps = [];
    this.playerSprite = null;
    if (this.lethalGroup) this.lethalGroup.destroy(true);
    if (this.solidGroup) this.solidGroup.destroy(true);
    if (this.secretAreas) this.secretAreas.destroy(true);
  }
}

