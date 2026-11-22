// Shadow Vault screenshot driver — sets up static scene for each shot URL param
import { FIELD, PLAYER, STEP } from './config.js';
import { createWorld, LEVELS } from './world.js';

/** Advance world to a visually interesting state for screenshots */
export function setupShot(name, world) {
  // For title screen: just return early
  if (name === 'title' || !name) return { screen: 'title' };

  // For gameplay shot: advance several seconds and position player mid-heist
  if (name === 'play') {
    // Simulate a few seconds of gameplay with player moving right
    const fakeKeys = { left:false, right:true, up:false, down:false, crawl:false, isPressed:()=>false };
    for (let i = 0; i < 180; i++) world.step(STEP, fakeKeys);
    return { screen: 'play' };
  }

  // For alarm shot: advance with player in guard vision cone
  if (name === 'alarm') {
    const fakeKeys = { left:false, right:true, up:false, down:false, crawl:false, isPressed:()=>false };
    for (let i = 0; i < 240; i++) world.step(STEP, fakeKeys);
    return { screen: 'alarm' };
  }

  return { screen: 'title' };
}
