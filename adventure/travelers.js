/* Hakone Life: original four-direction, six-phase traveler sprites and chooser.
   Read-only rendering over the existing town state; no new save keys/currency.
   Technique references: SLYNYRD Pixelblog 55; Saint11 'Consistency'. */
(() => {
  'use strict';
  const A=window.HakoneArt,life=window.HakoneLife;
  if(!A||!life)return;
  const W=32,H=42,SOLE=38,INK='#202e3b',BOOT='#263441';
  const roster=['Gojo','Toji','Hakari','Sukuna','Megumi','Yuji','Nobara','Maki','Toge','Panda','Nanami','Yuta','Choso','Todo','Jogo','Mahito'];
  // Hair, shaded hair, shirt, lit cloth, trousers, skin, signature accent.
  const P={
    Gojo:['#edf3eb','#b4c9d6','#293447','#4d6075','#bdc0cd','#e6bca0','#86cbef'],
    Toji:['#25313c','#40505a','#34493f','#557160','#a29baf','#d6a587','#a780b9'],
    Hakari:['#e4cd92','#ad905d','#416958','#78967a','#5d536d','#c79576','#efca75'],
    Sukuna:['#dc91a1','#a95878','#80506a','#a57083','#323b51','#dfaa91','#ef6582'],
    Megumi:['#1b2b3d','#405671','#2b3e59','#4c637c','#2a374f','#d9ae91','#a4bada'],
    Yuji:['#dd8c95','#a9526a','#7b3c52','#b85668','#2d3c53','#dda98e','#eb8990'],
    Nobara:['#b87448','#7c4d32','#2c405b','#4d657d','#34435a','#e6b69a','#d9b782'],
    Maki:['#263f43','#52716c','#3b5f50','#6c8b75','#354c43','#dab194','#b7cdb5'],
    Toge:['#e0e4d7','#9ea99e','#45617b','#7d99aa','#30425b','#dbb295','#c6ded9'],
    Panda:['#eeeade','#a4ada8','#e8e5d7','#fbf5e4','#2b3442','#eee7d8','#a7bac5'],
    Nanami:['#dec07b','#9b7b4c','#b4a078','#e2cda3','#4d6074','#dcaf8f','#e5c267'],
    Yuta:['#25303c','#4a5365','#e2e5da','#f8f4e6','#2b3b53','#e2b69a','#b7b1d9'],
    Choso:['#2f2d3b','#584b58','#e3dcca','#f6ebd5','#5a4c65','#d6aa97','#a7586c'],
    Todo:['#2c3545','#4c5260','#b58671','#ddb095','#4b4960','#c99478','#c09cde'],
    Jogo:['#b66945','#844e42','#79534c','#ac7a55','#4a3a48','#d5b18b','#f2b45e'],
    Mahito:['#aac6d5','#6c8ca7','#4c6986','#839db0','#485577','#d2b7ac','#b7cce8']
  };
  const cache=new Map(),basePerson=A.person;
  function frame(name,dir='down',phase=0){
    if(!P[name])return null;
    if(!['up','down','left','right'].includes(dir))dir='down';
    phase=((Math.floor(phase)%6)+6)%6;
    const key=`${name}:${dir}:${phase}`;
    if(cache.has(key))return cache.get(key);
    const cv=document.createElement('canvas');cv.width=W;cv.height=H;
    const c=cv.getContext('2d');c.imageSmoothingEnabled=false;
    if(dir==='left'){
      c.translate(W,0);c.scale(-1,1);c.drawImage(frame(name,'right',phase),0,0);
      cache.set(key,cv);return cv;
    }
    const [hair,hairShade,shirt,cloth,pants,skin,accent]=P[name];
    const side=dir==='right',back=dir==='up',wide=name==='Panda'||name==='Todo';
    const bob=[0,1,0,0,1,0][phase],swing=[0,2,1,0,-2,-1][phase];
    const liftA=phase===1?2:phase===2?1:0,liftB=phase===4?2:phase===5?1:0;
    const r=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),w,h);};
    function limb(x,y,xx,yy,col,width=4){const n=Math.max(Math.abs(xx-x),Math.abs(yy-y),1);for(let i=0;i<=n;i++)r(x+(xx-x)*i/n,y+(yy-y)*i/n,width,width,col);}
    // One supporting sole always meets y=38. Swinging feet lift, never the pivot.
    if(side){
      const far=12-swing,near=16+swing;
      limb(14,27,far,32-liftA,INK,5);limb(15,28,far+1,33-liftA,pants,3);
      r(far-1,35-liftA,9,3,BOOT);r(far+4,35-liftA,4,1,'#64717b');
      limb(17,27,near,32-liftB,INK,5);limb(18,28,near+1,33-liftB,pants,3);
      r(near-1,35-liftB,9,3,BOOT);r(near+4,35-liftB,4,1,'#64717b');
      // Far arm, profile torso, near arm: not a front sprite with a moved nose.
      limb(15,19+bob,17-swing,26+bob,cloth,4);r(17-swing,28+bob,4,3,skin);
      r(10,17+bob,wide?16:13,13,INK);r(12,18+bob,wide?12:10,11,shirt);
      r(12,19+bob,3,9,cloth);r(12,28+bob,11,2,INK);
      limb(13,20+bob,12+swing,26+bob,INK,6);limb(14,20+bob,13+swing,27+bob,shirt,4);
      r(13+swing,29+bob,4,3,skin);
      r(10,5+bob,14,15,INK);r(14,7+bob,11,11,skin);r(24,11+bob,3,4,skin);
      r(9,4+bob,14,8,hair);r(9,9+bob,6,10,hairShade);r(12,5+bob,9,2,hair);
      r(21,11+bob,2,2,INK);r(23,16+bob,2,1,hairShade);
    }else{
      const left=wide?8:10,right=wide?19:18;
      r(left,27,5,9-liftA,INK);r(left+1,28,3,7-liftA,pants);
      r(right,27,5,9-liftB,INK);r(right+1,28,3,7-liftB,pants);
      r(left-1,35-liftA,7,3,BOOT);r(right-1,35-liftB,7,3,BOOT);
      r(left,35-liftA,4,1,'#64717b');r(right,35-liftB,4,1,'#64717b');
      r(wide?5:7,18+bob,wide?23:19,13,INK);r(wide?6:8,19+bob,wide?21:17,11,shirt);
      r(wide?6:8,20+bob,3,9,cloth);r(wide?25:23,20+bob,2,9,hairShade);
      limb(7,20+bob,6,26+bob+swing,INK,5);limb(8,20+bob,7,26+bob+swing,shirt,3);r(7,29+bob+swing,3,3,skin);
      limb(24,20+bob,24,26+bob-swing,INK,5);limb(24,20+bob,24,26+bob-swing,shirt,3);r(24,29+bob-swing,3,3,skin);
      r(9,4+bob,16,15,INK);r(10,6+bob,14,12,back?hairShade:skin);
      r(9,4+bob,16,7,hair);r(10,5+bob,12,2,hair);
      if(back){r(10,10+bob,13,6,hair);r(11,14+bob,12,3,hairShade);r(11,19+bob,12,2,cloth);}
      else{r(12,12+bob,2,2,INK);r(20,12+bob,2,2,INK);r(16,16+bob,3,1,hairShade);}
    }
    // Signature shapes carry across each orientation, with facial detail ONLY in front/profile.
    if(name==='Gojo'){
      for(const [x,y] of [[9,3],[12,1],[16,2],[20,0],[24,3]])r(x,y+bob,3,6,hair);
      if(back){r(10,13+bob,13,3,INK);r(14,16+bob,3,5,INK);r(17,16+bob,2,4,INK);}
      else if(side){r(15,10+bob,10,4,INK);r(9,11+bob,6,2,INK);}
      else{r(10,11+bob,14,4,INK);r(12,11+bob,10,1,'#475772');}
    }
    if(['Megumi','Yuji','Sukuna'].includes(name))for(const [x,y] of [[8,4],[11,1],[16,0],[21,2],[24,4]])r(x,y+bob,3,7,hair);
    if(name==='Hakari'){r(9,2+bob,15,5,hair);r(11,2+bob,3,2,cloth);if(!back)r(side?20:15,20+bob,2,9,accent);}
    if(name==='Toji'){
      const x=side?7:back?22:5;r(x,17+bob,5,11,'#795c91');r(x-1,15+bob,6,6,accent);r(x+2,16+bob,1,2,'#efcfad');
      if(back)r(12,21+bob,12,3,'#795c91');
    }
    if(name==='Sukuna'&&!back){r(side?23:12,15+bob,3,1,'#863f56');if(!side)r(20,15+bob,3,1,'#863f56');}
    if(name==='Megumi'){r(9,3+bob,4,8,hair);r(23,1+bob,3,8,hair);if(!back)r(side?22:18,20+bob,1,5,accent);}
    if(name==='Yuji'){r(side?11:8,17+bob,side?12:17,4,'#b65568');if(back)r(10,20+bob,13,4,'#8b3b51');}
    if(name==='Nobara'){
      r(8,5+bob,4,17,hairShade);r(23,6+bob,4,17,hair);r(10,3+bob,15,5,hair);
      r(side?11:8,28+bob,side?12:17,4,shirt);if(!back){r(26,24+bob,2,10,'#947252');r(24,23+bob,6,3,'#a6b2ba');}
    }
    if(name==='Maki'){
      r(side?7:23,6+bob,4,18,hairShade);r(20,2+bob,5,5,hair);
      if(!back){r(side?20:11,11+bob,5,3,INK);if(!side){r(18,11+bob,5,3,INK);r(15,12+bob,3,1,accent);}}
      r(side?8:back?12:26,19+bob,2,16,'#b5bba9');
    }
    if(name==='Toge'){r(side?13:9,15+bob,side?12:16,6,accent);r(side?21:18,16+bob,2,4,cloth);}
    if(name==='Panda'){
      r(8,2+bob,6,6,INK);r(side?20:22,2+bob,6,6,INK);
      if(!back){r(side?20:11,10+bob,5,5,INK);if(!side)r(19,10+bob,5,5,INK);r(side?25:15,16+bob,4,2,INK);}
      r(side?13:9,21+bob,side?7:14,6,'#f5efde');
    }
    if(name==='Nanami'){
      r(10,3+bob,14,5,hair);r(11,4+bob,9,1,'#f3d99c');
      if(!back){r(side?20:10,11+bob,side?6:14,3,'#36515b');r(side?21:11,11+bob,3,1,'#9ac7cc');r(side?21:16,20+bob,2,9,accent);}
    }
    if(name==='Yuta'){r(8,6+bob,4,13,hair);r(11,3+bob,10,6,hair);r(side?7:back?11:26,19+bob,2,16,'#71809c');r(side?6:back?10:25,18+bob,4,4,'#bbc6ce');}
    if(name==='Choso'){
      r(7,2+bob,5,6,hair);r(side?9:23,2+bob,5,6,hair);r(8,9+bob,4,12,hairShade);
      if(!back){r(side?22:12,14+bob,side?4:10,2,accent);r(side?24:16,15+bob,2,3,accent);}r(side?12:8,18+bob,side?11:17,4,'#f2ead7');
    }
    if(name==='Todo'){r(14,0+bob,6,6,hair);r(12,3+bob,9,4,hair);r(side?20:10,22+bob,side?2:15,1,'#956653');if(!back)r(side?22:22,10+bob,1,7,'#976051');}
    if(name==='Jogo'){
      r(9,4+bob,16,8,hair);r(12,1+bob,10,6,'#ca8853');r(14,1+bob,6,3,'#613c3a');r(16,2+bob,3,1,accent);
      if(!back){r(side?19:12,11+bob,side?7:10,5,skin);r(side?22:16,12+bob,3,3,INK);r(side?23:17,12+bob,1,1,'#f4dbad');}
      r(side?12:8,18+bob,side?12:17,4,'#b08c66');
    }
    if(name==='Mahito'){
      r(7,6+bob,5,17,hairShade);r(23,5+bob,4,18,hair);r(10,2+bob,14,5,hair);
      if(!back){r(side?22:20,12+bob,1,6,'#627588');r(side?21:18,15+bob,4,1,'#627588');}
      r(side?13:9,24+bob,side?9:16,2,'#364d68');
    }
    cache.set(key,cv);return cv;
  }
  A.person=(ctx,name,x,y,dir='down',phase=0)=>{
    if(!P[name])return basePerson(ctx,name,x,y,dir,phase);
    ctx.save();ctx.imageSmoothingEnabled=false;
    // Shadow is separate from the frame and remains at the foot point.
    ctx.fillStyle='#20353155';ctx.fillRect(Math.round(x-9),Math.round(y-1),18,3);
    ctx.fillRect(Math.round(x-6),Math.round(y-2),12,5);
    ctx.drawImage(frame(name,dir,phase),Math.round(x-W/2),Math.round(y-SOLE));ctx.restore();
  };
  window.HakoneTravelers={roster:[...roster],frame,metrics:()=>({width:W,height:H,soleY:SOLE}),cacheSize:()=>cache.size};

  // Reuse the existing selection handlers so town/arena/save behavior stays identical.
  const button=document.getElementById('fighterButton'),body=document.getElementById('panelBody'),title=document.getElementById('panelTitle'),dialog=document.getElementById('panel');
  const nameNode=document.getElementById('fighter');
  if(button&&nameNode){button.replaceChildren(document.createTextNode('Character: '),nameNode,document.createTextNode(' [C] ▾'));button.title='Choose any of the 16 characters to walk around Hakone';}
  const style=document.createElement('style');style.textContent=`
    #fighterButton{border-color:#b7a16e;color:#f2ddb0}
    #panelBody.traveler-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}
    #panelBody.traveler-grid button{display:flex;gap:12px;align-items:center;text-align:left;min-height:104px;padding:9px}
    #panelBody.traveler-grid canvas{width:48px;height:63px;image-rendering:pixelated;flex-shrink:0;background:#314949;border-radius:4px}
    #panelBody.traveler-grid strong{display:block;font-size:14px}#panelBody.traveler-grid small{display:block;font-size:10px;color:#bdd0c3;margin-top:5px}
    #panelBody.traveler-grid button[aria-pressed=true]{border:2px solid #e4c178;background:#3e5148}
    @media(max-width:420px){#panelBody.traveler-grid{gap:6px}#panelBody.traveler-grid button{gap:6px;padding:6px}#panelBody.traveler-grid canvas{width:32px;height:42px}}
  `;document.head.append(style);
  function decorate(){
    const selecting=title.textContent==='Choose your traveler';body.classList.toggle('traveler-grid',selecting);
    if(!selecting)return;
    document.getElementById('panelDesc').textContent='Choose who you walk around Hakone as. All 16 characters are available, free. Your choice is saved and also carries into your next arena fight.';
    const selected=life.snapshot().fighter;
    for(const b of body.querySelectorAll(':scope > button')){
      if(b.dataset.traveler)continue;
      const label=b.textContent,name=roster.find(n=>label.startsWith(n+' · '));if(!name)continue;
      b.dataset.traveler=name;b.setAttribute('aria-label',label);b.setAttribute('aria-pressed',String(name===selected));
      const pic=document.createElement('canvas');pic.width=W;pic.height=H;pic.setAttribute('aria-hidden','true');pic.getContext('2d').drawImage(frame(name,'down',0),0,0);
      const words=document.createElement('span'),heading=document.createElement('strong'),move=document.createElement('small');heading.textContent=name;move.textContent=label.slice(name.length+3);words.append(heading,move);b.replaceChildren(pic,words);
    }
  }
  new MutationObserver(decorate).observe(title,{childList:true,subtree:true});
  dialog.addEventListener('close',()=>{body.classList.remove('traveler-grid');if(life.snapshot().mode==='town')document.getElementById('world').focus({preventScroll:true});});
  addEventListener('keydown',e=>{
    if(e.key.toLowerCase()!=='c'||e.repeat||e.ctrlKey||e.metaKey||e.altKey||dialog.open||life.snapshot().mode!=='town'||/INPUT|TEXTAREA|SELECT/.test(e.target?.tagName||''))return;
    e.preventDefault();button.click();
  });
  const sources=window.HakoneData.sources;
  for(const item of [
    ['SLYNYRD: directional traveler design and six-frame walking','https://www.slynyrd.com/blog/2025/3/24/pixelblog-55-top-down-character-animation'],
    ['Saint11: consistent resolution, palettes and readable interfaces','https://saint11.art/blog/consistency/']
  ])if(!sources.some(s=>s[1]===item[1]))sources.push(item);
})();
