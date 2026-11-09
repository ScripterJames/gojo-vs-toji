/* Hakone Arena: independently playable fan-game roster abilities.
   Original Gojo Blue and Toji Heavenly Restriction remain in the copied combat engine.
   No chance-based wagering: Hakari's "Jackpot" is a timed power-up on a cooldown. */
(() => {
  'use strict';
  const ROSTER=['Gojo','Toji','Hakari','Sukuna','Megumi','Yuji','Nobara','Maki'];
  const NAMES={
    Gojo:'Blue · five-second nonlethal vortex',
    Toji:'Heavenly Restriction · evasive striking dash',
    Hakari:'Jackpot · eight-second strength buff and small regeneration',
    Sukuna:'Cleave · three timed midrange slashes',
    Megumi:'Divine Dog · eight-second companion attack',
    Yuji:'Black Flash · close-range lightning lunge',
    Nobara:'Straw Doll · flying nail and delayed Resonance',
    Maki:'Weapon Sweep · long-reach staff counter'
  };
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  function init(f) {
    f.jackpot=0;f.jackpotAge=0;f.cleave=0;f.pet=0;f.petX=f.x+f.w/2;f.petCooldown=0;
    f.newSpecialFlash=0;f.cleaveVictim=null;
    f.blackFlash=0;f.blackFlashHit=false;f.blackFlashDir=f.face;
    f.nail=null;f.resonance=0;f.resonanceTarget=null;
    f.sweep=0;f.sweepHit=false;
    return f;
  }
  function onCast(f,other) {
    f.attack=0;f.attackKind='';f.specialHeld=true;
    switch (f.name) {
      case 'Hakari':
        f.jackpot=480;f.jackpotAge=0;f.newSpecialFlash=24;f.specialCool=660;
        f.flash=Math.max(f.flash,12);return true;
      case 'Sukuna':
        f.cleave=40;f.cleaveVictim=other;f.newSpecialFlash=17;f.specialCool=330;return true;
      case 'Megumi':
        f.pet=480;f.petX=f.x+f.w/2+f.face*65;f.petCooldown=30;
        f.newSpecialFlash=24;f.specialCool=570;return true;
      case 'Yuji':
        f.blackFlash=19;f.blackFlashHit=false;f.blackFlashDir=f.face;
        f.newSpecialFlash=19;f.specialCool=330;return true;
      case 'Nobara':
        f.nail={x:f.x+f.w/2+f.face*37,y:f.y+f.h*.41,vx:f.face*13,life:49};
        f.resonance=0;f.resonanceTarget=null;
        f.newSpecialFlash=16;f.specialCool=375;return true;
      case 'Maki':
        f.sweep=25;f.sweepHit=false;f.newSpecialFlash=18;f.specialCool=345;return true;
      default: return false;
    }
  }
  function melee(f,raw) {
    if (f.jackpot>0) return Math.ceil(raw*(1.3+.05*(f.specialPower||0)));
    return raw;
  }
  function impact(attacker,defender,amount,color,stun=5) {
    if (defender.hp<=0 || defender.invul>0 || amount<=0) return false;
    const dealt=Math.min(amount,defender.hp);
    defender.hp=Math.max(0,defender.hp-dealt);
    defender.flash=Math.max(defender.flash,9);
    defender.hitstun=Math.max(defender.hitstun||0,stun);
    defender.hitDirection=attacker.face;defender.hitNumber=dealt;defender.hitNumberTick=28;
    attacker.hitSpark=10;attacker.hitSparkX=defender.x+defender.w/2;
    attacker.hitSparkY=defender.y+defender.h/2;attacker.hitSparkColor=color;
    if(window.AbilityFX)window.AbilityFX.play('hit',defender);
    return true;
  }
  function tick(f,other) {
    if(f.newSpecialFlash>0)f.newSpecialFlash--;
    if(f.hp<=0){f.jackpot=0;f.cleave=0;f.pet=0;f.blackFlash=0;f.nail=null;f.resonance=0;f.sweep=0;return;}
    if(f.jackpot>0) {
      f.jackpot--;f.jackpotAge++;
      if(f.jackpotAge%60===0)f.hp=Math.min(f.maxHp||100,f.hp+1+(f.specialPower||0));
    }
    if(f.cleave>0) {
      f.cleave--;
      if([29,19,9].includes(f.cleave)) {
        const dx=f.face*((other.x+other.w/2)-(f.x+f.w/2));
        const dy=Math.abs((other.y+other.h/2)-(f.y+f.h/2));
        if(dx>=-24&&dx<=325&&dy<125)impact(f,other,8+2*(f.specialPower||0),'#ff668d',5);
      }
    }
    if(f.pet>0) {
      f.pet--;
      const own=f.x+f.w/2,enemy=other.x+other.w/2;
      const target=Math.abs(enemy-own)<430?enemy-Math.sign(enemy-own)*35:own+f.face*65;
      f.petX=clamp(f.petX+clamp(target-f.petX,-8,8),22,940);
      f.petCooldown=Math.max(0,f.petCooldown-1);
      if(f.petCooldown===0 && Math.abs(f.petX-enemy)<80 && Math.abs(f.y-other.y)<110) {
        if(impact(f,other,5+2*(f.specialPower||0),'#b6b0ff',3))f.petCooldown=80;
      }
    }
    if(f.blackFlash>0){
      f.blackFlash--;
      const dir=f.blackFlashDir||f.face;
      f.x=clamp(f.x+dir*11,20,886);
      const dx=dir*((other.x+other.w/2)-(f.x+f.w/2));
      if(!f.blackFlashHit && dx>=-22 && dx<=77 &&
         Math.abs((f.y+f.h*.5)-(other.y+other.h*.5))<92){
        if(impact(f,other,20+5*(f.specialPower||0),'#668fff',12)){
          f.blackFlashHit=true;
          other.vy=Math.min(other.vy||0,-5);
        }
      }
    }
    if(f.nail){
      const n=f.nail;n.x+=n.vx;n.life--;
      if(n.life>0 && n.x>=other.x-8 && n.x<=other.x+other.w+8 &&
         Math.abs(n.y-(other.y+other.h*.41))<77 &&
         impact(f,other,9+2*(f.specialPower||0),'#f8b678',6)){
        f.resonance=28;f.resonanceTarget=other;f.nail=null;
      }else if(n.life<=0 || n.x<0 || n.x>960)f.nail=null;
    }
    if(f.resonance>0){
      f.resonance--;
      if(f.resonance===0 && f.resonanceTarget?.hp>0){
        impact(f,f.resonanceTarget,8+2*(f.specialPower||0),'#ed85c3',6);
        f.resonanceTarget=null;
      }
    }
    if(f.sweep>0){
      f.sweep--;
      const dx=f.face*((other.x+other.w/2)-(f.x+f.w/2));
      if(!f.sweepHit && f.sweep<=17 && f.sweep>=7 &&
         dx>=-25 && dx<=227 && Math.abs(other.y-f.y)<95 &&
         impact(f,other,20+5*(f.specialPower||0),'#bdffc8',11)){
        f.sweepHit=true;
        other.vx=f.face*7;
      }
    }
  }
  function behind(ctx,f,frame){
    if(f.jackpot>0){
      const x=f.x+f.w/2,y=f.y+51;
      ctx.save();ctx.lineWidth=4;ctx.strokeStyle='#f7ce65';
      ctx.globalAlpha=Math.min(.7,f.jackpot/36);
      for(let i=0;i<3;i++){ctx.beginPath();ctx.ellipse(x,y,43+i*9,63+i*7,0,0,Math.PI*2);ctx.stroke();}
      for(let i=0;i<8;i++){const a=i*Math.PI/4+frame*.035;ctx.fillStyle=i%2?'#fff8b2':'#f9a94b';
        ctx.fillRect(Math.round(x+Math.cos(a)*60),Math.round(y+Math.sin(a)*75),4,4);}
      ctx.restore();
    }
  }
  function front(ctx,f,frame){
    if(f.pet>0){
      // Original sprite: 20×13 pixel Divine Dog, rasterized at 3× whole-pixel scale.
      const p=f.petX,y=f.y+f.h-6;
      ctx.save();ctx.translate(Math.round(p),Math.round(y));
      ctx.scale(f.face<0?-3:3,3);
      const rr=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h)};
      const hop=frame%16<8?0:-1;
      rr(-11,-7+hop,19,7,'#101521');rr(-7,-11+hop,12,6,'#323c61');
      rr(4,-13+hop,10,9,'#202846');rr(5,-16+hop,3,5,'#333e6c');
      rr(11,-17+hop,3,6,'#333e6c');rr(12,-8+hop,7,4,'#141a2a');
      rr(10,-11+hop,2,2,'#d2d8ff');rr(18,-6+hop,3,2,'#efe3fd');
      rr(-7,-2,4,6,'#181b2c');rr(4,-2,4,6,'#181b2c');
      rr(-14,-8+hop,5,3,'#384462');rr(-17,-10+hop,4,3,'#536187');
      ctx.restore();
    }
    if(f.cleave>0){
      const x=f.x+f.face*200,y=f.y+54,age=40-f.cleave;
      ctx.save();ctx.globalCompositeOperation='screen';ctx.lineCap='round';
      for(let i=0;i<3;i++){
        const at=age-i*10;if(at<0||at>12)continue;
        ctx.globalAlpha=.88*(1-at/13);ctx.strokeStyle=['#ff5b85','#fff0f6','#ec326d'][i];ctx.lineWidth=i===1?3:6;
        ctx.beginPath();ctx.moveTo(x-100+i*16,y+60-i*12);ctx.lineTo(x+85+i*16,y-70+i*9);ctx.stroke();
      }
      ctx.restore();
    }
    if(f.blackFlash>0){
      const x=f.x+f.w/2+f.blackFlashDir*40,y=f.y+52;
      ctx.save();ctx.strokeStyle='#809bff';ctx.lineWidth=5;
      for(let i=0;i<4;i++){
        const dx=f.blackFlashDir*(i*13);
        ctx.beginPath();ctx.moveTo(x-dx-19,y-21+i*10);
        ctx.lineTo(x-dx+4,y-30+i*10);ctx.lineTo(x-dx+14,y-16+i*10);ctx.stroke();
      }
      ctx.restore();
    }
    if(f.nail){
      ctx.save();ctx.fillStyle='#fde4b0';ctx.fillRect(Math.round(f.nail.x)-8,Math.round(f.nail.y)-2,14,4);
      ctx.fillStyle='#e8a0b7';ctx.fillRect(Math.round(f.nail.x)-11,Math.round(f.nail.y),6,2);ctx.restore();
    }
    if(f.resonance>0 && f.resonanceTarget){
      const x=f.resonanceTarget.x+f.resonanceTarget.w/2,y=f.resonanceTarget.y+19;
      ctx.save();ctx.strokeStyle='#e9a4cb';ctx.lineWidth=3;ctx.beginPath();
      ctx.moveTo(x-12,y-12);ctx.lineTo(x+12,y+12);
      ctx.moveTo(x+12,y-12);ctx.lineTo(x-12,y+12);ctx.stroke();ctx.restore();
    }
    if(f.sweep>0){
      const age=25-f.sweep,angle=-.65+Math.min(1,age/18)*1.7;
      const x=f.x+f.w/2,y=f.y+52,dir=f.face;
      ctx.save();ctx.strokeStyle='#1c2d33';ctx.lineWidth=11;ctx.beginPath();
      ctx.moveTo(x-dir*20,y+20);ctx.lineTo(x+dir*Math.cos(angle)*205,y+Math.sin(angle)*83);ctx.stroke();
      ctx.strokeStyle='#b4bdab';ctx.lineWidth=6;ctx.beginPath();
      ctx.moveTo(x-dir*20,y+20);ctx.lineTo(x+dir*Math.cos(angle)*205,y+Math.sin(angle)*83);ctx.stroke();
      ctx.restore();
    }
    if(f.jackpot>0){
      ctx.save();ctx.fillStyle='#ffe58f';ctx.textAlign='center';ctx.font='bold 15px monospace';
      ctx.fillText('JACKPOT '+(f.jackpot/60).toFixed(1)+'s',f.x+f.w/2,f.y-21);ctx.restore();
    }
  }
  function status(f){
    if(f.jackpot>0)return 'JACKPOT '+(f.jackpot/60).toFixed(1)+'s';
    if(f.cleave>0)return 'CLEAVE';
    if(f.pet>0)return 'DIVINE DOG '+(f.pet/60).toFixed(1)+'s';
    if(f.blackFlash>0)return 'BLACK FLASH';
    if(f.nail)return 'NAIL IN FLIGHT';
    if(f.resonance>0)return 'RESONANCE '+(f.resonance/60).toFixed(1)+'s';
    if(f.sweep>0)return 'WEAPON SWEEP';
    return f.specialCool?'SPECIAL '+Math.ceil(f.specialCool/60)+'s':'SPECIAL READY';
  }
  window.HakoneRoster={roster:ROSTER,descriptions:NAMES,init,onCast,melee,tick,behind,front,status};
})();