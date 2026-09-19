# Phase 9 — Accessibility, Controls & Device Polish

## Scope

This is a hardening pass over the existing Puzzle Arcade UI and all 36 playable games. It intentionally does not redesign the visual language, add games, or change puzzle generation/content.

## Accessibility

- Skip link plus a dedicated route-status live region.
- `aria-current` on the active primary route.
- Existing dialog focus trap and focus return retained.
- Puzzle board and status regions receive explicit accessible names.
- Undo/redo expose keyboard-shortcut metadata.
- Completion moves keyboard focus to the result panel once.
- Pausing moves focus to the visible Resume action; resuming returns focus to Pause.
- In-game feedback is announced once rather than once in the feedback region and again in the visual toast.
- The missing `.sr-only` utility is defined.
- Selected/path/found states gain shape or outline cues in addition to color.

## Controls

- A Keyboard & touch controls reference is available from the top bar and Settings; `?` opens it when focus is not inside an editable field.
- Existing Ctrl/Command+Z, Ctrl/Command+Shift+Z, and Ctrl/Command+Y undo/redo remain.
- Word Grid and Theme Trail now honor their documented Enter/Space keyboard activation.
- Touch tracing and painting remain limited to boards that need them.
- Mines keeps explicit Reveal/Flag modes, plus right-click and long-press alternatives.

## Device behavior

- Reduced motion can follow the OS or be forced on.
- Contrast can follow the OS or use a stronger high-contrast mode.
- Forced-colors/high-contrast media queries retain visible focus and selection.
- Large Controls increases non-board target sizes without expanding dense puzzle cells.
- Coarse pointers receive at least 44px major controls.
- Dynamic viewport units, safe-area insets, and narrow-landscape spacing reduce mobile/PWA clipping risk.

## Verification

Run:

```bash
node scripts/test-accessibility-controls.mjs
node scripts/release-check.mjs
python scripts/test-play-browser.py --base-url http://127.0.0.1:8080/
```

The release gate also retains the puzzle-content, service-worker, word-entry, and Play Experience regression tests.
