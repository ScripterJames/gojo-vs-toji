/* Real-world product references are in docs/HAKONE_DEVELOPMENT.md. Prices and effects are fictional. */
window.HakoneData = (() => {
  'use strict';
  const items = {
    water: ['Mineral water',5,0,28,'bottle','A cool bottle for your walk.'],
    iyemon: ['Iyemon green tea',7,0,35,'bottle','Unsweetened green tea, served cold.'],
    boss: ['BOSS canned coffee',8,2,40,'can','A small warm can from the hot-drink row.'],
    oolong: ['Oolong tea',6,0,30,'bottle','A refreshing bottled tea.'],
    pocari: ['Pocari Sweat',9,0,45,'bottle','A familiar blue-and-white sports drink.'],
    onigiri: ['Tuna-mayo onigiri',10,28,10,'food','A rice triangle wrapped in nori.'],
    salmon: ['Salmon onigiri',11,30,10,'food','A savory salmon rice ball.'],
    egg: ['Egg salad sandwich',14,35,15,'food','Soft bread with a creamy egg filling.'],
    chicken: ['Nanachiki chicken',15,38,8,'food','A hot-counter fried chicken snack.'],
    bun: ['Steamed pork bun',12,30,10,'food','A warm nikuman from the steamer.'],
    oden: ['Oden cup',18,42,14,'food','Daikon, egg and other pieces in warm broth.'],
    bento: ['Bento lunch box',22,48,12,'bento','Use the microwave for a warm meal.'],
    warmBento: ['Warm bento',0,58,22,'food','Ready to eat, with disposable chopsticks.'],
    smoothieCup: ['Frozen smoothie cup',13,0,0,'blend','Take it to the smoothie machine after buying.'],
    smoothie: ['Fresh fruit smoothie',0,15,48,'drink','Your cup, blended in the shop machine.'],
    cafeCup: ['SEVEN CAFE cup',8,0,0,'brew','Buy this cup, then use the coffee machine.'],
    cafe: ['Fresh cafe coffee',0,2,42,'drink','Freshly brewed for your stroll.'],
    melonpan: ['Melon pan',10,26,16,'food','A sweet bread with a patterned crust.'],
    ramen: ['Shoyu ramen',26,65,20,'food','A bowl of noodles with savory broth.'],
    curry: ['Japanese curry rice',25,65,16,'food','Rice with a comforting curry sauce.'],
    soba: ['Zaru soba',23,55,22,'food','Buckwheat noodles with a dipping sauce.'],
    udon: ['Hot udon',22,55,20,'food','Thick noodles in a warm broth.'],
    manju: ['Onsen manju',9,20,12,'food','A sweet bean-filled hot-spring-town bun.'],
    castella: ['Castella-style Hakone manju',12,25,16,'food','A cake-like little bun inspired by Hakone sweets.'],
    towel: ['Onsen towel',18,0,0,'gear','Keep it: hot-spring visits cost less with your own towel.'],
    umbrella: ['Clear umbrella',25,0,0,'gear','Equip it from your bag to stay comfortable in the rain.'],
    postcard: ['Hakone postcard',6,0,0,'post','Write it at the postbox and keep a travel memory.'],
    yosegi: ['Yosegi-style puzzle box',40,0,0,'puzzle','A little wood-pattern box. Open it from your bag.']
  };
  const shops = {
    seven: {name:'7-Eleven',sign:'7-ELEVEN',color:'#f5ead5',roof:'#3d6957',stock:['onigiri','salmon','egg','chicken','bun','oden','bento','melonpan','smoothieCup','cafeCup','umbrella'],desc:'Your neighborhood convenience store. Buy food, warm a bento, blend a smoothie or brew a coffee.'},
    ramen: {name:'Lantern Ramen',sign:'RAMEN',color:'#caad83',roof:'#9a4b44',stock:['ramen','curry','oolong'],desc:'A fictional family restaurant serving ramen and curry.'},
    soba: {name:'River Soba House',sign:'SOBA',color:'#c2ba98',roof:'#596576',stock:['soba','udon','iyemon'],desc:'Sit down beside the river for noodles and tea.'},
    gifts: {name:'Hakone Sweet & Craft',sign:'SWEETS / GIFTS',color:'#d5b486',roof:'#6b5a70',stock:['manju','castella','postcard','yosegi','towel'],desc:'Local-sweet and woodcraft inspiration, in a fictional souvenir shop.'},
    dojo: {name:'Mountain Dojo',sign:'DOJO',color:'#c5aa80',roof:'#575d70',stock:[],desc:'Train, improve your fighter, or enter the arena. You can always leave a fight.'},
    onsen: {name:'Cedar Hot Spring',sign:'ONSEN',color:'#c4ab87',roof:'#76534c',stock:[],desc:'A peaceful hot spring. Bring a towel for a reduced game fee.'},
    inn: {name:'Maple Ryokan',sign:'RYOKAN',color:'#c9b795',roof:'#664d68',stock:[],desc:'Rest at the inn, talk to the host, or deliver a parcel.'},
    station: {name:'Hakone Town Station',sign:'HAKONE',color:'#b9c1b4',roof:'#4f646c',stock:[],desc:'A fictional station hub. Read the map, collect a stamp or travel across town.'}
  };
  const buildings = [
    ['seven',72,80,160,112],['ramen',296,80,144,112],
    ['soba',72,368,160,112],['gifts',296,368,144,112],
    ['dojo',736,80,176,128],['onsen',992,80,176,128],
    ['inn',736,368,176,112],['station',992,368,176,112]
  ].map(([id,x,y,w,h])=>({id,type:'building',x,y,w,h,name:shops[id].name,solid:true,anchor:{x:x+w/2,y:y+h+15}}));
  const props = [
    ['vending1','vending','Cold drinks',252,159,24,43],
    ['vending2','vending','Hot & cold drinks',688,218,24,43],
    ['bench1','bench','Riverside bench',400,286,48,20],
    ['bench2','bench','Dojo bench',752,281,48,20],
    ['bench3','bench','Park bench',1040,594,48,20],
    ['bin1','recycle','Bottle & can recycling',280,180,17,22],
    ['bin2','recycle','Recycling station',720,240,17,22],
    ['postbox','postbox','Red postbox',954,460,22,32],
    ['board','board','Town noticeboard',296,270,34,33],
    ['fountain','fountain','Drinking-water tap',112,600,28,30],
    ['shrine','shrine','Small hillside shrine',1100,640,64,42],
    ['bus','bus','Town shuttle stop',940,249,24,39],
    ['bridge1','bridge','River bridge',586,250,92,1],
    ['bridge2','bridge','South bridge',586,538,92,1],
    ['map','sign','Walking map',484,221,24,30],
    ['tourist','npc','Mika the traveler',354,258,18,30],
    ['gardener','npc','Ren the gardener',843,592,18,30],
    ['cat','cat','Sleepy town cat',480,588,22,14],
    ['lamp1','lamp','Street lantern',60,242,13,45],
    ['lamp2','lamp','Street lantern',708,509,13,45],
    ['lamp3','lamp','Street lantern',1218,242,13,45]
  ].map(([id,type,name,x,y,w,h])=>({id,type,name,x,y,w,h,solid:!['bridge','npc','cat'].includes(type)}));
  for(let i=0;i<18;i++){
    let x=i<9?48+i*144:48+(i-9)*144;
    // Keep the two river-column trees on the east bank so they can be approached.
    if(x>560&&x<684)x=696;
    const y=i<9?34:724;
    props.push({id:'tree'+i,type:'tree',name:i%3?'Cedar tree':'Maple tree',x,y,w:32,h:44,solid:true,collision:{x:x+12,y:y+27,w:10,h:17}});
  }
  for(const [i,x,y] of [[0,512,351],[1,704,358],[2,256,586],[3,952,594]]) props.push({id:'rock'+i,type:'rock',name:'River stone',x,y,w:25,h:18,solid:true});
  const sources = [
    ['7-Eleven Japan: products and in-store services','https://www.sej.co.jp/in/en.html'],
    ['7-Eleven Japan: product categories','https://www.sej.co.jp/products.html'],
    ['7-Eleven Japan: smoothie instructions','https://www.sej.co.jp/products/smoothie.html'],
    ['Suntory: drinks and vending machines','https://www.suntory.co.jp/softdrink/jihanki/'],
    ['Otsuka: Pocari Sweat','https://www.otsuka.co.jp/en/nutraceutical/products/pocarisweat/'],
    ['Hakone Navi: sweets and woodcraft shopping','https://www.hakonenavi.jp/international/en/interest/shopping'],
    ['Hakone Navi: castella-yaki manju','https://www.hakonenavi.jp/international/en/spot/435'],
    ['SLYNYRD: top-down pixel-art tiles','https://www.slynyrd.com/blog/2019/8/27/pixelblog-20-top-down-tiles'],
    ['SLYNYRD: objects and shadows','https://www.slynyrd.com/blog/2019/9/18/pixelblog-21-top-down-objects'],
    ['SLYNYRD: interiors','https://www.slynyrd.com/blog/2021/11/30/pixelblog-35-top-down-interiors'],
    ['SLYNYRD: character animation','https://www.slynyrd.com/blog/2025/3/24/pixelblog-55-top-down-character-animation'],
    ['SLYNYRD: anime faces and hair (reference only)','https://www.slynyrd.com/blog/2020/7/28/pixelblog-29-anime-faces-and-hair'],
    ['SLYNYRD: grounded fighting stance (reference only)','https://www.slynyrd.com/blog/2024/9/26/pixelblog-52-idle-fighting-stance'],
    ['SLYNYRD: punches and kicks (reference only)','https://www.slynyrd.com/blog/2024/11/25/pixelblog-53-punches-and-kicks']
  ];
  return {items,shops,buildings,props,sources,width:1280,height:800};
})();
