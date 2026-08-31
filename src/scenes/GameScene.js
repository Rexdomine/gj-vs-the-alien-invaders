import Phaser from 'phaser';
import { Player } from '../entities/Player.js';
import { Alien } from '../entities/Alien.js';
import { BossAlien } from '../entities/BossAlien.js';
import {
  WORLD_WIDTH, WORLD_HEIGHT,
  ALIEN_SPAWN_INTERVAL, ALIEN_DAMAGE, ALIEN_CONTACT_COOLDOWN, ALIENS_TO_BOSS,
  BOSS_DAMAGE, BOSS_CONTACT_COOLDOWN, SPECIAL_COOLDOWN,
} from '../game/config.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  create() {
    this.worldWidth = WORLD_WIDTH;
    this.worldHeight = WORLD_HEIGHT;
    this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);
    this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight);

    this.bossSpawned = false;
    this.bossIntroActive = false;
    this.alienDefeats = 0;

    this.cameras.main.setBackgroundColor('#120a1f');
    for (let i = 0; i < 40; i++) {
      this.add.image(Phaser.Math.Between(0, this.worldWidth), Phaser.Math.Between(0, this.worldHeight), 'star')
        .setAlpha(Phaser.Math.FloatBetween(0.3, 0.9))
        .setScale(Phaser.Math.FloatBetween(0.4, 1.2));
    }

    const grounds = this.physics.add.staticGroup();
    const groundY = 520;
    for (let x = 0; x < this.worldWidth; x += 200) {
      const g = grounds.create(x + 100, groundY, 'ground');
      g.refreshBody();
    }
    this.grounds = grounds;

    this.player = new Player(this, 200, 440);
    this.player.setDepth(10);
    this.physics.add.collider(this.player, this.grounds);

    this.aliens = this.physics.add.group({ classType: Alien, maxSize: 10, runChildUpdate: true });
    this.projectiles = this.physics.add.group();
    this.boss = null;

    this.alienTimer = this.time.addEvent({
      delay: ALIEN_SPAWN_INTERVAL,
      callback: () => {
        if (this.player.active && !this.bossSpawned && !this.bossIntroActive && this.alienDefeats < ALIENS_TO_BOSS) {
          const spawnX = Phaser.Math.Clamp(this.player.x + Phaser.Math.Between(320, 520), 80, this.worldWidth - 80);
          const a = this.aliens.get(spawnX, 480, 'alien');
          if (a) {
            a.setActive(true).setVisible(true);
            a.body.enable = true;
            a.setVelocity(0);
            a.hp = 50;
            a.lastContact = 0;
            a.clearTint();
          }
        }
      },
      loop: true,
    });

    this.physics.add.overlap(this.player, this.aliens, (player, alien) => {
      if (!alien.active || this.bossIntroActive) return;
      if (this.time.now - alien.lastContact > ALIEN_CONTACT_COOLDOWN) {
        alien.lastContact = this.time.now;
        this.player.takeHit(ALIEN_DAMAGE, this);
        const dir = player.x < alien.x ? -1 : 1;
        player.setVelocityX(dir * 200);
        player.setVelocityY(-80);
      }
    }, null, this);

    this.physics.add.overlap(this.projectiles, this.aliens, (projectile, alien) => {
      this.handleProjectileHit(projectile, alien);
    }, null, this);

    this.events.on('alien-defeated', () => {
      this.alienDefeats += 1;
      if (this.alienDefeats >= ALIENS_TO_BOSS && !this.bossSpawned) {
        this.spawnBoss();
      }
    });

    this.events.on('player-dead', () => {
      this.scene.start('GameOver');
    });

    this.events.on('boss-dead', () => {
      this.time.delayedCall(800, () => this.scene.start('Win'));
    });

    this.hudScore = this.add.text(16, 16, 'Score: 0', {
      fontFamily: 'Segoe UI', fontSize: '20px', color: '#ffffff',
      stroke: '#000', strokeThickness: 4,
    }).setScrollFactor(0).setDepth(100);

    this.hudHP = this.add.container(16, 52).setScrollFactor(0).setDepth(100);
    this.hudHPText = this.add.text(28, 0, '', {
      fontFamily: 'Segoe UI', fontSize: '16px', color: '#fff',
      stroke: '#000', strokeThickness: 3,
    }).setDepth(101);
    this.hudHP.add(this.hudHPText);
    this.hudHeart = this.add.image(0, 0, 'heart').setScale(1).setDepth(101);
    this.hudHP.add(this.hudHeart);

    this.hudSpecial = this.add.text(16, 80, 'Energy Kick: Ready', {
      fontFamily: 'Segoe UI', fontSize: '16px', color: '#facc15',
      stroke: '#000', strokeThickness: 3,
    }).setScrollFactor(0).setDepth(100);

    this.hudProgress = this.add.text(16, 108, '', {
      fontFamily: 'Segoe UI', fontSize: '16px', color: '#93c5fd',
      stroke: '#000', strokeThickness: 3,
    }).setScrollFactor(0).setDepth(100);

    this.bossWarning = this.add.text(400, 120, '', {
      fontFamily: 'Segoe UI',
      fontSize: '30px',
      color: '#fca5a5',
      stroke: '#000',
      strokeThickness: 6,
      align: 'center',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(130).setAlpha(0);

    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setZoom(1);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys({ z: 'Z', x: 'X', space: 'SPACE' });
  }

  clearAliensForBossIntro() {
    this.aliens.getChildren().forEach((alien) => {
      if (!alien.active) return;
      alien.setActive(false);
      alien.setVisible(false);
      if (alien.body) {
        alien.body.enable = false;
        alien.setVelocity(0, 0);
      }
    });
  }

  spawnBoss() {
    if (this.bossSpawned) return;

    this.bossSpawned = true;
    this.bossIntroActive = true;
    if (this.alienTimer) {
      this.alienTimer.remove(false);
      this.alienTimer = null;
    }
    this.clearAliensForBossIntro();

    const view = this.cameras.main.worldView;
    const introStartX = Math.min(this.worldWidth - 80, view.right + 220);
    const introTargetX = Math.min(this.worldWidth - 180, view.right - 120);

    this.boss = new BossAlien(this, introStartX, 460);
    this.boss.setDepth(12);
    this.boss.setAlpha(0);
    this.boss.body.enable = false;

    this.physics.add.overlap(this.player, this.boss, (player, boss) => {
      if (!boss.active || this.bossIntroActive) return;
      if (this.time.now - boss.lastContact > BOSS_CONTACT_COOLDOWN) {
        boss.lastContact = this.time.now;
        this.player.takeHit(BOSS_DAMAGE, this);
        const dir = player.x < boss.x ? -1 : 1;
        player.setVelocityX(dir * 250);
        player.setVelocityY(-120);
      }
    }, null, this);

    this.physics.add.overlap(this.projectiles, this.boss, (projectile, boss) => {
      this.handleProjectileHit(projectile, boss);
    }, null, this);

    this.bossWarning.setText('⚠ BOSS INCOMING ⚠');
    this.bossWarning.setAlpha(1);

    this.tweens.add({
      targets: this.boss,
      x: introTargetX,
      alpha: 1,
      duration: 900,
      ease: 'Sine.easeOut',
      onComplete: () => {
        if (this.boss && this.boss.body) {
          this.boss.body.enable = true;
          this.boss.body.reset(this.boss.x, this.boss.y);
        }
        this.bossIntroActive = false;
        this.time.delayedCall(700, () => {
          if (this.bossWarning.active) {
            this.tweens.add({
              targets: this.bossWarning,
              alpha: 0,
              duration: 350,
            });
          }
        });
      },
    });
  }

  handleProjectileHit(projectile, target) {
    const projectileObject = projectile?.gameObject ?? projectile;
    const targetObject = target?.gameObject ?? target;

    if (!projectileObject?.active || !targetObject?.active || targetObject.hp <= 0) return;
    if (typeof targetObject.takeHit !== 'function') return;

    const damage = projectileObject.getData?.('damage') ?? 0;
    projectileObject.disableBody?.(true, true);
    projectileObject.destroy?.();
    targetObject.takeHit(damage, this);

    targetObject.setTint(0xfff08a);
    this.time.delayedCall(80, () => {
      if (targetObject.active) targetObject.clearTint();
    });
  }

  update(time, delta) {
    if (!this.player || !this.player.active) return;

    if (this.boss && this.boss.active && !this.bossIntroActive) {
      this.boss.update(time, delta);
    }

    // Fail-safe geometric overlap for boss: if Arcade overlap misses,
    // AABB bounds check catches projectile hits reliably.
    if (this.boss && this.boss.active && !this.bossIntroActive) {
      const bossBounds = this.boss.getBounds();
      this.projectiles.getChildren().forEach((proj) => {
        if (!proj.active || !proj.body) return;
        const projBounds = proj.getBounds();
        if (Phaser.Geom.Rectangle.Overlaps(bossBounds, projBounds)) {
          this.handleProjectileHit(proj, this.boss);
        }
      });
    }

    if (this.cursors.left.isDown) {
      this.player.moveLeft();
    } else if (this.cursors.right.isDown) {
      this.player.moveRight();
    } else {
      this.player.stop();
    }

    if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
      this.player.jump();
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.space)) {
      this.player.jump();
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.z)) {
      this.player.doAttack(this);
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.x)) {
      this.player.doSpecial(this);
    }

    this.projectiles.getChildren().forEach((projectile) => {
      if (!projectile.active) return;
      if (projectile.x < -100 || projectile.x > this.worldWidth + 100) {
        projectile.destroy();
      }
    });

    this.hudScore.setText('Score: ' + this.player.score);
    const remainingForBoss = Math.max(0, ALIENS_TO_BOSS - this.alienDefeats);
    this.hudProgress.setText(this.bossSpawned ? 'Boss Fight Active!' : `Aliens until boss: ${remainingForBoss}`);

    const hp = this.player.hp;
    const pct = Math.max(0, Math.round((hp / 100) * 100));
    this.hudHPText.setText('HP: ' + hp);
    this.hudHPText.setColor(pct > 40 ? '#fff' : (pct > 15 ? '#fde047' : '#ef4444'));

    if (this.player.canSpecial()) {
      this.hudSpecial.setText('Energy Kick: READY');
      this.hudSpecial.setColor('#facc15');
    } else {
      const remaining = Math.ceil((this.player.lastSpecial + SPECIAL_COOLDOWN - Date.now()) / 1000);
      this.hudSpecial.setText('Energy Kick: ' + Math.max(0, remaining) + 's');
      this.hudSpecial.setColor('#9ca3af');
    }

    if (this.player.hp > 0 && this.player.hp < 25) {
      if (this.time.now % 400 < 200) {
        this.player.setAlpha(0.6);
      } else {
        this.player.setAlpha(1);
      }
    } else {
      this.player.setAlpha(1);
    }
  }
}
