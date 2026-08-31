export function generateTextures(scene) {
  // Player GJ: colorful superhero with cape
  const gfx = scene.add.graphics();
  gfx.fillStyle(0x3b82f6, 1); // blue suit body
  gfx.fillCircle(20, 30, 14);   // body
  gfx.fillStyle(0xf59e0b, 1); // cape
  gfx.fillCircle(12, 34, 10);
  gfx.fillStyle(0xfbbf24, 1); // hair/skin tone
  gfx.fillCircle(20, 14, 12);  // head
  gfx.fillStyle(0x111827, 1); // eyes
  gfx.fillCircle(16, 12, 3);
  gfx.fillCircle(24, 12, 3);
  gfx.fillStyle(0x10b981, 1); // belt
  gfx.fillRect(14, 38, 12, 4);
  gfx.generateTexture('player', 48, 48);
  gfx.destroy();

  // Normal Alien
  const a = scene.add.graphics();
  a.fillStyle(0x22c55e, 1); // green
  a.fillEllipse(20, 28, 16, 14); // body
  a.fillStyle(0xff4500, 1); // orange eye
  a.fillEllipse(20, 22, 4, 4);
  a.fillStyle(0x374151, 1); // antenna
  a.fillRect(18, 10, 2, 8);
  a.fillRect(22, 10, 2, 8);
  a.generateTexture('alien', 40, 48);
  a.destroy();

  // Boss Alien (larger, red/purple)
  const b = scene.add.graphics();
  b.fillStyle(0x9333ea, 1); // purple
  b.fillCircle(40, 50, 32);  // big body
  b.fillStyle(0xf43f5e, 1); // pink spikes/eyes
  b.fillCircle(40, 32, 10);  // head
  b.fillCircle(26, 58, 8);  // left spike
  b.fillCircle(54, 58, 8);  // right spike
  b.fillStyle(0xfbbf24, 1); // eye
  b.fillCircle(34, 34, 5);
  b.fillCircle(46, 34, 5);
  b.generateTexture('boss', 80, 90);
  b.destroy();

  // Energy blast (yellow glowy circle)
  const e = scene.add.graphics();
  e.fillStyle(0xfef08a, 1); // light yellow
  e.fillCircle(15, 15, 14);
  e.fillStyle(0xfacc15, 0.7);
  e.fillCircle(15, 15, 8);
  e.generateTexture('blast', 30, 30);
  e.destroy();

  // Star / background sparkle
  const s = scene.add.graphics();
  s.fillStyle(0x60a5fa, 1);
  s.fillCircle(4, 4, 3);
  s.generateTexture('star', 8, 8);
  s.destroy();

  // Ground platform
  const g = scene.add.graphics();
  g.fillStyle(0x059669, 1);
  g.fillRect(0, 0, 200, 20);
  g.fillStyle(0x047857, 1);
  g.fillRect(0, 20, 200, 10);
  g.generateTexture('ground', 200, 30);
  g.destroy();

  // Heart (health icon)
  const h = scene.add.graphics();
  h.fillStyle(0xef4444, 1);
  h.fillCircle(9, 5, 6);
  h.fillCircle(21, 5, 6);
  h.fillRect(7, 3, 16, 8);
  h.generateTexture('heart', 30, 14);
  h.destroy();

  // Energy icon (yellow lightning)
  const en = scene.add.graphics();
  en.fillStyle(0xfacc15, 1);
  en.fillRect(2, 2, 6, 16);
  en.fillStyle(0xf59e0b, 1);
  en.fillRect(0, 6, 4, 10);
  en.generateTexture('energy', 14, 18);
  en.destroy();
}
