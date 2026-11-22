// SHADOW VAULT — cinematic heist game — config
export const FIELD = { width: 1280, height: 720 };
export const STEP  = 1 / 60;
export const TILE  = 48;

export const PLAYER = { width: 22, height: 32, speed: 180, crawlSpeed: 90 };
export const GUARD  = {
  width: 22, height: 36, speed: 68,
  fovAngle: Math.PI / 3.5, fovRange: 200,
  alertFovAngle: Math.PI / 2.5, alertFovRange: 260,
  turnRate: 1.4,
};
export const CAMERA_CFG = {
  width: 18, height: 14,
  fovAngle: Math.PI / 4, fovRange: 220, sweepSpeed: 0.5,
};
export const ALARM     = { riseRate: 0.55, fallRate: 0.18, alertThreshold: 1.0 };
export const LOOT_SIZE = 20;

export const PALETTE = {
  bg:'#0a0c10', wall:'#1a1d24', wallEdge:'#252932', floor:'#12151c', floorTile:'#13161e',
  player:'#a8d8ea',
  guard:'#c0392b', guardFov:'rgba(255,80,60,0.13)', guardFovAlert:'rgba(255,160,0,0.22)',
  camera:'#e74c3c', cameraFov:'rgba(230,50,50,0.11)',
  loot:'#f1c40f', lootGlow:'rgba(241,196,15,0.35)',
  alarm0:'#2ecc71', alarm50:'#f39c12', alarm100:'#e74c3c',
  hud:'rgba(10,12,16,0.82)', text:'#dde3ec', muted:'#636a7a',
  accent:'#5dade2', success:'#2ecc71', danger:'#e74c3c',
};
export const FONT     = '"Courier New", Courier, monospace';
export const SAVE_KEY = 'shadow-vault.best';
