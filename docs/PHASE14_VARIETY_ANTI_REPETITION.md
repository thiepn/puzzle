# Phase 14 — Variety, Novelty & Anti-Repetition

## Goal

Phase 13 made individual puzzles trustworthy. Phase 14 makes **sequences** of puzzles trustworthy.

A generator can produce valid, well-calibrated puzzles and still feel repetitive if consecutive boards reuse the same source content, shape, theme, clue topology, route family, or near-identical complexity profile. Phase 14 adds a catalog-wide novelty layer that measures the actual generated puzzle rather than merely avoiding repeated random seeds.

## Runtime behavior

When the player requests a new puzzle:

1. Read recent same-game fingerprints from completed history plus the current board.
2. Generate a small bounded candidate set.
3. Fingerprint each candidate using game-specific content and structural signals.
4. Compare each candidate against the recent window.
5. Prefer candidates that avoid exact content reuse, repeated canonical shapes, repeated themes, and near-identical difficulty profiles.
6. Route to the selected seed.
7. Recreate the same selected puzzle normally from that seed.

Heavy solver-backed games use fewer candidates to keep generation latency bounded. If no history exists, the app does not waste work generating extra candidates.

Shared puzzle links are unchanged: an explicit shared seed still recreates its deterministic puzzle. The novelty selector only chooses seeds for locally requested **New Puzzle** actions.

## Fingerprint dimensions

| Game | Variety fingerprint |
|---|---|
| Five Letters | answer identity + letter pattern |
| Groups | category set + category-kind structure |
| Word Ladder | endpoint pair + shortest-path profile |
| Anagrams | letter multiset + ambiguity profile |
| Letter Hive | letter set + answer-length distribution |
| Word Grid | board content + answer-length distribution |
| Theme Trail | theme/word set + canonical trail partition |
| Word Pieces | compound set + chunk-length structure |
| Mini Crossword | entry content + canonical block pattern |
| Cryptogram | plaintext identity + word-pattern structure |
| Word Search | theme/target set + placement directions |
| Sudoku | solution identity + canonical given mask |
| Killer Sudoku | solution identity + canonical cage partition |
| Kakuro | run sums + canonical white-cell topology |
| Unequal | solution/givens + relation density |
| Arithmetic Cages | cage targets/operators + cage partition |
| Make 24 | number multiset + solution complexity |
| Mines | mine layout + clue-density profile |
| Nonogram | image identity + canonical pixel silhouette |
| Loop | clue pattern + canonical loop topology |
| Bridges | island graph + bridge-count profile |
| Light Up | wall/clue layout + canonical wall topology |
| Islands | island layout + canonical land/sea topology |
| Hitori | number grid + canonical solution shade pattern |
| Binary | givens/solution + canonical missing-cell mask |
| Queens | queen placement + canonical region partition |
| Number Path | checkpoint layout + canonical route family |
| Tents | tree/tent layout + canonical tent pattern |
| Rectangles | clue layout + canonical partition |
| Dominoes | number grid + domino-set arrangement |
| Towers | visibility clues + Latin-square structure |
| Fillomino | given layout + canonical region solution |
| Network | connector topology + degree/scramble profile |
| Sliding Tiles | tile permutation + distance profile |
| Lights Out | initial pattern + canonical light silhouette |
| Untangle | planar graph + crossing profile |

## Canonicalization

Where rotations/reflections do not meaningfully create a new puzzle structure, square-board patterns are reduced across all eight dihedral transforms. Region-like boards additionally normalize region labels, so the same partition with renamed region IDs is still recognized as the same shape.

This prevents the variety system from treating a simple rotation of an old board as genuinely new.

Near-duplicate semantics are family-aware. Content-dominant games such as Anagrams, Groups, and Mini Crossword treat genuinely different target content as new even when high-level length/block profiles match. Structure-dominant board games keep stricter canonical-shape matching, so a relabeled or rotated version of the same logical board still counts as a repeat.

## History

Completed attempts now store a compact `varietyFingerprint` inside result metrics. It contains hashed content/shape identifiers and normalized profile values, not answer text or external identifiers.

The recent comparison window is bounded. Existing history without Phase 14 fingerprints remains valid and is simply ignored by the novelty comparator until new results accumulate.

## Random game selection

**Surprise me** now avoids the five most recently played game IDs when alternatives exist. In the all-games view it also prefers a different puzzle family from the most recent attempt when possible.

## Automated certification

- `node scripts/test-variety-quality.mjs`
  - verifies all 36 games are represented by the Phase 14 signal registry
  - verifies fingerprinting, near-duplicate detection, bounded candidate selection, history persistence, Mines handling, and the browser audit surface
- `python scripts/test-variety-browser.py --base-url http://127.0.0.1:8080/ --steps 3`
  - runs a deterministic multi-puzzle sequence for every game
  - verifies distinct content across the sequence
  - rejects near-duplicate consecutive selections
  - requires an average novelty floor
  - reports browser/page errors

The full Phase 1–13 regression matrix remains mandatory.

## Acceptance criteria

Phase 14 passes only when:

- all 36 games have an explicit variety fingerprint strategy
- New Puzzle uses actual puzzle similarity rather than seed inequality
- recent exact content is not immediately repeated when alternatives exist
- simple board rotations/reflections do not count as structural novelty where canonicalization applies
- heavy generators stay bounded to small candidate sets
- shared deterministic links remain deterministic
- random-game selection uses a longer anti-repeat cooldown
- browser certification passes catalog-wide
- existing release, difficulty, accessibility, learning, persistence, and interaction tests remain green
