# Phase 10 — Integration, Final Certification & Ship

## Purpose

Phase 10 exists because the v1.2 improvement roadmap developed Phases 1–8 on a cumulative branch while Phase 9 was shipped from the production line. The two lines diverged from the same 1.1.0 base.

This phase reconciles them into one release and certifies the integrated result before production deployment.

## Required integrated systems

The final build must contain all of the following simultaneously:

1. Visual foundation
2. Game chrome and shared play shell
3. Home and puzzle discovery
4. Puzzle-family UI systems
5. Individual game polish
6. Motion and game feel
7. Completion, results, sharing, and factual rewards
8. Local stats and records
9. Accessibility, controls, contrast, focus, and device polish

Phase 10 must not resolve conflicts by discarding one development line.

## Integration rules

- Preserve the cumulative Phase 1–8 runtime and CSS as the base.
- Layer Phase 9 accessibility/device behavior onto the existing components rather than duplicating systems.
- The explicit Motion preference controls the existing Phase 6 animation engine.
- Keep the 36-game catalog unchanged.
- Keep IndexedDB schema version 1.
- Preserve the local-first/no-account/no-telemetry model.
- Preserve the broad accepted-word dictionary and existing generator versions.
- Do not add XP, currencies, progression gates, daily lockouts, or remote runtime dependencies.

## Release identity

- App: 1.3.0
- Build phase: Integration, Final Certification & Ship
- Service-worker cache: v22
- Database schema: 1

The new release identity prevents the integrated build from colliding with the earlier incomplete 1.2.0 cache.

## Certification

Phase 10 adds a dedicated integration guard that checks that Phase 1–8 systems and Phase 9 systems coexist.

The release gate runs:

```bash
node --check app.js
node --check word-content.js
node --check sw.js
node scripts/validate-word-content.js
node scripts/test-service-worker.mjs
node scripts/test-word-entry.mjs
node scripts/test-accessibility-controls.mjs
node scripts/test-phase10-integration.mjs
node scripts/test-play-experience.mjs
node scripts/release-check.mjs
python scripts/test-play-browser.py --base-url http://127.0.0.1:8080/ --quick
```

The cumulative browser suite also retains deeper non-quick Phase 1–8 visual and interaction checks.

## Shipping gate

Production deployment is allowed only after:

- integration tests pass
- release gate passes
- Chromium interaction gate passes
- GitHub Pages deployment succeeds
- production smoke confirms app 1.3.0 and cache v22

Any failure blocks deployment rather than being marked complete manually.
