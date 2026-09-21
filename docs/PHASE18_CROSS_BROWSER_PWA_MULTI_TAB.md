# Phase 18 — Cross-Browser, Offline/PWA & Multi-Tab Resilience

Puzzle Arcade 1.11.0 hardens the application around the environments that surround puzzle logic: browser differences, installed/offline execution, page restoration, and simultaneous tabs.

## Release identity

- App version: **1.11.0**
- Service-worker cache: **v30**
- IndexedDB schema: **1** (unchanged)
- Catalog: **36 games** (unchanged)
- Automated browser engines: **Chromium, Firefox, WebKit**

## 1. Cross-browser runtime contract

Phase 18 removes avoidable assumptions about newer browser convenience APIs without weakening the normal fast path.

The production runtime now provides:

- structuredClone with a JSON-compatible fallback for Puzzle Arcade's persisted plain-data records.
- CSS.escape with a local selector-escaping fallback.
- ResizeObserver with a window-resize fallback for dense-board fitting.
- crypto.getRandomValues with a non-cryptographic random seed fallback. Puzzle seeds are identifiers, not security tokens.
- WebKit-prefixed backdrop filtering alongside the standards property.
- Installed-app metadata for both general mobile PWA handling and Apple standalone presentation.

The release matrix launches the same production files in Chromium, Firefox, and WebKit. It verifies boot, real puzzle routing, persistence, cross-tab synchronization, and absence of page-level runtime exceptions.

## 2. Multi-tab consistency contract

Puzzle Arcade remains local-first and account-free, so multiple tabs share the same local browser data.

Phase 18 adds an explicit synchronization layer:

1. **Transport**
   - Primary: BroadcastChannel.
   - Fallback: a bounded localStorage pulse observed through the storage event.
   - Messages carry a tab identity, monotonic per-tab sequence, timestamp, type, and Phase 18 version.
   - Duplicate delivery across both transports is ignored.

2. **Write serialization**
   - Primary: Web Locks, scoped per puzzle game.
   - Fallback: an expiring localStorage lease.
   - The fallback is deliberately short-lived so a crashed tab cannot permanently block another tab.

3. **Stale-write rejection**
   - Immediately before committing an active puzzle, the writer re-reads the newest durable record.
   - If another tab has already committed a newer revision, the older tab does **not** overwrite it.
   - This also prevents an old tab from resurrecting an obsolete seed after another tab starts a fresh puzzle.

4. **Remote adoption**
   - A tab receiving a newer active-puzzle write re-reads durable storage rather than trusting message payload data.
   - If the currently displayed puzzle is affected, the tab retires its stale in-memory object and renders the newest saved state.
   - Favorites, settings, statistics, history, deletes, and full reset events are also refreshed across tabs.

The cross-browser browser test verifies writes in both directions between two live tabs. A second two-tab run disables BroadcastChannel before application boot to certify the storage-event fallback.

## 3. BFCache and lifecycle restoration

Browsers can freeze and restore pages without a normal reload. A restored page may therefore contain old in-memory puzzle state even though another tab changed durable state.

Phase 18 resynchronizes on:

- visibilitychange when the page becomes visible;
- persisted pageshow events after back/forward-cache restoration.

Timer state is rebuilt only after the newest persisted puzzle state is reconciled.

## 4. Offline/PWA contract

The service worker continues to precache one coherent application shell:

- index.html
- styles.css
- app.js
- word-dictionary.js
- word-content.js
- manifest.webmanifest
- SVG, 192 px, and 512 px icons

The fetch policy remains deliberately narrow:

- only same-origin resources inside the registered scope are intercepted;
- only the shell navigation and known core assets use the offline cache;
- unknown navigations and unrelated resources are never silently replaced by the app shell;
- a failed install deletes its incomplete cache.

### Controlled upgrades

Previous releases intentionally avoided skipWaiting, but that could leave an already-open installation on an old code/cache generation until all old tabs closed.

Phase 18 changes the lifecycle without making installation unsafe:

- a freshly installed worker still waits by default;
- when an existing controlled client detects a fully installed replacement worker, the client explicitly sends SKIP_WAITING;
- the new worker activates, cleans only older caches belonging to the same application scope, and claims clients;
- the existing client performs one guarded reload after controllerchange;
- service-worker registration uses updateViaCache: none and performs an online update check shortly after boot.

This prevents a mixed old-shell/new-runtime session while allowing upgrades to complete without requiring every tab to be closed manually.

## 5. Offline browser certification

Chromium release automation performs a real service-worker test:

1. open the production app through HTTP;
2. wait for an active controlling service worker;
3. switch the browser context offline;
4. reload the application;
5. require the cached app shell and Phase 18 runtime to boot successfully;
6. require the runtime network state to report offline;
7. reconnect and require online recovery.

Firefox and WebKit remain part of the release matrix for production runtime and multi-tab behavior. Physical installed-PWA update behavior on Safari/iOS and other real devices remains a manual post-release check; browser-engine automation is not treated as a substitute for device installation testing.

## 6. Regression surfaces

Phase 18 adds:

- scripts/test-phase18-resilience.mjs — static production contract;
- scripts/test-resilience-browser.py — real-browser multi-tab, fallback-transport, and offline certification;
- a required three-engine GitHub Actions matrix;
- Phase 18 assertions in scripts/release-check.mjs;
- service-worker tests for the explicit activation message and cache v30.

All Phase 13–17 puzzle-quality, variety, stress, solvability, hint, completion, and player-state-fuzz gates remain required.

## 7. Non-goals

Phase 18 does **not**:

- add cloud sync;
- merge two conflicting puzzle boards cell-by-cell;
- create cross-device synchronization;
- change puzzle generators or difficulty calibration;
- change IndexedDB schema;
- expand the 36-game catalog.

The consistency rule is intentionally simpler: serialize local writes, reject stale commits, then adopt the newest durable revision.
