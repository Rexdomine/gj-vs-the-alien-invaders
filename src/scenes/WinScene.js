import Phaser from 'phaser';

export class WinScene extends Phaser.Scene {
  constructor() {
    super('Win');
  }

  create() {
    const cx = this.cameras.main.width / 2;
    const cy = this.cameras.main.height / 2;
    this.cameras.main.setBackgroundColor('#0f2027');

    // Stars
    for (let i = 0; i < 30; i++) {
      this.add.image(Phaser.Math.Between(20, 780), Phaser.Math.Between(20, 580), 'star')
        .setAlpha(Phaser.Math.FloatBetween(0.5, 1.0))
        .setScale(Phaser.Math.FloatBetween(0.6, 1.5));
    }

    this.add.text(cx, 160, '🎉 YOU WIN! 🎉', {
      fontFamily: 'Georgia, serif',
      fontSize: '64px',
      color: '#fbbf24',
      stroke: '#000',
      strokeThickness: 6,
    }).setOrigin(0.5);

    this.add.text(cx, 240, 'The aliens have been defeated!', {
      fontFamily: 'Segoe UI',
      fontSize: '26px',
      color: '#a7f3d0',
    }).setOrigin(0.5);

    this.add.text(cx, 290, 'GJ saves the city once again.', {
      fontFamily: 'Segoe UI',
      fontSize: '20px',
      color: '#6ee7b7',
    }).setOrigin(0.5);

    const btn = this.add.rectangle(cx, 390, 240, 65, 0x10b981).setStrokeStyle(3, 0x065f46);
    this.add.text(cx, 390, 'PLAY AGAIN', {
      fontFamily: 'Segoe UI',
      fontSize: '24px',
      color: '#fff',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    btn.setInteractive({ useHandCursor: true });
    btn.on('pointerover', () => btn.setFillStyle(0x059669));
    btn.on('pointerout', () => btn.setFillStyle(0x10b981));
    btn.on('pointerdown', () => this.scene.start('Game'));

    this.add.text(cx, 500, 'GJ — The Neighborhood Superhero', {
      fontFamily: 'Georgia',
      fontSize: '16px',
      color: '#fcd34d',
    }).setOrigin(0.5);

    this.add.text(cx, 530, 'Inspired by a child\'s drawings', {
      fontFamily: 'Segoe UI',
      fontSize: '14px',
      color: '#86efac',
    }).setOrigin(0.5);

    // Decorative player
    this.add.image(cx, 440, 'player').setScale(1.5);
    this.add.image(cx - 100, 450, 'alien').setAlpha(0.4).setScale(1.0);
    this.add.image(cx + 100, 450, 'alien').setAlpha(0.4).setScale(1.0);

    this.input.keyboard.once('keydown-SPACE', () => this.scene.start('Game'));
    this.input.keyboard.once('keydown-ENTER', () => this.scene.start('Game'));
  }
}
