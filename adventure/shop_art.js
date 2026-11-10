/* Original Hakone shop artwork. Geometry, interactions and save keys are unchanged.
   References: SLYNYRD Pixelblogs 20/21/35 (16px tiles, quiet textures, silhouettes),
   Seven-Eleven Japan product/services pages. No third-party image assets. */
(() => {
  'use strict';
  const A = window.HakoneArt, D = window.HakoneData;
  if (!A || !D) return;
  const base = {ground:A.ground, prop:A.prop, itemIcon:A.itemIcon};
  const floors = new Map(), icons = new Map();
  const r = (c,x,y,w,h,color) => {c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),w,h);};
  const glyphs = {
    A:'010101111101101',B:'110101110101110',C:'011100100100011',D:'110101101101110',
    E:'111100110100111',F:'111100110100100',G:'011100101101011',H:'101101111101101',
    I:'111010010010111',J:'001001001101010',K:'101101110101101',L:'100100100100111',
    M:'101111111101101',N:'101111111111101',O:'010101101101010',P:'110101110100100',
    Q:'010101101111011',R:'110101110101101',S:'011100010001110',T:'111010010010010',
    U:'101101101101111',V:'101101101101010',W:'101101111111101',X:'101101010101101',
    Y:'101101010010010',Z:'111001010100111'
  };
  function label(c,t,x,y,color='#e8e3c8') {
    for (let k=0;k<t.length;k++) {
      const bits=glyphs[t[k]] || '000000000000000';
      for(let i=0;i<15;i++)if(bits[i]==='1')r(c,x+k*4+i%3,y+Math.floor(i/3),1,1,color);
    }
  }
  function steam(c,x,y) {
    r(c,x,y,1,3,'#ebe4ca');r(c,x+1,y-3,1,3,'#ebe4ca');r(c,x+6,y-1,1,3,'#f7f0d9');
  }
  function icon(id) {
    if(icons.has(id))return icons.get(id);
    const cv=document.createElement('canvas');cv.width=28;cv.height=28;
    const c=cv.getContext('2d'), item=D.items[id];
    if(!item)return cv;
    const kind=item[4];
    if(kind==='bottle') {
      const colors={water:'#9fcbd0',iyemon:'#65935b',oolong:'#9d7446',pocari:'#4782b3'};
      r(c,9,2,9,3,'#e5e5cf');r(c,8,5,11,3,'#d1dfd1');r(c,6,8,15,17,'#2d454a');
      r(c,7,8,13,16,colors[id]||colors.water);r(c,9,9,2,13,'#ffffff48');
      r(c,7,13,13,7,id==='iyemon'?'#dbcf91':'#eee9d0');
      r(c,10,15,7,2,id==='pocari'?'#3573a6':id==='iyemon'?'#3f6245':'#7d9fa1');
    } else if(id==='boss') {
      r(c,6,6,16,19,'#333e43');r(c,7,7,14,16,'#9d7847');r(c,7,4,14,3,'#d5d6bc');
      r(c,9,5,8,1,'#738081');r(c,8,10,12,9,'#e3ce91');r(c,11,12,6,6,'#3d4546');r(c,7,23,14,2,'#d5d6bc');
    } else if(id==='onigiri'||id==='salmon') {
      for(let y=0;y<18;y++){const half=Math.floor(y*.63);r(c,13-half,4+y,2*half+1,1,'#f1e8d0');}
      r(c,10,15,8,9,'#2e4a40');r(c,12,9,4,3,id==='salmon'?'#df996e':'#d2bd8b');
      r(c,8,21,2,1,'#d3c7ac');
    } else if(id==='egg') {
      for(let y=0;y<17;y++)r(c,4,5+y,Math.max(1,20-y),1,'#b59367');
      for(let y=0;y<15;y++)r(c,5,5+y,Math.max(1,18-y),1,'#f6ebcf');
      for(let i=0;i<13;i++){r(c,6+i,20-i,3,2,'#e2c772');r(c,6+i,23-i,2,1,'#f4e5ba');}
    } else if(id==='chicken') {
      r(c,7,5,13,16,'#7e4d35');r(c,5,8,17,10,'#bb803f');r(c,7,6,12,13,'#d5a254');
      r(c,9,8,3,2,'#efc976');r(c,15,12,4,3,'#ad6d37');r(c,12,19,4,6,'#edd8b3');
    } else if(id==='bun'||id==='manju'||id==='castella'||id==='melonpan') {
      const color=id==='castella'?'#d7a358':id==='manju'?'#a87a4c':id==='melonpan'?'#d8c87a':'#eadfc0';
      r(c,5,10,18,13,'#735740');r(c,7,6,14,17,color);r(c,4,10,20,10,color);r(c,8,5,12,3,color);
      r(c,8,8,10,2,'#f4e4b6');
      if(id==='melonpan'){for(let i=0;i<4;i++){r(c,7+i*4,9,1,11,'#b69d5b');r(c,6,11+i*3,16,1,'#b69d5b');}}
      else if(id==='bun'){r(c,12,7,2,5,'#c7b797');r(c,10,9,6,1,'#c7b797');}
      else {r(c,12,12,5,3,id==='manju'?'#694939':'#9a682f');}
    } else if(['ramen','udon','oden'].includes(id)) {
      r(c,3,10,22,10,'#d8d2b8');r(c,6,20,16,3,'#d8d2b8');r(c,3,8,22,4,'#f3e5c5');
      r(c,5,10,18,5,'#9c7044');
      for(let i=0;i<3;i++)r(c,7,11+i*2,11-i,1,id==='udon'?'#f2e5c9':'#d8c178');
      r(c,8,10,4,4,'#eee4c0');r(c,9,11,2,2,'#d4b258');r(c,18,11,3,2,'#72906b');
      if(id==='oden')r(c,14,12,5,4,'#cda26a');
      steam(c,10,4);
    } else if(id==='soba') {
      r(c,2,8,23,16,'#654d38');r(c,3,9,21,13,'#b59a69');
      for(let i=0;i<6;i++)r(c,5+i*3,10,1,11,'#735f45');
      for(let i=0;i<5;i++)r(c,7,11+i*2,13-(i%2)*2,1,'#bdb494');
      r(c,20,3,7,6,'#304348');r(c,21,4,5,2,'#895e3d');r(c,12,15,5,2,'#3d5544');
    } else if(id==='curry'||id==='bento'||id==='warmBento') {
      r(c,2,6,24,18,'#35454a');r(c,3,7,22,15,'#e4d1a6');
      r(c,5,9,9,11,'#efe7cf');r(c,15,9,9,11,id==='curry'?'#8d633b':'#b17c4d');
      r(c,17,10,3,3,'#dba65b');r(c,20,15,3,2,'#73865b');
      if(id!=='curry'){r(c,13,8,2,13,'#9b6946');r(c,5,23,18,1,'#bd9c69');}
      if(id==='warmBento')steam(c,10,4);
    } else if(['smoothieCup','smoothie','cafeCup','cafe'].includes(id)) {
      const fruit=id.startsWith('smoothie');
      r(c,5,6,18,3,'#e9e7d0');r(c,6,9,16,12,fruit?'#bcb6ba':'#e7dec5');r(c,8,21,12,4,'#d6cfb9');
      if(fruit){r(c,7,10,14,10,id==='smoothie'?'#d69c9c':'#c4c6b6');
        if(id==='smoothieCup'){r(c,9,11,4,4,'#9b617a');r(c,15,13,4,5,'#dcc084');r(c,11,17,4,3,'#cf8c73');}
        else {r(c,12,1,2,12,'#f2e4c8');r(c,8,11,2,8,'#e6bbaf');}}
      else {r(c,7,13,14,3,'#558165');r(c,7,17,14,2,'#c18052');if(id==='cafe')steam(c,11,4);}
    } else if(id==='umbrella') {
      r(c,13,10,2,14,'#728f93');r(c,11,24,4,2,'#728f93');r(c,9,22,2,3,'#728f93');
      for(let i=0;i<5;i++)r(c,3+i*2,11-i,22-i*4,2,'#b7d2ca');
      r(c,5,12,18,1,'#e7e9d4');r(c,13,6,1,7,'#f2eed8');
    } else if(id==='towel') {
      r(c,3,7,22,18,'#9b9e8d');r(c,4,5,20,18,'#e6dfc9');r(c,7,6,2,15,'#f3edd9');
      r(c,5,17,18,3,'#7a9c96');r(c,5,21,18,1,'#c4c7b1');
    } else if(id==='postcard') {
      r(c,2,5,24,18,'#826c50');r(c,3,6,22,16,'#e6dbb6');r(c,4,7,20,8,'#a4c5bf');
      for(let i=0;i<7;i++)r(c,13-i,9+i,i*2+1,1,'#64857b');r(c,18,7,4,3,'#eee5b9');
      r(c,6,19,14,1,'#a18f6e');
    } else if(id==='yosegi') {
      r(c,3,6,22,19,'#70523b');r(c,4,4,20,17,'#ae8750');
      for(let y=0;y<3;y++)for(let x=0;x<4;x++){r(c,5+x*5,5+y*5,4,4,(x+y)%2?'#e0c18a':'#795b3f');r(c,6+x*5,6+y*5,2,2,'#b49360');}
      r(c,13,21,4,2,'#dac190');
    } else base.itemIcon(c,id,0,0,1);
    icons.set(id,cv);return cv;
  }
  A.itemIcon = function(c,id,x,y,scale=1) {
    if(!D.items[id])return;
    c.save();c.imageSmoothingEnabled=false;
    c.drawImage(icon(id),Math.round(x),Math.round(y),28*scale,28*scale);c.restore();
  };
  function interior(room) {
    if(floors.has(room))return floors.get(room);
    const cv=document.createElement('canvas');cv.width=640;cv.height=480;
    const c=cv.getContext('2d');base.ground(c,room,0);
    const tiled=['seven','station','onsen'].includes(room);
    if(tiled) {
      const tones=room==='seven'?['#dddcd0','#d5d8cb','#c2c7bc']:room==='onsen'?['#8c9b8d','#95a18e','#708a80']:['#a2ada1','#aab4a6','#899b93'];
      r(c,33,64,574,380,tones[2]);
      for(let y=64;y<444;y+=16)for(let x=33;x<607;x+=16)
        r(c,x,y,15,Math.min(15,444-y),tones[(Math.floor(x/16)+y/16)%2]);
      if(room==='seven') {
        r(c,33,64,574,3,'#4a8964');r(c,33,67,574,2,'#c59a57');
        r(c,288,415,64,24,'#6c8978');label(c,'WELCOME',306,424,'#e7e1c4');
      }
    } else if(['inn','dojo'].includes(room)) {
      r(c,33,64,574,380,'#586f55');
      for(let y=64;y<444;y+=48)for(let x=33;x<607;x+=96) {
        const width=Math.min(94,607-x),height=Math.min(46,444-y);
        r(c,x+1,y+1,width,height,(Math.floor(x/96)+Math.floor(y/48))%2?'#b6b584':'#a9ad7c');
        for(let n=5;n<height;n+=4)r(c,x+3,y+n,Math.max(1,width-4),1,'#9fa575');
      }
      if(room==='dojo') {r(c,80,80,480,2,'#d4c79a');r(c,80,400,480,2,'#d4c79a');}
    } else {
      const tones=room==='ramen'?['#956748','#a0704b']:room==='soba'?['#8a7860','#95816a']:['#ac895f','#b99468'];
      r(c,33,64,574,380,'#685947');
      for(let y=64;y<444;y+=16)for(let x=33;x<607;x+=48) {
        r(c,x,y,Math.min(47,607-x),Math.min(15,444-y),tones[(Math.floor(x/48)+y/16)%2]);
        if((Math.floor(x/48)+y/16)%5===0)r(c,x+5,y+6,16,1,'#c7a16c');
      }
    }
    // Restrained wall/contact shadows without adding noninteractive furniture.
    r(c,33,64,574,4,'#243c4025');r(c,33,68,4,376,'#243c401a');
    floors.set(room,cv);return cv;
  }
  A.ground=function(c,room,tick) {
    if(!room||!D.shops[room])return base.ground(c,room,tick);
    c.save();c.imageSmoothingEnabled=false;c.drawImage(interior(room),0,0);c.restore();
  };
  A.prop=function(c,o,tick,state) {
    const {x,y,w,h,type}=o;
    if(!['vending','microwave','blender','coffee','atm','shelf'].includes(type))return base.prop(c,o,tick,state);
    c.save();c.imageSmoothingEnabled=false;r(c,x+3,y+h-3,w,5,'#253b3f44');
    if(type==='shelf') {
      const chilled=state.room==='seven'&&o.id==='shelf0',hot=state.room==='seven'&&o.id==='shelf1';
      r(c,x,y,w,h,'#405457');r(c,x+1,y+1,w-2,h-3,chilled?'#b9d3c7':hot?'#bd9560':'#bcaa88');
      const tag=chilled?'CHILLED':hot?'HOT FOOD':state.room==='seven'?'CUPS':'SHOP';
      r(c,x+2,y+2,w-4,8,chilled?'#527970':hot?'#986645':'#61756a');label(c,tag,x+6,y+3);
      const stock=o.stock||[];
      for(let row=0;row<2;row++) {
        r(c,x+3,y+10+row*12,w-6,10,chilled?'#d8e4d5':'#e3d1aa');
        for(let n=0;n<Math.floor((w-8)/13);n++) {
          const id=stock.length?stock[(n+row)%stock.length]:'water';
          c.drawImage(icon(id),x+5+n*13,y+10+row*12,12,12);
        }
        r(c,x+2,y+21+row*12,w-4,2,chilled?'#809e94':'#937550');
      }
      if(chilled)r(c,x+Math.floor(w/2),y+10,2,h-14,'#77958d');
      r(c,x+3,y+h-3,w-6,3,'#536257');
    } else if(type==='vending') {
      const hot=o.id==='vending2';
      r(c,x,y,w,h,'#2c4347');r(c,x+1,y+1,w-2,h-3,hot?'#bd6250':'#d3d9c9');
      r(c,x+2,y+2,w-4,7,hot?'#914f42':'#537d88');label(c,hot?'HOT':'COLD',x+4,y+3);
      r(c,x+3,y+10,w-9,23,'#e0ead0');
      for(let row=0;row<3;row++)for(let n=0;n<3;n++) {
        const id=['water','iyemon','pocari','oolong','boss'][hot?(n+row+3)%5:(n+row)%5];
        c.drawImage(icon(id),x+3+n*5,y+10+row*7,5,6);
        r(c,x+4+n*5,y+16+row*7,3,1,hot&&row===2?'#cc7954':'#6b9bb0');
      }
      r(c,x+w-5,y+15,3,2,'#4a514a');r(c,x+w-5,y+19,3,4,'#4d8c79');
      r(c,x+4,y+h-9,w-8,5,'#304447');r(c,x+5,y+h-9,w-10,1,'#91aaa0');
    } else {
      const atm=type==='atm',coffee=type==='coffee',blend=type==='blender';
      const tag=atm?'COINS':coffee?'CAFE':blend?'BLEND':'WARM';
      r(c,x,y,w,h,'#31484c');r(c,x+1,y+1,w-2,h-3,atm?'#a9554b':coffee?'#6b7064':'#bfc5b4');
      r(c,x+2,y+2,w-4,7,atm?'#7d4640':'#42595b');label(c,tag,x+4,y+3);
      const faceY=y+11,faceH=Math.max(7,h-16);
      r(c,x+4,faceY,w-11,faceH,'#293f49');
      if(atm) {
        r(c,x+6,faceY+1,w-15,7,'#91b7a7');r(c,x+6,y+h-14,w-15,4,'#ccd0b5');
        for(let i=0;i<3;i++)r(c,x+7+i*4,y+h-13,2,2,'#5c756c');
        r(c,x+7,y+h-7,w-14,2,'#32484b');
      } else if(coffee||blend) {
        r(c,x+8,faceY+2,w-18,2,'#c3d4bc');
        c.drawImage(icon(blend?'smoothieCup':'cafe'),x+7,y+h-19,14,14);
        if(blend){r(c,x+5,faceY+1,1,faceH-1,'#97b5b1');r(c,x+w-9,faceY+1,1,faceH-1,'#97b5b1');}
      } else {
        r(c,x+6,faceY+2,w-16,faceH-4,'#5d756e');r(c,x+8,faceY+3,w-21,2,'#c9b688');
        r(c,x+w-9,faceY+1,1,faceH-2,'#d7ddc5');
      }
      r(c,x+w-5,y+12,2,3,'#8ac1a4');r(c,x+w-5,y+18,2,2,'#d5b977');
    }
    c.restore();
  };
  // Diagnostic metadata is read-only; no access to player state or storage.
  window.HakoneShopArt=Object.freeze({version:'1.0',get cachedFloors(){return floors.size},get cachedIcons(){return icons.size},registerIcon(id,image){if(!D.items[id]||!(image instanceof HTMLCanvasElement)||image.width!==28||image.height!==28)throw new TypeError('Expected a known item and 28x28 canvas');icons.set(id,image);}});
})();
