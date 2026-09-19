# Puzzle Arcade 1.2.0 — Accessibility, Controls & Device Polish

Phase 9 preserves the 36-game catalog and the Play Experience design while hardening input, semantics, focus, and device behavior.

- System-aware or explicit reduced motion and high contrast.
- Optional large non-board controls for touch use.
- Keyboard and touch controls reference available from the top bar and Settings.
- Improved screen-reader landmarks, route announcements, active navigation state, and result/pause focus.
- Stronger non-color state cues, forced-colors support, coarse-pointer targets, dynamic viewport behavior, and narrow/landscape polish.
- Fixed trace-board Enter/Space activation and the previously undefined `.sr-only` helper.
- Added dedicated accessibility/control regression checks.

Storage schema remains **1**. Service-worker cache is **v21**.
