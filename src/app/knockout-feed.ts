import { Injectable, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { defer, of } from 'rxjs';
import { Match, ROUND_OF_32 } from './knockout-data';
import { poll } from './poll.operator';

/**
 * Knockout data source that refreshes ITSELF EVERY HOUR via the custom `poll` operator.
 *
 * In production, replace `defer(() => of(ROUND_OF_32))` with a cold HTTP call:
 *   private readonly http = inject(HttpClient);
 *   private readonly fetch$ = this.http.get<Match[]>('/api/round-of-32');
 * `poll` will re-issue that request every hour (cancelling the previous one if still in flight).
 */
@Injectable({ providedIn: 'root' })
export class KnockoutFeed {
  /** Simulates a cold observable that "fetches" the latest data. */
  private readonly fetch$ = defer(() => of(ROUND_OF_32));

  /**
   * Signal of matches, updated every hour.
   * `toSignal` auto-unsubscribes when the (root) injector is destroyed → no leak.
   */
  readonly matches: Signal<Match[]> = toSignal(
    this.fetch$.pipe(poll<Match[]>({ period: 60 * 60 * 1000 })),
    { initialValue: ROUND_OF_32 },
  );
}
