# GJ vs The Alien Invaders — Project Context

Owner: Rex
Repo: `Rexdomine/gj-vs-the-alien-invaders`
Local path: `/opt/data/projects/gj-vs-the-alien-invaders`

## Purpose
Build a very simple 2D browser game inspired by Rex's nephew's superhero-and-alien drawings. The goal is a fast, playful MVP that runs in the browser and is easy to test via a Vercel preview.

## Locked MVP direction
- Title: **GJ vs The Alien Invaders**
- Format: **2D browser game**
- Style: **simple, colorful, hand-drawn-inspired**
- Stack: **Phaser 3 + JavaScript + Vite + plain HTML/CSS**
- Hosting: **Vercel**

## Story and gameplay baseline
- Main hero: **GJ**, a neighborhood superhero inspired by the child's drawing.
- Enemies: simple alien invaders with sketch-like silhouettes.
- Story: aliens invade the city; GJ fights waves of them and defeats a larger final boss.
- Core loop: start game → fight aliens → gain score → survive → beat boss → win screen.
- Signature move: **Energy Kick**, inspired by the comic sequence where GJ powers up and blasts an alien.

## MVP acceptance criteria
1. Game loads in browser without backend.
2. Player can move left/right, jump, and attack.
3. At least one normal enemy type spawns and can damage the player.
4. Score increases when enemies are defeated.
5. Player has health and can lose.
6. Boss appears after enough points/enemies and can be defeated.
7. Win and lose flows exist.
8. Game is deployable on Vercel and playable from a public preview URL.

## Constraints
- Do not over-engineer.
- No backend, database, auth, or account system.
- Prefer placeholder/generated shapes over waiting on polished art.
- Preserve the nephew-drawing spirit in naming, colors, and silhouettes.
- Rex expects end-to-end delivery with GitHub PR + Vercel preview link.

## Implementation approach
- Start with Phaser scenes and code-driven placeholder art.
- Keep assets minimal so the first version becomes playable quickly.
- Use one main gameplay scene, plus start, win, and game-over overlays/scenes.
- Use simple enemy AI: move toward player and damage on contact.
- Use simple special-attack cooldown rather than an elaborate power meter.

## Delivery workflow
- Branch: feature branch from `main`
- Use Drax for bounded implementation milestones.
- Use NightWing for independent QA before handoff.
- Push branch, open PR, verify Vercel preview, then hand off both links.

## Current status
- GitHub repo created and public.
- Vercel project created, linked locally, and connected to the GitHub repo.
- Ready for development.

## Resume instruction
Before continuing this project in a later session, read this file first, then inspect current git status, PR state, and Vercel preview state.
