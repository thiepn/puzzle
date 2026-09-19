# Puzzle Arcade v1.2 — Phase 3: Home & Puzzle Discovery

Phase 3 turns the home screen from a flat searchable catalog into a layered puzzle launcher. All 36 games remain permanently available and the full library remains visible at the bottom.

## Goals

- make returning to an unfinished puzzle the fastest action
- make browsing by puzzle type obvious without relying on search
- expose recently played and favorite games as lightweight rotation shelves
- retain Surprise Me and direct full-library access
- stop treating all 36 games as equally important at first glance
- keep search, category filters, favorites, and unlimited play intact
- preserve local-first behavior and avoid recommendation accounts or remote services

## Home hierarchy

1. **Continue / Featured spotlight**
   - If an unfinished puzzle exists, the most recently updated puzzle becomes the primary CTA.
   - Otherwise, a deterministic rotating featured game fills the spotlight.
   - Surprise Me and Browse All remain adjacent primary discovery actions.

2. **Keep Going**
   - Additional unfinished puzzles are shown as compact progress tiles.
   - The primary active puzzle is not duplicated in this rail.

3. **Browse by Puzzle Type**
   - Word, Number, Logic, and Spatial receive large category portals.
   - Each portal includes its game count and category identity.
   - Selecting a portal filters and moves to the full library.

4. **Recently Played**
   - Active and completed games are deduplicated into a compact rotation shelf.
   - Active entries show current progress instead of a generic description.

5. **Favorites**
   - Saved games receive their own shelf when favorites exist.
   - See All Favorites jumps to the filtered complete library.

6. **Full Library**
   - All 36 games remain available.
   - Search and category filters are preserved.
   - Cards are denser and show category, in-progress state, preview, description, and direct continuation metadata.

## Visual system

The home follows the Phase 1 editorial/tactile foundation and the Phase 2 category language:
- large editorial headline
- one dominant Continue/Featured game object
- category-tinted portals and puzzle previews
- horizontal mobile shelves instead of long stacked cards
- denser complete catalog as a fallback rather than the primary experience

## No progression gating

There are no locks, levels, required completion chains, daily-only games, or recommendation gates. Category portals and shelves are navigation conveniences only.

## Verification

Run:

```sh
node scripts/test-play-experience.mjs
node scripts/release-check.mjs
python -m http.server 8080
python scripts/test-play-browser.py --base-url http://127.0.0.1:8080/
```

The browser suite verifies:
- fresh desktop launcher
- 36-game full library
- all four category portals
- Continue spotlight after progress exists
- Recent shelf after play
- search behavior
- category portal filtering
- 320px home overflow
- all existing gameplay route, hint, pause, undo/redo, persistence, and interaction checks
