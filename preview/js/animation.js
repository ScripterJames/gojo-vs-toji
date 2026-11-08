/* Gojo vs Toji: frame-based fighter animation. Each character is one transparent
   6 x 6 sprite atlas. All art is drawn as pre-made image frames, not stretched limbs. */
(() => {
  'use strict';
  const COLS = 6;
  const SOURCE_W = 88, SOURCE_H = 76;
  const DRAW_W = 176, DRAW_H = 152;
  const ORIGIN_X = 78; // pivot at the fighter's centre, inside a 176px frame
  const BOOT_Y = 143;  // pixel where the soles meet the ground
  const clips = {
    idle:     { first: 0,  count: 4, step: 9, loop: true },
    walk:     { first: 4,  count: 6, step: 5, loop: true },
    jump:     { first: 10, count: 1, step: 1, loop: false },
    fall:     { first: 11, count: 1, step: 1, loop: false },
    punch:    { first: 12, count: 6, step: 2, loop: false },
    kick:     { first: 18, count: 6, step: 3, loop: false },
    special:  { first: 24, count: 3, step: 5, loop: true },
    hurt:     { first: 27, count: 2, step: 4, loop: false },
    defeated: { first: 29, count: 1, step: 1, loop: false },
    dash:     { first: 30, count: 4, step: 4, loop: true }
  };
  const sheets = {};
  for (const name of ['Gojo', 'Toji']) {
    const image = new Image();
    sheets[name] = { image, loaded: false, failed: false };
    image.onload = () => {
      if (image.naturalWidth !== SOURCE_W * COLS || image.naturalHeight !== SOURCE_H * COLS) {
        console.error('Unexpected sprite atlas size for', name, image.naturalWidth, image.naturalHeight);
        sheets[name].failed = true;
        return;
      }
      sheets[name].loaded = true;
    };
    image.onerror = () => {
      sheets[name].failed = true;
      console.error('Could not load character sprite sheet:', name);
    };
    image.src = `assets/${name.toLowerCase()}.png`;
  }

  function pose(f, tick) {
    let state, elapsed = 0;
    const floor = 450; // match the existing game's ground; physics stays unchanged
    if (f.hp <= 0) state = 'defeated';
    else if (f.attack > 0 && (f.attackKind === 'punch' || f.attackKind === 'kick')) {
      state = f.attackKind;
      elapsed = Math.max(0, (state === 'punch' ? 12 : 18) - f.attack);
    } else if (f.invul > 0 && f.name === 'Toji') {
      state = 'dash'; elapsed = 22 - f.invul;
    } else if (f.flash > 0 && f.invul === 0) {
      state = 'hurt'; elapsed = 8 - Math.min(8, f.flash);
    } else if (f.blue > 0 && f.name === 'Gojo') {
      state = 'special'; elapsed = 34 - f.blue;
    } else if (f.y < floor - f.h - 1) state = f.vy < 0 ? 'jump' : 'fall';
    else if (Math.abs(f.vx) > 0.9) state = 'walk';
    else state = 'idle';
    const clip = clips[state];
    let phase = Math.max(0, Math.floor((state === 'idle' || state === 'walk') ? tick / clip.step : elapsed / clip.step));
    phase = clip.loop ? phase % clip.count : Math.min(clip.count - 1, phase);
    return { state, phase, index: clip.first + phase };
  }

  function sparks(ctx, x, y, color) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    for (let i = 0; i < 6; i++) {
      const a = i * Math.PI / 3;
      const inner = 7, outer = i % 2 ? 18 : 24;
      ctx.beginPath();
      ctx.moveTo(Math.round(x + Math.cos(a) * inner), Math.round(y + Math.sin(a) * inner));
      ctx.lineTo(Math.round(x + Math.cos(a) * outer), Math.round(y + Math.sin(a) * outer));
      ctx.stroke();
    }
    ctx.restore();
  }

  function effects(ctx, f, tick, characterPose) {
    const centre = f.x + f.w / 2;
    if (characterPose.state === 'punch' && f.attack === 7) {
      sparks(ctx, centre + f.face * 80, f.y + 47, '#f9e2b3');
    }
    if (characterPose.state === 'kick' && f.attack === 12) {
      sparks(ctx, centre + f.face * 98, f.y + 64, '#fbf7ff');
    }
  }

  function draw(ctx, f, tick) {
    const sheet = sheets[f.name];
    if (!sheet || !sheet.loaded) return false;
    const current = pose(f, tick);
    const cx = Math.round(f.x + f.w / 2);
    const foot = Math.round(f.y + f.h);
    const sourceX = current.index % COLS * SOURCE_W;
    const sourceY = Math.floor(current.index / COLS) * SOURCE_H;
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    // Shadow tracks the floor even when the fighter is airborne.
    const air = Math.max(0, 450 - foot);
    ctx.globalAlpha = Math.max(0.11, 0.30 - air / 300);
    ctx.fillStyle = '#090a1c';
    ctx.beginPath(); ctx.ellipse(cx, 455, 35 - Math.min(12, air / 8), 6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = f.invul > 0 && f.name === 'Toji' && tick % 5 < 2 ? 0.85 : 1;
    ctx.translate(cx, 0);
    ctx.scale(f.face < 0 ? -1 : 1, 1);
    ctx.drawImage(sheet.image, sourceX, sourceY, SOURCE_W, SOURCE_H,
                  -ORIGIN_X, foot - BOOT_Y, DRAW_W, DRAW_H);
    ctx.restore();
    effects(ctx, f, tick, current);
    return true;
  }
  window.SpriteAnimations = { draw, pose, image: name => sheets[name]?.loaded ? sheets[name].image : null, ready: name => !!sheets[name]?.loaded,
    state: name => sheets[name]?.loaded ? 'ready' : sheets[name]?.failed ? 'error' : 'loading' };
})();