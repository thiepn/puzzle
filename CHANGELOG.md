# Changelog

## 1.0.0 — Stable

- Promoted Wave 10 RC1 to the first stable production release.
- Advanced the PWA cache generation to v17 for clean RC→stable updates.
- Preserved the certified 36-game catalog, puzzle algorithms, deterministic content, storage schema, UI, and production hardening without feature changes.
- Added stable release certification metadata and recorded physical-device/accessibility checks as manual post-ship verification.

## 1.0.0-rc.1 — 2026-09-17

### Release Candidate
- Froze the 36-game V1 catalog after Waves 1–9 correctness, content, depth, accessibility, persistence, and production-hardening work.
- Formalized the RC identity as `1.0.0-rc.1`.
- Advanced the service-worker cache to `puzzle-arcade-core-v16` for clean RC upgrade behavior.
- Added the Wave 10 release gate, browser matrix, reproducible CI, deployment workflow, and final certification records.

### Quality baseline retained
- 10,800 generator creations with zero generator errors.
- 270/270 exact-uniqueness checks passed.
- 300/300 Mines checks passed.
- 1,080 deterministic-generation checks passed.
- 36/36 browser routes previously certified at mobile, desktop, and narrow widths.
- Wave 9 content validation: 0 errors.
