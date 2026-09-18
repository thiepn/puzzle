# Puzzle Arcade 1.0.2

This maintenance release fixes the shared English-word validation layer and Anagrams hints.

- 132,590 accepted English words offline, including 7,278 five-letter words.
- Curated puzzle targets remain separate from player-input validation.
- Five Letters, Word Ladder, Anagrams, Letter Hive, and Word Grid now use the broad accepted-word dictionary where their mechanics permit free word entry.
- Anagrams now progresses from structural help → vowel/consonant pattern → one positional anchor → a three-letter chunk.
- Adds regression tests for TRACE, CRATE, STARE, ADIEU, LIONS, and LOVES.
- Service-worker cache bumped to v19.

See `THIRD_PARTY_NOTICES.md` for ESDB/SCOWL attribution.
