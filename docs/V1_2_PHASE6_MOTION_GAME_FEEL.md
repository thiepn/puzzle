# Puzzle Arcade v1.2 — Phase 6: Motion & Game Feel

Phase 6 adds restrained, purposeful motion across Puzzle Arcade. The goal is to make actions feel responsive and game-like without turning the interface into a constantly animated product UI.

## Motion principles

- most interactions use roughly 110–320 ms
- motion confirms an action or state change; it is not decoration
- the puzzle remains readable while animation runs
- no required information is conveyed by animation alone
- animations do not delay input or block controls
- every nonessential animation and transition is disabled under `prefers-reduced-motion: reduce`

## Shared game lifecycle

Each active puzzle now has a small motion session that remembers the previous gameplay state. Animations fire only when relevant state changes, rather than every time a game rerenders.

Shared events:
- first game-screen entrance
- committed move
- selection/focus change
- newly introduced error
- hint/feedback reveal
- pause overlay
- solved puzzle
- result panel entrance

The current motion mode is exposed on the game root as `data-motion="full"` or `data-motion="reduced"` for deterministic accessibility testing.

## Tactile controls

Game controls now have consistent press depth and short hover transitions. Puzzle-board buttons get a slightly tighter press response than navigation controls.

The response is intentionally subtle so repeated numeric entry or board marking does not become tiring.

## Completion treatment

A solved puzzle receives:
- one restrained board halo
- result-panel spring entrance
- a small seven-particle burst around the result card

This is deliberately much quieter than full-screen confetti.

## Game-specific motion

### Groups
New solved categories settle into the solved stack with a short spring transition.

### Anagrams
Picking a source tile gives the tile a press response and lands the corresponding letter into its destination slot.

### Word Grid
Path cells and the trace overlay respond continuously while tracing. Newly found words enter as chips with a short confirmation motion.

### Cryptogram
A changed cipher/plaintext mapping briefly reinforces the selected symbol pair.

### Nonogram
Filled or X-marked cells receive a small mark confirmation. Completed clue lines settle smoothly.

### Sudoku / Kakuro
Digit placement and selected-cell focus get short value/focus feedback while preserving fast repeated entry.

### Spatial games
Network, Sliding Tiles, Lights Out, and Untangle use slightly springier interaction timing. Untangle also confirms reductions in crossing count and animates its progress bar.

## Toasts and hints

Toasts now have defined enter/exit lifecycles instead of simply appearing and disappearing. Hint and feedback cards enter with a short vertical reveal.

## Home discovery

The Phase 3 launcher gets only light hover elevation for category portals, Continue cards, favorites, and catalog cards. There is no large page-transition choreography.

## Reduced motion

When the OS/browser requests reduced motion:
- the game root reports `data-motion="reduced"`
- the active motion class is not attached
- all in-game animation and transition durations are removed
- home discovery transitions are removed
- solve particles are hidden
- toast animation is disabled

Gameplay, hints, feedback, pause, and completion remain fully functional without motion.

## Verification

The browser suite now explicitly tests:
- normal-motion mode
- initial motion lifecycle state
- a real Sudoku move producing a motion event
- reduced-motion media emulation
- reduced-motion opt-out
- all existing 216 route configurations
- all shared controls and hint engines
- Phase 1–5 UI and interaction coverage
