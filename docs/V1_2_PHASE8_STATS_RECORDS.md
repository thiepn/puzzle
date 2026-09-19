# Puzzle Arcade v1.2 — Phase 8: Stats, Records & Mastery

Phase 8 replaces the basic statistics screen with a local puzzle record book. It uses only actual history stored on the device and does not introduce XP, levels, rankings, currencies, daily goals, or progression gates.

## Goals

- make the Stats screen useful after the richer Phase 7 completion flow
- preserve the app's local-first privacy model
- surface factual personal bests and play patterns
- show category and game coverage without turning them into progression requirements
- make recent results browsable and actionable
- avoid generic SaaS analytics-dashboard styling

## Overall record

The new overview shows:
- completed puzzles
- total attempts
- unique games solved out of all 36
- arcade coverage percentage
- clean-solve rate
- number of clean solves
- total solve time
- current consecutive solve streak
- best consecutive solve streak

Failed or abandoned attempts count as attempts but not solves.

## 28-day activity

A local-day activity strip shows completed puzzles during the previous 28 days.

- intensity is based only on number of solves that day
- empty days remain visible
- no daily target or streak requirement is attached
- desktop shows 28 days
- narrow mobile layouts emphasize the most recent 14 days while the underlying 28-day data remains present

## Puzzle family record

Word, Number, Logic, and Spatial each show:
- solve count
- unique games solved in that family
- factual family coverage
- solve time
- clean solves

The four category colors remain consistent with the rest of Puzzle Arcade.

## Per-game records

Games with at least one completed result receive a record card containing:
- solve count
- clean solves
- average completion time
- fastest completion at each difficulty actually completed
- game preview
- direct link back into that game

No game is given a rating, mastery tier, or artificial score.

## Recent attempts

The former plain recent-results list is replaced with a compact play-history ledger.

Each entry shows:
- game
- category
- difficulty
- solved/ended state
- time
- hint steps
- date

Filters:
- All
- Solved
- Ended

Selecting an entry opens that game again.

## Empty state

Users without history see an explicit local-record empty state and a direct Choose a Puzzle action.

## Data rules

All statistics derive from the existing local history store.

- no new database schema
- no remote analytics
- no account
- no telemetry
- no inferred skill rating
- no fabricated rewards

## Verification

Permanent aggregation tests cover:
- completed-vs-attempt counts
- clean solves
- current and best streak
- unique solved games
- per-game fastest time by difficulty
- average hints
- category solve counts
- category game coverage
- local 28-day activity
- human-readable long duration formatting

The Chromium suite injects representative local history covering all four families and verifies:
- overview cards
- four family cards
- 28 activity days
- per-game records
- personal-best chips
- recent-history rows
- Ended filter behavior
- record-card navigation
- desktop overflow
- mobile overflow
- desktop and mobile screenshots
