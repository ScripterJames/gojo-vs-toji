/* Hakone scenery pass: quiet 16px clusters, short shadows and layered water.
   Original art. References: SLYNYRD Pixelblogs 20, 21, 43; Saint11 Consistency.
   Rendering only: no added objects, collisions, inventory or state changes. */
(() => {
  'use strict';
  const A=window.HakoneArt,D=window.HakoneData;if(!A||!D)return;
  const base={ground:A.ground,prop:A.prop,building:A.building};
  const roads=[[32,216,1216,80],[32,504,1216,80],[236,64,52,644],[924,64,52,644],[104,592,1056,80]];
  const inRoad=(x,y)=>roads.some(([a,b,w,h])=>x>=a&&x<a+w&&y>=b&&y<b+h);
  const hash=(x,y)=>((Math.imul(x+17,18331)^Math.imul(y+53,7387))>>>0);
  const r=(c,x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),w,h);};
  let land=null;
  const trees=new Map();
  function groundLayer(){
    if(land)return land;
    land=document.createElement('canvas');land.width=D.width;land.height=D.height;
    const c=land.getContext('2d');base.ground(c,null,0);
    for(let y=64;y<D.height-16;y+=16)for(let x=32;x<D.width-16;x+=16){
      if(x>563&&x<690)continue;
      const n=hash(x,y);
      if(inRoad(x,y)&&inRoad(x+15,y+15)){
        // Low contrast broken pavers: retain quiet spaces and readable travelers.
        if(n%7===0){r(c,x+2,y+3,12,1,'#c9b990');r(c,x+2,y+4,1,9,'#c3b28c');r(c,x+3,y+13,11,1,'#ad9c78');}
        if(n%9===0)r(c,x+7,y+8,3,1,'#a99473');
      }else if(!inRoad(x+8,y+8)&&n%13===0){
        r(c,x+3,y+5,8,2,'#5b7656');r(c,x+5,y+3,3,6,'#627f59');
        if(n%3===0){r(c,x+12,y+11,2,1,'#ad9c69');r(c,x+11,y+10,1,2,'#7f8b5e');}
      }
    }
    // A thin grass-to-path transition along the UNION of paths, not crossroad seams.
    for(let y=64;y<704;y+=8)for(let x=32;x<1248;x+=8){
      if(x>=568&&x<=688||!inRoad(x+4,y+4))continue;
      if(!inRoad(x+4,y-1)){r(c,x,y,8,2,'#8e926e');r(c,x+hash(x,y)%5,y,3,1,'#6e845b');}
      if(!inRoad(x+4,y+8))r(c,x,y+6,8,2,'#8c9069');
    }
    // Soft, short foundations attach houses to their paths; never alter access points.
    for(const o of D.buildings){r(c,o.x+8,o.y+o.h-4,o.w,13,'#2a3b3822');r(c,o.x+o.w/2-20,o.y+o.h+4,40,4,'#bba785');}
    return land;
  }
  function river(c,tick){
    c.save();c.beginPath();c.rect(583,0,90,218);c.rect(583,294,90,212);c.rect(583,582,90,D.height-582);c.clip();
    r(c,583,0,90,D.height,'#365f6d');r(c,583,0,6,D.height,'#2a4d5a');r(c,665,0,8,D.height,'#2a4d5a');
    const phase=Math.floor(tick/16)%4;
    for(let y=-16;y<D.height+16;y+=24)for(let x=595;x<663;x+=24){
      const n=hash(x,y),dx=(n%5)-2,dy=(phase+Math.floor(n/5)%4)%4;
      r(c,x+dx,y+dy*2,11,1,'#527b85');r(c,x+dx+8,y+dy*2+1,7,1,'#527b85');
      if(n%4===0){r(c,x+dx+3,y+dy*2-1,5,1,'#80aaa5');r(c,x+dx+5,y+dy*2+3,9,1,'#305563');}
    }
    c.restore();
  }
  A.ground=(c,inside,tick)=>{if(inside)return base.ground(c,inside,tick);c.drawImage(groundLayer(),0,0);river(c,tick);};
  function treeImage(maple){
    if(trees.has(maple))return trees.get(maple);
    const cv=document.createElement('canvas');cv.width=38;cv.height=48;const c=cv.getContext('2d');
    r(c,7,40,26,5,'#203d3444');r(c,15,25,7,19,'#624c40');r(c,16,28,2,14,'#a27b51');r(c,17,30,2,5,'#c09a61');
    if(maple){
      const dark='#815e45',mid='#b17a4a',lit='#d3a15b';
      r(c,10,2,18,28,dark);r(c,3,9,31,20,dark);r(c,6,6,25,21,mid);r(c,1,14,32,11,mid);
      r(c,9,4,17,6,lit);r(c,5,10,10,6,lit);r(c,17,12,10,5,'#c39352');r(c,9,21,12,5,'#966841');
      r(c,24,7,5,3,'#dfb36e');r(c,30,18,3,4,'#ca9150');
    }else{
      const dark='#294d45',mid='#426852',lit='#648363';
      for(const [x,y,w,h] of [[16,1,5,8],[12,7,13,8],[8,13,21,8],[4,20,29,8],[2,27,33,7]]){
        r(c,x,y,w,h,dark);r(c,x+2,y+1,w-4,3,mid);r(c,x+3,y+1,Math.max(2,Math.floor(w*.38)),2,lit);
      }
      r(c,12,31,14,3,'#375a49');
    }
    trees.set(maple,cv);return cv;
  }
  A.prop=(c,o,tick,state)=>{
    if(o.type!=='tree')return base.prop(c,o,tick,state);
    c.drawImage(treeImage(o.name.includes('Maple')),Math.round(o.x-2),Math.round(o.y));
  };
  window.HakoneSceneArt={version:1,cacheInfo:()=>({ground:!!land,trees:trees.size})};
  const url='https://www.slynyrd.com/blog/2023/3/26/pixelblog-43-top-down-tiles-part-2';
  if(!D.sources.some(s=>s[1]===url))D.sources.push(['SLYNYRD: layered terrain, subtle shadows and animated water',url]);
})();
