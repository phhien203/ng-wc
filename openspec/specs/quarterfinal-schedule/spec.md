# quarterfinal-schedule Specification

## Purpose
TBD - created by syncing change add-round-of-8-match-schedule. Covers the Quarterfinal (Round of 8) match schedule: knockout data, team resolution from Round of 16 winners, fixture-list rendering, countdown/live detection, and live-score merging.

## Requirements

### Requirement: Quarterfinal matches exist in the knockout data
The knockout data SHALL include the 4 Quarterfinal matches (ids 25–28) with round `QF`, each carrying a kickoff date, time, and sortable ISO timestamp in Finland time (EEST, UTC+3), consistent with the existing `Match` shape.

#### Scenario: Quarterfinals are part of the bracket
- **WHEN** `KNOCKOUT_MATCHES` is read
- **THEN** it contains exactly 4 matches with `round === 'QF'`, ordered so QF match j pairs the winners of R16 matches (2j+17, 2j+18) — i.e. (17,18), (19,20), (21,22), (23,24)

#### Scenario: Kickoff metadata is complete
- **WHEN** any QF match is read
- **THEN** its `koDate`, `koTime`, and `koISO` are set in Finland time and `kickoffMs()` returns a valid epoch timestamp

### Requirement: Quarterfinal teams resolve from Round of 16 winners
Each Quarterfinal slot SHALL show the winner of its feeder R16 match once that match has a `winner`, and SHALL show a TBD placeholder team until then. Resolution MUST be pure and recomputed from the current match list (including live-feed updates).

#### Scenario: Feeder match decided
- **WHEN** R16 match 17 has `winner: 'home'` (Paraguay)
- **THEN** the first QF match's home team is Paraguay

#### Scenario: Feeder match undecided
- **WHEN** an R16 feeder match has no `winner`
- **THEN** the corresponding QF slot is a TBD placeholder team with a distinct code and placeholder flag, and the match renders without errors

### Requirement: Quarterfinals appear in the fixture list
The app SHALL render a "Quarterfinals" fixture-list section, grouped by day like the existing rounds, participating in highlight sync, live badges, and next-match indication.

#### Scenario: Quarterfinal section renders
- **WHEN** the app loads after the QF data is added
- **THEN** a fixture-list region titled "Quarterfinals" lists the 4 QF matches grouped by `koDate` with their `koTime`

#### Scenario: TBD fixtures are accessible
- **WHEN** a QF fixture with TBD teams renders
- **THEN** the placeholder has a non-empty accessible name (e.g. "TBD") and the image has valid alt text, passing AXE checks

### Requirement: Countdown and live detection cover Quarterfinals
The next-match countdown and live-window detection SHALL include QF matches once all earlier matches have kicked off.

#### Scenario: Next match is a Quarterfinal
- **WHEN** the current time is after the last R16 kickoff and before the first QF kickoff
- **THEN** `nextMatch` is the first QF match and the countdown reflects its kickoff time

### Requirement: Live scores merge for resolved Quarterfinals
The ESPN scoreboard integration SHALL cover the Quarterfinal dates so that, once a QF match has real teams, live scores and results merge in by team-code pair. Unresolved (TBD) matches MUST be left untouched by the merge.

#### Scenario: Scoreboard window includes QF dates
- **WHEN** the scoreboard URL is built
- **THEN** its date range extends through the last Quarterfinal date (beyond the current `20260708` end)

#### Scenario: TBD match ignored by merge
- **WHEN** the scoreboard payload contains events and a QF match still has TBD teams
- **THEN** `mergeScoreboard` returns that match unchanged
