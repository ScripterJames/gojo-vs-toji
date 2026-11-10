/* Original, cached 100x80 pixel frames for the fifteen expansion fighters.
   Reference study: SLYNYRD Pixelblogs 29, 52 and 53 (see docs/HAKONE_INTERACTIONS_GROUNDING.md).
   No downloaded fan-art pixels or paid assets are redistributed.
   Sole anchor is explicit: transparent padding NEVER determines floor position. */
(() => {
  'use strict';
  const W=100,H=80,SCALE=2,PIVOT=34,SOLE=74,FLOOR=450;
  const catalog={
    'The Strongest of History':{hair:'#e99b91',hs:'#a64860',skin:'#e2b294',shade:'#aa6d65',top:'#4b2439',light:'#9b4358',pants:'#e4d7bd',pl:'#bca68e',shoe:'#342438',ink:'#301d31',accent:'#f5cc73',kind:'sovereign'},
    Hakari:{hair:'#e4cf95',hs:'#a88955',skin:'#c98f72',shade:'#96614f',top:'#426c57',light:'#76957a',pants:'#49435e',pl:'#72647f',shoe:'#282937',ink:'#202436',accent:'#f2ce69',kind:'jacket'},
    Sukuna:{hair:'#df91a0',hs:'#a85575',skin:'#e0ae95',shade:'#b57871',top:'#ddd6c9',light:'#fff0dc',pants:'#524257',pl:'#7c6077',shoe:'#282837',ink:'#342334',accent:'#f47797',kind:'robe'},
    Megumi:{hair:'#182237',hs:'#3d4e64',skin:'#dfb49a',shade:'#ad7d72',top:'#25364f',light:'#526780',pants:'#243147',pl:'#43546b',shoe:'#272632',ink:'#172233',accent:'#b1c2ed',kind:'uniform'},
    Yuji:{hair:'#e49a9c',hs:'#a85a71',skin:'#e7b297',shade:'#b97f70',top:'#25364e',light:'#4b617e',pants:'#29394d',pl:'#4c5d76',shoe:'#a6434f',ink:'#202638',accent:'#c95165',kind:'hoodie'},
    Nobara:{hair:'#b56d3d',hs:'#7b4431',skin:'#edbea1',shade:'#bc8975',top:'#2d405b',light:'#536d86',pants:'#28374e',pl:'#52617a',shoe:'#784637',ink:'#222b3d',accent:'#e7b875',kind:'skirt'},
    Maki:{hair:'#264b48',hs:'#173239',skin:'#dfb193',shade:'#ac7c65',top:'#353d5a',light:'#646881',pants:'#2c334b',pl:'#515a70',shoe:'#293344',ink:'#1d2b36',accent:'#c6d09b',kind:'skirt'},
    Toge:{hair:'#dce3d5',hs:'#97a99e',skin:'#deb79f',shade:'#b28b7a',top:'#354b65',light:'#6c879b',pants:'#2c3a50',pl:'#52657c',shoe:'#282d3b',ink:'#1b2a3e',accent:'#b4d7d6',kind:'collar'},
    Panda:{hair:'#f1ead6',hs:'#bbc6bf',skin:'#eee5d3',shade:'#b5bcb5',top:'#e9e2d0',light:'#fff6e1',pants:'#333742',pl:'#535a64',shoe:'#242e3c',ink:'#242c3c',accent:'#e3bc77',kind:'panda'},
    Nanami:{hair:'#e4c17c',hs:'#a47c4d',skin:'#e0b192',shade:'#b4856c',top:'#baaa85',light:'#e1d4ac',pants:'#ad9d7e',pl:'#cfbf9d',shoe:'#514032',ink:'#2b3341',accent:'#e1b866',kind:'suit'},
    Yuta:{hair:'#222b3a',hs:'#4b5262',skin:'#e4bca2',shade:'#b28a7b',top:'#dedfd8',light:'#fff4e6',pants:'#273449',pl:'#4c5c74',shoe:'#d4d9d2',ink:'#222b3d',accent:'#afa3df',kind:'white'},
    Choso:{hair:'#272532',hs:'#4c424a',skin:'#d8ad98',shade:'#aa7b70',top:'#d4d2c8',light:'#f4e8d9',pants:'#473445',pl:'#715367',shoe:'#342a38',ink:'#2b2535',accent:'#b74b65',kind:'choso'},
    Todo:{hair:'#242b38',hs:'#4a4652',skin:'#c68f71',shade:'#915f50',top:'#c68f71',light:'#dfa888',pants:'#55415e',pl:'#806280',shoe:'#352b38',ink:'#2b2938',accent:'#d4a4ea',kind:'muscle'},
    Jogo:{hair:'#9c5741',hs:'#623c3e',skin:'#d2bda0',shade:'#a88874',top:'#34343b',light:'#5c5b5c',pants:'#2b2f39',pl:'#4b4a53',shoe:'#392d32',ink:'#292635',accent:'#eab15e',kind:'jogo'},
    Mahito:{hair:'#a6c8d4',hs:'#64879d',skin:'#d5bba9',shade:'#9e8585',top:'#2b3345',light:'#506279',pants:'#34394f',pl:'#59617c',shoe:'#282b3d',ink:'#222a3a',accent:'#b3a5dd',kind:'patch'}
  };
  const clips={idle:{count:8,step:7,loop:true},walk:{count:6,step:5,loop:true},jump:{count:2,step:7,loop:false},fall:{count:2,step:7,loop:false},punch:{count:6,step:2,loop:false},kick:{count:6,step:3,loop:false},special:{count:4,step:5,loop:true},hurt:{count:2,step:4,loop:false},defeated:{count:1,step:1,loop:false}};
  const cache=new Map();
  function pose(f,tick){
    let key='idle',elapsed=tick;
    if(f.hp<=0){key='defeated';elapsed=0;}
    else if(f.attack>0&&['punch','kick'].includes(f.attackKind)){key=f.attackKind;elapsed=(key==='punch'?12:18)-f.attack;}
    else if(f.judgment>0||f.cleave>0||f.blackFlash>0||f.sweep>0||f.speech>0||f.stomp>0||f.ratio>0||f.pierce>0||f.boogie>0||f.ember>0||f.transfigure>0||f.newSpecialFlash>0){key='special';}
    else if(f.flash>0&&f.invul===0){key='hurt';elapsed=Math.max(0,9-f.flash);}
    else if(f.y+f.h<FLOOR-1){key=f.vy<0?'jump':'fall';elapsed=Math.abs(f.vy)>7?0:7;}
    else if(Math.abs(f.vx)>0.9){key='walk';}
    const c=clips[key],phase=Math.max(0,Math.floor(elapsed/c.step));
    return {key,index:c.loop?phase%c.count:Math.min(c.count-1,phase)};
  }
  function sprite(name,key,index){
    const p=catalog[name];if(!p)return null;
    const spec=clips[key]||clips.idle,i=((index%spec.count)+spec.count)%spec.count,ck=name+':'+key+':'+i;
    if(cache.has(ck))return cache.get(ck);
    const cv=document.createElement('canvas');cv.width=W;cv.height=H;
    const c=cv.getContext('2d');c.imageSmoothingEnabled=false;
    const R=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
    // Integer scan-converted polygons and Bresenham contours: no blurred edges.
    function L(x0,y0,x1,y1,col){x0=Math.round(x0);y0=Math.round(y0);x1=Math.round(x1);y1=Math.round(y1);const dx=Math.abs(x1-x0),sx=x0<x1?1:-1,dy=-Math.abs(y1-y0),sy=y0<y1?1:-1;let err=dx+dy;for(let n=0;n<256;n++){R(x0,y0,1,1,col);if(x0===x1&&y0===y1)break;const e=err*2;if(e>=dy){err+=dy;x0+=sx;}if(e<=dx){err+=dx;y0+=sy;}}}
    function P(points,col,outline){const ps=points.map(([x,y])=>[Math.round(x),Math.round(y)]),ys=ps.map(v=>v[1]);for(let y=Math.max(0,Math.min(...ys));y<=Math.min(H-1,Math.max(...ys));y++){const xs=[];for(let k=0;k<ps.length;k++){const a=ps[k],b=ps[(k+1)%ps.length];if((a[1]<=y&&b[1]>y)||(b[1]<=y&&a[1]>y))xs.push(a[0]+(y-a[1])*(b[0]-a[0])/(b[1]-a[1]));}xs.sort((a,b)=>a-b);for(let k=0;k+1<xs.length;k+=2)R(Math.ceil(xs[k]),y,Math.floor(xs[k+1])-Math.ceil(xs[k])+1,1,col);}if(outline)ps.forEach((a,k)=>L(...a,...ps[(k+1)%ps.length],outline));}
    function segment(a,b,wa,wb,fill,hi){const dx=b[0]-a[0],dy=b[1]-a[1],n=Math.hypot(dx,dy)||1,nx=-dy/n,ny=dx/n;P([[a[0]+nx*wa/2,a[1]+ny*wa/2],[b[0]+nx*wb/2,b[1]+ny*wb/2],[b[0]-nx*wb/2,b[1]-ny*wb/2],[a[0]-nx*wa/2,a[1]-ny*wa/2]],fill,p.ink);if(hi)L(a[0]-1,a[1],b[0]-1,b[1]-1,hi);}
    function shoe(x,y,front){P([[x-4,y-4],[x+3,y-4],[x+5,y-2],[x+9,y-1],[x+9,y+1],[x-5,y+1]],p.shoe,p.ink);R(x-3,y-3,5,1,front?p.pl:p.light);R(x-4,y+1,13,1,p.ink);}
    const isPanda=p.kind==='panda',muscle=p.kind==='muscle'||p.kind==='sovereign',stocky=p.kind==='jogo';
    const bulk=isPanda?6:muscle?3:stocky?1:0;
    let bob=key==='idle'?[0,0,-1,-1,0,1,1,0][i]:key==='walk'?[0,-1,0,0,-1,0][i]:0;
    let lean=key==='punch'?[0,-2,1,5,5,1][i]:key==='kick'?[0,-1,-3,-4,-4,-1][i]:key==='hurt'?-4:key==='idle'?[0,1,1,0,0,-1,-1,0][i]:0;
    const cx=32+lean,hip=[cx,48+bob],neck=[cx+5,26+bob];
    let back=[17,72],front=[43,72],bk=[23,60+bob],fk=[42,59+bob];
    if(key==='walk'){const step=[-4,0,5,5,0,-4][i];back=[17+step,72-([0,3,1,0,0,0][i])];front=[43-step,72-([0,0,0,0,3,1][i])];bk=[24+step*.4,60+bob];fk=[39-step*.4,59+bob];}
    if(key==='kick'){const ext=[0,.1,.55,1,1,.2][i];back=[22,72];bk=[24,59];fk=[cx+8+ext*14,57-ext*16];front=[43+ext*37,72-ext*34];}
    if(key==='jump'){back=[18,62];front=[48,65];bk=[16,50];fk=[45,52];}
    if(key==='fall'){back=[22,68];front=[45,69];bk=[22,57];fk=[42,58];}
    if(key==='defeated'){
      P([[13,60],[51,59],[62,65],[63,72],[13,73],[5,69]],p.top,p.ink);R(16,64,27,4,p.light);
      P([[55,60],[66,59],[73,63],[73,70],[63,73],[56,68]],p.skin,p.ink);P([[55,61],[58,57],[68,58],[73,61],[74,66],[69,63],[62,62]],p.hair,p.ink);shoe(11,72,false);R(25,70,29,3,p.pants);
      cache.set(ck,cv);return cv;
    }
    // Back leg, then front leg: feet never bob with the torso while planted.
    segment([hip[0]-5,hip[1]-1],bk,10+bulk,8+bulk,p.pants,p.pl);segment(bk,[back[0],back[1]-3],8+bulk,6+bulk,p.pants,p.pl);shoe(...back,false);
    segment([hip[0]+5,hip[1]],fk,11+bulk,8+bulk,p.pants,p.pl);segment(fk,[front[0],front[1]-3],8+bulk,6+bulk,p.pants,p.pl);shoe(...front,true);
    if(p.kind==='skirt'){
      P([[cx-8,45+bob],[cx+8,45+bob],[cx+11,55+bob],[cx-10,55+bob]],p.top,p.ink);L(cx-5,48+bob,cx-6,54+bob,p.light);L(cx+3,48+bob,cx+5,54+bob,p.light);
    }
    const shoulder=[cx+8+bulk*.5,31+bob],backShoulder=[cx-7-bulk*.5,31+bob];
    segment(backShoulder,[cx-12-bulk,43+bob],9+bulk,7,p.top,p.light);
    segment([cx-12-bulk,43+bob],[cx+1,34+bob],7,6,isPanda?p.pants:p.skin,isPanda?p.pl:p.shade);
    P([[cx-2,30+bob],[cx+4,30+bob],[cx+5,34+bob],[cx+2,37+bob],[cx-3,35+bob]],isPanda?p.pants:p.skin,p.ink);
    // Tapered chest and hips. Bright cloth planes, seams and restrained folds.
    P([[cx-9-bulk,28+bob],[cx+7+bulk,28+bob],[cx+12+bulk,35+bob],[cx+8+bulk,45+bob],[cx+8,49+bob],[cx-7,49+bob],[cx-10-bulk,40+bob]],p.top,p.ink);
    P([[cx-7-bulk,30+bob],[cx-3,30+bob],[cx-5,43+bob],[cx-6,47+bob],[cx-8,42+bob]],p.light);
    L(cx+5,37+bob,cx+7,43+bob,p.light);L(cx+6,43+bob,cx+2,46+bob,p.ink);R(cx-6,47+bob,13,2,p.pants);
    if(p.kind==='jacket'){P([[cx-2,29+bob],[cx+5,29+bob],[cx+5,47+bob],[cx-3,47+bob]],'#262e3a');R(cx-7,28+bob,17,3,'#bdb68e');L(cx-3,32+bob,cx-3,45+bob,'#e0d6a7');R(cx-6,39+bob,3,2,p.ink);}
    if(p.kind==='hoodie'){P([[cx-8,28+bob],[cx+8,27+bob],[cx+10,32+bob],[cx+5,35+bob],[cx-6,33+bob]],p.accent,p.ink);L(cx-1,33+bob,cx-1,37+bob,'#edaca1');L(cx+6,33+bob,cx+6,37+bob,'#edaca1');}
    if(p.kind==='robe'){P([[cx-7,27+bob],[cx+4,28+bob],[cx+6,43+bob],[cx-7,43+bob]],p.light);L(cx-6,29+bob,cx+5,41+bob,p.ink);R(cx-8,43+bob,18,4,'#65415b');R(cx+5,46+bob,4,10,'#65415b');}
    if(p.kind==='uniform'||p.kind==='white'){R(cx-3,26+bob,11,6,p.top);L(cx+2,30+bob,cx+2,46+bob,p.ink);for(let b=0;b<3;b++)R(cx+4,34+bob+b*5,1,1,'#e6c997');}
    if(p.kind==='collar'){P([[cx-5,24+bob],[cx+11,24+bob],[cx+11,32+bob],[cx-6,34+bob]],p.accent,p.ink);R(cx+8,28+bob,2,5,'#527887');}
    if(p.kind==='suit'){P([[cx-3,28+bob],[cx+3,28+bob],[cx+6,46+bob],[cx-3,46+bob]],'#487177');P([[cx,30+bob],[cx+3,32+bob],[cx+4,43+bob],[cx+2,45+bob],[cx,42+bob]],p.accent);R(cx+1,34+bob,2,1,p.ink);R(cx+2,38+bob,2,1,p.ink);L(cx-6,30+bob,cx-1,37+bob,p.ink);L(cx+7,31+bob,cx+4,37+bob,p.ink);}
    if(p.kind==='choso'){P([[cx-8,26+bob],[cx+10,27+bob],[cx+11,33+bob],[cx-8,35+bob]],'#aea4ae',p.ink);R(cx-7,43+bob,16,5,'#65445e');R(cx+5,47+bob,3,10,'#7e526d');}
    if(muscle){L(cx-7,34+bob,cx-1,36+bob,p.shade);L(cx+2,35+bob,cx+10,32+bob,p.shade);L(cx,34+bob,cx,41+bob,p.shade);L(cx-4,42+bob,cx+5,42+bob,p.shade);R(cx-4,46+bob,12,3,'#252b3a');}
    if(isPanda){P([[cx-13,29+bob],[cx+12,29+bob],[cx+13,34+bob],[cx+8,38+bob],[cx-9,37+bob]],p.pants);R(cx-5,40+bob,8,6,p.light);}
    if(stocky){P([[cx-10,27+bob],[cx+13,27+bob],[cx+14,35+bob],[cx+5,33+bob],[cx-6,36+bob],[cx-12,32+bob]],'#d5a448',p.ink);for(const [x,y]of [[-4,30],[8,30],[-7,40],[5,44]])R(cx+x,y+bob,3,3,p.kind==='jogo'?'#c4b28b':p.light);}
    if(p.kind==='patch'){R(cx-8,35+bob,7,9,'#9baeb4');R(cx+4,29+bob,6,10,'#657c8f');L(cx-2,30+bob,cx-2,47+bob,p.ink);for(let y=33;y<47;y+=4)R(cx-3,y+bob,3,1,p.light);}
    // Neck, jaw and 3/4 profile. Character identity comes from silhouette, not labels.
    if(p.kind==='sovereign'){
      segment([cx-7,38+bob],[cx-17,45+bob],7,6,p.skin,p.shade);
      segment([cx-17,45+bob],[cx-8,49+bob],6,5,p.skin,p.light);
      segment([cx+9,39+bob],[cx+21,44+bob],7,6,p.skin,p.shade);
      segment([cx+21,44+bob],[cx+26,35+bob],6,5,p.skin,p.light);
      R(cx-19,44+bob,5,2,p.ink);R(cx+18,41+bob,5,2,p.ink);
      R(cx-5,47+bob,18,4,'#75374d');R(cx,48+bob,4,2,p.accent);
    }
    R(neck[0]-3,neck[1]-4,6,7,p.shade);
    const hx=cx+5,hy=14+bob-(isPanda?1:0);
    P([[hx-7,hy+2],[hx+4,hy],[hx+9,hy+4],[hx+9,hy+8],[hx+12,hy+10],[hx+9,hy+12],[hx+8,hy+16],[hx+3,hy+18],[hx-5,hy+14],[hx-7,hy+9]],p.skin,p.ink);
    P([[hx-5,hy+8],[hx-1,hy+10],[hx+1,hy+16],[hx+4,hy+17],[hx-4,hy+14]],p.shade);R(hx-7,hy+9,3,5,p.skin);
    L(hx+4,hy+8,hx+9,hy+7,p.ink);R(hx+5,hy+9,4,2,'#f4e7cf');R(hx+8,hy+9,1,2,p.ink);R(hx+7,hy+14,3,1,p.shade);
    const hair=points=>P(points.map(([x,y])=>[hx+x,hy+y]),p.hair,p.ink);
    if(['Megumi','Yuji','Sukuna','The Strongest of History'].includes(name)){
      const tall=name==='Megumi'?4:0;
      hair([[-8,9],[-12,3],[-7,4],[-8,-5-tall],[-2,-1],[-1,-8-tall],[3,-3],[8,-6-tall],[8,0],[13,-1],[10,5],[5,4],[3,7],[-1,3],[-4,9]]);
      L(hx-6,hy-1,hx-2,hy+2,p.hs);L(hx+2,hy-3,hx+5,hy+1,p.hs);R(hx-8,hy+7,3,5,p.hair);
      if(name==='Sukuna'||p.kind==='sovereign'){
        // Visible ink markings: forehead fork, cheek bars, jaw/chin lines.
        R(hx+4,hy+3,2,4,p.ink);R(hx+2,hy+3,2,1,p.ink);R(hx+6,hy+3,2,1,p.ink);
        R(hx+2,hy+11,7,1,p.ink);R(hx+3,hy+13,6,1,p.ink);
        L(hx,hy+13,hx+3,hy+16,p.ink);R(hx+5,hy+17,3,1,p.ink);
        if(p.kind==='sovereign'){R(hx+6,hy+12,3,1,'#d72e52');R(hx-3,hy+10,2,4,p.ink);}
      }
    }else if(name==='Hakari'){
      hair([[-8,9],[-9,2],[-6,-3],[-2,-4],[0,-2],[3,-4],[7,-2],[10,2],[7,6],[3,5],[1,7],[-3,5],[-5,10]]);
      for(const [x,y]of [[-5,0],[-1,-1],[4,0],[-6,4],[0,3]])R(hx+x,hy+y,3,2,p.hs);R(hx+9,hy+13,1,1,'#edd274');
    }else if(name==='Nobara'){
      hair([[-10,17],[-11,5],[-8,-2],[1,-4],[9,-1],[11,6],[10,17],[5,19],[5,13],[7,8],[3,5],[-4,7],[-5,18]]);
      L(hx-7,hy+1,hx-8,hy+13,p.hs);L(hx+6,hy+1,hx+8,hy+5,'#db9a5b');
    }else if(name==='Maki'){
      hair([[-8,12],[-10,5],[-7,-2],[2,-4],[9,0],[10,5],[4,5],[0,3],[-4,10]]);
      P([[hx-8,hy-1],[hx-15,hy-5],[hx-19,hy],[hx-15,hy+10],[hx-18,hy+19],[hx-11,hy+13],[hx-12,hy+3]],p.hair,p.ink);
      R(hx-1,hy+8,5,4,p.ink);R(hx+5,hy+8,6,4,p.ink);R(hx,hy+9,3,1,'#a6bfc1');R(hx+6,hy+9,4,1,'#a6bfc1');L(hx-5,hy+8,hx+11,hy+8,p.ink);
    }else if(name==='Toge'){
      hair([[-8,12],[-10,3],[-6,-3],[4,-4],[10,0],[10,5],[7,5],[5,8],[3,4],[0,7],[-2,4],[-5,11]]);
      L(hx-6,hy,hx+5,hy-1,'#f5eedb');P([[hx-7,hy+13],[hx+10,hy+12],[hx+10,hy+18],[hx-6,hy+19]],p.accent,p.ink);R(hx+8,hy+14,2,5,'#638590');
    }else if(isPanda){
      P([[hx-12,hy-1],[hx-10,hy-6],[hx-5,hy-6],[hx-2,hy],[hx+5,hy-5],[hx+10,hy-4],[hx+13,hy+2],[hx+12,hy+13],[hx+8,hy+18],[hx-5,hy+18],[hx-13,hy+10]],p.skin,p.ink);
      R(hx-12,hy-4,7,6,p.pants);R(hx+5,hy-4,7,6,p.pants);P([[hx-8,hy+4],[hx-3,hy+3],[hx,hy+8],[hx-3,hy+12],[hx-9,hy+10]],p.pants);P([[hx+4,hy+3],[hx+9,hy+5],[hx+10,hy+10],[hx+4,hy+11],[hx+2,hy+8]],p.pants);R(hx-4,hy+6,2,2,'#d8daba');R(hx+5,hy+6,2,2,'#d8daba');R(hx-1,hy+12,7,3,p.pants);R(hx+1,hy+16,4,1,p.ink);
    }else if(name==='Nanami'){
      hair([[-8,9],[-9,2],[-7,-2],[4,-4],[10,0],[9,5],[5,5],[1,2],[-5,4],[-5,10]]);L(hx-5,hy,hx+6,hy+1,p.hs);
      R(hx-1,hy+8,5,4,'#485d64');R(hx+5,hy+7,6,4,'#485d64');R(hx,hy+8,3,1,'#94bbb9');R(hx+6,hy+7,4,1,'#94bbb9');L(hx-6,hy+8,hx+11,hy+8,p.ink);
    }else if(name==='Yuta'){
      hair([[-9,11],[-10,4],[-7,-3],[3,-4],[8,-1],[12,3],[8,3],[8,8],[4,5],[1,10],[-1,6],[-5,11],[-5,15]]);L(hx-5,hy,hx+3,hy,p.hs);R(hx+4,hy+12,5,1,p.shade);
    }else if(name==='Choso'){
      hair([[-9,15],[-10,3],[-6,-3],[4,-4],[10,2],[6,5],[-2,3],[-5,9],[-4,17]]);
      P([[hx-8,hy-1],[hx-13,hy-4],[hx-13,hy-10],[hx-8,hy-11],[hx-4,hy-6]],p.hair,p.ink);P([[hx+2,hy-3],[hx+3,hy-10],[hx+8,hy-11],[hx+12,hy-6],[hx+10,hy-1]],p.hair,p.ink);
      L(hx+1,hy+12,hx+11,hy+11,'#6d3f4a');R(hx+6,hy+11,2,5,'#6d3f4a');
    }else if(name==='Todo'){
      hair([[-8,11],[-9,2],[-4,-3],[5,-3],[10,2],[6,5],[-2,4],[-5,11]]);P([[hx-3,hy-2],[hx-6,hy-8],[hx-3,hy-12],[hx+2,hy-11],[hx+4,hy-5],[hx+1,hy-1]],p.hair,p.ink);L(hx+4,hy+3,hx+8,hy+14,'#976455');
    }else if(stocky){
      P([[hx-9,hy+7],[hx-10,hy-2],[hx-7,hy-10],[hx+4,hy-11],[hx+10,hy-2],[hx+9,hy+7]],p.hair,p.ink);R(hx-5,hy-10,9,3,'#312637');R(hx-3,hy-9,5,1,'#ec9f58');L(hx-5,hy-4,hx-3,hy+2,p.hs);P([[hx-5,hy+7],[hx+2,hy+4],[hx+10,hy+7],[hx+8,hy+12],[hx+1,hy+14],[hx-5,hy+11]],'#f5e1ad',p.ink);R(hx+3,hy+7,3,5,p.ink);R(hx+4,hy+7,1,2,'#eec85f');R(hx+2,hy+16,7,1,p.ink);
    }else if(name==='Mahito'){
      hair([[-10,20],[-11,6],[-8,-2],[2,-4],[10,0],[12,8],[10,24],[6,22],[6,12],[8,6],[3,3],[-2,8],[-5,5],[-6,20]]);
      L(hx-8,hy+2,hx-8,hy+16,p.hs);L(hx+8,hy+1,hx+10,hy+19,p.hs);L(hx+1,hy+5,hx+5,hy+16,'#806e77');for(let y=8;y<17;y+=3)R(hx+2,y+hy,3,1,'#806e77');
    }
    // Near arm changes joint positions, not limb lengths. The guard hand stays attached.
    let elbow=[cx+16,42+bob],fist=[cx+16,31+bob];
    if(key==='punch'){elbow=[[cx+13,40],[cx+3,42],[cx+24,33],[cx+30,30],[cx+31,30],[cx+18,38]][i];fist=[[cx+15,31],[cx-3,37],[cx+38,30],[cx+51,30],[cx+52,30],[cx+27,31]][i];}
    if(key==='kick'){elbow=[cx+12,35];fist=[cx+15,24];}
    if(key==='special'){elbow=[cx+17,37+bob];fist=['Nobara','Maki','Nanami','Yuta'].includes(name)?[cx+23,29+bob]:[cx+28,32+bob];}
    const sleeve=isPanda?p.pants:muscle?p.skin:p.top,fore=isPanda?p.pants:(['Megumi','Toge','Yuta'].includes(name)?p.top:p.skin);
    segment(shoulder,elbow,10+bulk,7+bulk*.4,sleeve,muscle?p.light:p.light);segment(elbow,fist,7+bulk*.5,5+bulk*.4,fore,isPanda?p.pl:fore===p.skin?p.shade:p.light);
    P([[fist[0]-3,fist[1]-4],[fist[0]+3+bulk*.3,fist[1]-4],[fist[0]+5+bulk*.3,fist[1]-1],[fist[0]+4+bulk*.3,fist[1]+3],[fist[0]-3,fist[1]+3]],isPanda?p.pants:p.skin,p.ink);R(fist[0],fist[1]-3,3,1,isPanda?p.pl:'#efc5a5');
    if(name==='Nobara'&&key!=='punch'){L(fist[0]+2,fist[1]+7,fist[0]+2,fist[1]-10,'#bc8a52');P([[fist[0]-2,fist[1]-12],[fist[0]+8,fist[1]-12],[fist[0]+8,fist[1]-7],[fist[0]-2,fist[1]-7]],'#8c9caa',p.ink);R(fist[0]-1,fist[1]-11,8,1,'#d0dce0');}
    if(['Maki','Yuta','Nanami'].includes(name)&&!['punch','kick'].includes(key)){
      const x=fist[0]+3,y=fist[1],blade=name==='Nanami'?19:name==='Maki'?22:27;
      if(name==='Maki'){L(x,y+28,x,y-blade,p.ink);L(x+1,y+28,x+1,y-blade,'#a69e7b');P([[x-2,y-blade],[x+3,y-blade-7],[x+5,y-blade+2],[x+1,y-blade+5]],'#9eaead',p.ink);}
      else {P([[x,y-5],[x+2,y-blade],[x+5,y-blade-2],[x+4,y-4]],name==='Nanami'?'#bec7b4':'#c9d9de',p.ink);L(x+2,y-blade+2,x+2,y-5,'#f1f0d9');R(x-2,y-3,10,2,'#8b7858');R(x+1,y-1,3,7,'#52435b');}
    }
    // A single, small smear accent reinforces the extension frame, never replaces the arm.
    if(key==='punch'&&i===2){R(fist[0]-14,fist[1]+5,8,1,p.pl);R(fist[0]-10,fist[1]-6,10,1,p.light);}
    cache.set(ck,cv);return cv;
  }
  function draw(ctx,f,tick){
    if(!catalog[f.name])return false;
    const ps=pose(f,tick),img=sprite(f.name,ps.key,ps.index),cx=Math.round(f.x+f.w/2),foot=Math.round(f.y+f.h),air=Math.max(0,FLOOR-foot);
    ctx.save();ctx.imageSmoothingEnabled=false;
    ctx.globalAlpha=Math.max(.08,.25-air/360);ctx.fillStyle='#080b19';ctx.beginPath();ctx.ellipse(cx,FLOOR+2,25-Math.min(10,air/10),3,0,0,Math.PI*2);ctx.fill();
    ctx.globalAlpha=1;ctx.translate(cx,foot);ctx.scale(f.face<0?-1:1,1);
    ctx.drawImage(img,-PIVOT*SCALE,-SOLE*SCALE,W*SCALE,H*SCALE);ctx.restore();return true;
  }
  window.HakoneArtFighters={draw,pose,ready:n=>!!catalog[n],frame:sprite,
    metrics:()=>({width:W,height:H,scale:SCALE,pivotX:PIVOT,soleY:SOLE,floor:FLOOR,framesCached:cache.size}),
    roster:Object.keys(catalog),clips};
})();
