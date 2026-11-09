/* Upgrade Shop for Gojo vs Toji. Saves levels and coins in this browser.
   Each character has its own upgrades. Play against the CPU to earn coins. */
(() => {
  'use strict';
  const COIN_KEY = 'gojo-vs-toji-arcade-coins-v1';
  const LEVEL_KEY = 'gojo-vs-toji-upgrade-levels-v1';
  const GIFT_KEY = 'gojo-vs-toji-upgrade-starter-v1';
  const MAX = 3;
  const characters = ['Gojo', 'Toji'];
  const types = [
    { id:'power', name:'Strength', icon:'🥊', detail:'Punch +2 and Kick +3 each level' },
    { id:'vitality', name:'Health', icon:'❤️', detail:'Maximum HP +12 each level' },
    { id:'agility', name:'Speed', icon:'⚡', detail:'Run speed +0.22 each level' },
    { id:'technique', name:'Special', icon:'✨', detail:'Stronger Blue or Heavenly Restriction' }
  ];
  const blank = () => ({power:0,vitality:0,agility:0,technique:0});
  const levels = {Gojo:blank(), Toji:blank()};
  let coins = 0, mountPoint = null, onChange = null;
  const read = k => { try { return localStorage.getItem(k); } catch (_) { return null; } };
  const write = (k,v) => { try { localStorage.setItem(k,v); } catch (_) {} };
  const stored = Number(read(COIN_KEY));
  coins = Number.isFinite(stored) ? Math.max(0,Math.floor(stored)) : 0;
  try {
    const saved = JSON.parse(read(LEVEL_KEY) || '{}');
    for (const name of characters) {
      for (const type of types) {
        const n = Number(saved[name]?.[type.id]);
        if (Number.isFinite(n)) levels[name][type.id] = Math.min(MAX,Math.max(0,Math.floor(n)));
      }
    }
  } catch (_) {}
  // One-time gift means the first upgrade can be tried immediately.
  if (read(GIFT_KEY) !== 'yes') {
    coins += 50;
    write(COIN_KEY,String(coins));
    write(GIFT_KEY,'yes');
  }

  function price(level) { return 35 + level * 35; }
  function buy(name,type) {
    if (!characters.includes(name) || !types.some(t=>t.id===type)) return false;
    const level = levels[name][type];
    if (level >= MAX || coins < price(level)) return false;
    coins -= price(level);
    levels[name][type] = level + 1;
    write(COIN_KEY,String(coins));
    write(LEVEL_KEY,JSON.stringify(levels));
    render();
    if (onChange) onChange();
    return true;
  }
  function award(count) {
    if (!Number.isFinite(count) || count <= 0) return;
    coins += Math.floor(count);
    write(COIN_KEY,String(coins));
    render();
  }
  function apply(f) {
    const rank = levels[f.name] || blank();
    f.upgrades = {...rank};
    f.maxHp = 100 + rank.vitality * 12;
    f.hp = f.maxHp;
    f.moveSpeed = (f.name === 'Toji' ? 4.75 : 4.4) + rank.agility * .22;
    f.punchPower = 7 + rank.power * 2;
    f.kickPower = 11 + rank.power * 3;
    f.specialPower = rank.technique;
    return f;
  }
  function base(f) {
    f.maxHp=100; f.hp=100;
    f.moveSpeed=f.name==='Toji'?4.75:4.4;
    f.punchPower=7; f.kickPower=11; f.specialPower=0;
    f.upgrades=blank();
    return f;
  }
  function cards(name) {
    return '<div class="upgrade-character"><h3>'+name+'</h3>'+
      types.map(type => {
        const level=levels[name][type.id];
        const p=price(level);
        const affordable=coins>=p;
        return '<div class="upgrade-item"><div><strong>'+type.icon+' '+type.name+
         '</strong><span> '+('★'.repeat(level)+'☆'.repeat(MAX-level))+'</span>'+
         '<small>'+type.detail+'</small></div>'+
         '<button type="button" data-fighter="'+name+'" data-stat="'+type.id+'" '+(level===MAX || !affordable?'disabled':'')+
         '>'+(level===MAX?'MAX':p+' coins')+'</button></div>';
      }).join('')+'</div>';
  }
  function render() {
    if (!mountPoint) return;
    mountPoint.innerHTML =
      '<div class="shop-heading"><div><h2>⚔️ Fighter Upgrades</h2>'+
      '<p>Win against the CPU: +35 coins. Upgrades apply in your next fight.</p></div>'+
      '<strong class="coin-count">🪙 '+coins+' coins</strong></div>'+
      '<div class="upgrade-grid">'+characters.map(cards).join('')+'</div>';
  }
  function mount(el,callback) {
    mountPoint=el; onChange=callback;
    if (mountPoint) mountPoint.addEventListener('click',e=>{
      const btn=e.target.closest('button[data-fighter][data-stat]');
      if (btn && !btn.disabled) buy(btn.dataset.fighter,btn.dataset.stat);
    });
    render();
  }
  window.UpgradeShop = { mount, render, buy, award, apply, base,
    get coins(){return coins},
    get levels(){return JSON.parse(JSON.stringify(levels))}
  };
})();