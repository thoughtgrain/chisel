# 01 · Concept

CHISEL (working title) is an alternate firmware for the Akai MPC Sample that turns it into a four-track sculpting sampler, inspired with love for the Torso S-4. Each track runs Material → Granular → Filter → Color → Space, with modulators on top.

## Why the S-4's interface is the thing to keep

The S-4's panel *is* its signal flow. The device buttons sit in chain order, and the encoders map straight onto what's on screen, so you never wonder where you are. That's the quality I want to carry over, more than any single feature.

The MPC Sample can't copy the S-4 control for control. It has 3 knobs where the S-4 has 9 encoders, and a 2.4 in screen against 3.5 in. But it has something the S-4 doesn't: sixteen pads with poly aftertouch. So instead of copying controls, I move navigation onto the pads and let pressure do work that buttons can't.

## The four rules

1. **The pad grid is the chain.** You can see where you are from the pads alone, without reading the screen. Tracks sit on the top row and devices in reading order below them.
2. **Three knobs, three values.** Every parameter page shows exactly three values, lined up over the three knobs. No screen shows a value you can't reach directly.
3. **Pressure is a first-class mod source.** The S-4's four action buttons become four pressure pads. Freeze, Wash or a delay throw can be played partway, not just switched on or off.
4. **Two presses to anything.** Any parameter is reachable from Chain with a device pad and then an F-button.

## What this isn't

- It isn't a clone of the S-4's firmware or its exact parameter lists. The device pages here are my own working sets.
- It isn't an implementation plan yet. Anything that depends on Akai's SDK is listed in [open questions](09-open-questions.md).
- It isn't a replacement for an S-4. If you like the device, support Torso.
