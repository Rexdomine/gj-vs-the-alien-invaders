import Phaser from 'phaser';
import {
  PLAYER_SPEED, PLAYER_JUMP, PLAYER_GRAVITY,
  PLAYER_MAX_HP, ATTACK_DAMAGE, ATTACK_COOLDOWN,
  SPECIAL_DAMAGE, SPECIAL_COOLDOWN, SPECIAL_PROJECTILE_SPEED, SPECIAL_PROJECTILE_LIFETIME,
  NORMAL_PROJECTILE_SPEED, NORMAL_PROJECTILE_LIFETIME,
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
    return this.fireProjectile(scene, ATTACK_DAMAGE, NORMAL_PROJECTILE_SPEED, NORMAL_PROJECTILE_LIFETIME, false);
  }

  doSpecial(scene) {
    if (!this.canSpecial()) return null;
    return this.fireProjectile(scene, SPECIAL_DAMAGE, SPECIAL_PROJECTILE_SPEED, SPECIAL_PROJECTILE_LIFETIME, true);
  }

  fireProjectile(scene, damage, speed, lifetime, isSpecial) {
    if (isSpecial) {
      if (!this.canSpecial()) return null;
      this.lastSpecial = Date.now();
    } else {
      if (!this.canAttack()) return null;
      this.lastAttack = Date.now();
    }
    this.isAttacking = true;

    const dir = this.facing === 'right' ? 1 : -1;
    const offsetX = isSpecial ? 60 : 40;
    const offsetY = -10;
    const scale = isSpecial ? 1.2 : 0.8;
    const depth = isSpecial ? 12 : 11;

    const proj = scene.physics.add.image(this.x + dir * offsetX, this.y + offsetY, 'blast').setScale(scale);
    scene.projectiles?.add(proj);
    proj.setDepth(depth);
    proj.body.setAllowGravity(false);
    proj.body.setImmovable(true);
    proj.setVelocityX(dir * speed);
    proj.setData('damage', damage);
    proj.setData('pierce', false);
    if (isSpecial) {
      // Tint special slightly differently for visual clarity
      proj.setTint(0xfacc15);
    } else {
      proj.setTint(0xbfdbfe);
    }

    scene.time.delayedCall(lifetime, () => {
      if (proj && proj.active) {
        proj.destroy();
      }
    });

    return proj;
  }

  doAttackSingle(scene, target) {
    return this.doAttack(scene, target);
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
