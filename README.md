# Puzzle Arcade — 36-Game Endless Puzzle PWA

**Current release: 1.3.0 · Integration, Final Certification & Ship · PWA cache v22**

A local-first puzzle arcade built around one loop: choose a puzzle, solve it, press **Next Puzzle**, repeat.

## Integration, Final Certification & Ship 1.3.0

Phase 10 unifies the cumulative v1.2 improvement line (Phases 1–8) with the Phase 9 accessibility/device line and certifies the resulting build as one production release. The integrated build contains the redesigned visual foundation, game chrome, home/discovery flow, puzzle-family systems, individual game polish, motion/game-feel layer, completion/reward experience, local records/stats, and Phase 9 accessibility/controls/device hardening simultaneously.

The release gate now explicitly verifies that none of those phase systems were lost during branch reconciliation, then runs the existing content, service-worker, word-entry, play-experience, accessibility, and real Chromium interaction suites before deployment.

See `docs/PHASE10_INTEGRATION_CERTIFICATION.md` for the integration and certification contract.

## Accessibility, Controls & Device Polish 1.2.0

Phase 9 hardens the existing 36-game experience for keyboard, touch, screen readers, high-contrast/forced-color modes, reduced motion, large controls, narrow screens, and installed/mobile viewport behavior. It adds a controls reference, route announcements, stronger focus management, semantic puzzle/status regions, and regression coverage while preserving the existing game design and storage schema.

See `docs/PHASE9_ACCESSIBILITY.md` for the implementation scope and verification checklist.

## Play Experience 1.1.0

All 36 games now share a board-first workbench, an individual strategy/control guide, visible difficulty selection, persistent hints and feedback, pause/resume, and clearer results. Native undo games gain redo and keyboard shortcuts. The library adds inline search, category counts, favorites filtering, and resume-first random play.

Word progress repair now agrees with the expanded dictionary. Word Ladder uses dictionary-wide par and non-repeating hint routes; Groups rejects duplicate mistakes and explains near misses; Five Letters rejects repeated guesses; Nonogram gains marking and keyboard controls; Cryptogram gains letter frequencies; Sudoku gains matching-digit emphasis. See `docs/PLAY_EXPERIENCE.md` for scope and verification commands.

## Catalog — 36 / 36 playable

### Word — 11 / 11
Five Letters · Groups · Word Ladder · Anagrams · Letter Hive · Word Grid · Theme Trail · Word Pieces · Mini Crossword · Cryptogram · Word Search

### Number — 6 / 6
Sudoku · Killer Sudoku · Kakuro · Unequal · Arithmetic Cages · Make 24

### Logic — 15 / 15
Mines · Nonogram · Loop · Bridges · Light Up · Islands · Hitori · Binary · Queens · Number Path · Tents · Rectangles · Dominoes · Towers · Fillomino

### Spatial — 4 / 4
Network · Sliding Tiles · Lights Out · Untangle

There are no placeholder games in the locked V1 catalog.

## Platform

- unlimited play with immediate Next Puzzle
- Random Puzzle
- Continue / autosave
- Favorites
- IndexedDB persistence with localStorage fallback
- local statistics and solve streaks
- deterministic shareable seeds
- light / dark / system appearance
- mouse, touch and keyboard input
- offline service worker / installable PWA
- no accounts, lives, daily lockouts or required remote API

## S+ hardening progress

### Wave 1 — correctness emergencies

Hitori, Bridges, Number Path, Network, Islands and Fillomino received exact uniqueness/validity certification. Stale pre-hardening sessions are generator-version migrated.

See `docs/WAVE1_CORRECTNESS.md` and `docs/WAVE1_CERTIFICATION.json`.

### Wave 2 — proof-based hints

Sixteen number/logic games now use progressive **Focus → Rule → Deduction → Reveal** hints derived from the current board rather than direct stored-answer lookup. Certification covered 920 fresh states with zero hint-engine errors.

See `docs/WAVE2_HINTS.md` and `docs/WAVE2_CERTIFICATION.json`.

### Wave 3 — measured difficulty

Eleven games with weak Easy/Medium/Hard semantics received deterministic measured difficulty systems. Certification covered 990 fresh states with non-overlapping sampled bands.

See `docs/WAVE3_DIFFICULTY.md` and `docs/WAVE3_CERTIFICATION.json`.

### Wave 4 — weak-content rebuild

The nine weak-content Word games now use a deterministic external content pack and reproducible build tooling.

Current inventory:

- **Groups:** 119 editorial categories, with unique-partition certification at runtime
- **Anagrams:** 1,364 canonical signatures; every valid full anagram accepted
- **Letter Hive:** 600 exhaustively enumerated boards
- **Word Grid:** 600 build-time generated/enumerated grids
- **Theme Trail:** 340 boards across 85 themes and 280 distinct trail layouts
- **Word Pieces:** 360 boards from a 221-compound source lexicon
- **Mini Crossword:** 456 distinct blocked 5×5 crosswords with original clues
- **Cryptogram:** 1,000 unique original in-project texts
- **Word Search:** 85 themes with procedural placements and exact-one target-occurrence validation

Wave 4 certification:

- content structural errors: **0**
- Wave 4 runtime states: **1,350**, errors **0**, determinism failures **0**
- full-catalog creation: **212 / 212**
- full-catalog render smoke: **36 / 36**

See `docs/WAVE4_CONTENT.md`, `docs/WAVE4_CONTENT_MANIFEST.json`, and `docs/WAVE4_CERTIFICATION.json`.


### Wave 5 — classic game depth

Eight classic games received deeper version-5 engines instead of relying on toy boards or finite template banks:

- **Kakuro:** compact Easy plus connected interlocked Medium/Hard run boards, exact uniqueness certification, arbitrary run geometry and crossing-sum hints
- **Killer Sudoku:** cage-driven play with no ordinary Sudoku givens, exact cage-aware uniqueness checks and cage-combination assistance
- **Mines:** no-guess Logical generation after the first click, 3×3 first-click safety, subset deductions and chording
- **Nonogram:** 5×5 / 10×10 / 15×15 analytical-image generation, exact line-domain uniqueness solving and stroke-level undo
- **Towers:** generated Latin-square solutions with visibility clues removed only while exact uniqueness survives; 4×4 Easy and 5×5 Medium/Hard
- **Tents:** procedural tree/tent matching with exact one-to-one matching and uniqueness certification
- **Queens:** procedural contiguous-region mutation around certified placements, with exact uniqueness retained after every accepted mutation
- **Light Up:** procedural wall layouts, derived lamp clues, uniqueness-preserving clue removal and exact solver certification

Final Wave 5 evidence includes 192 independent solver checks, 120 bounded deterministic runtime cases, 533 Mines first-click/no-guess cases, 90 final Kakuro and 90 final Towers focused checks, 108/108 full-catalog creation configurations, 36/36 render smoke, and 16/16 real Chromium mobile/desktop Wave-5 route-interaction checks.

See `docs/WAVE5_CLASSIC_DEPTH.md` and `docs/WAVE5_CERTIFICATION.json`.


### Wave 6 — already-strong games → exceptional

Ten of the strongest games received version-6 depth upgrades:

- **Word Ladder:** 3/4/5-letter graph families, exact BFS par, huge certified pair pools, current-state shortest-route hints
- **Sudoku:** real pencil notes, Fill Candidates, undoable note state, measured logical/search profiles
- **Make 24:** exact current-state route analysis, solution-family feedback, alternate exact expressions
- **Binary:** 12×12 Hard with a pre-certified uniqueness bank and deterministic transforms, plus live row/column diagnostics
- **Unequal:** 7×7 Hard and selected-cell candidate/inequality context
- **Arithmetic Cages:** 7×7 Hard, quality-selected exact-unique cages and combination inspection
- **Dominoes:** Double-7 Hard and a complete used/remaining domino inventory
- **Rectangles:** aesthetic candidate selection while retaining exact-cover uniqueness
- **Loop:** uniqueness-preserving clue removal producing genuinely sparse clue boards
- **Untangle:** larger planar graphs, stronger scrambles, best-crossing tracking and structural guidance

Wave 6 certification: **360/360 target runtime cases**, **108/108 full-catalog creation cases**, **36/36 render smoke**, and **20/20 Chromium mobile/desktop target interaction cases**.

See `docs/WAVE6_EXCEPTIONAL.md`, `docs/WAVE6_CERTIFICATION.json`, `docs/WAVE6_BROWSER_QA.json`, and `docs/WAVE6_FEATURE_METRICS.json`.

The historical Wave 6 build used PWA cache v16; the current release uses v21.

## Word content workflow

Rebuild the deterministic content pack:

```bash
python3 scripts/build-word-content.py
```

Validate the generated pack:

```bash
node scripts/validate-word-content.js
```

Runtime game data is emitted to `word-content.js`; editable source material is retained under `content/`.

## Run locally

Service workers require HTTP(S):

```bash
cd endless-puzzle-arcade
python -m http.server 8080
```

Then open `http://localhost:8080`.

There are no third-party runtime dependencies.

## Wave 7 — global S+ parity and certification

The post-Wave-6 unified audit re-ran all 36 games under one shared gate instead of trusting separate wave reports. It closed the remaining hint/accessibility inconsistencies, including a latent Nonogram hint exception that earlier creation/render smoke tests did not expose.

Final Wave 7 evidence:

- global create + hint smoke: **108 / 108** configurations
- expanded create + hint stress: **540 / 540**, errors **0**, hint-state mutations **0**
- generation p95 across the stress sample: **~49 ms**; maximum **~975 ms**; cases over 2 s: **0**
- full mobile browser matrix: **36 / 36** at 390×844, Hard
- full desktop browser matrix: **36 / 36** at 1440×900, Medium
- horizontal-overflow failures: **0**
- duplicate DOM IDs: **0**
- unnamed interactive controls: **0**
- page errors: **0**
- console errors: **0**
- word-content validation errors: **0**

Wave 7 also upgrades the service worker to cache v13: navigation gets an explicit app-shell fallback while failed static-asset requests are no longer incorrectly answered with `index.html`; app icons are part of the offline core.

See `docs/WAVE7_GLOBAL_SPLUS.md`, `docs/WAVE7_CERTIFICATION.json`, `docs/WAVE7_STRESS.json`, `docs/WAVE7_BROWSER_MOBILE.json`, and `docs/WAVE7_BROWSER_DESKTOP.json`.

## Development direction

The 36-game catalog and the per-game S+ feature waves are frozen. No additional games should be added before release. Remaining work should be global release certification: deeper endurance/fuzz coverage, full manual accessibility/screen-reader and device matrices, PWA update/migration tests, production cleanup, and release-candidate hardening.


## Wave 8 — final certification

Wave 8 is the catalog-wide break-it pass. The current build passed 10,800 generator creations, 270 independent exact uniqueness checks, 300 no-guess Mines first-click boards, 1,080 determinism cases, 36/36 mobile + desktop + 320px browser-DOM matrices, storage corruption/quota recovery, save/resume/migration checks, service-worker logic tests, keyboard/accessibility automation, and memory endurance. Killer Sudoku and Towers were moved to exact-certified runtime banks to eliminate rare multi-second generation tails. The PWA cache is **v14**.

See `docs/WAVE8_FINAL_CERTIFICATION.md` and `docs/WAVE8_CERTIFICATION.json`.

## Wave 9 — production hardening

Wave 9 freezes feature development and hardens the shipping boundary. The build now has bounded shared-link inputs, sanitized persisted records, explicit IndexedDB schema constants, robust reset/fallback storage behavior, a restrictive same-origin CSP, stable manifest identity, scoped service-worker cache cleanup, app-shell-only offline navigation fallback, privacy/license surfaces, and reproducible release tooling.

Run the production gate with:

```bash
node scripts/release-check.mjs
```

Build the optional single-file convenience version with:

```bash
python3 scripts/build-standalone.py ../puzzle-arcade-standalone.html
```

Operational documentation is under `docs/PRODUCTION_CONFIG.md`, `docs/SECURITY.md`, `docs/PRIVACY.md`, `docs/STORAGE_SCHEMA.md`, `docs/DEPLOYMENT.md`, `docs/ROLLBACK.md`, `docs/THIRD_PARTY_NOTICES.md`, and `docs/RELEASE_CHECKLIST.md`.

Wave 10 produced the certified V1 release, completed automated production verification, and froze the initial application at v1.0.0; the audited maintenance build is v1.0.1. Physical install/update and assistive-technology checks remain documented as manual post-ship verification because they cannot be independently executed in the automated release environment.

## Broad English input dictionary

Puzzle Arcade separates **accepted player words** from **curated puzzle targets**. Five Letters, Word Ladder, Anagrams, Letter Hive, and Word Grid accept a broad offline ESDB/SCOWL-derived dictionary (132,590 filtered words; 7,278 five-letter words), while generated answers remain curated for familiarity and fairness. See `THIRD_PARTY_NOTICES.md` for attribution.
