/* Original low-res 64×50 raster fighters, not borrowed sprites.
   All animation frames are cached, with consistent pivot and whole-pixel positioning.
   Palette and silhouette first: Hakari = cropped pale hair & green jacket;
   Sukuna = swept pink hair & facial marks; Megumi = tall dark spikes & navy uniform. */
(() => {
  'use strict';
  const catalog={
    Hakari:{hair:'#ead7a0',hairShadow:'#bba36d',skin:'#c69073',shirt:'#456b5d',light:'#689879',pants:'#554c6b',shoe:'#2a2f3c',accent:'#f0c95d',ink:'#1d2730'},
    Sukuna:{hair:'#e4a0aa',hairShadow:'#b35d79',skin:'#d9a089',shirt:'#71465f',light:'#a46a77',pants:'#2c303f',shoe:'#171e28',accent:'#ef597f',ink:'#29212e'},
    Megumi:{hair:'#1e2b40',hairShadow:'#35465c',skin:'#d9ab90',shirt:'#26344d',light:'#45617c',pants:'#252e44',shoe:'#1c2132',accent:'#aebeff',ink:'#182034'}
  };
  const cache=new Map(),SIZE=64,HEIGHT=50,SCALE=3,ORIGIN_X=18,GROUND=450;
  const clips={
    idle: {count:4,step:10},walk:{count:6,step:5},jump:{count:1,step:1},
    punch:{count:6,step:2},kick:{count:6,step:3},special:{count:4,step:5},
    hurt:{count:2,step:4},defeated:{count:1,step:1}
  };
  function pose(f,tick){
    let key='idle',elapsed=tick;
    if(f.hp<=0){key='defeated';elapsed=0;}
    else if(f.attack>0&&['punch','kick'].includes(f.attackKind)){
      key=f.attackKind;elapsed=(key==='punch'?12:18)-f.attack;
    }else if(f.jackpot>0||f.cleave>0||f.newSpecialFlash>0){key='special';elapsed=tick;}
    else if(f.flash>0&&f.invul===0){key='hurt';elapsed=Math.max(0,8-f.flash);}
    else if(f.y<GROUND-f.h-2){key='jump';elapsed=0;}
    else if(Math.abs(f.vx)>1){key='walk';elapsed=tick;}
    const clip=clips[key];
    return {key,index:Math.min(clip.count-1,Math.max(0,Math.floor(elapsed/clip.step)))%clip.count};
  }
  function sprite(name,key,i){
    const cacheKey=name+'-'+key+'-'+i;
    if(cache.has(cacheKey))return cache.get(cacheKey);
    const c=document.createElement('canvas');c.width=SIZE;c.height=HEIGHT;
    const ctx=c.getContext('2d');const p=catalog[name];
    if(!p)return null;
    ctx.imageSmoothingEnabled=false;
    const block=(x,y,w,h,color)=>{ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
    const limb=(x,y,x2,y2,width,color)=>{
      const dx=x2-x,dy=y2-y,len=Math.max(Math.abs(dx),Math.abs(dy),1);
      for(let j=0;j<=len;j++){const t=j/len;block(x+dx*t-width/2,y+dy*t-width/2,width,width,color);}
    };
    const walking=key==='walk',punch=key==='punch',kick=key==='kick';
    const phase=i,step=walking?[0,2,3,0,-2,-3][i]:0;
    const bob=walking&&[1,2,4,5].includes(i)?-1:0;
    const striking=punch?[0,-3,3,14,28,6][i]:0;
    const kicking=kick?[0,0,4,9,15,4][i]:0;
    const jumping=key==='jump';
    const defeated=key==='defeated';
    if(defeated){
      block(5,35,29,10,p.ink);block(7,36,26,7,p.shirt);block(18,31,12,8,p.skin);
      block(26,30,8,4,p.hair);cache.set(cacheKey,c);return c;
    }
    // Legs are planted, with a two-pixel dark contour and staggered foot silhouettes.
    const lfX=10-step,rtX=23+step+(kicking?8+kicking:0),lfY=39+step*.35,rtY=39-step*.35-(kicking?9+kicking:0);
    limb(13,30+bob,lfX,lfY,9,p.ink);limb(14,30+bob,lfX+1,lfY,6,p.pants);
    limb(23,29+bob,rtX,rtY,9,p.ink);limb(23,30+bob,rtX,rtY,6,p.pants);
    block(lfX-5,lfY+1,12,5,p.shoe);block(rtX-4,rtY+1,12,5,p.shoe);
    // Rear arm before torso: readable overlapping silhouettes.
    limb(11,19+bob,7,30+bob,8,p.ink);limb(10,20+bob,8,29+bob,5,p.shirt);
    block(7,27+bob,6,5,p.skin);
    // Torso: one quiet light plane, a single dark edge instead of noisy dithering.
    block(8,18+bob,21,17,p.ink);block(10,20+bob,17,13,p.shirt);
    block(10,22+bob,3,11,p.light);block(23,23+bob,2,10,p.light);
    block(11,32+bob,15,2,p.ink);
    if(name==='Hakari'){block(10,20+bob,17,3,p.light);block(16,22+bob,2,11,'#d0d0a0');}
    if(name==='Sukuna'){block(10,21+bob,15,2,'#4f3548');block(22,29+bob,4,3,p.accent);}
    if(name==='Megumi'){block(16,18+bob,3,14,'#18273e');block(16,22+bob,2,3,'#b6c5e0');}
    // Head and hair: no smooth vector curves or arbitrary subpixels.
    block(13,8+bob,14,13,p.ink);block(14,9+bob,12,12,p.skin);
    block(13,7+bob,14,6,p.hair);block(12,10+bob,3,7,p.hairShadow);
    if(name==='Megumi'){
      for(const [xx,yy,h] of [[10,5,7],[13,2,10],[17,0,10],[21,3,8],[25,1,10],[29,7,7]])block(xx,yy+bob,4,h,p.hair);
    }else if(name==='Sukuna'){
      for(const [xx,yy] of [[12,6],[16,3],[21,4],[25,2],[28,7]])block(xx,yy+bob,4,7,p.hair);
      block(17,13+bob,2,3,p.ink);block(23,13+bob,2,3,p.ink);
      block(15,18+bob,3,1,p.accent);block(25,17+bob,2,2,p.accent);
    }else{
      block(11,6+bob,16,5,p.hair);block(24,8+bob,5,5,p.hairShadow);
      block(12,4+bob,9,5,p.hair);block(22,5+bob,6,4,p.hair);
    }
    block(17,15+bob,2,2,p.ink);block(23,15+bob,2,2,p.ink);
    block(18,16+bob,2,1,'#f3dfc2');block(24,16+bob,2,1,'#f3dfc2');
    // Foreground striking limb with a recognizable retract -> extend -> recover sequence.
    const elbowX=punch?22+striking*.35:29+(key==='special'?4:0);
    const fistX=punch?24+striking:30+(key==='special'?8:0);
    const fistY=punch?23-striking*.15:27;
    limb(27,22+bob,elbowX,26+bob,9,p.ink);
    limb(27,22+bob,elbowX,26+bob,6,p.shirt);
    limb(elbowX,26+bob,fistX,fistY+bob,7,p.ink);
    limb(elbowX,26+bob,fistX,fistY+bob,5,p.skin);
    block(fistX-2,fistY-3+bob,7,6,p.ink);
    block(fistX-1,fistY-2+bob,5,4,p.skin);
    if(key==='special'){
      block(29,13+bob,4,3,p.accent);block(32,10+bob,3,3,'#e8f2ff');
    }
    if(key==='hurt')block(12,21,4,8,'#e6d8d5');
    cache.set(cacheKey,c);return c;
  }
  function draw(ctx,f,tick){
    if(!catalog[f.name])return false;
    const ps=pose(f,tick),img=sprite(f.name,ps.key,ps.index);
    const center=Math.round(f.x+f.w/2),foot=Math.round(f.y+f.h);
    ctx.save();ctx.imageSmoothingEnabled=false;
    const air=Math.max(0,GROUND-foot);
    ctx.globalAlpha=Math.max(.1,.3-air/300);
    ctx.fillStyle='#080a1c';ctx.beginPath();ctx.ellipse(center,455,33-Math.min(12,air/8),5,0,0,Math.PI*2);ctx.fill();
    ctx.globalAlpha=1;ctx.translate(center,0);ctx.scale(f.face<0?-1:1,1);
    ctx.drawImage(img,-ORIGIN_X*SCALE,foot-HEIGHT*SCALE,SIZE*SCALE,HEIGHT*SCALE);
    ctx.restore();
    return true;
  }
  window.HakoneArtFighters={draw,pose,ready:n=>!!catalog[n]};
})();