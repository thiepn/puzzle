# Phase 20 — Final Production Hardening, Release Certification & Maintenance Baseline

Phase 20 closes the feature-development sequence for Puzzle Arcade and converts the project into a maintained production application.

## Release identity

- App version: **1.13.0**
- Service-worker cache: **v32**
- IndexedDB schema: **1**
- Backup schema: **1**
- Catalog: **36 games**
- Release channel: **stable**

## 1. Disaster recovery

Before Phase 20 the application could reset local data but could not export or restore it. Phase 20 adds a complete local backup lifecycle.

A backup contains:

- sanitized settings;
- favorites;
- active/completed per-game records;
- bounded result history;
- app/database/backup schema metadata;
- deterministic corruption checksum.

Backup creation includes the newest checkpoint-aware active records.

Restore validates before replacement:

1. 16 MiB file-size ceiling;
2. JSON parsing;
3. exact backup kind;
4. supported backup schema;
5. compatible database schema;
6. checksum integrity;
7. settings/favorites sanitization;
8. history validation and de-duplication;
9. active-record game/seed/difficulty validation;
10. current generator-version compatibility;
11. per-game save repair against a freshly generated canonical puzzle.

Only after preparation succeeds can the confirmed restore replace live data.

IndexedDB restore uses one transaction spanning settings, favorites, active records, and history. The localStorage fallback snapshots previous Puzzle Arcade keys and attempts rollback if replacement fails.

Reset and restore are broadcast to other Puzzle Arcade tabs.

## 2. Recovery certification

The required Chromium recovery test verifies the actual user-facing controls:

- change and persist settings;
- create a favorite;
- create completed history;
- preserve an in-progress puzzle;
- download the backup through the Settings button;
- validate backup metadata and counts;
- reject checksum-tampered backup without changing live data;
- repair a checksummed damaged active record during import preparation;
- reset through the confirmation dialog;
- verify durable stores are empty;
- restore through the real file chooser;
- verify settings/favorites/history/active records return;
- reload the page;
- verify restored data remains durable;
- reopen both completed and in-progress puzzles.

## 3. Release integrity

`release-manifest.json` is the canonical release identity document.

During deployment, CI creates `release-integrity.json` from the staged production directory. It stores SHA-256 and byte size for every core release file.

After GitHub Pages deployment, the production verifier:

- downloads the remote release manifest;
- confirms release identity;
- downloads the remote integrity manifest;
- fetches every core production file with cache busting;
- recomputes SHA-256 and byte size;
- rejects mixed/stale core generations;
- checks deployed app version/build phase;
- checks service-worker version/cache generation;
- checks CSP presence;
- checks PWA start URL, scope, and standalone mode.

This upgrades the former production smoke from selected string checks to complete core-file release integrity verification.

## 4. Final security review

The final baseline requires:

- self-only script/network/worker/font/image sources;
- no remote runtime libraries;
- no production `eval` or `new Function`;
- no analytics or ad tracker;
- bounded shared-link input;
- bounded history and backup input;
- backup prototype-pollution key rejection;
- schema fail-closed behavior;
- service-worker cache isolation by deployment path;
- deployment integrity verification.

See `SECURITY.md`.

## 5. Maintenance baseline

Phase 20 explicitly ends open-ended numbered feature work for the current product line.

Future work defaults to:

- bug fixes;
- browser compatibility;
- accessibility corrections;
- security hardening;
- content corrections;
- measured performance work;
- maintenance-driven refactoring.

The mandatory gates and release/version/storage rules are frozen in `docs/MAINTENANCE_BASELINE.md`.

## 6. Required final matrix

A Phase 20 production merge requires:

- cumulative release gate;
- four Phase 17 player-fuzz shards;
- Chromium Phase 18 resilience;
- Firefox Phase 18 resilience;
- WebKit Phase 18 resilience;
- Phase 19 long-session endurance;
- Phase 20 recovery/disaster-recovery certification.

A main-branch deployment additionally requires the deploy-time integrity verifier to pass against the live GitHub Pages release.

## 7. Manual checks not falsely automated

The codebase records several physical-device checks as manual:

- iOS installed-PWA update;
- Android installed-PWA update;
- VoiceOver / TalkBack;
- physical haptics;
- mobile file-picker backup/restore;
- representative touch gestures and safe-area behavior.

Playwright engine coverage is not described as proof that these physical-device checks occurred.

## 8. Final release boundary

Phase 20 intentionally adds no puzzle family, difficulty system, progression system, account system, backend, or cloud synchronization.

The product boundary after this phase is:

> a local-first, account-free, offline-capable 36-game puzzle arcade with deterministic generation, certified puzzle quality, resilient persistence, cross-browser support, bounded long-session resource behavior, local disaster recovery, and a frozen maintenance contract.
