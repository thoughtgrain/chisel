/* CHISEL concept site: pad explorer with a live screen, plus the screen gallery.
   Everything here is progressive: the page reads fine without JS,
   these just add the interactive grid and the drawn screens.

   One `state` object drives both the pads and the explorer's screen,
   so they can never disagree. Every pad press mutates state, then
   renderExplorer() redraws pads, screen, F-buttons and the detail panel. */
(function () {
  'use strict';

  /* ---------------------------------------------------------------- data */

  var TRACKS = [
    { n: 1, glyph: '●', color: '#E69F00', dim: '#4A3A1A' },
    { n: 2, glyph: '▲', color: '#56B4E9', dim: '#1E3644' },
    { n: 3, glyph: '■', color: '#2BBF95', dim: '#123A30', pad: '#009E73' },
    { n: 4, glyph: '◆', color: '#CC79A7', dim: '#3E2535' }
  ];
  function padColor(t) { return t.pad || t.color; }

  // Values are [label, display value, unit, arc 0..1, physical knob 0..1 (optional)].
  var DEVICES = {
    material: {
      name: 'Material', short: 'MAT', visual: 'wave',
      what: 'What the track is: a tape loop, a poly sampler, live input, or off.',
      pages: [
        { name: 'Tape', vals: [['START', '1.24', 's', 0.3], ['LENGTH', '2.00', 's', 0.45], ['SPEED', '0.75', '×', 0.4, 0.68]] },
        { name: 'Play', vals: [['MODE', 'TAPE', '', 0.25], ['LEVEL', '−3.0', 'dB', 0.72], ['PAN', 'C', '', 0.5]] },
        { name: 'Env', vals: [['ATTACK', '12', 'ms', 0.1], ['RELEASE', '340', 'ms', 0.45], ['FADE', '20', 'ms', 0.2]] }
      ],
      actions: [['Rec', 'pressure = input gain'], ['Play/Stop', 'pressure = tape slowdown'], ['Reverse', ''], ['Retrig', '']]
    },
    granular: {
      name: 'Granular', short: 'GRN', visual: 'grains',
      what: 'Live granular processing over a 4-second buffer.',
      pages: [
        { name: 'Grain', vals: [['SIZE', '120', 'ms', 0.42], ['DENSITY', '64', '%', 0.64], ['CONTOUR', '0.42', '', 0.42, 0.2]] },
        { name: 'Spray', vals: [['POS', '1.80', 's', 0.45], ['SCATTER', '35', '%', 0.35], ['WIDTH', '80', '%', 0.8]] },
        { name: 'Pitch', vals: [['PITCH', '+7', 'st', 0.62], ['P.SCAT', '12', '%', 0.12], ['MIX', '70', '%', 0.7]] }
      ],
      actions: [['Freeze', 'pressure = freeze blend'], ['Spray', 'burst'], ['+12', 'pitch'], ['Dense', 'surge']]
    },
    filter: {
      name: 'Filter', short: 'FLT', visual: 'bands',
      what: 'A 48-band resonator bank that also does classic LP, BP and HP shapes.',
      pages: [
        { name: 'Tone', vals: [['CUTOFF', '2.4', 'kHz', 0.61], ['RESO', '61', '%', 0.61], ['MORPH', '0.30', 'LP›BP', 0.3]] },
        { name: 'Bank', vals: [['ROOT', 'C3', '', 0.3], ['SPREAD', '1.5', 'oct', 0.5], ['ANIMATE', '22', '%', 0.22]] },
        { name: 'Mode', vals: [['TYPE', 'RES', '', 0.9], ['DRIVE', '18', '%', 0.18], ['MIX', '100', '%', 1]] }
      ],
      actions: [['Swell', 'resonance'], ['Sweep ↓', ''], ['Sweep ↑', ''], ['Morph', 'hold']]
    },
    color: {
      name: 'Color', short: 'COL', visual: 'curve',
      what: 'Dual-band drive, bit crushing, noise and compression.',
      pages: [
        { name: 'Drive', vals: [['LOW', '40', '%', 0.4], ['HIGH', '62', '%', 0.62], ['XOVER', '800', 'Hz', 0.4]] },
        { name: 'Crush', vals: [['BITS', '10', 'bit', 0.6], ['RATE', '22k', 'Hz', 0.7], ['NOISE', '8', '%', 0.08]] },
        { name: 'Glue', vals: [['COMP', '3.0', ':1', 0.3], ['RELEASE', '120', 'ms', 0.35], ['MIX', '85', '%', 0.85]] }
      ],
      actions: [['Drive', 'push'], ['Crush', 'push'], ['Noise', 'in'], ['Slam', 'comp']]
    },
    space: {
      name: 'Space', short: 'SPC', visual: 'decay',
      what: 'Stereo reverb and delay with freeze.',
      pages: [
        { name: 'Room', vals: [['SIZE', '72', '%', 0.72], ['DECAY', '4.2', 's', 0.55], ['DAMP', '35', '%', 0.35]] },
        { name: 'Delay', vals: [['TIME', '3/16', 'sync', 0.4], ['FDBK', '48', '%', 0.48], ['TYPE', 'PING', '', 0.5]] },
        { name: 'Blend', vals: [['REV/DLY', '60', '% rev', 0.6], ['FREEZE', 'OFF', '', 0], ['MIX', '30', '%', 0.3]] }
      ],
      actions: [['Freeze', 'tail'], ['Throw', 'delay'], ['Wash', ''], ['Kill', 'tails']]
    }
  };
  var DEV_ORDER = ['material', 'granular', 'filter', 'color', 'space'];

  var MODE_PAGES = {
    home: ['TRACKS', 'SCENES', 'PROJECT'],
    perform: ['MACROS', 'SCENES', 'MAP'],
    mod: ['SHAPE', 'TIMING', 'TARGETS'],
    mix: ['STRIP', 'INPUT', 'MASTER'],
    keys: ['SCALE', 'RANGE', 'TOUCH']
  };

  var state = {
    mode: 'chain',
    chainView: 'home',          // 'home' (4 lanes) or 'device' (a device page)
    track: 0,
    device: 'granular',
    page: {},                   // page index per device id or mode screen id
    bypass: { 0: ['filter'], 1: ['color'], 2: ['granular'], 3: [] },
    action: null,               // { label, pressure } last action/punch pressed
    macro: 3,
    modSlot: 1,
    modShape: 'LFO',
    note: 'C3',
    mute: { 2: true },
    solo: { 3: true }
  };

  function pageOf(key) { return state.page[key] || 0; }
  function setPage(key, i) { state.page[key] = ((i % 3) + 3) % 3; }
  function screenKey() {
    if (state.mode === 'chain') return state.chainView === 'device' ? state.device : 'home';
    return state.mode;
  }

  /* --------------------------------------------------------- pad builders */

  function pad(kind, label, sub, opts) {
    opts = opts || {};
    return { kind: kind, label: label, sub: sub || '', color: opts.color, pressure: opts.pressure,
      onPress: opts.onPress, detail: opts.detail, selected: opts.selected };
  }

  function trackPads(goHome) {
    return TRACKS.map(function (t, i) {
      var on = i === state.track;
      return pad(on ? 'full' : 'ring', t.glyph + ' Track ' + t.n, on ? 'focused' : '', {
        color: padColor(t), selected: on,
        onPress: function () { state.track = i; state.action = null; if (goHome) state.chainView = 'home'; },
        detail: { h: t.glyph + ' Track ' + t.n, p: goHome
          ? 'Tap to focus the track and show the Chain home screen. Hold to solo it. Every device pad now edits this track.'
          : 'Switches the focused track without leaving this mode.' }
      });
    });
  }

  var MODES = {
    chain: {
      label: 'Chain', button: 'Sample button',
      note: 'Home. Tracks on top, the chain in reading order, and the four pressure-sensitive action pads under your thumbs. Tap a device to open its page on screen; tap it again to step through its three pages.',
      pads: function () {
        var t = TRACKS[state.track];
        var by = state.bypass[state.track];
        function dev(key) {
          var d = DEVICES[key];
          var off = by.indexOf(key) !== -1;
          var on = state.chainView === 'device' && state.device === key;
          return pad(on ? 'full' : (off ? 'dim' : 'ring'), d.name, on ? 'page ' + (pageOf(key) + 1) + ' of 3' : (off ? 'bypassed' : ''), {
            color: padColor(t), selected: on,
            onPress: function () {
              state.action = null;
              if (state.chainView === 'device' && state.device === key) setPage(key, pageOf(key) + 1);
              else { state.device = key; state.chainView = 'device'; }
            },
            detail: devDetail(key)
          });
        }
        var focus = state.chainView === 'device' ? state.device : null;
        var acts = (focus ? DEVICES[focus].actions : null);
        var actionPads = [0, 1, 2, 3].map(function (i) {
          var letter = 'ABCD'.charAt(i);
          if (!acts) {
            return pad('act', letter + ' · —', 'pick a device', { pressure: 0,
              detail: { h: 'Action ' + letter, p: 'The action pads follow the focused device. Tap a device pad first and these become its four actions.' } });
          }
          var a = acts[i], p = [64, 20, 8, 36][i];
          return pad('act', letter + ' · ' + a[0], a[1].replace('pressure = ', ''), {
            pressure: p,
            onPress: function () { state.action = { label: letter + ' · ' + a[0].toUpperCase(), pressure: p }; },
            detail: { h: 'Action ' + letter + ': ' + a[0], p: 'One of the S-4’s four action buttons, made pressure-sensitive. It follows the focused device (' + DEVICES[focus].name + ' right now). ' + (a[1] ? a[1].charAt(0).toUpperCase() + a[1].slice(1) + '.' : '') }
          });
        });
        return trackPads(true).concat([
          dev('material'), dev('granular'), dev('filter'), dev('color'),
          dev('space'),
          pad('util', 'Bypass', 'hold + device', { detail: { h: 'Bypass', p: 'Hold, then tap a device pad to bypass it. Shift + Bypass latches, so it works one-handed.' } }),
          pad('util', 'Copy', 'hold src, tap dst', { detail: { h: 'Copy', p: 'Hold and tap a source device or track, then tap the destination.' } }),
          pad('util', 'Capture', 'resample', { detail: { h: 'Capture', p: 'Resamples the focused track through its whole chain into a new Material.' } })
        ]).concat(actionPads);
      }
    },
    perform: {
      label: 'Perform', button: 'Pad FX button',
      note: 'The S-4’s Perform page has 12 macros. Here they all respond to pressure: macros spring back on release, and Shift + tap latches one. Hold two scenes and move the fader to morph between them.',
      pads: function () {
        var c = padColor(TRACKS[state.track]);
        var depth = { 1: 64, 2: 28, 3: 80, 4: 8, 5: 50, 6: 16, 7: 36, 8: 92 };
        function m(n) {
          var latched = n === 3 || n === 8;
          return pad('act', 'Macro ' + n, latched ? 'latched' : '', {
            pressure: depth[n], selected: state.macro === n,
            onPress: function () { state.macro = n; state.action = null; },
            detail: { h: 'Macro ' + n, p: 'Pad pressure sets the macro value. Release springs it back unless it’s latched with Shift + tap. Map any parameters to it on the F3 Map page.' } });
        }
        function punch(n, s) {
          return pad('act', 'Punch ' + n, s, { pressure: 20,
            onPress: function () { state.action = { label: 'PUNCH ' + n + ' · ' + s.toUpperCase(), pressure: 70 }; },
            detail: { h: 'Punch-in ' + n + ': ' + s, p: 'A momentary effect. Pressure sets its depth while you hold it.' } });
        }
        return [
          punch(1, 'stutter'), punch(2, 'tape stop'), punch(3, 'wash'), punch(4, 'kill'),
          m(5), m(6), m(7), m(8),
          m(1), m(2), m(3), m(4),
          pad('full', 'Scene A', 'from', { color: c, detail: { h: 'Scene A', p: 'Tap to recall. Shift + tap to store. Hold A and C, then move the fader, to morph between them.' } }),
          pad('util', 'Scene B', '', { detail: { h: 'Scene B', p: 'A stored scene.' } }),
          pad('ring', 'Scene C', 'to', { color: c, detail: { h: 'Scene C', p: 'Morph target. The fader position shows on screen as a marker between A and C.' } }),
          pad('dim', 'Scene D', 'empty', { detail: { h: 'Scene D', p: 'Empty. Shift + tap stores the current state here.' } })
        ];
      }
    },
    mod: {
      label: 'Mod', button: 'Sequence button',
      note: 'Four modulators per track, as on the S-4. Pick a slot, then a shape. To assign a target, hold a slot pad and turn any knob on any page; how far you turn sets the depth.',
      pads: function () {
        var c = padColor(TRACKS[state.track]);
        function slot(n, sub) {
          var on = state.modSlot === n;
          return pad(on ? 'full' : (sub === 'empty' ? 'dim' : 'ring'), 'Mod ' + n, sub, {
            color: c, selected: on, onPress: function () { state.modSlot = n; },
            detail: { h: 'Mod ' + n, p: 'Tap to select. Hold it and turn a knob anywhere to add a destination; release to commit. Shift + tap latches assign mode.' } });
        }
        function shape(s) {
          var on = state.modShape === s;
          return pad(on ? 'full' : 'util', s, on ? 'selected' : '', {
            color: c, selected: on, onPress: function () { state.modShape = s; },
            detail: { h: s, p: 'Sets the shape of the selected slot. The screen redraws it on the Shape page.' } });
        }
        return [
          slot(1, 'LFO · 3 targets'), slot(2, 'envelope'), slot(3, 'empty'), slot(4, 'empty'),
          shape('LFO'), shape('Random'), shape('Envelope'), shape('Follower'),
          pad('util', 'Sync', 'on'), pad('util', 'Retrig', 'off'), pad('util', 'Uni / Bi', 'bipolar'),
          pad('util', 'Clear', 'hold', { detail: { h: 'Clear', p: 'Hold to clear the selected slot. There is no timing threshold: the screen asks for confirmation.' } })
        ].concat(trackPads(false));
      }
    },
    mix: {
      label: 'Mix', button: 'Knob FX button',
      note: 'The one grid where columns mean tracks, because a mixer reads in channel strips. The knobs set level, pan and the DJ filter, and F3 opens the master bus.',
      pads: function () {
        var rows = [];
        TRACKS.forEach(function (t, i) {
          var on = i === state.track;
          rows.push(pad(on ? 'full' : 'ring', 'Select ' + t.n, on ? 'selected' : '', { color: padColor(t), selected: on,
            onPress: function () { state.track = i; },
            detail: { h: 'Select ' + t.n, p: 'Focuses this strip for the knobs and fader. The screen highlights it.' } }));
        });
        [0, 1, 2, 3].forEach(function (i) {
          var on = !!state.mute[i];
          rows.push(pad(on ? 'dim' : 'util', 'Mute ' + (i + 1), on ? 'MUTED' : '', {
            onPress: function () { state.mute[i] = !state.mute[i]; },
            detail: { h: 'Mute ' + (i + 1), p: 'Toggles mute. A muted track shows a dashed edge and the word MUTED, never color alone.' } }));
        });
        [0, 1, 2, 3].forEach(function (i) {
          var on = !!state.solo[i];
          rows.push(pad(on ? 'full' : 'util', 'Solo ' + (i + 1), on ? 'SOLO ON' : '', { color: padColor(TRACKS[i]),
            onPress: function () { state.solo[i] = !state.solo[i]; },
            detail: { h: 'Solo ' + (i + 1), p: 'Toggles solo. The strip badge reads SOLO.' } }));
        });
        [1, 2, 3, 4].forEach(function (n) { rows.push(n === 4 ? pad('act', 'Input 4', 'monitoring', { pressure: 0 }) : pad('util', 'Input ' + n, 'off')); });
        return rows;
      }
    },
    keys: {
      label: 'Keys', button: '16 Levels button',
      note: 'Plays the focused track’s Material chromatically, scale-locked from the root at pad 1. Velocity sets level, and per-voice aftertouch defaults to grain pitch scatter.',
      pads: function () {
        var c = padColor(TRACKS[state.track]);
        var names = ['G#4', 'A#4', 'C5', 'D5', 'D4', 'D#4', 'F4', 'G4', 'G3', 'G#3', 'A#3', 'C4', 'C3', 'D3', 'D#3', 'F3'];
        return names.map(function (n) {
          var root = n.charAt(0) === 'C';
          return pad(root ? 'full' : 'ring', n, root ? 'root' : '', {
            color: c, selected: state.note === n, onPress: function () { state.note = n; },
            detail: { h: n + (root ? ' (root)' : ''), p: 'C minor shown. The knobs set Root, Scale and Octave.' } });
        });
      }
    }
  };
  var MODE_ORDER = ['chain', 'perform', 'mod', 'mix', 'keys'];

  function devDetail(key) {
    var d = DEVICES[key];
    return { h: d.name, p: d.what, pages: d.pages, active: pageOf(key) };
  }

  /* ------------------------------------------------------------- helpers */

  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === 'text') n.textContent = attrs[k];
      else n.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* ------------------------------------------------------ screen drawing */

  function arc(pct, knob, color) {
    var a = (135 + knob * 270) * Math.PI / 180;
    var tick = Math.abs(knob - pct) > 0.03
      ? '<circle cx="' + (50 + 40 * Math.cos(a)).toFixed(1) + '" cy="' + (50 + 40 * Math.sin(a)).toFixed(1) + '" r="7" fill="#0E0F10" stroke="#F2F0EA" stroke-width="4"/>'
      : '';
    return '<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="40" fill="none" stroke="#34353A" stroke-width="10" pathLength="100" stroke-dasharray="75 100" transform="rotate(135 50 50)"/>' +
      '<circle cx="50" cy="50" r="40" fill="none" stroke="' + color + '" stroke-width="10" pathLength="100" stroke-dasharray="' + (pct * 75).toFixed(1) + ' 100" transform="rotate(135 50 50)"/>' + tick + '</svg>';
  }

  function screen(o) {
    var t = TRACKS[o.track];
    var c = o.color || t.color;
    var active = o.active || 0;
    var head = '<div class="sb"><span>' + (o.global ? '' : '<span style="color:' + c + '">' + t.glyph + ' T' + t.n + '</span> · ') + esc(o.crumbs) + '</span><span class="r">' + esc(o.right || '92.0 · CPU 41%') + '</span></div>';
    var fl = '<div class="fl" style="--c:' + c + '">' + o.pages.map(function (p, i) { return '<span' + (i === active ? ' class="on"' : '') + '>' + esc(p) + '</span>'; }).join('') + '</div>';
    var vr = o.vals ? '<div class="vr">' + o.vals.map(function (v) {
      return '<div class="vi">' + arc(v[3], v[4] === undefined ? v[3] : v[4], c) + '<div><span class="vl">' + esc(v[0]) + '</span><span class="vv">' + esc(v[1]) + '</span><span class="vu">' + esc(v[2] || ' ') + '</span></div></div>';
    }).join('') + '</div>' : '';
    var overlay = o.overlay ? '<div class="ovl" style="--c:' + c + '"><span>' + esc(o.overlay.label) + '</span><i style="--p:' + o.overlay.pressure + '%"></i><b>' + o.overlay.pressure + '%</b></div>' : '';
    return '<div class="scr' + (o.large ? ' large' : '') + '" aria-hidden="true">' + head + fl + '<div class="vis">' + o.visual + overlay + '</div>' + vr + '</div>';
  }

  function visLanes(focusTrack, focusDevice) {
    return '<div class="lanes">' + TRACKS.map(function (t, i) {
      var by = state.bypass[i];
      return '<div class="lane"><span class="g" style="color:' + t.color + '">' + t.glyph + t.n + '</span>' + DEV_ORDER.map(function (k) {
        if (i === focusTrack && k === focusDevice) return '<span class="blk" style="background:' + t.color + ';color:#141412">' + DEVICES[k].short + '</span>';
        if (by.indexOf(k) !== -1) return '<span class="blk off">' + DEVICES[k].short + '</span>';
        return '<span class="blk" style="background:' + t.dim + '">' + DEVICES[k].short + '</span>';
      }).join('') + '</div>';
    }).join('') + '</div>';
  }
  function visWave(c) {
    var out = '<div class="wave">';
    for (var i = 0; i < 64; i++) {
      var h = 10 + Math.abs(Math.sin(i * 0.37) * Math.cos(i * 0.11)) * 85 + (i % 7);
      out += '<i style="height:' + Math.min(h, 98).toFixed(0) + '%;background:' + (i >= 18 && i < 44 ? c : '#5A5955') + '"></i>';
    }
    return out + '</div><span class="loop" style="left:31%;width:40%;border-color:' + c + '"></span><span class="head" style="left:52%"></span>';
  }
  function visGrains(c) {
    var out = '<div style="position:absolute;left:3%;right:3%;top:50%;height:1px;background:#34353A"></div>';
    for (var j = 0; j < 46; j++) {
      var x = 4 + ((j * 97) % 560) / 640 * 92;
      var y = 12 + ((j * 53) % 140) / 228 * 100;
      var s = 1.2 + (j % 5) * 0.8;
      var col = (x > 32 && x < 66) ? c : '#3E6F8C';
      out += '<span class="dot" style="left:' + x.toFixed(1) + '%;top:' + y.toFixed(1) + '%;width:' + s.toFixed(1) + '%;aspect-ratio:1;background:' + col + '"></span>';
    }
    return out;
  }
  function visBands(c) {
    var out = '<div class="bands">';
    for (var k = 0; k < 48; k++) {
      var d = (k - 20) / 4;
      var h = (k < 20 ? 30 : Math.max(4, 30 - (k - 20) * 1.5)) + 60 * Math.exp(-d * d) + 4;
      out += '<i style="height:' + Math.min(h, 98).toFixed(0) + '%;background:' + (Math.abs(k - 20) <= 2 ? c : '#4A4A47') + '"></i>';
    }
    return out + '</div>';
  }
  function visCurve(c) {
    return '<svg class="fill" viewBox="0 0 300 100" preserveAspectRatio="none" aria-hidden="true"><line x1="0" y1="100" x2="300" y2="0" stroke="#34353A" stroke-width="2" stroke-dasharray="4 4"/>' +
      '<path d="M0 100 C 60 70, 90 20, 150 12 S 260 4, 300 3" fill="none" stroke="' + c + '" stroke-width="4"/></svg>';
  }
  function visDecay(c) {
    var taps = '';
    [0.25, 0.43, 0.61, 0.79].forEach(function (x, i) { taps += '<line x1="' + x * 300 + '" y1="100" x2="' + x * 300 + '" y2="' + (30 + i * 16) + '" stroke="#F2F0EA" stroke-width="3"/>'; });
    return '<svg class="fill" viewBox="0 0 300 100" preserveAspectRatio="none" aria-hidden="true"><path d="M0 4 C 60 30, 120 70, 300 96 L300 100 L0 100Z" fill="' + c + '" fill-opacity="0.35"/><path d="M0 4 C 60 30, 120 70, 300 96" fill="none" stroke="' + c + '" stroke-width="3"/>' + taps + '</svg>';
  }
  function visMod(c) {
    var paths = {
      LFO: 'M0 50 C 25 0, 50 0, 75 50 S 125 100, 150 50 S 200 0, 225 50 S 275 100, 300 50',
      Random: 'M0 60 H40 V20 H80 V75 H120 V35 H160 V85 H200 V15 H240 V55 H280 V40 H300',
      Envelope: 'M0 95 L30 8 L80 40 L220 40 L300 95',
      Follower: 'M0 80 C 20 30, 30 70, 50 40 S 80 20, 100 60 S 140 10, 160 50 S 200 80, 220 30 S 270 60, 300 45'
    };
    return '<div class="modv"><svg viewBox="0 0 300 100" preserveAspectRatio="none" aria-hidden="true"><line x1="0" y1="50" x2="300" y2="50" stroke="#34353A" stroke-width="2"/><path d="' + paths[state.modShape] + '" fill="none" stroke="' + c + '" stroke-width="4"/></svg>' +
      '<ul><li class="h">MOD ' + state.modSlot + ' → </li><li>GRN SIZE <b style="color:' + c + '">+38</b></li><li>FLT CUT <b style="color:' + c + '">−22</b></li><li>SPC MIX <b style="color:' + c + '">+10</b></li></ul></div>';
  }
  function visMacros(c) {
    var depth = [64, 28, 80, 8, 50, 16, 36, 92];
    var bars = depth.map(function (d, i) {
      var n = i + 1, on = n === state.macro, latched = n === 3 || n === 8;
      return '<div class="mb"><div class="mt"><i style="height:' + d + '%;background:' + (on ? c : '#F2F0EA') + '"></i></div><span class="' + (latched ? 'lat' : '') + '"' + (on ? ' style="color:' + c + '"' : '') + '>' + n + '</span></div>';
    }).join('');
    return '<div class="macros">' + bars + '</div><div class="morph"><span class="sa" style="background:' + c + '">A</span><div class="mtr"><i style="width:40%;background:' + c + '"></i><b style="left:40%"></b></div><span class="sc">C</span></div>';
  }
  function visStrips() {
    return '<div class="strips">' + TRACKS.map(function (t, i) {
      var lvl = [78, 52, 40, 64][i], sel = i === state.track, mute = !!state.mute[i], solo = !!state.solo[i];
      var badge = mute ? '<em class="bm">MUTE</em>' : (solo ? '<em class="bs" style="background:' + t.color + '">SOLO</em>' : (sel ? '<em class="bsel">SEL</em>' : '<em>·</em>'));
      return '<div class="strip' + (sel ? ' sel' : '') + '"><span style="color:' + t.color + '">' + t.glyph + t.n + '</span><div class="mt"><i style="height:' + (mute ? 0 : lvl) + '%;background:' + t.color + '"></i></div>' + badge + '</div>';
    }).join('') + '</div>';
  }
  function visKeys(c) {
    var scale = ['C', 'D', 'D#', 'F', 'G', 'G#', 'A#'];
    var played = state.note.replace(/\d/g, '');
    return '<div class="keysv"><span class="kn">' + esc(state.note) + '</span><div class="kr">' + scale.map(function (n) {
      return '<span' + (n === played ? ' style="background:' + c + ';color:#141412"' : '') + '>' + n + '</span>';
    }).join('') + '</div></div>';
  }

  // Builds the explorer's screen from state. Returns { html, say } where `say`
  // is the plain-text version announced to screen readers.
  function explorerScreen() {
    var t = TRACKS[state.track], c = t.color, key = screenKey(), pg = pageOf(key);
    var o, say;
    if (state.mode === 'chain' && state.chainView === 'device') {
      var d = DEVICES[state.device], page = d.pages[pg];
      var vis = { wave: visWave, grains: visGrains, bands: visBands, curve: visCurve, decay: visDecay }[d.visual](c);
      o = { track: state.track, crumbs: d.name.toUpperCase() + ' · ' + page.name.toUpperCase(), pages: d.pages.map(function (p) { return p.name.toUpperCase(); }),
        active: pg, visual: vis, vals: page.vals, overlay: state.action };
      say = 'Track ' + t.n + ', ' + d.name + ', ' + page.name + ' page';
    } else if (state.mode === 'chain') {
      var lvl = [['LEVEL', '−3.5', 'dB', 0.72], ['PAN', 'C', '', 0.5], ['DJ FLT', '12', '% LP', 0.38]];
      o = { track: state.track, crumbs: 'CHAIN', pages: MODE_PAGES.home, active: pg, visual: visLanes(state.track, null), vals: lvl };
      say = 'Chain home, track ' + t.n + ' focused';
    } else if (state.mode === 'perform') {
      o = { track: state.track, global: true, crumbs: 'PERFORM · ' + MODE_PAGES.perform[pg], right: '92.0 · CPU 52%', pages: MODE_PAGES.perform, active: pg, color: '#F2F0EA',
        visual: visMacros(c), vals: [['MACRO', String(state.macro), 'depth', [64, 28, 80, 8, 50, 16, 36, 92][state.macro - 1] / 100], ['SCENE', 'A›C', '', 0.4], ['MORPH', '40', '% fader', 0.4]], overlay: state.action };
      say = 'Perform, macro ' + state.macro + ' selected';
    } else if (state.mode === 'mod') {
      o = { track: state.track, crumbs: 'MOD ' + state.modSlot + ' · ' + state.modShape.toUpperCase(), pages: MODE_PAGES.mod, active: pg, visual: visMod(c),
        vals: [['RATE', '1/8', 'sync', 0.55], ['DEPTH', '38', '%', 0.38], ['PHASE', '90', '°', 0.25]] };
      say = 'Mod ' + state.modSlot + ', ' + state.modShape + ', track ' + t.n;
    } else if (state.mode === 'mix') {
      o = { track: state.track, crumbs: 'MIX · ' + MODE_PAGES.mix[pg], pages: MODE_PAGES.mix, active: pg, visual: visStrips(),
        vals: [['LEVEL', '−4.0', 'dB', 0.7], ['PAN', 'L12', '', 0.38], ['DJ FLT', '18', '% HP', 0.59]] };
      say = 'Mix, strip ' + t.n + ' selected' + (state.mute[state.track] ? ', muted' : '');
    } else {
      o = { track: state.track, crumbs: 'KEYS · ' + MODE_PAGES.keys[pg], pages: MODE_PAGES.keys, active: pg, visual: visKeys(c),
        vals: [['ROOT', 'C', '', 0], ['SCALE', 'MIN', '', 0.3], ['OCTAVE', '3', '', 0.5]] };
      say = 'Keys, playing ' + state.note;
    }
    if (o.vals) say += '. Knobs: ' + o.vals.map(function (v) { return v[0].toLowerCase() + ' ' + v[1] + (v[2] ? ' ' + v[2] : ''); }).join(', ');
    if (o.overlay) say += '. ' + o.overlay.label + ' at ' + o.overlay.pressure + ' percent pressure';
    return { html: screen(o), say: say, pages: o.pages, active: o.active || 0 };
  }

  /* ----------------------------------------------------- explorer render */

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
        var c = el('div', i === d.active ? { class: 'on' } : null);
        c.appendChild(el('b', { text: 'F' + (i + 1) + ' · ' + pg.name }));
        c.appendChild(document.createTextNode(pg.vals.map(function (v) { return v[0].charAt(0) + v[0].slice(1).toLowerCase(); }).join(' · ')));
        g.appendChild(c);
      });
      box.appendChild(g);
    }
  }

  function renderScreen() {
    var host = document.getElementById('ex-screen');
    if (!host) return;
    var s = explorerScreen();
    host.innerHTML = s.html; // author-controlled markup only
    var fb = document.getElementById('ex-fbtns');
    if (fb) {
      Array.prototype.forEach.call(fb.children, function (b, i) {
        b.setAttribute('aria-pressed', i === s.active ? 'true' : 'false');
        b.setAttribute('aria-label', 'F' + (i + 1) + ': ' + s.pages[i].toLowerCase() + ' page');
        b.querySelector('span').textContent = s.pages[i];
      });
    }
    var live = document.getElementById('ex-live');
    if (live) live.textContent = 'Screen: ' + s.say + '.';
  }

  function renderPads(focusIndex) {
    var grid = document.getElementById('pad-grid');
    var mode = MODES[state.mode];
    var pads = mode.pads();
    grid.textContent = '';
    grid.setAttribute('aria-label', mode.label + ' mode pads, 4 by 4');
    grid.setAttribute('role', 'group');
    pads.forEach(function (p, i) {
      var padNum = 13 - Math.floor(i / 4) * 4 + (i % 4);
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
        if (p.onPress) p.onPress();
        renderPads(i);
        renderScreen();
        renderHero();
        // Re-read the pad after state changed so the detail matches (e.g. new page).
        var fresh = MODES[state.mode].pads()[i];
        showDetail(fresh.detail || { h: fresh.label, p: fresh.sub ? fresh.sub.charAt(0).toUpperCase() + fresh.sub.slice(1) + '.' : 'Utility pad.' });
      });
      grid.appendChild(b);
    });
    if (focusIndex !== undefined && grid.children[focusIndex]) grid.children[focusIndex].focus();
  }

  function renderMode() {
    var m = MODES[state.mode];
    document.getElementById('mode-name').textContent = m.label;
    document.getElementById('mode-button').textContent = 'Stock ' + m.button;
    document.getElementById('mode-note').textContent = m.note;
    state.action = null;
    renderPads();
    renderScreen();
    showDetail(state.mode === 'chain' && state.chainView === 'device' ? devDetail(state.device) : null);
  }

  function buildFButtons() {
    var fb = document.getElementById('ex-fbtns');
    if (!fb) return;
    [0, 1, 2].forEach(function (i) {
      var b = el('button', { type: 'button', class: 'fbtn' }, [el('b', { text: 'F' + (i + 1) }), el('span')]);
      b.addEventListener('click', function () {
        setPage(screenKey(), i);
        state.action = null;
        renderPads();
        renderScreen();
        if (state.mode === 'chain' && state.chainView === 'device') showDetail(devDetail(state.device));
      });
      fb.appendChild(b);
    });
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
      // Pressing the active mode again goes home, like the hardware.
      if (key === state.mode && key === 'chain') state.chainView = 'home';
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

  /* ---------------------------------------------- hero mini grid (chain) */

  function renderHero() {
    var g = document.getElementById('hero-grid');
    if (!g) return;
    g.textContent = '';
    var saved = { mode: state.mode, view: state.chainView };
    state.mode = 'chain'; state.chainView = 'device';
    MODES.chain.pads().forEach(function (p) {
      var s = el('span');
      var st;
      if (p.kind === 'full') st = 'background:' + p.color;
      else if (p.kind === 'ring') st = 'background:var(--pad-dark);box-shadow:inset 0 0 0 3px ' + p.color;
      else if (p.kind === 'dim') st = 'background:var(--pad-dark);outline:2px dashed #6A6862;outline-offset:-4px';
      else if (p.kind === 'util') st = 'background:var(--pad-util)';
      else st = 'background:var(--pad-light)';
      s.setAttribute('style', st);
      g.appendChild(s);
    });
    state.mode = saved.mode; state.chainView = saved.view;
  }

  /* -------------------------------------------------- screens gallery */

  function renderScreens() {
    var host = document.getElementById('screens-list');
    if (!host) return;
    var shots = [
      { t: 'Chain (home)', d: 'Four lanes mirror the pad grid. A solid block is the device being edited, a dashed block is bypassed. The knobs control the focused track’s mix.',
        html: screen({ track: 0, crumbs: 'CHAIN', pages: MODE_PAGES.home, visual: visLanes(0, 'granular'),
          vals: [['LEVEL', '−3.5', 'dB', 0.72], ['PAN', 'C', '', 0.5], ['DJ FLT', '12', '% LP', 0.38]] }) },
      { t: 'Granular · Grain page', d: 'Grains are dots over the 4-second buffer. The hollow tick on the Contour arc is the physical knob, still catching up under scaled takeover.',
        html: screen({ track: 1, crumbs: 'GRANULAR · GRAIN', right: '92.0 · CPU 58%', pages: ['GRAIN', 'SPRAY', 'PITCH'], visual: visGrains('#56B4E9'),
          vals: DEVICES.granular.pages[0].vals }) },
      { t: 'Filter · Tone page', d: '48 bars, one per resonator band. Morph slides the bank between LP, BP and HP shapes, and Resonance sharpens the peak.',
        html: screen({ track: 2, crumbs: 'FILTER · TONE', right: '92.0 · CPU 47%', pages: ['TONE', 'BANK', 'MODE'], visual: visBands('#2BBF95'),
          vals: DEVICES.filter.pages[0].vals }) },
      { t: 'Large mode', d: 'An accessibility mode: one value fills the screen. Knob 1 or the encoder adjusts it, and F1–F3 still switch pages.',
        html: screen({ track: 2, crumbs: 'FILTER · TONE', right: 'VALUE 1 / 3', pages: ['TONE', 'BANK', 'MODE'], large: true,
          visual: '<div class="big"><svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="40" fill="none" stroke="#34353A" stroke-width="9" pathLength="100" stroke-dasharray="75 100" transform="rotate(135 50 50)"/><circle cx="50" cy="50" r="40" fill="none" stroke="#2BBF95" stroke-width="9" pathLength="100" stroke-dasharray="46 100" transform="rotate(135 50 50)"/></svg><div><span class="bl">CUTOFF</span><span class="bv">2.4</span><span class="bl">kHz</span></div></div>' }) }
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
      buildFButtons();
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
