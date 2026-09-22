# Puzzle Arcade — Maintenance Release Checklist

Use this checklist for every production maintenance release.

## 1. Scope

- [ ] The change has a clear bug / compatibility / accessibility / security / content / performance reason.
- [ ] Any feature-like work was explicitly approved rather than entering through maintenance by default.
- [ ] The change is as small as practical.
- [ ] No unrelated refactor is bundled into an urgent fix.

## 2. Reproduction and test

- [ ] The original issue is reproducible or otherwise supported by concrete evidence.
- [ ] A regression test was added or an existing test was strengthened.
- [ ] The focused regression test fails before the fix where practical.
- [ ] The focused regression test passes after the fix.

## 3. Storage and recovery

If persistence is touched:

- [ ] Existing active puzzle records remain compatible.
- [ ] History remains compatible and bounded.
- [ ] IndexedDB version changes are deliberate and migrated.
- [ ] Backup schema compatibility was reviewed.
- [ ] Backup import still validates before destructive replacement.
- [ ] Reset still clears all Puzzle Arcade-owned local state.
- [ ] Cross-tab reset/restore behavior still works.
- [ ] Recovery browser gate passes.

## 4. Release identity

For runtime changes:

- [ ] `APP_VERSION` updated.
- [ ] service-worker `APP_VERSION` updated.
- [ ] service-worker cache generation advanced.
- [ ] `release-manifest.json` updated.
- [ ] release checker knows the new version/cache/phase.
- [ ] deployment smoke expects the new version/cache.
- [ ] README current release updated when appropriate.
- [ ] CHANGELOG updated.
- [ ] RELEASE_NOTES updated for a user-visible release.

For docs/tooling-only changes:

- [ ] Runtime version/cache intentionally remain unchanged.

## 5. Required automated gates

- [ ] cumulative release gate
- [ ] player-fuzz shard 1
- [ ] player-fuzz shard 2
- [ ] player-fuzz shard 3
- [ ] player-fuzz shard 4
- [ ] Chromium resilience
- [ ] Firefox resilience
- [ ] WebKit resilience
- [ ] endurance gate
- [ ] recovery gate
- [ ] QoL keyboard/mobile gate

No red required gate may be bypassed by lowering expectations without evidence that the expectation itself is incorrect.

## 6. Deployment

- [ ] GitHub Pages deploy job completed.
- [ ] staged release integrity manifest was generated.
- [ ] live SHA-256 / byte-size verification passed.
- [ ] deployed app version matches expected release.
- [ ] deployed service-worker cache generation matches expected release.
- [ ] CSP and PWA manifest verification passed.

## 7. Manual device claims

If release notes claim physical-device verification:

- [ ] iPhone/iPad installed PWA checked.
- [ ] Android installed PWA checked.
- [ ] offline relaunch checked after device/browser restart.
- [ ] representative VoiceOver/TalkBack navigation checked.
- [ ] touch gestures checked.
- [ ] haptics checked where supported.
- [ ] mobile backup download/restore checked.
- [ ] rotation / safe-area behavior checked.

If these were not performed, release notes must not imply they were.

## 8. Rollback readiness

- [ ] Previous known-good merge commit is identified.
- [ ] No incompatible storage migration prevents rollback.
- [ ] If storage changed, downgrade behavior was considered.
- [ ] Rollback procedure in `docs/ROLLBACK.md` remains applicable.

## 9. Closeout

- [ ] User-visible issue is closed or linked to the release.
- [ ] Any follow-up work is filed separately instead of expanding the patch.
- [ ] The maintenance baseline remains the default project mode.
