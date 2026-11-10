/* Ground-contact and a real seated pose for travelers, without changing physics. */
(() => {
  'use strict';
  const A=window.HakoneArt,original=A.person,cache=new Map();
  function seated(name){
    if(cache.has(name))return cache.get(name);
    const src=document.createElement('canvas');src.width=28;src.height=38;
    original(src.getContext('2d'),name,14,34,'down',0);
    const out=document.createElement('canvas');out.width=28;out.height=32;
    const c=out.getContext('2d');c.imageSmoothingEnabled=false;
    c.drawImage(src,0,0,28,27,0,0,28,27);
    A.rect(c,6,25,8,5,'#46566b');A.rect(c,16,25,8,5,'#46566b');
    A.rect(c,5,29,9,3,'#202e3c');A.rect(c,16,29,9,3,'#202e3c');
    cache.set(name,out);return out;
  }
  window.HakoneSeating=Object.freeze({draw:(c,name,x,y)=>{c.save();c.imageSmoothingEnabled=false;c.drawImage(seated(name),Math.round(x-14),Math.round(y-32));c.restore();}});
})();
