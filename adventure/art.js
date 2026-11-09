/* Original low-resolution town artwork. 16px material rhythm, whole-pixel placement,
   restrained textures and shadows; no external art downloads. */
window.HakoneArt = (() => {
  'use strict';
  const D=window.HakoneData, cache=new Map();
  const C={ink:'#243c40',grass:'#536f54',grassLight:'#6c855b',road:'#bcad86',edge:'#887d63',water:'#365e70',foam:'#64929a',wood:'#926342',light:'#f7d588'};
  function rect(c,x,y,w,h,color){c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),w,h)}
  function text(c,t,x,y,color='#f8e7bd',size=9){c.font=`bold ${size}px monospace`;c.textAlign='center';c.fillStyle=color;c.fillText(t,Math.round(x),Math.round(y))}
  function hash(x,y){return ((x*19349663 ^ y*73856093)>>>0)%113;}
  function ground(c,inside,tick){
    if(inside){
      rect(c,0,0,640,480,'#263c41');rect(c,32,64,576,384,'#ba9c70');
      for(let y=64;y<448;y+=16)for(let x=32;x<608;x+=32){rect(c,x,y,31,15,(x+y)%64?'#ae8a62':'#b99469');rect(c,x+3,y+4,14,1,'#c8a77b');}
      rect(c,26,28,588,36,'#d5c4a0');rect(c,26,28,588,8,'#67564d');rect(c,26,64,7,384,'#655447');rect(c,607,64,7,384,'#655447');
      rect(c,26,444,588,8,'#635d50');rect(c,296,443,48,9,'#d8c9a0');
      for(let x=72;x<600;x+=96){rect(c,x,37,38,22,'#4b6267');rect(c,x+2,39,34,18,'#94afae');rect(c,x+17,39,2,18,'#d2be96');}
      return;
    }
    rect(c,0,0,D.width,D.height,C.grass);
    for(let y=0;y<D.height;y+=16)for(let x=0;x<D.width;x+=16){const n=hash(x,y);if(n<30){rect(c,x+3,y+10,3,1,C.grassLight);rect(c,x+6,y+7,1,3,C.grassLight);}if(n===45)rect(c,x+9,y+9,2,2,'#c1aa6a');}
    for(const [x,y,w,h] of [[32,216,1216,80],[32,504,1216,80],[236,64,52,644],[924,64,52,644],[104,592,1056,80]]){
      rect(c,x-3,y-3,w+6,h+6,C.edge);rect(c,x,y,w,h,C.road);
      for(let yy=y+5;yy<y+h;yy+=16)for(let xx=x+4;xx<x+w;xx+=32)if(hash(xx,yy)<38)rect(c,xx,yy,5,1,'#a99b7c');
    }
    rect(c,577,0,102,D.height,'#263e49');rect(c,583,0,90,D.height,C.water);
    for(let y=0;y<D.height;y+=16){const x=589+((hash(16,y)+Math.floor(tick/14))%60);rect(c,x,y,12,1,C.foam);rect(c,x+3,y+3,5,1,'#4c7885');}
    for(const y of [224,512]){
      rect(c,573,y-5,110,74,'#3d4140');rect(c,577,y,102,64,'#c39562');
      for(let x=577;x<679;x+=8){rect(c,x,y,1,64,'#8b694d');rect(c,x+2,y+2,1,58,'#d1a677');}
      rect(c,570,y-6,116,5,'#74533f');rect(c,570,y+65,116,5,'#74533f');
      for(let x=570;x<688;x+=28){rect(c,x,y-9,5,12,'#c29a6c');rect(c,x,y+61,5,12,'#c29a6c');}
    }
    rect(c,300,624,204,74,'#8a9a75');rect(c,312,633,180,2,'#d9cc9d');rect(c,312,683,180,2,'#d9cc9d');
    rect(c,312,633,2,52,'#d9cc9d');rect(c,490,633,2,52,'#d9cc9d');rect(c,400,633,2,52,'#d9cc9d');
  }
  function building(c,o){
    const s=D.shops[o.id],x=o.x,y=o.y,w=o.w,h=o.h;
    rect(c,x+7,y+13,w,h,'#405144');rect(c,x,y+32,w,h-32,C.ink);rect(c,x+4,y+37,w-8,h-41,s.color);
    rect(c,x-6,y+8,w+12,35,s.roof);rect(c,x+3,y,w-6,13,s.roof);rect(c,x-6,y+39,w+12,5,'#34474b');
    for(let yy=y+13;yy<y+37;yy+=8)for(let xx=x-3;xx<x+w;xx+=16){rect(c,xx,yy,13,1,'#ffffff17');rect(c,xx+12,yy,1,6,'#00000019');}
    const door=x+w/2-12;rect(c,door,y+h-39,24,39,'#334b50');rect(c,door+2,y+h-36,9,32,'#809e99');rect(c,door+13,y+h-36,9,32,'#809e99');rect(c,door+10,y+h-20,2,3,'#ead39d');
    for(const wx of [x+13,x+w-48]){rect(c,wx,y+65,35,26,'#715a44');rect(c,wx+2,y+67,31,22,'#f2c779');rect(c,wx+17,y+67,2,22,'#9f7c50');rect(c,wx+2,y+78,31,2,'#9f7c50');}
    rect(c,x+9,y+47,w-18,16,'#eee0b8');text(c,s.sign,x+w/2,y+59,'#374a4a',9);
    if(o.id==='seven'){
      for(const [yy,cc] of [[y+44,'#e99a48'],[y+47,'#359466'],[y+50,'#b54b48']])rect(c,x+3,yy,w-6,3,cc);
      rect(c,x+30,y+54,w-60,13,'#f1e9d3');text(c,'7-ELEVEN',x+w/2,y+64,'#326149',10);
    }
    if(['ramen','soba'].includes(o.id)){
      for(let i=0;i<3;i++)rect(c,door-4+i*12,y+h-42,10,16,o.id==='ramen'?'#a34943':'#506c71');
      for(const lx of [x+4,x+w-12]){rect(c,lx,y+62,9,16,'#dc8d54');rect(c,lx+3,y+60,3,2,'#6b4e3a');rect(c,lx+3,y+78,3,2,'#6b4e3a');}
    }
    if(o.id==='onsen')text(c,'♨',x+w/2,y+35,'#f5d495',22);
    rect(c,door-7,y+h,38,5,'#d1c19b');
  }
  function sprite(name,dir,phase){
    const key=name+dir+phase;if(cache.has(key))return cache.get(key);
    const cv=document.createElement('canvas');cv.width=28;cv.height=38;const c=cv.getContext('2d');
    const gojo=name==='Gojo',npc=!['Gojo','Toji','Hakari','Sukuna','Megumi','Yuji','Nobara','Maki','Toge','Panda','Nanami','Yuta','Choso','Todo'].includes(name),skin=name==='Panda'?'#f2ece2':'#dcac83';
    const palette={
      Gojo:['#e7ebdf','#384253','#b4b6c0'],
      Toji:['#242e3a','#3b504e','#7c7482'],
      Hakari:['#e7d2a4','#456f5b','#5a516f'],
      Sukuna:['#d790a2','#85515e','#303345'],
      Megumi:['#1d293d','#2c3a58','#243348'],
      Yuji:['#d78897','#8b4159','#26364d'],
      Nobara:['#b66d43','#293e56','#293647'],
      Maki:['#233844','#42634b','#344c40'],
      Toge:['#d9e1dd','#49657b','#303e52'],
      Panda:['#f1eddd','#ecede5','#29303f'],
      Nanami:['#e3c47f','#b8a680','#526176'],
      Yuta:['#252a39','#e9e5db','#24354c'],
      Choso:['#272a36','#e0d8ce','#5c4955'],
      Todo:['#2d3545','#51465b','#324053']
    };
    const [hair,shirt,pants]=palette[name]||(npc?['#65483b','#ae7255','#556378']:['#242e3a','#3b504e','#7c7482']);
    const step=[0,1,2,0,-1,-2][phase%6],bob=phase%3===1?1:0,back=dir==='up';
    rect(c,7,34,15,2,'#23373666');
    rect(c,8,25,5,8+step,pants);rect(c,16,25,5,8-step,pants);rect(c,7,32+step,7,3,'#26323d');rect(c,16,32-step,7,3,'#26323d');
    rect(c,6,15+bob,18,13,'#26323d');rect(c,8,16+bob,14,10,shirt);rect(c,9,17+bob,3,7,gojo?'#536077':'#557065');
    rect(c,3,17+bob+step,5,10,shirt);rect(c,3,25+bob+step,4,3,skin);rect(c,22,17+bob-step,4,10,shirt);rect(c,23,25+bob-step,3,3,skin);
    rect(c,9,3+bob,12,13,'#26323d');rect(c,10,5+bob,10,10,back?hair:skin);rect(c,8,3+bob,14,5,hair);
    if(gojo){for(const [xx,yy] of [[8,2],[11,0],[15,1],[18,0],[21,3]])rect(c,xx,yy+bob,3,5,hair);if(!back)rect(c,9,8+bob,12,3,'#242e3a');}
    else {rect(c,7,5+bob,4,6,hair);rect(c,18,2+bob,4,5,hair);if(!back){rect(c,11,9+bob,2,2,'#293339');rect(c,17,9+bob,2,2,'#293339');}}
    if(dir==='left')rect(c,7,10+bob,3,3,skin);if(dir==='right')rect(c,20,10+bob,3,3,skin);
    if(name==='Toji'){rect(c,3,14+bob,5,8,'#946b9d');rect(c,1,11+bob,5,5,'#ad8caf');rect(c,2,12+bob,1,1,'#eccbba');}
    if(name==='Hakari'){rect(c,9,0+bob,14,4,'#e7d2a4');rect(c,10,18+bob,6,3,'#8cb397');}
    if(name==='Sukuna'){rect(c,11,1+bob,4,5,'#d790a2');rect(c,17,0+bob,5,6,'#df9cad');if(!back){rect(c,11,13+bob,3,1,'#813b50');rect(c,20,13+bob,3,1,'#813b50');}}
    if(name==='Megumi'){rect(c,7,1+bob,4,9,'#1d293d');rect(c,12,-2+bob,4,9,'#1d293d');rect(c,18,0+bob,4,8,'#1d293d');rect(c,23,2+bob,4,8,'#1d293d');}
    if(name==='Yuji'){
      for(const [xx,yy] of [[8,2],[11,0],[15,1],[19,0],[22,4]])rect(c,xx,yy+bob,4,6,'#d78897');
      rect(c,10,18+bob,12,3,'#ba586d');
    }
    if(name==='Nobara'){
      rect(c,7,3+bob,4,13,'#9a562e');rect(c,20,2+bob,4,14,'#b66d43');
      rect(c,9,1+bob,14,6,'#b66d43');rect(c,7,26+bob,17,4,'#1d2c3e');
    }
    if(name==='Maki'){
      rect(c,7,3+bob,4,15,'#233844');rect(c,19,1+bob,7,7,'#233844');
      if(!back){rect(c,10,9+bob,5,2,'#18323a');rect(c,16,9+bob,5,2,'#18323a');rect(c,15,9+bob,2,2,'#607f7b');}
      rect(c,21,18+bob,2,12,'#a3b7a8');
    }
    if(name==='Toge'){rect(c,8,16+bob,15,5,'#acc7c8');rect(c,8,3+bob,15,3,'#e7e7d8');}
    if(name==='Panda'){rect(c,7,0+bob,5,6,'#252b37');rect(c,19,0+bob,5,6,'#252b37');
      if(!back){rect(c,10,9+bob,5,5,'#28303a');rect(c,17,9+bob,5,5,'#28303a');rect(c,14,14+bob,4,2,'#293039');}
      rect(c,8,16+bob,15,10,'#e9e7dc');rect(c,5,18+bob,4,7,'#293039');rect(c,22,18+bob,3,7,'#293039');}
    if(name==='Nanami'){rect(c,9,2+bob,15,5,'#e3c47f');rect(c,13,18+bob,3,8,'#d6af67');
      if(!back){rect(c,10,9+bob,7,2,'#526d79');rect(c,18,9+bob,7,2,'#526d79');}}
    if(name==='Yuta'){rect(c,9,1+bob,15,7,'#252a39');rect(c,8,7+bob,4,10,'#252a39');
      rect(c,11,17+bob,10,5,'#f5f1e9');rect(c,22,17+bob,2,14,'#7a829a');}
    if(name==='Choso'){rect(c,10,0+bob,13,8,'#272a36');rect(c,7,8+bob,4,11,'#272a36');
      rect(c,20,7+bob,5,11,'#272a36');rect(c,13,17+bob,8,5,'#eee3d2');
      if(!back)rect(c,16,11+bob,3,4,'#a0445e');}
    if(name==='Todo'){rect(c,12,0+bob,10,7,'#2d3545');rect(c,16,-2+bob,7,5,'#2d3545');
      rect(c,7,12+bob,18,3,'#5c465b');rect(c,5,20+bob,5,6,'#9b806d');}
    cache.set(key,cv);return cv;
  }
  function person(c,name,x,y,dir='down',phase=0){c.drawImage(sprite(name,dir,phase),Math.round(x-14),Math.round(y-34));}
  function prop(c,o,tick,state){
    const {x,y,w,h,type}=o;rect(c,x+3,y+h-3,w,5,'#253b3f44');
    if(type==='vending'){
      rect(c,x,y,w,h,'#30444c');rect(c,x+1,y+1,w-2,h-2,o.id==='vending2'?'#be584d':'#c9d4c9');rect(c,x+3,y+4,w-10,24,'#d9e6cb');
      for(let i=0;i<9;i++){const xx=x+4+(i%3)*4,yy=y+7+Math.floor(i/3)*7;rect(c,xx,yy,3,5,['#59927b','#c68851','#628aad'][i%3]);rect(c,xx,yy-1,2,1,'#fbefd6');}
      rect(c,x+3,y+29,w-10,2,o.id==='vending2'?'#efb06c':'#6d99bb');rect(c,x+w-6,y+15,3,4,'#34424b');rect(c,x+4,y+h-9,w-8,5,'#394951');
    }else if(type==='tree'){
      rect(c,x+13,y+h-18,8,19,'#6f5441');rect(c,x+14,y+h-14,2,14,'#a0784d');
      const maple=o.name.includes('Maple'),a=maple?'#b17c50':'#365c50',b=maple?'#cf9b58':'#52765b';
      rect(c,x+7,y,20,30,a);rect(c,x+1,y+8,32,19,a);rect(c,x+4,y+12,31,14,a);rect(c,x+8,y+3,16,5,b);rect(c,x+4,y+10,9,6,b);rect(c,x+18,y+13,11,5,b);
    }else if(type==='bench'||type==='seat'){
      rect(c,x,y+3,w,10,'#6e5544');for(let i=0;i<3;i++)rect(c,x,y+i*4,w,2,'#b38a57');rect(c,x+3,y+12,4,8,'#3f4843');rect(c,x+w-7,y+12,4,8,'#3f4843');
    }else if(type==='lamp'){
      if(!state.lights?.[o.id]){rect(c,x-6,y+1,25,18,'#e6c47d12');rect(c,x-2,y+5,17,10,'#f2d99533');}
      rect(c,x+5,y+14,3,h-14,'#4c4a43');rect(c,x+2,y+5,10,11,state.lights?.[o.id]?'#746e59':'#f2d495');rect(c,x,y+3,14,3,'#3c4342');
    }else if(type==='npc')person(c,o.id,x+w/2,y+h,'down',0);
    else if(type==='cat'){rect(c,x+2,y+4,17,8,'#c6ab81');rect(c,x+15,y+1,8,9,'#ddc59c');rect(c,x+15,y-1,3,4,'#b79a71');rect(c,x+21,y-1,3,4,'#b79a71');rect(c,x+17,y+4,2,1,'#463e37');rect(c,x-3,y+7,6,3,'#c6ab81');}
    else if(type==='shrine'){rect(c,x+10,y+10,w-20,h-8,'#907452');rect(c,x+5,y+6,w-10,7,'#ad5946');rect(c,x,y,w,7,'#5a5149');rect(c,x+25,y+20,14,22,'#4e574a');text(c,'祈',x+w/2,y+17,'#f3dbab',10);}
    else if(type==='rock'){rect(c,x+4,y,w-8,h,'#777e70');rect(c,x,y+5,w,h-6,'#777e70');rect(c,x+5,y+2,w-12,3,'#a3a491');}
    else if(type==='bridge'){}
    else if(type==='postbox'){rect(c,x+7,y+20,8,14,'#704d42');rect(c,x,y,w,23,'#b75243');rect(c,x+3,y+7,w-6,3,'#443a35');text(c,'〒',x+w/2,y+20,'#f0d4ac',11);}
    else if(type==='recycle'){rect(c,x,y+4,w,h-4,'#4e807c');rect(c,x+1,y,w-2,5,'#9eafa0');rect(c,x+4,y+1,w-8,3,'#35494c');text(c,'↻',x+w/2,y+18,'#c7dcc4',12);}
    else if(type==='fountain'){rect(c,x+5,y+7,w-10,h-5,'#8c9892');rect(c,x+8,y+3,12,7,'#c5c9b3');rect(c,x+14,y,3,5,'#7aa1a4');rect(c,x+12,y+8,7,3,'#476c7c');}
    else if(type==='shelf'){rect(c,x,y,w,h,'#735b46');rect(c,x+2,y+3,w-4,h-6,'#d5c39d');for(let i=0;i<Math.floor(w/10);i++){rect(c,x+5+i*10,y+6,6,9,['#749476','#b7c5c4','#cd9c60','#b77159'][i%4]);rect(c,x+5+i*10,y+22,6,7,['#d2b56a','#9f775f','#718f9e'][i%3]);}rect(c,x,y+h-5,w,5,'#8a6749');}
    else if(type==='table'){rect(c,x+4,y+8,w-8,h,'#654f40');rect(c,x,y,w,h-4,'#af895a');rect(c,x+3,y+2,w-6,3,'#caa26c');rect(c,x+w/2-4,y+h/2-3,8,7,'#e5d3aa');}
    else if(['microwave','blender','coffee','atm'].includes(type)){
      rect(c,x,y,w,h,'#536269');rect(c,x+2,y+2,w-4,h-5,type==='atm'?'#c06153':'#c9c6ae');rect(c,x+5,y+6,w-13,h-16,'#354c55');rect(c,x+w-6,y+7,3,3,'#83b6a7');
      if(type==='blender')rect(c,x+9,y+9,7,12,'#c79f88');if(type==='coffee')rect(c,x+8,y+h-17,9,9,'#e9d5ae');
    }else if(type==='bath'){rect(c,x,y,w,h,'#75796d');rect(c,x+5,y+5,w-10,h-10,'#7da9a5');for(let i=0;i<3;i++)rect(c,x+12+i*24,y+14+(Math.floor(tick/18)+i)%3*4,12,1,'#c3d3bc');}
    else if(type==='bed'){rect(c,x,y,w,h,'#776045');rect(c,x+3,y+3,w-6,h-6,'#d7c6a0');rect(c,x+4,y+15,w-8,h-20,'#718988');rect(c,x+7,y+5,w-14,9,'#ebe1c4');}
    else if(type==='exit'){rect(c,x,y,w,h,'#716556');text(c,'EXIT ↓',x+w/2,y+14,'#f3dda1',10);}
    else if(type==='dummy'){rect(c,x+w/2-3,y,6,h,'#c6a06e');rect(c,x,y+8,w,5,'#a77a50');rect(c,x+4,y+h-3,w-8,4,'#665447');}
    else {rect(c,x+5,y+16,4,h-10,'#755b43');rect(c,x,y,w,22,'#675449');rect(c,x+2,y+2,w-4,17,'#e5d3aa');text(c,type==='bus'?'BUS':type==='board'?'!':'i',x+w/2,y+15,'#4d6260',13);}
  }
  function itemIcon(c,id,x,y,scale=1){
    const item=D.items[id];if(!item)return;
    c.save();c.translate(x,y);c.scale(scale,scale);const kind=item[4];
    if(['bottle','can','drink','brew','blend'].includes(kind)){
      rect(c,5,4,12,20,'#30474d');rect(c,6,5,10,18,id==='iyemon'?'#8aaf68':id==='boss'?'#b79264':id==='pocari'?'#638fbc':'#a4c3bb');rect(c,8,1,6,4,'#e0d4b0');rect(c,6,11,10,6,'#eae0bc');
    }else if(id==='onigiri'||id==='salmon'){
      for(let row=0;row<16;row++)rect(c,11-Math.floor(row*.6),5+row,2+Math.floor(row*.6)*2,1,'#f0e5c8');rect(c,9,14,7,9,'#33504a');
    }else if(kind==='gear'){rect(c,3,8,20,12,id==='umbrella'?'#a8c2bf':'#e0d4bc');rect(c,5,20,16,3,'#758d86');}
    else if(kind==='puzzle'){rect(c,3,5,22,20,'#9f744d');for(let i=0;i<4;i++)rect(c,5+i*5,7,3,16,i%2?'#d8b77c':'#765b42');}
    else {rect(c,2,8,24,15,'#665446');rect(c,3,6,22,14,'#d8b47b');rect(c,6,9,16,7,['egg','melonpan','manju'].includes(id)?'#eee0b1':'#b57856');rect(c,7,10,4,3,'#729268');}
    c.restore();
  }
  return {ground,building,prop,person,itemIcon,rect,text};
})();
