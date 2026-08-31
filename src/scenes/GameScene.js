import Phaser from 'phaser';
import { Player } from '../entities/Player.js';
import { Alien } from '../entities/Alien.js';
import { BossAlien } from '../entities/BossAlien.js';
import {
  GAME_WIDTH, GAME_HEIGHT, WORLD_WIDTH, WORLD_HEIGHT,
  ALIEN_SPAWN_INTERVAL, ALIEN_DAMAGE, ALIEN_CONTACT_COOLDOWN,
  BOSS_DAMAGE, BOSS_CONTACT_COOLDOWN, SCORE_FOR_BOSS, SPECIAL_COOLDOWN,
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

    // Background gradient feel via layered rectangles
    this.cameras.main.setBackgroundColor('#120a1f');
    for (let i = 0; i < 40; i++) {
      this.add.image(Phaser.Math.Between(0, this.worldWidth), Phaser.Math.Between(0, this.worldHeight), 'star')
        .setAlpha(Phaser.Math.FloatBetween(0.3, 0.9))
        .setScale(Phaser.Math.FloatBetween(0.4, 1.2));
    }

    // Ground platforms
    const grounds = this.physics.add.staticGroup();
    const groundY = 520;
    for (let x = 0; x < this.worldWidth; x += 200) {
      const g = grounds.create(x + 100, groundY, 'ground');
      g.setScale(1, 1).refreshBody();
    }
    this.grounds = grounds;

    // Player
    this.player = new Player(this, 200, 440);
    this.player.setDepth(10);
    this.physics.add.collider(this.player, this.grounds);

    // Enemy groups
    this.aliens = this.physics.add.group({ classType: Alien, maxSize: 10 });
    this.boss = null;

    // Enemy spawn timer
    this.alienTimer = this.time.addEvent({
      delay: ALIEN_SPAWN_INTERVAL,
      callback: () => {
        if (this.player.active && (!this.boss || this.boss.hp <= 0)) {
          const spawnX = this.player.x + Phaser.Math.Between(300, 500);
          const a = this.aliens.get(spawnX, 480, 'alien');
          if (a) {
            a.setActive(true).setVisible(true);
            a.body.enable = true;
            a.setVelocity(0);
            a.hp = 50; // reset
          }
        }
      },
      loop: true,
    });

    // Collision: player vs aliens (contact damage)
    this.physics.add.overlap(this.player, this.aliens, (player, alien) => {
      if (!alien.active) return;
      if (this.time.now - alien.lastContact > ALIEN_CONTACT_COOLDOWN) {
        alien.lastContact = this.time.now;
        this.player.takeHit(ALIEN_DAMAGE, this);
        // Knockback
        const dir = player.x < alien.x ? -1 : 1;
        player.setVelocityX(dir * 200);
        player.setVelocityY(-80);
      }
    }, null, this);

    // Boss spawn when score reaches threshold and not yet spawned
    this.events.on('score-change', (score) => {
      if (score >= SCORE_FOR_BOSS && (!this.boss || this.boss.hp <= 0)) {
        this.spawnBoss();
      }
    });

    // Player death
    this.events.on('player-dead', () => {
      this.scene.start('GameOver');
    });

    // Boss death -> win
    this.events.on('boss-dead', () => {
      // Small delay before winning to let effects play
      this.time.delayedCall(800, () => this.scene.start('Win'));
    });

    // HUD setup
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
    // Heart icon from placeholder textures
    this.hudHeart = this.add.image(0, 0, 'heart').setScale(1).setDepth(101);
    this.hudHP.add(this.hudHeart);

    this.hudSpecial = this.add.text(16, 80, 'Energy Kick: Ready', {
      fontFamily: 'Segoe UI', fontSize: '16px', color: '#facc15',
      stroke: '#000', strokeThickness: 3,
    }).setScrollFactor(0).setDepth(100);

    // Camera follow player gently
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setZoom(1);

    // Controls
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys({ z: 'Z', x: 'X', space: 'SPACE' });
  }

  spawnBoss() {
    if (this.boss && this.boss.active) return;
    this.boss = new BossAlien(this, this.player.x + 500, 460);
    this.boss.setDepth(10);
    this.physics.add.overlap(this.player, this.boss, (player, boss) => {
      if (!boss.active) return;
      if (this.time.now - boss.lastContact > BOSS_CONTACT_COOLDOWN) {
        boss.lastContact = this.time.now;
        this.player.takeHit(BOSS_DAMAGE, this);
        const dir = player.x < boss.x ? -1 : 1;
        player.setVelocityX(dir * 250);
        player.setVelocityY(-120);
      }
    }, null, this);
    this.events.emit('score-change', this.player.score); // refresh HUD
  }

  update(time, delta) {
    if (!this.player || !this.player.active) return;

    // Player movement
    if (this.cursors.left.isDown) {
      this.player.moveLeft();
    } else if (this.cursors.right.isDown) {
      this.player.moveRight();
    } else {
      this.player.stop();
    }

    // Jump (on key press only)
    if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
      this.player.jump();
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.space)) {
      this.player.jump();
    }

    // Attack (Z or SPACE-reserved; here SPACE is jump, Z is attack)
    if (Phaser.Input.Keyboard.JustDown(this.keys.z)) {
      this.player.doAttack(this, this.aliens);
      if (this.boss && this.boss.active) this.player.doAttackSingle(this, this.boss);
    }

    // Special (X = Energy Kick)
    if (Phaser.Input.Keyboard.JustDown(this.keys.x)) {
      this.player.doSpecial(this, this.aliens);
      if (this.boss && this.boss.active) this.player.doSpecialSingle(this, this.boss);
    }

    // Update HUD
    this.hudScore.setText('Score: ' + this.player.score);
    const hp = this.player.hp;
    const pct = Math.max(0, Math.round((hp / 100) * 100));
    this.hudHPText.setText('HP: ' + hp);
    this.hudHPText.setColor(pct > 40 ? '#fff' : (pct > 15 ? '#fde047' : '#ef4444'));

    // Special cooldown hint
    if (this.player.canSpecial()) {
      this.hudSpecial.setText('Energy Kick: READY');
      this.hudSpecial.setColor('#facc15');
    } else {
      const remaining = Math.ceil((this.player.lastSpecial + SPECIAL_COOLDOWN - Date.now()) / 1000);
      this.hudSpecial.setText('Energy Kick: ' + Math.max(0, remaining) + 's');
      this.hudSpecial.setColor('#9ca3af');
    }

    // Clean dead aliens from the group for reuse
    this.aliens.getChildren().forEach(alien => {
      if (!alien.active && alien.hp <= 0) {
        // Already handled via event; just ensure inactive
      }
    });

    // Flash player when health low for visibility
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