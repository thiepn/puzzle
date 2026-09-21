# Phase 17 — Real Player Simulation, State Fuzzing & Interaction Sequence Reliability

## Goal

Phase 13–16 proved that Puzzle Arcade can generate good, varied, deterministic, solvable puzzles. Phase 17 asks a different question:

> What happens after a real player makes a messy sequence of actions for several minutes?

The release now treats every game as a long-lived state machine. It exercises actual rendered controls and repeatedly verifies that the active session can still be saved, reloaded, repaired, hinted, undone, redone, completed, and continued.

## Standard release simulation

The production browser gate runs a deterministic Medium session for all 36 games.

Each session includes:

- a guaranteed real-control state mutation,
- board/control clicks,
- keyboard input,
- hints,
- undo,
- redo,
- Ctrl/Cmd-style history shortcuts,
- pause → inert board → resume,
- options-menu open/close,
- validation after every sequence step,
- explicit autosave parity,
- full page reload and state-digest equality,
- persisted-state corruption,
- production repair on reload,
- recovery-notification verification,
- completion boundary rendering,
- completed-result persistence across another reload,
- Next Puzzle transition to a fresh seed.

The default release run executes **12 sequence steps per game** before the persistence and completion probes.

## Runtime invariant engine

`window.__PA_PLAYER_FUZZ__` exposes a bounded diagnostic surface:

- `validateCurrent()`
- `persistCurrent()`
- `persistedStatus()`
- `corruptPersisted()`
- `finishBoundary()`
- `summary()`
- `digest()`

### Validation rules

A current session fails Phase 17 when any of these occur:

1. the active record no longer satisfies the production save envelope;
2. state contains unbounded or non-serializable data;
3. seed/difficulty metadata becomes invalid;
4. completed result metadata no longer matches its puzzle identity;
5. the production `repairSavedActive` routine would reject the state;
6. save repair would silently alter a supposedly legal durable state;
7. the underlying Phase 16 completion witness stops being valid.

The state comparison intentionally ignores progressive proof-hint presentation metadata, because those hint panels are reconstructible UI state rather than puzzle progress.

## Persisted-state fuzzing

The browser suite writes a deliberately invalid but still serializable field into the real IndexedDB active record, removes the checkpoint shadow, reloads the exact same route, and requires the production recovery path to:

- detect the malformed field,
- repair or reset that field safely,
- retain a playable session,
- emit the existing recovery notice,
- pass the complete Phase 17 invariant check afterward.

This is not a mocked repair function. The test uses the same IndexedDB and reload path as an actual returning player.

## Completion-boundary testing

After the sequence/reload/recovery checks, every game crosses the shared completion boundary in the test environment.

The suite requires:

- a completed active record,
- coherent result identity and duration metadata,
- the real result panel to render,
- the completed record to survive reload,
- Next Puzzle to create a new unfinished seed,
- the new session to pass state validation.

Game-specific logical completion remains independently certified by Phase 16; Phase 17 certifies the lifecycle around that completion.

## Deep fuzz workflow

A separate **Player Deep Fuzz** workflow runs weekly and manually.

It shards by puzzle family and expands coverage to:

- Easy / Medium / Hard,
- 24 interaction steps per session,
- 2 deterministic cycles per game/tier.

That produces:

**36 games × 3 tiers × 2 cycles × 24 steps = 5,184 planned interaction-sequence steps**

before counting reload, corruption, completion, and next-puzzle transitions.

Each shard uploads its JSON report for diagnosis.

## Acceptance

The release gate fails on any:

- browser page error,
- uncaught interaction exception,
- state invariant failure,
- autosave mismatch,
- reload digest mismatch,
- failed corruption recovery,
- missing recovery signal,
- broken completion/result transition,
- failed completed-state reload,
- broken Next Puzzle transition,
- game that cannot produce any durable mutation through its real controls.

No game is exempt.
