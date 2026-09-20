# Puzzle Arcade v1.2 — Phase 2: Game Chrome

Phase 2 restructures the shared gameplay shell so the puzzle itself becomes the dominant object on desktop and mobile. Puzzle rules, generators, state formats, and game-specific controls are unchanged.

## Goals

- eliminate the website/dashboard feeling around active puzzles
- move status information into a compact title bar
- keep only move-level actions next to the board
- move secondary actions into one options surface
- reduce the vertical distance between entering a game and seeing the board
- make mobile play board-first without permanently losing access to help or settings
- preserve keyboard, screen-reader labels, autosave, pause, and progressive-hint behavior

## New shared shell

### Compact game header
The header contains:
- Back
- category label
- game title
- difficulty selector
- time
- progress
- options menu

On mobile, time and progress collapse out of the visual header while remaining available in Options.

### Board action dock
The old all-purpose command bar is removed. Primary play actions are grouped next to the puzzle:
- Undo
- Redo
- Hint
- Pause / Resume

The dock becomes sticky near the bottom of narrow screens so common actions remain reachable while the player works through tall boards.

### Secondary options
The overflow menu now owns non-move actions:
- difficulty
- show / hide Guide
- Rules
- Favorite
- Pause / Resume
- New Puzzle
- compact session metadata

### Sidebar removal
The permanent desktop sidebar is removed. Time and progress no longer occupy a separate column, allowing the board stage to use the page width.

### Mobile hierarchy
Mobile uses:
1. compact title/navigation
2. optional coach/hint feedback
3. puzzle stage
4. sticky action dock
5. quiet autosave state

The objective is clamped to two short lines rather than consuming a large block before the board.

## Deliberately deferred

Phase 2 does not:
- redesign the catalog/home layout
- create separate visual systems for every game family
- overhaul individual puzzle rendering beyond the Phase 1 foundation
- add the full motion/game-feel system
- change puzzle rules or difficulty engines

Those remain later phases.

## Verification

Run:

```sh
node scripts/test-play-experience.mjs
node scripts/release-check.mjs
python -m http.server 8080
python scripts/test-play-browser.py --base-url http://127.0.0.1:8080/
```

The browser suite exercises the new options-menu Guide flow, action dock, Pause/Resume, all 216 route/difficulty/viewport combinations, hints, undo/redo, persistence, narrow-screen overflow, and existing game interactions.
