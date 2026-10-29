/* CHISEL concept site: pad explorer + screen mockups.
   Everything here is progressive: the page reads fine without JS,
   these just add the interactive grid and the drawn screens. */
(function () {
  'use strict';

  var TRACKS = [
    { n: 1, glyph: '●', color: '#E69F00', dim: '#4A3A1A', name: 'Track 1' },
    { n: 2, glyph: '▲', color: '#56B4E9', dim: '#1E3644', name: 'Track 2' },
    { n: 3, glyph: '■', color: '#009E73', dim: '#123A30', name: 'Track 3' },
    { n: 4, glyph: '◆', color: '#CC79A7', dim: '#3E2535', name: 'Track 4' }
  ];

  var DEVICES = {
    material: { name: 'Material', short: 'MAT', what: 'What the track is: a tape loop, a poly sampler, live input, or off.',
      pages: [['Tape', 'Start · Length · Speed'], ['Play', 'Mode · Level · Pan'], ['Env', 'Attack · Release · Loop fade']],
      actions: [['Rec', 'press = input gain'], ['Play/Stop', 'press = tape slow'], ['Reverse', ''], ['Retrig', '']] },
    granular: { name: 'Granular', short: 'GRN', what: 'Live granular processing over a 4-second buffer.',
      pages: [['Grain', 'Size · Density · Contour'], ['Spray', 'Position · Scatter · Width'], ['Pitch', 'Pitch · Pitch scatter · Mix']],
      actions: [['Freeze', 'press = blend'], ['Spray', 'burst'], ['+12', 'pitch'], ['Dense', 'surge']] },
    filter: { name: 'Filter', short: 'FLT', what: 'A 48-band resonator bank that also does classic LP, BP and HP shapes.',
      pages: [['Tone', 'Cutoff · Resonance · Morph'], ['Bank', 'Root · Spread · Animate'], ['Mode', 'Type · Drive · Mix']],
      actions: [['Swell', 'resonance'], ['Sweep ↓', ''], ['Sweep ↑', ''], ['Morph', 'hold']] },
    color: { name: 'Color', short: 'COL', what: 'Dual-band drive, bit crushing, noise and compression.',
      pages: [['Drive', 'Low · High · Crossover'], ['Crush', 'Bits · Rate · Noise'], ['Glue', 'Comp · Release · Mix']],
      actions: [['Drive', 'push'], ['Crush', 'push'], ['Noise', 'in'], ['Slam', 'comp']] },
    space: { name: 'Space', short: 'SPC', what: 'Stereo reverb and delay with freeze.',
      pages: [['Room', 'Size · Decay · Damping'], ['Delay', 'Time · Feedback · Type'], ['Blend', 'Rev/Dly · Freeze · Mix']],
      actions: [['Freeze', 'tail'], ['Throw', 'delay'], ['Wash', ''], ['Kill', 'tails']] }
  };
  var DEV_ORDER = ['material', 'granular', 'filter', 'color', 'space'];

  var state = { mode: 'chain', track: 0, device: 'granular', bypass: { 0: ['filter'], 1: ['color'], 2: ['granular'], 3: [] } };

  /* ---------- pad factories ---------- */
  function pad(kind, label, sub, opts) {
    opts = opts || {};
    return { kind: kind, label: label, sub: sub || '', color: opts.color, pressure: opts.pressure, onPress: opts.onPress, detail: opts.detail, selected: opts.selected };
  }
  function trackPads(onPick) {
    return TRACKS.map(function (t, i) {
      var on = i === state.track;
      return pad(on ? 'full' : 'ring', t.glyph + ' Track ' + t.n, on ? 'focused' : '', {
        color: t.color, selected: on,
        onPress: function () { state.track = i; if (onPick) onPick(); },
        detail: { h: t.glyph + ' Track ' + t.n, p: 'Tap to focus the track. Hold to solo it. Every device pad below now edits this track.' }
      });
    });
  }

  var MODES = {
    chain: {
      label: 'Chain', button: 'Sample button', note: 'Home. Tracks on top, the chain in reading order, and the four pressure-sensitive action pads under your thumbs. Tap a device pad to focus it, then tap it again to cycle its pages.',
      pads: function () {
        var t = TRACKS[state.track];
        var by = state.bypass[state.track];
        function dev(key) {
          var d = DEVICES[key];
          var off = by.indexOf(key) !== -1;
          var on = state.device === key;
          return pad(on ? 'full' : (off ? 'dim' : 'ring'), d.name, on ? 'editing' : (off ? 'bypassed' : ''), {
            color: t.color, selected: on,
            onPress: function () { state.device = key; },
            detail: devDetail(key)
          });
        }
        var acts = DEVICES[state.device].actions.map(function (a, i) {
          return pad('act', 'ABCD'.charAt(i) + ' · ' + a[0], a[1], {
            pressure: [64, 20, 8, 36][i],
            detail: { h: 'Action ' + 'ABCD'.charAt(i) + ': ' + a[0], p: 'One of the S-4’s four action buttons, made pressure-sensitive. It changes with the focused device (' + DEVICES[state.device].name + ' right now). ' + (a[1] ? 'Pressure: ' + a[1] + '.' : '') }
          });
        });
        return trackPads().concat([
          dev('material'), dev('granular'), dev('filter'), dev('color'),
          dev('space'),
          pad('util', 'Bypass', 'hold + device', { detail: { h: 'Bypass', p: 'Hold, then tap a device pad to bypass it. Shift + Bypass latches, so it works one-handed.' } }),
          pad('util', 'Copy', 'hold src, tap dst', { detail: { h: 'Copy', p: 'Hold and tap a source device or track, then tap the destination.' } }),
          pad('util', 'Capture', 'resample', { detail: { h: 'Capture', p: 'Resamples the focused track through its whole chain into a new Material.' } })
        ]).concat(acts);
      }
    },
    perform: {
      label: 'Perform', button: 'Pad FX button', note: 'The S-4’s Perform page has 12 macros. Here they all respond to pressure: macros spring back on release, and Shift + tap latches one. Hold two scenes and move the fader to morph between them.',
      pads: function () {
        var c = TRACKS[state.track].color;
        function m(n, p, latched) {
          return pad('act', 'Macro ' + n, latched ? 'latched' : '', { pressure: p, detail: { h: 'Macro ' + n, p: 'Pad pressure sets the macro value. Release springs it back unless it’s latched with Shift + tap. Map any parameters to it on the F3 Map page.' } });
        }
        function punch(n, s) { return pad('act', 'Punch ' + n, s, { pressure: 20, detail: { h: 'Punch-in ' + n + ': ' + s, p: 'A momentary effect. Pressure sets its depth while you hold it.' } }); }
        return [
          punch(1, 'stutter'), punch(2, 'tape stop'), punch(3, 'wash'), punch(4, 'kill'),
          m(5, 50), m(6, 16), m(7, 36), m(8, 92, true),
          m(1, 64), m(2, 28), m(3, 80, true), m(4, 8),
          pad('full', 'Scene A', 'from', { color: c, detail: { h: 'Scene A', p: 'Tap to recall. Shift + tap to store. Hold A and C, then move the fader, to morph between them.' } }),
          pad('util', 'Scene B', '', { detail: { h: 'Scene B', p: 'A stored scene.' } }),
          pad('ring', 'Scene C', 'to', { color: c, detail: { h: 'Scene C', p: 'Morph target. The fader position shows on screen as a marker between A and C.' } }),
          pad('dim', 'Scene D', 'empty', { detail: { h: 'Scene D', p: 'Empty. Shift + tap stores the current state here.' } })
        ];
      }
    },
    mod: {
      label: 'Mod', button: 'Sequence button', note: 'Four modulators per track, as on the S-4. Pick a slot, then a shape. To assign a target, hold a slot pad and turn any knob on any page; how far you turn sets the depth.',
      pads: function () {
        var c = TRACKS[state.track].color;
        return [
          pad('full', 'Mod 1', 'LFO · 3 targets', { color: c, detail: { h: 'Mod 1', p: 'Selected slot. Hold it and turn a knob anywhere to add a destination. Release to commit.' } }),
          pad('ring', 'Mod 2', 'envelope', { color: c, detail: { h: 'Mod 2', p: 'An active envelope modulator.' } }),
          pad('dim', 'Mod 3', 'empty', { detail: { h: 'Mod 3', p: 'Empty slot.' } }),
          pad('dim', 'Mod 4', 'empty', { detail: { h: 'Mod 4', p: 'Empty slot.' } }),
          pad('full', 'LFO', 'selected', { color: c, detail: { h: 'LFO', p: 'The shape for the selected slot. F-pages: Shape, Timing, Targets.' } }),
          pad('util', 'Random', ''), pad('util', 'Envelope', ''), pad('util', 'Follower', ''),
          pad('util', 'Sync', 'on'), pad('util', 'Retrig', 'off'), pad('util', 'Uni / Bi', 'bipolar'),
          pad('util', 'Clear', 'hold', { detail: { h: 'Clear', p: 'Hold to clear the selected slot. No timing threshold: it asks for confirmation on screen.' } })
        ].concat(trackPads());
      }
    },
    mix: {
      label: 'Mix', button: 'Knob FX button', note: 'The one grid where columns mean tracks, because a mixer reads in channel strips. The knobs control level, pan and the DJ filter, and F3 opens the master bus.',
      pads: function () {
        var rows = [];
        TRACKS.forEach(function (t, i) {
          rows.push(i === state.track
            ? pad('full', 'Select ' + t.n, '', { color: t.color, selected: true, onPress: function () { state.track = i; } })
            : pad('ring', 'Select ' + t.n, '', { color: t.color, onPress: function () { state.track = i; }, detail: { h: 'Select ' + t.n, p: 'Focuses this strip for the knobs and fader.' } }));
        });
        [1, 2, 3, 4].forEach(function (n) { rows.push(n === 3 ? pad('dim', 'Mute 3', 'MUTED', { detail: { h: 'Mute 3', p: 'Muted. Shown with a dashed edge and the word, never color alone.' } }) : pad('util', 'Mute ' + n, '')); });
        [1, 2, 3, 4].forEach(function (n) { rows.push(n === 4 ? pad('full', 'Solo 4', 'SOLO ON', { color: TRACKS[3].color }) : pad('util', 'Solo ' + n, '')); });
        [1, 2, 3, 4].forEach(function (n) { rows.push(n === 4 ? pad('act', 'Input 4', 'monitoring', { pressure: 0 }) : pad('util', 'Input ' + n, 'off')); });
        return rows;
      }
    },
    keys: {
      label: 'Keys', button: '16 Levels button', note: 'Plays the focused track’s Material chromatically, scale-locked from the root at pad 1. Velocity sets level, and per-voice aftertouch defaults to grain pitch scatter.',
      pads: function () {
        var c = TRACKS[state.track].color;
        var names = ['G#4', 'A#4', 'C5', 'D5', 'D4', 'D#4', 'F4', 'G4', 'G3', 'G#3', 'A#3', 'C4', 'C3', 'D3', 'D#3', 'F3'];
        return names.map(function (n) {
          var root = n.charAt(0) === 'C';
          return pad(root ? 'full' : 'ring', n, root ? 'root' : '', { color: c, detail: { h: n + (root ? ' (root)' : ''), p: 'C minor shown. Knobs set Root, Scale and Octave.' } });
        });
      }
    }
  };
  var MODE_ORDER = ['chain', 'perform', 'mod', 'mix', 'keys'];

  function devDetail(key) {
    var d = DEVICES[key];
    return { h: d.name, p: d.what, pages: d.pages };
  }

  /* ---------- render helpers ---------- */
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === 'text') n.textContent = attrs[k];
      else if (k === 'style') n.setAttribute('style', attrs[k]);
      else n.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  }

  function showDetail(d) {
    var box = document.getElementById('pad-detail');
    if (!box) return;
    box.textContent = '';
    if (!d) { box.appendChild(el('p', { text: 'Tap a pad to see what it does.' })); return; }
    box.appendChild(el('h4', { text: d.h }));
    if (d.p) box.appendChild(el('p', { text: d.p }));
    if (d.pages) {
      var g = el('div', { class: 'pages' });
      d.pages.forEach(function (pg, i) {
        var c = el('div');
        c.appendChild(el('b', { text: 'F' + (i + 1) + ' · ' + pg[0] }));
        c.appendChild(document.createTextNode(pg[1]));
        g.appendChild(c);
      });
      box.appendChild(g);
    }
  }

  var lastFocusIndex = -1;

  function renderPads() {
    var grid = document.getElementById('pad-grid');
    var mode = MODES[state.mode];
    var pads = mode.pads();
    grid.textContent = '';
    grid.setAttribute('aria-label', mode.label + ' mode pads, 4 by 4');
    grid.setAttribute('role', 'group');
    pads.forEach(function (p, i) {
      var padNum = 16 - (Math.floor(i / 4) * 4) - (3 - (i % 4));
      var b = el('button', {
        type: 'button',
        class: 'pad ' + p.kind,
        'aria-label': 'Pad ' + padNum + ': ' + p.label + (p.sub ? ', ' + p.sub : '') + (p.pressure !== undefined ? ', pressure-sensitive' : '')
      }, [el('span', { class: 'pl', text: p.label }), p.sub ? el('span', { class: 'ps', text: p.sub }) : null]);
      var style = '';
      if (p.color) style += '--c:' + p.color + ';';
      if (p.kind === 'full' && p.color) style += 'background:' + p.color + ';';
      if (p.pressure !== undefined) style += '--p:' + p.pressure + '%;';
      if (style) b.setAttribute('style', style);
      if (p.selected) b.setAttribute('aria-pressed', 'true');
      b.addEventListener('click', function () {
        lastFocusIndex = i;
        if (p.onPress) {
          p.onPress();
          renderPads();
          renderHero();
          var again = grid.children[i];
          if (again) again.focus();
        }
        showDetail(p.detail || { h: p.label, p: p.sub ? p.sub.charAt(0).toUpperCase() + p.sub.slice(1) + '.' : 'Utility pad.' });
      });
      grid.appendChild(b);
    });
  }

  function renderMode() {
    var m = MODES[state.mode];
    document.getElementById('mode-name').textContent = m.label;
    document.getElementById('mode-button').textContent = 'Stock ' + m.button;
    document.getElementById('mode-note').textContent = m.note;
    renderPads();
    showDetail(state.mode === 'chain' ? devDetail(state.device) : null);
  }

  function buildTabs() {
    var bar = document.getElementById('mode-tabs');
    if (!bar) return;
    var tabs = MODE_ORDER.map(function (key, i) {
      var m = MODES[key];
      var t = el('button', {
        type: 'button', role: 'tab', id: 'tab-' + key,
        'aria-controls': 'mode-panel',
        'aria-selected': key === state.mode ? 'true' : 'false',
        tabindex: key === state.mode ? '0' : '-1'
      }, [document.createTextNode(m.label), el('small', { text: m.button.replace(' button', '') })]);
      t.addEventListener('click', function () { select(key); });
      t.addEventListener('keydown', function (e) {
        var j = null;
        if (e.key === 'ArrowRight') j = (i + 1) % MODE_ORDER.length;
        else if (e.key === 'ArrowLeft') j = (i - 1 + MODE_ORDER.length) % MODE_ORDER.length;
        else if (e.key === 'Home') j = 0;
        else if (e.key === 'End') j = MODE_ORDER.length - 1;
        if (j !== null) { e.preventDefault(); select(MODE_ORDER[j]); tabs[j].focus(); }
      });
      bar.appendChild(t);
      return t;
    });
    function select(key) {
      state.mode = key;
      tabs.forEach(function (t, i) {
        var on = MODE_ORDER[i] === key;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.setAttribute('tabindex', on ? '0' : '-1');
      });
      document.getElementById('mode-panel').setAttribute('aria-labelledby', 'tab-' + key);
      renderMode();
    }
    document.getElementById('mode-panel').setAttribute('aria-labelledby', 'tab-' + state.mode);
  }

  /* ---------- hero mini grid mirrors chain mode ---------- */
  function renderHero() {
    var g = document.getElementById('hero-grid');
    if (!g) return;
    g.textContent = '';
    var saved = state.mode; state.mode = 'chain';
    MODES.chain.pads().forEach(function (p) {
      var s = el('span');
      var st = '';
      if (p.kind === 'full') st = 'background:' + p.color;
      else if (p.kind === 'ring') st = 'background:var(--pad-dark);box-shadow:inset 0 0 0 3px ' + p.color;
      else if (p.kind === 'dim') st = 'background:var(--pad-dark);outline:2px dashed #6A6862;outline-offset:-4px';
      else if (p.kind === 'util') st = 'background:var(--pad-util)';
      else st = 'background:var(--pad-light)';
      s.setAttribute('style', st);
      g.appendChild(s);
    });
    state.mode = saved;
  }

  /* ---------- screen mockups ---------- */
  function arc(pct, knob, color) {
    var a = (135 + knob * 270) * Math.PI / 180;
    var tick = Math.abs(knob - pct) > 0.03
      ? '<circle cx="' + (50 + 40 * Math.cos(a)).toFixed(1) + '" cy="' + (50 + 40 * Math.sin(a)).toFixed(1) + '" r="7" fill="#0E0F10" stroke="#F2F0EA" stroke-width="4"/>'
      : '';
    return '<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="40" fill="none" stroke="#34353A" stroke-width="10" pathLength="100" stroke-dasharray="75 100" transform="rotate(135 50 50)"/>' +
      '<circle cx="50" cy="50" r="40" fill="none" stroke="' + color + '" stroke-width="10" pathLength="100" stroke-dasharray="' + (pct * 75).toFixed(1) + ' 100" transform="rotate(135 50 50)"/>' + tick + '</svg>';
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function screen(o) {
    var t = TRACKS[o.track];
    var c = o.color || t.color;
    var head = '<div class="sb"><span>' + (o.global ? '' : '<span style="color:' + c + '">' + t.glyph + ' T' + t.n + '</span> · ') + esc(o.crumbs) + '</span><span class="r">' + esc(o.right || '92.0 · CPU 41%') + '</span></div>';
    var fl = '<div class="fl" style="--c:' + c + '">' + o.pages.map(function (p, i) { return '<span' + (i === 0 ? ' class="on"' : '') + '>' + esc(p) + '</span>'; }).join('') + '</div>';
    var vr = o.vals ? '<div class="vr">' + o.vals.map(function (v) {
      return '<div class="vi">' + arc(v[3], v[4] === undefined ? v[3] : v[4], c) + '<div><span class="vl">' + esc(v[0]) + '</span><span class="vv">' + esc(v[1]) + '</span><span class="vu">' + esc(v[2] || ' ') + '</span></div></div>';
    }).join('') + '</div>' : '';
    return '<div class="scr' + (o.large ? ' large' : '') + '" aria-hidden="true">' + head + fl + '<div class="vis">' + o.visual + '</div>' + vr + '</div>';
  }

  function visLanes() {
    var by = [['filter'], ['color'], ['granular'], []];
    return '<div class="lanes">' + TRACKS.map(function (t, i) {
      return '<div class="lane"><span class="g" style="color:' + t.color + '">' + t.glyph + t.n + '</span>' + DEV_ORDER.map(function (k) {
        if (i === 0 && k === 'granular') return '<span class="blk" style="background:' + t.color + ';color:#141412">' + DEVICES[k].short + '</span>';
        if (by[i].indexOf(k) !== -1) return '<span class="blk off">' + DEVICES[k].short + '</span>';
        return '<span class="blk" style="background:' + t.dim + '">' + DEVICES[k].short + '</span>';
      }).join('') + '</div>';
    }).join('') + '</div>';
  }
  function visGrains() {
    var out = '<div style="position:absolute;left:3%;right:3%;top:50%;height:1px;background:#34353A"></div>';
    for (var j = 0; j < 46; j++) {
      var x = 4 + ((j * 97) % 560) / 640 * 92;
      var y = 12 + ((j * 53) % 140) / 228 * 100;
      var s = 1.2 + (j % 5) * 0.8;
      var col = (x > 32 && x < 66) ? '#56B4E9' : '#3E6F8C';
      out += '<span class="dot" style="left:' + x.toFixed(1) + '%;top:' + y.toFixed(1) + '%;width:' + s.toFixed(1) + '%;aspect-ratio:1;background:' + col + '"></span>';
    }
    return out;
  }
  function visBands() {
    var out = '<div class="bands">';
    for (var k = 0; k < 48; k++) {
      var d = (k - 20) / 4;
      var h = (k < 20 ? 30 : Math.max(4, 30 - (k - 20) * 1.5)) + 60 * Math.exp(-d * d) + 4;
      out += '<i style="height:' + Math.min(h, 98).toFixed(0) + '%;background:' + (Math.abs(k - 20) <= 2 ? '#2BBF95' : '#3B7A66') + '"></i>';
    }
    return out + '</div>';
  }
  function visLarge() {
    return '<div class="big"><svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="40" fill="none" stroke="#34353A" stroke-width="9" pathLength="100" stroke-dasharray="75 100" transform="rotate(135 50 50)"/><circle cx="50" cy="50" r="40" fill="none" stroke="#2BBF95" stroke-width="9" pathLength="100" stroke-dasharray="46 100" transform="rotate(135 50 50)"/></svg>' +
      '<div><span class="bl">CUTOFF</span><span class="bv">2.4</span><span class="bl">kHz</span></div></div>';
  }

  function renderScreens() {
    var host = document.getElementById('screens-list');
    if (!host) return;
    var shots = [
      { t: 'Chain (home)', d: 'Four lanes mirror the pad grid. A solid block is the device being edited, a dashed block is bypassed. The knobs control the focused track’s mix.',
        html: screen({ track: 0, crumbs: 'CHAIN', pages: ['TRACKS', 'SCENES', 'PROJECT'], visual: visLanes(),
          vals: [['LEVEL', '−3.5', 'dB', 0.72], ['PAN', 'C', '', 0.5], ['DJ FLT', '12', '% LP', 0.38]] }) },
      { t: 'Granular · Grain page', d: 'Grains are dots over the 4-second buffer. The hollow tick on the Contour arc is the physical knob, still catching up under scaled takeover.',
        html: screen({ track: 1, crumbs: 'GRANULAR · GRAIN', right: '92.0 · CPU 58%', pages: ['GRAIN', 'SPRAY', 'PITCH'], visual: visGrains(),
          vals: [['SIZE', '120', 'ms', 0.42], ['DENSITY', '64', '%', 0.64], ['CONTOUR', '0.42', '', 0.42, 0.2]] }) },
      { t: 'Filter · Tone page', d: '48 bars, one per resonator band. Morph slides the bank between LP, BP and HP shapes, and Resonance sharpens the peak.',
        html: screen({ track: 2, color: '#2BBF95', crumbs: 'FILTER · TONE', right: '92.0 · CPU 47%', pages: ['TONE', 'BANK', 'MODE'], visual: visBands(),
          vals: [['CUTOFF', '2.4', 'kHz', 0.61], ['RESO', '61', '%', 0.61], ['MORPH', '0.30', 'LP›BP', 0.3]] }) },
      { t: 'Large mode', d: 'An accessibility mode: one value fills the screen. Knob 1 or the encoder adjusts it, and F1–F3 still switch pages.',
        html: screen({ track: 2, color: '#2BBF95', crumbs: 'FILTER · TONE', right: 'VALUE 1 / 3', pages: ['TONE', 'BANK', 'MODE'], visual: visLarge(), large: true }) }
    ];
    shots.forEach(function (s) {
      var fig = el('figure', { class: 'shot' });
      var box = el('div', { class: 'scr-box' });
      box.innerHTML = s.html; // static, author-controlled markup
      fig.appendChild(box);
      var cap = el('figcaption');
      cap.appendChild(el('b', { text: s.t }));
      cap.appendChild(el('span', { text: s.d }));
      fig.appendChild(cap);
      host.appendChild(fig);
    });
  }

  function init() {
    try {
      buildTabs();
      renderMode();
      renderHero();
      renderScreens();
    } catch (err) {
      // Keep the written walkthrough usable even if a widget fails.
      if (window.console) console.error('CHISEL widgets failed to render:', err);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
