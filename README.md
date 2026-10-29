# CHISEL

A sculpting-sampler firmware concept for the Akai MPC Sample, inspired with love for the [Torso S-4](https://torsoelectronics.com/).

**Walkthrough site:** https://thoughtgrain.github.io/chisel/

I own two S-4s, and if you like what this does, I recommend supporting Torso and getting the real thing. This is just my take on how those ideas could live on different hardware: four tracks, each running Material → Granular → Filter → Color → Space, played from sixteen pressure pads and three knobs.

This is a design spec, not shipping software. On Oct 28, 2026 Akai announced it's opening the MPC Sample to custom firmware, and this repo is where I'm working out what I'd build on it.

## What's here

| Path | What it is |
| --- | --- |
| [`docs/`](docs/README.md) | The design spec, one chapter per topic |
| [`docs/data/chisel-map.json`](docs/data/chisel-map.json) | Machine-readable pad maps, devices, pages and modes, ready to build a prototype or firmware UI from |
| `gh-pages` branch | The walkthrough site's source (static HTML, CSS and JS) |

## The idea in four rules

1. **The pad grid is the chain.** You can see where you are from the pads alone, without reading the screen.
2. **Three knobs, three values.** A screen never shows more than the three knobs can reach.
3. **Pressure is a mod source.** The S-4's action buttons become pressure pads, so actions like Freeze can be played partway, not just switched on or off.
4. **Two presses to anything.** Any parameter is a device pad plus an F-button away.

## Status

Concept stage. The open questions are mostly about Akai's firmware SDK, which hasn't been published yet. See [docs/09-open-questions.md](docs/09-open-questions.md).

## Disclaimer

CHISEL is an independent concept. It isn't affiliated with or endorsed by Akai Professional or Torso Electronics. MPC is a trademark of inMusic Brands; S-4 is a product of Torso Electronics.
