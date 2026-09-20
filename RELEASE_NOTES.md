# Puzzle Arcade 1.5.0 — Onboarding, Tutorials & Learn Mode

Phase 12 makes the 36-game catalog understandable without external instructions while keeping experienced-player friction near zero.

- Each game gets a one-time, non-blocking first-play coach.
- Learn mode provides a replayable five-step lesson for every puzzle.
- Lessons cover the objective, a strong first move, controls, strategy, and one interactive knowledge check.
- Practice checks are sandboxed: they never mutate the player’s real puzzle.
- Lesson progress resumes from the last completed step and persists locally.
- Completed lessons are tracked in the Learn library with family filters and an overall completion meter.
- First-play coaching can be disabled globally; Learn mode remains available.
- Lesson progress can be reset independently from puzzle progress/statistics.
- Phase 12 adds static and real-browser regression coverage while retaining the cumulative Phase 1–11 release matrix.

Storage schema remains **1**. Service-worker cache is **v24**.
