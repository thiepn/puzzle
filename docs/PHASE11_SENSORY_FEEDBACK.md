# Phase 11 — Audio, Haptics & Sensory Feedback

## Goal

Add a restrained sensory layer that makes important puzzle events feel more responsive without turning Puzzle Arcade into a noisy arcade or introducing media/runtime dependencies.

## Principles

- no background music
- no downloaded or packaged audio files
- no remote audio
- no autoplay on page load
- ordinary puzzle movement stays silent
- only high-signal events receive sound/haptic feedback
- sound and haptics are independently optional
- reduced motion remains independent from sensory settings
- unsupported haptics degrade cleanly
- local-first/privacy model remains unchanged

## Audio architecture

Phase 11 uses the browser Web Audio API only.

The AudioContext is created lazily after user interaction. Sounds are synthesized from oscillators and gain envelopes, so there are no MP3/WAV/OGG assets and no new network requests.

The four puzzle families receive related but slightly different tonal centers:

- Word: higher/warm
- Number: clean/mid
- Logic: softer/lower
- Spatial: airy/mid-high

This provides identity without creating 36 unrelated sound themes.

## Cue vocabulary

High-signal cues:

- completion: short rising three-note sequence
- failed result / detected error: low error cue
- meaningful intermediate progress: short two-note confirmation
- hint reveal: soft two-note cue
- undo: low short tick
- redo: slightly higher short tick
- pause: low soft cue
- resume: higher soft cue
- Settings preview: short confirmation

Intentionally silent:

- ordinary cell selection
- arrow-key focus movement
- number entry on every move
- tile dragging
- board scrolling
- route changes
- background timers

Final progress events suppress their intermediate cue when the same action completes the puzzle, preventing stacked completion sounds.

## Haptics

Haptics use `navigator.vibrate` only when the browser exposes it.

Patterns are brief and reserved for the same high-signal event vocabulary. Unsupported browsers show haptics as unavailable rather than pretending the setting works.

No user-agent detection is used.

## Settings

Settings include:

- Puzzle sounds: On / Muted
- Sound level: 0–100%
- Haptic feedback: On / Off when supported
- Test feedback button

The top bar also includes a persistent sound quick-toggle.

All values use the existing local settings store. IndexedDB schema remains version 1.

Defaults:

- sound: on
- sound level: 35%
- haptics: on where supported

## Accessibility

- the mute control exposes `aria-pressed`
- muted state has a visual slash, not color alone
- haptic controls are disabled when vibration is unsupported
- sound/haptics do not replace visual or textual feedback
- screen-reader announcements remain unchanged
- forced-colors styling is retained
- reduced-motion preference does not silently alter sound/haptic preferences

## Certification

Static regression checks verify:

- no packaged audio references
- lazy Web Audio architecture
- sound and haptic guards
- cue vocabulary
- Settings controls
- top-bar mute semantics
- high-signal event integration
- no generic move sound

Real Chromium checks verify:

- mute toggle behavior
- Settings state
- volume changes
- feedback preview
- unsupported-haptics handling
- local mute persistence across reload
- narrow mobile layout does not overflow

The full cumulative Phase 1–10 browser matrix remains part of the release gate.

## Release identity

- Puzzle Arcade: 1.4.0
- Build phase: Audio, Haptics & Sensory Feedback
- PWA cache: v23
- IndexedDB schema: 1
