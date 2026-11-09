/* Hakone Arena: independently playable fan-game roster abilities.
   Original Gojo Blue and Toji Heavenly Restriction remain in the copied combat engine.
   No chance-based wagering: Hakari's "Jackpot" is a timed power-up on a cooldown. */
(() => {
  'use strict';
  const ROSTER=['Gojo','Toji','Hakari','Sukuna','Megumi','Yuji','Nobara','Maki','Toge','Panda','Nanami','Yuta','Choso','Todo'];
  const NAMES={
    Gojo:'Blue · five-second nonlethal vortex',
    Toji:'Heavenly Restriction · evasive striking dash',
    Hakari:'Jackpot · eight-second strength buff and small regeneration',
    Sukuna:'Cleave · three timed midrange slashes',
    Megumi:'Divine Dog · eight-second companion attack',
    Yuji:'Black Flash · close-range lightning lunge',
    Nobara:'Straw Doll · flying nail and delayed Resonance',
    Maki:'Weapon Sweep · long-reach staff counter',
    Toge:'Cursed Speech · short-range stunning shout',
    Panda:'Guard Stomp · defensive shield and ground impact',
    Nanami:'Ratio Strike · precise delayed 7:3 weak-point cut',
    Yuta:'Rika Guard · reactive counter and recovery',
    Choso:'Piercing Blood · delayed narrow long-range beam',
    Todo:'Boogie Woogie · tactical position swap and stun'
  };
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  function init(f) {
    f.jackpot=0;f.jackpotAge=0;f.cleave=0;f.pet=0;f.petX=f.x+f.w/2;f.petCooldown=0;
    f.newSpecialFlash=0;f.cleaveVictim=null;
    f.blackFlash=0;f.blackFlashHit=false;f.blackFlashDir=f.face;
    f.nail=null;f.resonance=0;f.resonanceTarget=null;
    f.sweep=0;f.sweepHit=false;
    f.speech=0;f.speechDir=f.face;
    f.stomp=0;f.stompHit=false;
    f.ratio=0;f.ratioDir=f.face;
    f.rika=0;f.rikaTriggered=false;f.rikaLastHp=f.hp;
    f.pierce=0;f.pierceDir=f.face;f.pierceHit=false;
    f.boogie=0;f.boogieDone=false;
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
      case 'Toge':
        f.speech=22;f.speechDir=f.face;f.newSpecialFlash=22;f.specialCool=420;return true;
      case 'Panda':
        f.stomp=30;f.stompHit=false;f.invul=Math.max(f.invul,20);
        f.newSpecialFlash=30;f.specialCool=420;return true;
      case 'Nanami':
        f.ratio=28;f.ratioDir=f.face;f.newSpecialFlash=28;f.specialCool=360;return true;
      case 'Yuta':
        f.rika=360;f.rikaTriggered=false;f.rikaLastHp=f.hp;
        f.newSpecialFlash=28;f.specialCool=540;return true;
      case 'Choso':
        f.pierce=24;f.pierceDir=f.face;f.pierceHit=false;
        f.newSpecialFlash=24;f.specialCool=390;return true;
      case 'Todo':
        f.boogie=18;f.boogieDone=false;
        f.newSpecialFlash=18;f.specialCool=390;return true;
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
    if(f.hp<=0){f.jackpot=0;f.cleave=0;f.pet=0;f.blackFlash=0;f.nail=null;f.resonance=0;f.sweep=0;f.speech=0;f.stomp=0;f.ratio=0;f.rika=0;f.pierce=0;f.boogie=0;return;}
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
    if(f.speech>0){
      f.speech--;
      if(f.speech===13){
        const dx=f.speechDir*((other.x+other.w/2)-(f.x+f.w/2));
        if(dx>=-18&&dx<=240&&Math.abs(other.y-f.y)<100){
          impact(f,other,5+2*(f.specialPower||0),'#b8f2f0',42+8*(f.specialPower||0));
        }
      }
    }
    if(f.stomp>0){
      f.stomp--;
      if(f.stomp===14&&!f.stompHit &&
         Math.abs((other.x+other.w/2)-(f.x+f.w/2))<=135 &&
         Math.abs(other.y-f.y)<100){
        if(impact(f,other,18+4*(f.specialPower||0),'#f9dcb4',13)){
          f.stompHit=true;other.vy=Math.min(other.vy||0,-5);
        }
      }
    }
    if(f.ratio>0){
      f.ratio--;
      if(f.ratio===12){
        const dx=f.ratioDir*((other.x+other.w/2)-(f.x+f.w/2));
        if(dx>=-17&&dx<=155&&Math.abs(other.y-f.y)<95){
          impact(f,other,24+6*(f.specialPower||0),'#f8d67c',14);
        }
      }
    }
    // Yuta's Rika Guard: one reactive counter when hit, rather than a passive attacker.
    if(f.rika>0){
      f.rika--;
      if(!f.rikaTriggered && f.hp<f.rikaLastHp){
        f.rikaTriggered=true;
        f.hp=Math.min(f.maxHp||100,f.hp+5+2*(f.specialPower||0));
        if(Math.abs((other.x+other.w/2)-(f.x+f.w/2))<=285 &&
           Math.abs(other.y-f.y)<115){
          impact(f,other,22+4*(f.specialPower||0),'#c0bbff',11);
        }
      }
      f.rikaLastHp=f.hp;
    }
    // Piercing Blood: narrow beam after a 15-frame warning. Jumping can dodge it.
    if(f.pierce>0){
      f.pierce--;
      if(f.pierce===9 && !f.pierceHit){
        const dx=f.pierceDir*((other.x+other.w/2)-(f.x+f.w/2));
        const dy=Math.abs((other.y+other.h*.47)-(f.y+f.h*.47));
        if(dx>=0 && dx<=555 && dy<=43 &&
           impact(f,other,20+4*(f.specialPower||0),'#f26382',9)){
          f.pierceHit=true;
        }
      }
    }
    // Boogie Woogie swaps positions and briefly stuns but causes no damage itself.
    if(f.boogie>0){
      f.boogie--;
      if(f.boogie===10 && !f.boogieDone){
        f.boogieDone=true;
        if(other.hp>0 && Math.abs(other.x-f.x)<=345 && Math.abs(other.y-f.y)<95){
          const oldX=f.x;f.x=clamp(other.x,20,886);other.x=clamp(oldX,20,886);
          f.face=other.x>f.x?1:-1;other.face=f.x>other.x?1:-1;
          f.invul=Math.max(f.invul,10+2*(f.specialPower||0));
          if(other.invul<=0){
            other.hitstun=Math.max(other.hitstun||0,12+3*(f.specialPower||0));
            other.hitDirection=other.x>f.x?1:-1;
            other.flash=Math.max(other.flash,8);
          }
        }
      }
    }
  }
  function behind(ctx,f,frame){
    if(f.rika>0){
      const x=f.x+f.w/2-39*f.face,y=f.y+60;
      ctx.save();ctx.globalAlpha=.15+.14*Math.sin(frame*.18)**2;
      ctx.fillStyle='#b7b4e9';ctx.beginPath();ctx.ellipse(x,y,38,66,0,0,Math.PI*2);ctx.fill();ctx.restore();
    }
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
    if(f.speech>0){
      const age=22-f.speech,origin=f.x+f.w/2+f.speechDir*28,y=f.y+35;
      ctx.save();ctx.lineWidth=3;ctx.strokeStyle='#a4f2f1';
      for(let i=0;i<3;i++){
        const radius=14+age*8+i*20;
        ctx.globalAlpha=Math.max(0,.8-age/26-i*.18);
        ctx.beginPath();ctx.ellipse(origin+f.speechDir*radius*.65,y,radius*.65,17+i*14,0,0,Math.PI*2);ctx.stroke();
      }
      ctx.restore();
    }
    if(f.stomp>0){
      const age=30-f.stomp,center=f.x+f.w/2,ground=f.y+f.h;
      ctx.save();ctx.strokeStyle=f.invul>0?'#d9f4ff':'#f4c68b';ctx.lineWidth=5;
      ctx.globalAlpha=f.invul>0?.55:Math.max(.15,1-age/33);
      ctx.beginPath();ctx.ellipse(center,f.y+47,49,70,0,0,Math.PI*2);ctx.stroke();
      if(f.stomp<=14){ctx.strokeStyle='#e9af75';ctx.lineWidth=4;
      for(let j=0;j<3;j++){ctx.beginPath();ctx.ellipse(center,ground,50+age*3+j*19,6+j*2,0,0,Math.PI);ctx.stroke();}}
      ctx.restore();
    }
    if(f.ratio>0){
      const cx=f.x+f.w/2,side=f.ratioDir,y=f.y+49;
      ctx.save();ctx.strokeStyle=f.ratio<=12?'#fff0ab':'#d4bc7b';
      ctx.lineWidth=3;ctx.globalAlpha=.75;
      ctx.beginPath();ctx.moveTo(cx+side*12,y-33);ctx.lineTo(cx+side*149,y+31);ctx.stroke();
      ctx.strokeStyle='#675545';ctx.beginPath();
      ctx.moveTo(cx+side*109,y+12);ctx.lineTo(cx+side*119,y-10);ctx.stroke();
      ctx.fillStyle='#f2d990';ctx.font='bold 15px monospace';ctx.textAlign='center';
      ctx.fillText('7:3',cx+side*90,y-35);ctx.restore();
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
    if(f.rika>0){
      const x=Math.round(f.x+f.w/2-f.face*64),y=Math.round(f.y+18),breath=frame%20<10?0:2;
      ctx.save();ctx.globalAlpha=.82;
      ctx.fillStyle='#24283f';ctx.fillRect(x-24,y+16+breath,48,76);
      ctx.fillStyle='#d2d0f0';ctx.fillRect(x-20,y+10+breath,40,64);
      ctx.fillStyle='#eef0ff';ctx.fillRect(x-15,y+6+breath,30,19);
      ctx.fillStyle='#45436f';ctx.fillRect(x-10,y+16+breath,6,4);ctx.fillRect(x+5,y+16+breath,6,4);
      ctx.fillStyle='#c6b5e6';ctx.fillRect(x-28,y+42+breath,12,37);ctx.fillRect(x+16,y+42+breath,12,37);
      if(f.rikaTriggered){ctx.strokeStyle='#f2eaff';ctx.lineWidth=3;ctx.strokeRect(x-33,y+1+breath,66,94);}
      ctx.restore();
    }
    if(f.pierce>0){
      const x=f.x+f.w/2+f.pierceDir*24,y=f.y+f.h*.47;
      ctx.save();ctx.strokeStyle='#df4e70';ctx.lineCap='square';
      if(f.pierce>9){ctx.globalAlpha=.75;ctx.lineWidth=3;
        ctx.beginPath();ctx.moveTo(x,y-18);ctx.lineTo(x+f.pierceDir*28,y-18);ctx.stroke();
        ctx.beginPath();ctx.moveTo(x,y+18);ctx.lineTo(x+f.pierceDir*28,y+18);ctx.stroke();
      }else{
        ctx.globalAlpha=.8*(f.pierce/9);ctx.lineWidth=9;
        ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+f.pierceDir*545,y);ctx.stroke();
        ctx.strokeStyle='#ffc5cc';ctx.lineWidth=3;ctx.beginPath();
        ctx.moveTo(x,y);ctx.lineTo(x+f.pierceDir*545,y);ctx.stroke();
      }ctx.restore();
    }
    if(f.boogie>0){
      const x=f.x+f.w/2,y=f.y+43,age=18-f.boogie;
      ctx.save();ctx.strokeStyle='#d3a5ff';ctx.lineWidth=3;
      ctx.globalAlpha=Math.max(.15,1-age/21);
      for(let j=0;j<3;j++){ctx.beginPath();ctx.ellipse(x,y,12+age*4+j*14,17+age*2+j*8,0,0,Math.PI*2);ctx.stroke();}
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
    if(f.speech>0)return 'CURSED SPEECH';
    if(f.stomp>0)return f.invul>0?'PANDA GUARD':'PANDA STOMP';
    if(f.ratio>0)return 'RATIO 7:3';
    if(f.rika>0)return f.rikaTriggered?'RIKA COUNTERED':'RIKA GUARD '+(f.rika/60).toFixed(1)+'s';
    if(f.pierce>0)return f.pierce>9?'PIERCING BLOOD CHARGE':'PIERCING BLOOD';
    if(f.boogie>0)return 'BOOGIE WOOGIE';
    return f.specialCool?'SPECIAL '+Math.ceil(f.specialCool/60)+'s':'SPECIAL READY';
  }
  window.HakoneRoster={roster:ROSTER,descriptions:NAMES,init,onCast,melee,tick,behind,front,status};
})();