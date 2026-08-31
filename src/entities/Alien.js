import Phaser from 'phaser';
import { ALIEN_HP, ALIEN_SPEED, ALIEN_DAMAGE, ALIEN_CONTACT_COOLDOWN, ALIEN_SCORE } from '../game/config.js';

export class Alien extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'alien');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(true);
    this.hp = ALIEN_HP;
    this.lastContact = 0;
    this.setScale(1.1);
  }

  update(time, delta) {
    super.update(time, delta);
    const player = this.scene.player;
    if (!player || !player.active) return;

    // Simple pursuit AI: move toward player horizontally
    if (this.x < player.x) {
      this.setVelocityX(ALIEN_SPEED);
      this.setFlipX(false);
    } else if (this.x > player.x) {
      this.setVelocityX(-ALIEN_SPEED);
      this.setFlipX(true);
    } else {
      this.setVelocityX(0);
    }

    // Gentle vertical bob
    this.setVelocityY(Math.sin(time / 300) * 40);
  }

  takeHit(amount, scene) {
    this.hp -= amount;
    this.setTint(0xffaa00);
    scene.time.delayedCall(120, () => this.clearTint());
    if (this.hp <= 0) {
      this.setActive(false);
      this.setVisible(false);
      if (this.body) {
        this.body.enable = false;
        this.setVelocity(0, 0);
      }
      scene.events.emit('alien-defeated');
      // Score via player reference if available
      if (scene.player && scene.player.active) {
        scene.player.addScore(ALIEN_SCORE, scene);
      }
      // Small pop effect
      const pop = scene.add.particles('star', 8, { x: this.x, y: this.y, speed: 40, scale: 0.5, lifespan: 300 });
      scene.time.delayedCall(350, () => { if (pop) pop.destroy(); });
    }
  }
}
