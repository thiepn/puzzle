# Phase 12 — Onboarding, Tutorials & Learn Mode

## Goal

Make all 36 Puzzle Arcade games understandable without external instructions while keeping experienced players out of mandatory onboarding.

## Product model

Phase 12 has two layers:

1. **First-play coach**
   - small and non-blocking
   - appears only the first time a game is opened
   - gives a strong first-move suggestion
   - offers Learn this puzzle or Skip
   - automatically counts as seen once rendered so it does not repeatedly return during normal play
   - can be disabled globally

2. **Learn mode**
   - dedicated library for all 36 games
   - always replayable
   - persists per-game progress
   - resumable after closing mid-lesson
   - independent from puzzle saves, statistics, history, favorites, and results

## Five-step lesson structure

Every game uses the same predictable lesson structure:

1. Goal — what the puzzle is asking you to achieve
2. First move — a strong way to begin
3. Controls — how to interact with that puzzle
4. Strategy — the most important trap or rule to watch
5. Practice check — one safe interactive multiple-choice scenario

The first four steps reuse the existing game rules and PLAY_GUIDES system rather than maintaining duplicate teaching content.

The fifth step uses a game-specific LEARN_CHECKS entry. All 36 games have one.

## Safety of Learn mode

Tutorials do not edit or clone the current live puzzle state.

The practice step uses:
- a static puzzle preview
- conceptual action choices
- explanation feedback

No tutorial answer calls the game mutation API.

This keeps Learn mode safe to open from:
- the Learn library
- a live game
- the game options menu

## Progress model

Learning state is stored inside the existing local settings record:

- seen[] — first-play coach or lesson has been opened
- completed[] — lesson completed successfully
- progress{} — current lesson step per game

No IndexedDB schema migration is required.

Learn library states:
- New
- Resume · step N of 5
- Learned

## First-play behavior

Default: On.

When enabled:
- the first game render shows the coach
- the game remains fully playable
- the coach is immediately marked seen in local settings
- subsequent renders/revisits do not show it again
- Skip removes it immediately
- Learn this puzzle opens the full lesson

When disabled:
- no automatic coach appears
- Learn mode remains accessible everywhere

## Learn library

Primary navigation includes Learn.

The page contains:
- overall lessons-completed meter
- All / Word / Number / Logic / Spatial filters
- one lesson card per playable game
- lesson state and resume position
- direct tutorial launch

## Game integration

The game options menu adds Learn this game.

Completing a lesson from a live game refreshes that game shell so the first-play coach disappears immediately.

## Settings

Learning & onboarding settings include:

- First-play coach: On / Off
- Open Learn mode
- Reset lesson progress

Reset lesson progress does not clear:
- puzzle saves
- history
- statistics
- favorites
- sensory preferences
- display/accessibility preferences

## Accessibility

- Learn is part of primary navigation with normal aria-current semantics
- tutorial is a modal dialog with existing focus trapping
- step progress uses progressbar semantics
- practice answers are keyboard-operable buttons
- feedback uses an aria-live status region
- correct and incorrect states use borders/shape in addition to color
- forced-colors support is preserved
- mobile layout avoids horizontal overflow

## Certification

Static checks verify:
- all 36 games exist in PLAY_GUIDES
- all 36 games exist in LEARN_CHECKS
- persistent sanitized learning state
- first-play coach
- Learn route/library
- game-menu Learn entry
- tutorial practice gate
- progress persistence
- completion persistence
- reset controls
- Phase 12 styles

Real Chromium checks verify:
- first-play coach appears
- Skip prevents recurrence
- Learn library shows all 36 lessons
- family filtering
- partial lesson resume
- wrong answer cannot finish lesson
- correct answer unlocks completion
- Learned status is persisted
- Learned status survives reload
- first-play coaching can be disabled
- mobile Learn page does not overflow

The full cumulative Phase 1–11 Chromium matrix remains required.

## Release identity

- Puzzle Arcade: 1.5.0
- Build phase: Onboarding, Tutorials & Learn Mode
- PWA cache: v24
- IndexedDB schema: 1
