# Puzzle Arcade 1.1.0 — Play Experience

This release improves the existing 36 games. It does not add a new development wave, catalog entries, accounts, runtime dependencies, or paid services.

## Shared improvements across the catalog

The puzzle board is the main work area. Difficulty, Hint, Guide, and Pause are visible without opening the menu. Each game has its own opening strategy, input instructions, and common reasoning trap. Hints remain readable, can be dismissed, and no longer repeat their stage label in three separate places. Feedback survives long enough to be read. Hint steps are stored with new results.

Every game with native undo receives a bounded redo stack and Ctrl/Cmd+Z, Ctrl/Cmd+Shift+Z, and Ctrl/Cmd+Y controls. Redo preserves notes and full state snapshots and is invalidated by a new move. Guess-submission games do not receive an undo that would erase their attempt history. Redo is session-local rather than a new persistent storage format.

Pause checkpoints elapsed time, stops the clock, hides and disables the board, and prevents game mutators from editing it. Visibility changes do not silently resume a manually paused puzzle. Difficulty preferences are stored per game. Existing save schema 1 and the local-first storage system remain intact.

The library provides inline search, category counts, a Favorites filter, readable game descriptions, and prominent resume cards. Random play respects the selected category and resumes an existing puzzle rather than replacing it.

## Focused game changes

| Game | Change |
| --- | --- |
| Letter Hive | Save repair accepts valid broad-dictionary words instead of silently dropping them. |
| Word Grid | Save repair checks broad-dictionary words against a legal, non-repeating board path. |
| Word Ladder | Broad-dictionary progress survives repair; par uses the accepted dictionary; hints cannot revisit an earlier chain word. |
| Five Letters | Repeated guesses do not consume another attempt; feedback legend and persistent failed-answer display. |
| Groups | Repeated rejected sets do not add mistakes, including after restoration; three-of-four near misses receive feedback; tile shuffle preserves selection. |
| Anagrams | Visual tile shuffle preserves the current attempt; existing expanded word acceptance and progressive hints remain intact. |
| Sudoku | Matching-digit emphasis, remaining-count labels, and undo/redo that preserves pencil notes. |
| Nonogram | Right-click marking, arrow navigation, keyboard fill/mark controls, and undo/redo around the existing stroke history. |
| Cryptogram | Cipher-letter frequency inspection, without looking up plaintext; narrow-screen stacked layout. |
| Remaining games | The common workbench, individual guides, persistent hint/feedback presentation, pause, difficulty memory, results, and supported undo/redo apply without replacing their generators. |

## Verification

Run from the repository root:

```sh
node scripts/test-play-experience.mjs
node scripts/release-check.mjs
python -m pip install playwright==1.57.0
python -m playwright install --with-deps chromium
python -m http.server 8080
# In a second terminal:
python scripts/test-play-browser.py --base-url http://127.0.0.1:8080/
```

The Node regression suite covers 36 guides, 216 deterministic generation/save-repair configurations, 36 hint engines, accepted-word recovery, duplicate submissions, ladder routing, notes, undo/redo, pause guards, and saved hint/difficulty metadata.

The Chromium suite covers 216 desktop/mobile routes, guide and pause controls for all games, all 36 hint buttons, small-screen overflow, search and filtering, actual input/undo/redo flows, shortcut handling, clock freezing, navigation and reload recovery, Nonogram inputs, shuffle preservation, progressive hints, and cipher frequencies. Its reports and screenshots are uploaded as CI artifacts.

`--isolated-dom` is explicitly a rendering-only fallback with mocked storage. CI must use the default HTTP-origin mode; it exercises real browser storage and page reload. `--quick` runs the focused interaction scenarios without repeating the full route matrix.

These checks are not an exhaustive proof of every generated puzzle, a new difficulty recertification, or a substitute for physical-device and screen-reader testing. Existing solver/generator certification remains historical evidence, not a new claim made by this release.
