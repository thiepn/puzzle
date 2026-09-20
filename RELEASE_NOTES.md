# Puzzle Arcade 1.6.0 — Difficulty Calibration & Puzzle Quality

Phase 13 moves the quality bar from presentation to the puzzles themselves.

- All 36 games now participate in one runtime difficulty/quality certification layer.
- Every family has explicit property-based difficulty evidence instead of relying on a generic board-size label.
- Hard certification requires a non-size reasoning signal such as search depth, clue scarcity, ambiguity, deductions, crossings, or equivalent family-specific pressure.
- Malformed, already-solved, empty, and obviously trivial generations are rejected before play.
- Families that promise exact uniqueness must retain their uniqueness certificate.
- The original requested seed is evaluated first; deterministic fallback seeds are used only when that generation fails quality certification.
- Mines is certified after the first click, when its no-guess layout actually exists.
- Generated puzzles record quality score, calibrated difficulty score, raw evidence, non-size reasoning evidence, source seed, and acceptance state.
- A Chromium certification pass generates Easy / Medium / Hard across all 36 games and blocks release on rejected samples or overlapping calibrated bands.
- Existing Phase 1–12 regression and browser gates remain required.

Storage schema remains **1**. Service-worker cache is **v25**.

See `docs/PHASE13_DIFFICULTY_QUALITY.md` for the complete metric and acceptance contract.
