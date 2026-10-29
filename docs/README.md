# CHISEL design spec

This is the full spec, split so each chapter can change on its own. Read the chapters in order the first time. After that, the JSON map is the part you'll reach for while building.

1. [Concept](01-concept.md): what I'm building and the four rules behind it
2. [Hardware](02-hardware.md): what the MPC Sample gives me compared with what the S-4 uses
3. [Architecture](03-architecture.md): tracks, devices, modulation, voice and CPU budget
4. [Controls](04-controls.md): knobs, F-buttons, fader, encoder, takeover, mod assignment
5. [Modes and pads](05-modes-and-pads.md): every 4×4 map, pad lighting, action pads
6. [Screens](06-screens.md): screen flow, the four zones, per-screen contents
7. [Devices](07-devices.md): parameter pages for all five devices
8. [Accessibility](08-accessibility.md): vision, color, motor, cognitive, non-visual
9. [Open questions](09-open-questions.md): what I don't know yet, and the next steps
10. [Sources](sources.md)

**Data:** [`data/chisel-map.json`](data/chisel-map.json) holds the same pad maps, devices and pages as structured data. It's the single source of truth I'd generate UI code from, so the docs and the firmware can't drift apart.

## Conventions used throughout

- **Pad numbering** follows the MPC: pad 1 is bottom-left, pad 16 is top-right. Grids in these docs list the **top row first** (pads 13–16), matching how you see the hardware.
- **Track colors** come from the Okabe-Ito palette and always pair with a glyph: ● T1 `#E69F00`, ▲ T2 `#56B4E9`, ■ T3 `#009E73`, ◆ T4 `#CC79A7`.
- **Stock button names** are mapped by function, from reviews. I still need to confirm the exact silkscreen labels on a unit.
- **Screen sizes** assume a 320 × 240 panel until I can confirm the real resolution.
