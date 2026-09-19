# 1.1.0 — Play Experience

Shared controls and individual guides across all 36 games; undo/redo; persistent hints; pause; search and resume improvements; dictionary-compatible progress recovery; Word Ladder, Groups, Five Letters, Sudoku, Nonogram, and Cryptogram improvements. Regression and HTTP browser tests added. Runtime cache v20; storage schema remains 1.

## 1.0.2 — Expanded Lexicon & Hint Fix

- Added a broad offline ESDB/SCOWL-derived accepted-word dictionary: 132,590 filtered English words, including 7,278 five-letter words.
- Five Letters now accepts common and uncommon valid guesses such as TRACE, CRATE, STARE, ADIEU, LIONS, and LOVES while keeping answer targets curated.
- Word Ladder accepts broad-dictionary bridge words and uses the broad graph for hint routing.
- Anagrams accepts all dictionary-valid full anagrams for its tiles and now has four distinct progressive hint stages: structure, pattern, anchor, and chunk.
- Letter Hive and Word Grid now accept valid broad-dictionary words that satisfy their board rules.
- Added word-entry regression coverage and ESDB attribution.

# Changelog

## 1.0.0 — Stable

- Promoted Wave 10 RC1 to the first stable production release.
- Advanced the PWA cache generation to v17 for clean RC→stable updates.
- Preserved the certified 36-game catalog, puzzle algorithms, deterministic content, storage schema, UI, and production hardening without feature changes.
- Added stable release certification metadata and recorded physical-device/accessibility checks as manual post-ship verification.

## 1.0.0-rc.1 — 2026-09-17

### Release Candidate
- Froze the 36-game V1 catalog after Waves 1–9 correctness, content, depth, accessibility, persistence, and production-hardening work.
- Formalized the RC identity as `1.0.0-rc.1`.
- Advanced the service-worker cache to `puzzle-arcade-core-v16` for clean RC upgrade behavior.
- Added the Wave 10 release gate, browser matrix, reproducible CI, deployment workflow, and final certification records.

### Quality baseline retained
- 10,800 generator creations with zero generator errors.
- 270/270 exact-uniqueness checks passed.
- 300/300 Mines checks passed.
- 1,080 deterministic-generation checks passed.
- 36/36 browser routes previously certified at mobile, desktop, and narrow widths.
- Wave 9 content validation: 0 errors.
