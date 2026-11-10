/* Walkable, interactive Hakone interiors. Every furniture object has a handler.
   Layouts use 16px proportions and broad passageways; no collision-only decoration. */
window.HakoneInteriors = (() => {
  'use strict';
  const D=window.HakoneData,cache=new Map();
  for(const source of [
    ['SLYNYRD: grounded fighting stances','https://www.slynyrd.com/blog/2024/9/26/pixelblog-52-idle-fighting-stance'],
    ['SLYNYRD: punches and kicks','https://www.slynyrd.com/blog/2024/11/25/pixelblog-53-punches-and-kicks'],
    ['Jujutsu Kaisen: official character design reference','https://jujutsukaisen.jp/character/']
  ])if(!D.sources.some(s=>s[1]===source[1]))D.sources.push(source);
  const o=(id,type,name,x,y,w=32,h=32,extra={})=>({id,type,name,x,y,w,h,solid:true,...extra});
  const stock=(id,name,x,y,w,h,items,extra={})=>o(id,'shelf',name,x,y,w,h,{stock:items,...extra});
  const seat=(id,name,x,y,w=48,h=20,extra={})=>o(id,'seat',name,x,y,w,h,extra);
  const note=(id,type,name,x,y,w,h,description)=>o(id,type,name,x,y,w,h,{action:'inspect',description});
  function get(room) {
    if(cache.has(room))return cache.get(room);
    if(!D.shops[room])return [];
    const a=[o('exit','exit','Return to town',296,438,48,14,{solid:false}),
      o('window','sign','Window view',296,44,32,16,{solid:false})];
    if(room==='seven')a.push(
      o('fridge','fridge','Chilled drinks · fridge wall',64,82,208,46,{stock:['water','iyemon','pocari','oolong','boss'],label:'COLD DRINKS'}),
      o('hotcase','hotcase','Hot food counter',388,82,184,46,{stock:['chicken','bun','oden'],label:'HOT FOOD'}),
      stock('shelf0','Aisle 1 · rice balls, sandwiches & bento',128,176,44,152,['onigiri','salmon','egg','bento'],{aisle:true,label:'MEALS'}),
      stock('shelf1','Aisle 2 · bakery & snacks',250,176,44,152,['melonpan','bun','chicken','oden'],{aisle:true,label:'SNACKS'}),
      stock('shelf2','Aisle 3 · cups & supplies',372,176,44,152,['smoothieCup','cafeCup','umbrella'],{aisle:true,label:'SUPPLIES'}),
      o('checkout','counter','Checkout & parcel collection',474,176,104,36,{action:'checkout',label:'CHECKOUT'}),
      o('clerk','npc','7-Eleven shopkeeper',554,228,18,30),
      o('microwave','microwave','Warm your bento',472,266,38,28),
      o('coffee','coffee','SEVEN CAFE machine',544,270,32,38),
      o('blender','blender','Smoothie machine',472,344,32,38),
      o('atm','atm','Game coin bank',64,346,32,42),
      o('shopbin','recycle','Recycle bottles & cans',550,350,20,28),
      seat('seat','Window bench',128,374,92,20),
      note('staffdoor','door','Staff-room door',302,80,34,44,'Staff only. Deliveries are collected at the checkout counter; the public exit is at the bottom of the shop.')
    );
    else if(room==='ramen'||room==='soba') {
      const ramen=room==='ramen', menu=ramen?['ramen','curry','oolong']:['soba','udon','iyemon'];
      a.push(
        o('service','counter',ramen?'Ramen counter · order a bowl':'Soba counter · order noodles',72,112,242,40,{stock:menu,label:ramen?'ORDER RAMEN':'ORDER SOBA'}),
        o('clerk','npc',ramen?'Ramen chef':'Soba shopkeeper',346,110,18,30),
        note('kitchen','kitchen','Open kitchen',424,84,144,54,ramen?'The broth simmers beside the noodle baskets. Order at the counter, then use a table to eat your meal.':'Fresh noodles are rinsed and arranged on bamboo trays. Order at the counter and settle at a table.'),
        o('menu','board','Food & drink menu',334,78,42,24,{stock:menu}),
        o('table','table',ramen?'Ramen table · west':'Low noodle table · west',96,280,104,50,{dining:true,low:!ramen}),
        o('table2','table',ramen?'Ramen table · east':'Low noodle table · east',420,280,104,50,{dining:true,low:!ramen}),
        seat('seat','West table bench',96,349,104,20,{dining:true}),
        seat('eastBench','East table bench',420,349,104,20,{dining:true}),
        seat('waitBench','Waiting bench',64,396,112,20),
        o('tea','tea','Self-service tea & water',300,270,42,36,{action:'tea'}),
        note('condiments','condiments','Chopsticks & condiments',365,196,36,26,'Chopsticks, napkins and condiments are ready for diners. Food from your bag can be enjoyed at any dining table.')
      );
      for(let i=0;i<4;i++)a.push(seat('stool'+i,'Counter stool '+(i+1),88+i*60,180,22,22,{dining:true,stool:true}));
    } else if(room==='gifts')a.push(
      stock('shelf0','Onsen sweets',72,84,180,38,['manju','castella'],{label:'HAKONE SWEETS'}),
      stock('shelf1','Woodcraft & postcards',388,84,180,38,['postcard','yosegi'],{label:'CRAFTS'}),
      stock('shelf2','Onsen towels & keepsakes',72,178,48,144,['towel','postcard'],{aisle:true,label:'GIFTS'}),
      o('display1','display','Manju tasting display',208,206,100,64,{stock:['manju','castella']}),
      o('display2','display','Yosegi craft display',408,206,100,64,{stock:['yosegi','postcard']}),
      o('checkout','counter','Gift shop checkout',420,336,144,38,{stock:D.shops.gifts.stock,label:'GIFTS'}),
      o('clerk','npc','Gift shopkeeper',534,288,18,30),
      seat('seat','Gift-shop resting bench',152,368,104,20),
      note('craftInfo','board','How the wood patterns are made',310,95,38,32,'Yosegi-style woodcraft uses patterned pieces of wood. The puzzle box in this game opens with a short directional puzzle in your bag.')
    );
    else if(room==='dojo')a.push(
      o('dummy','dummy','Practice a combo',128,146,40,62),
      o('upgrades','board','Fighter upgrades',468,132,48,42),
      o('trainer','npc','Dojo trainer',311,126,18,30),
      note('gear','rack','Training gear rack',72,84,128,36,'Padded practice gear and wooden training tools. Train at the dummy with F, F, D, or use the upgrades board.'),
      note('mat','mat','Practice mat',216,206,204,122,'Open training space. The wooden dummy teaches your combo; the trainer can send you to the arena.'),
      seat('seat','Dojo bench',80,364,128,20),
      seat('dojoBench2','Equipment bench',436,364,112,20),
      o('water','tea','Dojo water station',506,244,36,36,{action:'tea'})
    );
    else if(room==='onsen')a.push(
      o('bath','bath','Use the hot spring',176,124,288,112),
      o('host','npc','Bath attendant',113,315,18,30),
      stock('towels','Towel shelf',448,300,96,36,['towel'],{label:'TOWELS'}),
      o('cubbies','cubbies','Changing-room cubbies',64,88,72,126,{action:'locker'}),
      o('wash','wash','Wash before your bath',88,244,48,42,{action:'wash'}),
      seat('washStool1','Washing stool',184,284,26,22,{stool:true}),
      seat('washStool2','Washing stool',260,284,26,22,{stool:true}),
      seat('seat','Changing bench',378,369,144,20),
      note('bathSign','board','Bath etiquette',514,120,40,40,'Wash first, then enjoy the hot spring. Keep your towel out of the water. This peaceful game uses a simple restorative bath interaction.')
    );
    else if(room==='inn')a.push(
      o('bed','bed','Rest at the ryokan',84,96,76,100),
      o('bed2','bed','Second guest futon',460,96,76,100),
      o('reception','counter','Ryokan reception',254,100,132,38,{action:'reception',label:'WELCOME'}),
      o('host','npc','Innkeeper',311,173,18,30),
      o('table','table','Tea table',244,290,152,42,{dining:true,low:true}),
      seat('seat','Tea-table cushion',276,357,32,20,{cushion:true,dining:true}),
      seat('cushion2','Tea-table cushion',340,357,32,20,{cushion:true,dining:true}),
      o('tea','tea','Ryokan tea station',470,285,42,36,{action:'tea'}),
      o('luggage','cubbies','Guest luggage corner',76,296,84,56,{action:'locker'}),
      note('alcove','alcove','Seasonal display alcove',247,212,140,40,'A seasonal flower arrangement and a quiet mountain print welcome travelers. Your room and bag are saved on this device.')
    );
    else if(room==='station')a.push(
      o('map','board','Town travel map',92,92,56,46),
      o('tickets','counter','Shuttle & travel information',372,100,192,40,{action:'travel',label:'INFORMATION'}),
      o('host','npc','Station attendant',344,162,18,30),
      seat('seat','Waiting bench · west',88,266,144,22),
      seat('waiting2','Waiting bench · east',390,266,144,22),
      o('vendingInside','vending','Station drinks',500,182,28,48),
      o('stationBin','recycle','Station bottle recycling',552,198,20,28),
      stock('kiosk','Station snacks',80,176,140,38,['onigiri','melonpan','water'],{label:'TRAVEL SNACKS'}),
      o('lockers','cubbies','Station luggage lockers',80,352,112,54,{action:'locker'}),
      note('timetable','board','Departure board',280,86,62,38,'The fictional town shuttle is free and always available from the information counter. Choose a destination to travel there.')
    );
    // A practice mat is reachable and inspectable but never a collision obstacle.
    for(const p of a)if(p.type==='mat')p.solid=false;
    cache.set(room,a);return a;
  }
  return Object.freeze({get});
})();

/* Original pixel furnishings. Same geometry is used for drawing and interactions. */
(() => {
  'use strict';
  const A=window.HakoneArt,base=A.prop,r=A.rect;
  const ink='#263d42',wood='#a5734d',edge='#684e3f',cream='#eaddbd';
  function label(c,t,x,y,size=8){A.text(c,t,x,y,'#f2e3be',size);}
  function product(c,id,x,y){A.itemIcon(c,id,x,y,.45);}
  A.prop=function(c,o,tick,state) {
    const {x,y,w,h,type}=o;
    if(type==='shelf'&&!o.aisle)return base(c,o,tick,state);
    if(!['shelf','fridge','hotcase','counter','display','kitchen','seat','table','tea','condiments','rack','mat','cubbies','wash','door','alcove'].includes(type))return base(c,o,tick,state);
    c.save();c.imageSmoothingEnabled=false;
    if(type!=='mat')r(c,x+3,y+h-2,w,5,'#18373c44');
    if(type==='shelf'&&o.aisle) {
      r(c,x,y,w,h,ink);r(c,x+2,y+2,w-4,h-5,'#b6bbae');
      r(c,x+w/2-2,y+3,4,h-6,'#677e75');
      for(let yy=y+14,j=0;yy<y+h-10;yy+=23,j++) {
        r(c,x+3,yy,w-6,18,'#e2dcc5');
        product(c,o.stock[j%o.stock.length],x+4,yy+2);
        product(c,o.stock[(j+1)%o.stock.length],x+w-18,yy+2);
        r(c,x+1,yy+18,w-2,3,'#829288');r(c,x+4,yy+18,7,1,'#efdfa6');
      }
      r(c,x+1,y+1,w-2,10,'#536e64');label(c,String(o.label||'AISLE').slice(0,7),x+w/2,y+8,6);
      r(c,x+3,y+h-6,w-6,4,'#465d56');
    } else if(type==='fridge'||type==='hotcase') {
      const hot=type==='hotcase';r(c,x,y,w,h,ink);r(c,x+2,y+2,w-4,h-4,hot?'#d5ae75':'#a3c1b5');
      r(c,x+3,y+3,w-6,10,hot?'#9c6542':'#3b766b');label(c,o.label||'DRINKS',x+w/2,y+11);
      for(let xx=x+5,j=0;xx<x+w-20;xx+=26,j++) {
        r(c,xx,y+15,23,h-20,hot?'#edd2a0':'#d5e7dd');product(c,o.stock[j%o.stock.length],xx+4,y+17);
        if(!hot){r(c,xx+19,y+18,2,12,'#698c81');r(c,xx+2,y+15,2,h-22,'#f5f5df88');}
      }
      r(c,x+3,y+h-5,w-6,3,hot?'#a97649':'#607f72');
    } else if(type==='counter'||type==='display') {
      r(c,x+2,y+6,w-4,h-6,edge);r(c,x,y,w,h-10,wood);r(c,x+2,y+2,w-4,3,'#d6aa70');
      r(c,x+4,y+h-10,w-8,2,'#6e5140');
      if(type==='display'){for(let n=0;n<4;n++)product(c,o.stock[n%o.stock.length],x+9+n*20,y+9);}
      else {r(c,x+w-35,y+4,24,13,ink);r(c,x+w-32,y+6,18,8,'#91b4a2');r(c,x+w-31,y+18,21,6,'#495c59');
        label(c,o.label||'COUNTER',x+(w-40)/2,y+12,7);}
    } else if(type==='seat') {
      if(o.cushion){r(c,x,y,w,h,'#464e42');r(c,x+2,y+1,w-4,h-3,'#9b6757');r(c,x+4,y+3,w-8,h-7,'#c68e72');}
      else if(o.stool){r(c,x+4,y+8,w-8,h-3,edge);r(c,x,y,w,10,wood);r(c,x+2,y+1,w-4,2,'#d5ac72');}
      else {r(c,x+4,y+8,5,h-2,edge);r(c,x+w-9,y+8,5,h-2,edge);r(c,x,y,w,h-5,edge);
        for(let n=0;n<3;n++)r(c,x+1,y+1+n*4,w-2,3,wood);r(c,x+2,y,w-4,1,'#ddb67d');}
    } else if(type==='table') {
      r(c,x+5,y+h-6,6,o.low?9:15,edge);r(c,x+w-11,y+h-6,6,o.low?9:15,edge);
      r(c,x,y,w,h-4,edge);r(c,x+2,y+1,w-4,h-8,o.low?'#aa895e':'#b38354');
      r(c,x+4,y+2,w-8,2,'#dfb57b');
      const food=state.room==='ramen'?'ramen':state.room==='soba'?'soba':'cafe';
      A.itemIcon(c,food,x+12,y+8,.6);A.itemIcon(c,food,x+w-35,y+8,.6);
      r(c,x+31,y+11,1,12,'#e8cc91');r(c,x+34,y+11,1,12,'#e8cc91');
    } else if(type==='kitchen') {
      r(c,x,y,w,h,ink);r(c,x+2,y+2,w-4,h-6,'#a1afa4');
      for(let n=0;n<3;n++){const xx=x+9+n*40;r(c,xx,y+12,28,22,'#485b59');r(c,xx+3,y+9,22,18,'#b7c5b4');r(c,xx+6,y+10,16,8,'#736748');r(c,xx+9,y+3,2,5,'#d0d8bd');}
      r(c,x+3,y+h-8,w-6,4,'#61776e');
    } else if(type==='cubbies') {
      r(c,x,y,w,h,edge);for(let yy=y+3;yy<y+h-4;yy+=26)for(let xx=x+3;xx<x+w-6;xx+=26){
        r(c,xx,yy,Math.min(23,x+w-3-xx),Math.min(22,y+h-3-yy),'#bb9864');r(c,xx+3,yy+3,14,12,'#6b5946');r(c,xx+5,yy+9,10,5,'#d4be8e');}
    } else if(type==='tea') {
      r(c,x,y+8,w,h-8,edge);r(c,x-2,y+6,w+4,5,wood);r(c,x+6,y,13,22,'#789489');r(c,x+8,y+2,9,4,'#cbd7bc');
      r(c,x+19,y+10,7,3,'#9fb9a7');r(c,x+28,y+15,9,8,cream);r(c,x+29,y+16,7,2,'#8d945d');
    } else if(type==='wash') {
      r(c,x,y,w,h,ink);r(c,x+2,y+2,w-4,h-4,'#9cafa1');r(c,x+7,y+8,w-14,h-18,'#536f6d');r(c,x+11,y+10,w-22,h-23,'#9cc2bb');r(c,x+w/2-2,y-4,4,17,'#d0dbcb');
    } else if(type==='condiments') {
      r(c,x,y+4,w,h-4,edge);r(c,x+2,y+2,w-4,h-7,wood);r(c,x+5,y+6,6,12,'#a96343');r(c,x+5,y+4,6,3,'#3a4941');
      r(c,x+18,y+6,11,14,cream);for(let n=0;n<4;n++)r(c,x+19+n*2,y,1,12,'#a37d4b');
    } else if(type==='rack') {
      r(c,x+4,y,4,h,edge);r(c,x+w-8,y,4,h,edge);r(c,x,y+7,w,5,wood);r(c,x,y+h-5,w,5,wood);
      for(let n=0;n<4;n++){r(c,x+14+n*26,y+2,3,h-4,'#dfc99b');r(c,x+9+n*26,y+11,13,5,'#677d73');}
    } else if(type==='mat') {
      r(c,x,y,w,h,'#496b61');r(c,x+4,y+4,w-8,h-8,'#9da77b');r(c,x+7,y+7,w-14,2,'#c8c28e');
      for(let yy=y+12;yy<y+h-5;yy+=8)r(c,x+8,yy,w-16,1,'#8e9c72');
    } else if(type==='door') {
      r(c,x,y,w,h,ink);r(c,x+3,y+3,w-6,h-3,'#7d9182');r(c,x+6,y+7,w-12,13,'#b3c5b1');r(c,x+w-9,y+28,3,2,'#e2cca3');
    } else if(type==='alcove') {
      r(c,x,y,w,h,edge);r(c,x+4,y+3,w-8,h-8,'#d0bd95');r(c,x+15,y+5,38,24,'#ddd1ab');
      r(c,x+22,y+15,24,8,'#6e8a75');r(c,x+w-34,y+16,14,14,'#668879');r(c,x+w-29,y+3,3,16,'#677c50');r(c,x+w-37,y+4,18,5,'#c19289');
    }
    c.restore();
  };
})();
