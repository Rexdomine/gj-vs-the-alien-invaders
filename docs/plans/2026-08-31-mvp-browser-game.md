# GJ vs The Alien Invaders MVP Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Build a fast, playable browser MVP where GJ fights alien waves, scores points, uses a special move, and wins by defeating a boss.

**Architecture:** Frontend-only Phaser 3 game bootstrapped with Vite. A small scene system will manage start, gameplay, win, and game-over flows. Placeholder art will be code-first and hand-drawn-inspired rather than asset-heavy.

**Tech Stack:** Phaser 3, JavaScript, Vite, HTML, CSS, Vercel

---

### Task 1: Scaffold the project
**Objective:** Create the Vite + Phaser app skeleton and baseline scripts.

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `src/main.js`
- Create: `src/game/config.js`
- Create: `src/styles.css`
- Modify: `README.md`

**Verification:**
- `npm install`
- `npm run build`

### Task 2: Build the game scene and player controls
**Objective:** Add the main gameplay scene, player movement, jumping, facing direction, health, and attack controls.

**Files:**
- Create: `src/scenes/BootScene.js`
- Create: `src/scenes/StartScene.js`
- Create: `src/scenes/GameScene.js`
- Create: `src/scenes/WinScene.js`
- Create: `src/scenes/GameOverScene.js`
- Create: `src/entities/Player.js`
- Create: `src/utils/placeholderTextures.js`

**Verification:**
- `npm run build`
- Local manual play test in browser

### Task 3: Add enemies, score, boss, and win/lose flow
**Objective:** Implement enemy spawning, score updates, boss activation, combat resolution, and end states.

**Files:**
- Create: `src/entities/Alien.js`
- Create: `src/entities/BossAlien.js`
- Modify: `src/scenes/GameScene.js`

**Verification:**
- `npm run build`
- Local manual play test covering loss and win path

### Task 4: Add MVP polish and deployment readiness
**Objective:** Improve HUD/instructions, tune gameplay feel, and ensure Vercel deployment works cleanly.

**Files:**
- Create: `vercel.json` (only if needed)
- Modify: `src/styles.css`
- Modify: `README.md`

**Verification:**
- `npm run build`
- `npx vercel deploy --prebuilt` or Git-based preview

### Task 5: QA, PR, and preview handoff
**Objective:** Independently review, fix blockers, push, open PR, verify preview, and prepare Rex review handoff.

**Files:**
- Modify only as needed from QA feedback

**Verification:**
- `npm run build`
- Hosted preview loads and is playable
- PR exists and points to exact branch head
