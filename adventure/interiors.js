/* Furnished, walkable interiors. All placed furniture is an interaction object.
   Layout is shared by collision, E prompts, mouse/touch interaction and artwork.
   No save keys, prices, fighter abilities or quest IDs are changed. */
(() => {
  'use strict';
  const D=window.HakoneData,A=window.HakoneArt;
  if(!D||!A)return;
  const obj=(id,type,name,x,y,w=32,h=32,extra={})=>({id,type,name,x,y,w,h,solid:true,...extra});
  const seat=(id,name,x,y,w=80)=>obj(id,'bench',name,x,y,w,18);
  const layouts={};
  function common(){return [obj('exit','exit','Return to town',296,438,48,14,{solid:false}),obj('window','sign','Window view',296,44,32,16)];}
  function aisle(id,name,x,stock){const y=186,w=48,h=112;return obj(id,'aisle',name,x,y,w,h,{stock,access:[{x:x-14,y:y+38},{x:x+w+14,y:y+38},{x:x-14,y:y+80},{x:x+w+14,y:y+80},{x:x+w/2,y:y+h+14}]});}
  layouts.seven=[...common(),
    obj('drinksFridge','fridge','Chilled drinks wall',60,94,150,42,{stock:['water','iyemon','pocari','oolong','boss']}),
    obj('freshFridge','fridge','Chilled rice balls & sandwiches',432,94,150,42,{stock:['onigiri','salmon','egg','bento']}),
    aisle('shelf0','Aisle 1 · Rice & bento',112,['onigiri','salmon','egg','bento']),
    aisle('shelf1','Aisle 2 · Snacks & bakery',264,['chicken','bun','oden','melonpan']),
    aisle('shelf2','Aisle 3 · Cups & supplies',416,['smoothieCup','cafeCup','umbrella']),
    obj('microwave','microwave','Warm your bento',238,98,36,26),
    obj('coffee','coffee','SEVEN CAFE machine',300,92,30,36),
    obj('blender','blender','Smoothie machine',358,92,30,36),
    obj('hotCounter','counter','Hot food counter',62,340,122,32,{stock:['chicken','bun','oden']}),
    obj('register','counter','Checkout & shop information',482,357,96,32,{service:'checkout'}),
    obj('clerk','npc','Talk to the shopkeeper',530,307,18,30),
    obj('atm','atm','Game coin bank',550,232,30,40),
    obj('table','table','Eat-in table',184,380,74,30),seat('seat','Convenience-store bench',70,404,76)
  ];
  layouts.ramen=[...common(),
    obj('shelf0','counter','Order ramen',64,104,150,36,{stock:['ramen']}),
    obj('shelf1','counter','Order curry rice',244,104,150,36,{stock:['curry']}),
    obj('shelf2','counter','Order a drink',424,104,150,36,{stock:['oolong']}),
    ...[106,194,282,370,458].map((x,i)=>obj('counterSeat'+i,'stool','Ramen counter seat '+(i+1),x,182,22,22)),
    obj('clerk','npc','Ramen shopkeeper',547,163,18,30),
    obj('table','table','Ramen table by the window',104,268,112,44),
    obj('table2','table','Ramen table by the lantern',420,268,112,44),
    seat('seat','Ramen dining bench',100,332,120),seat('bench2','Ramen dining bench',416,332,120),
    seat('waitingBench','Waiting bench',66,402,96)
  ];
  layouts.soba=[...common(),
    obj('shelf0','counter','Soba menu',76,100,134,34,{stock:['soba']}),
    obj('shelf1','counter','Udon menu',252,100,134,34,{stock:['udon']}),
    obj('shelf2','counter','Tea menu',428,100,134,34,{stock:['iyemon']}),
    obj('clerk','npc','Soba shopkeeper',314,174,18,30),
    obj('table','table','Low soba table',116,250,108,38),obj('table2','table','Low table beside the river',412,250,108,38),
    ...[[148,207],[148,313],[444,207],[444,313]].map(([x,y],i)=>obj('cushion'+i,'cushion','Dining floor cushion '+(i+1),x,y,30,22)),
    seat('seat','Soba waiting bench',76,390,120),
    obj('teaStation','counter','Tea station',498,366,68,32,{stock:['iyemon'],note:'Tea is ordered with game coins.'})
  ];
  layouts.gifts=[...common(),
    ...[['shelf0',76,['manju','castella']],['shelf1',252,['postcard','yosegi']],['shelf2',428,['towel']]].map(([id,x,stock])=>obj(id,'shelf','Browse sweets & crafts',x,100,134,38,{stock})),
    obj('sweetDisplay','display','Sweet display island',108,246,116,52,{stock:['manju','castella']}),
    obj('craftDisplay','display','Woodcraft display island',416,246,116,52,{stock:['yosegi','postcard']}),
    obj('register','counter','Gift wrapping & checkout',384,366,166,32,{service:'checkout'}),
    obj('clerk','npc','Craft shopkeeper',492,314,18,30),obj('table','table','Puzzle-box table',204,369,74,32),
    seat('seat','Gift-shop resting bench',66,402,96)
  ];
  layouts.dojo=[...common(),
    obj('dummy','dummy','Practice a combo',146,160,40,62),obj('upgrades','board','Fighter upgrades',458,160,42,40),
    obj('trainer','npc','Dojo trainer',314,264,18,30),
    obj('gearRack','rack','Training equipment rack',68,94,132,36,{service:'gear'}),
    obj('trainingMat','mat','Stretch on the training mat',250,126,138,78,{solid:false,service:'stretch'}),
    seat('seat','Dojo changing bench',76,366,150),obj('restCushion','cushion','Meditation cushion',432,354,34,24),
    obj('rules','board','Dojo rules & controls',478,300,56,38,{service:'info',description:'F punches. D kicks. A uses your signature special. Practice F, F, D at the wooden dummy; use the upgrade board before your next fight.'})
  ];
  layouts.onsen=[...common(),obj('bath','bath','Use the hot spring',176,132,288,100),
    obj('lockerLeft','locker','Changing-room cubbies',70,96,70,118,{service:'bag'}),
    obj('lockerRight','locker','Changing-room cubbies',504,96,64,118,{service:'bag'}),
    ...[206,276,346].flatMap((x,i)=>[obj('wash'+i,'basin','Wash before bathing '+(i+1),x,259,28,24,{service:'wash'}),obj('washSeat'+i,'stool','Bathing stool '+(i+1),x+3,304,22,18)]),
    obj('host','npc','Bath attendant',126,319,18,30),obj('towels','shelf','Towel shelf',438,323,126,36,{stock:['towel']}),
    seat('seat','Changing-room bench',74,390,150)
  ];
  layouts.inn=[...common(),obj('bed','bed','Rest at the ryokan',92,104,92,100),obj('bed2','bed','Second futon',454,104,92,100),
    obj('reception','counter','Ryokan reception desk',256,116,128,38,{service:'reception'}),obj('host','npc','Innkeeper',314,188,18,30),
    obj('table','table','Tea table',266,294,108,44),obj('cushion0','cushion','Tea-table floor cushion',216,306,30,22),obj('cushion1','cushion','Tea-table floor cushion',396,306,30,22),
    seat('seat','Ryokan entry bench',74,396,120),obj('luggage','rack','Check your travel bag',470,367,90,36,{service:'bag'})
  ];
  layouts.station=[...common(),obj('map','board','Town travel map',76,102,58,46),
    obj('ticketCounter','counter','Shuttle & information counter',252,106,140,36,{service:'travel'}),obj('host','npc','Station attendant',314,181,18,30),
    obj('timetable','board','Town shuttle timetable',462,100,96,42,{service:'info',description:'The fictional town shuttle is free. Ask at the counter for Shopping Street, Dojo & Onsen, Station & Inn, or Riverside Park. These are game stops, not real railway times.'}),
    obj('vendingInside','vending','Station drinks',526,212,26,46),
    seat('seat','Station waiting bench',96,290,166),seat('bench2','Station waiting bench',380,290,166),
    obj('luggage','rack','Luggage shelf · open your bag',76,378,86,32,{service:'bag'}),obj('table','table','Station waiting table',294,351,52,30)
  ];
  function objects(id){return (layouts[id]||common()).map(o=>({...o,stock:o.stock?[...o.stock]:undefined,access:o.access?o.access.map(p=>({...p})):undefined}));}
  const previous=A.prop,R=A.rect,T=A.text;
  function outline(c,x,y,w,h,fill){R(c,x,y,w,h,'#263a3e');R(c,x+1,y+1,w-2,h-2,fill);}
  function goods(c,x,y,w,stock){
    const cols=Math.max(1,Math.floor((w-8)/18));
    for(let i=0;i<cols;i++)A.itemIcon(c,stock[i%stock.length]||'water',x+5+i*18,y+1,.5);
  }
  A.prop=function(c,o,tick,state){
    const {x,y,w,h,type}=o,stock=o.stock||[];
    if(type==='aisle'){
      R(c,x+5,y+h-2,w,7,'#243c3d44');outline(c,x,y,w,h,'#6d6658');
      R(c,x+3,y+3,w-6,h-9,'#d0c6a4');R(c,x+w/2-2,y+7,4,h-17,'#8c8570');
      for(let yy=y+9;yy<y+h-12;yy+=22){goods(c,x-1,yy,w/2+1,stock);goods(c,x+w/2-1,yy,w/2+1,stock);R(c,x+2,yy+12,w-4,3,'#ece1c1');R(c,x+3,yy+15,w-6,1,'#b59e76');}
      R(c,x+2,y+h-9,w-4,7,'#9a8969');T(c,o.id==='shelf0'?'FOOD':o.id==='shelf1'?'SNACKS':'CUPS',x+w/2,y+h-3,'#f8edcb',6);
      return;
    }
    if(type==='fridge'){
      R(c,x+4,y+h-2,w,6,'#243c3d40');outline(c,x,y,w,h,'#cbd1c7');
      for(let xx=x+4;xx<x+w-6;xx+=35){outline(c,xx,y+5,32,h-12,'#7eaaa9');goods(c,xx,y+6,30,stock);goods(c,xx,y+19,30,stock);R(c,xx+3,y+6,1,h-17,'#e6f1d585');R(c,xx+28,y+15,2,8,'#e3e1cb');}
      R(c,x+3,y+2,w-6,2,'#fff0cc');R(c,x+5,y+h-5,w-10,2,'#627b7a');return;
    }
    if(type==='counter'||type==='display'){
      R(c,x+4,y+h-2,w,6,'#243c3d44');outline(c,x,y,w,h,'#6f5948');R(c,x+2,y+2,w-4,h-10,'#bfa077');R(c,x+3,y+3,w-6,2,'#eed2a0');
      if(stock.length){goods(c,x+8,y+6,w-16,stock);if(type==='display')goods(c,x+8,y+26,w-16,stock);}
      else{outline(c,x+w-33,y+6,22,13,'#8b9e99');R(c,x+w-30,y+8,16,7,'#3b6169');R(c,x+w-37,y+19,29,5,'#474f4c');R(c,x+10,y+8,19,12,'#ece3c6');R(c,x+13,y+11,11,1,'#737f73');}
      R(c,x+4,y+h-7,w-8,3,'#8b7052');return;
    }
    if(type==='stool'){
      R(c,x+4,y+9,3,h-8,'#4c4e48');R(c,x+w-7,y+9,3,h-8,'#4c4e48');outline(c,x,y,w,11,'#af7854');R(c,x+3,y+2,w-6,2,'#d4a276');return;
    }
    if(type==='cushion'){
      R(c,x+2,y+3,w,h,'#253d3b33');outline(c,x,y,w,h,'#687d80');R(c,x+3,y+3,w-6,h-6,'#91a09a');R(c,x+5,y+5,w-10,1,'#c0c4aa');R(c,x+w/2,y+h/2,2,2,'#657b78');return;
    }
    if(type==='locker'){
      outline(c,x,y,w,h,'#b19366');for(let yy=y+4;yy<y+h-8;yy+=36)for(let xx=x+4;xx<x+w-12;xx+=30){outline(c,xx,yy,26,30,'#8c7657');R(c,xx+3,yy+3,20,22,'#c1aa7e');R(c,xx+19,yy+14,2,4,'#5c665d');R(c,xx+8,yy+5,7,3,'#e5d7b6');}return;
    }
    if(type==='rack'){
      outline(c,x,y,w,h,'#715943');R(c,x+3,y+4,w-6,h-12,'#b8a07c');for(let xx=x+7;xx<x+w-8;xx+=20){outline(c,xx,y+7,15,18,['#566e69','#786275','#9d7855'][(Math.floor(xx/20))%3]);R(c,xx+4,y+6,7,2,'#d0c3a2');}R(c,x+3,y+h-7,w-6,3,'#d7ba84');return;
    }
    if(type==='basin'){
      outline(c,x,y+5,w,h-5,'#7c9e9a');R(c,x+4,y+8,w-8,h-12,'#cad8c6');R(c,x+w/2-2,y,4,8,'#adbaaf');R(c,x+w/2+2,y+3,6,3,'#adbaaf');R(c,x+w/2+5,y+6,2,4,'#7ab5c1');return;
    }
    if(type==='mat'){
      outline(c,x,y,w,h,'#60726a');R(c,x+3,y+3,w-6,h-6,'#a0aa80');R(c,x+w/2,y+4,2,h-8,'#788669');T(c,'STRETCH',x+w/2,y+h/2,'#4c6157',8);return;
    }
    previous(c,o,tick,state);
    if(type==='table'){
      const sample=state.room==='ramen'?'ramen':state.room==='soba'?'soba':state.room==='gifts'?'yosegi':state.room==='inn'?'cafe':state.room==='seven'?'bento':'water';
      A.itemIcon(c,sample,x+w/2-14,y+2,1);
      R(c,x+8,y+5,4,9,'#b98b58');R(c,x+8,y+2,1,7,'#e6c992');R(c,x+11,y+1,1,8,'#dec48e');R(c,x+w-17,y+5,7,6,'#f0d5a1');R(c,x+w-16,y+4,5,2,'#81574a');
    }
  };
  window.HakoneInteriors={objects,roomIds:Object.keys(layouts),version:'furnished-01'};
})();
