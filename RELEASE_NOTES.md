# Puzzle Arcade 1.4.0 — Audio, Haptics & Sensory Feedback

Phase 11 adds an optional sensory feedback layer to the complete 36-game Puzzle Arcade.

- Short sounds are synthesized locally with Web Audio; there are no audio files, downloads, streams, or external runtime dependencies.
- Word, Number, Logic, and Spatial puzzles use slightly different tonal centers while sharing one restrained sound language.
- Completion, failure, meaningful progress, hints, undo/redo, and pause/resume receive cues; ordinary moves remain silent.
- A persistent top-bar mute button, sound volume, sound on/off, haptics on/off, and feedback preview are available.
- Haptics are feature-detected and automatically unavailable when the browser does not expose vibration.
- Reduced motion remains independent from sound/haptics so each accessibility preference can be configured separately.
- Phase 11 adds static and real-browser regression coverage while retaining the full Phase 1–10 certification matrix.

Storage schema remains **1**. Service-worker cache is **v23**.
