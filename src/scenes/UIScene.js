import { SCENES } from '../core/config.js';

export class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UIScene' });
  }

  create() {
    console.log('UI loaded');
    this.scene.bringToTop();
    this.createTouchUI();
  }

  createTouchUI() {
    const { width, height } = this.scale;
    const buttonAlpha = 0.5;

    const gameScene = this.scene.get(SCENES.GAME);
    if (!gameScene || !gameScene.inputSystem) return;

    const createButton = (x, y, radius, label, actionKey) => {
      const bg = this.add.circle(x, y, radius, 0xffffff, buttonAlpha)
        .setInteractive()
        .setDepth(1000);

      this.add.text(x, y, label, { 
        fontSize: '24px', color: '#000000', fontStyle: 'bold' 
      }).setOrigin(0.5).setDepth(1001);

      bg.on('pointerdown', () => {
        bg.setAlpha(0.8);
        gameScene.inputSystem.virtualInput[actionKey] = true;
      });

      const releaseHandler = () => {
        bg.setAlpha(buttonAlpha);
        gameScene.inputSystem.virtualInput[actionKey] = false;
      };

      bg.on('pointerup', releaseHandler);
      bg.on('pointerout', releaseHandler);
    };

    createButton(100, height - 100, 50, '<', 'left');
    createButton(220, height - 100, 50, '>', 'right');
    createButton(width - 100, height - 100, 50, 'JUMP', 'jump');
  }
}
