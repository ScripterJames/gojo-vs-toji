/* Warm food-market atmosphere inspired by the user's Spirited Away reference.
   Original pixel artwork; ONLY ramen/soba rooms and their existing furnishings.
   7-Eleven, shop stock, prices, collision and interaction handlers are untouched. */
(() => {
  'use strict';
  const A=window.HakoneArt,D=window.HakoneData;if(!A||!D)return;
  const oldGround=A.ground,oldProp=A.prop,oldIcon=A.itemIcon,R=A.rect;
  const rooms=new Set(['ramen','soba']),floors=new Map();
  function lantern(c,x,y,red){
    R(c,x+8,y-8,1,9,'#30282d');R(c,x+2,y,14,24,'#482c30');
    R(c,x,y+4,18,15,red?'#973b39':'#b47c47');
    R(c,x+3,y+2,12,20,red?'#d45d42':'#e4b96f');
    R(c,x+6,y+3,6,18,red?'#ef955a':'#f7d996');
    for(let yy=4;yy<22;yy+=5)R(c,x+2,y+yy,14,1,red?'#b34739':'#bf975d');
    R(c,x+3,y+24,12,2,'#57372f');
    c.save();c.globalAlpha=.07;R(c,x-12,y+26,42,20,'#ffe2a2');R(c,x-7,y+46,32,15,'#ffe2a2');c.restore();
  }
  function roomArt(room){
    if(floors.has(room))return floors.get(room);
    const cv=document.createElement('canvas');cv.width=640;cv.height=480;const c=cv.getContext('2d');
    const soba=room==='soba';
    R(c,33,64,574,380,soba?'#816c52':'#785344');
    for(let y=64;y<444;y+=16)for(let x=33;x<607;x+=48){
      const shade=((x*3+y*5)%13)<5;
      R(c,x+1,y+1,46,14,soba?(shade?'#87735a':'#907a5a'):(shade?'#855d49':'#8c604a'));
      R(c,x+8,y+10,19,1,soba?'#947f60':'#996d53');
    }
    R(c,26,28,588,37,'#4a3030');R(c,31,31,578,26,soba?'#7a5c44':'#853e38');
    R(c,27,58,586,6,'#322b2b');R(c,29,64,6,380,'#493632');R(c,605,64,6,380,'#493632');
    for(const x of [50,168,438,554]){
      R(c,x,34,36,23,'#463738');R(c,x+2,36,32,19,'#d1b887');
      for(let xx=7;xx<33;xx+=9)R(c,x+xx,36,1,19,'#7e674b');R(c,x+2,45,32,1,'#7e674b');
    }
    for(const x of [95,225,385,515])lantern(c,x,37,!soba);
    R(c,31,442,578,5,'#493632');R(c,296,442,48,4,'#cbb18b');
    floors.set(room,cv);return cv;
  }
  function bowl(c,x,y,soba=false){
    R(c,x-12,y+2,24,6,'#3c2c2c');R(c,x-10,y+7,20,5,'#cfc3a0');R(c,x-7,y+11,14,2,'#67514c');
    R(c,x-11,y,22,7,soba?'#a68d60':'#d29455');R(c,x-8,y+1,16,4,'#ead6a0');
    for(let i=0;i<3;i++)R(c,x-6+i*5,y+2,3,1,soba?'#8e7754':'#c39761');
    R(c,x-8,y+1,3,3,'#55785c');R(c,x+5,y+1,4,3,soba?'#8d8054':'#faf0c8');
    R(c,x+3,y+2,2,1,soba?'#6b7954':'#e9bd60');R(c,x+10,y-4,1,13,'#e6c190');R(c,x+13,y-4,1,13,'#b88c5b');
  }
  A.ground=(c,room,tick)=>{oldGround(c,room,tick);if(rooms.has(room))c.drawImage(roomArt(room),0,0);};
  A.prop=(c,o,tick,state)=>{
    oldProp(c,o,tick,state);const room=o.scene||state?.room;if(!rooms.has(room))return;
    if(o.type==='table'||o.type==='counter'){
      const {x,y,w,h}=o;
      R(c,x+2,y+2,w-4,4,'#b57b50');R(c,x+3,y+6,w-6,1,'#5e3f35');
      const soup=room==='ramen';const count=o.type==='table'?2:Math.max(1,Math.floor(w/60));
      for(let i=0;i<count;i++){
        const bx=x+(i+1)*w/(count+1),by=y+Math.min(h-18,12);bowl(c,bx,by,!soup);
        if(soup)for(let k=0;k<2;k++){const p=(tick/100+k*.5+i*.2)%1;c.save();c.globalAlpha=(1-p)*.35;R(c,bx-5+k*8+Math.sin(p*4)*2,by-3-p*13,5,2,'#f1dfb7');c.restore();}
      }
      R(c,x+w-13,y+7,5,9,'#533e37');R(c,x+w-14,y+7,7,2,'#d2a36c');
    }
    if(o.type==='bench'||o.type==='stool'||o.type==='cushion'){
      R(c,o.x+3,o.y+3,o.w-6,4,room==='ramen'?'#ac5e46':'#747a57');
    }
  };
  // Use the shared icon cache so shelves and bag cards show identical artwork.
  for(const id of ['ramen','soba','udon']){
    const cv=document.createElement('canvas');cv.width=cv.height=28;const c=cv.getContext('2d');
    bowl(c,15,11,id==='soba');if(id==='udon'){for(let i=0;i<3;i++)R(c,9+i*4,12,3,3,'#fff1ce');R(c,5,18,20,2,'#668b98');}
    window.HakoneShopArt.registerIcon(id,cv);
  }
  window.HakoneFoodArt={version:1,rooms:[...rooms],affectsRoom:room=>rooms.has(room),cacheSize:()=>floors.size};
  const ref=['Studio Ghibli: Spirited Away official stills — atmosphere reference, not copied assets','https://www.ghibli.jp/works/chihiro/'];
  if(!D.sources.some(s=>s[1]===ref[1]))D.sources.push(ref);
})();
