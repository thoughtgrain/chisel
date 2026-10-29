# 08 · Accessibility

On a 2.4 in screen, the biggest risks are legibility and meaning carried by color alone. I'm using WCAG 2.2 as the bar wherever it applies to hardware, and going past it where the small screen demands. Most of these are design rules: they cost nothing to adopt now and a lot to retrofit later.

## Vision

- Value numerals are at least **20 px** tall and labels at least **11 px**, assuming a 320 × 240 panel.
- Text contrast is at least **7:1**, the AAA level, rather than 4.5:1. The type is small and this device gets used outdoors on battery.
- **Large mode** shows one value per screen in huge type. Knob 1 or the encoder adjusts it, and F1–F3 still switch pages.
- An optional high-contrast theme uses pure black and white with one accent color.

## Color independence

- Track colors come from the **Okabe-Ito** palette, which stays distinguishable across the common forms of color blindness.
- Every track also carries a number and a glyph (● ▲ ■ ◆), so hue is never the only identifier.
- Pad state uses **brightness tiers** (full / mid / ~15%), not different hues.
- On screen, mute and solo are text badges (MUTE, SOLO), not colors.

## Motor

- Every hold has a **latch** alternative. Shift + Mod slot, for example, enters assign mode until you press it again.
- No gesture depends on timing: no double-taps, and no long-press thresholds that change meaning.
- Pressure curve and pad sensitivity are adjustable per user, and they apply to action pads, macros and Keys alike.
- Shift chords should be reachable one-handed on the physical layout. I'll verify this on a unit.

## Cognitive

- The same one-press way home from every mode.
- Breadcrumbs (track · device · page) are always on screen, and F-button labels sit directly above their buttons.
- Holding **Shift** draws a legend of what each pad does in the current mode.
- Each control has one job per mode, and the screen names that job.

## Non-visual

- The device has no screen reader. CHISEL could **stream UI state over USB MIDI (SysEx)** so a companion app on a phone or laptop reads it aloud. This depends on the SDK, so it's listed as an open question.
- Optional audio confirmation: a short, quiet tick on the headphone bus for mode and page changes.

## Photosensitivity

- Pad and screen animations stay **under 3 flashes per second** (WCAG 2.3.1).
- Tempo-synced blinking is a soft pulse, not hard on/off.

## Testing checklist

- [ ] Every screen readable at arm's length in direct sunlight
- [ ] Every pad state distinguishable in a grayscale photo of the grid
- [ ] Every action possible one-handed using latches
- [ ] Every screen state reported correctly over the SysEx UI stream
- [ ] No animation exceeds 3 flashes per second at 200 BPM
