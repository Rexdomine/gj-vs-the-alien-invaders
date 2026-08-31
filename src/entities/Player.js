import Phaser from 'phaser';
import {
  PLAYER_SPEED, PLAYER_JUMP, PLAYER_GRAVITY,
  PLAYER_MAX_HP, ATTACK_DAMAGE, ATTACK_COOLDOWN, ATTACK_RANGE_X, ATTACK_RANGE_Y,
  SPECIAL_DAMAGE, SPECIAL_COOLDOWN, SPECIAL_RANGE_X, SPECIAL_RANGE_Y,
} from '../game/config.js';

export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'player');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(true);
    this.body.setGravityY(PLAYER_GRAVITY);
    this.setBounce(0.05);
    this.setScale(1.3);

    this.hp = PLAYER_MAX_HP;
    this.score = 0;
    this.facing = 'right';

    this.lastAttack = 0;
    this.lastSpecial = 0;
    this.isAttacking = false;
    this.attackTimer = null;
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    // Reset attack state after brief animation window
    if (this.isAttacking && time - this.lastAttack > 200) {
      this.isAttacking = false;
    }
  }

  moveLeft() {
    this.setVelocityX(-PLAYER_SPEED);
    if (this.facing !== 'left') this.setFlipX(true);
    this.facing = 'left';
  }
  moveRight() {
    this.setVelocityX(PLAYER_SPEED);
    if (this.facing !== 'right') this.setFlipX(false);
    this.facing = 'right';
  }
  stop() {
    if (Math.abs(this.body.velocity.x) < 20) this.setVelocityX(0);
  }
  jump() {
    if (this.body.touching.down || this.body.blocked.down) {
      this.setVelocityY(PLAYER_JUMP);
    }
  }

  canAttack() { return Date.now() - this.lastAttack > ATTACK_COOLDOWN; }
  canSpecial() { return Date.now() - this.lastSpecial > SPECIAL_COOLDOWN; }

  doAttack(scene, targetGroup) {
    if (!this.canAttack()) return;
    this.isAttacking = true;
    this.lastAttack = Date.now();

    const cx = this.x + (this.facing === 'right' ? ATTACK_RANGE_X / 2 : -ATTACK_RANGE_X / 2);
    const cy = this.y;
    const hitbox = scene.add.rectangle(cx, cy, ATTACK_RANGE_X, ATTACK_RANGE_Y).setVisible(false);
    scene.physics.add.existing(hitbox);

    scene.physics.overlap(hitbox, targetGroup, (hitboxObj, target) => {
      if (target.active && target.hp > 0) {
        target.takeHit(ATTACK_DAMAGE, scene);
      }
    });

    // Visual hit flash on target (simple)
    scene.time.delayedCall(150, () => { if (hitbox) hitbox.destroy(); });

    // Small punch visual
    const punch = scene.add.circle(this.x + (this.facing === 'right' ? 40 : -40), this.y, 10, 0xffffff, 0.8);
    scene.tweens.add({ targets: punch, alpha: 0, scale: 2, duration: 150, onComplete: () => punch.destroy() });
  }

  doSpecial(scene, targetGroup) {
    if (!this.canSpecial()) return;
    this.isAttacking = true;
    this.lastSpecial = Date.now();

    const cx = this.x + (this.facing === 'right' ? SPECIAL_RANGE_X / 2 : -SPECIAL_RANGE_X / 2);
    const hitbox = scene.add.rectangle(cx, this.y, SPECIAL_RANGE_X, SPECIAL_RANGE_Y).setVisible(false);
    scene.physics.add.existing(hitbox);

    scene.physics.overlap(hitbox, targetGroup, (hitboxObj, target) => {
      if (target.active && target.hp > 0) {
        target.takeHit(SPECIAL_DAMAGE, scene);
      }
    });

    scene.time.delayedCall(200, () => { if (hitbox) hitbox.destroy(); });

    // Energy blast visual
    const blast = scene.add.image(this.x + (this.facing === 'right' ? 60 : -60), this.y, 'blast').setScale(1.2);
    blast.setDepth(10);
    scene.tweens.add({ targets: blast, x: cx + (this.facing === 'right' ? 60 : -60), alpha: 0, duration: 300, onComplete: () => blast.destroy() });
  }

  doAttackSingle(scene, target) {
    if (!this.canAttack()) return;
    this.isAttacking = true;
    this.lastAttack = Date.now();
    const cx = this.x + (this.facing === 'right' ? ATTACK_RANGE_X / 2 : -ATTACK_RANGE_X / 2);
    const cy = this.y;
    const hitbox = scene.add.rectangle(cx, cy, ATTACK_RANGE_X, ATTACK_RANGE_Y).setVisible(false);
    scene.physics.add.existing(hitbox);
    scene.physics.overlap(hitbox, target, () => {
      if (target.active && target.hp > 0) {
        target.takeHit(ATTACK_DAMAGE, scene);
      }
      scene.time.delayedCall(150, () => { if (hitbox) hitbox.destroy(); });
    });
    const punch = scene.add.circle(this.x + (this.facing === 'right' ? 40 : -40), this.y, 10, 0xffffff, 0.8);
    scene.tweens.add({ targets: punch, alpha: 0, scale: 2, duration: 150, onComplete: () => punch.destroy() });
  }

  doSpecialSingle(scene, target) {
    if (!this.canSpecial()) return;
    this.isAttacking = true;
    this.lastSpecial = Date.now();
    const cx = this.x + (this.facing === 'right' ? SPECIAL_RANGE_X / 2 : -SPECIAL_RANGE_X / 2);
    const hitbox = scene.add.rectangle(cx, this.y, SPECIAL_RANGE_X, SPECIAL_RANGE_Y).setVisible(false);
    scene.physics.add.existing(hitbox);
    scene.physics.overlap(hitbox, target, () => {
      if (target.active && target.hp > 0) {
        target.takeHit(SPECIAL_DAMAGE, scene);
      }
      scene.time.delayedCall(200, () => { if (hitbox) hitbox.destroy(); });
    });
    const blast = scene.add.image(this.x + (this.facing === 'right' ? 60 : -60), this.y, 'blast').setScale(1.2);
    blast.setDepth(10);
    scene.tweens.add({ targets: blast, x: cx + (this.facing === 'right' ? 60 : -60), alpha: 0, duration: 300, onComplete: () => blast.destroy() });
  }

  takeHit(amount, scene) {
    this.hp = Math.max(0, this.hp - amount);
    // Red flash
    this.setTint(0xff0000);
    scene.time.delayedCall(150, () => this.clearTint());
    if (this.hp <= 0) {
      this.setActive(false);
      this.setVisible(false);
      scene.events.emit('player-dead');
    }
  }

  addScore(points, scene) {
    this.score += points;
    scene.events.emit('score-change', this.score);
  }
}
