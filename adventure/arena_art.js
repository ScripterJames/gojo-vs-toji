/* Original pixel-art fighters: planted key poses, pixel-raster silhouettes and
   per-character clothing, hair and equipment. No third-party sprites copied.
   Technique references: SLYNYRD Pixelblogs 52/53; visual character reference:
   official jujutsukaisen.jp/character/. Fan-game adaptations, not traced assets. */
(() => {
  'use strict';
  const profiles={
    Hakari:['#d9bd79','#977748','#bd876b','#3e6552','#719a71','#493e59','#70617d','#273a35'],
    Sukuna:['#d77f94','#a34d68','#d9a58b','#e5ddce','#fff3dd','#493542','#715166','#32252d'],
    Megumi:['#1e2939','#334258','#dfb195','#283c52','#4d6880','#263247','#42556d','#233040'],
    Yuji:['#d98a9c','#9c526b','#dfad91','#283950','#4a6077','#26364c','#4b5c76','#92364d'],
    Nobara:['#b66e3d','#714632','#e2b396','#293d53','#526b80','#29364c','#47586e','#65483b'],
    Maki:['#214039','#345c4a','#d4a48a','#293b51','#536d82','#293a4e','#4d6279','#23353a'],
    Toge:['#dce5da','#93a4a0','#dfb399','#293e58','#536f87','#2a3850','#4b5f78','#273342'],
    Panda:['#eee9d9','#a3acac','#e6e3d6','#e7e5d7','#faf3df','#26303b','#45535d','#1c2632'],
    Nanami:['#dcb86b','#92733d','#d8a783','#b5a079','#e5cf9e','#9c8e71','#c2b291','#414238'],
    Yuta:['#202a38','#4a5360','#e0b69b','#d6ddd8','#f4f0e2','#23364c','#4a6076','#dadfd4'],
    Choso:['#2e2732','#554049','#d2a58d','#d9d5c6','#f1e6d5','#4c3a4d','#74566c','#302734'],
    Todo:['#282c3b','#4a4051','#bd896e','#bd896e','#dea589','#48394e','#70576f','#282d35'],
    Jogo:['#a75e35','#703e30','#dab888','#252f38','#53604f','#2b3440','#4a5660','#39302b'],
    Mahito:['#a1c1d3','#5a809c','#cbb2a6','#304257','#6e899f','#283c56','#526b85','#2a3547']
  };
  const cache=new Map(),W=112,H=90,SCALE=2,PIVOT=38,GROUND=450;
  const clips={idle:{count:8,step:7,loop:true},walk:{count:8,step:4,loop:true},
    jump:{count:1,step:1},punch:{count:6,step:2},kick:{count:6,step:3},
    special:{count:4,step:5,loop:true},hurt:{count:2,step:4},defeated:{count:1,step:1}};
  function pose(f,tick){
    let key='idle',elapsed=tick;
    if(f.hp<=0){key='defeated';elapsed=0;}
    else if(f.attack>0&&['punch','kick'].includes(f.attackKind)){key=f.attackKind;elapsed=(key==='punch'?12:18)-f.attack;}
    else if(f.hitstun>0||(f.flash>0&&f.invul===0&&!f.newSpecialFlash)){key='hurt';elapsed=Math.max(0,9-f.flash);}
    else if(f.y<GROUND-f.h-2){key='jump';elapsed=0;}
    // Long buffs/pets must not lock the fighter into a casting pose while moving.
    else if(f.newSpecialFlash>0||f.cleave>0||f.blackFlash>0||f.sweep>0||f.speech>0||f.stomp>0||f.ratio>0||f.pierce>0||f.boogie>0||f.transfigure>0){key='special';}
    else if(Math.abs(f.vx)>1){key='walk';}
    const c=clips[key],phase=Math.max(0,Math.floor(elapsed/c.step));
    return {key,index:c.loop?phase%c.count:Math.min(c.count-1,phase)};
  }
  function frame(name,key,i){
    const id=name+':'+key+':'+i;if(cache.has(id))return cache.get(id);
    const p=profiles[name];if(!p)return null;
    const [hair,hairShade,skin,coat,light,pants,pantLight,shoe]=p;
    const ink='#171f2f',skinShade='#9e6c60',skinLight='#edc6a4';
    const cv=document.createElement('canvas');cv.width=W;cv.height=H;
    const c=cv.getContext('2d');c.imageSmoothingEnabled=false;
    const r=(x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)));};
    // Scanline polygons ensure every edge is a crisp pixel, without Canvas AA.
    function poly(points,color){
      c.fillStyle=color;
      const min=Math.max(0,Math.floor(Math.min(...points.map(p=>p[1]))));
      const max=Math.min(H,Math.ceil(Math.max(...points.map(p=>p[1]))));
      for(let y=min;y<max;y++){
        const xs=[];for(let n=0;n<points.length;n++){
          const a=points[n],b=points[(n+1)%points.length],yy=y+.5;
          if((a[1]<=yy&&b[1]>yy)||(b[1]<=yy&&a[1]>yy))xs.push(a[0]+(yy-a[1])*(b[0]-a[0])/(b[1]-a[1]));
        }
        xs.sort((a,b)=>a-b);for(let n=0;n<xs.length;n+=2){const x=Math.ceil(xs[n]-.5),end=Math.ceil(xs[n+1]-.5);if(end>x)c.fillRect(x,y,end-x,1);}
      }
    }
    function segment(a,b,wa,wb,color,shine){
      const dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy)||1,nx=-dy/len,ny=dx/len;
      poly([[a[0]+nx*wa/2,a[1]+ny*wa/2],[b[0]+nx*wb/2,b[1]+ny*wb/2],[b[0]-nx*wb/2,b[1]-ny*wb/2],[a[0]-nx*wa/2,a[1]-ny*wa/2]],color);
      if(shine)segment([a[0]-1,a[1]],[b[0]-1,b[1]],Math.max(1,wa/3),Math.max(1,wb/3),shine);
    }
    function boot(x,y,color=shoe){poly([[x-4,y-3],[x+3,y-3],[x+4,y],[x+8,y+1],[x+8,y+4],[x-5,y+4]],color);r(x-4,y+3,12,1,ink);r(x-2,y-2,5,1,pantLight);}
    function fist(x,y){poly([[x-3,y-4],[x+4,y-4],[x+6,y-1],[x+5,y+4],[x-3,y+4]],skin);r(x+2,y-3,3,2,skinLight);r(x+4,y+1,2,2,skinShade);}
    let bob=key==='idle'?[0,0,-1,-1,0,1,1,0][i]:key==='walk'?[0,-1,-1,0,0,-1,-1,0][i]:0;
    const lean=key==='punch'?[-1,-3,1,5,6,1][i]:key==='kick'?[0,-1,-3,-6,-5,-2][i]:key==='hurt'?-4:0;
    const broad=name==='Panda'?8:name==='Todo'?5:name==='Hakari'?2:0;
    let hip=[37+lean*.4,51+bob],backFoot=[23,77],frontFoot=[50,77];
    let backKnee=[26,64+bob],frontKnee=[47,65+bob];
    if(key==='walk'){
      const swing=[-8,-5,0,6,8,5,0,-6][i],lift=[0,0,0,0,0,3,5,3][i];
      backFoot=[31-swing,77-lift];frontFoot=[40+swing,77-[0,3,5,3,0,0,0,0][i]];
      backKnee=[30-swing*.4,63+bob];frontKnee=[42+swing*.4,64+bob];
    }
    if(key==='kick'){
      frontKnee=[[47,65],[45,58],[55,52],[64,47],[63,48],[48,58]][i];
      frontFoot=[[50,77],[47,68],[62,56],[99,43],[97,44],[61,63]][i];
    }
    if(key==='jump'){hip=[37,49];backKnee=[23,60];backFoot=[31,67];frontKnee=[49,55];frontFoot=[58,67];}
    if(key==='defeated'){
      poly([[14,72],[38,67],[67,72],[72,79],[17,81]],coat);segment([23,74],[8,78],10,8,pants,pantLight);
      r(66,68,12,11,skin);r(66,65,13,6,hair);boot(10,77);r(30,75,18,3,light);
    } else {
      // Back leg, planted foot, then near leg. Knees absorb idle motion.
      segment([hip[0]-5,hip[1]],backKnee,12+broad/2,9,pants,pantLight);
      segment(backKnee,backFoot,9,7,pants,pantLight);boot(...backFoot);
      segment([hip[0]+5,hip[1]],frontKnee,12+broad/2,9,pants,pantLight);
      segment(frontKnee,frontFoot,9,7,pants,pantLight);boot(...frontFoot);
      const torsoX=37+lean,ty=29+bob,headX=37+lean,hy=15+bob;
      const backShoulder=[torsoX-7-broad/2,ty+5],backElbow=[torsoX-14-broad/2,ty+15],backHand=[torsoX-7,ty+12];
      segment(backShoulder,backElbow,10,8,name==='Todo'?skinShade:coat);
      segment(backElbow,backHand,8,6,skinShade,skin);fist(...backHand);
      // Shoulder-to-waist taper; a separate side plane and fabric seam.
      poly([[torsoX-9-broad,ty],[torsoX+8+broad,ty-1],[torsoX+12+broad,ty+6],[hip[0]+9,hip[1]+3],[hip[0]-10,hip[1]+3],[torsoX-12-broad,ty+9]],coat);
      poly([[torsoX-8-broad,ty+2],[torsoX-3,ty+3],[hip[0]-4,hip[1]],[hip[0]-9,hip[1]]],light);
      segment([torsoX+7+broad,ty+8],[hip[0]+6,hip[1]],2,2,ink);
      r(hip[0]-9,hip[1],18,3,ink);
      if(name==='Hakari'){poly([[torsoX-3,ty+1],[torsoX+4,ty+1],[hip[0]+4,hip[1]],[hip[0]-4,hip[1]]],'#272e36');r(torsoX-5,ty+2,2,19,'#c5bb8b');r(torsoX+5,ty+2,2,17,'#a7bd81');}
      if(name==='Sukuna'||name==='Yuta'||name==='Choso'){
        segment([torsoX-6,ty+1],[hip[0]+4,hip[1]-3],2,2,ink);segment([torsoX+7,ty+1],[torsoX-1,ty+10],2,2,light);
        if(name==='Choso')r(torsoX-9,ty-2,20,7,'#58424f');
      }
      if(name==='Yuji'){poly([[torsoX-10,ty],[torsoX-6,ty-4],[torsoX+9,ty-4],[torsoX+12,ty],[torsoX+5,ty+5],[torsoX-6,ty+4]],'#af3e56');r(torsoX-5,ty,12,2,'#e1727e');}
      if(name==='Megumi'||name==='Maki'||name==='Toge'||name==='Nobara'){r(torsoX-1,ty+5,1,16,ink);for(let n=0;n<3;n++)r(torsoX+1,ty+6+n*5,2,2,'#cbb78a');}
      if(name==='Nobara'){poly([[hip[0]-9,hip[1]],[hip[0]+10,hip[1]],[hip[0]+13,hip[1]+9],[hip[0]-13,hip[1]+9]],coat);r(hip[0]-9,hip[1]+2,2,6,light);}
      if(name==='Nanami'){poly([[torsoX-5,ty],[torsoX+5,ty],[torsoX+2,ty+14]],'#648781');r(torsoX-1,ty+3,3,15,'#cdb65a');for(let n=0;n<4;n++)r(torsoX,ty+5+n*3,1,1,'#455b55');}
      if(name==='Todo'){segment([torsoX-7,ty+7],[torsoX+8,ty+8],2,2,skinShade);r(torsoX+1,ty+8,1,12,skinShade);segment([torsoX-8,ty+16],[torsoX+7,ty+16],1,1,skinShade);}
      if(name==='Panda'){poly([[torsoX-17,ty+1],[torsoX+17,ty+1],[torsoX+18,ty+14],[hip[0]+13,hip[1]+4],[hip[0]-13,hip[1]+4]],'#e5e4d8');r(torsoX-17,ty+2,7,14,'#242e3a');r(torsoX+11,ty+3,7,13,'#242e3a');}
      if(name==='Jogo'){poly([[torsoX-13,ty-2],[torsoX+12,ty-2],[torsoX+17,ty+9],[torsoX+5,ty+7],[torsoX-14,ty+4]],'#d6ac51');r(torsoX-5,ty+1,4,3,'#614636');r(torsoX+6,ty+3,4,3,'#614636');}
      if(name==='Mahito'){r(torsoX-10,ty+11,8,11,'#7895a6');for(let n=0;n<4;n++)r(torsoX-3,ty+11+n*3,3,1,'#c7c3b8');}
      // Neck and face in a right-facing three-quarter profile.
      r(headX-3,hy+11,7,6,skinShade);
      poly([[headX-6,hy],[headX+4,hy],[headX+7,hy+4],[headX+7,hy+8],[headX+9,hy+9],[headX+6,hy+11],[headX+4,hy+15],[headX-2,hy+15],[headX-6,hy+10]],skin);
      poly([[headX-5,hy+3],[headX-2,hy+6],[headX-1,hy+14],[headX-4,hy+11]],skinShade);
      r(headX+1,hy+6,5,1,ink);r(headX+4,hy+7,1,2,'#f1e4d0');r(headX+3,hy+12,3,1,skinShade);
      // Silhouette differences, not a palette-swap head.
      if(name==='Panda'){
        poly([[headX-11,hy-2],[headX+9,hy-2],[headX+11,hy+5],[headX+9,hy+15],[headX-7,hy+15],[headX-12,hy+6]],'#eee9d9');
        r(headX-12,hy-5,6,7,ink);r(headX+6,hy-5,6,7,ink);r(headX-8,hy+5,6,6,ink);r(headX+3,hy+5,6,6,ink);
        r(headX-5,hy+6,2,2,'#f1ebd7');r(headX+5,hy+6,2,2,'#f1ebd7');r(headX-1,hy+10,4,2,ink);r(headX-2,hy+13,7,1,ink);
      } else if(name==='Jogo'){
        poly([[headX-8,hy+3],[headX-7,hy-6],[headX+4,hy-8],[headX+8,hy-2],[headX+7,hy+6]],hair);
        r(headX-4,hy-8,7,2,ink);r(headX-3,hy-7,5,1,'#d89b47');r(headX-2,hy+4,9,7,'#efd3a2');r(headX+2,hy+5,3,5,ink);
      } else if(name==='Nobara'){
        poly([[headX-8,hy-3],[headX+5,hy-4],[headX+8,hy+1],[headX+7,hy+3],[headX+1,hy],[headX-4,hy+1],[headX-5,hy+15],[headX-10,hy+17],[headX-11,hy+5]],hair);
        r(headX-9,hy+3,2,12,hairShade);r(headX-6,hy-2,9,1,'#d99c60');
      } else if(name==='Mahito'){
        poly([[headX-8,hy-3],[headX+4,hy-4],[headX+10,hy],[headX+10,hy+18],[headX+6,hy+23],[headX+5,hy+4],[headX+1,hy],[headX-3,hy+8],[headX-5,hy+22],[headX-10,hy+24],[headX-12,hy+5]],hair);
        segment([headX-9,hy+3],[headX-8,hy+21],2,2,hairShade);r(headX+2,hy+10,5,1,'#596d7b');r(headX+3,hy+9,1,3,'#596d7b');
      } else if(name==='Choso'){
        poly([[headX-8,hy],[headX-7,hy-5],[headX+6,hy-5],[headX+8,hy+2],[headX+2,hy],[headX-4,hy+4],[headX-5,hy+13],[headX-8,hy+16]],hair);
        r(headX-13,hy-7,8,7,hair);r(headX+4,hy-9,8,8,hair);segment([headX-1,hy+8],[headX+7,hy+10],2,2,'#794657');
      } else if(name==='Hakari'){
        for(const [x,y,w,h] of [[-8,-2,8,5],[-7,-5,5,5],[-2,-7,5,6],[3,-5,5,5],[7,-2,4,5]])r(headX+x,hy+y,w,h,hair);
        for(const [x,y] of [[-5,-3],[0,-5],[4,-2]])r(headX+x,hy+y,2,2,'#f0d795');r(headX-7,hy+3,3,6,hairShade);
      } else if(name==='Maki'||name==='Todo'){
        poly([[headX-8,hy],[headX-6,hy-5],[headX+6,hy-4],[headX+8,hy+1],[headX+1,hy],[headX-5,hy+4],[headX-6,hy+10],[headX-9,hy+7]],hair);
        if(name==='Maki'){poly([[headX-6,hy-4],[headX-12,hy-8],[headX-15,hy-5],[headX-13,hy+6],[headX-18,hy+12],[headX-10,hy+8]],hairShade);r(headX-3,hy+6,11,3,ink);r(headX-1,hy+7,3,1,'#9fbdb0');}
        else {r(headX-7,hy-10,7,7,hair);r(headX-6,hy-13,5,5,hair);r(headX-5,hy+9,1,5,'#785350');}
      } else if(name==='Nanami'){
        poly([[headX-9,hy],[headX-7,hy-5],[headX+3,hy-6],[headX+9,hy-2],[headX+8,hy+1],[headX-2,hy-1],[headX-5,hy+3],[headX-7,hy+8]],hair);
        segment([headX-4,hy-4],[headX+7,hy-1],1,1,hairShade);r(headX-4,hy+5,12,3,ink);r(headX-3,hy+5,4,2,'#9cae9c');r(headX+3,hy+5,4,2,'#9cae9c');
      } else if(name==='Toge'){
        poly([[headX-9,hy],[headX-6,hy-5],[headX+5,hy-5],[headX+10,hy],[headX+6,hy+5],[headX+3,hy+1],[headX,hy+5],[headX-5,hy+2],[headX-6,hy+9]],hair);
        r(headX-7,hy+11,16,7,'#94b4bd');r(headX+5,hy+12,2,6,'#dce2d2');
      } else if(name==='Megumi'||name==='Yuji'||name==='Sukuna'){
        const tall=name==='Megumi';
        poly([[headX-9,hy+5],[headX-12,hy-3],[headX-5,hy-1],[headX-7,hy-(tall?12:8)],[headX-1,hy-4],[headX+1,hy-(tall?15:10)],[headX+4,hy-5],[headX+10,hy-(tall?10:6)],[headX+8,hy],[headX+14,hy-1],[headX+8,hy+5],[headX+2,hy+1],[headX-3,hy+4],[headX-4,hy+8]],hair);
        r(headX-7,hy+4,3,5,hairShade);
        if(name==='Sukuna'){r(headX+1,hy+1,1,3,ink);r(headX+6,hy+2,1,2,ink);r(headX+2,hy+10,4,1,ink);r(headX,hy+12,2,1,ink);}
      } else {poly([[headX-10,hy+4],[headX-9,hy-3],[headX-1,hy-6],[headX+6,hy-4],[headX+10,hy],[headX+5,hy+5],[headX+1,hy+1],[headX-3,hy+6],[headX-6,hy+11]],hair);r(headX-6,hy-2,6,1,hairShade);}
      // Foreground guard -> anticipation -> extension -> recoil. Never a loose bar.
      let shoulder=[torsoX+8+broad/2,ty+5],elbow=[torsoX+13+broad/2,ty+14],hand=[torsoX+14+broad/2,ty+2];
      if(key==='punch'){
        elbow=[[45,42],[39,43],[58,38],[70,34],[71,34],[52,40]][i];
        hand=[[49,31],[36,33],[76,33],[91,32],[93,32],[65,33]][i];
      } else if(key==='special'){
        hand=[torsoX+22+(i%2),ty-1];elbow=[torsoX+18,ty+10];
        if(['Megumi','Choso','Todo'].includes(name)){hand=[torsoX+13,ty+4];elbow=[torsoX+17,ty+11];}
        if(name==='Toge')hand=[headX+11,hy+10];
      } else if(key==='hurt'){hand=[torsoX+6,ty+6];elbow=[torsoX+17,ty+15];}
      const sleeve=name==='Todo'?skin:name==='Panda'?'#26313c':coat;
      segment(shoulder,elbow,10+broad/2,8,sleeve,name==='Todo'?skinLight:light);
      segment(elbow,hand,8,6,name==='Panda'?'#26313c':skin,name==='Panda'?'#4c5b66':skinLight);
      if(name==='Panda'){r(hand[0]-4,hand[1]-4,9,9,'#26313c');r(hand[0]-2,hand[1]-3,5,2,'#59696e');}else fist(...hand);
      // Equipment follows the hand and never extends below the planted soles.
      if(name==='Nobara'){const x=backHand[0]-7,y=backHand[1];segment([x,y+4],[x,y-13],2,2,'#9c754d');r(x-5,y-15,11,5,'#aebac2');r(x-4,y-15,9,1,'#e1e6d6');}
      if(name==='Maki'){
        const a=key==='special'?[hand[0]-12,hand[1]+15]:[torsoX+21,10],b=key==='special'?[hand[0]+30,hand[1]-9]:[torsoX+20,76];
        segment(a,b,2,2,'#a9aa7b');segment(a,[a[0]+1,a[1]+11],3,3,'#d7dfcd');
      }
      if(name==='Yuta'||name==='Nanami'){
        const x=backHand[0]-9,y=backHand[1];segment([x,y+7],[x+5,y-21],3,3,name==='Yuta'?'#c2d9d6':'#b4bc9d');r(x-4,y+4,10,3,ink);
      }
    }
    // An actual opaque-pixel foot anchor removes transparent padding per frame.
    const source=c.getImageData(0,0,W,H),s=source.data,out=c.createImageData(W,H),d=out.data;
    for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){
      const k=(y*W+x)*4;if(s[k+3])continue;
      if([k-4,k+4,k-W*4,k+W*4].some(n=>s[n+3]>0)){d[k]=23;d[k+1]=31;d[k+2]=47;d[k+3]=255;}
    }
    for(let n=0;n<s.length;n+=4)if(s[n+3]){d[n]=s[n];d[n+1]=s[n+1];d[n+2]=s[n+2];d[n+3]=s[n+3];}
    c.putImageData(out,0,0);
    let bottom=0;for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(d[(y*W+x)*4+3])bottom=y+1;
    const value={image:cv,baseline:bottom,width:W,height:H};cache.set(id,value);return value;
  }
  function draw(ctx,f,tick){
    if(!profiles[f.name])return false;
    const ps=pose(f,tick),entry=frame(f.name,ps.key,ps.index),foot=Math.round(f.y+f.h),center=Math.round(f.x+f.w/2);
    ctx.save();ctx.imageSmoothingEnabled=false;
    const air=Math.max(0,GROUND-foot);ctx.globalAlpha=Math.max(.11,.30-air/350);ctx.fillStyle='#080c1b';
    ctx.beginPath();ctx.ellipse(center,GROUND+3,29-Math.min(10,air/12),4,0,0,Math.PI*2);ctx.fill();
    if(air<2){ctx.globalAlpha=.38;ctx.fillRect(center-24,GROUND,52,2);}
    ctx.globalAlpha=f.invul>0?.85:1;ctx.translate(center,0);ctx.scale(f.face<0?-1:1,1);
    // Airborne tuck is drawn higher, while all grounded poses meet the same floor.
    const anchor=ps.key==='jump'?82:entry.baseline;
    ctx.drawImage(entry.image,-PIVOT*SCALE,foot-anchor*SCALE,W*SCALE,H*SCALE);ctx.restore();return true;
  }
  window.HakoneArtFighters={draw,pose,ready:n=>!!profiles[n],
    frame:(name,key,index=0)=>frame(name,key,index),clips:Object.freeze(clips),
    version:'grounded-2',get cacheSize(){return cache.size}};
})();
