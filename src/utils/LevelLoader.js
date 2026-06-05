/**
 * LevelLoader.js
 * 
 * Responsible for parsing level JSON data and generating the environment.
 * Enforces the rule: Never hardcode level layouts.
 * 
 * References: PROJECT_CONTEXT.md
 *   Section 32 — Level JSON Schema
 */

export class LevelLoader {
  /**
   * @param {Phaser.Scene} scene
   */
  constructor(scene) {
    this.scene = scene;
  }

  /**
   * Parse the level JSON and build the level components.
   * @param {object} levelData - Parsed JSON object following Section 32 schema
   * @returns {object} An object containing the generated Phaser groups and metadata
   */
  loadLevel(levelData) {
    if (!levelData) {
      throw new Error('LevelLoader: No level data provided');
    }

    // 1. Build Platforms (Static)
    const platforms = this.scene.physics.add.staticGroup();
    if (levelData.platforms && Array.isArray(levelData.platforms)) {
      levelData.platforms.forEach(plat => {
        const texture = plat.texture || 'GroundTile';
        // Note: x, y in Phaser for sprites are center coordinates by default,
        // unless origin is changed. JSON should reflect this or we adjust here.
        const p = platforms.create(plat.x, plat.y, texture);
        
        if (plat.width && plat.height) {
          p.setDisplaySize(plat.width, plat.height);
        }
        
        // Ensure physics body matches display size
        p.refreshBody();
        
        // Optional properties (e.g. for fake floors or moving platforms handled elsewhere)
        if (plat.properties) {
          p.setData('properties', plat.properties);
        }
      });
    }

    // 2. Setup Checkpoints (Static Sensors)
    const checkpoints = this.scene.physics.add.staticGroup();
    if (levelData.checkpoints && Array.isArray(levelData.checkpoints)) {
      levelData.checkpoints.forEach(cp => {
        const c = checkpoints.create(cp.x, cp.y, 'CheckpointFlag');
        // Checkpoints shouldn't block the player, they act as triggers
        c.body.isSensor = true; 
        if (cp.id) c.setData('id', cp.id);
      });
    }

    // 3. Goal Door (Static Sensor)
    let goal = null;
    if (levelData.goal) {
      goal = this.scene.physics.add.staticSprite(levelData.goal.x, levelData.goal.y, 'GoalDoor');
      // Set to sensor so player walks 'into' the door rather than hitting it like a wall
      goal.body.isSensor = true; 
    }

    // 4. Traps Data (to be passed to TrapSystem)
    // We just return the raw data because TrapSystem will instantiate the complex behaviors
    const trapsData = levelData.traps || [];

    return {
      levelId: levelData.level,
      name: levelData.name,
      spawn: levelData.spawn, // {x, y}
      goal: goal,
      platforms: platforms,
      checkpoints: checkpoints,
      trapsData: trapsData
    };
  }
}
