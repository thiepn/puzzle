# Phase 19 — Performance, Memory & Long-Session Endurance

Puzzle Arcade 1.12.0 hardens the application for long-lived browser sessions. Phase 18 proved that the app survives browser differences, offline execution, and multiple tabs; Phase 19 proves that repeated use does not gradually accumulate timers, handlers, DOM, storage, or memory until the app degrades.

## Release identity

- App version: **1.12.0**
- Service-worker cache: **v31**
- IndexedDB schema: **1** (unchanged)
- Catalog: **36 games** (unchanged)
- Durable result-history ceiling: **10,000 entries**

## 1. Long-session model

The automated endurance session is deliberately broader than a normal smoke test.

The required release job:

1. boots the production app in Chromium;
2. opens every one of the 36 puzzle families once to warm lazy dictionaries, solver tables, UI caches, and generator caches;
3. establishes a post-warm baseline;
4. performs three additional full-catalog cycles using fresh deterministic seeds;
5. exercises real hint, board-click, keyboard, persistence, route, and lifecycle paths;
6. returns to the home route between cycles;
7. forces garbage collection when the test browser exposes it;
8. measures route latency, heap usage, DOM size, storage size, timers, pointer cleanup, and bounded runtime caches.

That is **36 warm routes + 108 measured routes = 144 game routes** in the release gate.

A separate weekly/manual deep workflow uses 12 measured cycles:

- 36 warm routes
- 432 measured routes
- 468 total game routes

## 2. Runtime diagnostics

Phase 19 adds a small production-safe diagnostic surface at `window.__PA_ENDURANCE__`.

It reports:

- current route and mounted game;
- total DOM and main-content node counts;
- overlay and toast node counts;
- whether the game timer is active;
- whether game-specific pointer cleanup remains registered;
- global keyboard/pointer handler state;
- route render, game render, timer start/stop, cleanup, lifecycle, and history-prune counters;
- bounded Phase 18 sync-message cache size;
- bounded Phase 17 fresh-template cache size;
- in-memory active/history counts;
- browser heap figures when `performance.memory` is available;
- IndexedDB active/history counts;
- Storage API quota/usage estimates when supported.

The diagnostics do not run a permanent sampling loop. Data is collected only when explicitly requested, so the monitoring surface does not itself create an endurance problem.

## 3. Timer and handler lifetime

Puzzle Arcade has one shared game timer plus game-specific keyboard, pointer, resize, and observer behavior.

Phase 19 certifies that after repeated route changes:

- no shared interval remains active on the home route;
- every started shared timer has a matching stop;
- game-specific pointer cleanup is released;
- `window.onkeydown`, `document.onpointermove`, `document.onpointerup`, and `document.onpointercancel` are cleared outside gameplay;
- temporary overlays and toasts do not accumulate;
- MutationObserver / ResizeObserver cleanup continues through the existing render cleanup chain.

The release test requires cleanup to have been exercised, not merely that the final page happens to look correct.

## 4. DOM growth

After the warm pass, the test records a home-route DOM baseline. After all measured cycles it returns to the same route and compares again.

The release ceiling is:

- final DOM nodes <= warm baseline + **250 nodes**

This tolerance permits legitimate state-dependent home content while still catching detached/reinserted UI accumulation or repeated chrome duplication.

## 5. Heap growth

Chromium is launched with precise memory information and exposed garbage collection for the endurance job.

The test:

- warms all puzzle families first;
- forces GC;
- records used JS heap;
- performs the measured route cycles;
- returns home;
- forces GC again;
- compares used heap.

Release allowance:

- maximum post-warm heap growth: **96 MiB**

Deep weekly allowance:

- maximum post-warm heap growth: **128 MiB**

The allowance is intentionally absolute rather than requiring identical heap size. Puzzle Arcade contains large local word data and several lazily built finite solver/cache structures; those are legitimate retained memory. The test is aimed at repeated-session leakage after the warm baseline.

Browsers that do not expose `performance.memory` still use the DOM, handler, timer, storage, and runtime-cache endurance contracts.

## 6. Cache bounds

Phase 19 explicitly checks existing bounded caches that could otherwise look like leaks during a long session:

- Phase 18 received-message IDs: maximum **256**
- Phase 17 fresh puzzle templates: maximum **256**

Generator/content caches constructed from finite local source sets remain finite by design and are warmed before the heap baseline.

## 7. Durable storage growth

Active puzzle storage is naturally bounded because IndexedDB uses one active record per game ID.

Completed history was previously unbounded. Phase 19 adds:

- `MAX_HISTORY_ENTRIES = 10000`
- boot-time compaction of legacy oversized history;
- live pruning after new completions;
- one-transaction IndexedDB compaction;
- equivalent localStorage fallback compaction;
- cross-tab refresh signaling after pruning.

Ten thousand result rows is deliberately high enough to preserve years of ordinary usage while preventing indefinite browser-storage growth.

The release browser test independently inserts 40 valid result rows, compacts to a test ceiling of 24, and requires both IndexedDB and in-memory state to report exactly 24 afterward.

## 8. Lifecycle endurance

Each measured full-catalog cycle exercises page lifecycle handlers while a puzzle is mounted.

The session verifies that:

- pagehide suspension remains callable after repeated renders;
- pageshow restoration remains callable after repeated renders;
- persistence settles after lifecycle transitions;
- lifecycle counters continue advancing instead of handlers being lost or duplicated.

Phase 18 remains responsible for the detailed BFCache synchronization semantics; Phase 19 verifies those paths remain healthy after sustained churn.

## 9. Latency degradation

Every measured game route records end-to-end navigation/generation/render latency.

Release ceilings:

- global route p95: **6.5 seconds**
- global maximum: **12 seconds**
- final-cycle median must not exceed the first-cycle median by more than the larger of:
  - 2.5×, or
  - 900 ms

The generous absolute ceilings accommodate intentionally heavy certified puzzle generators. The drift check is the more important endurance signal: the same app session must not become progressively slower because resources accumulate.

## 10. CI structure

Phase 19 adds:

- `scripts/test-phase19-endurance.mjs` — static release contract;
- `scripts/test-endurance-browser.py` — real long-session browser certification;
- required `endurance-gate` in the main release workflow;
- `.github/workflows/endurance.yml` — weekly/manual deep endurance run;
- JSON endurance artifacts retained for 30 days.

Deployment now requires:

- cumulative release gate;
- all four Phase 17 player-fuzz shards;
- Phase 19 endurance gate;
- Chromium / Firefox / WebKit Phase 18 resilience matrix.

## 11. Non-goals

Phase 19 does not:

- change puzzle difficulty or generation rules;
- add cloud telemetry;
- upload performance data;
- add a background monitoring process;
- change the 36-game catalog;
- change IndexedDB schema version;
- treat one synthetic benchmark as a replacement for real-device profiling.

The goal is bounded degradation: repeated normal use should remain functionally and structurally equivalent to a freshly warmed session.
