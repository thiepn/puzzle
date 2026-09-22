# Puzzle Arcade — Maintenance Pass 3: Real-Device, PWA Install/Update & Accessibility Verification

Maintenance Pass 3 covers the part of the production baseline that browser automation cannot honestly certify: physical Android/iOS behavior.

## Status

- Automated real-device readiness contract: **PASS target**
- Physical certification status: **PENDING**
- Production runtime change: **none**
- App: **1.14.0**
- PWA cache: **v33**
- IndexedDB schema: **1**
- Backup schema: **1**

This pass must not claim physical-device certification until evidence from actual hardware has been recorded and the strict evidence validator passes.

## Why this pass exists

Playwright Chromium/Firefox/WebKit already cover most browser logic, responsive layouts, offline/service-worker behavior, backup/restore logic, keyboard navigation, and accessibility contracts. They do not prove:

- Android/iOS installation UI actually succeeds;
- a home-screen PWA survives real browser/app process eviction;
- safe areas are correct around actual cutouts and home indicators;
- a real mobile file picker can export and re-import a backup;
- TalkBack/VoiceOver expose the UI coherently;
- physical vibration occurs on supported Android hardware;
- an installed PWA actually adopts a new service worker without losing local state.

## Required hardware matrix

The minimum sign-off is:

| Target | Required mode | Screen reader | Haptics |
| --- | --- | --- | --- |
| Android phone | Chrome-installed PWA | TalkBack | Must be checked when Vibration API is available |
| iPhone | Safari Add to Home Screen PWA | VoiceOver | `unsupported` is expected; iOS Safari/PWA does not expose the Web Vibration API |

An iPad/iPadOS run is useful additional evidence but does not replace the required iPhone run.

## Test sequence

### 1. Clean install and standalone launch

For each required device:

1. Remove any old Puzzle Arcade home-screen install and site data only when a clean-install test is intended.
2. Open the production site in the platform browser.
3. Install/add Puzzle Arcade to the home screen.
4. Launch from the home-screen icon.
5. Confirm the app opens in standalone mode, starts at the normal app shell, and shows the expected build in **Settings → About this build**.
6. Confirm no browser chrome overlaps the application UI.

Pass criteria: install succeeds, the installed app launches, the 1.14.0 build is visible, and no essential controls are obscured.

### 2. Installed-app update

This check requires an installed older cached build or a deliberately staged old→new release transition.

1. Start a puzzle in the older installed build and make several moves.
2. Background/close the installed app.
3. Bring the device online and reopen the app.
4. Allow the service worker update cycle to complete.
5. Confirm the new build is shown in Settings.
6. Reopen the in-progress puzzle.
7. Confirm puzzle identity, progress, settings, favorites, and completed history survive.

For the current baseline, the intended historical transition is **1.13.0 / v32 → 1.14.0 / v33** when that older installed state is available.

Pass criteria: one coherent new release is adopted and local data is preserved. A reload loop, stale mixed assets, or lost progress is a failure.

### 3. Offline cold relaunch

1. Launch the installed app once while online and open at least one puzzle.
2. Close/evict the installed app.
3. Disable network connectivity.
4. Relaunch from the home-screen icon.
5. Navigate home, library, settings, and a previously cached puzzle.
6. Make progress, close the app, relaunch again while still offline, and confirm persistence.

Pass criteria: the cached shell launches without network, ordinary local navigation works, and progress survives the offline relaunch.

### 4. Touch, rotation, dynamic viewport and safe areas

Check both portrait and landscape.

- Home/library: bottom navigation remains reachable and is not covered by the home indicator.
- Search: the full-screen search surface remains usable when the software keyboard opens/closes.
- Modal sheets: content and close controls remain reachable.
- Game screen: top controls, board, and sticky action dock remain inside safe areas.
- Representative tap game: Sudoku or Lights Out.
- Representative drag/paint game: a trace/path or grid-painting game.
- Rapid rotate during an in-progress game, then continue play.
- Background/foreground once in each orientation.

Pass criteria: no clipped controls, inaccessible off-screen content, accidental page scrolling during game gestures, or lost game state.

## 5. Mobile backup export and restore

On both platforms:

1. Create recognizable state: at least one favorite, one active puzzle, one history entry, and a non-default setting.
2. Settings → download/export backup.
3. Confirm a JSON file is visible in the platform download/files surface.
4. Change local state so restoration is observable.
5. Settings → restore/import backup.
6. Select the JSON file through the native mobile file picker.
7. Review the validation summary and confirm restore.
8. Reopen the restored active puzzle and verify favorites/history/settings.

Pass criteria: export produces a usable JSON file, the native picker can select it, validation completes, and restore is durable after relaunch.

## 6. Screen-reader verification

### Android / TalkBack

Check:

- primary navigation labels and selected/current state;
- game cards and favorite controls;
- Settings segmented controls;
- modal title, buttons, focus containment and close behavior;
- a representative puzzle board;
- route/live-status announcements;
- completion result and next-puzzle action.

### iOS / VoiceOver

Repeat the same journey with VoiceOver gestures. Pay particular attention to rotor order, modal focus, the bottom navigation bar, puzzle-board control labels, and completion announcements.

Pass criteria: every essential action is discoverable and operable without sight, state changes are announced without excessive repetition, and no keyboard/touch-only control blocks progress.

## 7. Haptic verification

Android:

1. Keep Settings → haptics enabled.
2. Trigger a normal move/progress cue, an invalid/error cue where available, and puzzle completion.
3. Confirm vibration is noticeable but does not repeat continuously.
4. Disable haptics and confirm vibration stops.

iOS/iPadOS:

Record haptics as `unsupported` unless the browser platform begins exposing a compatible vibration API. Do not mark the iOS run failed solely because no vibration occurs.

## Evidence

Copy `docs/real-device-evidence.template.json` and replace placeholders with real device/test data.

Validate a work-in-progress record:

```bash
node scripts/validate-real-device-evidence.mjs path/to/evidence.json --allow-pending
```

Strict sign-off:

```bash
node scripts/validate-real-device-evidence.mjs path/to/evidence.json
```

Strict validation requires both Android and iOS/iPadOS coverage, all required checks completed, no failures, and only the explicitly allowed iOS haptic `unsupported` result.

## Acceptance rule

Maintenance Pass 3 is physically closed only when:

1. both required device classes have evidence;
2. strict evidence validation passes;
3. no P0/P1 defect remains from the device run;
4. any P2 defect is either fixed and re-tested or explicitly accepted as a documented known issue;
5. release notes describe only checks that were actually performed.

Until then the correct status is **REMOTE/AUTOMATED READINESS PASS — PHYSICAL CLOSURE PENDING**.
