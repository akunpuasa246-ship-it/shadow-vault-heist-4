// Shadow Vault: heist game world — guards, cameras, loot, alarm
import { FIELD, PLAYER, GUARD, CAMERA_CFG, ALARM, LOOT_SIZE } from './config.js';

function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
function angleTo(from, to) { return Math.atan2(to.y - from.y, to.x - from.x); }
function angleDiff(a, b) { return ((b - a) % (Math.PI * 2) + Math.PI * 3) % (Math.PI * 2) - Math.PI; }
function rectCenter(r) { return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }
function rectsOverlap(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function segmentIntersectsRect(x1, y1, x2, y2, r) {
  const L=1,R=2,B=4,T=8;
  function code(x,y){let c=0;if(x<r.x)c|=L;else if(x>r.x+r.width)c|=R;if(y<r.y)c|=T;else if(y>r.y+r.height)c|=B;return c;}
  let c1=code(x1,y1),c2=code(x2,y2);
  for(let i=0;i<20;i++){
    if(!(c1|c2))return true;if(c1&c2)return false;
    const c=c1||c2;let x,y;const dx=x2-x1,dy=y2-y1;
    if(c&B){x=x1+dx*(r.y+r.height-y1)/dy;y=r.y+r.height;}
    else if(c&T){x=x1+dx*(r.y-y1)/dy;y=r.y;}
    else if(c&R){y=y1+dy*(r.x+r.width-x1)/dx;x=r.x+r.width;}
    else{y=y1+dy*(r.x-x1)/dx;x=r.x;}
    if(c===c1){x1=x;y1=y;c1=code(x1,y1);}else{x2=x;y2=y;c2=code(x2,y2);}
  }
  return false;
}

function lineHitsWall(x1,y1,x2,y2,walls){
  for(const w of walls)if(segmentIntersectsRect(x1,y1,x2,y2,{x:w.x,y:w.y,width:w.w,height:w.h}))return true;
  return false;
}

export function canSeeTarget(origin, targetPos, fovAngle, fovRange, facingAngle, walls) {
  if(dist(origin,targetPos)>fovRange)return false;
  if(Math.abs(angleDiff(facingAngle,angleTo(origin,targetPos)))>fovAngle)return false;
  if(lineHitsWall(origin.x,origin.y,targetPos.x,targetPos.y,walls))return false;
  return true;
}

export const LEVELS = [
  {
    name:'The Gallery',
    playerStart:{x:100,y:580},
    loot:{x:1140,y:100},
    walls:[
      {x:0,y:0,w:1280,h:30},{x:0,y:690,w:1280,h:30},
      {x:0,y:0,w:30,h:720},{x:1250,y:0,w:30,h:720},
      {x:300,y:0,w:30,h:430},{x:300,y:510,w:30,h:210},
      {x:600,y:290,w:30,h:430},{x:900,y:0,w:30,h:380},{x:900,y:460,w:30,h:260},
    ],
    guards:[
      {x:400,y:200,angle:Math.PI,patrol:[{x:400,y:200},{x:800,y:200},{x:800,y:150},{x:400,y:150}]},
      {x:650,y:500,angle:0,patrol:[{x:650,y:500},{x:1100,y:500},{x:1100,y:580},{x:650,y:580}]},
    ],
    cameras:[
      {x:630,y:50,angle:Math.PI*0.5,sweepMin:Math.PI*0.3,sweepMax:Math.PI*0.7},
      {x:940,y:460,angle:-Math.PI*0.5,sweepMin:-Math.PI*0.7,sweepMax:-Math.PI*0.3},
    ],
  },
  {
    name:'The Vault',
    playerStart:{x:60,y:360},
    loot:{x:1200,y:360},
    walls:[
      {x:0,y:0,w:1280,h:30},{x:0,y:690,w:1280,h:30},
      {x:0,y:0,w:30,h:720},{x:1250,y:0,w:30,h:720},
      {x:200,y:30,w:30,h:300},{x:200,y:420,w:30,h:300},
      {x:400,y:150,w:30,h:420},{x:600,y:30,w:30,h:250},
      {x:600,y:380,w:30,h:340},{x:800,y:150,w:30,h:260},
      {x:800,y:510,w:30,h:180},{x:1000,y:30,w:30,h:380},
      {x:1000,y:480,w:30,h:240},{x:200,y:300,w:200,h:25},
      {x:600,y:380,w:200,h:25},
    ],
    guards:[
      {x:100,y:200,angle:Math.PI*0.5,patrol:[{x:100,y:200},{x:100,y:500}]},
      {x:500,y:350,angle:0,patrol:[{x:310,y:350},{x:580,y:350}]},
      {x:900,y:200,angle:Math.PI,patrol:[{x:820,y:200},{x:980,y:200},{x:980,y:460},{x:820,y:460}]},
      {x:1100,y:500,angle:-Math.PI*0.5,patrol:[{x:1030,y:500},{x:1230,y:500}]},
    ],
    cameras:[
      {x:430,y:155,angle:Math.PI*0.5,sweepMin:Math.PI*0.3,sweepMax:Math.PI*0.7},
      {x:630,y:380,angle:-Math.PI*0.5,sweepMin:-Math.PI*0.7,sweepMax:-Math.PI*0.3},
      {x:1030,y:480,angle:Math.PI,sweepMin:Math.PI*0.75,sweepMax:Math.PI*1.25},
    ],
  },
  {
    name:'The Penthouse',
    playerStart:{x:60,y:650},
    loot:{x:1200,y:60},
    walls:[
      {x:0,y:0,w:1280,h:30},{x:0,y:690,w:1280,h:30},
      {x:0,y:0,w:30,h:720},{x:1250,y:0,w:30,h:720},
      {x:250,y:490,w:400,h:25},{x:650,y:300,w:30,h:390},
      {x:450,y:200,w:200,h:25},{x:450,y:200,w:25,h:300},
      {x:850,y:30,w:25,h:350},{x:850,y:480,w:25,h:240},
      {x:1050,y:200,w:200,h:25},
    ],
    guards:[
      {x:400,y:600,angle:Math.PI,patrol:[{x:70,y:600},{x:620,y:600}]},
      {x:350,y:350,angle:0,patrol:[{x:260,y:300},{x:620,y:300},{x:620,y:470},{x:260,y:470}]},
      {x:750,y:150,angle:Math.PI*0.5,patrol:[{x:680,y:70},{x:840,y:70},{x:840,y:460},{x:680,y:460}]},
      {x:1100,y:350,angle:-Math.PI*0.5,patrol:[{x:880,y:70},{x:1230,y:70},{x:1230,y:460},{x:880,y:460}]},
      {x:1150,y:580,angle:Math.PI,patrol:[{x:880,y:530},{x:1230,y:530}]},
    ],
    cameras:[
      {x:650,y:300,angle:0,sweepMin:-Math.PI*0.4,sweepMax:Math.PI*0.4},
      {x:450,y:200,angle:Math.PI*0.5,sweepMin:Math.PI*0.25,sweepMax:Math.PI*0.75},
      {x:850,y:480,angle:-Math.PI*0.5,sweepMin:-Math.PI*0.75,sweepMax:-Math.PI*0.25},
      {x:1050,y:200,angle:Math.PI,sweepMin:Math.PI*0.6,sweepMax:Math.PI*1.4},
    ],
  },
];

export function createWorld(levelIndex) {
  const def = LEVELS[levelIndex];
  const player = {
    x:def.playerStart.x,y:def.playerStart.y,
    width:PLAYER.width,height:PLAYER.height,
    crawling:false,hasloot:false,visible:false,
  };
  const guards = def.guards.map((g,i)=>({
    x:g.x,y:g.y,width:GUARD.width,height:GUARD.height,
    angle:g.angle,patrol:g.patrol,patrolIdx:0,
    alert:0,alertTimer:0,lastSeenX:0,lastSeenY:0,id:i,
  }));
  const cameras = def.cameras.map((c,i)=>({
    x:c.x,y:c.y,width:CAMERA_CFG.width,height:CAMERA_CFG.height,
    angle:c.angle,sweepMin:c.sweepMin,sweepMax:c.sweepMax,sweepDir:1,id:i,
  }));
  const loot = {x:def.loot.x,y:def.loot.y,size:LOOT_SIZE,collected:false};
  let alarmLevel = 0;
  const walls = def.walls;

  function moveEntity(ent,dx,dy){
    const nx=ent.x+dx;
    if(!walls.some(w=>rectsOverlap({x:nx,y:ent.y,width:ent.width,height:ent.height},{x:w.x,y:w.y,width:w.w,height:w.h})))ent.x=nx;
    const ny=ent.y+dy;
    if(!walls.some(w=>rectsOverlap({x:ent.x,y:ny,width:ent.width,height:ent.height},{x:w.x,y:w.y,width:w.w,height:w.h})))ent.y=ny;
    ent.x=Math.max(0,Math.min(FIELD.width-ent.width,ent.x));
    ent.y=Math.max(0,Math.min(FIELD.height-ent.height,ent.y));
  }

  function step(dt,keys){
    const spd=player.crawling?PLAYER.crawlSpeed:PLAYER.speed;
    let dx=0,dy=0;
    if(keys.left)dx-=spd*dt;if(keys.right)dx+=spd*dt;
    if(keys.up)dy-=spd*dt;if(keys.down)dy+=spd*dt;
    if(dx&&dy){dx*=0.707;dy*=0.707;}
    if(dx||dy)moveEntity(player,dx,dy);
    player.crawling=!!keys.crawl;

    if(!loot.collected){
      const pc=rectCenter(player);
      if(Math.hypot(pc.x-loot.x,pc.y-loot.y)<loot.size+14){loot.collected=true;player.hasloot=true;}
    }

    for(const g of guards){
      const gc=rectCenter(g),pc=rectCenter(player);
      const fovA=g.alert>=1?GUARD.alertFovAngle:GUARD.fovAngle;
      const fovR=g.alert>=1?GUARD.alertFovRange:GUARD.fovRange;
      const sees=canSeeTarget(gc,pc,fovA,fovR,g.angle,walls);
      if(sees){g.alert=2;g.alertTimer=3.0;g.lastSeenX=pc.x;g.lastSeenY=pc.y;}
      else if(g.alertTimer>0){g.alertTimer-=dt;if(g.alertTimer<=0)g.alert=g.alert>0?1:0;}
      else if(g.alert===1)g.alert=0;

      if(g.alert===2){
        const gc2=rectCenter(g);
        const da=angleDiff(g.angle,angleTo(gc2,{x:g.lastSeenX-g.width/2,y:g.lastSeenY-g.height/2}));
        g.angle+=Math.sign(da)*Math.min(Math.abs(da),GUARD.turnRate*dt);
        moveEntity(g,Math.cos(g.angle)*GUARD.speed*1.4*dt,Math.sin(g.angle)*GUARD.speed*1.4*dt);
      } else {
        const pt=g.patrol[g.patrolIdx],gc2=rectCenter(g);
        const toX=pt.x-gc2.x,toY=pt.y-gc2.y;
        if(Math.hypot(toX,toY)<8){g.patrolIdx=(g.patrolIdx+1)%g.patrol.length;}
        else{
          const da=angleDiff(g.angle,Math.atan2(toY,toX));
          g.angle+=Math.sign(da)*Math.min(Math.abs(da),GUARD.turnRate*dt);
          moveEntity(g,Math.cos(g.angle)*GUARD.speed*dt,Math.sin(g.angle)*GUARD.speed*dt);
        }
      }
    }

    for(const cam of cameras){
      cam.angle+=CAMERA_CFG.sweepSpeed*cam.sweepDir*dt;
      if(cam.angle>=cam.sweepMax){cam.angle=cam.sweepMax;cam.sweepDir=-1;}
      if(cam.angle<=cam.sweepMin){cam.angle=cam.sweepMin;cam.sweepDir=1;}
    }

    let detected=false;player.visible=false;
    const pc=rectCenter(player);
    for(const g of guards){
      const gc=rectCenter(g);
      const fovA=g.alert>=1?GUARD.alertFovAngle:GUARD.fovAngle;
      const fovR=g.alert>=1?GUARD.alertFovRange:GUARD.fovRange;
      if(canSeeTarget(gc,pc,fovA,fovR,g.angle,walls)){detected=true;player.visible=true;}
    }
    for(const cam of cameras){
      if(canSeeTarget(cam,pc,CAMERA_CFG.fovAngle,CAMERA_CFG.fovRange,cam.angle,walls)){detected=true;player.visible=true;}
    }
    alarmLevel=detected?Math.min(1,alarmLevel+ALARM.riseRate*dt):Math.max(0,alarmLevel-ALARM.fallRate*dt);
    return {caught:alarmLevel>=ALARM.alertThreshold,lootDone:loot.collected,escaped:loot.collected&&player.x<55};
  }

  function getState(){return{player,guards,cameras,loot,walls,alarmLevel,def};}
  return{step,getState};
}
