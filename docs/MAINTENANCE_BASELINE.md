# Puzzle Arcade — Maintenance Baseline

This document defines the post-Phase-20 production baseline for Puzzle Arcade.

## Frozen baseline

- Product release: **1.14.0**
- Release channel: **stable**
- IndexedDB schema: **1**
- Backup schema: **1**
- PWA cache generation: **v33**
- Playable catalog: **36 games**
- Runtime model: static local-first browser application
- Backend/accounts/analytics: **none**
- Runtime third-party JavaScript/CSS/font/API dependencies: **none**
- Deployment target: GitHub Pages

Phase 20 closed the open-ended feature-development sequence. Release 1.14.0 is the explicitly approved pre-maintenance QoL exception, focused on navigation and mobile usability without changing puzzle systems or storage schemas. Future work should default to maintenance, defect correction, compatibility, security, accessibility, content correction, or measured performance work. A new feature phase should require an explicit product decision rather than emerging from maintenance drift.

## Production invariants

Future changes must preserve these invariants unless a deliberately versioned migration replaces them:

1. Existing local puzzle progress is not silently discarded.
2. IndexedDB schema changes require an explicit migration and disaster-recovery test.
3. Backup schema changes require backward-compatibility handling or an explicit compatibility boundary.
4. Every playable game remains reachable without an account, network API, payment, energy/lives system, or progression lock.
5. All puzzle generation remains local.
6. The PWA remains usable after a certified offline reload.
7. Multi-tab writes must not let a stale tab overwrite a newer session.
8. Completed history remains bounded.
9. Browser runtime remains free of third-party runtime dependencies unless explicitly reviewed.
10. Deployment must serve one internally coherent release generation.

## Required release gates

Every production release must keep the following green:

- cumulative static/release gate;
- all four player-fuzz shards;
- Chromium resilience;
- Firefox resilience;
- WebKit resilience;
- long-session endurance;
- backup / restore / reset recovery;
- QoL keyboard/mobile certification;
- deployment integrity verification after GitHub Pages deployment.

Do not bypass a red gate by weakening its threshold unless the threshold itself is shown to be invalid with reproducible evidence.

## Release identity rules

A production release must update together:

- `APP_VERSION`;
- `BUILD_PHASE` or maintenance label;
- service-worker `APP_VERSION`;
- service-worker cache generation;
- `release-manifest.json`;
- release notes and changelog;
- any version-specific test assertion;
- production deployment smoke/integrity checks.

A cache generation must never be reused for different core application bytes.

## Versioning

Use semantic versioning as a practical maintenance convention:

- **patch**: defect fixes, compatibility fixes, copy corrections, security hardening, internal test improvements that do not intentionally alter user-facing product capability;
- **minor**: deliberate user-facing capability changes, new puzzle content systems, storage-format-compatible feature additions;
- **major**: intentionally breaking storage/backup compatibility or a major product architecture change.

Schema versions are independent of the app version.

## Storage and recovery

Before any storage migration:

1. export a current backup;
2. run the recovery browser certification;
3. verify old backup compatibility;
4. verify a failed/invalid import does not mutate live data;
5. verify reset still clears all Puzzle Arcade-owned browser data;
6. verify another open tab receives reset/restore synchronization.

Current limits:

- active records: naturally bounded to one durable record per game;
- completed history: 10,000 entries;
- backup file: 16 MiB;
- backup checksum: deterministic FNV-1a 32-bit corruption check;
- backup authenticity: **not claimed**. The checksum detects ordinary damage/editing; it is not a cryptographic signature.

## Performance baseline

Phase 19 established a warmed persistent-browser baseline. Release maintenance should investigate meaningful regressions in:

- post-warm heap growth;
- route p95 / maximum latency;
- first-cycle vs. final-cycle latency drift;
- DOM growth on equivalent routes;
- unmatched timers;
- lingering global input handlers;
- bounded cache growth;
- IndexedDB growth.

The weekly/manual deep endurance workflow remains part of maintenance.

## Browser support

Required automated engines:

- Chromium
- Firefox
- WebKit

Do not equate Playwright WebKit with full physical Safari/iOS PWA certification.

## Manual physical-device checklist

These checks remain manual and must not be described as independently automated:

- install/update the PWA on a physical iPhone/iPad;
- install/update the PWA on a physical Android device;
- verify standalone launch after an app update;
- verify offline launch after device/browser restart;
- VoiceOver / TalkBack navigation on representative games;
- physical vibration/haptic behavior where supported;
- touch dragging/painting on representative trace and grid games;
- phone rotation and safe-area behavior;
- storage backup download and restore through a mobile file picker.

A maintenance release can be automated-release-certified while these are still manual, but public release notes must not claim those physical checks occurred unless they actually did.

Maintenance Pass 3 formalizes this evidence boundary. Use `docs/MAINTENANCE_PASS3_REAL_DEVICE.md`, copy `docs/real-device-evidence.template.json`, and run `node scripts/validate-real-device-evidence.mjs <evidence.json>` for strict physical sign-off. Until that strict validator passes on actual hardware, the correct status is **REMOTE/AUTOMATED READINESS PASS — PHYSICAL CLOSURE PENDING**.

## Security baseline

- CSP remains self-only for scripts, network connections, workers, images, and fonts.
- No `eval` or `new Function` in production runtime.
- No remote analytics, ad, font, script, stylesheet, or game-content dependency.
- Backup import is size-bounded, schema-checked, checksum-checked, and sanitized before replacement.
- Backup validation occurs before destructive replacement.
- Restore uses an atomic IndexedDB transaction when IndexedDB is available.
- Unknown or future backup/database schemas fail closed.

## Documentation integrity

Maintenance documentation is part of the operational surface. CI verifies that the README release identity matches runtime metadata, maintained file references resolve, and retired operational paths/commands do not silently reappear.

See `docs/MAINTENANCE_PASS1_DOCS_INTEGRITY.md` for the initial post-handoff audit.

## CI and workflow hygiene

The maintenance baseline treats CI configuration as production infrastructure.

Current rules:

- cumulative static contracts are owned by `scripts/release-check.mjs` and are not duplicated in workflow YAML;
- browser automation installs from the pinned `.github/requirements-ci.txt`;
- Python CI dependencies and GitHub Actions are tracked monthly by Dependabot;
- workflow-level permissions are read-only; Pages/OIDC write privileges are scoped to deployment only;
- docs/tooling-only main pushes run certification but do not republish identical runtime bytes;
- the stable `certification-summary` status aggregates all required release gates;
- deep generator, player-fuzz, and endurance suites are staggered to avoid scheduled runner contention.

See `docs/MAINTENANCE_PASS2_CI_HYGIENE.md` and `docs/REPOSITORY_GOVERNANCE.md`.

## Maintenance workflow

For routine fixes:

1. reproduce the defect;
2. add or strengthen a regression test;
3. make the smallest production change;
4. run the relevant focused gate;
5. run the cumulative PR matrix;
6. merge only when required gates are green;
7. verify deployed release integrity;
8. update release notes only for user-relevant changes.

Avoid repeated architecture rewrites after Phase 20 unless measurements or a concrete defect justify them.

## Escalation triggers

A new architecture/research phase is justified only if one of these becomes true:

- IndexedDB schema migration is required;
- backup format must change incompatibly;
- a backend/account/sync system is deliberately introduced;
- the 36-game architecture cannot support a planned new product direction;
- browser platform changes invalidate the current offline/PWA model;
- measured performance shows the single-file runtime architecture has become a material bottleneck.

Otherwise, remain in maintenance mode.

## Formal handoff

The operational handoff is defined in `docs/MAINTENANCE_HANDOFF.md`.

Maintenance changes should use the repository issue/PR templates, follow `docs/RELEASE_CHECKLIST.md`, and use `docs/ROLLBACK.md` for production rollback decisions.

The maintenance handoff baseline is **1.14.0 / v33 / DB schema 1 / backup schema 1**.
