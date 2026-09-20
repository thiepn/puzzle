# Phase 13 — Difficulty Calibration & Puzzle Quality

## Goal

Phase 13 makes **Easy / Medium / Hard** a testable generation contract across all 36 games. It does not redesign the UI. It evaluates the puzzle that was actually generated, rejects malformed or trivial output, records measurable difficulty evidence, and keeps exact uniqueness certificates mandatory for solver-backed families.

The central rule is: **size alone is never enough to certify Hard**. Every Hard sample must also expose a non-size reasoning signal such as search depth, clue scarcity, ambiguity, path length, subset deductions, cage structure, crossing density, or equivalent family-specific evidence.

## Runtime quality gate

Every final game generator is wrapped after all historical Wave overrides have been installed.

For a requested seed and difficulty:

1. Generate the normal puzzle from the original seed.
2. Measure family-specific difficulty evidence.
3. Run structural/triviality checks.
4. Require an exact-uniqueness certificate for families whose generator promises uniqueness.
5. Check the requested tier against calibrated evidence bands.
6. Accept the original puzzle when it passes.
7. Only when it fails, try deterministic fallback seeds such as `:p13:1`.
8. Reject generation if no candidate passes.

This preserves normal pre-Phase-13 deterministic seeds and existing saves in the common case while preventing newly detected weak generations from silently shipping.

Mines is certified after the first click because its final mine layout is intentionally generated only after the first-click safe zone is known.

## Difficulty evidence by game

| Game | Primary measured evidence |
|---|---|
| Five Letters | lexical rarity; repeated/rare-letter pressure |
| Groups | editorial group hardness; wordplay ambiguity |
| Word Ladder | exact shortest path; word length |
| Anagrams | permutation search space; answer ambiguity |
| Letter Hive | completion ratio; lexical depth |
| Word Grid | completion ratio; long-word density |
| Theme Trail | path turns; answer-length structure |
| Word Pieces | compound length; chunk ambiguity |
| Mini Crossword | clue/entry complexity; crossing structure |
| Cryptogram | cipher diversity; text-pattern complexity |
| Word Search | reverse/diagonal placement; grid density |
| Sudoku | blank ratio; unresolved cells; solver search nodes |
| Killer Sudoku | cage solver nodes; singleton assistance |
| Kakuro | interlocking run count; average run length |
| Unequal | removal ratio; inequality scarcity |
| Arithmetic Cages | cage/operator pressure; singleton scarcity |
| Make 24 | minimum expression complexity; division/fraction requirement |
| Mines | logical rounds; subset deductions; no-guess progress |
| Nonogram | multi-run clue density; fill balance |
| Loop | ambiguous clue density; strong-clue scarcity |
| Bridges | island branching; double-bridge pressure |
| Light Up | clue removal; wall/visibility constraints |
| Islands | clue scarcity; island-size pressure |
| Hitori | duplicate-conflict density; shade density |
| Binary | given removal ratio; constraint load |
| Queens | region irregularity; uniqueness-preserving mutation depth |
| Number Path | checkpoint gaps; exact-solver search effort |
| Tents | tent density; row/column distribution pressure |
| Rectangles | exact-cover candidate ambiguity; partition density |
| Dominoes | domino-set size; pairing ambiguity |
| Towers | visibility-clue scarcity; Latin-square size |
| Fillomino | given scarcity; region-size pressure |
| Network | rotation ambiguity; initial connector disorder |
| Sliding Tiles | shortest/lower-bound move distance |
| Lights Out | optimal press count; solution-space nullity |
| Untangle | crossing density; graph-connectivity pressure |

## Stored certification metadata

Generated puzzles now expose `puzzle.qualityCertification` with:

- Phase/version
- accepted/deferred state
- quality score
- calibrated difficulty score
- raw difficulty evidence
- non-size reasoning signal
- tier-pass state
- measured signal details
- source seed and attempt count

Existing family-specific `difficultyScore` / `difficultyMetrics` remain intact so prior solver diagnostics are not repurposed or lost.

## Automated certification

Two new gates protect the release:

- `node scripts/test-difficulty-quality.mjs` verifies the complete 36-game registry, quality engine, non-size signal, deterministic fallback path, Mines deferred path, and audit export.
- `python scripts/test-difficulty-browser.py --base-url http://127.0.0.1:8080/` launches the production app in Chromium and actually generates Easy, Medium, and Hard samples for every game. It requires every generated sample to pass, requires non-overlapping calibrated score bands, and requires every Hard tier to carry a non-size reasoning signal.

The browser audit API is `window.__PA_DIFFICULTY_AUDIT__`. It is intentionally read-only with respect to player storage; audit samples are generated in memory and are not saved as active games.

## Acceptance criteria

Phase 13 is complete only when:

- 36/36 games expose Easy / Medium / Hard at their final runtime definition.
- 36/36 games have an explicit measured difficulty method.
- malformed, already-solved, empty, or trivially degenerate generations are rejected.
- uniqueness-certified families retain their exact certificate requirement.
- Hard cannot certify on board size alone.
- automated browser generation certifies all 108 tier combinations for one full sample pass.
- the cumulative release gate and existing browser interaction matrix still pass.
