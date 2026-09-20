# Phase 15 — Generator Robustness, Stress Testing & Long-Run Reliability

## Goal

Phase 13 certifies the quality of one generated puzzle. Phase 14 certifies short-run variety. Phase 15 tests whether the **final generator stack remains trustworthy when exercised repeatedly**.

The target failure classes are:

- rare generator exceptions
- Phase 13 rejection after bounded retries
- nondeterministic output from the same seed
- shared mutable state between separately created games
- finite-bank exhaustion or very low seeded diversity
- pathological generation latency
- latency degradation over a longer sequence
- generators that require excessive Phase 13 fallback attempts
- first-click Mines failures that ordinary pre-click creation does not expose

## Runtime stress API

The app exposes:

`window.__PA_GENERATOR_STRESS__`

This API is diagnostic only. It does not write to IndexedDB, alter player history, or replace normal gameplay generation.

### Seed corpus

Every tier begins with two edge seeds:

- a maximum-length 96-character valid seed
- the minimal seed `0`

Additional samples use deterministic Phase 15 stress seeds. This makes CI failures reproducible.

### Interleaved deterministic replay

For every game/difficulty:

1. Generate the complete seed batch once.
2. Generate the same seeds again in reverse order.
3. Compare stable digests and Phase 14 content/shape fingerprints.

The reversed second pass ensures a seed is replayed **after other puzzles have been generated**, which catches cross-seed mutation and hidden module-level state that an immediate A/A comparison can miss.

### Stable digest

The digest includes:

- game ID
- requested seed
- difficulty
- generated puzzle data
- initial player state
- Phase 13 certification
- Phase 14 fingerprint

Volatile active timestamps are excluded because they are outside the puzzle/state digest.

### State ownership

Two independently generated active records must not share object or array references inside their initial player state. Shared state references are treated as a release failure.

## Reliability metrics

Each tier records:

- total generations
- generator exceptions
- quality rejections
- deterministic replay mismatches
- shared-state violations
- unique puzzle digests
- unique Phase 14 content fingerprints
- median / p95 / maximum generation time
- absolute latency budget
- early-vs-late timing drift
- Phase 13 fallback rate
- average and maximum quality-gate attempts

## Diversity / finite-bank pressure

Stress testing does not require every seed to map to a globally unique puzzle forever—some certified generators intentionally use finite banks.

It does require the tested seed batch to show meaningful variation. At least half of the sampled seeds, rounded up with a minimum of two, must produce distinct full puzzle digests.

This catches accidental bank collapse, broken seed selection, or a generator that silently returns one board repeatedly.

## Latency policy

Normal generators have a **2500 ms** per-generation ceiling in Chromium CI.

Known solver-heavy families receive a **5000 ms** ceiling:

- Word Ladder
- Killer Sudoku
- Unequal
- Arithmetic Cages
- Bridges
- Light Up
- Islands
- Hitori
- Queens
- Number Path
- Rectangles
- Dominoes
- Towers
- Fillomino
- Network
- Untangle

For batches of four or more samples, Phase 15 also checks timing drift. Later generations may not degrade beyond 6× the early median unless the later median remains below 500 ms.

## Retry pressure

Phase 13 may intentionally fall back to another deterministic source seed when the requested seed fails quality calibration. Phase 15 records that behavior.

A tier fails when fallback pressure becomes systemic: average attempts reach three or more with effectively every generation requiring fallback.

## Mines

Mines cannot be fully certified before the first click. The stress system therefore:

1. creates the deferred board,
2. applies a deterministic center first click,
3. runs the normal Phase 13 Mines certification,
4. fingerprints and digests the completed generated layout.

## CI layers

### Pull request / release gate

`python scripts/test-generator-stress-browser.py --samples 4`

This covers:

- 36 games
- 3 difficulties
- 4 requested seeds per tier
- first pass + deterministic replay pass

That is **864 measured generator executions** in addition to the existing interaction, difficulty, and variety suites.

### Deep long-run workflow

`.github/workflows/generator-stress.yml` runs:

- manually through workflow dispatch
- weekly
- as four parallel game shards
- 8 seeds per difficulty by default
- first pass + reverse deterministic replay

A complete deep run executes **1,728 measured puzzle generations** across all 36 games and stores a JSON report artifact for every shard.

The release run also captures Chromium JS heap usage before and after the full catalog pass. A catastrophic growth of more than 128 MiB fails certification; smaller growth is reported because intentional generator-analysis caches warm during the run.

The deep workflow is intentionally separate from the normal deployment gate so release feedback remains bounded while long-run testing can be substantially heavier.

## Acceptance criteria

Phase 15 passes only when the standard catalog audit has:

- zero generator exceptions
- zero Phase 13 quality rejections
- zero deterministic replay mismatches
- zero shared-state-reference violations
- adequate seeded diversity in every game/difficulty
- no generation over its absolute latency budget
- no severe long-run timing drift
- no pathological Phase 13 fallback pressure
- zero browser page errors

Phase 13 and Phase 14 remain mandatory and run before Phase 15 in the production browser gate.
