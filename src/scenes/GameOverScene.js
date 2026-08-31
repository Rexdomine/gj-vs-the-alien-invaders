import Phaser from 'phaser';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOver');
  }

  create() {
    const cx = this.cameras.main.width / 2;
    const cy = this.cameras.main.height / 2;
    this.cameras.main.setBackgroundColor('#1c0a0a');

    // Red-tinted stars
    for (let i = 0; i < 25; i++) {
      this.add.image(Phaser.Math.Between(20, 780), Phaser.Math.Between(20, 580), 'star')
        .setAlpha(Phaser.Math.FloatBetween(0.3, 0.7))
        .setScale(Phaser.Math.FloatBetween(0.4, 1.0));
    }

    this.add.text(cx, 160, 'GAME OVER', {
      fontFamily: 'Georgia, serif',
      fontSize: '68px',
      color: '#ef4444',
      stroke: '#000',
      strokeThickness: 6,
    }).setOrigin(0.5);

    this.add.text(cx, 240, 'The aliens got GJ...', {
      fontFamily: 'Segoe UI',
      fontSize: '26px',
      color: '#fca5a5',
    }).setOrigin(0.5);

    this.add.text(cx, 285, 'But the city needs GJ to try again!', {
      fontFamily: 'Segoe UI',
      fontSize: '18px',
      color: '#fecaca',
    }).setOrigin(0.5);

    const btn = this.add.rectangle(cx, 370, 240, 65, 0xdc2626).setStrokeStyle(3, 0x7f1d1d);
    this.add.text(cx, 370, 'TRY AGAIN', {
      fontFamily: 'Segoe UI',
      fontSize: '24px',
      color: '#fff',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    btn.setInteractive({ useHandCursor: true });
    btn.on('pointerover', () => btn.setFillStyle(0xb91c1c));
    btn.on('pointerout', () => btn.setFillStyle(0xdc2626));
    btn.on('pointerdown', () => this.scene.start('Game'));

    this.add.text(cx, 450, 'Press SPACE or ENTER to restart', {
      fontFamily: 'Courier New',
      fontSize: '16px',
      color: '#f87171',
    }).setOrigin(0.5);

    // Aliens looming
    this.add.image(120, 420, 'alien').setScale(1.5).setAlpha(0.5);
    this.add.image(680, 420, 'alien').setScale(1.5).setAlpha(0.5).setFlipX(true);

    this.input.keyboard.once('keydown-SPACE', () => this.scene.start('Game'));
    this.input.keyboard.once('keydown-ENTER', () => this.scene.start('Game'));
  }
}
