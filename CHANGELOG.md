# 1.14.0 — QoL, Keyboard Navigation & Mobile UI Polish

- Added a keyboard quick switcher opened by Ctrl/⌘ K or / with action + puzzle search, arrow-key selection, and Enter activation.
- Added G chord navigation: G→P Puzzles, G→L Learn, G→S Stats, G→O Settings.
- Added C to resume the latest open puzzle and R to launch a random puzzle outside gameplay.
- Added Esc-to-options while inside a puzzle.
- Added spatial arrow-key navigation across puzzle-library cards, category portals, continue rails, category filters, and primary navigation.
- Added shortcut metadata and an expanded keyboard/touch help sheet.
- Rebuilt the mobile bottom navigation as a compact icon+label app bar.
- Reduced mobile home/catalog density: smaller hero, continue card, category cards, recent/favorite rails, library cards, filters, and settings groups.
- Simplified the mobile top bar while retaining a compact always-available sound mute; the redundant help control moves out of the phone top bar.
- Converted mobile search into a full-screen quick switcher with bounded scrolling.
- Converted mobile dialogs into bottom sheets.
- Made the in-game mobile action dock sticky and thumb-friendly while retaining 44px+ touch targets.
- Added required desktop keyboard + mobile UI browser certification and folded it into weekly maintenance checks.
- Preserved Phase 20 backup/restore/reset, deployment integrity, endurance, cross-browser, and fuzz certification.
- Advanced the PWA cache to v33; IndexedDB schema remains 1, backup schema remains 1, and the catalog remains 36 games.

# 1.13.0 — Final Production Hardening, Release Certification & Maintenance Baseline

- Added verified local backup download and restore for settings, favorites, active/completed puzzle records, and bounded history.
- Added a 16 MiB backup safety ceiling, backup schema versioning, database-schema compatibility checks, deterministic corruption checksum validation, and unsafe-object-key rejection.
- Added active-record repair against freshly generated current puzzles and generator-version compatibility checks before restore.
- Added atomic IndexedDB replacement across settings, active records, and history; localStorage fallback snapshots and rolls back Puzzle Arcade-owned keys on failure.
- Added cross-tab restore propagation alongside the existing reset synchronization.
- Added required browser disaster-recovery certification covering real backup download, checksum tamper rejection, active-state repair, destructive reset, real file-picker restore, reload durability, completed-result recovery, and in-progress recovery.
- Added `release-manifest.json` as the stable release identity document.
- Added deploy-time SHA-256 + byte-size integrity generation for all ten core production files.
- Added post-deployment verification against the live GitHub Pages bytes, including app/service-worker identity, CSP, and PWA manifest checks.
- Added `SECURITY.md` and a frozen post-Phase-20 maintenance baseline.
- Added a weekly/manual maintenance workflow covering cumulative static certification, Chromium/Firefox/WebKit resilience, and disaster recovery.
- Added monthly Dependabot monitoring for GitHub Actions dependencies.
- Phase 20 deliberately adds no new puzzle family, progression system, backend, account, or cloud-sync feature.
- Advanced the PWA cache to v32; IndexedDB schema remains 1 and the catalog remains 36 games.

# 1.12.0 — Performance, Memory & Long-Session Endurance

- Added a required warmed 144-route Chromium endurance certification to the release workflow.
- Added a weekly/manual deep endurance run covering 468 total game routes.
- Added production-safe endurance diagnostics for DOM size, timer state, pointer cleanup, global handlers, render/lifecycle counters, runtime cache bounds, storage counts, and heap data where supported.
- Added a durable 10,000-entry completed-history ceiling with boot-time migration and live pruning.
- Added one-transaction IndexedDB history compaction plus localStorage fallback compaction and cross-tab prune signaling.
- Added post-warm heap-growth certification with a 96 MiB release ceiling and 128 MiB deep-run ceiling.
- Added home-route DOM growth limits and transient overlay/toast leak checks.
- Added timer-start/stop balance, pointer cleanup, global handler cleanup, and lifecycle endurance checks.
- Added route p95 / maximum latency ceilings and first-cycle → final-cycle degradation checks.
- Preserved all Phase 13–18 quality, fuzz, offline, cross-browser, and multi-tab certification.
- Advanced the PWA cache to v31; IndexedDB schema remains 1 and the catalog remains 36 games.

# 1.11.0 — Cross-Browser, Offline/PWA & Multi-Tab Resilience

- Added required Chromium, Firefox, and WebKit release-matrix coverage for production runtime and multi-tab behavior.
- Added BroadcastChannel synchronization with storage-event fallback and duplicate-message suppression.
- Added per-game Web Locks write serialization with an expiring localStorage lease fallback.
- Added last-write stale-state rejection so older tabs cannot overwrite newer sessions or resurrect replaced puzzle seeds.
- Added live adoption of newer durable puzzle state plus cross-tab refresh for settings, favorites, statistics, history, deletes, and resets.
- Added BFCache and visibility-return resynchronization.
- Added compatibility fallbacks for structuredClone, CSS.escape, ResizeObserver, and random seed generation, plus WebKit visual compatibility.
- Added controlled service-worker replacement activation, controller-change reload protection, updateViaCache: none, and online update checks.
- Added real Chromium offline reload certification while preserving the narrow same-origin app-shell/core-asset cache policy.
- Added Phase 18 static release contracts and browser resilience automation.
- Advanced the PWA cache to v30; IndexedDB schema remains 1 and the catalog remains 36 games.

# 1.10.0 — Real Player Simulation, State Fuzzing & Interaction Sequence Reliability

- Added a catalog-wide real-player sequence fuzzer for all 36 games.
- Added production-state validation by round-tripping every live session through the same save-repair logic used on reload.
- Added invariant checks for bounded serialization, normalized metadata, result identity, durable-state preservation, and retained Phase 16 solvability witnesses.
- Added real Chromium interaction sequences spanning board controls, keyboard input, hints, undo/redo, history shortcuts, pause/resume, and menus.
- Added exact autosave-state parity and full-page reload digest checks.
- Added deliberate IndexedDB field corruption followed by real production recovery and recovery-notice verification.
- Added shared completion-boundary, completed-state reload, and Next Puzzle transition checks across every game.
- Added a weekly/manual four-shard deep fuzz workflow covering Easy/Medium/Hard, two deterministic cycles, and 5,184 planned interaction steps.
- Preserved the complete Phase 13–16 difficulty, variety, generator-stress, solvability, hint, and completion gates.
- Advanced the PWA cache to v29; IndexedDB schema remains 1.

# 1.9.0 — Solvability, Hint Correctness & Completion Certification

- Added a canonical completion witness and game-specific completion contract for all 36 puzzle families.
- Added release certification across all 108 game/difficulty combinations.
- Added explicit unfinished-start negative controls to reject accidentally solved/trivial starts.
- Added hint-source certification across every game, including structured proof validation for proof-based number/logic families.
- Added independent trace solving for Word Grid, piece construction for Word Pieces, substitution verification for Cryptogram, and exact stored-path checks for Theme Trail and Word Search.
- Added exact completion checks for Sudoku/Killer, Kakuro, Unequal, Arithmetic Cages, Loop, Bridges, Light Up, Islands, Hitori, Binary, Queens, Number Path, Tents, Rectangles, Dominoes, Towers, Fillomino, and Network.
- Added post-first-click Mines clue recomputation.
- Added exact Make 24 and Lights Out solve-route verification.
- Added independent Sliding Tiles parity verification and Untangle planar-witness reconstruction.
- Preserved the full Phase 13–15 difficulty, variety, generator stress, latency, determinism, state-isolation, and heap gates.
- Advanced the PWA cache to v28; IndexedDB schema remains 1.

# 1.8.0 — Generator Robustness, Stress Testing & Long-Run Reliability

- Added catalog-wide generator stress certification across all 36 games and all three difficulty tiers.
- Added reverse-order deterministic replay to catch cross-seed state contamination.
- Added stable puzzle/state digests and initial-state reference-isolation checks.
- Added Phase 13 quality rejection and fallback-pressure monitoring under repeated generation.
- Added seeded diversity checks to detect finite-bank collapse and broken seed selection.
- Added median, p95, maximum latency, per-family budgets, and long-run timing drift monitoring.
- Added deterministic post-first-click Mines stress coverage.
- Added 864 measured generator executions to the standard production browser gate, activating timing-drift checks and a catastrophic heap-growth ceiling.
- Added a weekly/manual four-shard deep stress workflow with 1,728 measured generations and retained JSON artifacts.
- Preserved the complete Phase 1–14 regression, interaction, quality, and variety gates.
- Advanced the PWA cache to v27; IndexedDB schema remains 1.

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
