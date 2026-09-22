# Puzzle Arcade 1.14.0 — QoL, Keyboard Navigation & Mobile UI Polish

This is the explicitly approved pre-maintenance QoL release. It does not add puzzle families, progression systems, accounts, cloud sync, or storage migrations.

## Faster keyboard navigation

- **Ctrl/⌘ K** or **/** opens a quick switcher for puzzles and app actions.
- **Arrow Up/Down + Enter** navigate and activate quick-switcher results.
- **G → P** opens Puzzles.
- **G → L** opens Learn.
- **G → S** opens Stats.
- **G → O** opens Settings.
- **C** resumes the newest open puzzle outside gameplay.
- **R** launches a random puzzle outside gameplay.
- **Esc** opens the current puzzle's options.
- Arrow keys move spatially between library cards, category portals, filters, recent/continue cards, and primary navigation.

Puzzle-specific keyboard controls remain unchanged and keep priority while playing.

## Mobile UI polish

The phone layout is denser and more app-like:

- icon + label bottom navigation;
- smaller top bar with redundant controls removed;
- tighter hero and continue card;
- 2×2 compact category cards;
- horizontal recent/favorite/continue rails;
- smaller two-column library cards;
- horizontal category filter chips;
- full-screen mobile quick switcher;
- bottom-sheet dialogs;
- sticky game action dock with 44px+ touch targets;
- tighter settings sections and action groups.

## Certification

1.14.0 keeps every Phase 20 release gate and adds a dedicated QoL browser gate covering desktop keyboard behavior and phone-sized UI behavior.

The maintenance baseline now starts from:

- app **1.14.0**
- PWA cache **v33**
- IndexedDB schema **1**
- backup schema **1**
- 36 playable games

See `docs/QOL_KEYBOARD_MOBILE_1_14.md` for the exact interaction contract.
