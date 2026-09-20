# Puzzle Arcade v1.2 — Phase 7: Completion, Results & Reward Experience

Phase 7 turns puzzle completion into a useful reflection and continuation moment. Rewards are based only on real local play history; there is no XP, currency, artificial leveling, daily gate, or progression lock.

## Goals

- make solving a puzzle feel meaningfully complete
- summarize performance without overwhelming the board
- recognize real accomplishments rather than inventing a game economy
- provide a clear next step after every result
- improve result sharing so it includes the solve, not only a puzzle link
- retain local-first privacy and unlimited access

## Earned recognition

A completion may receive up to four factual highlight badges:

- **Clean solve** — completed with zero hint steps
- **First solve** — first completed puzzle for that game
- **First Easy / Medium / Hard** — first completion at a new difficulty after the game has already been solved
- **New fastest** — faster than the previous best completion for the same game and difficulty
- **Solve streak** — three or more consecutive completed results
- **Solve milestones** — real totals at 5, 10, 25, 50, 100, 250, and 500 solves
- **Family milestones** — the same thresholds within Word, Number, Logic, or Spatial when no overall milestone fires

Failed attempts do not receive completion badges or streak credit.

## Performance record

The redesigned result card contains:

- elapsed time
- existing game-specific result metrics
- hint steps
- current solve streak
- previous fastest time when one exists
- amount improved when a new fastest solve is achieved

No synthetic score is added.

## Next move

The result surface now separates the next action from secondary actions.

Primary:
- **Next [game]** — fresh puzzle at the same difficulty

Challenge:
- **Try [next difficulty]** when another difficulty exists
- otherwise **Browse [family] games**

Secondary:
- Share result
- Replay this exact puzzle
- Back to puzzles

## Sharing

Share Result includes:

- game name
- difficulty
- completion time
- hint-step count
- link to the exact seed and difficulty

The same puzzle can therefore be replayed by another person without exposing local history or settings.

## Visual design

The result card now has:

- category-aware completion mark
- clear Solve / Puzzle ended hierarchy
- compact achievement pills
- structured performance record
- previous-best comparison
- dedicated Next Move card
- quieter secondary actions

The Phase 6 solve animation continues to work with the new panel.

## Accessibility

- result information exists as text, not animation
- badges are descriptive rather than icon-only
- the result container remains a labelled region
- motion still follows the Phase 6 reduced-motion contract
- failed and successful outcomes remain distinguishable without relying on color alone

## Verification

The permanent regression suite now tests reward calculations against synthetic history:
- clean solve
- first solve / first difficulty
- new fastest
- consecutive solve streak
- failed-attempt suppression
- real solve-count milestone
- next difficulty

The real Chromium suite also completes a generated Easy Sudoku using its persisted solution and verifies:
- completed result state
- Clean solve badge
- First solve recognition
- Try Medium action
- Share result action
- Back to puzzles action
- rendered mobile result screenshot
