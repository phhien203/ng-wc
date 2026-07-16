import { HttpClient } from '@angular/common/http';
import { Service, Signal, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';

import { EspnScoreboard, SCOREBOARD_URL, mergeScoreboard } from './espn-scoreboard';
import {
  KNOCKOUT_MATCHES,
  Match,
  withBronzeTeams,
  withFTeams,
  withQfTeams,
  withSfTeams,
} from './knockout-data';
import { poll } from './poll.operator';

/**
 * Live knockout data: polls ESPN's public scoreboard every minute via the
 * custom `poll` operator and merges scores/results into the bundled bracket.
 *
 * `poll`'s built-in `retry` keeps a failed fetch from killing the stream, so
 * the signal simply holds the last good value (initially the bundled data)
 * until the next successful poll.
 */
@Service()
export class KnockoutFeed {
  private readonly http = inject(HttpClient);

  private readonly fetch$ = this.http.get<EspnScoreboard>(SCOREBOARD_URL).pipe(
    map((scoreboard) => {
      // Each merge brings in the previous round's winners that decide the
      // next round's pairings, then lets the now-resolved matches pick up
      // their own live scores (the merge keys on team codes, so TBD never
      // matches): R16 → QF teams → QF scores → SF teams → SF scores → F teams → F scores.
      const merged = mergeScoreboard(KNOCKOUT_MATCHES, scoreboard);
      const withQf = mergeScoreboard(withQfTeams(merged), scoreboard);
      const withSf = mergeScoreboard(withSfTeams(withQf), scoreboard);
      const withBronze = mergeScoreboard(withBronzeTeams(withSf), scoreboard);
      return mergeScoreboard(withFTeams(withBronze), scoreboard);
    }),
  );

  /**
   * Signal of matches, updated every minute.
   * `toSignal` auto-unsubscribes when the (root) injector is destroyed → no leak.
   */
  readonly matches: Signal<Match[]> = toSignal(
    this.fetch$.pipe(poll<Match[]>({ period: 60_000 })),
    {
      initialValue: withFTeams(withBronzeTeams(withSfTeams(withQfTeams(KNOCKOUT_MATCHES)))),
    },
  );
}
