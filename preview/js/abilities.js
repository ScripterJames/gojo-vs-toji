/* Special-move VFX and original synthesised SFX for Gojo vs Toji.
   No external audio downloads: Web Audio starts only after a user gesture. */
(() => {
  'use strict';
  const TAU = Math.PI * 2;
  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
  const AContext = window.AudioContext || window.webkitAudioContext;
  let audio = null, master = null, noiseBuffer = null;
  let muted = false;
  try { muted = window.localStorage?.getItem('gojo-toji-muted') === '1'; } catch (_) {}

  function arm() {
    if (muted || !AContext) return false;
    try {
      if (!audio) {
        audio = new AContext();
        master = audio.createGain();
        master.gain.value = 0.27;
        master.connect(audio.destination);
        noiseBuffer = audio.createBuffer(1, Math.floor(audio.sampleRate * 0.8), audio.sampleRate);
        const data = noiseBuffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.85;
      }
      if (audio.state === 'suspended') audio.resume().catch(() => {});
      return true;
    } catch (e) {
      console.warn('Audio unavailable:', e);
      return false;
    }
  }

  function setRoute(node, pan) {
    if (audio.createStereoPanner) {
      const p = audio.createStereoPanner();
      p.pan.value = clamp(pan, -0.8, 0.8);
      node.connect(p);
      p.connect(master);
    } else {
      node.connect(master);
    }
  }

  function tone(kind, from, to, length, volume, pan, delay = 0, attack = 0.008) {
    if (!audio) return;
    const start = audio.currentTime + delay, end = start + length;
    const osc = audio.createOscillator(), gain = audio.createGain();
    osc.type = kind;
    osc.frequency.setValueAtTime(Math.max(20, from), start);
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, to), end);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.001, volume), start + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, end);
    osc.connect(gain); setRoute(gain, pan);
    osc.start(start); osc.stop(end + 0.015);
  }

  function rush(length, volume, from, to, pan, delay = 0) {
    if (!audio || !noiseBuffer) return;
    const start = audio.currentTime + delay, end = start + length;
    const src = audio.createBufferSource(), filter = audio.createBiquadFilter(), gain = audio.createGain();
    src.buffer = noiseBuffer;
    filter.type = 'bandpass'; filter.Q.value = 0.55;
    filter.frequency.setValueAtTime(Math.max(100, from), start);
    filter.frequency.exponentialRampToValueAtTime(Math.max(100, to), end);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.001, volume), start + Math.min(0.025, length / 4));
    gain.gain.exponentialRampToValueAtTime(0.0001, end);
    src.connect(filter); filter.connect(gain); setRoute(gain, pan);
    src.start(start); src.stop(end + 0.01);
  }

  function play(kind, fighter) {
    if (muted || !arm()) return;
    const pan = fighter ? clamp((fighter.x + 27 - 480) / 600, -0.8, 0.8) : 0;
    switch (kind) {
      case 'blue':
        tone('sine', 145, 48, 0.66, 0.62, pan);
        tone('triangle', 540, 1180, 0.34, 0.13, pan, 0.04);
        tone('sawtooth', 92, 58, 0.5, 0.12, pan, 0.05);
        rush(0.42, 0.12, 1800, 400, pan, 0.045);
        break;
      case 'dash':
        rush(0.30, 0.52, 3800, 350, pan);
        tone('sawtooth', 430, 85, 0.22, 0.24, pan);
        tone('triangle', 150, 50, 0.27, 0.18, pan, 0.03);
        break;
      case 'punch':
        rush(0.115, 0.26, 1800, 330, pan);
        tone('triangle', 190, 88, 0.085, 0.11, pan);
        break;
      case 'kick':
        rush(0.22, 0.33, 2500, 330, pan);
        tone('triangle', 220, 62, 0.17, 0.17, pan);
        break;
      case 'hit':
        rush(0.115, 0.39, 850, 150, pan);
        tone('sine', 130, 49, 0.16, 0.34, pan);
        break;
      case 'start':
        tone('triangle', 430, 670, 0.12, 0.08, 0);
        tone('triangle', 520, 880, 0.16, 0.10, 0, 0.08);
        break;
    }
  }

  function toggleMute() {
    muted = !muted;
    try { window.localStorage?.setItem('gojo-toji-muted', muted ? '1' : '0'); } catch (_) {}
    if (master) master.gain.setTargetAtTime(muted ? 0 : 0.27, audio.currentTime, 0.012);
    if (!muted) arm();
    return muted;
  }
  function isMuted() { return muted; }

  function bluePosition(f) {
    return { x: f.x + f.w / 2 + f.face * 105, y: f.y + 43 };
  }
  function blueStrength(f) {
    return clamp((300 - f.blue) / 12, 0.16, 1) * clamp(f.blue / 15, 0, 1);
  }

  // A visible energy stream links the blue vortex to an affected opponent.
  function blueTether(ctx, f, other, tick) {
    if (!other || other.hp <= 0 || other.invul > 0) return;
    const from = bluePosition(f);
    const x = other.x + other.w / 2, y = other.y + other.h * .46;
    if (Math.abs(x - from.x) >= 475) return;
    const power = blueStrength(f);
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (let strand = 0; strand < 3; strand++) {
      ctx.beginPath();
      for (let i = 0; i <= 16; i++) {
        const t = i / 16;
        const wave = Math.sin(t * 20 - tick * .35 + strand * 2) * 10 * Math.sin(t * Math.PI);
        const px = from.x + (x - from.x) * t;
        const py = from.y + (y - from.y) * t + wave;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.strokeStyle = ['#c1faff','#4bcbff','#4770ff'][strand];
      ctx.globalAlpha = power * [.63,.43,.31][strand];
      ctx.lineWidth = [2.5,2,1.5][strand];
      ctx.stroke();
    }
    for (let i = 0; i < 7; i++) {
      const t = ((tick * .05 + i / 7) % 1);
      const px = x + (from.x - x) * t;
      const py = y + (from.y - y) * t + Math.sin(tick * .22 + i) * 5;
      ctx.globalAlpha = power * (1 - .35 * t);
      ctx.fillStyle = '#cbfaff'; ctx.fillRect(Math.round(px),Math.round(py),3,3);
    }
    ctx.restore();
  }

  function blueBack(ctx, f, tick) {
    const {x, y} = bluePosition(f), amount = blueStrength(f);
    const pulse = Math.sin(tick * 0.21) * 4, radius = 78 + pulse;
    ctx.save(); ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = 0.78 * amount;
    const glow = ctx.createRadialGradient(x, y, 4, x, y, radius + 34);
    glow.addColorStop(0, 'rgba(112,235,255,0.9)');
    glow.addColorStop(0.26, 'rgba(40,110,255,0.58)');
    glow.addColorStop(0.68, 'rgba(24,54,193,0.24)');
    glow.addColorStop(1, 'rgba(8,20,80,0)');
    ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(x, y, radius + 34, 0, TAU); ctx.fill();

    // Curved streams and inward-drifting particles communicate suction, not an explosion.
    for (let i = 0; i < 9; i++) {
      const a = i * TAU / 9 + tick * 0.075, r = 105 + (i % 3) * 21;
      const sx = x + Math.cos(a) * r, sy = y + Math.sin(a) * r * 0.8;
      ctx.beginPath(); ctx.moveTo(sx, sy);
      ctx.quadraticCurveTo(x + Math.cos(a + 0.75) * 55,
                           y + Math.sin(a + 0.75) * 50,
                           x + Math.cos(a + 1.6) * 19,
                           y + Math.sin(a + 1.6) * 19);
      ctx.strokeStyle = i % 2 ? '#2c78ff' : '#6bdcff';
      ctx.lineWidth = i % 3 === 0 ? 3 : 1.5;
      ctx.globalAlpha = amount * (i % 3 === 0 ? 0.66 : 0.38);
      ctx.stroke();
    }
    for (let i = 0; i < 30; i++) {
      const angle = i * 2.399963 + tick * 0.013;
      const r = 18 + ((i * 41 - tick * 6 + 5000) % 169);
      const px = Math.round(x + Math.cos(angle) * r),
            py = Math.round(y + Math.sin(angle) * r * 0.78);
      ctx.globalAlpha = amount * (0.19 + (1 - r / 210) * 0.6);
      ctx.fillStyle = i % 4 === 0 ? '#ffffff' : '#48a6ff';
      ctx.fillRect(px, py, i % 7 === 0 ? 4 : 2, i % 7 === 0 ? 4 : 2);
    }
    ctx.restore();
  }

  function blueFront(ctx, f, tick) {
    const {x, y} = bluePosition(f), a = blueStrength(f);
    ctx.save(); ctx.globalCompositeOperation = 'screen';
    for (let ring = 0; ring < 5; ring++) {
      const angle = tick * (ring % 2 ? -0.16 : 0.15) + ring * 1.26;
      ctx.beginPath();
      ctx.arc(x, y, 22 + ring * 8 + Math.sin(tick * .24 + ring) * 3,
              angle, angle + 2.5 + Math.sin(tick * .07) * .28);
      ctx.lineWidth = 5 - ring * .55;
      ctx.lineCap = 'round';
      ctx.globalAlpha = a * (0.85 - ring * .1);
      ctx.strokeStyle = ['#d4ffff','#5ddcff','#328cff','#274ee1','#79b9ff'][ring];
      ctx.stroke();
    }
    const inner = ctx.createRadialGradient(x - 4, y - 5, 0, x, y, 27);
    inner.addColorStop(0, '#ffffff');
    inner.addColorStop(.22, '#dcffff');
    inner.addColorStop(.55, '#5ae7ff');
    inner.addColorStop(.78, '#2478f7');
    inner.addColorStop(1, 'rgba(36,90,255,0)');
    ctx.globalAlpha = clamp(a + .23, 0, 1);
    ctx.fillStyle = inner; ctx.beginPath(); ctx.arc(x, y, 27, 0, TAU); ctx.fill();
    for (let i = 0; i < 8; i++) {
      const theta = i * TAU / 8 - tick * 0.11;
      const r = 39 + Math.sin(tick * .16 + i) * 6;
      ctx.fillStyle = i % 2 ? '#e8ffff' : '#59caff';
      ctx.fillRect(Math.round(x + Math.cos(theta) * r),
                   Math.round(y + Math.sin(theta) * r), 4, 4);
    }
    ctx.restore();
  }

  const trails = new WeakMap();
  function track(f, tick) {
    let trace = trails.get(f);
    if (!trace) { trace = {last: -1, samples: []}; trails.set(f, trace); }
    if (f.invul > 0 && tick !== trace.last) {
      const sprite = window.SpriteAnimations?.pose?.(f, tick)?.index ?? 30;
      trace.samples.unshift({x:f.x, y:f.y, face:f.face, at:tick, sprite});
      trace.samples.length = Math.min(18, trace.samples.length);
    }
    trace.last = tick;
    trace.samples = trace.samples.filter(p => tick - p.at < 15);
    return trace.samples;
  }

  function dashBack(ctx, f, tick) {
    const samples = track(f, tick);
    const sheet = window.SpriteAnimations?.image?.('Toji');
    ctx.save();
    // Full-character, fading afterimages follow the actual dash path.
    for (let i = samples.length - 1; i >= 0; i -= 3) {
      const p = samples[i], age = tick - p.at;
      if (age < 2 || age > 14) continue;
      const opacity = 0.38 * (1 - age / 15);
      ctx.save(); ctx.globalAlpha = opacity;
      ctx.translate(Math.round(p.x + f.w/2), 0);
      ctx.scale(p.face < 0 ? -1 : 1, 1);
      if (sheet?.complete && sheet.naturalWidth === 528) {
        ctx.shadowColor = '#bc76ff'; ctx.shadowBlur = 14;
        ctx.filter = 'saturate(2) hue-rotate(12deg)';
        ctx.drawImage(sheet, (p.sprite % 6) * 88, Math.floor(p.sprite / 6) * 76,
                      88, 76, -78, Math.round(p.y + f.h - 143), 176, 152);
      } else {
        ctx.fillStyle = '#aa72ff';
        ctx.fillRect(-20, p.y + 12, 46, 95);
      }
      ctx.restore();
    }
    if (f.invul > 0) {
      const cx = f.x + f.w / 2, factor = clamp(f.invul / 22, 0, 1);
      ctx.lineCap = 'round';
      for (let i = 0; i < 7; i++) {
        const back = cx - f.face * (22 + i * 24);
        const y = f.y + 13 + (i * 23) % 94;
        ctx.beginPath(); ctx.moveTo(back, y);
        ctx.lineTo(back - f.face * (32 + (i % 3) * 19), y + (i % 2 ? 3 : -3));
        ctx.strokeStyle = ['#f1baff','#ad69ff','#5630b8'][i % 3];
        ctx.globalAlpha = factor * (.60 - i * .055);
        ctx.lineWidth = i % 3 === 0 ? 5 : 2;
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  function dashFront(ctx, f, tick) {
    if (f.invul <= 0) return;
    const cx = f.x + f.w/2, fy = f.y + f.h, age = 22 - f.invul;
    ctx.save(); ctx.globalCompositeOperation = 'screen';
    if (age <= 8) {
      const r = 23 + age * 12;
      ctx.beginPath(); ctx.ellipse(cx - f.face * 20, fy - 42, r, r * .58, 0, 0, TAU);
      ctx.strokeStyle = '#ad6eff';
      ctx.globalAlpha = .8 * (1 - age / 10);
      ctx.lineWidth = 5 - age * .3; ctx.stroke();
    }
    ctx.globalAlpha = .85 * clamp(f.invul/13, 0, 1);
    const streak = ctx.createLinearGradient(cx - f.face * 38, 0, cx + f.face * 36, 0);
    streak.addColorStop(0, 'rgba(180,100,255,0)');
    streak.addColorStop(.6, 'rgba(133,69,246,.5)');
    streak.addColorStop(1, 'rgba(231,194,255,0)');
    ctx.fillStyle = streak;
    ctx.fillRect(Math.round(cx - 38), Math.round(f.y + 30), 76, 42);
    for (let i = 0; i < 6; i++) {
      const x = cx - f.face * (14 + i * 11), y = fy - 6 + Math.sin(tick * .37 + i) * 5;
      ctx.fillStyle = i % 2 ? '#d69dff' : '#7650e5';
      ctx.fillRect(Math.round(x), Math.round(y), 5, 3);
    }
    ctx.restore();
  }

  function drawBehind(ctx, f, tick, opponent) {
    if (f.name === 'Gojo' && f.blue > 0) { blueBack(ctx, f, tick); blueTether(ctx, f, opponent, tick); }
    if (f.name === 'Toji') dashBack(ctx, f, tick);
  }
  function drawFront(ctx, f, tick) {
    if (f.name === 'Gojo' && f.blue > 0) blueFront(ctx, f, tick);
    if (f.name === 'Toji' && f.invul > 0) dashFront(ctx, f, tick);
  }
  window.AbilityFX = { arm, play, toggleMute, isMuted, drawBehind, drawFront,
                       supported: () => !!AContext };
})();