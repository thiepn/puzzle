# 1.7.0 — Variety, Novelty & Anti-Repetition

- Added per-game content and structural fingerprints across all 36 puzzle families.
- Added bounded novelty-aware candidate selection for New Puzzle.
- Added recent same-game comparison using completed history plus the current board.
- Added canonical rotation/reflection matching for square-board structures and normalized region-partition comparison.
- Added exact-content and near-duplicate penalties without breaking deterministic shared seeds.
- Added compact variety fingerprints to completed result metrics.
- Added a five-game cooldown and cross-family preference to Surprise Me.
- Added static Phase 14 regression coverage and Chromium multi-puzzle variety certification.
- Preserved the complete Phase 1–13 quality/difficulty and interaction gates.
- Advanced the PWA cache to v26; IndexedDB schema remains 1.

# 1.6.0 — Difficulty Calibration & Puzzle Quality

- Added a catalog-wide difficulty and generation-quality certification layer for all 36 games.
- Added family-specific difficulty evidence using solver effort, clue scarcity, ambiguity, deduction depth, path/crossing pressure, lexical complexity, and related puzzle properties.
- Added explicit non-size reasoning evidence so Hard cannot certify on dimensions alone.
- Added structural/triviality rejection and uniqueness-certificate enforcement for solver-backed families.
- Preserved normal deterministic seeds by evaluating the original generation first and using deterministic fallback seeds only after a certification failure.
- Added post-first-click quality certification for Mines.
- Added per-puzzle quality metadata with calibrated difficulty, raw evidence, non-size evidence, measured signals, source seed, and gate status.
- Added static Phase 13 regression coverage and real Chromium Easy/Medium/Hard certification across the 36-game catalog.
- Advanced the PWA cache to v25; IndexedDB schema remains 1.

# 1.5.0 — Onboarding, Tutorials & Learn Mode

- Added a dedicated Learn library covering all 36 playable games.
- Added five-step lessons for every game: goal, first move, controls, strategy, and a safe interactive practice check.
- Added persistent per-game lesson state with Not started / Resume / Learned progress.
- Added non-blocking first-play coach cards that appear once and can be disabled globally.
- Added Learn entry points in primary navigation and each game’s options menu.
- Added tutorial resume/completion persistence without changing IndexedDB schema or real puzzle state.
- Added lesson reset controls that do not affect puzzle progress, statistics, favorites, or history.
- Added Phase 12 static/browser regression coverage while retaining the full cumulative Phase 1–11 matrix.
- Advanced the PWA cache to v24; IndexedDB schema remains 1.

# 1.4.0 — Audio, Haptics & Sensory Feedback

- Added a lazy, local Web Audio synthesis engine with no packaged audio files or network dependencies.
- Added category-aware completion/failure, progress, hint, undo/redo, and pause/resume cues while keeping ordinary moves silent.
- Added optional vibration patterns through feature-detected `navigator.vibrate`.
- Added persistent sound mute, local volume, haptics preferences, and a Settings feedback preview.
- Added a top-bar sound quick toggle with accessible pressed state and a non-color muted indicator.
- Added Phase 11 static/browser regression coverage and kept the full cumulative Chromium release matrix.
- Advanced the PWA cache to v23; IndexedDB schema remains 1.

# 1.3.0 — Integration, Final Certification & Ship

- Unified the cumulative Phase 1–8 v1.2 development branch with the Phase 9 accessibility/device production line.
- Preserved discovery/home redesign, game chrome, family systems, per-game polish, motion/game feel, results/rewards, and local stats/records.
- Layered Phase 9 reduced-motion, high-contrast, large-control, route/focus semantics, keyboard/touch help, forced-colors, and device handling onto that cumulative build.
- Connected the explicit Motion preference to the existing Phase 6 motion engine instead of introducing a second animation system.
- Added a Phase 10 integration guard that fails if any Phase 1–9 subsystem or browser coverage disappears.
- Advanced the PWA cache to v22 and kept storage schema 1.

# 1.2.0 — Accessibility, Controls & Device Polish

- Added explicit reduced-motion, high-contrast, and large-control preferences while still respecting system settings.
- Added keyboard/touch controls help, route announcements, active-route semantics, board/status landmarks, shortcut metadata, and completion/pause focus management.
- Fixed the missing screen-reader-only utility and keyboard activation for trace-board games.
- Added coarse-pointer, forced-colors, dynamic viewport, narrow-landscape, and non-color state cues.
- Avoided duplicate screen-reader announcements from in-game visual toasts.
- Added Phase 9 static and browser regression coverage; storage schema remains 1; PWA cache is v21.

# 1.1.0 — Play Experience

Shared controls and individual guides across all 36 games; undo/redo; persistent hints; pause; search and resume improvements; dictionary-compatible progress recovery; Word Ladder, Groups, Five Letters, Sudoku, Nonogram, and Cryptogram improvements. Regression and HTTP browser tests added. Runtime cache v20; storage schema remains 1.

## 1.0.2 — Expanded Lexicon & Hint Fix

- Added a broad offline ESDB/SCOWL-derived accepted-word dictionary: 132,590 filtered English words, including 7,278 five-letter words.
- Five Letters now accepts common and uncommon valid guesses such as TRACE, CRATE, STARE, ADIEU, LIONS, and LOVES while keeping answer targets curated.
- Word Ladder accepts broad-dictionary bridge words and uses the broad graph for hint routing.
- Anagrams accepts all dictionary-valid full anagrams for its tiles and now has four distinct progressive hint stages: structure, pattern, anchor, and chunk.
- Letter Hive and Word Grid now accept valid broad-dictionary words that satisfy their board rules.
- Added word-entry regression coverage and ESDB attribution.

# Changelog

## 1.0.0 — Stable

- Promoted Wave 10 RC1 to the first stable production release.
- Advanced the PWA cache generation to v17 for clean RC→stable updates.
- Preserved the certified 36-game catalog, puzzle algorithms, deterministic content, storage schema, UI, and production hardening without feature changes.
- Added stable release certification metadata and recorded physical-device/accessibility checks as manual post-ship verification.

## 1.0.0-rc.1 — 2026-09-17

### Release Candidate
- Froze the 36-game V1 catalog after Waves 1–9 correctness, content, depth, accessibility, persistence, and production-hardening work.
- Formalized the RC identity as `1.0.0-rc.1`.
- Advanced the service-worker cache to `puzzle-arcade-core-v16` for clean RC upgrade behavior.
- Added the Wave 10 release gate, browser matrix, reproducible CI, deployment workflow, and final certification records.

### Quality baseline retained
- 10,800 generator creations with zero generator errors.
- 270/270 exact-uniqueness checks passed.
- 300/300 Mines checks passed.
- 1,080 deterministic-generation checks passed.
- 36/36 browser routes previously certified at mobile, desktop, and narrow widths.
- Wave 9 content validation: 0 errors.
