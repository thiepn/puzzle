# Puzzle Arcade v1.2 — Phase 5: Individual Game Polish

Phase 5 applies game-specific UI and interaction polish to the eight puzzle screens that still felt most utilitarian after the shared visual-system work.

## Scope

- Sudoku
- Groups
- Anagrams
- Word Grid
- Cryptogram
- Nonogram
- Kakuro
- Untangle

Puzzle rules, generators, save formats, and difficulty engines remain unchanged.

## Sudoku

- stronger given/related/selected hierarchy
- selected-cell context strip with row/column and current legal candidates
- remaining-count metadata on each digit button
- wider desktop number pad and compact mobile layout
- clearer Pencil/Value mode feedback
- refined note rendering and selected-value emphasis

## Groups

- mission strip showing current group number and remaining groups
- four-dot selection progress
- visible selection ordering
- more tactile tile depth and press states
- solved groups receive distinct completion treatments instead of identical bars
- tighter Shuffle and submission control hierarchy

## Anagrams

- explicit letter-count progress
- answer slots become real tile destinations rather than underline blanks
- selected source tiles remain legible instead of nearly disappearing
- pick-order feedback
- quieter secondary controls

## Word Grid

- live SVG path overlay through traced cells
- visible path order
- clearer current-word pill
- raised individual letter cells
- found words become compact chips
- trace overlay updates while dragging

## Cryptogram

- selected cipher/plaintext mapping becomes a focused work card
- mapping table and letter-frequency tool become one inspection area
- used plaintext keyboard keys show ownership
- mapped symbols are visually distinguished
- cipher text is more readable and less table-like

## Nonogram

- completed row/column clues visibly settle
- Fill / Mark tool state gets a clear mode label
- dense-board utility slider is visually removed
- dense layouts default to Fit mode while retaining natural pan/zoom access
- filled/marked cell states are cleaner and more deliberate

## Kakuro

- clue cells use a proper diagonal Kakuro visual treatment
- crossing runs highlight when a cell is selected
- selected cell has stronger focus
- number pad is simplified and labelled
- connected/deeper Wave 5 boards remain fully supported

## Untangle

- crossing progress meter
- percent-cleared and best-crossing status
- nodes are classified by conflict level
- high-conflict nodes are emphasized
- zero-conflict nodes are visually settled
- clean edges fade back while crossing edges dominate

## Verification

Phase 5 adds browser assertions for every new game-specific surface and keeps the existing full route, gameplay, home/discovery, persistence, hint, undo/redo, and overflow suites.

Representative screenshots are captured for all eight target games on desktop, with the existing mobile evidence retained.
