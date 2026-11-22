// SHADOW VAULT — entry point and game loop
import { FIELD, STEP, SAVE_KEY } from './config.js';
import { createWorld, LEVELS }   from './world.js';
import { render, renderTitle, renderGameOver } from './render.js';
import { createInput }           from './input.js';

const canvas = document.getElementById('canvas');
const ctx    = canvas.getContext('2d');
const input  = createInput();

let state = 'title';   // 'title' | 'play' | 'won' | 'caught'
let levelIdx = 0;
let world, gameState;
let accumulator = 0;
let lastTime = 0;
let alarmFlash = false;
let flashTimer = 0;

function startLevel(idx) {
  levelIdx = idx;
  world = createWorld(idx);
  gameState = world.getState();
  state = 'play';
}

function resize() {
  const scale = Math.min(window.innerWidth / FIELD.width, window.innerHeight / FIELD.height);
  canvas.style.width  = FIELD.width  * scale + 'px';
  canvas.style.height = FIELD.height * scale + 'px';
}
window.addEventListener('resize', resize);
resize();

let spaceWas = false;

function loop(ts) {
  requestAnimationFrame(loop);
  const dt  = Math.min((ts - lastTime) / 1000, 0.05);
  lastTime  = ts;

  const spaceNow = input.isPressed('Space') || input.isPressed('Enter');
  const spaceJust = spaceNow && !spaceWas;
  spaceWas = spaceNow;

  if (state === 'title') {
    renderTitle(ctx, levelIdx);
    if (spaceJust) startLevel(0);
    return;
  }

  if (state === 'won' || state === 'caught') {
    render(ctx, gameState, levelIdx, alarmFlash);
    renderGameOver(ctx, state === 'won', levelIdx);
    if (spaceJust) {
      if (state === 'won' && levelIdx < LEVELS.length - 1) {
        startLevel(levelIdx + 1);
      } else {
        startLevel(0);
      }
    }
    return;
  }

  // play
  accumulator += dt;
  while (accumulator >= STEP) {
    const result = world.step(STEP, input);
    gameState = world.getState();
    accumulator -= STEP;
    if (result.caught) { state = 'caught'; break; }
    if (result.escaped) { state = 'won'; break; }
  }

  // alarm flash
  flashTimer -= dt;
  if (flashTimer <= 0) { alarmFlash = !alarmFlash; flashTimer = 0.3; }

  render(ctx, gameState, levelIdx, alarmFlash);
}

requestAnimationFrame(ts => { lastTime = ts; requestAnimationFrame(loop); });
