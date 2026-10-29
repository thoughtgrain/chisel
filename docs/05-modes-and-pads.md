# 05 · Modes and pads

CHISEL has five modes. Four take over the stock mode buttons and one takes over 16 Levels. Pressing the active mode's button again always returns to Chain.

| Stock button | CHISEL mode | What the pads become |
| --- | --- | --- |
| Sample | **Chain** (home) | Tracks, devices, actions |
| Sequence | **Mod** | Modulator slots and shapes |
| Pad FX | **Perform** | Punch-ins, pressure macros, scenes |
| Knob FX | **Mix** | A 4-track mixer, one column per track |
| 16 Levels | **Keys** | Chromatic play of the focused track's Material |

Other stock buttons keep similar jobs:

- **Sample Rec** records into the focused track's Material.
- **Sample Select** opens the browser and loads into the focused track.
- **Rec** (sequence) records knob motion as automation on the focused track.
- **Mute** + a track pad mutes from any mode.

## Pad lighting

State is carried by brightness and border style, never by hue alone. That keeps it readable for color-blind players and in direct sun.

| Look | Meaning |
| --- | --- |
| **Full** (solid track color) | Focused or selected |
| **Ring** (dark pad, colored edge) | Active, not focused |
| **Dashed, dim** | Bypassed, muted or empty |
| **Neutral** (grey) | Utility: tap or hold functions |
| **Light, with pressure bar** | Pressure-sensitive action or macro |

On hardware, "ring" becomes a mid-brightness tier and "dashed" becomes about 15% brightness, since the pads can't draw borders. The firmware should expose exactly three brightness tiers so the states stay distinct.

---

## Chain (home)

Tracks on top, the chain in reading order, actions under your thumbs. The chain wraps from Color (pad 12) to Space (pad 5), following reading order.

| | Col 1 | Col 2 | Col 3 | Col 4 |
| --- | --- | --- | --- | --- |
| **Row 4** (13–16) | ● Track 1 | ▲ Track 2 | ■ Track 3 | ◆ Track 4 |
| **Row 3** (9–12) | Material | Granular | Filter | Color |
| **Row 2** (5–8) | Space | Bypass (hold + device) | Copy (hold src, tap dst) | Capture (resample track) |
| **Row 1** (1–4) | Action A | Action B | Action C | Action D |

- Tap a track pad to focus it. Hold it to solo.
- Tap a device pad to focus it. Tap it again to cycle its pages (same as F1–F3).
- Device pads take the focused track's color.

### Action pads per device

The S-4's four action buttons, made pressure-sensitive. They change with the focused device.

| Device | Action A | Action B | Action C | Action D |
| --- | --- | --- | --- | --- |
| Material | Rec / overdub (pressure = input gain) | Play / stop (pressure = tape slowdown) | Reverse | Retrigger |
| Granular | Freeze (pressure = freeze blend) | Spray burst | Pitch +12 | Density surge |
| Filter | Resonance swell | Sweep down | Sweep up | Morph hold |
| Color | Drive push | Crush push | Noise in | Comp slam |
| Space | Freeze tail | Delay throw | Wash | Kill tails |

## Perform

The S-4's Perform page has 12 macros (8 sliders and 4 punch-ins). CHISEL keeps the count and turns the sliders into pressure pads.

| | Col 1 | Col 2 | Col 3 | Col 4 |
| --- | --- | --- | --- | --- |
| **Row 4** | Punch-in 1 | Punch-in 2 | Punch-in 3 | Punch-in 4 |
| **Row 3** | Macro 5 | Macro 6 | Macro 7 | Macro 8 |
| **Row 2** | Macro 1 | Macro 2 | Macro 3 | Macro 4 |
| **Row 1** | Scene A | Scene B | Scene C | Scene D |

- Macro pressure sets the macro's value and springs back on release. Shift + tap latches it.
- Tap a scene to recall it. Shift + tap stores it. Hold two scenes and move the fader to morph between them.
- F-pages: Macros, Scenes, Map. Map assigns parameters to macros.

## Mod

| | Col 1 | Col 2 | Col 3 | Col 4 |
| --- | --- | --- | --- | --- |
| **Row 4** | Mod 1 | Mod 2 | Mod 3 | Mod 4 |
| **Row 3** | LFO | Random | Envelope | Follower |
| **Row 2** | Sync | Retrigger | Uni / bipolar | Clear (hold) |
| **Row 1** | ● T1 | ▲ T2 | ■ T3 | ◆ T4 |

Modulators belong to the focused track, and Row 1 switches tracks without leaving Mod. The F-pages are Shape, Timing and Targets. Targets is a scrollable list on the encoder.

## Mix

This is the one grid where columns mean tracks, because a mixer reads in channel strips.

| | Track 1 | Track 2 | Track 3 | Track 4 |
| --- | --- | --- | --- | --- |
| **Row 4** | Select | Select | Select | Select |
| **Row 3** | Mute | Mute | Mute | Mute |
| **Row 2** | Solo | Solo | Solo | Solo |
| **Row 1** | Input monitor | Input monitor | Input monitor | Input monitor |

The knobs set level, pan and DJ filter for the selected strip, and the fader sets its level. The F-pages are Strip, Input and Master. Master holds the summing compressor, the master DJ filter, output, and the voice-pool caps.

## Keys

The pads play the focused track's Material chromatically and scale-locked, starting from the root at pad 1. C minor is shown below.

| | Col 1 | Col 2 | Col 3 | Col 4 |
| --- | --- | --- | --- | --- |
| **Row 4** | G#4 | A#4 | **C5** | D5 |
| **Row 3** | D4 | D#4 | F4 | G4 |
| **Row 2** | G3 | G#3 | A#3 | **C4** |
| **Row 1** | **C3** | D3 | D#3 | F3 |

Velocity sets level. Poly aftertouch is per voice and assignable, defaulting to Granular pitch scatter. The knobs set Root, Scale and Octave. Root pads light full and the rest light as a ring.
