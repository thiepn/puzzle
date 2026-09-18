# Puzzle Arcade 1.0.0

Puzzle Arcade 1.0.0 is the first stable production release of the offline-first 36-game puzzle collection. It freezes the V1 feature catalog after Waves 1–10 and promotes the automated-certified RC1 codebase to stable.

Highlights:
- 36/36 games playable; no placeholders.
- Deterministic shareable seeds, local autosave/statistics, favorites, and light/dark/system themes.
- Offline-capable installable PWA with no accounts, backend, analytics, ads, or required remote API.
- Reproducible content validation and release checks.
- Production hardening for malformed links, corrupted local state, CSP/security, and service-worker updates.
- Stable PWA cache generation v17.

Automated production, content, service-worker, routing, responsive, and browser smoke gates are required to pass before deployment. Physical-device install/update and manual screen-reader checks are explicitly recorded as manual post-ship verification rather than automated evidence.
