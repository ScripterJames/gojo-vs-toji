/* One reach/selection rule for keyboard, pointer and touch.
   Distance is to an object's usable edge, not its arbitrary centre.
   Doorways remain front-only; intervening furniture blocks reach. */
window.HakoneInteractions = (() => {
  'use strict';
  const reach=42;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const facing={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};
  function point(player,o) {
    if(o.type==='building')return o.anchor||{x:o.x+o.w/2,y:o.y+o.h+10};
    if(o.access)return {x:o.access.x,y:o.access.y};
    // Reach the nearest surface from either end/side of a long aisle or bench.
    const p={x:clamp(player.x,o.x,o.x+o.w),y:clamp(player.y-4,o.y,o.y+o.h)};
    return p;
  }
  function occluded(player,p,target,objects) {
    const sx=player.x,sy=player.y-4,dx=p.x-sx,dy=p.y-sy;
    const steps=Math.max(1,Math.ceil(Math.hypot(dx,dy)/3));
    for(let n=1;n<steps;n++) {
      const x=sx+dx*n/steps,y=sy+dy*n/steps;
      if(objects.some(o=>o.id!==target.id&&o.solid!==false&&o.type!=='npc'&&
        x>o.x+1&&x<o.x+o.w-1&&y>o.y+1&&y<o.y+o.h-1))return true;
    }
    return false;
  }
  function candidate(player,o,objects) {
    if(o.interactive===false)return null;
    const p=point(player,o),dx=p.x-player.x,dy=p.y-(player.y-4),distance=Math.hypot(dx,dy);
    if(distance>reach||occluded(player,p,o,objects))return null;
    if(o.type==='building'&&player.y<o.y+o.h-3)return null;
    const dir=facing[player.dir]||facing.down;
    const dot=distance>0?(dx*dir[0]+dy*dir[1])/distance:1;
    const priority=o.type==='mat'?35:o.type==='sign'?4:0;
    return {object:o,point:p,distance,score:distance+(1-dot)*9+priority};
  }
  function nearby(player,objects) {
    return objects.map(o=>candidate(player,o,objects)).filter(Boolean)
      .sort((a,b)=>a.score-b.score||a.object.id.localeCompare(b.object.id));
  }
  function select(player,objects,preferredId=null) {
    const choices=nearby(player,objects);
    return choices.find(c=>c.object.id===preferredId)||choices[0]||null;
  }
  function canReach(player,o,objects) {return !!o&&!!candidate(player,o,objects);}
  function hitTest(o,x,y) {
    const margin=o.type==='building'?4:5;
    return x>=o.x-margin&&x<=o.x+o.w+margin&&y>=o.y-margin&&y<=o.y+o.h+margin;
  }
  return Object.freeze({reach,point,nearby,select,canReach,hitTest});
})();
