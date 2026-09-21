# Puzzle Arcade 1.9.0 — Solvability, Hint Correctness & Completion Certification

Phase 16 certifies that every generated puzzle is actually finishable under its real rules.

- Added a catalog-wide canonical completion witness for all 36 games.
- Added 36 game-specific completion methods spanning dictionary/path solvers, exact constraint validators, stored-solution verification, parity checks, and independently reconstructed spatial witnesses.
- Added a negative control requiring every generated starting state to remain unfinished.
- Added hint-source certification for every game.
- Proof-based number/logic games run their pure proof engine against fresh states and reject malformed proof payloads.
- Word/path/spatial games validate the exact answer, route, trace, construction, or solver data their hints rely on.
- Mines is certified after deterministic first-click generation, with every clue recomputed from the mine map.
- Lights Out applies the exact GF(2) solver result and verifies that the board actually clears.
- Sliding Tiles independently checks goal-compatible permutation parity.
- Untangle independently reconstructs the generator's planar embedding and verifies zero crossings/overlaps.
- The production browser gate now adds 108 completion certifications across all games and difficulty tiers.

Storage schema remains **1**. Service-worker cache is **v28**.

See `docs/PHASE16_COMPLETION_CERTIFICATION.md` for the complete contract.
