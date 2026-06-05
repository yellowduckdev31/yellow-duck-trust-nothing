/**
 * InputSystem.js
 * 
 * Manages desktop and mobile input.
 * 
 * References: PROJECT_CONTEXT.md
 *   Section 07 — Controls
 *   Section 31 — Systems: InputSystem
 */

export class InputSystem {
  /**
   * @param {Phaser.Scene} scene - The active scene
   */
  constructor(scene) {
    this.scene = scene;
    this.cursors = null;
    this.keys = {};
    this.isMobile = !this.scene.sys.game.device.os.desktop;

    // Virtual button state (mobile)
    this.virtualInput = {
      left: false,
      right: false,
      jump: false,
    };
    
    this.buttons = []; // Keep track of UI elements for cleanup
  }

  /**
   * Setup input bindings for desktop and mobile.
   * @param {Function} [onPauseCallback] - Callback triggered when pause is pressed
   */
  setup(onPauseCallback) {
    // 1. Desktop Keyboard Input
    this.cursors = this.scene.input.keyboard.createCursorKeys();
    
    this.keys = {
      W: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      D: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      SPACE: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
      ESC: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)
    };

    if (onPauseCallback) {
      this.keys.ESC.on('down', onPauseCallback);
    }

    // 2. Mobile Virtual Buttons (Section 07)
    // Create them regardless of isMobile flag to ensure they work if testing mobile layout on desktop,
    // but typically we'd only show them if isMobile or touch is enabled.
    // For safety, we check if pointer input is active/device has touch.
    if (this.isMobile || this.scene.sys.game.device.input.touch) {
      this.createVirtualButtons(onPauseCallback);
    }
  }

  /**
   * Create on-screen virtual buttons for mobile devices.
   * @private
   * @param {Function} onPauseCallback
   */
  createVirtualButtons(onPauseCallback) {
    const { width, height } = this.scene.scale;
    const buttonAlpha = 0.5;

    // Helper to create a virtual button
    const createButton = (x, y, radius, label, actionKey) => {
      // Create a semi-transparent circular button
      const bg = this.scene.add.circle(x, y, radius, 0xffffff, buttonAlpha)
        .setScrollFactor(0)
        .setInteractive()
        .setDepth(1000); // Ensure UI is on top

      // Create a label or icon (placeholder text for now)
      const text = this.scene.add.text(x, y, label, { 
        fontSize: '24px', 
        color: '#000000', 
        fontStyle: 'bold' 
      }).setOrigin(0.5).setScrollFactor(0).setDepth(1001);

      // Handle interaction
      bg.on('pointerdown', () => {
        bg.setAlpha(0.8);
        this.virtualInput[actionKey] = true;
      });

      const releaseHandler = () => {
        bg.setAlpha(buttonAlpha);
        this.virtualInput[actionKey] = false;
      };

      bg.on('pointerup', releaseHandler);
      bg.on('pointerout', releaseHandler);

      this.buttons.push(bg, text);
    };

    // Virtual Left Button
    createButton(100, height - 100, 50, '<', 'left');
    
    // Virtual Right Button
    createButton(220, height - 100, 50, '>', 'right');
    
    // Virtual Jump Button
    createButton(width - 100, height - 100, 50, 'JUMP', 'jump');

    // Pause Button
    const pauseBg = this.scene.add.rectangle(width - 60, 60, 60, 60, 0xffffff, buttonAlpha)
      .setScrollFactor(0)
      .setInteractive()
      .setDepth(1000);
      
    const pauseText = this.scene.add.text(width - 60, 60, '||', { 
      fontSize: '24px', 
      color: '#000000', 
      fontStyle: 'bold' 
    }).setOrigin(0.5).setScrollFactor(0).setDepth(1001);

    pauseBg.on('pointerdown', () => {
      pauseBg.setAlpha(0.8);
    });

    pauseBg.on('pointerup', () => {
      pauseBg.setAlpha(buttonAlpha);
      if (onPauseCallback) onPauseCallback();
    });
    
    pauseBg.on('pointerout', () => {
      pauseBg.setAlpha(buttonAlpha);
    });

    this.buttons.push(pauseBg, pauseText);
  }

  /**
   * Get current input state.
   * Merges desktop and mobile inputs.
   * @returns {{ left: boolean, right: boolean, jump: boolean }}
   */
  getInput() {
    // Left: A key OR Left Arrow OR Virtual Left
    const left = this.keys.A?.isDown || this.cursors?.left.isDown || this.virtualInput.left;
    
    // Right: D key OR Right Arrow OR Virtual Right
    const right = this.keys.D?.isDown || this.cursors?.right.isDown || this.virtualInput.right;
    
    // Jump: W key OR Space OR Up Arrow OR Virtual Jump
    const jump = this.keys.W?.isDown || this.keys.SPACE?.isDown || this.cursors?.up.isDown || this.virtualInput.jump;

    return { left, right, jump };
  }
  
  /**
   * Reset inputs (useful for pause/resume)
   */
  resetInputs() {
    this.virtualInput.left = false;
    this.virtualInput.right = false;
    this.virtualInput.jump = false;
    
    if (this.cursors) {
      this.cursors.left.reset();
      this.cursors.right.reset();
      this.cursors.up.reset();
    }
    
    if (this.keys.A) this.keys.A.reset();
    if (this.keys.D) this.keys.D.reset();
    if (this.keys.W) this.keys.W.reset();
    if (this.keys.SPACE) this.keys.SPACE.reset();
  }

  /**
   * Clean up input listeners and virtual buttons.
   */
  destroy() {
    // Remove ESC key listener
    if (this.keys.ESC) {
      this.keys.ESC.off('down');
    }

    // Destroy virtual button objects
    this.buttons.forEach(obj => {
      if (obj && typeof obj.destroy === 'function') {
        obj.destroy();
      }
    });
    this.buttons = [];
  }
}


