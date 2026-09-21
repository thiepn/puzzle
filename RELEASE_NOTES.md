# Puzzle Arcade 1.11.0 — Cross-Browser, Offline/PWA & Multi-Tab Resilience

Phase 18 hardens browser execution, offline installation, and local persistence without changing puzzle rules or the 36-game catalog.

- Required release coverage now runs in Chromium, Firefox, and WebKit.
- Two live tabs synchronize active puzzle changes in both directions.
- BroadcastChannel is the primary signal path; the storage event is a certified fallback.
- Active-puzzle writes are serialized with Web Locks where available and an expiring localStorage lease otherwise.
- A stale tab re-reads durable state before committing and refuses to overwrite any newer saved revision.
- A current tab adopts a newer remote session from storage rather than trusting message payload data.
- BFCache restoration and visibility return trigger persistence reconciliation before normal play resumes.
- Compatibility fallbacks cover structured cloning, selector escaping, board-resize observation, and puzzle seed generation.
- Service-worker updates can activate a fully installed replacement worker without requiring every old tab to close, followed by one guarded reload onto the new controller.
- Chromium CI performs a real offline service-worker reload; Firefox and WebKit certify production runtime and multi-tab behavior.
- The existing scoped, atomic core precache and narrow offline fetch policy remain intact.
- All Phase 13–17 quality, variety, generator, completion, and player-state fuzz gates remain required.

Storage schema remains **1**. Service-worker cache is **v30**.

See docs/PHASE18_CROSS_BROWSER_PWA_MULTI_TAB.md for the complete contract.
