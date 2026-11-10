/* Shared interaction geometry: prompts, keyboard, pointer and walking use the
   same access points and collision checks. No remote actions through walls. */
window.HakoneInteraction=(()=>{
  'use strict';
  const RANGE=42,STEP=8;
  const sq=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  function points(o){
    if(o.access?.length)return o.access.map(p=>({...p}));
    if(o.anchor)return [{...o.anchor}];
    if(o.type==='exit')return [{x:o.x+o.w/2,y:o.y-12}];
    if(o.type==='mat'||o.type==='bridge')return [{x:o.x+o.w/2,y:o.y+o.h/2}];
    const p=[],xs=Math.max(1,Math.ceil(o.w/28)),ys=Math.max(1,Math.ceil(o.h/28));
    for(let i=0;i<=xs;i++){const x=o.x+6+(o.w-12)*i/xs;p.push({x,y:o.y-9},{x,y:o.y+o.h+12});}
    for(let i=0;i<=ys;i++){const y=o.y+5+(o.h-5)*i/ys;p.push({x:o.x-12,y},{x:o.x+o.w+12,y});}
    return p;
  }
  function line(a,b,blocked){
    const n=Math.max(1,Math.ceil(sq(a,b)/3));
    for(let i=1;i<=n;i++)if(blocked(a.x+(b.x-a.x)*i/n,a.y+(b.y-a.y)*i/n))return false;
    return true;
  }
  function access(o,blocked){return points(o).filter(p=>!blocked(p.x,p.y));}
  function target(o,s,blocked){
    let best=null;
    for(const p of access(o,blocked)){const d=sq(p,s);if(d<=RANGE&&(!best||d<best.distance)&&line(s,p,blocked))best={o,point:p,distance:d};}
    return best;
  }
  function nearby(list,s,blocked){
    const facing={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]}[s.dir]||[0,1];
    return list.map(o=>target(o,s,blocked)).filter(Boolean).map(t=>{
      const dx=t.point.x-s.x,dy=t.point.y-s.y,d=Math.hypot(dx,dy)||1;
      return {...t,score:t.distance-8*(dx*facing[0]+dy*facing[1])/d};
    }).sort((a,b)=>a.score-b.score||a.o.id.localeCompare(b.o.id));
  }
  function pick(list,x,y){
    return [...list].sort((a,b)=>b.y+b.h-a.y-a.h).find(o=>x>=o.x-3&&x<=o.x+o.w+3&&y>=o.y-3&&y<=o.y+o.h+3)||null;
  }
  function plan(s,o,blocked,width,height){
    if(target(o,s,blocked))return [];
    const cols=Math.ceil(width/STEP)+1,rows=Math.ceil(height/STEP)+1,total=cols*rows;
    const id=(x,y)=>y*cols+x,coord=i=>({x:(i%cols)*STEP,y:Math.floor(i/cols)*STEP});
    const free=new Int8Array(total); // 0 unknown, 1 clear, -1 blocked
    function clear(x,y){if(x<0||y<0||x>=cols||y>=rows)return false;const i=id(x,y);if(!free[i])free[i]=blocked(x*STEP,y*STEP)?-1:1;return free[i]===1;}
    const goals=new Set();
    for(const p of access(o,blocked)){
      const gx=Math.round(p.x/STEP),gy=Math.round(p.y/STEP);
      for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){
        const x=gx+dx,y=gy+dy,q={x:x*STEP,y:y*STEP};
        if(clear(x,y)&&sq(q,p)<=22&&line(q,p,blocked))goals.add(id(x,y));
      }
    }
    if(!goals.size)return null;
    const sx=Math.round(s.x/STEP),sy=Math.round(s.y/STEP),starts=[];
    for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)if(clear(sx+dx,sy+dy)){
      const i=id(sx+dx,sy+dy),p=coord(i);if(line(s,p,blocked))starts.push({i,d:sq(s,p)});
    }
    starts.sort((a,b)=>a.d-b.d);if(!starts.length)return null;
    const prev=new Int32Array(total);prev.fill(-2);
    const queue=new Int32Array(total);let head=0,tail=0,end=-1;
    // Only nearest connected seed: subsequent nodes form a real navigable route.
    const start=starts[0].i;queue[tail++]=start;prev[start]=-1;
    while(head<tail){const cur=queue[head++];if(goals.has(cur)){end=cur;break;}
      const x=cur%cols,y=Math.floor(cur/cols);
      for(const [dx,dy]of [[1,0],[0,1],[-1,0],[0,-1]]){
        const xx=x+dx,yy=y+dy;if(!clear(xx,yy))continue;const n=id(xx,yy);
        if(prev[n]!==-2||!line(coord(cur),coord(n),blocked))continue;
        prev[n]=cur;queue[tail++]=n;
      }
    }
    if(end<0)return null;
    const route=[];for(let cur=end;cur>=0;cur=prev[cur])route.push(coord(cur));route.reverse();
    // Collapse straight runs, preserving every corner and the final approach.
    return route.filter((p,i)=>i===0||i===route.length-1||
      (p.x-route[i-1].x)*(route[i+1].y-p.y)!==(p.y-route[i-1].y)*(route[i+1].x-p.x));
  }
  return {range:RANGE,points,access,target,nearby,pick,plan,line};
})();
