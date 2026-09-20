# Puzzle Arcade v1.2 — Phase 1: Visual Foundation

Phase 1 changes the shared visual language without changing information architecture, puzzle rules, generators, or control placement.

## Goals

- preserve the editorial/puzzle-book identity without retaining a worksheet feel
- make the actual puzzle surface the visual focus
- remove graph-paper competition behind active puzzle boards
- replace Trebuchet-style web UI with a contemporary system sans stack
- establish coherent raised, soft, inset, and stage surfaces for light and dark themes
- reduce decorative rule/border overload while preserving meaningful puzzle boundaries
- make controls and puzzle pieces feel tactile rather than like default form controls
- push Word / Number / Logic / Spatial accent colors into active gameplay states
- create a stronger base for Phase 2 game-chrome restructuring

## Implemented

### Foundation tokens
Introduces shared surface and elevation tokens, refined paper/ink/line values, board shadows, improved radii, and an offline-safe modern system sans stack.

### Active game background
The editorial grid remains available to discovery/library surfaces. Active puzzle routes use a quiet solid paper field so grid-heavy puzzles no longer compete with a second grid behind them.

### Puzzle stage
Every game now sits on an accent-tinted raised stage with a restrained border and elevation. The stage is category-aware and works in light and dark themes.

### Controls
Buttons, selects, inputs, number pads, keyboards, toolbar actions, filters, and puzzle controls share a tactile surface system with clearer hover, press, disabled, and primary states.

### Hints and feedback
Guide, feedback, and proof-hint surfaces use category color sparingly instead of repeated horizontal rules.

### Puzzle objects
Major board families gain restrained elevation and slightly softer structural borders. Word tiles, Groups, Anagrams, Hive pieces, number controls, and selected states have stronger material hierarchy.

### Category language
Word accents now carry tracing and selected-word state; Number accents reinforce cell and keypad focus; Logic bases are quieter; Spatial styling reduces Untangle's raw debug-graph appearance.

### Results and dialogs
Results and modals are elevated surfaces rather than additional ruled sections.

## Explicitly deferred

Phase 1 does **not**:
- remove or reorganize game actions
- redesign mobile/desktop game chrome
- redesign home-page information architecture
- add puzzle-specific art direction beyond the shared foundation
- implement the full Untangle redesign
- add the motion/game-feel system

Those belong to Phases 2–6.

## Verification

Run:

```sh
node scripts/release-check.mjs
python scripts/test-play-browser.py --base-url http://127.0.0.1:8080/
```

Visual verification should inspect at minimum Groups, Sudoku, Nonogram, Cryptogram, Word Grid, Kakuro, Anagrams, and Untangle at the mobile viewport plus one desktop number/logic game.
