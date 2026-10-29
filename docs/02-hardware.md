# 02 · Hardware

The MPC Sample has fewer continuous controls and a smaller screen than the S-4, but far more playable surface. Every design decision downstream follows from that trade: work moves off the knobs and onto the pads.

| Control | Torso S-4 | MPC Sample | What it means for CHISEL |
| --- | --- | --- | --- |
| Screen | 3.5 in color LCD | 2.4 in color LCD, high-res | One device page at a time, 3 values max, big type |
| Continuous controls | 9 endless encoders | 3 knobs (absolute), 1 parameter fader, 1 push encoder | Knobs need a takeover strategy; the encoder fine-tunes |
| Buttons | 21 RGB, 4 contextual action buttons | 3 function buttons above the screen, mode buttons, pad-mode buttons, Shift, transport | F-buttons pick pages; mode buttons pick modes |
| Pads | None | 16 RGB, velocity + poly aftertouch, 8 banks | Navigation, actions and pressure modulation |
| Structure | 4 stereo tracks × 5 devices | 1 program, one sample per pad | CHISEL adds the track structure itself |
| Voices | 8-voice poly sampler per track | 32 stereo voices total | 4 tracks × 8 voices fits exactly, before granular cost |
| Modulation | 4 modulators per track | Parameter automation | CHISEL adds modulators; pressure is an extra source |
| Audio in | Stereo line in, mic | Stereo 1/4 in, internal mic, USB-C audio | Live-input processing on any track |
| Memory and storage | USB storage | 2 GB RAM, 8 GB internal, microSD | Granular buffers live in RAM |
| Power | Wall power | Battery, up to 5 h | CPU budget is a design constraint |

## The detail that drives the control design

The MPC Sample's three knobs are absolute pots, not endless encoders. After any page change they're almost never sitting where the new parameter is. Akai's firmware 1.3 added pickup, scaled and instant takeover modes because of this, and I build on that in [Controls](04-controls.md).

Reviewers also found the stock knobs coarse for precise edits. That's why the push encoder becomes a dedicated fine-tune control.

## Physical layout (as I understand it)

From the reviews: the parameter fader sits left of the screen, three function buttons sit above it and three knobs below it, and the push encoder and transport sit to the right. The mode section and pad-mode buttons come next, then the 4×4 pads. I'll confirm the details against a unit.
