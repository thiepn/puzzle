# Puzzle Arcade 1.7.0 — Variety, Novelty & Anti-Repetition

Phase 14 prevents a run of individually valid puzzles from feeling like repetitions of the same board.

- All 36 games now have explicit content/structure variety fingerprints.
- New Puzzle compares bounded candidate generations against recent same-game history and the current board.
- Exact content reuse, repeated canonical shapes, repeated themes, and near-identical difficulty profiles reduce a candidate's novelty score.
- Square-board fingerprints canonicalize rotations/reflections where those transformations do not represent meaningful structural novelty.
- Region partitions normalize region IDs, so simple relabeling does not fake variety.
- Heavy solver-backed games use smaller candidate sets to keep latency bounded.
- Games without recent comparable history generate normally without extra work.
- Completed results persist compact Phase 14 fingerprints for future novelty decisions.
- Mines fingerprints its generated post-first-click layout and uses a simulated center-first-click only for candidate selection/certification.
- Surprise Me avoids the five most recent game IDs when alternatives exist and prefers a different family from the latest result.
- Shared explicit seeds remain deterministic and bypass local novelty selection.
- Chromium certification runs deterministic multi-puzzle sequences across all 36 games and rejects immediate near-duplicates.

Storage schema remains **1**. Service-worker cache is **v26**.

See `docs/PHASE14_VARIETY_ANTI_REPETITION.md` for the full fingerprint and certification contract.
