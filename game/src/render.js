// SHADOW VAULT — renderer
import { FIELD, GUARD, CAMERA_CFG, PALETTE, FONT } from './config.js';

function alarmColor(level, palette) {
  if (level < 0.5) {
    const t = level * 2;
    return lerpColor(palette.alarm0, palette.alarm50, t);
  }
  const t = (level - 0.5) * 2;
  return lerpColor(palette.alarm50, palette.alarm100, t);
}

function lerpColor(a, b, t) {
  const pa = parseHex(a), pb = parseHex(b);
  const r = Math.round(pa[0] + (pb[0]-pa[0])*t);
  const g = Math.round(pa[1] + (pb[1]-pa[1])*t);
  const bv = Math.round(pa[2] + (pb[2]-pa[2])*t);
  return `rgb(${r},${g},${bv})`;
}

function parseHex(h) {
  const v = h.replace('#','');
  return [parseInt(v.slice(0,2),16),parseInt(v.slice(2,4),16),parseInt(v.slice(4,6),16)];
}

function drawFov(ctx, ox, oy, angle, halfAngle, range, color) {
  ctx.beginPath();
  ctx.moveTo(ox, oy);
  ctx.arc(ox, oy, range, angle - halfAngle, angle + halfAngle);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

export function render(ctx, state, levelIdx, alarmFlash) {
  const { player, guards, cameras, loot, walls, alarmLevel, def } = state;
  const W = FIELD.width, H = FIELD.height;

  // Background
  ctx.fillStyle = PALETTE.bg;
  ctx.fillRect(0, 0, W, H);

  // Floor tile grid (subtle)
  ctx.strokeStyle = PALETTE.floorTile;
  ctx.lineWidth = 0.5;
  for (let x = 0; x < W; x += 48) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
  for (let y = 0; y < H; y += 48) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

  // Camera FOV
  for (const cam of cameras) {
    drawFov(ctx, cam.x, cam.y, cam.angle, CAMERA_CFG.fovAngle, CAMERA_CFG.fovRange, PALETTE.cameraFov);
  }

  // Guard FOV
  for (const g of guards) {
    const fovA = g.alert >= 1 ? GUARD.alertFovAngle : GUARD.fovAngle;
    const fovR = g.alert >= 1 ? GUARD.alertFovRange : GUARD.fovRange;
    const color = g.alert >= 1 ? PALETTE.guardFovAlert : PALETTE.guardFov;
    drawFov(ctx, g.x + g.width/2, g.y + g.height/2, g.angle, fovA, fovR, color);
  }

  // Walls
  for (const w of walls) {
    ctx.fillStyle = PALETTE.wall;
    ctx.fillRect(w.x, w.y, w.w, w.h);
    ctx.strokeStyle = PALETTE.wallEdge;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(w.x + 0.5, w.y + 0.5, w.w - 1, w.h - 1);
  }

  // Exit marker (left edge)
  ctx.fillStyle = 'rgba(46,204,113,0.18)';
  ctx.fillRect(0, 0, 55, H);
  ctx.strokeStyle = '#2ecc71';
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 6]);
  ctx.beginPath(); ctx.moveTo(55, 0); ctx.lineTo(55, H); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#2ecc71';
  ctx.font = `bold 11px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.fillText('EXIT', 27, H/2);
  ctx.textAlign = 'left';

  // Loot
  if (!loot.collected) {
    const lx = loot.x, ly = loot.y;
    // glow
    const grd = ctx.createRadialGradient(lx, ly, 2, lx, ly, 36);
    grd.addColorStop(0, PALETTE.lootGlow);
    grd.addColorStop(1, 'transparent');
    ctx.beginPath(); ctx.arc(lx, ly, 36, 0, Math.PI*2); ctx.fillStyle = grd; ctx.fill();
    // diamond
    ctx.save();
    ctx.translate(lx, ly);
    ctx.rotate(Math.PI/4);
    ctx.fillStyle = PALETTE.loot;
    ctx.fillRect(-loot.size/2, -loot.size/2, loot.size, loot.size);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-loot.size/2, -loot.size/2, loot.size, loot.size);
    ctx.restore();
    ctx.fillStyle = PALETTE.loot;
    ctx.font = `10px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText('LOOT', lx, ly + loot.size + 12);
    ctx.textAlign = 'left';
  }

  // Cameras
  for (const cam of cameras) {
    ctx.save();
    ctx.translate(cam.x, cam.y);
    ctx.rotate(cam.angle);
    ctx.fillStyle = PALETTE.camera;
    ctx.fillRect(-cam.width/2, -cam.height/2, cam.width, cam.height);
    // lens
    ctx.beginPath();
    ctx.arc(cam.width/2 - 3, 0, 4, 0, Math.PI*2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.restore();
  }

  // Guards
  for (const g of guards) {
    const alertColors = ['#c0392b', '#e67e22', '#e74c3c'];
    const bodyColor = alertColors[Math.min(g.alert, 2)];
    ctx.save();
    ctx.translate(g.x + g.width/2, g.y + g.height/2);
    ctx.rotate(g.angle);
    // body
    ctx.fillStyle = bodyColor;
    ctx.fillRect(-g.width/2, -g.height/2, g.width, g.height);
    // direction indicator
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(g.width/2, 0);
    ctx.lineTo(g.width/2 - 8, -5);
    ctx.lineTo(g.width/2 - 8, 5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // alert indicator
    if (g.alert >= 1) {
      ctx.fillStyle = g.alert === 2 ? '#e74c3c' : '#f39c12';
      ctx.font = `bold 14px ${FONT}`;
      ctx.textAlign = 'center';
      ctx.fillText(g.alert === 2 ? '!' : '?', g.x + g.width/2, g.y - 6);
      ctx.textAlign = 'left';
    }
  }

  // Player
  const px = player.x, py = player.y;
  if (player.visible && alarmFlash) {
    ctx.shadowColor = '#e74c3c';
    ctx.shadowBlur = 20;
  }
  ctx.fillStyle = player.hasloot ? '#f1c40f' : PALETTE.player;
  if (player.crawling) {
    ctx.fillRect(px, py + player.height * 0.4, player.width, player.height * 0.6);
  } else {
    ctx.fillRect(px, py, player.width, player.height);
    // head
    ctx.beginPath();
    ctx.arc(px + player.width/2, py - 6, 7, 0, Math.PI*2);
    ctx.fill();
  }
  ctx.shadowBlur = 0;

  // ── HUD ──────────────────────────────────────────────────────────────────
  // Alarm bar
  const barW = 300, barH = 18;
  const barX = W/2 - barW/2, barY = 12;
  ctx.fillStyle = PALETTE.hud;
  ctx.fillRect(barX - 60, barY - 2, barW + 70, barH + 10);
  ctx.fillStyle = '#333';
  ctx.fillRect(barX, barY + 2, barW, barH - 4);
  ctx.fillStyle = alarmColor(alarmLevel, PALETTE);
  ctx.fillRect(barX, barY + 2, barW * alarmLevel, barH - 4);
  ctx.strokeStyle = '#555';
  ctx.lineWidth = 1;
  ctx.strokeRect(barX, barY + 2, barW, barH - 4);
  ctx.fillStyle = PALETTE.text;
  ctx.font = `bold 11px ${FONT}`;
  ctx.textAlign = 'right';
  ctx.fillText('ALARM', barX - 4, barY + barH - 2);
  ctx.textAlign = 'left';
  ctx.fillText(`${Math.round(alarmLevel*100)}%`, barX + barW + 4, barY + barH - 2);

  // Level name
  ctx.fillStyle = PALETTE.hud;
  ctx.fillRect(10, 10, 160, 26);
  ctx.fillStyle = PALETTE.muted;
  ctx.font = `11px ${FONT}`;
  ctx.fillText(`LVL ${levelIdx+1}  ${def.name.toUpperCase()}`, 16, 28);

  // Loot status
  ctx.fillStyle = PALETTE.hud;
  ctx.fillRect(W - 170, 10, 160, 26);
  ctx.fillStyle = loot.collected ? PALETTE.success : PALETTE.muted;
  ctx.font = `11px ${FONT}`;
  ctx.textAlign = 'right';
  ctx.fillText(loot.collected ? '◆ LOOT SECURED' : '◇ LOOT PENDING', W - 16, 28);
  ctx.textAlign = 'left';

  // Controls hint (bottom)
  ctx.fillStyle = 'rgba(10,12,16,0.7)';
  ctx.fillRect(0, H - 24, W, 24);
  ctx.fillStyle = PALETTE.muted;
  ctx.font = `10px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.fillText('WASD / ARROW KEYS: Move   SHIFT: Crawl (quiet)   Grab loot → escape LEFT', W/2, H - 8);
  ctx.textAlign = 'left';
}

export function renderTitle(ctx, levelIdx) {
  const W = FIELD.width, H = FIELD.height;
  ctx.fillStyle = PALETTE.bg;
  ctx.fillRect(0, 0, W, H);

  // scanline effect
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  for (let y = 0; y < H; y += 4) ctx.fillRect(0, y, W, 2);

  ctx.fillStyle = PALETTE.text;
  ctx.font = `bold 72px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.shadowColor = '#5dade2';
  ctx.shadowBlur = 30;
  ctx.fillText('SHADOW VAULT', W/2, H/2 - 60);
  ctx.shadowBlur = 0;

  ctx.font = `20px ${FONT}`;
  ctx.fillStyle = PALETTE.muted;
  ctx.fillText('A cinematic heist game', W/2, H/2 - 20);

  ctx.font = `bold 16px ${FONT}`;
  ctx.fillStyle = PALETTE.accent;
  ctx.fillText('▶  PRESS SPACE OR ENTER TO START', W/2, H/2 + 40);

  ctx.font = `13px ${FONT}`;
  ctx.fillStyle = PALETTE.muted;
  ctx.fillText('WASD / ARROWS: Move   SHIFT: Crawl   Steal loot, escape left without being caught', W/2, H/2 + 90);

  ctx.textAlign = 'left';
}

export function renderGameOver(ctx, won, levelIdx) {
  const W = FIELD.width, H = FIELD.height;
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(0, 0, W, H);
  ctx.textAlign = 'center';
  if (won) {
    ctx.fillStyle = PALETTE.success;
    ctx.font = `bold 60px ${FONT}`;
    ctx.shadowColor = '#2ecc71';
    ctx.shadowBlur = 30;
    ctx.fillText('HEIST COMPLETE', W/2, H/2 - 40);
    ctx.shadowBlur = 0;
    ctx.font = `20px ${FONT}`;
    ctx.fillStyle = PALETTE.text;
    if (levelIdx < 2) {
      ctx.fillText('PRESS SPACE to continue to next level', W/2, H/2 + 20);
    } else {
      ctx.fillStyle = '#f1c40f';
      ctx.fillText('ALL VAULTS CLEARED — MASTER THIEF', W/2, H/2 + 20);
      ctx.font = '16px ' + FONT;
      ctx.fillStyle = PALETTE.muted;
      ctx.fillText('PRESS SPACE to play again', W/2, H/2 + 60);
    }
  } else {
    ctx.fillStyle = PALETTE.danger;
    ctx.font = `bold 60px ${FONT}`;
    ctx.shadowColor = '#e74c3c';
    ctx.shadowBlur = 30;
    ctx.fillText('ALARM TRIGGERED', W/2, H/2 - 40);
    ctx.shadowBlur = 0;
    ctx.font = `20px ${FONT}`;
    ctx.fillStyle = PALETTE.text;
    ctx.fillText('PRESS SPACE to retry', W/2, H/2 + 20);
  }
  ctx.textAlign = 'left';
}
