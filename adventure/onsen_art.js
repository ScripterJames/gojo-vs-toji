/* Visible onsen activities. The pool stays solid for walking; only its paid
   activity seats the traveler in the water. No inventory/coins changed here. */
(() => {
  'use strict';
  const A=window.HakoneArt;
  if(!A)return;
  const prior=A.prop,R=A.rect;
  A.prop=(ctx,o,tick,state)=>{
    if(o.type!=='bath'){prior(ctx,o,tick,state);return;}
    const {x,y,w,h}=o;
    R(ctx,x+4,y+h-1,w,6,'#29434355');
    R(ctx,x,y,w,h,'#3a5757');R(ctx,x+3,y+3,w-6,h-6,'#88998a');
    for(let xx=x+4;xx<x+w-8;xx+=22){R(ctx,xx,y+3,19,5,'#adb5a0');R(ctx,xx,y+h-8,19,5,'#abb09a');}
    R(ctx,x+9,y+10,w-18,h-20,'#60958e');R(ctx,x+10,y+11,w-20,5,'#487b79');
    // Restrained ripples, without changing the pool's interaction outline.
    for(let i=0;i<15;i++){
      const xx=x+16+((i*43+Math.floor(tick/16)*3)%(w-52));
      const yy=y+22+(i*19)%(h-42);
      R(ctx,xx,yy,13,1,i%3?'#8bb8a5':'#b9d4ba');
      R(ctx,xx+4,yy+3,5,1,'#78a99b');
    }
    // Stone entry steps make the walkable shore / bathing area obvious.
    R(ctx,x+w/2-18,y+h-11,36,5,'#b6c2aa');R(ctx,x+w/2-13,y+h-6,26,5,'#c8c7ab');
    for(let i=0;i<5;i++){
      const life=(tick/60*.35+i*.23)%1,sx=x+36+i*(w-72)/4,sy=y+28-life*24;
      ctx.save();ctx.globalAlpha=(1-life)*.25;
      R(ctx,sx+Math.sin(life*5+i)*4,sy,10,2,'#e8efce');R(ctx,sx+3,sy-4,7,2,'#e8efce');ctx.restore();
    }
  };
  function drawActivity(ctx,s,a,tick){
    if(!a||s.room!=='onsen')return;
    if(a.kind==='wash'){
      const x=Math.round(s.x),y=Math.round(s.y);
      // The actual traveler is rendered normally, with visible rinse droplets.
      for(let i=0;i<7;i++){
        const phase=(tick*.07+i*.19)%1;
        R(ctx,x-10+i*3,y-30+phase*27,2,3,i%2?'#b5dacf':'#dbead4');
      }
      R(ctx,x-16,y+5,32,3,'#254544');R(ctx,x-15,y+6,30*Math.min(1,a.elapsed/2),1,'#b5d9b5');
      return;
    }
    if(a.kind!=='soak')return;
    const T=window.HakoneTravelers;
    const img=T?.frame(s.fighter,'down',0),m=T?.metrics();
    const x=Math.round(s.x),y=Math.round(s.y),waterline=y-16;
    ctx.save();ctx.imageSmoothingEnabled=false;
    // Only the head and shoulders show above opaque water, with no nudity.
    ctx.beginPath();ctx.rect(x-20,y-45,40,waterline-(y-45));ctx.clip();
    if(img&&m)ctx.drawImage(img,x-m.width/2,y-m.soleY);
    else A.person(ctx,s.fighter,x,y,'down',0);
    ctx.restore();
    R(ctx,x-17,waterline,34,2,'#b3d9c2');R(ctx,x-13,waterline+3,26,2,'#76aaa0');
    R(ctx,x-9,waterline+5,18,1,'#9dcbb4');
    // Folded towel sits on the stone ledge, not in the bath.
    const pool=window.HakoneLife?.objects().find(o=>o.id==='bath');
    if(pool){R(ctx,pool.x+21,pool.y+pool.h-8,18,6,'#e6e0bf');R(ctx,pool.x+23,pool.y+pool.h-7,14,1,'#fff3d5');}
    for(let i=0;i<3;i++){
      const p=(tick/140+i/3)%1;
      ctx.save();ctx.globalAlpha=(1-p)*.45;R(ctx,x-22+i*18+Math.sin(p*5)*3,y-28-p*24,8,2,'#e1ead4');ctx.restore();
    }
  }
  window.HakoneOnsenArt={drawActivity};
  const src=['Hakone tourism association: wash, soak and keep towels out of the water','https://hakone-japan.com/things-to-do/onsen/all/how-to-enjoy-onsen/'];
  if(window.HakoneData&&!HakoneData.sources.some(s=>s[1]===src[1]))HakoneData.sources.push(src);
})();
