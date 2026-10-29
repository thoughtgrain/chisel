# 04 · Controls

Each control has exactly one job per mode, and the screen always says what that job is. The rule I'm working from: if you have to remember what a control does, the screen failed.

| Control | Job | Why |
| --- | --- | --- |
| Knobs 1–3 | The three values on screen, left to right | 1:1 spatial mapping: each knob sits directly under its value |
| F1–F3 | Pick page 1, 2 or 3 of the focused device | Pages have names (Grain / Spray / Pitch), printed right above the buttons |
| Shift + F1–F3 | Reset that knob's value to its default | One-handed undo for whatever you just broke |
| Push encoder, turn | Fine-adjust the last-touched value at 1/10 step | Fixes the stock knobs' coarseness without adding menus |
| Push encoder, press | Move fine-adjust focus to the next value | Keeps fine control on one control |
| Parameter fader | Device *Amount* (dry/wet) in Chain, scene morph in Perform, track level in Mix | The one big gesture control gets the most performative job in each mode |
| Shift + pad | Global functions: save, project, settings, MIDI | Keeps the mode buttons for modes only |
| Mode buttons | Switch mode; press the active one again for Chain | One way home from anywhere |

## Knob takeover

The knobs are absolute, so every page change risks a jump. My default is **scaled** takeover. The value moves the way you turn, at a rate that converges on the knob's physical position, so nothing jumps and nothing feels dead. Pickup and instant stay available in settings, matching what Akai added in firmware 1.3.

### Making the gap visible

Each value's arc gets a small hollow tick marking where the physical knob actually is. When the tick and the value meet, the tick disappears. That way a "slow" knob is explained on screen, not guessed at.

Implementation sketch for scaled takeover, per knob:

```
on knob move (pos, lastPos):
  delta = pos - lastPos
  if value == pos: value = pos                  # locked, 1:1
  else:
    # remaining travel in the turn direction
    room  = (delta > 0) ? (1 - lastPos) : lastPos
    span  = (delta > 0) ? (1 - value)   : value
    value = value + delta * (span / max(room, ε))
    if |value - pos| < 0.01: value = pos        # converge and lock
  draw tick at pos if value != pos
```

The ratio `span / room` means the value and the knob reach the end of their travel together, so they always meet.

## Mod assignment

This stays as close to the S-4 as I can make it:

1. Hold a Mod slot pad (Mod mode, top row).
2. Turn any knob on any page. That parameter becomes a destination, and how far you turn sets the depth.
3. The arc shows the mod range as a shaded band.
4. Release the pad to commit.

A latch alternative exists for players who can't hold and turn at once: Shift + Mod slot enters assign mode until you press it again. See [Accessibility](08-accessibility.md).
