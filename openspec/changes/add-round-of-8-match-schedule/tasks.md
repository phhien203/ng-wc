## 1. Data model (src/app/knockout-data.ts)

- [x] 1.1 Extend `Round` type to `'R32' | 'R16' | 'QF'` and add a `TBD` placeholder team (`{ code: 'TBD', name: 'To be decided', flag: 'tbd' }`)
- [x] 1.2 Add `QF_SEED` with 4 matches (ids 25–28): schedule metadata only, Finland-time `koDate`/`koTime`/`koISO` — verify exact kickoff times against the published schedule (Yahoo/CBS, QFs Jul 9–11) before committing
- [x] 1.3 Add a pure `withQfTeams(matches: Match[]): Match[]` helper that fills each QF match's `home`/`away` from `winnerOf()` of R16 feeder matches (2j+17, 2j+18), home = winner of the first feeder, falling back to `TBD`
- [x] 1.4 Export `QUARTERFINALS` and include it in `KNOCKOUT_MATCHES` (bracket-ordered after R16); update the file header comment
- [x] 1.5 Apply `withQfTeams` to both the bundled fallback and the merged feed output in `knockout-feed.ts` so QF teams resolve from live R16 results

## 2. Live feed (src/app/espn-scoreboard.ts)

- [x] 2.1 Extend `SCOREBOARD_URL` date range from `20260628-20260708` through the last QF date (e.g. `20260628-20260712`)
- [x] 2.2 Add a `mergeScoreboard` unit test: a QF match with TBD teams is returned unchanged when events are present

## 3. UI (app + fixture list)

- [x] 3.1 Add `qfMatches` computed in `app.ts` (filter `round === 'QF'`)
- [x] 3.2 Add a "Quarterfinals" `<app-fixture-list>` section in `app.html` above Round of 16, wired to `liveIds`/`nextId`/`highlighted` like the existing sections
- [x] 3.3 Add `public/flags/tbd.svg` placeholder flag and confirm fixture rows and the next-match header render TBD teams with valid alt text

## 4. Verification

- [x] 4.1 Unit tests pass (`ng test`), including new tests for `withQfTeams` (decided, undecided, and mixed feeder states)
- [x] 4.2 Run the app: Quarterfinals section shows 4 fixtures grouped by day; countdown targets the first QF once R16 ends; no console errors
- [x] 4.3 AXE check on the fixture list with TBD fixtures visible (WCAG AA: names, alt text, contrast)
