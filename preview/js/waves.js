/* Gojo vs Toji – arcade waves, coins, five-fighter roster, and three new specials.
   Independent of input/rendering: the original combat engine remains responsible
   for movement, jumps, hitboxes and victory in local two-player mode. */
(() => {
  'use strict';
  const ROSTER = ['Gojo', 'Toji', 'Hakari', 'Sukuna', 'Megumi'];
  const TAU = 2 * Math.PI;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const coinKey = 'gojo-vs-toji-arcade-coins-v1';
  const palette = { Hakari:'#ffda73', Sukuna:'#ff5d8d', Megumi:'#9f9dff' };
  let coins = 0, stage = 1, cleared = 0, pendingUntil = 0, firstEnemy = 'Toji';
  let announcement = '', announcementUntil = 0;
  try { coins = Math.max(0, Number.parseInt(localStorage.getItem(coinKey), 10) || 0); } catch (_) {}
  function save() { try { localStorage.setItem(coinKey, String(coins)); } catch (_) {} }

  function start(playerName, opponentName) {
    stage = 1;
    cleared = 0;
    pendingUntil = 0;
    firstEnemy = opponentName || (playerName === 'Toji' ? 'Gojo' : 'Toji');
    announcement = 'WAVE 1';
    announcementUntil = 110;
  }
  function opponentName(playerName, round = stage) {
    const preferred = round === 1 ? firstEnemy : ROSTER[(round - 2) % ROSTER.length];
    if (preferred !== playerName) return preferred;
    const index = ROSTER.indexOf(preferred);
    return ROSTER[(index + 1) % ROSTER.length];
  }
  function prepareEnemy(enemy) {
    enemy.maxHp = Math.min(250, 100 + 12 * (stage - 1));
    enemy.hp = enemy.maxHp;
    enemy.moveFactor = Math.min(1.48, 1 + 0.045 * (stage - 1));
    enemy.aiFactor = Math.min(1.65, 1 + 0.07 * (stage - 1));
    enemy.damageFactor = Math.min(1.75, 1 + 0.07 * (stage - 1));
    enemy.aiDelay = 12;
    return enemy;
  }
  function isTransitioning() { return pendingUntil > 0; }
  function onVictory(player, frame) {
    if (pendingUntil) return null;
    const reward = 25 + stage * 10;
    coins += reward;
    cleared++;
    save();
    const wonStage = stage;
    stage++;
    pendingUntil = frame + 90;
    player.hp = Math.min(player.maxHp || 100, player.hp + 22);
    player.attack = 0;
    player.attackKind = '';
    player.hitstun = 0;
    player.jackpot = 0;
    player.petTimer = 0;
    player.cleaveTimer = 0;
    announcement = `WAVE ${wonStage} CLEAR!   +$${reward}`;
    announcementUntil = pendingUntil;
    return { reward, coins, stage, next: opponentName(player.name) };
  }
  function advanceIfReady(frame, make, fighters) {
    if (!pendingUntil || frame < pendingUntil) return false;
    const name = opponentName(fighters[0].name);
    const opponent = prepareEnemy(make(name, 700, 1));
    fighters[1] = opponent;
    pendingUntil = 0;
    announcement = `WAVE ${stage}   ${name.toUpperCase()}!`;
    announcementUntil = frame + 100;
    return opponent;
  }
  function resetForFight(fighter) {
    fighter.maxHp = fighter.maxHp || 100;
    fighter.jackpot = 0;
    fighter.cleaveTimer = 0;
    fighter.petTimer = 0;
    fighter.petX = fighter.x + fighter.w/2 + fighter.face * 70;
    fighter.petCooldown = 0;
    fighter.specialFlash = 0;
  }
  function damage(attacker, target, amount) {
    let value = amount;
    if (attacker.jackpot > 0) value *= 1.45;
    if (target.jackpot > 0) value *= 0.88;
    if (attacker.damageFactor) value *= attacker.damageFactor;
    return Math.max(1, Math.round(value));
  }
  function onCast(f, other, frame) {
    if (f.name === 'Hakari') {
      f.jackpot = 8 * 60;
      f.specialFlash = 28;
      return true;
    }
    if (f.name === 'Sukuna') {
      f.cleaveTimer = 39;
      f.cleaveVictim = other;
      f.specialFlash = 14;
      return true;
    }
    if (f.name === 'Megumi') {
      f.petTimer = 9 * 60;
      f.petCooldown = 35;
      f.petX = f.x + f.w/2 + f.face * 70;
      f.specialFlash = 16;
      return true;
    }
    return false;
  }
  function tickActor(f, other, frame) {
    if (f.jackpot > 0) f.jackpot--;
    if (f.specialFlash > 0) f.specialFlash--;
    if (f.cleaveTimer > 0) {
      f.cleaveTimer--;
      if ([30, 20, 10].includes(f.cleaveTimer)) {
        const dx = f.face * ((other.x + other.w/2) - (f.x+f.w/2));
        const dy = Math.abs((f.y + f.h/2)-(other.y + other.h/2));
        if (other.invul <= 0 && other.hp > 0 && dx >= -30 && dx < 360 && dy < 120) {
          // Cleave is substantial but never a one-button instant KO.
          const before = other.hp;
          other.hp = Math.max(1, before - 6);
          if (other.hp < before) {
            other.flash = Math.max(other.flash, 7);
            other.hitNumber = before - other.hp;
            other.hitNumberTick = 22;
            other.hitstun = Math.max(other.hitstun || 0, 3);
            other.hitDirection = f.face;
          }
        }
      }
    }
    if (f.petTimer > 0) {
      f.petTimer--;
      const center = f.x + f.w/2;
      const enemyCenter = other.x + other.w/2;
      const chase = Math.abs(enemyCenter - center) < 425;
      const desired = chase ? enemyCenter - Math.sign(enemyCenter - center) * 44
                            : center + f.face * 60;
      if (!Number.isFinite(f.petX)) f.petX = center + f.face * 60;
      f.petX += clamp(desired - f.petX, -7.8, 7.8);
      f.petCooldown = Math.max(0, (f.petCooldown || 0) - 1);
      if (f.petCooldown === 0 && other.invul === 0 && other.hp > 0 &&
          Math.abs(f.petX - enemyCenter) < 78 && Math.abs(other.y-f.y)<95) {
        const before = other.hp;
        other.hp = Math.max(0, other.hp - 4);
        if (other.hp < before) {
          other.flash = Math.max(other.flash, 8);
          other.hitNumber = before-other.hp;
          other.hitNumberTick = 25;
          other.hitstun = Math.max(other.hitstun||0, 3);
          other.hitDirection = f.face;
        }
        f.petCooldown = 77;
      }
    }
  }
  function background(ctx, f, tick) {
    if (f.jackpot > 0) {
      const x = f.x + f.w/2, y = f.y+65;
      ctx.save(); ctx.globalCompositeOperation='screen';
      ctx.strokeStyle='#f6bb42';ctx.lineWidth=4;
      for (let i=0;i<3;i++) {
        ctx.globalAlpha = (0.25+(Math.sin(tick*.14+i)*.5+.5)*.3) * clamp(f.jackpot/18,0,1);
        ctx.beginPath(); ctx.ellipse(x,y,44+i*8,66+i*9,0,0,TAU);ctx.stroke();
      }
      for(let i=0;i<15;i++){
        const a=i*2.3999+tick*.035, r=35+((i*17+tick*1.5)%39);
        ctx.globalAlpha=.43;
        ctx.fillStyle=i%3===0?'#ffffff':'#ffe08a';
        ctx.fillRect(Math.round(x+Math.cos(a)*r), Math.round(y+Math.sin(a)*r), i%4===0?5:3,4);
      }
      ctx.restore();
    }
    if(f.name === 'Sukuna'&&f.cleaveTimer>0){
      ctx.save();ctx.globalAlpha=.16;ctx.fillStyle='#ad275c';
      const x=f.x+f.face*170;ctx.fillRect(x-140,f.y+3,280,113);ctx.restore();
    }
  }
  function dog(ctx,f,tick) {
    const x=f.petX,y=f.y+f.h-13;
    ctx.save();ctx.translate(Math.round(x),Math.round(y));ctx.scale(f.face<0?-1:1,1);
    // All rects drawn at 3x for crisp 24×18 pixel-art Divine Dog-like shikigami.
    ctx.scale(3,3);
    function r(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(x,y,w,h)}
    const bounce=Math.round(Math.sin(tick*.35)*1.5);
    r(-12,-6+bounce,19,7,'#10152a');r(-9,-10+bounce,14,5,'#29324c');
    r(4,-13+bounce,9,10,'#10152a');r(7,-17+bounce,3,5,'#14182e');
    r(11,-19+bounce,3,7,'#242b47');r(15,-17+bounce,3,7,'#222942');
    r(5,-12+bounce,12,8,'#333e5e');r(13,-8+bounce,6,5,'#14182a');
    r(12,-11+bounce,2,2,'#b6b7fa');r(18,-6+bounce,2,2,'#e6d2ff');
    r(-10,0,4,5,'#181c2d');r(2,0,4,5,'#181c2d');
    r(-15,-7+bounce,4,3,'#272d47');r(-18,-11+bounce,5,4,'#343e61');
    r(-5,-10+bounce,6,2,'#99a5cc');
    if(f.petCooldown>=68){r(18,-6+bounce,6,3,'#b5a4ff');r(24,-6+bounce,5,2,'#e1d7ff')}
    ctx.restore();
  }
  function foreground(ctx, f, tick) {
    if(f.petTimer>0)dog(ctx,f,tick);
    if(f.jackpot>0){
      ctx.save();ctx.textAlign='center';ctx.font='bold 15px monospace';
      ctx.fillStyle='#ffdc6b';ctx.fillText('JACKPOT x1.45',f.x+f.w/2,f.y-28);ctx.restore();
    }
    if(f.cleaveTimer>0){
      const target=f.cleaveVictim;
      const inRange=target && Math.abs(target.x-f.x)<370;
      const x=inRange?target.x+target.w/2:f.x+f.face*240;
      const y=inRange?target.y+target.h/2:f.y+45;
      ctx.save();ctx.lineCap='round';ctx.globalCompositeOperation='screen';
      for(let i=0;i<5;i++){
        const phase=(39-f.cleaveTimer)-i*3;
        if(phase<0 || phase>17)continue;
        const alpha=clamp(1-phase/18,.1,1),ox=(i-2)*19,oy=(i%3-1)*20;
        ctx.globalAlpha=alpha*.9;ctx.strokeStyle=i%2?'#ffb4d7':'#ff467d';ctx.lineWidth=i%2?3:5;
        ctx.beginPath();ctx.moveTo(x-56+ox,y+52+oy);ctx.lineTo(x+58+ox,y-50+oy);ctx.stroke();
        ctx.globalAlpha=alpha*.6;ctx.strokeStyle='#ffecf3';ctx.lineWidth=1;
        ctx.beginPath();ctx.moveTo(x-51+ox,y+49+oy);ctx.lineTo(x+59+ox,y-54+oy);ctx.stroke();
      }
      ctx.restore();
    }
  }
  function drawHud(ctx, frame, fighters) {
    ctx.save();
    ctx.fillStyle='rgba(12,13,29,.85)';ctx.fillRect(419,23,120,56);
    ctx.strokeStyle='#77718c';ctx.strokeRect(419,23,120,56);
    ctx.textAlign='center';ctx.font='bold 15px monospace';
    ctx.fillStyle='#f3f1ff';ctx.fillText('WAVE '+stage,479,43);
    ctx.fillStyle='#f7d26a';ctx.fillText('$'+coins,479,64);
    ctx.restore();
    if(frame < announcementUntil || pendingUntil){
      ctx.save();ctx.textAlign='center';
      const isClear=pendingUntil>0;
      ctx.fillStyle='rgba(13,14,32,.83)';ctx.fillRect(273,144,412,71);
      ctx.strokeStyle=isClear?'#f4d278':'#8acbff';ctx.strokeRect(273,144,412,71);
      ctx.font='bold 24px monospace';ctx.fillStyle=isClear?'#ffe3a0':'#d6f2ff';
      ctx.fillText(announcement,479,189);
      ctx.restore();
    }
  }
  window.WaveSystem = {
    roster:ROSTER, start, opponentName, prepareEnemy, isTransitioning, onVictory,
    advanceIfReady, resetForFight, damage, onCast, tickActor, background, foreground,
    drawHud, get stage(){return stage},get coins(){return coins},get cleared(){return cleared},
    get pendingUntil(){return pendingUntil}, get announcement(){return announcement},
    get announcementUntil(){return announcementUntil}
  };
})();