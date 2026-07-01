import { Injectable, Signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { Match, ROUND_OF_32 } from './knockout-data';
import { EspnScoreboard, SCOREBOARD_URL, mergeScoreboard } from './espn-scoreboard';
import { poll } from './poll.operator';

/**
 * Live knockout data: polls ESPN's public scoreboard every minute via the
 * custom `poll` operator and merges scores/results into the bundled bracket.
 *
 * `poll`'s built-in `retry` keeps a failed fetch from killing the stream, so
 * the signal simply holds the last good value (initially the bundled data)
 * until the next successful poll.
 */
@Injectable({ providedIn: 'root' })
export class KnockoutFeed {
  private readonly http = inject(HttpClient);

  private readonly fetch$ = this.http
    .get<EspnScoreboard>(SCOREBOARD_URL)
    .pipe(map((scoreboard) => mergeScoreboard(ROUND_OF_32, scoreboard)));

  /**
   * Signal of matches, updated every minute.
   * `toSignal` auto-unsubscribes when the (root) injector is destroyed → no leak.
   */
  readonly matches: Signal<Match[]> = toSignal(this.fetch$.pipe(poll<Match[]>({ period: 60_000 })), {
    initialValue: ROUND_OF_32,
  });
}
