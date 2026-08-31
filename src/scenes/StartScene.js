import Phaser from 'phaser';

export class StartScene extends Phaser.Scene {
  constructor() {
    super('Start');
  }

  create() {
    const cx = this.cameras.main.width / 2;
    const cy = this.cameras.main.height / 2;

    // Sky background gradient (drawn as colored rectangles)
    this.cameras.main.setBackgroundColor('#1e1b4b');
    for (let i = 0; i < 20; i++) {
      this.add.image(Phaser.Math.Between(20, 780), Phaser.Math.Between(20, 580), 'star')
        .setAlpha(Phaser.Math.FloatBetween(0.4, 1.0))
        .setScale(Phaser.Math.FloatBetween(0.5, 1.4));
    }

    // Title
    this.add.text(cx, 140, 'GJ vs', {
      fontFamily: 'Georgia, serif',
      fontSize: '72px',
      color: '#fbbf24',
      stroke: '#000',
      strokeThickness: 6,
    }).setOrigin(0.5);

    this.add.text(cx, 210, 'The Alien Invaders', {
      fontFamily: 'Georgia, serif',
      fontSize: '40px',
      color: '#ef4444',
      stroke: '#000',
      strokeThickness: 5,
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(cx, 280, 'A neighborhood superhero adventure', {
      fontFamily: 'Segoe UI',
      fontSize: '18px',
      color: '#fcd34d',
    }).setOrigin(0.5);

    // Start button (interactive rect)
    const btn = this.add.rectangle(cx, 380, 240, 70, 0x10b981).setStrokeStyle(3, 0x065f46);
    this.add.text(cx, 380, 'START GAME', {
      fontFamily: 'Segoe UI',
      fontSize: '26px',
      color: '#fff',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    btn.setInteractive({ useHandCursor: true });
    btn.on('pointerover', () => btn.setFillStyle(0x059669));
    btn.on('pointerout', () => btn.setFillStyle(0x10b981));
    btn.on('pointerdown', () => this.scene.start('Game'));

    // Controls help
    this.add.text(cx, 460, 'Controls:', {
      fontFamily: 'Segoe UI',
      fontSize: '20px',
      color: '#fff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(cx, 490, '← →  Move    SPACE  Jump    Z  Attack    X  Energy Kick', {
      fontFamily: 'Courier New',
      fontSize: '16px',
      color: '#a7f3d0',
    }).setOrigin(0.5);

    this.add.text(cx, 520, 'Defeat aliens, score points, and bring down the boss to win!', {
      fontFamily: 'Segoe UI',
      fontSize: '14px',
      color: '#fde68a',
    }).setOrigin(0.5);

    // Decorative aliens
    this.add.image(100, 470, 'alien').setScale(1.2);
    this.add.image(700, 470, 'alien').setScale(1.2).setFlipX(true);

    // Press any key to start
    this.input.keyboard.once('keydown-SPACE', () => this.scene.start('Game'));
    this.input.keyboard.once('keydown-ENTER', () => this.scene.start('Game'));
  }
}