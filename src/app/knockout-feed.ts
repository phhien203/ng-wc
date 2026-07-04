import { HttpClient } from '@angular/common/http';
import { Service, Signal, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';

import { EspnScoreboard, SCOREBOARD_URL, mergeScoreboard } from './espn-scoreboard';
import { KNOCKOUT_MATCHES, Match } from './knockout-data';
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

  private readonly fetch$ = this.http
    .get<EspnScoreboard>(SCOREBOARD_URL)
    .pipe(map((scoreboard) => mergeScoreboard(KNOCKOUT_MATCHES, scoreboard)));

  /**
   * Signal of matches, updated every minute.
   * `toSignal` auto-unsubscribes when the (root) injector is destroyed → no leak.
   */
  readonly matches: Signal<Match[]> = toSignal(
    this.fetch$.pipe(poll<Match[]>({ period: 60_000 })),
    {
      initialValue: KNOCKOUT_MATCHES,
    },
  );
}
