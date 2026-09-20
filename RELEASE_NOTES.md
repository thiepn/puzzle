# Puzzle Arcade 1.8.0 — Generator Robustness, Stress Testing & Long-Run Reliability

Phase 15 stress-tests the complete generator stack rather than only checking isolated examples.

- Added a Phase 15 diagnostic API covering all 36 games and all Easy / Medium / Hard tiers.
- Every sampled seed is generated twice, with the replay pass executed in reverse order to expose hidden cross-seed state.
- Stable digests verify deterministic puzzle + initial-state reproduction.
- Separate active records are checked for shared mutable state references.
- Phase 13 quality acceptance is rechecked during every stress generation, including deterministic fallback attempts.
- Seed diversity is measured to detect finite-bank collapse or broken seed mapping.
- Median, p95, maximum latency, absolute generation budgets, and early-vs-late timing drift are recorded.
- Phase 13 fallback pressure is measured so generators cannot silently depend on repeated retry rescue.
- Mines is stress-tested after a deterministic center first click so its actual mine layout is included.
- The normal release browser gate now adds 432 measured generator executions.
- A weekly/manual deep stress workflow runs 1,728 measured generations across four parallel shards and uploads JSON reports.

Storage schema remains **1**. Service-worker cache is **v27**.

See `docs/PHASE15_GENERATOR_ROBUSTNESS.md` for the complete certification contract.
