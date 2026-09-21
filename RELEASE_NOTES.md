# Puzzle Arcade 1.10.0 — Real Player Simulation, State Fuzzing & Interaction Sequence Reliability

Phase 17 tests what happens after generation: long, messy player interaction sequences and repeated persistence transitions.

- Added a catalog-wide Phase 17 player-state invariant API covering all 36 games.
- Every live session is checked against the same production save-repair routine used after a real reload.
- Legal durable state must survive repair byte-for-byte at the normalized state-digest level.
- The underlying Phase 16 completion witness is rechecked after interaction sequences.
- The standard Chromium release gate now fuzzes all 36 games through real rendered controls.
- Sequences include board actions, keyboard input, hints, undo/redo, keyboard history shortcuts, pause/resume, and game-menu transitions.
- Every standard session verifies autosave parity and exact state-digest preservation across a full page reload.
- Every unfinished session receives an intentionally malformed but serializable IndexedDB field, then must recover through the real reload/repair path and emit the recovery notice.
- Every game crosses the shared completion/result boundary, persists that completed state through reload, and successfully transitions through Next Puzzle to a fresh unfinished seed.
- A weekly/manual four-shard deep fuzz workflow covers all three difficulties, two deterministic cycles, and 24 interaction steps per session: 5,184 planned interaction steps before reload/recovery/completion probes.

Storage schema remains **1**. Service-worker cache is **v29**.

See `docs/PHASE17_PLAYER_STATE_FUZZING.md` for the complete contract.
