# Puzzle Arcade 1.12.0 — Performance, Memory & Long-Session Endurance

Phase 19 turns sustained browser use into a release requirement.

- The required endurance job warms all 36 puzzle families and then runs 108 measured fresh-seed routes.
- The weekly/manual deep workflow runs 432 measured routes after the same full-catalog warm pass.
- Route latency, DOM growth, heap growth, timers, pointer cleanup, global handlers, lifecycle recovery, runtime caches, and storage are measured in one persistent browser session.
- Chromium heap growth is measured only after lazy puzzle/cache initialization, preventing legitimate warm-up memory from being misclassified as a leak.
- Completed history is now bounded to 10,000 durable entries instead of growing forever.
- Oversized legacy history is compacted on boot; ongoing play prunes excess results.
- IndexedDB and localStorage fallback storage follow the same retention rule.
- The endurance gate independently verifies history compaction using real browser storage.
- Active-puzzle storage remains naturally bounded to one record per game.
- Existing Phase 18 Chromium/Firefox/WebKit resilience certification and Phase 17 four-shard player fuzzing remain required for deployment.

IndexedDB schema remains **1**. Service-worker cache is **v31**.

See docs/PHASE19_PERFORMANCE_MEMORY_ENDURANCE.md for the complete contract.
