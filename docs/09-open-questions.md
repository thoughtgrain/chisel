# 09 · Open questions and next steps

## Open questions

- [ ] **SDK surface.** What does Akai's firmware SDK expose: pad LED control, raw poly aftertouch, button remapping, DSP access, USB MIDI out?
- [ ] **Screen resolution.** Every type size in these docs assumes 320 × 240.
- [ ] **Button names.** I'm mapping buttons by function from reviews and need the exact silkscreen labels from a unit.
- [ ] **CPU headroom.** Can it run 4 granular tracks at 128 grains each, or should grains be capped per track? Battery life matters as much as glitches here.
- [ ] **Grid comfort.** Chain uses rows for functions and Mix uses columns for tracks. Is that mismatch comfortable in the hand, or does it confuse people?
- [ ] **Companion app.** Is streaming UI state over USB MIDI feasible for a screen-reader companion?
- [ ] **Pad brightness.** Do the RGB pads hold three clearly distinct brightness tiers in daylight?

## Next steps

1. **Clickable prototype.** A browser prototype driven by [`data/chisel-map.json`](data/chisel-map.json) to test the two-press rule and the Chain/Mix grid question with real players.
2. **SDK read-through.** When Akai publishes the SDK, map every item above to a yes, no or workaround.
3. **Profiling spike.** A minimal granular voice on the hardware to measure CPU per grain.
4. **Usability pass.** Five players, three tasks each: freeze a grain cloud, assign a mod, morph two scenes.

## How to contribute an answer

If you know the answer to any of these, open an issue with the question as the title. Include how you know: hands-on with a unit, SDK docs, or a measurement.
