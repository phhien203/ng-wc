## Context

The bracket data (`src/app/knockout-data.ts`) is a static seed merged with ESPN live scores every minute (`knockout-feed.ts` + `espn-scoreboard.ts`). Rounds are a closed union `'R32' | 'R16'`; the app (`app.ts`/`app.html`) filters by round into two `<app-fixture-list>` sections. The bracket wheel already draws an 8-slot QF ring derived from R16 winners, so it needs no data-model change. The `Match` interface requires concrete `home`/`away` `Team` objects, but QF pairings are unknown until the R16 winners are decided.

## Goals / Non-Goals

**Goals:**
- Add the 4 QF matches (schedule known, teams pending) to the data model and fixture list.
- Resolve QF teams from R16 winners at runtime, with a graceful TBD state.
- Keep countdown, live badges, and live-score merge working through the QF round.

**Non-Goals:**
- Semifinal/final data or wheel rings beyond what already exists.
- Predictions or any editing UI.
- Changing how the live feed polls or retries.

## Decisions

1. **Seed schedule statically, resolve teams at runtime.** A `QF_SEED` holds only schedule metadata (id 25–28, `koDate`/`koTime`/`koISO`) plus implicit feeder order; a pure helper (e.g. `withQfTeams(matches: Match[]): Match[]` or a `resolveQuarterfinals` step applied in `KnockoutFeed`/a `computed`) fills `home`/`away` from `winnerOf()` of R16 matches (2j+17, 2j+18), falling back to a `TBD` placeholder team. Alternative — hardcoding TBD teams in the seed and manually editing them later — was rejected because the live feed already knows the R16 winners and the file header promises "just set `winner`" as the only manual update.
   - Home/away orientation matches the wheel convention: winner of the first feeder match is `home`.
   - In the feed pipeline the merge runs **twice**: once to bring in the R16 winners that decide the pairings, then again after `withQfTeams` so the now-resolved QF matches pick up their own live scores (a single pass would merge against TBD keys and miss them).
2. **TBD as a real `Team` value** (`{ code: 'TBD', name: 'To be decided', flag: 'tbd' }`) rather than making `home`/`away` optional. Keeps the `Match` type and every consumer (fixture list, merge, wheel inputs) unchanged; only needs a `public/flags/tbd.svg` placeholder asset with proper alt text. Widening the type to `Team | undefined` would ripple `@if` guards through templates for little gain.
3. **Extend `Round` with `'QF'`** and add a third fixture-list section titled "Quarterfinals" above Round of 16 in `app.html` (newest round first, matching the existing order). `app.ts` gains a `qfMatches` computed; `liveIds`/`nextMatch`/`countdown` are already round-agnostic.
4. **Widen `SCOREBOARD_URL` date range** from `20260628-20260708` to `20260628-20260713` — the 4th QF kicks off 04:00 EEST on Mon Jul 13 (8pm ET Sun Jul 12), so the window must include Jul 13. The merge already keys on unordered team-code pairs and ignores unknown pairs, so TBD matches are naturally untouched — `pairKey('TBD','TBD')` will never match an ESPN event.
5. **Kickoff times** are entered per the published schedule (Yahoo/CBS, the sources cited in the file header), converted to Finland time like all existing rows. Verify the exact times at implementation; placeholders in tasks.md are marked for confirmation.

## Risks / Trade-offs

- [Wrong published kickoff times] → single source of truth in `QF_SEED`; task includes a verify step against the cited sources before commit.
- [Both feeder pair teams could theoretically produce a duplicate `pairKey` while TBD (`TBD|TBD` for all four matches)] → merge only reads the map, never writes bracket keys, so duplicates are harmless; ESPN never emits a `TBD` abbreviation.
- [Countdown shows "TBD vs TBD" as the next match between rounds] → acceptable and informative (kickoff time is real); the placeholder flag/name keeps it rendering cleanly and accessibly.
- [`Round` union growth touches `type Round`] → compile-time only; exhaustive switches don't exist for `Round` today.
