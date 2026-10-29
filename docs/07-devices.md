# 07 · Devices

Each device has 3 pages of 3 values, so 9 parameters per device. That matches the S-4's encoder count, so a full device fits the same mental model. It just takes one F-button press instead of zero.

These are my working parameter sets, not a copy of the S-4's exact lists.

| Device | F1 page | F2 page | F3 page | Screen visual |
| --- | --- | --- | --- | --- |
| Material | **Tape:** Start · Length · Speed | **Play:** Mode (Tape / Poly / Live / Off) · Level · Pan | **Env:** Attack · Release · Loop fade | Waveform with playhead and loop region |
| Granular | **Grain:** Size · Density · Contour | **Spray:** Position · Scatter · Width | **Pitch:** Pitch · Pitch scatter · Mix | Grain cloud over the 4 s buffer |
| Filter | **Tone:** Cutoff · Resonance · Morph | **Bank:** Root · Spread · Animate | **Mode:** Type (LP / BP / HP / Resonator) · Drive · Mix | 48 bars, one per band |
| Color | **Drive:** Low drive · High drive · Crossover | **Crush:** Bits · Rate · Noise | **Glue:** Comp · Release · Mix | Transfer curve |
| Space | **Room:** Size · Decay · Damping | **Delay:** Time · Feedback · Type | **Blend:** Reverb / delay · Freeze · Mix | Decay envelope with delay taps |

## Landing rule

The most-touched value of each device sits on F1, knob 1, which is the default landing spot. Landing on Filter, for example, puts Cutoff under your left hand. The device remembers its last page per track, so coming back puts you where you left off.

## Device notes

**Material.** Mode decides what the track is. Tape gets the tape-style workflow (record, overdub, varispeed). Poly turns the track into an 8-voice sampler for Keys mode and MIDI. Live passes the input through the chain in real time.

**Granular.** Works on a 4-second rolling buffer of whatever Material outputs. Freeze (Action A) stops the buffer from updating, and pressure blends between the live and frozen buffers. Contour shapes each grain's envelope.

**Filter.** A 48-band resonator bank. Morph slides the bank's response between classic LP, BP and HP shapes, and Resonator mode tunes the bands to Root and Spread for pitched ringing. Animate drifts the band gains over time.

**Color.** The destructive stage. It has dual-band drive split at Crossover, bit and rate reduction, a noise generator, and a glue compressor.

**Space.** Stereo reverb and delay in one device. Blend balances the two, and Freeze holds the current tail indefinitely.

## Amount

The fader's job in Chain is the focused device's **Amount** (dry/wet). It's deliberately off the pages, so any device can be faded in and out without leaving the page you're tweaking.
