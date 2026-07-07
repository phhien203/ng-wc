## Why

The Round of 16 finishes on Jul 7 and the app has no Quarterfinal (round of 8) data: the fixture list, "next match" countdown, and live merge all go dark after the last R16 match. Adding the QF match time schedule keeps the app useful through the next round.

## What Changes

- Extend the knockout data model with a `QF` round and add the 4 Quarterfinal matches (ids 25–28) with their kickoff dates/times in Finland time.
- QF pairings follow the bracket: QF j pairs the winners of consecutive R16 matches ((17,18), (19,20), (21,22), (23,24)). Teams are resolved from R16 winners at runtime; until a feeder match is decided, the slot shows a TBD placeholder.
- Render a "Quarterfinals" section in the fixture list, and let the next-match countdown and live detection cover QF matches.
- Extend the ESPN scoreboard date window (currently ends `20260708`) so QF results/live scores merge in once teams are known.

## Capabilities

### New Capabilities
- `quarterfinal-schedule`: The Quarterfinal round in the knockout data — schedule metadata, team resolution from Round of 16 winners, TBD placeholder handling, and fixture-list display.

### Modified Capabilities

<!-- none — no existing specs in openspec/specs/ -->

## Impact

- `src/app/knockout-data.ts` — `Round` type, QF seed data, team-resolution helper, `KNOCKOUT_MATCHES`.
- `src/app/espn-scoreboard.ts` — `SCOREBOARD_URL` date range.
- `src/app/app.ts` / `app.html` — `qfMatches` computed, new `<app-fixture-list>` section, countdown/live logic already round-agnostic.
- `src/app/fixture-list/*` — must render TBD teams gracefully (placeholder flag/name).
- `public/flags/` — may need a `tbd.svg` placeholder asset.
- Bracket wheel already derives its QF ring from R16 winners; no change required there.
