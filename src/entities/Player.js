import Phaser from 'phaser';
import {
  PLAYER_SPEED, PLAYER_JUMP, PLAYER_GRAVITY,
  PLAYER_MAX_HP, ATTACK_DAMAGE, ATTACK_COOLDOWN, ATTACK_RANGE_X, ATTACK_RANGE_Y,
  SPECIAL_DAMAGE, SPECIAL_COOLDOWN, SPECIAL_PROJECTILE_SPEED, SPECIAL_PROJECTILE_LIFETIME,
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
    this.setVelocityX(0);
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

  doSpecial(scene) {
    if (!this.canSpecial()) return null;
    this.isAttacking = true;
    this.lastSpecial = Date.now();

    const dir = this.facing === 'right' ? 1 : -1;
    const blast = scene.physics.add.image(this.x + dir * 60, this.y - 10, 'blast').setScale(1.2);
    scene.projectiles?.add(blast);
    blast.setDepth(12);
    blast.body.allowGravity = false;
    blast.setVelocityX(dir * SPECIAL_PROJECTILE_SPEED);
    blast.setData('damage', SPECIAL_DAMAGE);
    blast.setData('hitTargets', new Set());

    scene.tweens.add({
      targets: blast,
      angle: dir * 360,
      alpha: { from: 1, to: 0.92 },
      duration: 220,
      yoyo: true,
      repeat: Math.ceil(SPECIAL_PROJECTILE_LIFETIME / 220),
    });

    scene.time.delayedCall(SPECIAL_PROJECTILE_LIFETIME, () => {
      if (blast && blast.active) {
        blast.destroy();
      }
    });

    return blast;
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
    return this.doSpecial(scene);
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
