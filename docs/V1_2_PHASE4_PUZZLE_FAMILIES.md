# Puzzle Arcade v1.2 — Phase 4: Puzzle Family Systems

Phase 4 gives Word, Number, Logic, and Spatial puzzles distinct visual languages while preserving one shared Puzzle Arcade shell.

## Goals

- stop different puzzle families from feeling like the same worksheet with different content
- deepen category identity beyond headings and accent colors
- keep rules, difficulty, save formats, generators, and input behavior unchanged
- preserve visual clarity on dense puzzle boards
- make each family feel appropriate to its reasoning style

## Word — tactile language desk

Word games use a subtle letterpress/paper pattern, softer rounded surfaces, berry accents, and stronger physical tile treatment.

Applied to:
- Five Letters
- Groups
- Word Ladder
- Anagrams
- Letter Hive
- Word Grid
- Theme Trail
- Word Pieces
- Mini Crossword
- Cryptogram
- Word Search

Key treatments:
- raised letter and keyboard tiles
- richer selected-word states
- ruled literary Cryptogram surface
- category-colored traces and found-word feedback
- softer rounded hint/result surfaces

## Number — precise instrument

Number games use a restrained blue technical grid, squarer geometry, tabular numerals, and compact keypad/instrument surfaces.

Applied to:
- Sudoku
- Killer Sudoku
- Kakuro
- Unequal
- Arithmetic Cages
- Make 24

Key treatments:
- subtle graph-paper stage
- tabular number rendering
- crisper board and keypad hierarchy
- stronger selected-cell focus
- more technical hint/result geometry

## Logic — constraint board

Logic games use a quiet green dot matrix, compact squared controls, notation-like surfaces, and stronger classified/solved states.

Applied to:
- Mines
- Nonogram
- Loop
- Bridges
- Light Up
- Islands
- Hitori
- Binary
- Queens
- Number Path
- Tents
- Rectangles
- Dominoes
- Towers
- Fillomino

Key treatments:
- low-noise constraint-board background
- denser tool trays
- clearer marked/solved cells
- stronger inventory and constraint feedback
- restrained squared result/hint surfaces

## Spatial — kinetic canvas

Spatial games use a softer radial/coordinate canvas, more rounded controls, stronger depth, and clearer node/edge hierarchy.

Applied to:
- Network
- Sliding Tiles
- Lights Out
- Untangle

Key treatments:
- rounded canvas staging
- pill-shaped shared action dock
- deeper movable tile surfaces
- spatial accent on network elements
- quieter clean Untangle edges and stronger crossing/node focus

## Shared family language

Each family now also has:
- a compact visual glyph in the game header
- category-aware stage pattern
- category-aware action dock geometry
- family-specific hint/feedback/result geometry

The Phase 2 game chrome remains structurally identical across families so navigation and controls do not need to be relearned.

## Verification

The browser suite checks a representative from each family at desktop size, verifies the family badge and stage pattern are actually present in computed CSS, captures visual evidence, and continues to run the existing 216-route matrix and gameplay interaction suite.

Run:

```sh
node scripts/test-play-experience.mjs
node scripts/release-check.mjs
python -m http.server 8080
python scripts/test-play-browser.py --base-url http://127.0.0.1:8080/
```
