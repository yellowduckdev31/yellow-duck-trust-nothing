/**
 * UIHelper.js
 * 
 * Provides consistent UI components (Buttons, Panels) matching the game's style.
 * 
 * References: PROJECT_CONTEXT.md
 *   Section 26 — UI Style: Minimal Pixel Art, No Rounded Corners, Dark Panels, White Text, Light Gray Borders, 95% scale on press
 *   Section 24 — Color Palette
 */

import { COLORS } from '../core/config.js';

export class UIHelper {
  
  /**
   * Create a styled button.
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {string} text
   * @param {Function} onClick
   * @param {number} [width=200]
   * @param {number} [height=50]
   * @returns {Phaser.GameObjects.Container}
   */
  static createButton(scene, x, y, text, onClick, width = 200, height = 50) {
    const container = scene.add.container(x, y);

    // Dark Panel Background (No rounded corners, Light Gray Border)
    const bg = scene.add.rectangle(0, 0, width, height, 0x1A1A1A)
      .setStrokeStyle(2, 0xAAAAAA) // Light Gray border
      .setInteractive({ useHandCursor: true });

    const label = scene.add.text(0, 0, text, {
      fontFamily: 'monospace', // Placeholder for pixel art font
      fontSize: '24px',
      color: '#FFFFFF'
    }).setOrigin(0.5);

    container.add([bg, label]);

    // Button interactions
    bg.on('pointerdown', () => {
      container.setScale(0.95); // 95% scale on press
      bg.fillColor = 0x333333; // Slight highlight
    });

    bg.on('pointerup', () => {
      container.setScale(1);
      bg.fillColor = 0x1A1A1A;
      onClick();
    });

    bg.on('pointerout', () => {
      container.setScale(1);
      bg.fillColor = 0x1A1A1A;
    });

    return container;
  }

  /**
   * Create a styled dark panel.
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {number} width
   * @param {number} height
   * @returns {Phaser.GameObjects.Rectangle}
   */
  static createPanel(scene, x, y, width, height) {
    // Dark Panel, White/Gray border, no rounded corners
    return scene.add.rectangle(x, y, width, height, 0x111111, 0.9)
      .setStrokeStyle(4, 0x555555);
  }

  /**
   * Create standard text.
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {string} text
   * @param {number} [size=24]
   * @param {string} [color='#FFFFFF']
   * @returns {Phaser.GameObjects.Text}
   */
  static createText(scene, x, y, text, size = 24, color = '#FFFFFF') {
    return scene.add.text(x, y, text, {
      fontFamily: 'monospace',
      fontSize: `${size}px`,
      color: color,
      align: 'center'
    }).setOrigin(0.5);
  }
}
