# Puzzle Arcade 1.13.0 — Final Production Hardening, Release Certification & Maintenance Baseline

Phase 20 completes the numbered development sequence and establishes the stable maintenance baseline.

## Local disaster recovery

Settings now includes **Download backup** and **Restore backup**.

A backup contains local Puzzle Arcade settings, favorites, active/completed puzzle sessions, and bounded result history. Restore verifies file size, JSON structure, backup/database schema, checksum, saved-game identity, current generator compatibility, and sanitized state before current local data can be replaced.

The required recovery gate tests the actual download and file-picker user flows, checksum tampering, active-record repair, reset, restore, reload durability, and both completed and in-progress puzzle recovery.

## Production integrity

The committed `release-manifest.json` identifies the stable release.

Deployment creates SHA-256 and byte-size metadata for every core production file. After GitHub Pages publishes, CI re-downloads every core file with cache busting and rejects a mixed or stale deployment if any hash or release identity differs.

## Maintenance mode

Phase 20 freezes the current product baseline:

- 36 playable games
- IndexedDB schema 1
- backup schema 1
- PWA cache v32
- no account/backend/cloud dependency
- no third-party runtime JavaScript/CSS/font/API dependency
- Chromium, Firefox, and WebKit release resilience
- bounded long-session resource behavior
- required backup/reset recovery gate
- weekly maintenance-baseline workflow
- monthly GitHub Actions dependency monitoring

Future work should default to bug fixes, compatibility, accessibility, security, content corrections, and measured performance maintenance.

Physical iOS/Android PWA installation/update, real-device screen readers, and physical haptics remain documented manual checks; this release does not claim those were independently automated.

See:

- `docs/PHASE20_FINAL_CERTIFICATION.md`
- `docs/MAINTENANCE_BASELINE.md`
- `SECURITY.md`
- `release-manifest.json`
