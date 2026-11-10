/* Hakone Life: a separate, peaceful town mode. Legacy arena/upgrade saves stay compatible. */
(() => {
  'use strict';
  const D=HakoneData,A=HakoneArt,I=HakoneInteraction,$=id=>document.getElementById(id);
  const roster=['Gojo','Toji','Hakari','Sukuna','Megumi','Yuji','Nobara','Maki','Toge','Panda','Nanami','Yuta','Choso','Todo','Jogo','Mahito'];
  const canvas=$('world'),ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;
  const SAVE='hakone-life-town-v1',COINS='gojo-vs-toji-arcade-coins-v1',LEVELS='gojo-vs-toji-upgrade-levels-v1',GIFT='gojo-vs-toji-upgrade-starter-v1';
  const memoryStore={};
  let storageOK=true,noticeTimer=0,clock=0,mode='town',keys={},dialogAction=null,drillStep=0,lastSave=0;
  let route=null,chosen=null,hovered=null;
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n)),num=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;
  function read(k){if(!storageOK)return memoryStore[k]??null;try{const v=localStorage.getItem(k);memoryStore[k]=v;return v}catch(_){storageOK=false;return memoryStore[k]??null}}
  function write(k,v){memoryStore[k]=v;if(!storageOK)return false;try{localStorage.setItem(k,v);return true}catch(_){storageOK=false;return false}}
  let saved={};try{saved=JSON.parse(read(SAVE)||'{}')||{}}catch(_){}
  const state={x:clamp(num(saved.x,200),20,1260),y:clamp(num(saved.y,270),55,780),room:D.shops[saved.room]?saved.room:null,
    returnPoint:saved.returnPoint&&Number.isFinite(saved.returnPoint.x)&&Number.isFinite(saved.returnPoint.y)?saved.returnPoint:{x:200,y:270},
    fighter:roster.includes(saved.fighter)?saved.fighter:'Gojo',dir:'down',step:0,
    energy:clamp(num(saved.energy,85),0,100),fullness:clamp(num(saved.fullness,80),0,100),bag:{},
    trash:clamp(Math.floor(num(saved.trash)),0,999),stash:clamp(Math.floor(num(saved.stash)),0,999999),
    stamps:Array.isArray(saved.stamps)?[...new Set(saved.stamps.filter(x=>D.shops[x]))]:[],
    flags:saved.flags&&typeof saved.flags==='object'?saved.flags:{},lights:saved.lights&&typeof saved.lights==='object'?saved.lights:{},
    rain:!!saved.rain,umbrella:!!saved.umbrella,parcel:!!saved.parcel};
  for(const id of Object.keys(D.items))state.bag[id]=clamp(Math.floor(num(saved.bag?.[id])),0,99);
  state.umbrella=state.umbrella&&state.bag.umbrella>0;
  if(read(GIFT)!=='yes'){write(COINS,String(coins()+50));write(GIFT,'yes');}
  function coins(){return clamp(Math.floor(num(read(COINS))),0,999999)}
  function pay(n){n=Math.floor(n);if(n<0||coins()<n)return false;write(COINS,String(coins()-n));return true}
  function award(n){write(COINS,String(coins()+Math.max(0,Math.floor(n))));hud();}
  function save(){const ok=write(SAVE,JSON.stringify(state));$('saveLabel').textContent=ok?'Saved on this device':'Saving blocked — progress is temporary';hud();return ok}
  function notify(message){$('notice').textContent=message;noticeTimer=5;}
  let audio=null;
  function sound(kind='click'){
    if($('mute').getAttribute('aria-pressed')==='true')return;
    try{audio=audio||new (window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume().catch(()=>{});
      const o=audio.createOscillator(),g=audio.createGain(),t=audio.currentTime;
      o.type='triangle';o.frequency.setValueAtTime(kind==='purchase'?660:kind==='eat'?440:330,t);o.frequency.exponentialRampToValueAtTime(kind==='purchase'?990:220,t+.13);
      g.gain.setValueAtTime(.06,t);g.gain.exponentialRampToValueAtTime(.0001,t+.16);o.connect(g);g.connect(audio.destination);o.start();o.stop(t+.17);o.onended=()=>{o.disconnect();g.disconnect();};
    }catch(_){}
  }
  function hud(){
    $('wallet').textContent=coins()+' coins';$('energy').textContent=Math.round(state.energy)+' energy';$('fullness').textContent=Math.round(state.fullness)+' fullness';
    $('place').textContent=mode==='arena'?'Arena Battles':state.room?D.shops[state.room].name:'Hakone Life · Riverside district';
    $('fighter').textContent=state.fighter;$('weather').textContent=state.rain?'Weather: rain':'Weather: clear';
  }
  function close(){if($('panel').open)$('panel').close();dialogAction=null;keys={};route=null;canvas.focus({preventScroll:true});}
  function panel(title,desc,buttons=[]){
    dialogAction=null;route=null;$('panelTitle').textContent=title;$('panelDesc').textContent=desc;$('panelBody').replaceChildren();
    for(const b of buttons){const btn=document.createElement('button');btn.type='button';btn.textContent=b.label;btn.disabled=!!b.disabled;
      btn.addEventListener('click',()=>{sound();b.run()});$('panelBody').append(btn);}
    if(!$('panel').open)$('panel').showModal();keys={};hud();
  }
  function itemCard(id,actionLabel,action,disabled=false){
    const i=D.items[id],row=document.createElement('div');row.className='item';const icon=document.createElement('canvas');icon.width=32;icon.height=32;A.itemIcon(icon.getContext('2d'),id,2,1);
    const words=document.createElement('div'),name=document.createElement('strong'),detail=document.createElement('small');name.textContent=i[0];detail.textContent=i[5]+(i[1]>0?' • '+i[1]+' coins':'');words.append(name,detail);
    const btn=document.createElement('button');btn.textContent=actionLabel;btn.disabled=disabled;btn.onclick=action;row.append(icon,words,btn);return row;
  }
  function shop(title,stock){
    panel(title,'Game coins, not real prices. Purchases go into your bag. Use items in town; fighter upgrades apply in your next fight.');
    for(const id of stock){const i=D.items[id];$('panelBody').append(itemCard(id,'Buy',()=>{
      if(state.bag[id]>=99){notify('Your bag already has 99 of that item.');return;}
      if(!pay(i[1])){notify('Not enough coins. Try a delivery, training, or winning a CPU fight.');return;}
      state.bag[id]++;save();sound('purchase');notify('Bought '+i[0]+'. Open your bag with B.');shop(title,stock);
    },coins()<i[1]||state.bag[id]>=99));}
  }
  function bag(){
    panel('Your bag',`Keep food for later, equip an umbrella, or use the shop machines. Empty bottles/cans: ${state.trash}. ${state.parcel?'You are carrying the inn parcel.':''}`);
    const have=Object.keys(state.bag).filter(id=>state.bag[id]>0);
    if(!have.length){const p=document.createElement('p');p.textContent='Your bag is empty. The vending machine beside 7-Eleven is a good first stop.';$('panelBody').append(p);}
    for(const id of have)$('panelBody').append(itemCard(id,'Use ×'+state.bag[id],()=>use(id)));
  }
  function use(id){
    if(!D.items[id]||state.bag[id]<=0)return false;const i=D.items[id],kind=i[4];
    if(kind==='blend'||kind==='brew'){notify(kind==='blend'?'Use the smoothie machine inside 7-Eleven.':'Use the coffee machine inside 7-Eleven.');return false;}
    if(kind==='post'){notify('Take your postcard to the red postbox outside the station.');return false;}
    if(id==='umbrella'){state.umbrella=!state.umbrella;notify(state.umbrella?'Umbrella equipped.':'Umbrella put away.');save();bag();return true;}
    if(id==='towel'){notify('Keep this towel. It reduces the hot-spring fee from 15 to 8 coins.');return false;}
    if(kind==='puzzle'){puzzle();return true;}
    state.bag[id]--;state.fullness=clamp(state.fullness+i[2],0,100);state.energy=clamp(state.energy+i[3],0,100);
    if(kind==='bottle'||kind==='can')state.trash++;save();sound('eat');notify('Enjoyed '+i[0]+'.');bag();return true;
  }
  function puzzle(){
    let progress=0;const seq=['Left','Up','Right'];
    const render=()=>panel('Yosegi-style puzzle box','The carved clue reads: toward the river, toward the mountain, then toward sunrise. Slide the panels: '+progress+'/3.',
      ['Left','Up','Right','Down'].map(label=>({label,run:()=>{
        if(label===seq[progress])progress++;else progress=0;
        if(progress===3){const first=!state.flags.box;state.flags.box=true;if(first)award(15);save();panel('The box opens!',first?'You found a little good-luck note and 15 game coins.':'The keepsake note is still safely inside.');}
        else render();}})));
    render();
  }
  function upgrade(){
    let levels={};try{levels=JSON.parse(read(LEVELS)||'{}')||{}}catch(_){}
    const name=state.fighter,rank=levels[name]||{},defs=[['power','Strength','Punch +2; kick +3 per level'],['vitality','Health','Maximum battle health +12 per level'],['agility','Speed','Battle movement speed +0.22 per level'],['technique','Special','Improves the selected fighter signature special']];
    panel(name+' · Upgrades','Three levels per upgrade. Battle upgrades in Hakone Arena; coins are shared with the classic game. Prices: 35 / 70 / 105 coins. Purchases apply to your next fight.');
    for(const [id,label,desc] of defs){const level=clamp(Math.floor(num(rank[id])),0,3),price=35+level*35;
      const row=document.createElement('div');row.className='item';const words=document.createElement('div');words.className='grow';
      const title=document.createElement('strong'),detail=document.createElement('small');title.textContent=label+' '+('★'.repeat(level)+'☆'.repeat(3-level));detail.textContent=desc;words.append(title,detail);
      const btn=document.createElement('button');btn.textContent=level===3?'MAX':price+' coins';btn.disabled=level===3||coins()<price;
      btn.onclick=()=>{if(!pay(price))return;levels[name]={...rank,[id]:level+1};write(LEVELS,JSON.stringify(levels));save();sound('purchase');notify(name+' upgraded. Start a new fight to use it.');upgrade();};row.append(words,btn);$('panelBody').append(row);
    }
  }
  const fighterMoves={Gojo:'Blue',Toji:'Heavenly Restriction',Hakari:'Jackpot',Sukuna:'Cleave',Megumi:'Divine Dog',Yuji:'Black Flash',Nobara:'Nail + Resonance',Maki:'Weapon Sweep',Toge:'Cursed Speech',Panda:'Guard Stomp',Nanami:'Ratio Strike',Yuta:'Rika Guard',Choso:'Piercing Blood',Todo:'Boogie Woogie',Jogo:'Volcanic Eruption',Mahito:'Idle Transfiguration'};
  function selectFighter(){panel('Choose your traveler','Sixteen playable fighters in Hakone Arena, each with a different special move. Your choice is saved for the next fight.',roster.map(name=>({label:name+' · '+fighterMoves[name],run:()=>{state.fighter=name;save();close();}})));}
  const sceneCache=new Map();
  function interior(id){return HakoneInteriors.objects(id)}
  function objects(){
    const scene=state.room||'outdoors';
    if(!sceneCache.has(scene))sceneCache.set(scene,(state.room?interior(state.room):[...D.buildings,...D.props]).map(o=>({...o,scene})));
    return sceneCache.get(scene);
  }
  function anchor(o){
    const target=I.target(o,state,blocked);if(target)return target.point;
    return I.access(o,blocked).sort((a,b)=>Math.hypot(a.x-state.x,a.y-state.y)-Math.hypot(b.x-state.x,b.y-state.y))[0]||o.anchor||{x:o.x+o.w/2,y:o.y+o.h+5};
  }
  function candidates(){return I.nearby(objects(),state,blocked)}
  function near(){
    const options=candidates();
    return (options.find(t=>t.o.id===chosen)||options.find(t=>t.o.id===hovered)||options[0])?.o||null;
  }
  function chooseNext(){const list=candidates();if(!list.length)return;
    const current=near(),i=list.findIndex(t=>t.o.id===current?.id);
    chosen=list[(i+1)%list.length].o.id;route=null;canvas.focus({preventScroll:true});
  }
  function interact(input=null){
    if(mode!=='town')return false;
    const o=input?objects().find(x=>x.id===input.id&&(!input.scene||x.scene===input.scene)):near();
    if(!o){notify('Walk closer or click an object to walk over to it.');return false;}
    if($('panel').open)close();
    if(I.target(o,state,blocked)){chosen=o.id;activate(o);return true;}
    if(!input){notify('Walk closer to '+o.name+'.');return false;}
    const path=I.plan(state,o,blocked,state.room?640:D.width,state.room?480:D.height);
    if(!path){notify('There is no clear path to '+o.name+'. Try another side.');return false;}
    route={id:o.id,scene:o.scene,points:path};chosen=o.id;keys={};
    notify('Walking to '+o.name+' · movement keys cancel');canvas.focus({preventScroll:true});return true;
  }
  function blocked(x,y){
    const maxX=state.room?608:1262,maxY=state.room?442:778,minX=state.room?36:18,minY=state.room?68:60;
    if(x<minX||x>maxX||y<minY||y>maxY)return true;
    if(!state.room&&x>577&&x<679&&!((y>228&&y<286)||(y>516&&y<574)))return true;
    return objects().some(o=>{const b=o.collision||o;return o.solid&&x+6>b.x&&x-6<b.x+b.w&&y>b.y&&y-7<b.y+b.h;});
  }
  function enter(id){const b=D.buildings.find(x=>x.id===id);if(!b)return;
    route=null;chosen=null;hovered=null;state.returnPoint={x:b.anchor.x,y:b.anchor.y+12};state.room=id;state.x=320;state.y=410;keys={};
    if(!state.stamps.includes(id)){state.stamps.push(id);if(state.stamps.length>=6&&!state.flags.stampPrize){state.flags.stampPrize=true;award(30);notify('Six town stamps collected! +30 coins.');}else notify('Town stamp collected: '+D.shops[id].name);}
    save();close();
  }
  function leaveRoom(){route=null;chosen=null;hovered=null;state.room=null;state.x=state.returnPoint.x;state.y=state.returnPoint.y;state.dir='down';save();close();}
  function restore(energy,fullness,cost=0,message='A peaceful break.'){
    if(!pay(cost)){notify('Not enough coins. Benches and the water tap are free.');return;}
    state.energy=clamp(state.energy+energy,0,100);state.fullness=clamp(state.fullness+fullness,0,100);save();close();sound('eat');notify(message);
  }
  function transform(from,to,title){
    panel(title,D.items[from][5],[{label:'Prepare '+D.items[from][0],disabled:state.bag[from]<1||state.bag[to]>=99,run:()=>{if(state.bag[from]<1||state.bag[to]>=99)return;state.bag[from]--;state.bag[to]++;save();sound('purchase');notify(D.items[to][0]+' is ready in your bag.');close();}}]);
  }
  function map(travel=false){
    panel(travel?'Town shuttle':'Hakone Life · Walking map','A fictional neighborhood, not a real map of Hakone. West: convenience store, restaurants and gifts. East: dojo, hot spring, inn and station. Cross the river on either wooden bridge.',
      travel?[['Shopping street',200,270],['Dojo & onsen',834,267],['Station & inn',1050,550],['Riverside park',454,630]].map(([name,x,y])=>({label:'Travel to '+name+' · free',run:()=>{state.room=null;state.x=x;state.y=y;save();close();}})):[]);
    const p=document.createElement('p');p.textContent='Stamps: '+state.stamps.length+'/8. Visit six buildings for a one-time 30-coin bonus.';$('panelBody').append(p);
  }
  function drill(){
    drillStep=0;panel('Combo training','Press F, F, then D. First completed practice earns 8 coins. Repeat practice is free.',[]);dialogAction='drill';
  }
  function activate(o){noticeTimer=0;$('notice').textContent='';performInteraction(o);if($('panel').open)$('panel').dataset.target=o.id;}
  function performInteraction(o){
    if(!o){notify('Walk closer to a doorway, person or object. E interacts.');return;}
    sound();
    if(o.type==='building'){enter(o.id);return;}
    if(o.type==='exit'){leaveRoom();return;}
    if(o.stock){shop(o.name,o.stock);return;}
    if(o.service==='checkout'){
      const clerk=objects().find(x=>x.id==='clerk');if(clerk)performInteraction(clerk);return;
    }
    if(o.service==='reception'){performInteraction(objects().find(x=>x.id==='host'));return;}
    if(o.service==='bag'){bag();return;}
    if(o.service==='travel'){map(true);return;}
    if(o.service==='info'){panel(o.name,o.description||'Ask a nearby attendant for help.');return;}
    if(o.service==='gear'){panel(o.name,'Check your equipment, choose your fighter, or improve your skills.',[{label:'Fighter upgrades',run:upgrade},{label:'Choose fighter',run:selectFighter},{label:'Open your bag',run:bag}]);return;}
    if(o.service==='stretch'){panel(o.name,'Loosen up before your next practice.',[{label:'Stretch · +10 energy',run:()=>restore(10,0,0,'A good stretch. You feel ready to explore.')}]);return;}
    if(o.service==='wash'){panel(o.name,'Rinse at the wash station before visiting the hot spring.',[{label:'Wash and freshen up · free',run:()=>restore(6,0,0,'Freshened up. Enjoy the bath!')}]);return;}

    if(o.type==='vending'){shop(o.name,o.id==='vending2'?['boss','iyemon','water','oolong','pocari']:['water','iyemon','pocari','oolong','boss']);return;}
    if(o.id==='microwave'){transform('bento','warmBento','Microwave');return;}
    if(o.id==='blender'){transform('smoothieCup','smoothie','Smoothie machine');return;}
    if(o.id==='coffee'){transform('cafeCup','cafe','SEVEN CAFE');return;}
    if(o.type==='recycle'){
      panel('Recycle bottles & cans',`You have ${state.trash} empty containers. The town awards one game coin per container.`,[{label:'Recycle all',disabled:state.trash===0,run:()=>{const n=state.trash;state.trash=0;award(n);save();close();notify('Recycled '+n+' containers. +'+n+' coins.');}}]);return;
    }
    if(o.id==='atm'){
      panel('Game coin bank',`Wallet: ${coins()}. Stored here: ${state.stash}. This is fictional game currency, never a real bank.`,[
        {label:'Store 25 coins',disabled:coins()<25,run:()=>{if(pay(25)){state.stash+=25;save();performInteraction(o);}}},
        {label:'Take out 25 coins',disabled:state.stash<25,run:()=>{if(state.stash>=25){state.stash-=25;award(25);save();performInteraction(o);}}}]);return;
    }
    if(['bench','seat','table','stool','cushion'].includes(o.type)){
      const actions=[{label:'Sit and rest · +25 energy',run:()=>restore(25,0,0,'You take a quiet break. Energy restored.')},{label:'Eat or drink from your bag',run:bag}];
      if(state.room&&D.shops[state.room].stock.length)actions.push({label:'View this shop’s menu',run:()=>shop(D.shops[state.room].name,D.shops[state.room].stock)});
      panel(o.name,'A proper place to sit, rest, and enjoy something from your bag. Resting is free.',actions);return;
    }
    if(o.type==='fountain'){panel(o.name,'Refill and enjoy a drink without leaving a disposable bottle.',[{label:'Drink water · +18 energy',run:()=>restore(18,0,0,'A refreshing drink of water.')}]);return;}
    if(o.type==='bath'){
      const fee=state.bag.towel>0?8:15;panel('Cedar Hot Spring','A restorative game break. Use your own towel for a discount.',[{label:'Take a bath · '+fee+' coins',disabled:coins()<fee,run:()=>restore(100,0,fee,'You leave the hot spring refreshed.') }]);return;
    }
    if(o.type==='bed'){panel('A room at Maple Ryokan','Rest, recharge and have a light breakfast.',[{label:'Stay and rest · 18 coins',disabled:coins()<18,run:()=>restore(100,50,18,'A comfortable rest and a fresh start.')}]);return;}
    if(o.id==='upgrades'){upgrade();return;}
    if(o.id==='dummy'){drill();return;}
    if(o.type==='postbox'){
      panel('Write home',state.flags.posted?'Your postcard has been sent. You can send another.':'Write a postcard about your trip. Your first letter earns a 10-coin travel-memory bonus.',[{label:'Send a postcard',disabled:state.bag.postcard<1,run:()=>{if(state.bag.postcard<1)return;state.bag.postcard--;if(!state.flags.posted){award(10);state.flags.posted=true;}save();close();notify('Your postcard is on its way.');}}]);return;
    }
    if(o.type==='bus'||(state.room==='station'&&['map','host'].includes(o.id))){map(true);return;}
    if(o.id==='map'){map();return;}
    if(o.type==='board'){
      panel('Town noticeboard','Visit six buildings for 30 coins. Deliver a parcel from 7-Eleven to the ryokan for 25 coins. A CPU arena victory earns 35 coins. No real money.',[{label:'See walking map',run:()=>map()},{label:'Enter arena',run:()=>arena()}]);return;
    }
    if(o.type==='npc'){
      if(state.room==='seven'&&o.id==='clerk'){
        panel('7-Eleven shopkeeper','Welcome! Food is on the shelves. Bought a cup or bento? Use the machines nearby.',[
          {label:'Browse the full shop',run:()=>shop('7-Eleven',D.shops.seven.stock)},
          {label:state.flags.delivered?'Parcel delivered':state.parcel?'Parcel already in your bag':'Pick up parcel for the ryokan',disabled:state.flags.delivered||state.parcel,run:()=>{state.parcel=true;save();close();notify('Take the parcel to the innkeeper at Maple Ryokan, east of the river.');}}]);return;
      }
      if(state.room==='inn'&&o.id==='host'){
        panel('Innkeeper','Welcome to Maple Ryokan. Our delivery from 7-Eleven should be arriving soon.',[{label:'Deliver the parcel · +25 coins',disabled:!state.parcel||state.flags.delivered,run:()=>{if(!state.parcel||state.flags.delivered)return;state.parcel=false;state.flags.delivered=true;award(25);save();close();notify('Delivery complete. Thank you! +25 coins.');}}]);return;
      }
      if(state.room==='dojo'){panel('Dojo trainer','Train at the wooden dummy, spend coins on upgrades, or challenge the CPU. Leaving a fight gives no victory reward.',[{label:'Fighter upgrades',run:upgrade},{label:'Enter arena',run:arena},{label:'Choose fighter',run:selectFighter}]);return;}
      if(state.room==='onsen'){panel('Bath attendant','The pool is straight ahead. A visit costs 15 game coins, or 8 with your own towel. There is no fighting in town.');return;}
      if(state.room&&D.shops[state.room].stock.length){shop(D.shops[state.room].name,D.shops[state.room].stock);return;}
      panel(o.name,o.id==='tourist'?'Mika: I am collecting town stamps! Step into six different buildings and check your map. The sweets shop has a little puzzle box.':'Ren: Please recycle your bottles and cans. The riverside benches are free, and the clear umbrella is useful when it rains.');return;
    }
    if(o.type==='lamp'){panel(o.name,'Inspect the warm street lantern.',[{label:state.lights[o.id]?'Switch on':'Switch off',run:()=>{state.lights[o.id]=!state.lights[o.id];save();close();}}]);return;}
    if(o.type==='cat'){panel('A sleepy cat','The cat opens one eye and gives a tiny purr.',[{label:'Pet gently',run:()=>{state.flags.petted=true;restore(4,0,0,'Prrr. The cat approves.');}}]);return;}
    if(o.type==='shrine'){panel(o.name,'A quiet place beneath the trees.',[{label:'Take a peaceful moment',run:()=>restore(8,0,0,'You pause, breathe and listen to the town.')}]);return;}
    const description=o.type==='tree'?'Leaves stir above the path. A little shade makes a good place to pause.':o.type==='rock'?'A smooth stone beside the path. Small flecks of light catch its edge.':o.type==='bridge'?'The water moves beneath the timber bridge. Both banks of town are open to explore.':'Through the window you can see a quiet street and the hills beyond.';
    panel(o.name,description);
  }
  function arena(){
    close();save();route=null;chosen=null;hovered=null;mode='arena';keys={};$('townView').hidden=true;$('arenaView').hidden=false;$('townTab').classList.remove('active');$('arenaTab').classList.add('active');
    $('arenaFrame').src='arena.html?from=hakone&p1='+encodeURIComponent(state.fighter);$('leaveFight').hidden=false;hud();
  }
  function town(){
    mode='town';route=null;chosen=null;hovered=null;$('arenaFrame').src='about:blank';$('arenaView').hidden=true;$('townView').hidden=false;$('leaveFight').hidden=true;
    $('townTab').classList.add('active');$('arenaTab').classList.remove('active');keys={};hud();notify('Back in Hakone. Your town position and purchases are kept.');
  }
  $('arenaFrame').addEventListener('load',()=>{
    if(mode!=='arena')return;
    try{const w=$('arenaFrame').contentWindow,doc=w.document,select=doc.getElementById('c1');if(select)select.value=state.fighter;
      w.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();town();}});
    }catch(_){}
  });
  $('panelClose').onclick=close;$('panel').addEventListener('cancel',()=>{dialogAction=null;keys={};route=null;canvas.focus({preventScroll:true});});
  $('bagButton').onclick=bag;$('upgradeButton').onclick=upgrade;$('fighterButton').onclick=selectFighter;
  $('mapButton').onclick=()=>map();$('townTab').onclick=town;$('arenaTab').onclick=arena;$('leaveFight').onclick=town;
  $('interactButton').onclick=()=>interact();$('cycleButton').onclick=chooseNext;$('weather').onclick=()=>{state.rain=!state.rain;save();notify(state.rain?'Rain begins. A clear umbrella helps.':'The sky clears.');};
  $('mute').onclick=()=>{const muted=$('mute').getAttribute('aria-pressed')!=='true';$('mute').setAttribute('aria-pressed',String(muted));$('mute').textContent=muted?'Sound off':'Sound on';};
  $('sourcesButton').onclick=()=>{
    panel('Research & art notes','Unofficial fan-made game. The map and all prices, rewards and item effects are fictional. Product categories were checked against the official sources below; real inventories vary by region and store. Artwork is original procedural pixel art, not copied tutorial assets.');
    for(const [name,url] of D.sources){const link=document.createElement('a');link.href=url;link.target='_blank';link.rel='noopener noreferrer';link.textContent=name;$('panelBody').append(link);}
  };
  addEventListener('keydown',e=>{
    if(e.ctrlKey||e.metaKey||e.altKey)return;
    const k=e.key.toLowerCase();
    if(mode==='arena'){if(k==='escape')town();return;}
    if($('panel').open){
      if(dialogAction==='drill'&&!e.repeat&&['f','d'].includes(k)){
        const sequence=['f','f','d'];drillStep=k===sequence[drillStep]?drillStep+1:0;
        $('panelDesc').textContent='F → F → D · '+drillStep+'/3';
        if(drillStep===3){const first=!state.flags.trained;state.flags.trained=true;if(first)award(8);save();close();notify(first?'Combo complete! +8 coins.':'Combo complete. Nice practice.');}
      }
      return;
    }
    if(['arrowleft','arrowright','arrowup','arrowdown',' ','w','a','s','d'].includes(k)){e.preventDefault();route=null;chosen=null;hovered=null;}keys[k]=true;
    if(e.repeat)return;
    if(k==='q')chooseNext();if(k==='e')interact();if(k==='b')bag();if(k==='u')upgrade();if(k==='m')map();
  });
  addEventListener('keyup',e=>delete keys[e.key.toLowerCase()]);addEventListener('blur',()=>keys={});
  document.addEventListener('visibilitychange',()=>{keys={};if(document.hidden)save();});addEventListener('pagehide',save);
  addEventListener('storage',e=>{if(e.key===COINS||e.key===LEVELS)hud();});
  for(const btn of document.querySelectorAll('[data-move]')){
    const clear=()=>delete keys[btn.dataset.move];btn.onpointerdown=e=>{e.preventDefault();btn.setPointerCapture(e.pointerId);route=null;chosen=null;hovered=null;keys[btn.dataset.move]=true;};btn.onpointerup=clear;btn.onpointercancel=clear;
  }
  let camera={x:0,y:0};
  function pointerPosition(e){const r=canvas.getBoundingClientRect();return {x:(e.clientX-r.left)*canvas.width/r.width+camera.x,y:(e.clientY-r.top)*canvas.height/r.height+camera.y};}
  canvas.addEventListener('pointermove',e=>{if(e.pointerType==='touch'||route)return;const p=pointerPosition(e);hovered=I.pick(objects(),p.x,p.y)?.id||null;});
  canvas.addEventListener('pointerleave',()=>hovered=null);
  canvas.addEventListener('pointerdown',e=>{
    if(mode!=='town'||$('panel').open)return;
    const p=pointerPosition(e),o=I.pick(objects(),p.x,p.y);canvas.focus({preventScroll:true});
    if(o){e.preventDefault();chosen=o.id;interact(o);}else{route=null;chosen=null;hovered=null;}
  });
  function update(dt){
    if(mode!=='town'||$('panel').open||document.hidden)return;
    let dx=(keys.arrowright||keys.d?1:0)-(keys.arrowleft||keys.a?1:0),dy=(keys.arrowdown||keys.s?1:0)-(keys.arrowup||keys.w?1:0);
    const manual=!!(dx||dy);if(manual)route=null;
    if(route){
      if(route.scene!==(state.room||'outdoors'))route=null;
      else{
        const target=objects().find(o=>o.id===route.id);
        if(!target){route=null;}
        else if(I.target(target,state,blocked)){
          route=null;activate(target);return;
        }else{
          while(route.points.length&&Math.hypot(route.points[0].x-state.x,route.points[0].y-state.y)<2){
            const p=route.points.shift();state.x=p.x;state.y=p.y;
          }
          if(!route.points.length){route=null;if(I.target(target,state,blocked)){activate(target);return;}notify('Move a little closer, then press E.');}
          else{dx=route.points[0].x-state.x;dy=route.points[0].y-state.y;}
        }
      }
    }
    const length=Math.hypot(dx,dy),sprint=keys.shift&&state.energy>1,velocity=sprint?138:88;
    if(length){dx/=length;dy/=length;const travel=route?Math.min(length,velocity*dt):velocity*dt,nx=state.x+dx*travel,ny=state.y+dy*travel;
      const beforeX=state.x,beforeY=state.y;if(!blocked(nx,state.y))state.x=nx;if(!blocked(state.x,ny))state.y=ny;if(route&&state.x===beforeX&&state.y===beforeY){route=null;notify('Path blocked. Move to another side and press E.');}
      state.dir=Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up');state.step+=dt*10;
      state.energy=clamp(state.energy-dt*(sprint?4:state.rain&&!state.umbrella?.6:.06),0,100);state.fullness=clamp(state.fullness-dt*.08,0,100);
    }else state.step=0;
    clock+=dt;lastSave+=dt;if(lastSave>3){save();lastSave=0;}
  }
  function draw(){
    if(mode!=='town')return;
    const W=state.room?640:D.width,H=state.room?480:D.height;
    camera={x:Math.round(clamp(state.x-320,0,Math.max(0,W-640))),y:Math.round(clamp(state.y-220,0,Math.max(0,H-400)))};
    ctx.save();ctx.clearRect(0,0,640,400);ctx.translate(-camera.x,-camera.y);A.ground(ctx,state.room,Math.floor(clock*60));
    const list=objects(),nearby=near();
    const layers=[...list.map(o=>({y:o.y+o.h,draw:()=>{if(o.type==='building')A.building(ctx,o);else A.prop(ctx,o,clock*60,state);}})),{y:state.y,draw:()=>{
      A.person(ctx,state.fighter,state.x,state.y,state.dir,Math.floor(state.step)%6);
      if(state.rain&&state.umbrella&&state.bag.umbrella){A.rect(ctx,state.x-20,state.y-42,40,4,'#b9d0cb');A.rect(ctx,state.x-16,state.y-46,32,4,'#cbded1');A.rect(ctx,state.x-9,state.y-49,18,3,'#d9e7da');A.rect(ctx,state.x+9,state.y-41,2,20,'#7f9693');}
    }}].sort((a,b)=>a.y-b.y);layers.forEach(x=>x.draw());
    if(nearby){const a=anchor(nearby);ctx.strokeStyle='#ffe1a0';ctx.lineWidth=1;ctx.strokeRect(Math.round(nearby.x-2),Math.round(nearby.y-2),nearby.w+4,nearby.h+4);A.rect(ctx,a.x-8,a.y-4,16,2,'#ffe1a0');A.text(ctx,'E',a.x,nearby.y-8,'#ffe1a0',11);}
    if(route)for(const p of route.points)A.rect(ctx,p.x-1,p.y-1,3,3,'#ffe1a099');
    ctx.restore();
    if(state.rain&&!state.room){ctx.strokeStyle='#c5d8ce55';ctx.lineWidth=1;for(let i=0;i<60;i++){const x=(i*71+clock*34)%660,y=(i*47+clock*130)%416;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-3,y+7);ctx.stroke();}}
    A.rect(ctx,10,10,122,25,'#253b3edb');A.text(ctx,state.room?'INDOORS':'HAKONE · N ↑',71,27,'#e7d5aa',10);
    const options=candidates(),target=route&&objects().find(o=>o.id===route.id);
    $('cycleButton').hidden=options.length<2||!!route;
    $('interactButton').disabled=!nearby||!!route;
    $('interactButton').title=nearby?'Interact with '+nearby.name:'Walk closer, or click an object to approach it';
    $('prompt').textContent=target?'Walking to '+target.name+' · move to cancel':nearby?'E — '+nearby.name+(options.length>1?' · Q changes target':''):'Click a place to walk over · E interacts · B opens bag';
  }
  let previous=performance.now();
  function frame(now){const dt=Math.min(.04,(now-previous)/1000);previous=now;update(dt);draw();if(noticeTimer>0){noticeTimer-=dt;if(noticeTimer<=0)$('notice').textContent='';}requestAnimationFrame(frame)}
  if(blocked(state.x,state.y)){state.room=null;state.x=200;state.y=270;}
  hud();save();requestAnimationFrame(frame);notify('Welcome to Hakone Life. Walk with arrows or WASD. Press E near a doorway or object.');
  window.HakoneLife={snapshot:()=>JSON.parse(JSON.stringify({...state,coins:coins(),mode,storageOK})),objects:()=>objects().map(o=>({...o,anchor:anchor(o),access:I.access(o,blocked)})),nearby:()=>candidates().map(t=>({id:t.o.id,name:t.o.name,distance:t.distance})),route:()=>route?JSON.parse(JSON.stringify(route)):null,interact,enter,bag,upgrade,use,arena,town,save,blocked};
})();
