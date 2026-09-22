# Puzzle Arcade 1.14.0 — QoL, Keyboard Navigation & Mobile UI Polish

## Scope

1.14.0 is an intentionally approved pre-maintenance usability release. It changes application navigation and mobile presentation only.

It does **not** change:

- puzzle generation rules;
- difficulty calibration;
- scoring;
- result semantics;
- IndexedDB schema;
- backup schema;
- service-worker scope behavior;
- multi-tab write rules;
- the 36-game catalog.

## Keyboard navigation

### Quick switcher

Open with:

- Ctrl/⌘ K
- /

The switcher contains both app actions and puzzles.

Keyboard behavior:

- Arrow Down / Arrow Up — move selection
- Home / End — first / last result
- Enter — activate selected result
- Esc — close

When the query is empty, common app actions and recent puzzle choices are shown before the wider catalog.

### Route shortcuts

Outside gameplay:

- G, then P — Puzzles
- G, then L — Learn
- G, then S — Stats
- G, then O — Settings
- C — continue the most recently updated open puzzle
- R — random puzzle

Inside gameplay:

- Esc — open the current game's Options dialog
- existing puzzle-specific keyboard bindings remain unchanged

### Spatial library navigation

Arrow keys now move between nearby controls in:

- primary navigation;
- category filters;
- category portals;
- continue cards;
- recent/favorite cards;
- full library puzzle cards.

The movement is geometry-based rather than assuming a fixed column count, so it remains correct across responsive breakpoints.

## Mobile UI

### App shell

- fixed bottom navigation with icon + label;
- compact mobile top bar;
- compact sound mute remains in the phone top bar for instant sensory control; the redundant help control is removed from that bar because the keyboard/touch guide remains available elsewhere;
- safe-area insets retained.

### Home and library

- reduced vertical spacing;
- smaller hero typography;
- smaller continue spotlight;
- compact 2×2 category cards;
- horizontally scrollable continue/recent/favorite rails;
- smaller two-column catalog cards;
- descriptions hidden in compact catalog cards;
- horizontally scrollable category filter chips;
- full-width mobile library search.

### Search and dialogs

- quick switcher uses the full phone viewport;
- results scroll independently;
- selected result receives a strong visible state;
- dialogs become bottom sheets on phones.

### Gameplay

- desktop app top bar remains hidden during phone gameplay;
- puzzle action dock is sticky near the bottom edge;
- action buttons retain at least 44px touch height;
- autosave copy remains beneath the dock;
- game-specific board layout remains unchanged.

## Release certification

The required QoL browser test certifies:

- Ctrl/⌘ K quick switcher;
- keyboard selection + Enter activation;
- Esc → game options;
- C → latest active puzzle;
- G route chords;
- R → random puzzle;
- arrow navigation between library cards;
- arrow navigation in primary nav;
- fixed mobile bottom bar;
- visible mobile nav icons;
- compact mobile sensory mute retained while redundant top-bar help is removed;
- compact catalog/card dimensions;
- compact category cards;
- mobile quick switcher;
- bottom-sheet modal geometry;
- sticky game action dock;
- 44px+ mobile action targets.

The existing Phase 13–20 certification remains mandatory.
