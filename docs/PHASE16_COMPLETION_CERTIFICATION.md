# Phase 16 — Solvability, Hint Correctness & Completion Certification

## Goal

Previous phases certify generated puzzle quality, short-run variety, and long-run generator reliability. Phase 16 closes a different failure class:

> A puzzle can generate reliably and still be impossible to finish, begin accidentally solved, contain a broken stored solution, or expose a hint path that has no valid completion behind it.

Phase 16 therefore certifies the complete **generation → solution witness → gameplay completion contract** across all 36 games.

## Three required checks

Every sampled game/difficulty must pass all three:

1. **Canonical completion witness**
   - A deterministic witness is derived from the generated puzzle.
   - The witness is checked against the same constraints or completion validator used by gameplay wherever possible.
   - For games without one fixed final board, an independent solver/path/constructibility check is used.

2. **Unfinished initial state**
   - The generated starting state must not already satisfy the completion rule.
   - This is a negative control against trivial or accidentally solved boards.

3. **Hint source certification**
   - Every game must expose a hint function.
   - Proof-based games run their pure proof engine against the fresh state.
   - Structured proofs are rejected if they contain invalid indices, missing explanation text, `undefined`, or `NaN`.
   - Other games certify the path/solution data their hint implementation depends on.

## Game-family coverage

### Word

- Five Letters: answer belongs to the accepted dictionary and self-evaluates as five correct tiles.
- Groups: four disjoint four-word groups cover all sixteen tiles.
- Word Ladder: an accepted dictionary path reaches the target in the certified optimal distance.
- Anagrams: at least one full-tile accepted anagram exists.
- Letter Hive: enough accepted center-containing words exist to reach the win target.
- Word Grid: enough curated targets are independently retraceable on the grid.
- Theme Trail: every stored path spells its answer, is adjacent, non-repeating, and the answer paths cover the board.
- Word Pieces: every target has a tile-disjoint piece construction.
- Mini Crossword: the stored solution is a complete entry-consistent grid.
- Cryptogram: the cipher-to-plain mapping is bijective over used symbols and decodes exactly to the stored plaintext.
- Word Search: every stored path spells its target and every target has one certified board occurrence.

### Number

- Sudoku: canonical solution satisfies Sudoku and all givens.
- Killer Sudoku: Sudoku validity plus every cage sum/no-repeat rule.
- Kakuro: every run contains unique 1–9 digits with the exact clue sum.
- Unequal: canonical Latin board satisfies every given and inequality.
- Arithmetic Cages: canonical Latin board satisfies every arithmetic cage.
- Make 24: the exact rational solver finds an expression route to 24.

### Logic

- Mines: after deterministic first-click generation, every clue is recomputed from the mine map and mine count is exact.
- Nonogram: canonical pixels regenerate all row and column clues.
- Loop: stored solution edges satisfy clue counts and form one degree-2 loop.
- Bridges: stored counts satisfy island degrees, non-crossing and global connectivity.
- Light Up: stored lamps illuminate every white cell, obey numbered walls and do not see one another.
- Islands: stored land/sea layout satisfies island sizes, single clues, connected sea and no 2×2 sea.
- Hitori: stored shading leaves unique visible numbers, no adjacent black cells and connected white cells.
- Binary: canonical board satisfies balance, no triples, line uniqueness and givens.
- Queens: canonical queen placement satisfies row, column, region and non-touching constraints.
- Number Path: stored path is a complete Hamiltonian route visiting numbered checkpoints in order.
- Tents: stored tent placement satisfies row/column counts, non-touching and perfect tree matching.
- Rectangles: stored rectangles form an exact non-overlapping cover with one matching clue each.
- Dominoes: stored pairings reconstruct the complete 0–N domino set exactly once.
- Towers: stored Latin board remains a valid exact solution under all visibility clues.
- Fillomino: stored labels form exact-size connected regions and preserve givens.

### Spatial

- Network: stored connector masks form one connected leak-free network.
- Sliding Tiles: initial board has goal-compatible permutation parity and is not already solved.
- Lights Out: the exact GF(2) solver returns a press set that clears the board.
- Untangle: the generator's canonical circular embedding is independently reconstructed and verified to have zero crossings/overlaps.

## Runtime API

`window.__PA_COMPLETION_AUDIT__`

Exports:

- `canonical(active)`
- `hintSource(active, canonical)`
- `sample(gameId, difficulty, seed)`
- `auditCatalog(samples, ids)`

The audit does not complete or persist games; it works on freshly generated in-memory active records.

## Release gate

The standard release browser gate runs:

`python scripts/test-completion-browser.py --samples 1`

This certifies:

- 36 games
- 3 difficulty tiers
- 108 generated completion contracts
- canonical solvability
- unfinished starting state
- hint-source validity
- zero browser page errors

It runs after Phase 13 difficulty, Phase 14 variety, and Phase 15 generator stress certification.

## Acceptance

Phase 16 passes only if every sampled game/difficulty has:

- a valid completion witness,
- a non-complete starting state,
- a valid hint/proof source,
- no certification exception,
- no browser page error.

No game or tier is exempt.
