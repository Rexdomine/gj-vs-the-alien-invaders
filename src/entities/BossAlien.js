import Phaser from 'phaser';
import { BOSS_HP, BOSS_SPEED, BOSS_DAMAGE, BOSS_CONTACT_COOLDOWN, BOSS_SCORE } from '../game/config.js';

export class BossAlien extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'boss');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(true);
    this.hp = BOSS_HP;
    this.lastContact = 0;
    this.setScale(1.5);
    this.setDepth(5);
  }

  update(time, delta) {
    super.update(time, delta);
    const player = this.scene.player;
    if (!player || !player.active) return;

    // Slower, heavier pursuit
    if (this.x < player.x - 40) {
      this.setVelocityX(BOSS_SPEED);
      this.setFlipX(false);
    } else if (this.x > player.x + 40) {
      this.setVelocityX(-BOSS_SPEED);
      this.setFlipX(true);
    } else {
      this.setVelocityX(0);
    }

    this.setVelocityY(Math.sin(time / 500) * 30);
  }

  takeHit(amount, scene) {
    this.hp -= amount;
    this.setTint(0xffaa00);
    scene.time.delayedCall(120, () => this.clearTint());
    if (this.hp <= 0) {
      this.setActive(false);
      this.setVisible(false);
      if (scene.player && scene.player.active) {
        scene.player.addScore(BOSS_SCORE, scene);
      }
      scene.events.emit('boss-dead');
    }
  }
}
