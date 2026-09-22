# Puzzle Arcade — Maintenance Handoff

Puzzle Arcade entered formal maintenance mode after the certified **1.14.0** QoL release.

## Baseline being handed off

- App: **1.14.0**
- PWA cache: **v33**
- IndexedDB schema: **1**
- Backup schema: **1**
- Catalog: **36 games**
- Release channel: **stable**
- Runtime backend: **none**
- Runtime third-party JavaScript/CSS/font/API dependencies: **none**

This handoff does not change production runtime bytes. It changes how future work is accepted.

## Default maintenance scope

Work is in scope when it is primarily one of:

- reproducible bug correction;
- browser/platform compatibility;
- accessibility correction;
- security hardening;
- content-data correction;
- measured performance regression repair;
- reliability / persistence / recovery repair;
- CI/test/tooling maintenance;
- documentation that supports those activities.

Work is **not** routine maintenance when it intentionally adds a new product capability, new game system, new progression layer, account/backend/cloud system, or storage-format break.

Those changes require an explicit product-direction decision before implementation.

## Severity

### P0 — release blocker / data risk

Examples:

- saved progress is lost or overwritten;
- backup restore corrupts or destroys unrelated current data;
- production deployment is mixed/stale;
- every or most games fail to boot;
- a security defect creates meaningful user risk.

Response:

1. stop normal release work;
2. reproduce;
3. create the smallest safe correction;
4. add a regression test;
5. run the focused gate plus full required release matrix;
6. release as soon as the full matrix passes.

### P1 — major functional regression

Examples:

- one or more games cannot be completed;
- offline launch breaks;
- mobile controls become unusable;
- keyboard navigation prevents ordinary play;
- a supported browser cannot persist or resume.

Target: next patch release after full certification.

### P2 — normal defect

Examples:

- isolated UI/layout issue;
- incorrect copy or game metadata;
- non-critical keyboard/touch inconsistency;
- recoverable visual regression.

Bundle into a normal maintenance patch when practical.

### P3 — enhancement / polish

Examples:

- convenience request;
- visual refinement without a defect;
- optional workflow improvement.

Do not let P3 work silently become a feature roadmap. Accumulate, review, and only schedule deliberately.

## Required issue evidence

A maintenance issue should record, when applicable:

- exact game/screen;
- browser + version;
- device / viewport;
- installed PWA vs normal browser tab;
- online/offline state;
- reproducible steps;
- expected result;
- actual result;
- whether existing saved data was involved;
- screenshot/video only when it materially clarifies the defect.

For a persistence/storage issue, also record whether multiple tabs were open.

For a performance issue, record the measurable symptom rather than only “feels slow.”

## Fix discipline

For a production bug:

1. reproduce the issue;
2. identify the narrowest failing contract;
3. add or strengthen a regression test;
4. implement the smallest safe fix;
5. run the focused test;
6. run the entire PR matrix;
7. merge only when every required gate is green;
8. let the push deployment verify production integrity;
9. update CHANGELOG / RELEASE_NOTES when user-visible.

Do not weaken a test threshold simply to make a patch pass.

## Release types

### Documentation/tooling-only maintenance

No runtime files changed.

- app version: unchanged
- service-worker cache: unchanged
- storage schemas: unchanged

Still run the repository maintenance/static checks.

### Patch release

Use for user-visible bug/security/compatibility/accessibility fixes that do not intentionally add a new capability.

Example:

- 1.14.0 → 1.14.1
- v33 → a new cache generation because runtime bytes changed

The app version, service worker version/cache, release manifest, release notes, changelog, and production verifier must move together.

### Minor/major release

Not routine maintenance. Requires explicit scope approval before implementation.

## Storage changes

Any change touching:

- IndexedDB stores or version;
- active record shape;
- history shape;
- backup envelope or schema;
- migration behavior;
- reset/restore behavior;

must explicitly run recovery compatibility analysis.

Never silently drop old data to simplify a patch.

## Security changes

Security issues should not be publicly detailed before correction when disclosure would increase risk.

Security fixes still require regression coverage and the normal release matrix unless an immediate containment action is strictly necessary.

## Emergency patch procedure

Use only for P0/P1 production defects.

1. Branch from current production `main`.
2. Keep scope to the defect and its test.
3. Do not bundle cleanup/refactors.
4. Preserve DB/backup schema unless the defect itself requires migration.
5. Run the focused failing gate first.
6. Run the full required PR matrix.
7. Merge only green.
8. Verify production deployment integrity.
9. If deployment fails after merge, follow `docs/ROLLBACK.md`.

There is no “skip CI because urgent” path.

## Maintenance cadence

Automated:

- every PR: full release matrix;
- weekly: maintenance baseline workflow;
- weekly/manual: deep endurance;
- weekly/manual: deep player-state fuzz;
- monthly: GitHub Actions dependency review through Dependabot.

Manual, periodically and before notable public releases:

- physical iOS/iPadOS PWA install/update;
- physical Android PWA install/update;
- VoiceOver / TalkBack representative navigation;
- touch painting/dragging;
- haptics where supported;
- backup download/restore through a mobile file picker;
- rotation and safe-area checks.

## Release ownership checklist

Before merging any maintenance release, the person merging should be able to answer:

- What user-visible defect/change is this addressing?
- What regression test proves it?
- Does it alter storage or backup compatibility?
- Does it alter cache/runtime bytes?
- Are all required gates green?
- What is the rollback point?
- Is the release documentation accurate?
- Are any claims dependent on manual device testing that did not actually occur?

## Baseline rule

The certified **1.14.0** behavior is the reference point.

Future patches should make that baseline more reliable, compatible, accessible, secure, or correct—not gradually turn maintenance into an unreviewed new product roadmap.
